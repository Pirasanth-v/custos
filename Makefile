include .env
export

DB_URL = postgres://${DB_USER}:${DB_PASSWORD}@localhost:${DB_PORT}/${DB_NAME}?sslmode=disable
MIGRATION_PATH = database/migrations

migrate-up:
	migrate -path ${MIGRATION_PATH} -database "${DB_URL}" up

migrate-down:
	migrate -path ${MIGRATION_PATH} -database "${DB_URL}" down

migrate-reset:
	migrate -path $(MIGRATION_PATH) -database "${DB_URL}" down -all
	migrate -path $(MIGRATION_PATH) -database "${DB_URL}" up

seed:
	docker exec -i custos_db psql -U $(DB_USER) -d $(DB_NAME) < database/seeds/001_system_roles.sql
