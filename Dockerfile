FROM golang:1.14-alpine as gobuilder

RUN apk add --no-cache git

WORKDIR /app
COPY go.mod go.sum /app/

RUN go mod download -x && go mod verify

COPY server /app/server

RUN cd server && CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -ldflags '-extldflags "-static"' -o main .


FROM node:14-alpine as jsbuilder

WORKDIR /webapp

COPY ./webapp/package.json /webapp
COPY ./webapp/package-lock.json /webapp
RUN npm install

COPY ./webapp /webapp
RUN npm run build


FROM alpine

RUN apk add --no-cache curl

COPY --from=gobuilder /app/server/main /usr/local/bin
COPY server/webhook-dog.sh /usr/local/bin
COPY --from=jsbuilder /webapp/build /site

CMD ["main"]
