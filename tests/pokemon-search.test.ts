import { describe, expect, it } from 'vitest'
import { filterCatalog } from '../src/domain/pokemon'

describe('pokemon search', () => {
  it('filters catalog entries by normalized name', () => {
    const catalog = [
      { id: 1, name: 'bulbasaur' },
      { id: 25, name: 'pikachu' },
      { id: 122, name: 'mr-mime' },
    ]

    expect(filterCatalog(catalog, ' mr mime ')).toEqual([{ id: 122, name: 'mr-mime' }])
  })
})
