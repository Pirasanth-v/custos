**Project structure**
custos/
├── frontend/          # React + Tailwind + Bun
├── backend/           # Go
├── database/          # Migrations, seeds
├── docs/              # Architecture decisions, API docs
├── .github/           # CI/CD workflows
├── docker-compose.yml
├── .gitignore
└── README.md

**Frontend folder structure (feature-based, not type-based):**

frontend/src/
├── features/
|   ├── auth/
|   |   ├── components/    # UI — LoginForm.tsx, RegisterForm.tsx
|   |   ├── hooks/         # Logic — useLogin.ts, useCurrentUser.ts  
|   |   ├── api.ts         # All HTTP calls related to auth
|   |   └── types.ts       # Auth-specific type definitions
│   ├── transactions/
│   └── dashboard/
├── components/        # Shared UI components
├── lib/               # axios instance, utils
├── store/             # Zustand stores
├── types/             # Global TypeScript types
└── main.tsx

**Backend folder structure (Clean Architecture):**

backend/
├── cmd/
│   └── server/
│       └── main.go        # Entry point
├── internal/
│   ├── handler/           # HTTP handlers (controllers)
│   ├── service/           # Business logic
│   ├── repository/        # DB queries
│   ├── model/             # Structs / domain types
│   ├── middleware/         # Auth, logging, rate limiting
│   └── config/            # App configuration
├── database/
│   └── migrations/
├── pkg/                   # Reusable packages (response helpers, errors)
├── .env.example
└── go.mod

**Commands**

```
# Start everything
docker compose up -d

# Stop
docker compose down

# lint for backend
golangci-lint run
```