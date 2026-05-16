import { describe, expect, it } from 'vitest'
import { filterPokemonByType, type Pokemon } from '../src/domain/pokemon'

describe('pokemon type filter', () => {
  it('keeps all pokemon when no type is selected', () => {
    const pokemon = [
      createPokemon(1, ['grass', 'poison']),
      createPokemon(25, ['electric']),
    ]

    expect(filterPokemonByType(pokemon, 'all')).toEqual(pokemon)
  })

  it('filters pokemon by selected type', () => {
    const pokemon = [
      createPokemon(1, ['grass', 'poison']),
      createPokemon(25, ['electric']),
    ]

    expect(filterPokemonByType(pokemon, 'electric')).toEqual([pokemon[1]])
  })
})

function createPokemon(id: number, types: string[]): Pokemon {
  return {
    id,
    name: `pokemon-${id}`,
    displayName: `Pokemon ${id}`,
    imageUrl: null,
    height: 1,
    weight: 1,
    abilities: [],
    types,
    stats: [],
  }
}
