import { describe, expect, it } from 'vitest'
import { pickNextPokemonId } from '../src/domain/challenge'

describe('challenge helpers', () => {
  it('avoids immediately repeating the previous pokemon when alternatives exist', () => {
    const ids = [1, 2, 3]
    const next = pickNextPokemonId(ids, 2, () => 0.5)

    expect(next).not.toBe(2)
  })
})
