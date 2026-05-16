import { render, screen } from '@testing-library/vue'
import { describe, expect, it } from 'vitest'
import PokemonCard from '../src/components/PokemonCard.vue'

describe('PokemonCard', () => {
  it('renders the rich pokemon summary fields', () => {
    render(PokemonCard, {
      props: {
        pokemon: {
          id: 25,
          name: 'pikachu',
          displayName: 'Pikachu',
          imageUrl: 'https://example.com/pikachu.png',
          types: ['electric'],
          height: 4,
          weight: 60,
          abilities: ['static'],
          stats: [
            { name: 'hp', value: 35 },
            { name: 'attack', value: 55 },
          ],
        },
      },
    })

    expect(screen.getByText('#025')).toBeInTheDocument()
    expect(screen.getByText('Pikachu')).toBeInTheDocument()
    expect(screen.getByText('electric')).toBeInTheDocument()
    expect(screen.getByText('static')).toBeInTheDocument()
    expect(screen.getByText('HP')).toBeInTheDocument()
  })
})
