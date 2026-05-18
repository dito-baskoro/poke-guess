import { describe, expect, it } from 'vitest'
import { scrambleName } from '../src/domain/scramble'

function seeded(values: number[]): () => number {
  let i = 0
  return () => values[i++ % values.length]
}

describe('scrambleName', () => {
  it('returns the same letters as the input (multiset equality)', () => {
    const name = 'pikachu'
    const scrambled = scrambleName(name, seeded([0.1, 0.4, 0.2, 0.8, 0.6, 0.3]))
    expect([...scrambled].sort().join('')).toBe([...name].sort().join(''))
  })

  it('produces a string different from the input for multi-letter names', () => {
    const name = 'bulbasaur'
    for (let i = 0; i < 50; i++) {
      const scrambled = scrambleName(name)
      expect(scrambled).not.toBe(name)
      expect(scrambled).toHaveLength(name.length)
    }
  })

  it('returns single-letter names unchanged', () => {
    expect(scrambleName('a')).toBe('a')
  })

  it('returns empty string unchanged', () => {
    expect(scrambleName('')).toBe('')
  })

  it('is deterministic with a seeded rng', () => {
    const seed1 = () => 0.5
    const a = scrambleName('charmander', seed1)
    const b = scrambleName('charmander', seed1)
    expect(a).toBe(b)
  })

  it('forces a swap when the shuffle happens to match the input', () => {
    const rng = () => 0
    const scrambled = scrambleName('abc', rng)
    expect(scrambled).not.toBe('abc')
    expect([...scrambled].sort().join('')).toBe('abc')
  })
})
