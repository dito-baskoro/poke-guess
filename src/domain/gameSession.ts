export type Difficulty = 'casual' | 'challenging'
export type GamePhase = 'setup' | 'playing' | 'gameOver'

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
  }
}

function getMaxHealth(difficulty: Difficulty): number {
  return difficulty === 'casual' ? 2 : 1
}

export function startGame(session: GameSession, config: GameConfig): GameSession {
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
  }
}

export function recordCorrect(session: GameSession): GameSession {
  const newStreak = session.streak + 1
  return {
    ...session,
    score: session.score + 1,
    streak: newStreak,
    bestStreak: Math.max(session.bestStreak, newStreak),
    totalAttempted: session.totalAttempted + 1,
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
