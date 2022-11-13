FROM golang:1.19-alpine as gobuilder

RUN apk add --no-cache git make

WORKDIR /app

COPY Makefile ./

COPY go.mod go.sum ./
RUN make server_deps

COPY server ./server
RUN GOOS=linux make server_build


FROM node:14-alpine as jsbuilder

RUN apk add --no-cache make

WORKDIR /app

COPY Makefile ./

COPY webapp/package.json webapp/package-lock.json ./webapp/
RUN make webapp_deps

COPY webapp ./webapp
RUN make webapp_build


FROM alpine:3 as runner

RUN apk add --no-cache curl

COPY --from=gobuilder /app/server/main /usr/local/bin
COPY --from=jsbuilder /app/webapp/build /site

CMD ["main"]
