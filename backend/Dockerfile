FROM golang:1.23.8-alpine3.20
WORKDIR /usr/src/app
COPY go.mod go.sum ./
RUN go mod download
RUN go install -tags 'postgres' github.com/golang-migrate/migrate/v4/cmd/migrate@latest
RUN ln -s /go/bin/linux_amd64/migrate /usr/local/bin/migrate
COPY .envrc .
COPY . .
RUN go build -v -o /usr/local/bin/app ./...
EXPOSE 8084
CMD ["app"]