import { describe, expect, it } from 'vitest'
import {
  isCorrectPokemonGuess,
  normalizePokemon,
  paginatePokemon,
  normalizeGuess,
} from '../src/domain/pokemon'

describe('pokemon domain utilities', () => {
  it('normalizes a PokeAPI pokemon response into the app model', () => {
    const pokemon = normalizePokemon({
      id: 25,
      name: 'pikachu',
      height: 4,
      weight: 60,
      abilities: [{ ability: { name: 'static' } }],
      types: [{ type: { name: 'electric' } }],
      stats: [
        { base_stat: 35, stat: { name: 'hp' } },
        { base_stat: 55, stat: { name: 'attack' } },
      ],
      sprites: {
        other: {
          'official-artwork': {
            front_default: 'https://example.com/pikachu.png',
          },
        },
      },
      cries: {
        latest: 'https://example.com/pikachu.ogg',
      },
    })

    expect(pokemon).toEqual({
      id: 25,
      name: 'pikachu',
      displayName: 'Pikachu',
      imageUrl: 'https://example.com/pikachu.png',
      cryUrl: 'https://example.com/pikachu.ogg',
      height: 4,
      weight: 60,
      abilities: ['static'],
      types: ['electric'],
      stats: [
        { name: 'hp', value: 35 },
        { name: 'attack', value: 55 },
      ],
    })
  })

  it('returns the final partial page when paginating 151 pokemon by 10', () => {
    const ids = Array.from({ length: 151 }, (_, index) => index + 1)

    expect(paginatePokemon(ids, 16, 10)).toEqual([151])
  })

  it('normalizes guesses for case, whitespace, and punctuation', () => {
    expect(normalizeGuess(' Mr. Mime ')).toBe('mrmime')
  })

  it('compares pokemon names and answers after trimming whitespace', () => {
    expect(isCorrectPokemonGuess('  Pikachu  ', ' pikachu ')).toBe(true)
  })
})
