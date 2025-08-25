# Quiz Builder (Full‑Stack JS Assessment)

Monorepo with **Express + Prisma (PostgreSQL)** backend and **Next.js** frontend.

## Quick Start

### 1 Backend

```bash
cd backend
cp .env.example .env
npm i
npx prisma generate
npx prisma migrate dev --name init
npm run dev
```

By default runs on `http://localhost:4000`.

> To seed an example quiz: `npm run seed`

### 2 Frontend

Open a second terminal:

```bash
cd frontend
cp .env.example .env    # set NEXT_PUBLIC_API_URL=http://localhost:4000
npm i
npm run dev
```

Visit `http://localhost:3000`.

---

### 3 Database (PostgreSQL)

Create a PostgreSQL database manually or with Docker.
For example, in psql run:

CREATE DATABASE quiz;

Or start with Docker:

docker run -d --name quiz-db \
 -e POSTGRES_PASSWORD=postgres \
 -e POSTGRES_DB=quiz \
 -p 5432:5432 postgres:16

## API Endpoints

- `POST /quizzes` – Create a new quiz
- `GET /quizzes` – List all quizzes (id, title, questionsCount)
- `GET /quizzes/:id` – Full quiz with questions
- `DELETE /quizzes/:id` – Delete a quiz

## Tech

- **Backend:** Express + TypeScript, Prisma (SQLite), Zod, CORS, dotenv
- **Frontend:** Next.js (Pages Router) + TypeScript, React Hook Form, Zod, Tailwind

## Notes

- Linting/formatting included via ESLint + Prettier.
- Env files are excluded from git.
