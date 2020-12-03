package main

import (
	"fmt"
	"time"

	tgbotapi "gopkg.in/telegram-bot-api.v4"
)

type Data struct {
	DeckID   int       `json:"d,omitempy"`
	CardID   int       `json:"c,omitempy"`
	Messages []Message `json:"m,omitempy"`
	Front    []Message `json:"f,omitempy"`
	Back     []Message `json:"b,omitempy"`
}

type State uint

const (
	// Main screen that shows a list of decks you can select. You can create decks too.
	// Also has settings and donate buttons or something.
	DeckList = State(iota)

	// Create a new deck. Simply takes in a reply for the deck name
	DeckCreate

	// Allows you to type in a query or just list all the cards. Transitions into DeckDetails
	// Transitions back into CardReview or DeckList
	CardSearch

	// Allows searching through the cards. Goes into CardDetails
	// Goes back into CardSearch
	DeckDetails

	// Automatically transitions into another CardCreate
	// A card has two sides, so first take in messages for the front, press 'edit back', send messages for back, and press 'save'
	// You return into CardReview
	CardCreate

	// Same as CardCreate but the backside
	CardCreateBack

	// Confirm the card deletion. After deletion, go to next and review
	CardDelete

	// Shows some stats about a specific card and allows deleting and editing the card.
	// Button for editing front, button for editing back.
	// Goes back into CardReview or DeckDetails
	CardDetails

	// Show the back of the card
	// Buttons:
	// Go back to deck list
	// Add card
	// Edit card
	// Search cards
	CardReview

	// Is editing either the front or the back. Goes back into CardDetails
	CardUpdate

	DeckEdit
	CardEdit
	DeckDelete
	DeckNameEdit
	CardEditFront
	CardEditBack
	SetTimeZone
	Settings

	// Show help and send location
	UserSetup

	SetRehearsalTime

	AskForWebApp

	stateCount
)

