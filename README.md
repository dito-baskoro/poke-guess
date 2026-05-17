# PokéGuess

A Vue 3 + TypeScript single-page app with two modes: a card-style **Pokédex** browser and a **"Who's That Pokémon?"** silhouette guessing challenge. Data is fetched from [PokéAPI](https://pokeapi.co/).

Live: https://dito-baskoro.github.io/poke-guess/

## Features

- **Pokédex** — browse Generations with pagination, search by name, and filter by type. Cards expand to show abilities, stats, and play the Pokémon's cry (toggleable).
- **Challenge** — guess Pokémon from their silhouette across one or more generations.
  - **Casual**: 2 hearts, no timer.
  - **Challenging**: 1 heart, 30-second per-round timer, total elapsed time tracked, and a top-5 leaderboard persisted to `localStorage` (sorted by streak, then score, then time).
- **i18n** — English and Bahasa Indonesia, switchable in the header.

## Tech stack

- Vue 3 (Composition API, `<script setup>`) + Vue Router 4
- TypeScript (strict) + `vue-tsc`
- Vite 6
- Vitest + `@testing-library/vue` + jsdom

## Project structure

```
src/
  components/      ChallengeLeaderboard, PaginationControls, PokemonCard
  composables/     useTimer, useElapsedTimer, useLeaderboard, useSoundPreference
  domain/          Pure logic: pokemon, gameSession, challenge, challengeState
  services/        pokemonRepository (PokéAPI client with in-memory caching)
  views/           HomeView, PokedexView, ChallengeView
  i18n.ts          Translation messages and locale store
  styles.css       Global styles
tests/             Vitest unit + component tests
.github/workflows/ deploy.yml (GitHub Pages)
```

Logic and rendering are kept separate: pure functions live in `src/domain/` (and have dedicated tests), Vue components consume them.

## Getting started

Requires Node.js 22+.

```bash
npm install
npm run dev          # start Vite dev server
npm run build        # type-check + production build (writes to dist/)
npm run test         # run vitest once
npm run test:watch   # vitest in watch mode
npm run typecheck    # vue-tsc --noEmit
```

## Deployment

Pushes to `main` trigger `.github/workflows/deploy.yml`, which builds the app and publishes `dist/` to GitHub Pages. The build copies `dist/index.html` to `dist/404.html` so client-side routes resolve when refreshed on Pages. `vite.config.ts` sets `base: '/poke-guess/'` to match the Pages path.
