# Compact End Screens Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the completed and game-over screens more compact by reducing excess vertical spacing between their stacked text sections.

**Architecture:** Keep the existing `ChallengeView` markup unchanged and localize the change to the end-screen CSS rules in `src/styles.css`. Add a focused regression test that asserts the end-state DOM keeps the existing structure while the implementation remains CSS-only.

**Tech Stack:** Vue 3, TypeScript, Vitest, Vue Test Utils, CSS

---

## File Structure

- Modify `src/styles.css` — tighten spacing values for `.game-over` descendants only.
- Modify `tests/ChallengeView.test.ts` — add a focused end-screen rendering test so the affected screen structure is covered while CSS changes are made.

### Task 1: Cover end-screen structure before adjusting spacing

**Files:**
- Modify: `tests/ChallengeView.test.ts`

- [ ] **Step 1: Write the failing test**

Add this test to `tests/ChallengeView.test.ts`:

```ts
  it('renders compact end-screen sections for game over', async () => {
    vi.useFakeTimers()
    const wrapper = mount(ChallengeView)

    await startChallengingGame(wrapper)
    await flushPromises()

    const input = wrapper.get('input')
    await input.setValue('wrong')
    await wrapper.get('form.guess-form').trigger('submit')
    await input.setValue('wrong')
    await wrapper.get('form.guess-form').trigger('submit')
    await input.setValue('wrong')
    await wrapper.get('form.guess-form').trigger('submit')

    expect(wrapper.find('.game-over').exists()).toBe(true)
    expect(wrapper.find('.game-over-reveal').exists()).toBe(true)
    expect(wrapper.find('.final-score').exists()).toBe(true)
  })
```

- [ ] **Step 2: Run the new test to verify current behavior is exercised**

Run: `rtk npm test -- tests/ChallengeView.test.ts`

Expected: the new test initially fails if helper setup is incomplete or selectors differ, then is corrected until it passes against the existing structure before CSS changes begin.

- [ ] **Step 3: Commit the test coverage**

```bash
rtk git add tests/ChallengeView.test.ts
rtk git commit -m "test: cover challenge end screen structure"
```

### Task 2: Tighten spacing on completed and game-over screens

**Files:**
- Modify: `src/styles.css:745-794`

- [ ] **Step 1: Update end-screen spacing values**

Replace the existing end-screen spacing rules with:

```css
.game-over h2 {
  font-size: 2rem;
  color: var(--color-danger);
  margin-bottom: var(--space-2);
}

.game-over.is-completed h2 {
  color: var(--color-success);
  margin-bottom: var(--space-1);
}

.game-over.is-completed > p {
  margin-bottom: var(--space-2);
}

.game-over-reveal {
  margin-bottom: var(--space-2);
}

.final-score {
  display: grid;
  gap: var(--space-1);
  margin-bottom: var(--space-3);
  font-size: 1.1rem;
}
```

- [ ] **Step 2: Run the focused test file**

Run: `rtk npm test -- tests/ChallengeView.test.ts`

Expected: PASS.

- [ ] **Step 3: Run the full test suite**

Run: `rtk npm test`

Expected: PASS.

- [ ] **Step 4: Commit the CSS change**

```bash
rtk git add src/styles.css
rtk git commit -m "style: compact challenge end screens"
```

## Self-Review

- Spec coverage: both completed and game-over spacing are addressed in Task 2; verification remains limited to end-screen scope and the full suite.
- Placeholder scan: no TBD/TODO placeholders remain.
- Type consistency: selectors and file paths match the current codebase (`.game-over`, `.game-over-reveal`, `.final-score`).
