import { fireEvent, render, screen } from '@testing-library/vue'
import { afterEach, describe, expect, it, vi } from 'vitest'
import PokemonCard from '../src/components/PokemonCard.vue'
import { soundEnabled } from '../src/composables/useSoundPreference'

describe('PokemonCard', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
    soundEnabled.value = true
  })

  it('renders the rich pokemon summary fields', () => {
    render(PokemonCard, {
      props: {
        pokemon: {
          id: 25,
          name: 'pikachu',
          displayName: 'Pikachu',
          imageUrl: 'https://example.com/pikachu.png',
          cryUrl: null,
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
          cryUrl: null,
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
          cryUrl: null,
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
          cryUrl: null,
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
          cryUrl: null,
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
          cryUrl: null,
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

  it('plays the latest cry only the first time a compact card is opened', async () => {
    const play = vi.fn().mockResolvedValue(undefined)
    const audio = { play, volume: 1 }
    const AudioMock = vi.fn().mockImplementation(() => audio)
    vi.stubGlobal('Audio', AudioMock)

    const { container, rerender } = render(PokemonCard, {
      props: {
        compact: true,
        open: false,
        pokemon: {
          id: 25,
          name: 'pikachu',
          displayName: 'Pikachu',
          imageUrl: 'https://example.com/pikachu.png',
          cryUrl: 'https://example.com/pikachu.ogg',
          types: ['electric'],
          height: 4,
          weight: 60,
          abilities: ['static'],
          stats: [{ name: 'hp', value: 35 }],
        },
      },
    })

    await rerender({ open: true })
    await rerender({ open: false })
    await rerender({ open: true })

    expect(AudioMock).toHaveBeenCalledTimes(1)
    expect(AudioMock).toHaveBeenCalledWith('https://example.com/pikachu.ogg')
    expect(audio.volume).toBe(0.5)
    expect(play).toHaveBeenCalledTimes(1)
    expect(container.querySelector('.pokemon-card')).toBeInTheDocument()
  })

  it('does not play cries while sound is disabled', async () => {
    const play = vi.fn().mockResolvedValue(undefined)
    const AudioMock = vi.fn().mockImplementation(() => ({ play, volume: 1 }))
    vi.stubGlobal('Audio', AudioMock)
    soundEnabled.value = false

    const { rerender } = render(PokemonCard, {
      props: {
        compact: true,
        open: false,
        pokemon: {
          id: 25,
          name: 'pikachu',
          displayName: 'Pikachu',
          imageUrl: 'https://example.com/pikachu.png',
          cryUrl: 'https://example.com/pikachu.ogg',
          types: ['electric'],
          height: 4,
          weight: 60,
          abilities: ['static'],
          stats: [{ name: 'hp', value: 35 }],
        },
      },
    })

    await rerender({ open: true })

    expect(AudioMock).not.toHaveBeenCalled()
    expect(play).not.toHaveBeenCalled()
  })
})
