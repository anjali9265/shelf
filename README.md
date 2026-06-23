# 📚 Shelf

<img src="./public/shelf-logo.png" alt="Shelf logo" width="120" />

![Shelf logo](./public/shelf-logo.png)

A personal reading and learning dashboard. Tracks what I'm reading, surfaces AI-generated insights when I finish a book, and visualises my reading habits over time.

## What it does

- **Track books** across Want to Read / Reading / Finished, with metadata auto-filled from the Google Books API (cover, author, genres, page count)
- **AI-generated insights** — when a book is marked finished, Gemini generates a 3-bullet theme summary, cached so it's only ever requested once per book
- **Personalised recommendations** — suggests what to read next based on your finished books
- **Reading dashboard** — genre breakdown, books finished per month, reading time per week, and a day-streak counter
- **Reading timer** — start a session on a current book, stop it, and it logs straight to your stats

## Stack

| Layer     | Choice                                           |
| --------- | ------------------------------------------------ |
| Framework | Next.js 14 (App Router), TypeScript              |
| Database  | PostgreSQL via Prisma, hosted on Prisma Postgres |
| Auth      | NextAuth.js (GitHub OAuth)                       |
| AI        | Gemini API                                       |
| Book data | Google Books API                                 |
| Charts    | Recharts                                         |

Everything runs as Next.js API routes — no separate backend service, no container, no idle server cost.

## Running locally

```bash
git clone https://github.com/<your-username>/shelf.git
cd shelf
npm install
```

Create `.env.local` from `.env.local.example` and fill in:

- `DATABASE_URL` — from Prisma Postgres (Vercel → Storage → Marketplace)
- `NEXTAUTH_SECRET` — generate with `openssl rand -base64 32`
- `GITHUB_ID` / `GITHUB_SECRET` — from a GitHub OAuth App
- `GOOGLE_BOOKS_API_KEY` — from Google Cloud Console (Books API enabled)

```bash
npx prisma db push
npm run dev
```

Built by [Anjali](https://ianjali.com)
