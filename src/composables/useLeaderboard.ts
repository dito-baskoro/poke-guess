import { computed, ref } from 'vue'

const STORAGE_KEY = 'pokedex-challenge-leaderboard'
const MAX_ENTRIES = 5

export interface LeaderboardEntry {
  id: string
  name: string
  score: number
  streak: number
  timeSeconds: number
  createdAt: number
}

function readStoredEntries(): LeaderboardEntry[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed.filter(isLeaderboardEntry)
  } catch {
    return []
  }
}

function isLeaderboardEntry(value: unknown): value is LeaderboardEntry {
  if (typeof value !== 'object' || value === null) return false
  const candidate = value as Record<string, unknown>
  return (
    typeof candidate.id === 'string' &&
    typeof candidate.name === 'string' &&
    typeof candidate.score === 'number' &&
    typeof candidate.streak === 'number' &&
    typeof candidate.timeSeconds === 'number' &&
    typeof candidate.createdAt === 'number'
  )
}

function compareEntries(a: LeaderboardEntry, b: LeaderboardEntry): number {
  if (b.streak !== a.streak) return b.streak - a.streak
  if (b.score !== a.score) return b.score - a.score
  return a.timeSeconds - b.timeSeconds
}

const entries = ref<LeaderboardEntry[]>(readStoredEntries())

function persist() {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(entries.value))
}

function createId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID()
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
}

export function useLeaderboard() {
  const topEntries = computed(() =>
    [...entries.value].sort(compareEntries).slice(0, MAX_ENTRIES),
  )

  function recordEntry(input: { name: string; score: number; streak: number; timeSeconds: number }) {
    const entry: LeaderboardEntry = {
      id: createId(),
      name: input.name,
      score: input.score,
      streak: input.streak,
      timeSeconds: input.timeSeconds,
      createdAt: Date.now(),
    }
    entries.value = [...entries.value, entry].sort(compareEntries).slice(0, MAX_ENTRIES)
    persist()
    return entry
  }

  return { topEntries, recordEntry }
}
