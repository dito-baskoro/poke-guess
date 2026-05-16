import { computed, ref } from 'vue'

export type Locale = 'en' | 'id'

const messages = {
  en: {
    nav: {
      pokedex: 'Pokédex',
      challenge: 'Challenge',
      language: 'Language',
    },
    home: {
      title: 'Explore the Pokémon world.',
      intro: 'Browse a card-style Pokédex or test yourself in an endless silhouette challenge.',
      pokedexDescription: 'Browse richly detailed cards for every supported generation.',
      challengeDescription: 'Guess silhouettes and keep your streak alive.',
    },
    common: {
      generationI: 'Generation I',
      generationII: 'Generation II',
      allGenerations: 'All Generations',
      search: 'Search',
      type: 'Type',
      allTypes: 'All types',
    },
    pokedex: {
      title: 'Pokédex',
      description: 'Trading-card-inspired summaries by generation.',
      searchPlaceholder: 'Search Pokémon',
      loadingPokemon: 'Loading Pokémon...',
      loadingPage: 'Loading page...',
      empty: 'No Pokémon found.',
      partialError: 'Some Pokémon could not be loaded right now.',
      pageError: 'Unable to load this Pokédex page right now.',
      initialError: 'Unable to load the Generation I Pokédex right now.',
      generationError: 'Unable to load the selected Pokédex generation right now.',
    },
    challenge: {
      title: 'Who’s That Pokémon?',
      description: 'Type the name, keep the streak alive, and move through endless rounds.',
      loading: 'Loading challenge...',
      correct: 'Correct!',
      incorrect: 'Not quite — try again.',
      prompt: 'Who’s that Pokémon?',
      guessedName: 'It was {name}.',
      streak: 'Streak',
      correctCount: 'Correct',
      attempts: 'Attempts',
      inputPlaceholder: 'Enter Pokémon name',
      guess: 'Guess',
      reveal: 'Reveal / Skip',
      next: 'Next Pokémon',
      roundError: 'Unable to load a challenge round right now.',
      initialError: 'Unable to load the challenge right now.',
      generationError: 'Unable to load the selected challenge generation right now.',
    },
    pagination: {
      previous: 'Previous',
      next: 'Next',
      pageOf: 'Page {current} of {total}',
    },
  },
  id: {
    nav: {
      pokedex: 'Pokédex',
      challenge: 'Tantangan',
      language: 'Bahasa',
    },
    home: {
      title: 'Yuk jelajahi dunia Pokémon.',
      intro: 'Lihat-lihat Pokédex bergaya kartu atau uji kemampuanmu di tantangan siluet tanpa akhir.',
      pokedexDescription: 'Lihat kartu lengkap dari tiap generasi yang tersedia.',
      challengeDescription: 'Tebak siluetnya dan jaga streak-mu.',
    },
    common: {
      generationI: 'Generasi I',
      generationII: 'Generasi II',
      allGenerations: 'Semua Generasi',
      search: 'Cari',
      type: 'Tipe',
      allTypes: 'Semua tipe',
    },
    pokedex: {
      title: 'Pokédex',
      description: 'Ringkasan ala kartu koleksi, dibagi per generasi.',
      searchPlaceholder: 'Cari Pokémon',
      loadingPokemon: 'Sedang memuat Pokémon...',
      loadingPage: 'Sedang memuat halaman...',
      empty: 'Pokémon tidak ditemukan.',
      partialError: 'Beberapa Pokémon belum bisa dimuat sekarang.',
      pageError: 'Halaman Pokédex ini belum bisa dimuat sekarang.',
      initialError: 'Pokédex Generasi I belum bisa dimuat sekarang.',
      generationError: 'Generasi Pokédex yang dipilih belum bisa dimuat sekarang.',
    },
    challenge: {
      title: 'Pokémon Apa Ini?',
      description: 'Ketik namanya, jaga streak-mu, dan lanjutkan ronde tanpa akhir.',
      loading: 'Sedang memuat tantangan...',
      correct: 'Benar!',
      incorrect: 'Belum pas — coba lagi.',
      prompt: 'Pokémon apa ini?',
      guessedName: 'Itu {name}.',
      streak: 'Streak',
      correctCount: 'Benar',
      attempts: 'Percobaan',
      inputPlaceholder: 'Masukkan nama Pokémon',
      guess: 'Tebak',
      reveal: 'Buka / Lewati',
      next: 'Pokémon Berikutnya',
      roundError: 'Ronde tantangan belum bisa dimuat sekarang.',
      initialError: 'Tantangan belum bisa dimuat sekarang.',
      generationError: 'Generasi tantangan yang dipilih belum bisa dimuat sekarang.',
    },
    pagination: {
      previous: 'Sebelumnya',
      next: 'Berikutnya',
      pageOf: 'Halaman {current} dari {total}',
    },
  },
} as const

type MessageSchema = typeof messages.en
type DotNestedKeys<T> = {
  [K in keyof T & string]: T[K] extends string ? K : `${K}.${DotNestedKeys<T[K]>}`
}[keyof T & string]

export type MessageKey = DotNestedKeys<MessageSchema>

export const locale = ref<Locale>('en')

function resolveMessage(targetLocale: Locale, key: MessageKey): string {
  return key.split('.').reduce<unknown>((value, part) => {
    if (typeof value !== 'object' || value === null) return undefined
    return (value as Record<string, unknown>)[part]
  }, messages[targetLocale]) as string
}

export function getMessage(targetLocale: Locale, key: MessageKey): string {
  return resolveMessage(targetLocale, key)
}

export function useI18n() {
  const t = (key: MessageKey, params?: Record<string, string | number>) =>
    Object.entries(params ?? {}).reduce(
      (message, [name, value]) => message.replace(`{${name}}`, String(value)),
      getMessage(locale.value, key),
    )

  return {
    locale,
    t,
    isEnglish: computed(() => locale.value === 'en'),
  }
}
