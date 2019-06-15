FROM golang:1.12-alpine as gobuilder

RUN apk add --no-cache git
RUN go get \
  "golang.org/x/net/context" \
  "github.com/jmoiron/sqlx" \
  "github.com/jmoiron/sqlx/types" \
  "github.com/getsentry/raven-go" \
  "googlemaps.github.io/maps" \
  "gopkg.in/telegram-bot-api.v4" \
  "github.com/facebookgo/grace/gracehttp" \
  "github.com/lib/pq" \
  "github.com/pascaldekloe/jwt"

COPY ./server /go/
WORKDIR /go

RUN CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -ldflags '-extldflags "-static"' -o main .


FROM node:12-alpine as jsbuilder

WORKDIR /webapp

COPY ./webapp/package.json /webapp
COPY ./webapp/package-lock.json /webapp
RUN npm install

COPY ./webapp /webapp
RUN npm run build


FROM alpine

RUN apk add --no-cache curl

COPY --from=gobuilder /go/main /usr/local/bin
COPY server/webhook-dog.sh /usr/local/bin
COPY --from=jsbuilder /webapp/build /site

CMD ["main"]
