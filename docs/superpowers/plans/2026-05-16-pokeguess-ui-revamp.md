# PokéGuess UI Revamp Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Apply the `revamp.md` visual refresh while preserving the app’s existing functionality and behavior.

**Architecture:** Keep the existing Vue component structure intact and add presentation-only hooks where the new design needs them. Centralize the redesign in `src/styles.css`, with small template/i18n updates in the listed components so state can drive styling without changing business logic.

**Tech Stack:** Vue 3, TypeScript, CSS, Vitest, Testing Library, Vite

---

## File Map
- `index.html` — load Space Grotesk and Inter from Google Fonts.
- `src/styles.css` — replace the visual system and add motion, skeleton, type, and responsive styles.
- `src/App.vue` — add decorative Pokéball markup.
- `src/views/HomeView.vue` — add eyebrow copy and per-card accent classes.
- `src/components/PokemonCard.vue` — expose type data attributes and stat bars.
- `src/views/ChallengeView.vue` — expose hot-streak and feedback-state classes.
- `src/views/PokedexView.vue` — render skeleton placeholders during page loads.
- `src/components/PaginationControls.vue` — add arrow indicators.
- `src/i18n.ts` — add localized eyebrow copy.
- `tests/PokemonCard.test.ts` — verify type data hooks and stat bars.
- `tests/PaginationControls.test.ts` — verify arrow labels remain accessible.
- `tests/i18n.test.ts` — verify eyebrow translations.

### Task 1: Add observable UI hooks with failing tests

**Files:**
- Modify: `tests/PokemonCard.test.ts`
- Modify: `tests/PaginationControls.test.ts`
- Modify: `tests/i18n.test.ts`

- [ ] **Step 1: Write failing tests for the new rendered markup**

```ts
// tests/PokemonCard.test.ts additions
it('exposes type-driven hooks and stat bars', () => {
  const { container } = render(PokemonCard, {
    props: {
      pokemon: {
        id: 25,
        name: 'pikachu',
        displayName: 'Pikachu',
        imageUrl: 'https://example.com/pikachu.png',
        types: ['electric'],
        height: 4,
        weight: 60,
        abilities: ['static'],
        stats: [{ name: 'hp', value: 35 }],
      },
    },
  })

  expect(container.querySelector('.pokemon-card')).toHaveAttribute('data-primary-type', 'electric')
  expect(screen.getByText('electric')).toHaveAttribute('data-type', 'electric')
  expect(container.querySelector('.stat-bar-fill')).toHaveStyle({ width: `${(35 / 255) * 100}%` })
  expect(screen.getByText('35')).toBeInTheDocument()
})
```

```ts
// tests/PaginationControls.test.ts addition
it('renders directional arrow labels', () => {
  render(PaginationControls, {
    props: {
      currentPage: 2,
      totalPages: 3,
    },
  })

  expect(screen.getByRole('button', { name: /← previous/i })).toBeInTheDocument()
  expect(screen.getByRole('button', { name: /next →/i })).toBeInTheDocument()
})
```

```ts
// tests/i18n.test.ts addition
it('returns localized eyebrow copy', () => {
  expect(getMessage('en', 'home.eyebrow')).toBe("Gotta Catch 'Em All")
  expect(getMessage('id', 'home.eyebrow')).toBe('Tangkap Semuanya')
})
```

- [ ] **Step 2: Run focused tests to verify they fail for missing behavior**

Run: `npm test -- tests/PokemonCard.test.ts tests/PaginationControls.test.ts tests/i18n.test.ts`
Expected: FAIL because the new attributes, stat bars, arrows, and eyebrow messages do not exist yet.

- [ ] **Step 3: Commit the failing tests**

```bash
git add tests/PokemonCard.test.ts tests/PaginationControls.test.ts tests/i18n.test.ts
git commit -m "test: define ui revamp hooks"
```

### Task 2: Implement component and localization hooks

**Files:**
- Modify: `src/components/PokemonCard.vue`
- Modify: `src/components/PaginationControls.vue`
- Modify: `src/i18n.ts`
- Modify: `src/views/HomeView.vue`
- Modify: `src/views/ChallengeView.vue`
- Modify: `src/views/PokedexView.vue`
- Modify: `src/App.vue`

- [ ] **Step 1: Add minimal component/i18n changes to satisfy the tests and spec hooks**

```vue
<!-- src/components/PokemonCard.vue key changes -->
<article class="pokemon-card" :data-primary-type="pokemon.types[0]">
...
<span v-for="type in pokemon.types" :key="type" class="type-pill" :data-type="type">{{ type }}</span>
...
<li v-for="stat in pokemon.stats" :key="stat.name">
  <span>{{ formatStatName(stat.name) }}</span>
  <div class="stat-bar" aria-hidden="true">
    <span class="stat-bar-fill" :style="{ width: `${(stat.value / 255) * 100}%` }"></span>
  </div>
  <strong>{{ stat.value }}</strong>
</li>
```

