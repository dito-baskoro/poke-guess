import { describe, expect, it } from 'vitest'
import { getMessage } from '../src/i18n'

describe('i18n messages', () => {
  it('returns english messages', () => {
    expect(getMessage('en', 'nav.challenge')).toBe('Challenge')
  })

  it('returns indonesian messages', () => {
    expect(getMessage('id', 'nav.challenge')).toBe('Tantangan')
  })

  it('returns localized eyebrow copy', () => {
    expect(getMessage('en', 'home.eyebrow')).toBe("Gotta Catch 'Em All")
    expect(getMessage('id', 'home.eyebrow')).toBe('Tangkap Semuanya')
  })

  it('returns localized pokedex description copy', () => {
    expect(getMessage('en', 'pokedex.description')).toBe(
      "Search for a pokemon by name or using it's type.",
    )
    expect(getMessage('id', 'pokedex.description')).toBe(
      'Cari Pokemon berdasarkan nama atau tipenya.',
    )
  })

  it('returns localized challenge completion copy', () => {
    expect(getMessage('en', 'challenge.completed')).toBe('Congratulations!')
    expect(getMessage('en', 'challenge.completedDescription')).toBe('You beat the game!')
    expect(getMessage('id', 'challenge.completed')).toBe('Selamat!')
    expect(getMessage('id', 'challenge.completedDescription')).toBe('Kamu menamatkan gamenya!')
  })

  it('returns localized challenge elapsed-time copy', () => {
    expect(getMessage('en', 'challenge.elapsedTime')).toBe('Time: {time}')
    expect(getMessage('id', 'challenge.elapsedTime')).toBe('Waktu: {time}')
  })

  it('returns localized skip copy', () => {
    expect(getMessage('en', 'challenge.reveal')).toBe('Skip')
    expect(getMessage('id', 'challenge.reveal')).toBe('Lewati')
  })

  it('returns localized generation labels with regions', () => {
    expect(getMessage('en', 'common.generationI')).toBe('Generation I (Kanto)')
    expect(getMessage('en', 'common.generationII')).toBe('Generation II (Johto)')
    expect(getMessage('en', 'common.generationIII')).toBe('Generation III (Hoenn)')
    expect(getMessage('id', 'common.generationI')).toBe('Generasi I (Kanto)')
    expect(getMessage('id', 'common.generationII')).toBe('Generasi II (Johto)')
    expect(getMessage('id', 'common.generationIII')).toBe('Generasi III (Hoenn)')
  })

  it('returns localized sound toggle copy', () => {
    expect(getMessage('en', 'pokedex.soundOn')).toBe('Sound on')
    expect(getMessage('en', 'pokedex.soundOff')).toBe('Sound off')
    expect(getMessage('id', 'pokedex.soundOn')).toBe('Suara aktif')
    expect(getMessage('id', 'pokedex.soundOff')).toBe('Suara mati')
  })
})
