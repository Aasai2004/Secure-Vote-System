# Workspace

## Overview

Digital Voting System - A full-stack web application for conducting digital elections with Aadhar number-based authentication.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)
- **Frontend**: React + Vite, TailwindCSS, React Query, Recharts, Framer Motion

## Features

- **Login Page**: Aadhar number-based authentication with admin login option
- **Admin Page**: Add/remove voters and candidates, manage the election
- **Voting Page**: Cast votes for candidates with confirmation dialog
- **Results Page**: Live results with bar chart, vote percentages, and winner

## Default Data (seeded)

- **Admin**: Name "Admin User", Aadhar: 123456789012
- **Voter 1**: Rajesh Kumar, Aadhar: 987654321098
- **Voter 2**: Priya Sharma, Aadhar: 456789012345
- **Candidates**: Amit Singh (NDP 🌸), Sunita Devi (INA ✋), Ramesh Patel (PPP 🌾)

## Structure

```text
artifacts-monorepo/
├── artifacts/
│   ├── api-server/         # Express API server with voting routes
│   └── voting-system/      # React + Vite frontend
├── lib/                    # Shared libraries
│   ├── api-spec/           # OpenAPI spec + Orval codegen config
│   ├── api-client-react/   # Generated React Query hooks
│   ├── api-zod/            # Generated Zod schemas from OpenAPI
│   └── db/                 # Drizzle ORM schema + DB connection
│       └── schema/
│           ├── voters.ts   # Voters table
│           └── candidates.ts # Candidates table
```

## Vote Tracking

Individual votes are stored in the `votes` table linking voter → candidate. The admin results page shows a full "Voter Audit Log" with who voted for whom (Aadhar masked), visible only to admins.

## API Routes

All routes under `/api`:
- `POST /api/auth/login` - Login with Aadhar number
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Get current session user
- `GET /api/admin/voters` - List all voters (admin only)
- `POST /api/admin/voters` - Add voter (admin only)
- `DELETE /api/admin/voters/:id` - Remove voter (admin only)
- `GET /api/admin/candidates` - List candidates (admin only)
- `POST /api/admin/candidates` - Add candidate (admin only)
- `DELETE /api/admin/candidates/:id` - Remove candidate (admin only)
- `POST /api/voting/cast` - Cast a vote
- `GET /api/results` - Get live results (public)
