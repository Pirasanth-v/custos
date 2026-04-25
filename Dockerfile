# ── Build stage ──────────────────────────────────────────
FROM golang:1.25-alpine AS builder

WORKDIR /app

# Install dependencies first (cached layer)
COPY backend/go.mod backend/go.sum ./
RUN go mod download

# Copy source and build
COPY backend/ .
RUN CGO_ENABLED=0 GOOS=linux go build -ldflags="-w -s" -o server ./cmd/server/main.go

# ── Run stage ────────────────────────────────────────────
FROM alpine:3.19

WORKDIR /app

# ca-certificates needed for HTTPS calls (MinIO/R2)
RUN apk add --no-cache ca-certificates tzdata

COPY --from=builder /app/server .

# Copy migrations so the server can run them on startup
COPY /database/migrations ./database/migrations

EXPOSE 8080

CMD ["./server"]