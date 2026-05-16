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

  it('exposes type-driven hooks and stat bars', () => {
    const { container, getByText } = render(PokemonCard, {
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
          stats: [{ name: 'hp', value: 35 }],
        },
      },
    })

    expect(container.querySelector<HTMLElement>('.pokemon-card')).toHaveAttribute(
      'data-primary-type',
      'electric',
    )
    expect(getByText('electric')).toHaveAttribute('data-type', 'electric')
    expect(container.querySelector<HTMLElement>('.stat-bar-fill')).toHaveStyle({
      width: `${(35 / 255) * 100}%`,
    })
    expect(getByText('35')).toBeInTheDocument()
  })

  it('formats special attack as SP. ATK', () => {
    render(PokemonCard, {
      props: {
        pokemon: {
          id: 59,
          name: 'arcanine',
          displayName: 'Arcanine',
          imageUrl: 'https://example.com/arcanine.png',
          types: ['fire'],
          height: 19,
          weight: 1550,
          abilities: ['intimidate'],
          stats: [{ name: 'special-attack', value: 100 }],
        },
      },
    })

    expect(screen.getByText('SP. ATK')).toBeInTheDocument()
  })

  it('formats special defense as SP. DEF', () => {
    render(PokemonCard, {
      props: {
        pokemon: {
          id: 65,
          name: 'alakazam',
          displayName: 'Alakazam',
          imageUrl: 'https://example.com/alakazam.png',
          types: ['psychic'],
          height: 15,
          weight: 480,
          abilities: ['synchronize'],
          stats: [{ name: 'special-defense', value: 95 }],
        },
      },
    })

    expect(screen.getByText('SP. DEF')).toBeInTheDocument()
  })

  it('marks compact cards for the pokedex variant', () => {
    const { container } = render(PokemonCard, {
      props: {
        compact: true,
        pokemon: {
          id: 1,
          name: 'bulbasaur',
          displayName: 'Bulbasaur',
          imageUrl: 'https://example.com/bulbasaur.png',
          types: ['grass', 'poison'],
          height: 7,
          weight: 69,
          abilities: ['overgrow'],
          stats: [{ name: 'hp', value: 45 }],
        },
      },
    })

    expect(container.querySelector<HTMLElement>('.pokemon-card')).toHaveClass('is-compact')
  })

  it('shows a pokeball loader when artwork is unavailable', () => {
    const { container, queryByText } = render(PokemonCard, {
      props: {
        pokemon: {
          id: 132,
          name: 'ditto',
          displayName: 'Ditto',
          imageUrl: '',
          types: ['normal'],
          height: 3,
          weight: 40,
          abilities: ['limber'],
          stats: [{ name: 'hp', value: 48 }],
        },
      },
    })

    expect(queryByText('No artwork')).not.toBeInTheDocument()
    expect(container.querySelector('.pokeball-loader')).toBeInTheDocument()
  })
})
