import { describe, expect, it } from 'vitest'
import {
  beginNextRound,
  createChallengeState,
  submitGuess,
  revealCurrentPokemon,
} from '../src/domain/challengeState'

describe('challenge state', () => {
  it('increments streak and score on a correct guess', () => {
    const state = createChallengeState(25)
    const nextState = submitGuess(state, 'Pikachu', 'pikachu')

    expect(nextState).toMatchObject({
      currentId: 25,
      result: 'correct',
      streak: 1,
      totalCorrect: 1,
      totalAttempted: 1,
      isRevealed: true,
    })
  })

  it('keeps the round active after an incorrect guess', () => {
    const state = createChallengeState(25)
    const nextState = submitGuess(state, 'Raichu', 'pikachu')

    expect(nextState).toMatchObject({
      result: 'incorrect',
      streak: 0,
      totalCorrect: 0,
      totalAttempted: 1,
      isRevealed: false,
    })
  })

  it('resets streak and reveals the answer when skipped', () => {
    const state = {
      ...createChallengeState(25),
      streak: 3,
    }

    expect(revealCurrentPokemon(state)).toMatchObject({
      streak: 0,
      result: 'revealed',
      isRevealed: true,
    })
  })

  it('keeps session totals when starting the next round', () => {
    const state = {
      ...createChallengeState(25),
      streak: 2,
      totalCorrect: 4,
      totalAttempted: 6,
      result: 'correct' as const,
      isRevealed: true,
    }

    expect(beginNextRound(state, 26)).toEqual({
      currentId: 26,
      result: 'idle',
      streak: 2,
      totalCorrect: 4,
      totalAttempted: 6,
      isRevealed: false,
    })
  })
})
