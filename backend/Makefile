include .envrc
MIGRATIONS_PATH=./migrations

.PHONY: curl-health fmt env compose/build compose/up migrations/new migrations/up sqlc migrations/force

curl-health:
	@curl -v http://localhost:8080/health

fmt:
	@go fmt ./...

env:
	@direnv allow .

compose/build:
	@docker compose up --build

compose/up:
	@docker compose up --detach

migrations/new:
	@migrate create -ext sql -dir ${MIGRATIONS_PATH} -seq -digits 2 ${name}

migrations/up:
	@migrate -database ${DB_DSN} -path ${MIGRATIONS_PATH} up

migrations/force:
	@migrate -database ${DB_DSN} -path ${MIGRATIONS_PATH} force ${version}

sqlc:
	@sqlc generate