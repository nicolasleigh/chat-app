.PHONY: curl-health fmt env compose-build compose-up

curl-health:
	@curl -v http://localhost:8080/health

fmt:
	@go fmt ./...

env:
	@direnv allow .

compose-build:
	@docker compose up --build

compose-up:
	@docker compose up --detach
