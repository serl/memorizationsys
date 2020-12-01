package main

import (
	"encoding/json"
	"log"
	"net/http"
	"regexp"
	"runtime/debug"
	"strconv"
	"time"

	"github.com/getsentry/sentry-go"
	"github.com/jmoiron/sqlx"
)

var decksRoute = regexp.MustCompile(`^decks/?$`)
var deckRoute = regexp.MustCompile(`^decks/(\d+)$`)
var deckCardsRoute = regexp.MustCompile(`^decks/(\d+)/cards/?$`)
var deckCardRoute = regexp.MustCompile(`^decks/(\d+)/cards/(\d+)$`)

func apiRouter(r *http.Request, ctx *Context) apiResponse {
	if matches := decksRoute.FindStringSubmatch(r.URL.Path); matches != nil {
		data, err := ctx.u.GetDecks(ctx.tx)
		return CreateAPIResponse(http.StatusOK, data, err)
	}
	if matches := deckRoute.FindStringSubmatch(r.URL.Path); matches != nil {
		deckID, _ := strconv.Atoi(matches[1])
		data, err := ctx.u.GetDeck(ctx.tx, deckID)
		return CreateAPIResponse(http.StatusOK, data, err)
	}
	if matches := deckCardsRoute.FindStringSubmatch(r.URL.Path); matches != nil {
		deckID, _ := strconv.Atoi(matches[1])
		deck, err := ctx.u.GetDeck(ctx.tx, deckID)
		if err != nil {
			return CreateAPIError(err)
		}
		data, err := deck.GetCards(ctx.tx)
		return CreateAPIResponse(http.StatusOK, data, err)
	}
	if matches := deckCardRoute.FindStringSubmatch(r.URL.Path); matches != nil {
		deckID, _ := strconv.Atoi(matches[1])
		cardID, _ := strconv.Atoi(matches[2])
		card, err := GetCard(ctx.tx, cardID, ctx.u.ID)
		if err != nil {
			return CreateAPIError(err)
		}
		if card.DeckID != deckID {
			return errAPINotFound
		}
		if r.Method == http.MethodPost {
			var newCard Card
			json.NewDecoder(r.Body).Decode(&newCard)

			err = ctx.tx.Get(card, `UPDATE cards
				SET
					front = $2,
					back = $3,
					easiness_factor = $4,
					previous_interval = $5,
					repetition = $6,
					next_repetition = $7
				WHERE
					id = $1
				RETURNING *`,
				card.ID,
				newCard.Front,
				newCard.Back,
				newCard.EasinessFactor,
				newCard.PreviousInterval,
				newCard.Repetition,
				newCard.NextRepetition,
			)
		}
		if r.Method == http.MethodDelete {
			err = card.Delete(ctx.tx)
		}

		if err != nil {
			return CreateAPIError(err)
		}
		return CreateAPIResponse(http.StatusOK, card, nil)
	}
	return errAPIBadRequest
}

func apiHandler(w http.ResponseWriter, r *http.Request) {
	start := time.Now()
	defer log.Printf("%s\t%s\t%s", r.Method, r.RequestURI, time.Since(start))
	var reply apiResponse
	var token string

	userID, _ := strconv.Atoi(r.Header.Get("X-User"))
	err := WithUser(userID, func(u *User, tx *sqlx.Tx) error {
		ctx := &Context{
			tx: tx,
			u:  u,
		}
		reply = apiRouter(r, ctx)
		rawToken, err := u.GenerateToken()
		if err != nil {
			return err
		}
		token = string(rawToken)
		return nil
	})
	if err != nil {
		reply = CreateAPIError(err)
	}
	if reply.Error != nil && reply.Code == http.StatusInternalServerError {
		log.Println(reply.Error)
		debug.PrintStack()
		sentry.CaptureException(reply.Error)
	}
	reply.Token = token
	SendResponse(reply, w)
}
