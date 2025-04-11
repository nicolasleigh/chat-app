include ./backend/.envrc
MIGRATIONS_PATH=./backend/migrations

.PHONY: curl/health/remote
curl/health/remote:
	curl -v https://chat.linze.pro/api/health

.PHONY: compose/build
compose/build:
	docker compose up --build

.PHONY: compose/up
compose/up:
	docker compose up --detach

.PHONY: backend/env
backend/env:
	direnv allow .

.PHONY: backend/migrate/up
backend/migrate/up:
	docker exec chatify-backend migrate -database ${CLOUD_DB_DSN} -path ${MIGRATIONS_PATH} up

.PHONY: backend/migrate/down
backend/migrate/down:
	docker exec chatify-backend migrate -database ${CLOUD_DB_DSN} -path ${MIGRATIONS_PATH} down ${num}

.PHONY: backend/migrate/force
backend/migrate/force:
	docker exec chatify-backend migrate -database ${CLOUD_DB_DSN} -path ${MIGRATIONS_PATH} force ${version}

.PHONY: frontend/build
frontend/build:
	cd frontend && npm run build && cd ..

.PHONY: frontend/send
frontend/send:
	cd frontend && rsync -rP dist nicolas@106.14.126.186:~/chatify/react-build && cd ..