```vue
<!-- src/components/PaginationControls.vue key changes -->
<button :disabled="currentPage === 1" @click="$emit('previous')">
  ← {{ t('pagination.previous') }}
</button>
...
<button :disabled="currentPage === totalPages" @click="$emit('next')">
  {{ t('pagination.next') }} →
</button>
```

```ts
// src/i18n.ts additions
home: {
  eyebrow: "Gotta Catch 'Em All",
  ...
}
// Indonesian
home: {
  eyebrow: 'Tangkap Semuanya',
  ...
}
```

```vue
<!-- src/views/HomeView.vue key changes -->
<span class="eyebrow">{{ t('home.eyebrow') }}</span>
<RouterLink to="/pokedex" class="home-card home-card-pokedex">...</RouterLink>
<RouterLink to="/challenge" class="home-card home-card-challenge">...</RouterLink>
```

```vue
<!-- src/views/ChallengeView.vue key changes -->
<span class="streak-counter" :class="{ 'on-fire': state.streak >= 3 }">
  {{ t('challenge.streak') }} <strong>{{ state.streak }}</strong>
  <span v-if="state.streak >= 3" aria-hidden="true">🔥</span>
</span>
...
<p class="feedback" :class="state.result">{{ feedback }}</p>
```

```vue
<!-- src/views/PokedexView.vue addition before real cards -->
<section v-if="isPageLoading" class="card-grid skeleton-grid" aria-hidden="true">
  <article v-for="index in pageSize" :key="`skeleton-${index}`" class="pokemon-card skeleton-card">
    <div class="skeleton-line skeleton-line-short"></div>
    <div class="skeleton-artwork"></div>
    <div class="skeleton-line"></div>
    <div class="skeleton-line"></div>
    <div class="skeleton-line skeleton-line-short"></div>
  </article>
</section>
```

```vue
<!-- src/App.vue addition -->
<div class="pokeball-decoration" aria-hidden="true"></div>
```

- [ ] **Step 2: Run focused tests to verify they pass**

Run: `npm test -- tests/PokemonCard.test.ts tests/PaginationControls.test.ts tests/i18n.test.ts`
Expected: PASS.

- [ ] **Step 3: Commit the markup/i18n implementation**

```bash
git add src/components/PokemonCard.vue src/components/PaginationControls.vue src/i18n.ts src/views/HomeView.vue src/views/ChallengeView.vue src/views/PokedexView.vue src/App.vue
git commit -m "feat: add ui revamp presentation hooks"
```

### Task 3: Apply the visual system overhaul

**Files:**
- Modify: `index.html`
- Modify: `src/styles.css`

- [ ] **Step 1: Add the required Google Fonts markup**

```html
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link
  href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&family=Space+Grotesk:wght@600;700&display=swap"
  rel="stylesheet"
/>
```

- [ ] **Step 2: Replace `src/styles.css` with the revamp design system**

Implement:
- color tokens for base, accents, and 18 Pokémon types
- animated navy/purple page background
- floating sticky glass header
- gradient brand text and CTA buttons
- glassmorphism cards with hover lift
- `[data-type]` pill colors and `[data-primary-type]` card accents
- stat bars with animated fill
- streak fire, silhouette reveal, feedback, Pokéball, shimmer, and card-enter animations
- responsive refinements
- `prefers-reduced-motion` fallback disabling animations/transitions

- [ ] **Step 3: Run the full test suite**

Run: `npm test`
Expected: PASS.

- [ ] **Step 4: Run the production build**

Run: `npm run build`
Expected: PASS.

- [ ] **Step 5: Commit the styling implementation**

```bash
git add index.html src/styles.css
git commit -m "feat: revamp pokeguess visual design"
```

### Task 4: Verify the finished revamp

**Files:**
- Review: all modified files

- [ ] **Step 1: Re-read `revamp.md` and verify each requested item is implemented**

Checklist:
- Google Fonts
- Design-system CSS overhaul
- Type pills + stat bars + primary type hook
- Challenge hot streak + feedback classes + flame
- Pokéball decoration
- Home eyebrow + differentiated cards
- Pokédex skeletons
- Pagination arrows
- `home.eyebrow` i18n keys

- [ ] **Step 2: Run final verification commands**

Run: `npm test && npm run build`
Expected: PASS.

- [ ] **Step 3: Open the app locally and visually inspect home, Pokédex, and challenge views**

Run: `npm run dev -- --host 127.0.0.1`
Expected: Vite dev server starts successfully for browser inspection.

- [ ] **Step 4: Commit any tiny visual fixes found during inspection**

```bash
git add <changed-files>
git commit -m "fix: polish ui revamp details"
```
