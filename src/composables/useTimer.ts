import { ref, readonly, onUnmounted } from 'vue'

export function useTimer(durationSeconds: number, onExpire: () => void) {
  const remaining = ref(durationSeconds)
  const isRunning = ref(false)
  let intervalId: ReturnType<typeof setInterval> | null = null

  function tick() {
    remaining.value -= 1
    if (remaining.value <= 0) {
      stop()
      onExpire()
    }
  }

  function start() {
    if (isRunning.value) return
    remaining.value = durationSeconds
    isRunning.value = true
    intervalId = setInterval(tick, 1000)
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
    remaining.value = durationSeconds
  }

  onUnmounted(stop)

  return { remaining: readonly(remaining), isRunning: readonly(isRunning), start, stop, reset }
}
