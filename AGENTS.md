# Repository Guidelines

## Project Structure & Module Organization
- `pages/` holds top-level screens (e.g., `Home.tsx`, `MapPage.tsx`) that map to primary app views.
- `components/` contains reusable UI building blocks (e.g., `Navigation.tsx`, `CultureModal.tsx`).
- `App.tsx` wires view state and page routing logic; `index.tsx` is the React entry point.
- `types.ts` centralizes shared TypeScript types and enums (e.g., `ViewState`, `Tab`).
- `api_example/` stores API request/response samples and is not part of the runtime build.
- `index.html`, `vite.config.ts`, and `tsconfig.json` configure the Vite + TypeScript setup.

## Build, Test, and Development Commands
- `npm install`: install dependencies (Node.js required).
- `npm run dev`: start the Vite dev server for local development.
- `npm run build`: create a production build in `dist/`.
- `npm run preview`: serve the production build locally for smoke checks.

## Coding Style & Naming Conventions
- Language: TypeScript + React with functional components and hooks.
- Indentation: 2 spaces; keep JSX aligned with surrounding blocks.
- Naming: `PascalCase` for components and files in `pages/` and `components/`; `camelCase` for functions/variables; enums/types in `PascalCase` (see `types.ts`).
- Imports: keep relative paths consistent; project alias is available via `@/` (see `tsconfig.json`).

## Testing Guidelines
- No test framework or `npm test` script is configured yet.
- If you add tests, keep them close to the feature (`*.test.tsx` or `__tests__/`) and document the new command in this file.

## Commit & Pull Request Guidelines
- Git history is not present in this repository, so no commit convention is established yet.
- Recommended: concise, imperative messages (e.g., “Add diary timeline view”).
- PRs should include: a short summary, screenshots for UI changes, and any setup/config notes (especially `.env.local` changes).

## Configuration & Secrets
- Set `GEMINI_API_KEY` in `.env.local` for local runs; do not commit secrets.
- Keep sample values or setup notes in `README.md` if new env vars are added.
