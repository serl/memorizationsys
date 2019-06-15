package main

import (
	"github.com/jmoiron/sqlx"
	"gopkg.in/telegram-bot-api.v4"
)

type Context struct {
	u    *User
	tx   *sqlx.Tx
	data *Data
	from int64
}

func (c *Context) reply(message string, replyMarkup interface{}) (tgbotapi.Message, error) {
	msg := tgbotapi.NewMessage(c.from, message)
	if replyMarkup != nil {
		msg.ReplyMarkup = replyMarkup;
	}
	return Send(msg)
}
