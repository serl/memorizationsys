package main

import (
	"fmt"
	"log"
	"strings"
	"time"

	"github.com/getsentry/sentry-go"
	"github.com/jmoiron/sqlx"
	"golang.org/x/net/context"
	"googlemaps.github.io/maps"
	tgbotapi "gopkg.in/telegram-bot-api.v4"
)

func HandleMessage(msg *tgbotapi.Message) {
	log.Printf("%+v", msg)

	if err := WithUser(msg.From.ID, func(u *User, tx *sqlx.Tx) error {
		var data Data
		if err := u.Data.Unmarshal(&data); err != nil {
			return err
		}
		c := &Context{
			data: &data,
			from: int64(msg.From.ID),
			tx:   tx,
			u:    u,
		}

		reply := c.reply
		noKeyboard := tgbotapi.NewRemoveKeyboard(false)
		if strings.HasPrefix(msg.Text, "/decks") {
			return u.SetAndShowState(c, DeckList, nil)
		} else if strings.HasPrefix(msg.Text, "/help") {
			return u.State.Show(c)
		} else if strings.HasPrefix(msg.Text, "/start") {
			return u.SetAndShowState(c, UserSetup, nil)
		} else if strings.HasPrefix(msg.Text, "/settings") {
			return u.SetAndShowState(c, Settings, nil)
		} else if strings.HasPrefix(msg.Text, "/token") {
			return u.SetAndShowState(c, AskForToken, nil)
		}

		switch u.State {
		case DeckList:
			if msg.Text == AddDeck {
				return u.SetAndShowState(c, DeckCreate, nil)
			} else if msg.Text == Help {
				HelpUser(int64(u.ID))
				DeckList.Show(c)
				return nil
			} else if msg.Text == EditSettings {
				return u.SetAndShowState(c, Settings, nil)
			}
			deck, err := u.GetDeckByName(tx, msg.Text)
			if err != nil {
				return err
			}
			if deck != nil {
				return u.SetAndShowState(c, DeckDetails, &Data{DeckID: deck.ID})
			} else {
				return DeckList.Show(c)
			}
		case DeckCreate:
			name := strings.TrimSpace(strings.Replace(msg.Text, "\n", " ", -1))
			if len(name) < 1 {
				reply("Please supply a name for the new deck", noKeyboard)
				return nil
			} else {
				has, err := u.HasDeckWithName(tx, name)
				if err != nil {
					return err
				}

				if has {
					reply("Name already taken", nil)
					return nil
				} else {
					deck, err := u.CreateDeck(tx, name)
					if err != nil {
						return err
					}
					reply(fmt.Sprintf("Deck '%s' has been created!", name), nil)
					return u.SetAndShowState(c, DeckDetails, &Data{DeckID: deck.ID})
				}
			}
		case Rehearsing:
			card, err := u.GetScheduledCard(tx)
			if err != nil {
				return err
			}

			if card == nil {
				return u.SetAndShowState(c, DeckList, nil)
			}

			switch msg.Text {
			case Back:
				return u.SetAndShowState(c, DeckList, nil)
			case EditCard:
				return u.SetAndShowState(c, CardEdit, &Data{CardID: card.ID})
			case ShowReverseOfCard:
				return u.SetAndShowState(c, RehearsingCardReview, nil)
			default:
				messages, err := card.GetBack()
				if err != nil {
					return err
				}
				if messages[0].Text == msg.Text {
					err = card.Respond(c, 2)
					if err != nil {
						return err
					}
				} else {
					// show back
					return u.SetAndShowState(c, RehearsingCardReview, nil)
				}
				return Rehearsing.Show(c)
			}
		case DeckDetails:
			deck, err := u.GetDeck(tx, data.DeckID)
			if err != nil {
				return err
			}
			switch msg.Text {
			case Back:
				return u.SetAndShowState(c, DeckList, nil)
			case AddCard:
				return u.SetAndShowState(c, CardCreate, &Data{DeckID: data.DeckID})
			case EditDeck:
				return u.SetAndShowState(c, DeckEdit, &data)
			case EditCard:
				card, err := deck.GetCardForReview(c)
				if err != nil {
					return err
				}
				return u.SetAndShowState(c, CardEdit, &Data{CardID: card.ID})
			case ShowReverseOfCard:
				return u.SetAndShowState(c, CardReview, &data)
			default:
				card, err := deck.GetCardForReview(c)
				if err != nil {
					// maybe no card was being reviewed, show deck
					return DeckDetails.Show(c)
				}
				messages, err := card.GetBack()
				if err != nil {
					return err
				}
				if messages[0].Text == msg.Text {
					err = card.Respond(c, 2)
					if err != nil {
						return err
					}
				} else {
					// show back
					return u.SetAndShowState(c, CardReview, &data)
				}
				return DeckDetails.Show(c)
			}
		case DeckEdit:
			deck, err := u.GetDeck(tx, data.DeckID)
			if err != nil {
				return err
			}
			switch msg.Text {
			case Back:
				return u.SetAndShowState(c, DeckDetails, &data)
			case EditName:
				return u.SetAndShowState(c, DeckNameEdit, &data)
			case DeleteDeck:
				return u.SetAndShowState(c, DeckDelete, &data)
			case EnableScheduling:
				err = deck.SetScheduled(tx, true)
				if err != nil {
					return err
				}
				return DeckEdit.Show(c)
			case DisableScheduling:
				err = deck.SetScheduled(tx, false)
				if err != nil {
					return err
				}
				return DeckEdit.Show(c)
			default:
				return DeckEdit.Show(c)
			}
		case DeckNameEdit:
			deck, err := u.GetDeck(tx, data.DeckID)
			name := strings.TrimSpace(strings.Replace(msg.Text, "\n", " ", -1))
			can, err := deck.CanSetNameTo(tx, name)
			if err != nil {
				return err
			}
			if can {
				err = deck.SetName(tx, name)
				if err != nil {
					return err
				}
				reply(fmt.Sprintf("Name changed to '%s'", name), nil)
				return u.SetAndShowState(c, DeckDetails, &data)
			} else {
				reply("Name already used", nil)
				return nil
			}
		case DeckDelete:
			deck, totalCards, _, err := u.GetDeckWithStats(tx, data.DeckID)
			if err != nil {
				return err
			}
			switch msg.Text {
			case DontDeleteDeck:
				return u.SetAndShowState(c, DeckEdit, &data)
			case ConfirmDeleteDeck:
				err := deck.Delete(tx)
				if err != nil {
					return err
				}
				reply(fmt.Sprintf("'%s' and %d cards have been deleted", deck.Name, totalCards), nil)
				return u.SetAndShowState(c, DeckList, nil)
			default:
				return DeckDelete.Show(c)
			}

		case CardCreate:
			data.Front = processMessage(msg, nil)
			return u.SetAndShowState(c, CardCreateBack, &data)
		case CardCreateBack:
			data.Back = processMessage(msg, nil)
			deck, err := u.GetDeck(tx, data.DeckID)
			if err != nil {
				return err
			}
			_, err = deck.CreateCard(tx, data.Front, data.Back)
			if err != nil {
				return err
			}
			reply("Card created", nil)
			return u.SetAndShowState(c, DeckDetails, &Data{DeckID: data.DeckID})
		case CardEdit:
			card, err := GetCard(tx, data.CardID, u.ID)
			if err != nil {
				return err
			}
			switch msg.Text {
			case Back:
				return u.SetAndShowState(c, DeckDetails, &Data{DeckID: card.DeckID})
			case DeleteCard:
				err = card.Delete(tx)
				if err != nil {
					return err
				}
				return u.SetAndShowState(c, DeckDetails, &Data{DeckID: card.DeckID})
			case EditCardFront:
				return u.SetAndShowState(c, CardEditFront, &data)
			case EditCardBack:
				return u.SetAndShowState(c, CardEditBack, &data)
			default:
				return CardEdit.Show(c)
			}
		case CardEditFront:
			card, err := GetCard(tx, data.CardID, u.ID)
			if err != nil {
				return err
			}
			if err = card.SetFront(tx, processMessage(msg, nil)); err != nil {
				return err
			}
			reply("Card updated", nil)
			return u.SetAndShowState(c, DeckDetails, &Data{DeckID: card.DeckID})
		case CardEditBack:
			card, err := GetCard(tx, data.CardID, u.ID)
			if err != nil {
				return err
			}
			if err = card.SetBack(tx, processMessage(msg, nil)); err != nil {
				return err
			}
			reply("Card updated", nil)
			return u.SetAndShowState(c, DeckDetails, &Data{DeckID: card.DeckID})
		case RehearsingCardReview:
			card, err := u.GetScheduledCard(tx)

			switch msg.Text {
			case Back:
				return u.SetAndShowState(c, DeckDetails, &Data{DeckID: card.DeckID})
			case EditCard:
				return u.SetAndShowState(c, CardEdit, &Data{CardID: card.ID})
			case Difficulty0:
				err = card.Respond(c, 0)
			case Difficulty1:
				err = card.Respond(c, 1)
			case Difficulty2:
				err = card.Respond(c, 2)
			case Difficulty3:
				err = card.Respond(c, 3)
			default:
				return RehearsingCardReview.Show(c)
			}

			if err != nil {
				return err
			}

			return u.SetAndShowState(c, Rehearsing, nil)
		case CardReview:
			deck, err := u.GetDeck(tx, data.DeckID)
			if err != nil {
				return err
			}

			card, err := deck.GetCardForReview(c)
			if err != nil {
				return err
			}

			switch msg.Text {
			case Back:
				return u.SetAndShowState(c, DeckDetails, &Data{DeckID: card.DeckID})
			case EditCard:
				return u.SetAndShowState(c, CardEdit, &Data{CardID: card.ID})
			case Difficulty0:
				err = card.Respond(c, 0)
			case Difficulty1:
				err = card.Respond(c, 1)
			case Difficulty2:
				err = card.Respond(c, 2)
			case Difficulty3:
				err = card.Respond(c, 3)
			default:
				return CardReview.Show(c)
			}

			if err != nil {
				return err
			}

			return u.SetAndShowState(c, DeckDetails, &data)
		case SetTimeZone:
			var tzId, tzName string
			var err error
			if msg.Location == nil {
				_, err := time.LoadLocation(msg.Text)
				if err != nil {
					reply(
						"Please send me your location.",
						tgbotapi.NewReplyKeyboard(
							tgbotapi.NewKeyboardButtonRow(
								tgbotapi.NewKeyboardButtonLocation("All right!"),
							),
						),
					)
					return nil
				}
			} else {
				tzId, tzName, err = getTimezone(msg.Location)
				if err != nil {
					return err
				}
			}
			err = u.SetTimeZone(tx, tzId)
			if err != nil {
				return err
			}
			reply(fmt.Sprintf("Got it! You're in the '%s' time zone.", tzName), nil)
			return u.SetAndShowState(c, DeckList, nil)

		case Settings:
			if strings.HasPrefix(msg.Text, ChangeLocation) {
				return u.SetAndShowState(c, SetTimeZone, nil)
			} else if strings.HasPrefix(msg.Text, ChangeTimeToRehearse) {
				return u.SetAndShowState(c, SetRehearsalTime, nil)
			} else if msg.Text == EnableScheduling {
				reply("Automatic rehearsing enabled", nil)
				if err := u.SetScheduled(tx, true); err != nil {
					return err
				}
				return Settings.Show(c)
			} else if msg.Text == DisableScheduling {
				reply("Automatic rehearsing disabled", nil)
				if err := u.SetScheduled(tx, false); err != nil {
					return err
				}
				return Settings.Show(c)
			} else {
				return u.SetAndShowState(c, DeckList, nil)
			}
		case UserSetup:
			if msg.Location == nil {
				reply(
					"Please send me your location.",
					tgbotapi.NewReplyKeyboard(
						tgbotapi.NewKeyboardButtonRow(
							tgbotapi.NewKeyboardButtonLocation("All right!"),
						),
					),
				)
				return nil
			} else {
				tzId, tzName, err := getTimezone(msg.Location)
				if err != nil {
					return err
				}
				err = u.SetTimeZone(tx, tzId)
				if err != nil {
					return err
				}
				reply(fmt.Sprintf("Got it! You're in the '%s' time zone.", tzName), nil)
				err = u.SetScheduled(tx, true)
				if err != nil {
					return err
				}
				reply("Every day at noon you will get sent your flash cards if there's any that need rehearsing. You can change the time of rehearsal in your /settings.", nil)
				return u.SetAndShowState(c, DeckList, nil)
			}
		case SetRehearsalTime:
			t, err := time.Parse("15:04", msg.Text)
			if err == nil {
				err = u.SetRehearsalTime(tx, t)
				if err != nil {
					return err
				}
				reply(fmt.Sprintf("Rehearsal time changed to '%s'", t.Format(TimeFormat)), nil)
			} else {
				reply("I don't understand what you mean, please try again.", nil)
			}
			return u.SetAndShowState(c, Settings, nil)
		case AskForToken:
			return u.SetAndShowState(c, DeckList, nil)
		default:
			reply("You're in a weird state", noKeyboard)
			return nil
		}
	}); err != nil {
		sentry.CaptureException(err)
		Send(tgbotapi.NewMessage(msg.Chat.ID, err.Error()))
	}
}

func getTimezone(loc *tgbotapi.Location) (string, string, error) {
	resp, err := Maps.Timezone(context.TODO(), &maps.TimezoneRequest{
		Location: &maps.LatLng{
			Lat: loc.Latitude,
			Lng: loc.Longitude,
		},
		Timestamp: time.Now(),
		Language:  "en",
	})
	if err != nil {
		return "", "", err
	}
	return resp.TimeZoneID, resp.TimeZoneName, nil
}

func HandleChosenInlineResult(chosenInlineResult *tgbotapi.ChosenInlineResult) {}
func HandleInlineQuery(inlineQuery *tgbotapi.InlineQuery)                      {}
