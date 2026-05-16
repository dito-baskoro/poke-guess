import { ref } from 'vue'

const STORAGE_KEY = 'pokedex-sound-enabled'

function readStoredPreference(): boolean {
  if (typeof window === 'undefined') return true
  const stored = window.localStorage.getItem(STORAGE_KEY)
  return stored === null ? true : stored === 'true'
}

export const soundEnabled = ref(readStoredPreference())

export function toggleSound() {
  soundEnabled.value = !soundEnabled.value
  window.localStorage.setItem(STORAGE_KEY, String(soundEnabled.value))
}
