# Challenging Elapsed Time Design

## Goal
Add a whole-run elapsed timer for **challenging** difficulty so players can see how long their run has taken and review the final run time after a loss or completion.

## Scope
- Show elapsed run time during challenging gameplay only.
- Place the elapsed-time display above the streak counter in the challenge scoreboard area.
- Record the final elapsed run time when the run reaches `gameOver` or `completed`.
- Show that recorded time on both the Game Over and Congratulations screens.
- Leave casual difficulty behavior unchanged.

## Behavior
- The elapsed timer starts at `00:00` when the player starts a challenging run.
- It measures whole-run wall-clock time from Start until the session reaches `gameOver` or `completed`.
- It continues through reveal states, round transitions, and loading between rounds.
- It stops once the run ends and the final screens render a frozen snapshot of that time.
- Starting a new run resets the elapsed timer back to `00:00`.

## Architecture
### `useElapsedTimer`
Introduce a dedicated composable for count-up timing instead of extending the existing countdown `useTimer` composable.

Responsibilities:
- expose elapsed seconds
- start ticking once per second
- stop ticking
- reset back to zero
- clean up its interval on unmount

This keeps the two timing concepts separate:
- `useTimer`: per-round countdown for challenging mode
- `useElapsedTimer`: whole-run elapsed duration

### `ChallengeView`
`ChallengeView` owns the elapsed timer lifecycle because it already coordinates session transitions and the countdown timer.

Responsibilities:
- start the elapsed timer when a challenging game begins
- stop it when the session reaches `gameOver` or `completed`
- capture the final elapsed seconds at the moment the run ends
- reset elapsed timing when returning to setup
- format elapsed seconds as `mm:ss` for display

No changes are required to the domain session model for this feature because the elapsed result is only needed within the current run UI and does not need persistence.

## UI and Copy
### Playing screen
- Render elapsed time only in challenging mode.
- Place it above the streak counter within the scoreboard area.
- Use localized copy:
  - English: `Time: {time}`
  - Indonesian: `Waktu: {time}`

### Final screens
- Add the recorded elapsed time to the existing final-score block on both:
  - Game Over
  - Congratulations
- The value shown must be the frozen final run time, not a still-running counter.

## Edge Cases
- Casual runs never start or display the elapsed timer.
- A challenging run that ends due to timeout or wrong guess records the exact elapsed value at the transition to `gameOver`.
- A completed run records the exact elapsed value when the final reveal is continued into `completed`.
- Returning to setup clears the recorded final time before the next run.

## Testing
- Add composable tests proving the elapsed timer counts up, stops, and resets.
- Add challenge-view coverage proving:
  - elapsed time appears in challenging mode
  - elapsed time is absent in casual mode
  - final time is shown on Game Over
  - final time is shown on Congratulations
- Keep existing countdown-timer behavior covered separately so the new timer does not blur responsibilities.

## Non-Goals
- No persistent best-time storage.
- No leaderboard support.
- No elapsed timer for casual difficulty.
- No redesign of the existing per-round countdown timer.
