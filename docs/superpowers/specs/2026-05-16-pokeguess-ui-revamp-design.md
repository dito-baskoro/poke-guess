# PokéGuess UI Revamp Design

## Goal
Transform the current dark-red PokéGuess interface into a premium fan-app experience aligned with `revamp.md`: richer color, stronger personality, modern motion, and playful Pokémon-inspired details while preserving all existing behavior.

## Scope
Implement the visual revamp described in `revamp.md` with minimal judgment calls only where the existing markup needs small integration adjustments.

In scope:
- Global visual system overhaul in `src/styles.css`
- Google Fonts loading in `index.html`
- Decorative Pokéball element in `src/App.vue`
- Home-page eyebrow and differentiated home-card accents in `src/views/HomeView.vue`
- Type-aware Pokémon cards and stat bars in `src/components/PokemonCard.vue`
- Hot-streak and feedback-state styling hooks in `src/views/ChallengeView.vue`
- Skeleton loading placeholders in `src/views/PokedexView.vue`
- Arrow indicators in `src/components/PaginationControls.vue`
- `home.eyebrow` localization entries in `src/i18n.ts`

Out of scope:
- Routing, data fetching, repository logic, and game-state changes
- New dependencies or external libraries beyond CDN-hosted fonts
- Broader redesign work not requested by `revamp.md`

## Chosen Approach
Use a spec-first implementation with minimal integration polish.

This means each requested change from `revamp.md` is implemented directly, while tiny supporting adjustments are allowed when needed for maintainable markup, accessible loading states, or clean CSS hooks. This keeps scope controlled without forcing awkward literalism.

## Architecture and Component Changes
### Global system
`src/styles.css` becomes the main design-system layer. It will define:
- Navy/purple base colors and electric accent variables
- Typography tokens using Space Grotesk for display text and Inter for body text
- Shared glassmorphism surfaces, button treatments, transitions, and shadows
- Type colors selected through `[data-type]` attributes
- Motion primitives for card entry, hover lift, hot streaks, silhouette reveal, feedback states, floating Pokéball, shimmer loading, and animated background
- Responsive behavior and a `prefers-reduced-motion` fallback that disables animations and transitions

### App shell and home
`App.vue` adds one decorative element outside the main shell so it can float independently in the viewport.

`HomeView.vue` adds the localized eyebrow and distinct card classes so each primary CTA can receive a different accent treatment without changing routing or content structure.

### Pokémon cards
`PokemonCard.vue` keeps the same public API and data flow. It adds:
- `data-primary-type` on the card root for type-themed accents
- `data-type` on each type pill
- A visual bar for each stat using inline width derived from `stat.value / 255 * 100`

Raw numeric values remain visible alongside the bars so the UI gains visual richness without sacrificing readability.

### Challenge view
`ChallengeView.vue` adds state-driven styling hooks only:
- `on-fire` on the streak display when streak is at least 3
- A flame glyph when the streak is hot
- Result-specific feedback classes for correct, incorrect, and revealed states

The guessing flow, reveal flow, and scorekeeping remain unchanged.

### Pokédex loading and pagination
`PokedexView.vue` shows skeleton card placeholders during page loads so the layout stays stable and communicates progress more clearly.

`PaginationControls.vue` prepends/appends simple Unicode arrows to the existing translated labels.

## Data Flow
No business-logic data flow changes are introduced.

The only derived presentation value added is stat width in `PokemonCard.vue`, calculated from each already-available stat value. Existing state in `ChallengeView.vue` and `PokedexView.vue` is reused to drive styling.

## Error Handling and Accessibility
Existing error handling remains intact.

Accessibility considerations:
- Decorative Pokéball is marked `aria-hidden="true"`
- Skeleton cards are visual placeholders only and should not replace current textual loading feedback
- Reduced-motion users receive a static version of the experience
- Numeric stat values remain present next to visual bars
- Existing labels, language selection, and button semantics stay intact

## Testing Strategy
Update or extend component tests where intentional markup changes are observable, especially:
- type data attributes and stat bars on Pokémon cards
- challenge streak/feedback classes if covered by existing tests or practical to add
- localized eyebrow copy
- pagination arrow text if assertions inspect rendered output

Then run:
1. Existing test suite
2. Production build
3. Local visual inspection of home, Pokédex, and challenge views, including loading and hot-streak states where practical

## Trade-offs
- CDN fonts avoid adding dependencies, but introduce a small external loading dependency.
- CSS-only effects keep the app lightweight, but require careful reduced-motion handling.
- Skeleton placeholders improve perceived responsiveness, though they slightly increase template/CSS complexity.

## Success Criteria
- The app visually matches the direction in `revamp.md`
- Existing functionality is preserved
- Requested UI hooks are present in the specified files
- Tests and build pass
- The experience degrades gracefully with reduced motion enabled
