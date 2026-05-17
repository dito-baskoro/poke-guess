# Challenging Elapsed Time Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a whole-run elapsed timer for challenging difficulty and show the final recorded run time on both end screens.

**Architecture:** Keep the existing per-round countdown timer unchanged and add a dedicated `useElapsedTimer` composable for count-up timing. `ChallengeView` owns the elapsed timer lifecycle, starts it when a challenging run begins, freezes it when the run ends, formats it as `mm:ss`, and renders it only where the spec requires.

**Tech Stack:** Vue 3, TypeScript, Vitest, Vue Test Utils

---

## File Structure
- Create `src/composables/useElapsedTimer.ts` for focused count-up timer behavior.
- Create `tests/use-elapsed-timer.test.ts` for composable unit coverage.
- Modify `src/views/ChallengeView.vue` to manage elapsed-run lifecycle and render elapsed time.
- Modify `src/i18n.ts` for localized elapsed-time copy.
- Modify `tests/i18n.test.ts` for translation coverage.
- Add `tests/ChallengeView.test.ts` for view-level elapsed-time behavior.

### Task 1: Add elapsed timer composable

**Files:**
- Create: `src/composables/useElapsedTimer.ts`
- Create: `tests/use-elapsed-timer.test.ts`

- [ ] **Step 1: Write the failing tests**

```ts
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'
import { useElapsedTimer } from '../src/composables/useElapsedTimer'

vi.mock('vue', async () => {
  const actual = await vi.importActual('vue')
  return { ...actual, onUnmounted: vi.fn() }
})

describe('useElapsedTimer', () => {
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => vi.useRealTimers())

  it('counts upward once started', () => {
    const { elapsed, start } = useElapsedTimer()

    start()
    vi.advanceTimersByTime(5000)

    expect(elapsed.value).toBe(5)
  })

  it('stops without continuing to count', () => {
    const { elapsed, start, stop } = useElapsedTimer()

    start()
    vi.advanceTimersByTime(3000)
    stop()
    vi.advanceTimersByTime(5000)

    expect(elapsed.value).toBe(3)
  })

  it('resets to zero', () => {
    const { elapsed, start, reset } = useElapsedTimer()

    start()
    vi.advanceTimersByTime(3000)
    reset()

    expect(elapsed.value).toBe(0)
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `rtk npm test -- --run tests/use-elapsed-timer.test.ts`
Expected: FAIL because `useElapsedTimer` does not exist yet.

- [ ] **Step 3: Write the minimal implementation**

```ts
import { ref, readonly, onUnmounted } from 'vue'