func (s State) Show(c *Context) error {
	u := c.u
	tx := c.tx
	reply := c.reply
	noKeyboard := tgbotapi.NewRemoveKeyboard(false)
	data := c.data

	switch s {
	case DeckList:
		decks, err := u.GetDecks(tx)
		if err != nil {
			return err
		}

		keyboard := tgbotapi.NewReplyKeyboard(
			tgbotapi.NewKeyboardButtonRow(
				tgbotapi.NewKeyboardButton(Help),
				tgbotapi.NewKeyboardButton(EditSettings),
				tgbotapi.NewKeyboardButton(AddDeck),
			),
		)

		if len(decks) == 0 {
			reply(
				fmt.Sprintf("You're now ready to create your first deck, so press '%s' to get started.", AddDeck),
				keyboard,
			)
		} else {
			for _, deck := range decks {
				deckLabel := deck.Name
				if deck.CardsLeft > 0 {
					deckLabel = fmt.Sprintf("%s [%d]", deck.Name, deck.CardsLeft)
				}
				keyboard.Keyboard = append(keyboard.Keyboard, tgbotapi.NewKeyboardButtonRow(
					tgbotapi.NewKeyboardButton(deckLabel),
				))
			}
			reply("Select the deck you want to work on.", keyboard)
		}
	case DeckDetails:
		deck, totalCards, cardsLeft, err := u.GetDeckWithStats(tx, data.DeckID)
		if err != nil {
			return err
		}
		keyboard := tgbotapi.NewReplyKeyboard(
			tgbotapi.NewKeyboardButtonRow(
				tgbotapi.NewKeyboardButton(Back),
				tgbotapi.NewKeyboardButton(EditDeck),
				tgbotapi.NewKeyboardButton(AddCard),
			),
		)

		if totalCards == 0 {
			reply(
				fmt.Sprintf("You currently have no cards, so press '%s' to create one.", AddCard),
				keyboard,
			)
			return nil
		} else {
			reply(fmt.Sprintf("%d/%d cards left to rehearse in '%s'", cardsLeft, totalCards, deck.Name), keyboard)
			if cardsLeft == 0 {
				return nil
			}

			card, err := deck.GetCardForReview(c)
			if err != nil {
				return err
			}

			keyboard.Keyboard = append(keyboard.Keyboard,
				tgbotapi.NewKeyboardButtonRow(
					tgbotapi.NewKeyboardButton(EditCard),
					tgbotapi.NewKeyboardButton(SkipCard),
					tgbotapi.NewKeyboardButton(ShowReverseOfCard),
				),
			)

			card.SendFront(u.ID, keyboard)
			return nil
		}
	case CardCreate:
		reply("Please send a message to use for the front.", noKeyboard)
	case CardCreateBack:
		reply("Please send a message to use for the back.", noKeyboard)
	case CardEdit:
		reply(
			"What would you like to do?",
			tgbotapi.NewReplyKeyboard(
				tgbotapi.NewKeyboardButtonRow(
					tgbotapi.NewKeyboardButton(Back),
					tgbotapi.NewKeyboardButton(DeleteCard),
				),
				tgbotapi.NewKeyboardButtonRow(
					tgbotapi.NewKeyboardButton(EditCardFront),
					tgbotapi.NewKeyboardButton(EditCardBack),
				),
			),
		)
	case CardEditFront:
		card, err := GetCard(tx, data.CardID, u.ID)
		if err != nil {
			return err
		}
		reply("I'm now going to send you the front, please send me back what you want to replace it with.", noKeyboard)
		return card.SendFront(u.ID, nil)
	case CardEditBack:
		card, err := GetCard(tx, data.CardID, u.ID)
		if err != nil {
			return err
		}
		reply("I'm now going to send you the back, please send me back what you want to replace it with.", noKeyboard)
		return card.SendBack(u.ID, nil)
	case DeckCreate:
		reply("What's the name of the new deck?", noKeyboard)
	case CardReview:
		deck, err := u.GetDeck(tx, data.DeckID)
		if err != nil {
			return err
		}
		card, err := deck.GetCardForReview(c)
		if err != nil {
			return err
		}
		card.SendBack(int(c.from), CardReplyKeyboard)
		return nil
	case SetTimeZone:
		reply(
			"Please send me your location, so I can determine your time zone! 🌍",
			tgbotapi.NewReplyKeyboard(
				tgbotapi.NewKeyboardButtonRow(
					tgbotapi.NewKeyboardButtonLocation("Send location"),
				),
			),
		)
		return nil
	case DeckDelete:
		_, totalCards, _, err := u.GetDeckWithStats(tx, data.DeckID)
		if err != nil {
			return err
		}
		reply(
			fmt.Sprintf("Are you sure? You will also delete %d cards.", totalCards),
			tgbotapi.NewReplyKeyboard(
				tgbotapi.NewKeyboardButtonRow(
					tgbotapi.NewKeyboardButton(DontDeleteDeck),
				),
				tgbotapi.NewKeyboardButtonRow(
					tgbotapi.NewKeyboardButton(ConfirmDeleteDeck),
				),
			),
		)
		return nil
	case DeckEdit:
		deck, err := u.GetDeck(tx, data.DeckID)
		if err != nil {
			return err
		}
		reply(
			fmt.Sprintf("What do you want to do with '%s'?", deck.Name),
			tgbotapi.NewReplyKeyboard(
				tgbotapi.NewKeyboardButtonRow(
					tgbotapi.NewKeyboardButton(Back),
					tgbotapi.NewKeyboardButton(DeleteDeck),
				),
				tgbotapi.NewKeyboardButtonRow(
					tgbotapi.NewKeyboardButton(stringTernary(deck.Scheduled, DisableScheduling, EnableScheduling)),
					tgbotapi.NewKeyboardButton(EditName),
				),
			),
		)
		return nil
	case DeckNameEdit:
		deck, err := u.GetDeck(tx, data.DeckID)
		if err != nil {
			return err
		}
		reply(fmt.Sprintf("Please type in the new name for '%s'", deck.Name), noKeyboard)
		return nil
	case Settings:
		reply(
			"What setting do you want to change?",
			tgbotapi.NewReplyKeyboard(
				tgbotapi.NewKeyboardButtonRow(
					tgbotapi.NewKeyboardButton(Back),
				),
				tgbotapi.NewKeyboardButtonRow(
					tgbotapi.NewKeyboardButton(fmt.Sprintf(ChangeLocationFormat, u.TimeZone)),
				),
				tgbotapi.NewKeyboardButtonRow(
					tgbotapi.NewKeyboardButton(fmt.Sprintf(ChangeTimeToRehearseFormat, u.RehearsalTime.Format(TimeFormat))),
				),
				tgbotapi.NewKeyboardButtonRow(
					tgbotapi.NewKeyboardButton(stringTernary(u.Scheduled, DisableScheduling, EnableScheduling)),
				),
			),
		)
		return nil
	case UserSetup:
		reply("Hi there!", nil)
		time.Sleep(time.Second)
		HelpUser(int64(u.ID))
		reply(
			"Now, to get started please send me your location, so I can determine your time zone! 🌍",
			tgbotapi.NewReplyKeyboard(
				tgbotapi.NewKeyboardButtonRow(
					tgbotapi.NewKeyboardButtonLocation("Send location"),
				),
			),
		)
	case SetRehearsalTime:
		keyboard := tgbotapi.NewReplyKeyboard()
		for i := 0; i < 18; i++ {
			keyboard.Keyboard = append(keyboard.Keyboard, tgbotapi.NewKeyboardButtonRow(
				tgbotapi.NewKeyboardButton(time.Date(2000, time.January, 1, 5+i, 0, 0, 0, time.UTC).Format(TimeFormat)),
			))
		}
		reply(
			"Please select your preferred time of day to rehearse. You can also type out the time yourself.",
			keyboard,
		)
	case AskForWebApp:
		token, err := u.GenerateToken()
		if err != nil {
			return err
		}
		replyMessage := "Token generation disabled"
		if token != nil {
			replyMessage = "https://" + Configuration.Hostname + "/#[" + string(token) + "]"
		}
		reply(replyMessage, nil)
		return u.SetAndShowState(c, DeckList, nil)
	}
	return nil
}

func stringTernary(x bool, a string, b string) string {
	if x {
		return a
	} else {
		return b
	}
}
