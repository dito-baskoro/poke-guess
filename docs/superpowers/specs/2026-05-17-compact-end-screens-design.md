# Compact End Screens Design

## Goal
Make the completed and game-over screens feel more compact by reducing excess vertical spacing between their text elements, while preserving the current visual style and content.

## Chosen Approach
Use a targeted spacing trim in the existing end-screen CSS rather than redesigning the layout.

This keeps the change small and focused:
- tighten the heading-to-content spacing
- reduce the gap below the completed-state description
- reduce the reveal block spacing on game over
- tighten the final-score stack and its spacing before the retry button

## Scope
### In scope
- `completed` screen spacing
- `gameOver` screen spacing
- CSS-only adjustments in the existing end-screen rules

### Out of scope
- changing copy
- changing typography scale
- changing button styles
- changing the playing screen layout
- introducing a new card or score component

## Design Details
The end screens will keep their current hierarchy:
1. title
2. optional supporting text or reveal
3. final score summary
4. retry button

The layout will become denser by reducing vertical rhythm values, not by removing content. Both end states should feel consistently compact, with the completed screen still retaining its success color treatment and the game-over screen still retaining its reveal image.

## Expected Result
The two end screens should read as tighter groups of related information, with less empty space between lines and sections, while remaining easy to scan and visually aligned with the rest of the game UI.

## Verification
- visually inspect both completed and game-over states
- confirm no unintended spacing changes occur outside `.game-over`
- run the existing test suite to ensure no behavioral regressions
