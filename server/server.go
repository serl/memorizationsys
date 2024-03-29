package main

import (
	"crypto/ecdsa"
	"crypto/x509"
	"encoding/pem"
	"errors"
	"fmt"
	"io/ioutil"
	"log"
	"net/http"
	"os"
	"strings"
	"time"

	"github.com/facebookgo/grace/gracehttp"
	"github.com/getsentry/sentry-go"
	sentryhttp "github.com/getsentry/sentry-go/http"
	"github.com/jmoiron/sqlx"
	_ "github.com/joho/godotenv/autoload"
	_ "github.com/lib/pq"
	"github.com/pascaldekloe/jwt"
	"googlemaps.github.io/maps"
	tgbotapi "gopkg.in/telegram-bot-api.v4"
)

var (
	Configuration struct {
		Hostname     string
		IP           string
		Port         string
		ServeAPI     bool
		ServeSite    bool
		JWTValidity  time.Duration
		DenyNewUsers bool
	}

	DB *sqlx.DB

	BotAPI *tgbotapi.BotAPI
	Maps   *maps.Client

	Secrets struct {
		BotToken                 string
		WebhookSecret            string
		PostgresConnectionString string
		MapsAPIKey               string
		JWTPrivateKey            *ecdsa.PrivateKey
	}

	PollerConfiguration struct {
		PollEvery            time.Duration
		BatchSize            int
		InactiveSinceMinutes int
	}
)

func Send(c tgbotapi.Chattable) (tgbotapi.Message, error) {
	return BotAPI.Send(c)
}

func readSecrets() error {
	var err error

	Configuration.Hostname = os.Getenv("HOSTNAME")
	Configuration.Port = os.Getenv("PORT")
	Configuration.IP = os.Getenv("IP")
	Configuration.ServeAPI = os.Getenv("SERVE_API") != ""
	Configuration.ServeSite = os.Getenv("SERVE_SITE") != ""
	Configuration.DenyNewUsers = os.Getenv("NO_NEW_USERS") != ""
	Secrets.BotToken = os.Getenv("BOT_TOKEN")
	Secrets.MapsAPIKey = os.Getenv("MAPS_API_KEY")
	Secrets.PostgresConnectionString = os.Getenv("DATABASE_URL")

	if Configuration.Port == "" {
		Configuration.Port = "8000"
	}
	if strings.Contains(Configuration.IP, ":") {
		Configuration.IP = fmt.Sprintf("[%s]", Configuration.IP)
	}

	if os.Getenv("JWT_PRIVATE_KEY") != "" {
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
			Configuration.JWTValidity, err = time.ParseDuration(rawValidity)
			if err != nil {
				return err
			}
		} else {
			Configuration.JWTValidity = 15 * time.Minute
		}
	}

	if Secrets.BotToken == "" {
		return errors.New("bot_token is missing in secrets")
	}
	BotAPI, err = tgbotapi.NewBotAPI(Secrets.BotToken)
	if err != nil {
		return err
	}

	Secrets.WebhookSecret, err = GenerateRandomString(32)
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

	PollerConfiguration.PollEvery = 10 * time.Minute
	PollerConfiguration.BatchSize = 20
	PollerConfiguration.InactiveSinceMinutes = 30

	_, err = DB.Query("SET search_path TO srsbot")
	return err
}

func createHandler() http.Handler {
	mux := http.NewServeMux()
	mux.HandleFunc("/telegram/webhook/"+Secrets.WebhookSecret, handleTelegramWebhook)
	if Configuration.ServeAPI {
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
	if Configuration.ServeSite {
		mux.Handle("/", http.FileServer(http.Dir("site")))
	}
	return mux
}

func main() {
	err := sentry.Init(sentry.ClientOptions{
		Dsn:         os.Getenv("SENTRY_DSN"),
		Environment: os.Getenv("SENTRY_ENVIRONMENT"),
	})

	if err != nil {
		log.Printf("Sentry initialization failed: %v\n", err)
	}

	if err := readSecrets(); err != nil {
		sentry.CaptureException(err)
		log.Fatal(err)
	}

	if Configuration.ServeSite {
		staticJS := []byte("window.botUserName = '" + BotAPI.Self.UserName + "'\n")
		if err := ioutil.WriteFile("site/static.js", staticJS, 0644); err != nil {
			sentry.CaptureException(err)
			log.Fatal(err)
		}
	}

	sentryHandler := sentryhttp.New(sentryhttp.Options{
		Repanic:         false,
		WaitForDelivery: true,
	})

	httpServer := &http.Server{
		Addr:    fmt.Sprintf("%s:%s", Configuration.IP, Configuration.Port),
		Handler: sentryHandler.Handle(createHandler()),
	}

	go Poller()

	if err := registerTelegramWebhook(); err == nil {
		log.Println("Webhook set!")
	} else {
		log.Fatal(err)
	}

	log.Println("Starting HTTP Server on " + httpServer.Addr)
	if err := gracehttp.Serve(httpServer); err != nil {
		log.Fatal(err)
	}
}
