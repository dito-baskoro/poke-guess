import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'
import { useElapsedTimer } from '../src/composables/useElapsedTimer'

vi.mock('vue', async () => {
  const actual = await vi.importActual('vue')
  return { ...actual, onUnmounted: vi.fn() }
})

describe('useElapsedTimer', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

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
