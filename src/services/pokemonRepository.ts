import {
  normalizePokemon,
  type Pokemon,
  type ApiPokemon,
  type PokemonCatalogEntry,
} from '../domain/pokemon'

interface GenerationResponse {
  pokemon_species: Array<{ name: string; url: string }>
}

const API_BASE = 'https://pokeapi.co/api/v2'
export const SUPPORTED_GENERATIONS = [1, 2, 3] as const

function extractIdFromUrl(url: string): number {
  const match = url.match(/\/(\d+)\/?$/)
  if (!match) throw new Error(`Unable to extract Pokémon id from URL: ${url}`)
  return Number(match[1])
}

export class PokemonRepository {
  private generationCatalogPromises = new Map<number, Promise<PokemonCatalogEntry[]>>()
  private pokemonCache = new Map<number, Promise<Pokemon>>()

  async getGenerationCatalog(generation: number): Promise<PokemonCatalogEntry[]> {
    if (!this.generationCatalogPromises.has(generation)) {
      const catalogPromise = fetch(`${API_BASE}/generation/${generation}`)
        .then(async (response) => {
          if (!response.ok) throw new Error(`Failed to load generation ${generation} catalog`)
          return (await response.json()) as GenerationResponse
        })
        .then((data) =>
          data.pokemon_species
            .map((species) => ({
              id: extractIdFromUrl(species.url),
              name: species.name,
            }))
            .sort((left, right) => left.id - right.id),
        )
        .catch((error) => {
          this.generationCatalogPromises.delete(generation)
          throw error
        })

      this.generationCatalogPromises.set(generation, catalogPromise)
    }

    return this.generationCatalogPromises.get(generation)!
  }

  async getAllSupportedCatalog(): Promise<PokemonCatalogEntry[]> {
    return this.getMultiGenerationCatalog([...SUPPORTED_GENERATIONS])
  }

  async getMultiGenerationCatalog(generations: number[]): Promise<PokemonCatalogEntry[]> {
    const catalogs = await Promise.all(
      generations.map((generation) => this.getGenerationCatalog(generation)),
    )
    return catalogs.flat().sort((left, right) => left.id - right.id)
  }

  async getGen1Catalog(): Promise<PokemonCatalogEntry[]> {
    return this.getGenerationCatalog(1)
  }

  async getGen1Ids(): Promise<number[]> {
    const catalog = await this.getGen1Catalog()
    return catalog.map((entry) => entry.id)
  }

  async getPokemon(id: number): Promise<Pokemon> {
    if (!this.pokemonCache.has(id)) {
      const pokemonPromise = fetch(`${API_BASE}/pokemon/${id}`)
        .then(async (response) => {
          if (!response.ok) throw new Error(`Failed to load Pokémon ${id}`)
          return (await response.json()) as ApiPokemon
        })
        .then(normalizePokemon)
        .catch((error) => {
          this.pokemonCache.delete(id)
          throw error
        })

      this.pokemonCache.set(id, pokemonPromise)
    }

    return this.pokemonCache.get(id)!
  }
}

export const pokemonRepository = new PokemonRepository()
