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
})
