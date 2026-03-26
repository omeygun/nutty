# Repository Guidelines

## Project Structure & Module Organization
This repository is a Next.js 15 App Router project. Route files live in `app/`, shared UI in `components/`, reusable hooks in `hooks/`, and business logic plus helpers in `lib/`. TypeScript types live in `types/`, static assets in `public/`, and database schema changes in `supabase/migrations/`.

Favor colocating feature-specific components under folders like `components/auth/`, `components/availability/`, and `components/group/`. Use the `@/*` path alias from `tsconfig.json` instead of deep relative imports.

## Build, Test, and Development Commands
- `npm install`: install dependencies from `package-lock.json`.
- `npm run dev`: start the local dev server with Turbopack at `http://localhost:3000`.
- `npm run build`: create the production build and catch type or route issues.
- `npm run start`: run the built app locally.
- `npm run lint`: run Next.js lint checks.

Run `npm run lint` and `npm run build` before opening a PR.

## Coding Style & Naming Conventions
Use TypeScript with strict types and 2-space indentation. Components, pages, and hooks should stay in `.tsx` or `.ts` files as appropriate. Prefer PascalCase for React components (`ResetPasswordForm.tsx`), camelCase for helpers (`group-session.ts` is the existing exception), and kebab-case for route folders.

Styling is done with Tailwind utilities in JSX and shared theme tokens in [`app/globals.css`](/Users/ome123/ucloud/nutty/app/globals.css). UI primitives under `components/ui/` follow the shadcn pattern; extend them instead of duplicating base controls.

## Testing Guidelines
There is no dedicated automated test suite yet. Treat `npm run lint` and `npm run build` as the minimum validation bar, then manually smoke-test the affected flows in the browser. For database changes, verify the related Supabase-backed pages and keep SQL migrations additive and timestamped in `supabase/migrations/`.

## Commit & Pull Request Guidelines
Recent commits use short, imperative summaries such as `add dashboard interface and invitation link`. Keep commit messages concise, lowercase where practical, and focused on one change.

PRs should include a clear summary, linked issue when applicable, and screenshots or short recordings for UI changes. Call out any required environment variables, migration files, or manual verification steps.

## Security & Configuration Tips
Do not hardcode secrets. This app expects `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and `NEXT_PUBLIC_BASE_URL` in local environment configuration. Review auth and OAuth changes carefully because they affect both server and client flows.
