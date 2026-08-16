# StudyMate AI

AI-powered **student utility web application** built with Next.js.

## Features

- Notes Summarizer
- Quiz Generator
- Explain Concepts
- Improve Answers
- Flashcard Generator
- Study Planner
- Auth (signup / login)
- Usage limits + history

## Stack

- Next.js 16 (App Router) + TypeScript
- Tailwind CSS
- Prisma + PostgreSQL
- OpenAI / Groq / Gemini API
- JWT cookie sessions

## Setup

1. Install dependencies:

```bash
npm install
```

2. Copy env and add your OpenAI key:

```bash
copy .env.example .env
```

Edit `.env`:

```env
DATABASE_URL="postgresql://username:password@localhost:5432/studymate_db?schema=public"
AUTH_SECRET="replace-with-a-long-random-string"
OPENAI_API_KEY="sk-..."
OPENAI_MODEL="gpt-4o-mini"
```

3. Create the database:

```bash
npx prisma migrate dev --name init
```

4. Run the web app:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | Lint |
| `npm run db:migrate` | Run Prisma migrations |
| `npm run db:studio` | Open Prisma Studio |

## Project structure

```text
src/
  app/                # Web routes (pages + API)
  components/         # UI components
  lib/                # Auth, DB, AI services
prisma/               # Database schema
```

## API overview

- `POST /api/auth/signup|login|logout`
- `GET /api/auth/me`
- `POST /api/ai/summarize|quiz|explain|improve|flashcards|planner`
- `GET /api/history`
- `GET /api/usage`
