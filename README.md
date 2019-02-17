# Memorization Bot

Spaced repetition system bot for Telegram.
Fork of [Memorization Bot](https://memorizationbot.com/).

## Quick start

Note: you'll need to have a HTTPS gateway for the Telegram API.
Exposing the HTTP server as-is to the Telegram servers will NOT work.

* Copy `.env.sample` to `.env` and follow the instructions.
* `docker-compose up`.
* You'll have your bot server listening on port 8000.
* Register the webhook to activate the bot by visiting `http://localhost:8000/telegram/register_webhook/$BOT_TOKEN`.
