package main

import (
	"crypto/ecdsa"
	"crypto/x509"
	"encoding/pem"
	"errors"
	"fmt"
	"log"
	"net/http"
	"os"
	"strings"
	"time"

	"github.com/facebookgo/grace/gracehttp"
	"github.com/getsentry/raven-go"
	"github.com/jmoiron/sqlx"
	_ "github.com/lib/pq"
	"github.com/pascaldekloe/jwt"
	"googlemaps.github.io/maps"
	tgbotapi "gopkg.in/telegram-bot-api.v4"
)

var (
	Hostname string

	DB *sqlx.DB

	BotAPI *tgbotapi.BotAPI
	Maps   *maps.Client

	Secrets struct {
		BotToken                 string            `json:"bot_token"`
		PostgresConnectionString string            `json:"postgres_connection_string"`
		MapsAPIKey               string            `json:"maps_api_key"`
		JWTPrivateKey            *ecdsa.PrivateKey `json:"-"`
		JWTValidity              time.Duration     `json:"-"`
	}
)

func Send(c tgbotapi.Chattable) (tgbotapi.Message, error) {
	return BotAPI.Send(c)
}

func readSecrets() error {
	var err error

	Secrets.BotToken = os.Getenv("BOT_TOKEN")
	Secrets.MapsAPIKey = os.Getenv("MAPS_API_KEY")
	Secrets.PostgresConnectionString = os.Getenv("DATABASE_URL")

	if os.Getenv("SERVE_API") != "" {
		var rawKey = strings.ReplaceAll(os.Getenv("JWT_PRIVATE_KEY"), "\\n", "\n")
		block, _ := pem.Decode([]byte(rawKey))
		if block == nil {
			return errors.New("No JWT key given")
		}
		Secrets.JWTPrivateKey, err = x509.ParseECPrivateKey(block.Bytes)
		if err != nil {
			return err
		}
		var rawValidity = os.Getenv("JWT_VALIDITY")
		if rawValidity != "" {
			Secrets.JWTValidity, err = time.ParseDuration(rawValidity)
			if err != nil {
				return err
			}
		} else {
			Secrets.JWTValidity = 15 * time.Minute
		}
	}

	if Secrets.BotToken == "" {
		return errors.New("bot_token is missing in secrets")
	}
	BotAPI, err = tgbotapi.NewBotAPI(Secrets.BotToken)
	if err != nil {
		return err
	}
	if Secrets.MapsAPIKey == "" {
		return errors.New("maps_api_key is missing in secrets")
	}
	Maps, err = maps.NewClient(maps.WithAPIKey(Secrets.MapsAPIKey))
	if err != nil {
		return err
	}
	if Secrets.PostgresConnectionString == "" {
		return errors.New("postgres_connection_string is missing in secrets")
	}
	DB, err = sqlx.Open("postgres", Secrets.PostgresConnectionString)
	if err != nil {
		return err
	}
	_, err = DB.Query("SET search_path TO srsbot")
	return err
}

func createHandler() http.Handler {
	mux := http.NewServeMux()
	mux.HandleFunc("/telegram/webhook/"+Secrets.BotToken, handleTelegramWebhook)
	mux.HandleFunc("/telegram/register_webhook/"+Secrets.BotToken, func(w http.ResponseWriter, r *http.Request) {
		_, err := BotAPI.SetWebhook(tgbotapi.NewWebhook(fmt.Sprintf("https://%s/telegram/webhook/%s", Hostname, Secrets.BotToken)))
		if err == nil {
			log.Println("Webhook set!")
			http.Error(w, http.StatusText(http.StatusOK), http.StatusOK)
		} else {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			log.Println(err)
		}
	})
	if os.Getenv("SERVE_API") != "" {
		mux.Handle("/api/", http.StripPrefix("/api/",
			&jwt.Handler{
				Target: http.HandlerFunc(apiHandler),
				Keys:   &jwt.KeyRegister{ECDSAs: []*ecdsa.PublicKey{&Secrets.JWTPrivateKey.PublicKey}},
				HeaderBinding: map[string]string{
					"sub": "X-User",
				},
			},
		))

	}
	if os.Getenv("SERVE_SITE") != "" {
		mux.Handle("/", http.FileServer(http.Dir("site")))
	}
	return mux
}

func main() {
	Hostname = os.Getenv("HOSTNAME")

	if err := readSecrets(); err != nil {
		log.Fatal(err)
	}

	httpServer := &http.Server{
		Addr:    ":" + os.Getenv("PORT"),
		Handler: raven.Recoverer(createHandler()),
	}

	go Poller()
	log.Println("Starting HTTP Server on port " + os.Getenv("PORT"))
	if err := gracehttp.Serve(httpServer); err != nil {
		log.Fatal(err)
	}
}
