import { render, screen } from '@testing-library/vue'
import { afterEach, describe, expect, it, vi } from 'vitest'
import type { Pokemon } from '../src/domain/pokemon'
import { pokemonRepository } from '../src/services/pokemonRepository'
import PokedexView from '../src/views/PokedexView.vue'

describe('PokedexView', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('renders the first page before the rest of the generation finishes loading', async () => {
    const catalog = Array.from({ length: 21 }, (_, index) => ({
      id: index + 1,
      name: `pokemon-${index + 1}`,
    }))
    let resolveLastPokemon: ((pokemon: Pokemon) => void) | undefined
    const lastPokemon = new Promise<Pokemon>((resolve) => {
      resolveLastPokemon = resolve
    })

    vi.spyOn(pokemonRepository, 'getGenerationCatalog').mockResolvedValue(catalog)
    vi.spyOn(pokemonRepository, 'getPokemon').mockImplementation((id) => {
      if (id === 21) return lastPokemon
      return Promise.resolve(createPokemon(id))
    })

    render(PokedexView)

    expect(await screen.findByText('#001')).toBeInTheDocument()
    expect(screen.queryByText('#021')).not.toBeInTheDocument()

    resolveLastPokemon?.(createPokemon(21))
  })
})

function createPokemon(id: number): Pokemon {
  return {
    id,
    name: `pokemon-${id}`,
    displayName: `Pokemon ${id}`,
    imageUrl: null,
    cryUrl: null,
    height: 1,
    weight: 1,
    abilities: [],
    types: ['normal'],
    stats: [],
  }
}
