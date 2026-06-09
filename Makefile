.PHONY: help up down build logs restart \
        db-migrate db-reset db-studio db-seed \
        backend-shell frontend-shell postgres-shell \
        prod-up prod-build clean

# ─── Default ────────────────────────────────────────────────────────────────
help:
	@echo ""
	@echo "  StudEx — Docker Commands"
	@echo ""
	@echo "  Dev:"
	@echo "    make up              Start semua service (dev, hot reload)"
	@echo "    make down            Stop semua service"
	@echo "    make build           Build ulang semua Docker image"
	@echo "    make restart         Down + Up"
	@echo "    make logs            Follow log semua service"
	@echo "    make logs-be         Follow log backend saja"
	@echo "    make logs-fe         Follow log frontend saja"
	@echo ""
	@echo "  Database:"
	@echo "    make db-migrate      Jalankan migrasi terbaru (migrate deploy)"
	@echo "    make db-reset        Reset DB + re-run semua migrasi (migrate down+up)"
	@echo "    make db-studio       Buka Prisma Studio di browser"
	@echo ""
	@echo "  Shell:"
	@echo "    make backend-shell   Masuk ke container backend"
	@echo "    make frontend-shell  Masuk ke container frontend"
	@echo "    make postgres-shell  Masuk ke psql"
	@echo ""
	@echo "  Production:"
	@echo "    make prod-build      Build image production"
	@echo "    make prod-up         Jalankan production stack"
	@echo ""
	@echo "  Cleanup:"
	@echo "    make clean           Hapus containers + volumes (DATA HILANG!)"
	@echo ""

# ─── Development ────────────────────────────────────────────────────────────
up:
	docker compose up -d

down:
	docker compose down

build:
	docker compose build

restart: down up

logs:
	docker compose logs -f

logs-be:
	docker compose logs -f backend

logs-fe:
	docker compose logs -f frontend

# ─── Database ───────────────────────────────────────────────────────────────

# Migrate Up: jalankan semua file migrasi yang belum diapply
db-migrate:
	docker compose exec backend npx prisma migrate deploy

# Migrate Down: reset seluruh database lalu re-run semua migrasi dari awal
# PERINGATAN: semua data akan hilang
db-reset:
	docker compose exec backend npx prisma migrate reset --force

# Buka Prisma Studio (GUI database) di http://localhost:5555
db-studio:
	docker compose exec backend npx prisma studio --port 5555

# ─── Shell Access ───────────────────────────────────────────────────────────
backend-shell:
	docker compose exec backend sh

frontend-shell:
	docker compose exec frontend sh

postgres-shell:
	docker compose exec postgres psql -U $${DB_USER} -d $${DB_NAME}

# ─── Production ─────────────────────────────────────────────────────────────
prod-build:
	docker compose -f docker-compose.yml -f docker-compose.prod.yml build

prod-up:
	docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d

# ─── Cleanup ────────────────────────────────────────────────────────────────

# PERINGATAN: menghapus semua container, network, dan volume (data postgres hilang)
clean:
	docker compose down -v --remove-orphans
	docker image rm studex_backend studex_frontend 2>/dev/null || true
