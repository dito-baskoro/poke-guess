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
