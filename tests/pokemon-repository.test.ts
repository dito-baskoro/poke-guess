import { beforeEach, describe, expect, it, vi } from 'vitest'
import { PokemonRepository } from '../src/services/pokemonRepository'

describe('PokemonRepository', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('loads a generation catalog with ids and names sorted numerically', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          pokemon_species: [
            { name: 'bulbasaur', url: 'https://pokeapi.co/api/v2/pokemon-species/1/' },
            { name: 'mew', url: 'https://pokeapi.co/api/v2/pokemon-species/151/' },
            { name: 'ivysaur', url: 'https://pokeapi.co/api/v2/pokemon-species/2/' },
          ],
        }),
      }),
    )

    const repository = new PokemonRepository()

    await expect(repository.getGenerationCatalog(1)).resolves.toEqual([
      { id: 1, name: 'bulbasaur' },
      { id: 2, name: 'ivysaur' },
      { id: 151, name: 'mew' },
    ])
  })

  it('combines supported generations for the all-generations catalog', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          pokemon_species: [
            { name: 'bulbasaur', url: 'https://pokeapi.co/api/v2/pokemon-species/1/' },
          ],
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          pokemon_species: [
            { name: 'chikorita', url: 'https://pokeapi.co/api/v2/pokemon-species/152/' },
          ],
        }),
      })
    vi.stubGlobal('fetch', fetchMock)

    const repository = new PokemonRepository()

    await expect(repository.getAllSupportedCatalog()).resolves.toEqual([
      { id: 1, name: 'bulbasaur' },
      { id: 152, name: 'chikorita' },
    ])
  })

  it('caches detailed pokemon records after the first fetch', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        id: 25,
        name: 'pikachu',
        height: 4,
        weight: 60,
        abilities: [],
        types: [],
        stats: [],
        sprites: { other: { 'official-artwork': { front_default: null } } },
      }),
    })
    vi.stubGlobal('fetch', fetchMock)

    const repository = new PokemonRepository()
    await repository.getPokemon(25)
    await repository.getPokemon(25)

    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it('allows retrying a failed pokemon fetch', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({ ok: false })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          id: 1,
          name: 'bulbasaur',
          height: 7,
          weight: 69,
          abilities: [],
          types: [],
          stats: [],
          sprites: { other: { 'official-artwork': { front_default: null } } },
        }),
      })
    vi.stubGlobal('fetch', fetchMock)

    const repository = new PokemonRepository()
    await expect(repository.getPokemon(1)).rejects.toThrow()
    await expect(repository.getPokemon(1)).resolves.toMatchObject({ id: 1 })
  })
})
