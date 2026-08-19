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

## Deployment Guide

### 1. Database Setup (PostgreSQL)
When deploying to cloud platforms (Vercel, Render, Railway, etc.), you need a cloud PostgreSQL database:
- **Free Hosted PostgreSQL Providers**: [Neon.tech](https://neon.tech), [Supabase.com](https://supabase.com), or [Render.com](https://render.com).
- Copy your connection string (e.g. `postgresql://user:password@host/dbname?sslmode=require`).

### 2. Environment Variables
Add the following Environment Variables in your deployment provider's Dashboard (e.g. **Vercel -> Settings -> Environment Variables**):

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@ep-xyz.neon.tech/neondb?sslmode=require` |
| `AUTH_SECRET` | Secret key for JWT session signing | `random-long-secret-key-string` |
| `GROQ_API_KEY` or `GEMINI_API_KEY` | AI Provider API key | `gsk_...` or `AIza...` |
| `AI_PROVIDER` | AI provider choice | `groq` or `gemini` |

### 3. Initialize Database Schema
Run database migration/push against your cloud database:
```bash
npx prisma db push
```

## API overview

- `POST /api/auth/signup|login|logout`
- `GET /api/auth/me`
- `POST /api/ai/summarize|quiz|explain|improve|flashcards|planner`
- `GET /api/history`
- `GET /api/usage`

