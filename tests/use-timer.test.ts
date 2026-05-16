import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'
import { useTimer } from '../src/composables/useTimer'

vi.mock('vue', async () => {
  const actual = await vi.importActual('vue')
  return { ...actual, onUnmounted: vi.fn() }
})

describe('useTimer', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('counts down from the given duration', () => {
    const onExpire = vi.fn()
    const { remaining, start } = useTimer(30, onExpire)

    start()
    vi.advanceTimersByTime(5000)

    expect(remaining.value).toBe(25)
    expect(onExpire).not.toHaveBeenCalled()
  })

  it('calls onExpire when reaching zero', () => {
    const onExpire = vi.fn()
    const { remaining, start } = useTimer(5, onExpire)

    start()
    vi.advanceTimersByTime(5000)

    expect(remaining.value).toBe(0)
    expect(onExpire).toHaveBeenCalledOnce()
  })

  it('can be stopped and reset', () => {
    const onExpire = vi.fn()
    const { remaining, isRunning, start, stop, reset } = useTimer(10, onExpire)

    start()
    vi.advanceTimersByTime(3000)
    stop()

    expect(remaining.value).toBe(7)
    expect(isRunning.value).toBe(false)

    vi.advanceTimersByTime(5000)
    expect(remaining.value).toBe(7)

    reset()
    expect(remaining.value).toBe(10)
  })

  it('does not call onExpire if stopped before zero', () => {
    const onExpire = vi.fn()
    const { start, stop } = useTimer(5, onExpire)

    start()
    vi.advanceTimersByTime(3000)
    stop()
    vi.advanceTimersByTime(10000)

    expect(onExpire).not.toHaveBeenCalled()
  })
})
