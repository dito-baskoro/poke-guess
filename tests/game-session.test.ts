import { describe, expect, it } from 'vitest'
import {
  createGameSession,
  startGame,
  recordCorrect,
  completeGame,
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
    const playing = startGame(
      session,
      { generations: [1, 2], difficulty: 'challenging' },
      [1, 2, 3],
    )

    expect(playing.phase).toBe('playing')
    expect(playing.config.generations).toEqual([1, 2])
    expect(playing.config.difficulty).toBe('challenging')
    expect(playing.score).toBe(0)
    expect(playing.remainingPokemonIds).toEqual([1, 2, 3])
  })

  it('increments score and streak on recordCorrect', () => {
    const session = startGame(
      createGameSession(),
      { generations: [1], difficulty: 'casual' },
      [25, 26],
    )
    const after = recordCorrect(session, 25)

    expect(after.score).toBe(1)
    expect(after.streak).toBe(1)
    expect(after.bestStreak).toBe(1)
    expect(after.totalAttempted).toBe(1)
    expect(after.remainingPokemonIds).toEqual([26])
  })

  it('tracks bestStreak across multiple correct answers', () => {
    let session = startGame(
      createGameSession(),
      { generations: [1], difficulty: 'casual' },
      [1, 2, 3, 4],
    )
    session = recordCorrect(session, 1)
    session = recordCorrect(session, 2)
    session = recordCorrect(session, 3)

    expect(session.streak).toBe(3)
    expect(session.bestStreak).toBe(3)
  })

  it('keeps the final correct answer in playing phase until the game is completed', () => {
    const session = startGame(
      createGameSession(),
      { generations: [1], difficulty: 'casual' },
      [151],
    )
    const finalReveal = recordCorrect(session, 151)

    expect(finalReveal.phase).toBe('playing')
    expect(finalReveal.score).toBe(1)
    expect(finalReveal.bestStreak).toBe(1)
    expect(finalReveal.remainingPokemonIds).toEqual([])
  })

  it('transitions to completed when a finished run is finalized', () => {
    const session = startGame(
      createGameSession(),
      { generations: [1], difficulty: 'casual' },
      [151],
    )
    const finalReveal = recordCorrect(session, 151)
    const completed = completeGame(finalReveal)

    expect(completed.phase).toBe('completed')
  })

  it('transitions to gameOver on endGame', () => {
    const session = startGame(
      createGameSession(),
      { generations: [1], difficulty: 'casual' },
      [1, 2],
    )
    const after = recordCorrect(session, 1)
    const gameOver = endGame(after)

    expect(gameOver.phase).toBe('gameOver')
    expect(gameOver.score).toBe(1)
    expect(gameOver.totalAttempted).toBe(2)
  })

  it('resets to setup on resetToSetup', () => {
    let session = startGame(
      createGameSession(),
      { generations: [1, 2], difficulty: 'challenging' },
      [1, 2],
    )
    session = recordCorrect(session, 1)
    session = endGame(session)
    const reset = resetToSetup(session)

    expect(reset.phase).toBe('setup')
    expect(reset.score).toBe(1)
  })
})
