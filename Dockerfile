FROM golang:1.12-alpine as builder

RUN apk add --no-cache git
RUN go get \
  "golang.org/x/net/context" \
  "github.com/jmoiron/sqlx" \
  "github.com/jmoiron/sqlx/types" \
  "github.com/getsentry/raven-go" \
  "googlemaps.github.io/maps" \
  "gopkg.in/telegram-bot-api.v4" \
  "github.com/facebookgo/grace/gracehttp" \
  "github.com/lib/pq"

COPY . /go/
WORKDIR /go

RUN CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -ldflags '-extldflags "-static"' -o main .


FROM alpine

RUN apk add --no-cache curl

COPY --from=builder /go/main /usr/local/bin
COPY webhook-dog.sh /usr/local/bin
COPY site /site

CMD ["main"]
