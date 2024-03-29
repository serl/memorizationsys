package main

import (
	"encoding/json"
	"fmt"
	"net/http"

	tgbotapi "gopkg.in/telegram-bot-api.v4"
)

func handleTelegramWebhook(w http.ResponseWriter, r *http.Request) {
	var update tgbotapi.Update
	decoder := json.NewDecoder(r.Body)
	err := decoder.Decode(&update)

	if err != nil {
		http.Error(w, "failed to decode body", http.StatusBadRequest)
		return
	}

	if update.CallbackQuery != nil {
		go HandleCallbackQuery(update.CallbackQuery)
	} else if update.ChosenInlineResult != nil {
		go HandleChosenInlineResult(update.ChosenInlineResult)
	} else if update.InlineQuery != nil {
		go HandleInlineQuery(update.InlineQuery)
	} else if update.Message != nil {
		go HandleMessage(update.Message)
	} else {
		http.Error(w, "unknown body", http.StatusBadRequest)
		return
	}
}

func registerTelegramWebhook() error {
	_, err := BotAPI.SetWebhook(tgbotapi.NewWebhook(fmt.Sprintf("https://%s/telegram/webhook/%s", Configuration.Hostname, Secrets.WebhookSecret)))
	return err
}
