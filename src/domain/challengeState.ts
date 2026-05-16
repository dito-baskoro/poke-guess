import { normalizeGuess } from './pokemon'

export type ChallengeResult = 'idle' | 'correct' | 'incorrect' | 'revealed'

export interface ChallengeState {
  currentId: number
  result: ChallengeResult
  streak: number
  totalCorrect: number
  totalAttempted: number
  isRevealed: boolean
}

export function createChallengeState(currentId: number): ChallengeState {
  return {
    currentId,
    result: 'idle',
    streak: 0,
    totalCorrect: 0,
    totalAttempted: 0,
    isRevealed: false,
  }
}

export function submitGuess(
  state: ChallengeState,
  guess: string,
  answer: string,
): ChallengeState {
  const isCorrect = normalizeGuess(guess) === normalizeGuess(answer)

  return {
    ...state,
    result: isCorrect ? 'correct' : 'incorrect',
    streak: isCorrect ? state.streak + 1 : 0,
    totalCorrect: isCorrect ? state.totalCorrect + 1 : state.totalCorrect,
    totalAttempted: state.totalAttempted + 1,
    isRevealed: isCorrect,
  }
}

export function revealCurrentPokemon(state: ChallengeState): ChallengeState {
  return {
    ...state,
    result: 'revealed',
    streak: 0,
    isRevealed: true,
  }
}

export function beginNextRound(state: ChallengeState, currentId: number): ChallengeState {
  return {
    ...state,
    currentId,
    result: 'idle',
    isRevealed: false,
  }
}
