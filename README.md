# Memorization Bot

Spaced repetition system bot for Telegram.
Fork of [Memorization Bot](https://memorizationbot.com/).

## Host locally with `docker-compose`

Note: you'll need to have a HTTPS gateway for the Telegram API.
Exposing the HTTP server as-is to the Telegram servers will NOT work.

* Copy `.env.sample` to `.env` and follow the instructions.
* `docker-compose up`.
* You'll have your bot server listening on port 8000.
* Register the webhook to activate the bot by visiting `http://localhost:8000/telegram/register_webhook/$BOT_TOKEN`.

## Host on Heroku

* You'll need the Heroku Postgres add-on. The free tier should be fine.
* Initialize the database: `{ cat server/db.sql; cat server/functions.sql; } | heroku pg:psql`
* Take a look at `.env.sample` and do your `heroku config:set` accordingly.
* Register the webhook to activate the bot by running `heroku run webhook-dog`. You can use the scheduler add-on to run it every morning. It will wake up the bot, so that you'll have your rehearsal, even with free dynos.
