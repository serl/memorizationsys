build: server_build webapp_build

server_build:
	cd server && \
	CGO_ENABLED=0 go build -a -installsuffix cgo -ldflags '-extldflags "-static"' -o main .

webapp_build:
	cd webapp && \
	npm run build

deps: server_deps webapp_deps

server_deps:
	go mod download -x && go mod verify

webapp_deps:
	cd webapp && \
	npm install

clean: server_clean webapp_clean

server_clean:
	rm server/main

webapp_clean:
	rm -r webapp/build

run: webapp_build server_run

server_run: server_build
	server/main
