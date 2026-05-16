import { describe, expect, it } from 'vitest'
import {
  createGameSession,
  startGame,
  recordCorrect,
  endGame,
  resetToSetup,
} from '../src/domain/gameSession'

describe('game session', () => {
  it('starts in setup phase', () => {
    const session = createGameSession()
    expect(session.phase).toBe('setup')
    expect(session.score).toBe(0)
    expect(session.streak).toBe(0)
  })

  it('transitions to playing on startGame', () => {
    const session = createGameSession()
    const playing = startGame(session, { generations: [1, 2], difficulty: 'challenging' })

    expect(playing.phase).toBe('playing')
    expect(playing.config.generations).toEqual([1, 2])
    expect(playing.config.difficulty).toBe('challenging')
    expect(playing.score).toBe(0)
  })

  it('increments score and streak on recordCorrect', () => {
    const session = startGame(createGameSession(), { generations: [1], difficulty: 'casual' })
    const after = recordCorrect(session)

    expect(after.score).toBe(1)
    expect(after.streak).toBe(1)
    expect(after.bestStreak).toBe(1)
    expect(after.totalAttempted).toBe(1)
  })

  it('tracks bestStreak across multiple correct answers', () => {
    let session = startGame(createGameSession(), { generations: [1], difficulty: 'casual' })
    session = recordCorrect(session)
    session = recordCorrect(session)
    session = recordCorrect(session)

    expect(session.streak).toBe(3)
    expect(session.bestStreak).toBe(3)
  })

  it('transitions to gameOver on endGame', () => {
    const session = startGame(createGameSession(), { generations: [1], difficulty: 'casual' })
    const after = recordCorrect(session)
    const gameOver = endGame(after)

    expect(gameOver.phase).toBe('gameOver')
    expect(gameOver.score).toBe(1)
    expect(gameOver.totalAttempted).toBe(2)
  })

  it('resets to setup on resetToSetup', () => {
    let session = startGame(createGameSession(), { generations: [1, 2], difficulty: 'challenging' })
    session = recordCorrect(session)
    session = endGame(session)
    const reset = resetToSetup(session)

    expect(reset.phase).toBe('setup')
    expect(reset.score).toBe(1)
  })
})
