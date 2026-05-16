export type Difficulty = 'casual' | 'challenging'
export type GamePhase = 'setup' | 'playing' | 'completed' | 'gameOver'

export interface GameConfig {
  generations: number[]
  difficulty: Difficulty
}

export interface GameSession {
  phase: GamePhase
  config: GameConfig
  score: number
  streak: number
  bestStreak: number
  totalAttempted: number
  health: number
  maxHealth: number
  remainingPokemonIds: number[]
}

export function createGameSession(): GameSession {
  return {
    phase: 'setup',
    config: { generations: [1], difficulty: 'casual' },
    score: 0,
    streak: 0,
    bestStreak: 0,
    totalAttempted: 0,
    health: 2,
    maxHealth: 2,
    remainingPokemonIds: [],
  }
}

function getMaxHealth(difficulty: Difficulty): number {
  return difficulty === 'casual' ? 2 : 1
}

export function startGame(
  session: GameSession,
  config: GameConfig,
  pokemonIds: number[] = [],
): GameSession {
  const maxHealth = getMaxHealth(config.difficulty)
  return {
    phase: 'playing',
    config,
    score: 0,
    streak: 0,
    bestStreak: 0,
    totalAttempted: 0,
    health: maxHealth,
    maxHealth,
    remainingPokemonIds: [...pokemonIds],
  }
}

export function recordCorrect(session: GameSession, pokemonId?: number): GameSession {
  const newStreak = session.streak + 1
  const remainingPokemonIds =
    pokemonId === undefined
      ? session.remainingPokemonIds
      : session.remainingPokemonIds.filter((id) => id !== pokemonId)

  return {
    ...session,
    score: session.score + 1,
    streak: newStreak,
    bestStreak: Math.max(session.bestStreak, newStreak),
    totalAttempted: session.totalAttempted + 1,
    remainingPokemonIds,
  }
}

export function completeGame(session: GameSession): GameSession {
  return {
    ...session,
    phase: 'completed',
  }
}

export function recordWrong(session: GameSession): GameSession {
  const newHealth = session.health - 1
  if (newHealth <= 0) {
    return {
      ...session,
      phase: 'gameOver',
      health: 0,
      streak: 0,
      totalAttempted: session.totalAttempted + 1,
    }
  }
  return {
    ...session,
    health: newHealth,
    streak: 0,
    totalAttempted: session.totalAttempted + 1,
  }
}

export function endGame(session: GameSession): GameSession {
  return {
    ...session,
    phase: 'gameOver',
    totalAttempted: session.totalAttempted + 1,
  }
}

export function resetToSetup(session: GameSession): GameSession {
  return {
    ...session,
    phase: 'setup',
  }
}
