export interface ApiPokemon {
  id: number
  name: string
  height: number
  weight: number
  abilities: Array<{ ability: { name: string } }>
  types: Array<{ type: { name: string } }>
  stats: Array<{ base_stat: number; stat: { name: string } }>
  sprites: {
    other?: {
      'official-artwork'?: {
        front_default?: string | null
      }
    }
  }
}

export interface PokemonStat {
  name: string
  value: number
}

export interface Pokemon {
  id: number
  name: string
  displayName: string
  imageUrl: string | null
  height: number
  weight: number
  abilities: string[]
  types: string[]
  stats: PokemonStat[]
}

export interface PokemonCatalogEntry {
  id: number
  name: string
}

export function toDisplayName(name: string): string {
  return name
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

export function normalizePokemon(input: ApiPokemon): Pokemon {
  return {
    id: input.id,
    name: input.name,
    displayName: toDisplayName(input.name),
    imageUrl: input.sprites.other?.['official-artwork']?.front_default ?? null,
    height: input.height,
    weight: input.weight,
    abilities: input.abilities.map((entry) => entry.ability.name),
    types: input.types.map((entry) => entry.type.name),
    stats: input.stats.map((entry) => ({
      name: entry.stat.name,
      value: entry.base_stat,
    })),
  }
}

export function paginatePokemon<T>(items: T[], page: number, pageSize: number): T[] {
  const start = (page - 1) * pageSize
  return items.slice(start, start + pageSize)
}

export function normalizeGuess(value: string): string {
  return value.trim().toLowerCase().replace(/[^a-z0-9]/g, '')
}

export function isCorrectPokemonGuess(guess: string, answer: string): boolean {
  return normalizeGuess(guess) === normalizeGuess(answer)
}

export function filterCatalog(
  catalog: PokemonCatalogEntry[],
  query: string,
): PokemonCatalogEntry[] {
  const normalizedQuery = normalizeGuess(query)
  if (!normalizedQuery) return catalog

  return catalog.filter((entry) => normalizeGuess(entry.name).includes(normalizedQuery))
}

export function filterPokemonByType(pokemon: Pokemon[], selectedType: string): Pokemon[] {
  if (selectedType === 'all') return pokemon
  return pokemon.filter((entry) => entry.types.includes(selectedType))
}
