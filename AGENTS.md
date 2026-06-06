# AGENTS.md

## Purpose

This file helps AI coding agents understand the `shelf` repository quickly and make safe, productive changes.

## Project overview

- Framework: Next.js 14 with the App Router (`src/app`).
- Language: TypeScript.
- Database: Prisma + PostgreSQL via `prisma/schema.prisma`.
- Authentication: NextAuth with Prisma adapter (`src/lib/auth.ts` and `src/app/api/auth/[...nextauth]/route.ts`).
- Main feature: book tracking dashboard with `Book`, `ReadingSession`, and `User` models.

## Important commands

- `npm install`
- `npm run dev`
- `npm run build`
- `npm run lint`
- `npm run db:push`
- `npm run db:generate`
- `npm run db:studio`

## Key files and directories

- `src/app/page.tsx`: public landing page.
- `src/app/dashboard/page.tsx`: authenticated dashboard.
- `src/app/api/books/route.ts`: book collection API.
- `src/app/api/books/[id]/route.ts`: book update/delete API.
- `src/app/api/auth/[...nextauth]/route.ts`: authentication route.
- `src/lib/prisma.ts`: shared Prisma client singleton.
- `src/lib/auth.ts`: NextAuth options and adapter setup.
- `prisma/schema.prisma`: database schema and models.
- `src/types/index.ts`: application-level type exports from Prisma.

## Conventions

- Use the `@/*` import alias configured in `tsconfig.json`.
- Use App Router conventions; pages and API routes are mounted under `src/app`.
- Database access should use `prisma` from `src/lib/prisma.ts`.
- Prisma schema changes require `npm run db:generate` and usually `npm run db:push` when syncing with the database.
- Image loading uses remote patterns configured in `next.config.js` for Google Books and GitHub avatars.
- CSS modules are used for component/scoped styles (e.g. `*.module.css`).

## Notes for agents

- Prefer minimal, architecture-aligned changes over broad refactors.
- Do not add new major dependencies unless there is a strong repository need.
- There is no existing test suite in this project, so focus on code correctness and consistent patterns.
- When modifying auth or database code, keep the Prisma/NextAuth integration intact.
- Keep route and API shapes compatible with the existing UI and models.

## Useful project patterns

- `BookStatus` enum values: `WANT`, `READING`, `FINISHED`.
- `Book` model uses `googleId`/`cover`/`description` for Google Books metadata, with manual `title`/`author` fallback.
- `ReadingSession` records per-book reading duration and date.

## When in doubt

- Read the code in `src/app/api` and `src/lib` first.
- Match the app's existing use of server components, Prisma queries, and CSS module naming.
- Preserve the current behavior of the dashboard and book CRUD flows unless explicitly asked to change them.