export function useElapsedTimer() {
  const elapsed = ref(0)
  const isRunning = ref(false)
  let intervalId: ReturnType<typeof setInterval> | null = null

  function start() {
    if (isRunning.value) return
    isRunning.value = true
    intervalId = setInterval(() => {
      elapsed.value += 1
    }, 1000)
  }

  function stop() {
    if (intervalId !== null) {
      clearInterval(intervalId)
      intervalId = null
    }
    isRunning.value = false
  }

  function reset() {
    stop()
    elapsed.value = 0
  }

  onUnmounted(stop)

  return { elapsed: readonly(elapsed), isRunning: readonly(isRunning), start, stop, reset }
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `rtk npm test -- --run tests/use-elapsed-timer.test.ts`
Expected: PASS.

### Task 2: Add localized elapsed-time copy

**Files:**
- Modify: `src/i18n.ts`
- Modify: `tests/i18n.test.ts`

- [ ] **Step 1: Write the failing translation test**

```ts
it('returns localized challenge elapsed-time copy', () => {
  expect(getMessage('en', 'challenge.elapsedTime', { time: '01:23' })).toBe('Time: 01:23')
  expect(getMessage('id', 'challenge.elapsedTime', { time: '01:23' })).toBe('Waktu: 01:23')
})
```

- [ ] **Step 2: Run the translation test to verify it fails**

Run: `rtk npm test -- --run tests/i18n.test.ts`
Expected: FAIL because `challenge.elapsedTime` is missing.

- [ ] **Step 3: Add the messages**

```ts
elapsedTime: 'Time: {time}',
```

```ts
elapsedTime: 'Waktu: {time}',
```

- [ ] **Step 4: Run the translation test to verify it passes**

Run: `rtk npm test -- --run tests/i18n.test.ts`
Expected: PASS.

### Task 3: Render and record elapsed time in ChallengeView

**Files:**
- Modify: `src/views/ChallengeView.vue`
- Create: `tests/ChallengeView.test.ts`

- [ ] **Step 1: Write failing view tests**

```ts
import { mount, flushPromises } from '@vue/test-utils'
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'
import ChallengeView from '../src/views/ChallengeView.vue'

vi.mock('../src/services/pokemonRepository', () => ({
  SUPPORTED_GENERATIONS: [1],
  pokemonRepository: {
    getMultiGenerationCatalog: vi.fn().mockResolvedValue([{ id: 25 }]),
    getPokemon: vi.fn().mockResolvedValue({
      id: 25,
      name: 'pikachu',
      displayName: 'Pikachu',
      imageUrl: '/pikachu.png',
      types: ['electric'],
    }),
  },
}))

describe('ChallengeView elapsed time', () => {
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => vi.useRealTimers())

  async function startRun(difficulty: 'casual' | 'challenging') {
    const wrapper = mount(ChallengeView)
    await wrapper.find(`input[value="${difficulty}"]`).setValue()
    await wrapper.get('button.start-button').trigger('click')
    await flushPromises()
    return wrapper
  }

  it('shows elapsed time during challenging runs only', async () => {
    const challenging = await startRun('challenging')
    vi.advanceTimersByTime(3000)
    await challenging.vm.$nextTick()
    expect(challenging.text()).toContain('Time: 00:03')

    const casual = await startRun('casual')
    expect(casual.text()).not.toContain('Time:')
  })

  it('shows the frozen final time on game over', async () => {
    const wrapper = await startRun('challenging')
    vi.advanceTimersByTime(4000)
    await wrapper.find('input[type="text"]').setValue('wrong')
    await wrapper.find('form.guess-form').trigger('submit')
    await wrapper.vm.$nextTick()

    expect(wrapper.text()).toContain('Game Over')
    expect(wrapper.text()).toContain('Time: 00:04')
  })

  it('shows the frozen final time on completion', async () => {
    const wrapper = await startRun('challenging')
    vi.advanceTimersByTime(5000)
    await wrapper.find('input[type="text"]').setValue('pikachu')
    await wrapper.find('form.guess-form').trigger('submit')
    await wrapper.find('form').trigger('submit')
    await wrapper.vm.$nextTick()

    expect(wrapper.text()).toContain('Congratulations!')
    expect(wrapper.text()).toContain('Time: 00:05')
  })
})
```

- [ ] **Step 2: Run view tests to verify they fail**

Run: `rtk npm test -- --run tests/ChallengeView.test.ts`
Expected: FAIL because elapsed timing is not yet implemented.

- [ ] **Step 3: Add elapsed timing lifecycle and rendering**

Implementation details:
- import `useElapsedTimer`
- create `finalElapsedSeconds = ref<number | null>(null)`
- derive `formattedElapsedTime` from current elapsed seconds and `formattedFinalElapsedTime` from the frozen snapshot
- add `formatElapsedTime(seconds)` returning zero-padded `mm:ss`
- start/reset elapsed timing in `handleStart()` only when the chosen difficulty is `challenging`
- stop and snapshot elapsed timing whenever the session transitions to `gameOver` or `completed`
- clear the snapshot and reset elapsed timing in `handleTryAgain()`
- render the localized elapsed-time label above the streak counter during challenging gameplay
- render the localized frozen time inside both final-score blocks for challenging runs only

- [ ] **Step 4: Run view tests to verify they pass**

Run: `rtk npm test -- --run tests/ChallengeView.test.ts`
Expected: PASS.

### Task 4: Run focused and full verification

**Files:**
- Verify all touched files

- [ ] **Step 1: Run focused tests**

Run: `rtk npm test -- --run tests/use-elapsed-timer.test.ts tests/i18n.test.ts tests/ChallengeView.test.ts`
Expected: PASS.

- [ ] **Step 2: Run the full suite**

Run: `rtk npm test -- --run`
Expected: PASS.

- [ ] **Step 3: Build the app**

Run: `rtk npm run build`
Expected: PASS.
