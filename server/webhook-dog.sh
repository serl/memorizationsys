#!/bin/sh

echo "[webhook-dog] Re-registering..."
echo "[webhook-dog] $(curl -sS "https://$HOSTNAME/telegram/register_webhook/$BOT_TOKEN" 2>&1)"
