package main

import (
	"fmt"
	"log"
	"time"

	"github.com/getsentry/sentry-go"
	tgbotapi "gopkg.in/telegram-bot-api.v4"
)

func poll() (bool, error) {
	tx, err := DB.Beginx()
	if err != nil {
		log.Print(err)
		tx.Rollback()
		return false, err
	}

	users := []User{}
	err = tx.Select(&users, fmt.Sprintf(`UPDATE users u
SET rehearsal = u.next_rehearsal
FROM (
 SELECT id
 FROM users
 WHERE
  rehearsal <= NOW() AND
  scheduled AND
  updated_at < NOW() - INTERVAL '%d minutes'
 LIMIT %d
 FOR UPDATE SKIP LOCKED
) subset
WHERE u.id = subset.id
RETURNING u.*`, PollerConfiguration.InactiveSinceMinutes, PollerConfiguration.BatchSize))
	if err != nil {
		log.Print(err)
		tx.Rollback()
		return false, err
	}
	log.Printf("Polling for rehearsal notifications, got %d users for a batch of %d", len(users), PollerConfiguration.BatchSize)

	for _, user := range users {
		var hasCards bool
		err = tx.Get(&hasCards, `SELECT count(*) > 0
FROM cards c
INNER JOIN decks d ON c.deck_id = d.id
INNER JOIN users u ON d.user_id = u.id
WHERE
 u.id=$1 AND
 d.scheduled AND
 c.next_repetition <= u.date_in_time_zone
LIMIT 1`, user.ID)
		if err != nil {
			log.Print(err)
			tx.Rollback()
			return false, err
		}

		if hasCards {
			log.Printf("Sending rehearsal notification to %d", user.ID)
			ctx := &Context{
				tx:   tx,
				u:    &user,
				from: int64(user.ID),
			}
			Send(tgbotapi.NewMessage(ctx.from, "Time for your rehearsal!"))
			user.SetAndShowState(ctx, DeckList, nil)
		} else {
			log.Printf("User %d has no cards to rehearse", user.ID)
		}
	}
	tx.Commit()
	return len(users) > 0, nil
}

func Poller() {
	for {
		retry, err := poll()
		if err != nil {
			sentry.CaptureException(err)
		}
		if !retry {
			time.Sleep(PollerConfiguration.PollEvery)
		}
	}
}
