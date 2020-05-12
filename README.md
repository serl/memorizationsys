# MemorizationSys

Spaced repetition system bot for Telegram `@memorizationsys_bot`.
[Fork](https://github.com/bouk/memorizationbot) of [Memorization Bot](https://memorizationbot.com/).

Things added:

* If you manage to successfully write the back of the card, it will be interpreted as 'recalled' (or if your reply does not match perfectly, 'show back').
* Always show the total number of cards in deck (even when there are no cards to review).
* APIs!
* Webapp!

## Host locally with `docker-compose`

Note: you'll need to have a HTTPS gateway for the Telegram API.
Exposing the HTTP server as-is to the Telegram servers will NOT work.

* Copy `.env.sample` to `.env` and follow the instructions.
* `docker-compose up --build`.
* You'll have your bot server listening on port 8000.
* Register the webhook to activate the bot by visiting `http://localhost:8000/telegram/register_webhook/$BOT_TOKEN`.
* Access the database with `docker-compose exec db psql -U postgres`.

## Host on Heroku

* You'll need the Heroku Postgres add-on. The free tier should be fine.
* Initialize the database: `{ cat db/db.sql; cat db/functions.sql; } | heroku pg:psql`
* Take a look at `.env.sample` and do your `heroku config:set` accordingly.
* Register the webhook to activate the bot by running `heroku run webhook-dog`. You can use the scheduler add-on to run it every morning. It will wake up the bot, so that you'll have your rehearsal, even with free dynos.

### Working with Postgres on Heroku

You can download a copy of the remote database with:

```sh
cd db
heroku pg:backups:capture
heroku pg:backups:download
```

Then import locally with:

```sh
docker-compose exec db pg_restore --verbose --clean --no-acl --no-owner -h localhost -U postgres -d postgres /docker-entrypoint-initdb.d/latest.dump
```
