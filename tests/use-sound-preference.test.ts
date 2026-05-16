import { beforeEach, describe, expect, it } from 'vitest'
import { soundEnabled, toggleSound } from '../src/composables/useSoundPreference'

describe('sound preference', () => {
  beforeEach(() => {
    localStorage.clear()
    soundEnabled.value = true
  })

  it('persists the toggled sound state in localStorage', () => {
    toggleSound()

    expect(soundEnabled.value).toBe(false)
    expect(localStorage.getItem('pokedex-sound-enabled')).toBe('false')
  })
})
