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
      eyebrow: "Gotta Catch 'Em All",
      title: 'Explore the Pokémon world.',
      intro: 'Browse a card-style Pokédex or test yourself in an endless silhouette challenge.',
      pokedexDescription: 'Browse richly detailed cards for every supported generation.',
      challengeDescription: 'Guess silhouettes and keep your streak alive.',
    },
    common: {
      generation: 'Generation',
      generationI: 'Generation I (Kanto)',
      generationII: 'Generation II (Johto)',
      generationIII: 'Generation III (Hoenn)',
      allGenerations: 'All Generations',
      search: 'Search',
      type: 'Type',
      allTypes: 'All types',
    },
    pokedex: {
      title: 'Pokédex',
      description: "Search for a pokemon by name or using it's type.",
      searchPlaceholder: 'Search Pokémon',
      loadingPokemon: 'Loading Pokémon...',
      loadingPage: 'Loading page...',
      empty: 'No Pokémon found.',
      soundOn: 'Sound on',
      soundOff: 'Sound off',
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
      reveal: 'Skip',
      next: 'Next Pokémon',
      roundError: 'Unable to load a challenge round right now.',
      initialError: 'Unable to load the challenge right now.',
      generationError: 'Unable to load the selected challenge generation right now.',
      selectGenerations: 'Select Generations',
      selectDifficulty: 'Difficulty',
      casual: 'Casual',
      challenging: 'Challenging',
      casualDescription: 'No time limit. 2 lives.',
      challengingDescription: '30 seconds per Pokémon. 1 life.',
      start: 'Start',
      gameOver: 'Game Over',
      finalScore: 'Score: {score}',
      bestStreak: 'Best Streak: {streak}',
      elapsedTime: 'Time: {time}',
      tryAgain: 'Try Again',
      continue: 'Continue',
      completed: 'Congratulations!',
      completedDescription: 'You beat the game!',
      health: '{count} lives remaining',
      timeUp: "Time's up!",
      leaderboard: {
        title: 'Leaderboard',
        empty: 'No scores yet. Be the first!',
        rank: 'Rank',
        name: 'Name',
        streak: 'STK',
        time: 'Time',
        score: 'SCR',
      },
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
      eyebrow: 'Tangkap Semuanya',
      title: 'Yuk jelajahi dunia Pokémon.',
      intro: 'Lihat-lihat Pokédex bergaya kartu atau uji kemampuanmu di tantangan siluet tanpa akhir.',
      pokedexDescription: 'Lihat kartu lengkap dari tiap generasi yang tersedia.',
      challengeDescription: 'Tebak siluetnya dan jaga streak-mu.',
    },
    common: {
      generation: 'Generasi',
      generationI: 'Generasi I (Kanto)',
      generationII: 'Generasi II (Johto)',
      generationIII: 'Generasi III (Hoenn)',
      allGenerations: 'Semua Generasi',
      search: 'Cari',
      type: 'Tipe',
      allTypes: 'Semua tipe',
    },
    pokedex: {
      title: 'Pokédex',
      description: 'Cari Pokemon berdasarkan nama atau tipenya.',
      searchPlaceholder: 'Cari Pokémon',
      loadingPokemon: 'Sedang memuat Pokémon...',
      loadingPage: 'Sedang memuat halaman...',
      empty: 'Pokémon tidak ditemukan.',
      soundOn: 'Suara aktif',
      soundOff: 'Suara mati',
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
      reveal: 'Lewati',
      next: 'Pokémon Berikutnya',
      roundError: 'Ronde tantangan belum bisa dimuat sekarang.',
      initialError: 'Tantangan belum bisa dimuat sekarang.',
      generationError: 'Generasi tantangan yang dipilih belum bisa dimuat sekarang.',
      selectGenerations: 'Pilih Generasi',
      selectDifficulty: 'Tingkat Kesulitan',
      casual: 'Santai',
      challenging: 'Menantang',
      casualDescription: 'Tanpa batas waktu. 2 nyawa.',
      challengingDescription: '30 detik per Pokémon. 1 nyawa.',
      start: 'Mulai',
      gameOver: 'Game Over',
      finalScore: 'Skor: {score}',
      bestStreak: 'Streak Terbaik: {streak}',
      elapsedTime: 'Waktu: {time}',
      tryAgain: 'Coba Lagi',
      continue: 'Lanjut',
      completed: 'Selamat!',
      completedDescription: 'Kamu menamatkan gamenya!',
      health: '{count} nyawa tersisa',
      timeUp: 'Waktu habis!',
      leaderboard: {
        title: 'Papan Skor',
        empty: 'Belum ada skor. Jadilah yang pertama!',
        rank: 'Peringkat',
        name: 'Nama',
        streak: 'STK',
        time: 'Waktu',
        score: 'SCR',
      },
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
