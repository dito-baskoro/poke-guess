import { mount, flushPromises } from '@vue/test-utils'
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'
import ChallengeView from '../src/views/ChallengeView.vue'

vi.mock('../src/services/pokemonRepository', () => ({
  SUPPORTED_GENERATIONS: [1],
  pokemonRepository: {
    getMultiGenerationCatalog: vi.fn().mockResolvedValue([{ id: 25 }]),
    getPokemon: vi.fn().mockResolvedValue({
      id: 25,
      name: 'pikachu',
      displayName: 'Pikachu',
      imageUrl: '/pikachu.png',
      types: ['electric'],
    }),
  },
}))

describe('ChallengeView elapsed time', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  async function startRun(difficulty: 'casual' | 'challenging') {
    const wrapper = mount(ChallengeView)
    await wrapper.get('[data-mode="silhouette"]').trigger('click')
    await wrapper.find(`input[value="${difficulty}"]`).setValue()
    await wrapper.get('button.start-button').trigger('click')
    await flushPromises()
    return wrapper
  }

  it('shows elapsed time during challenging runs only', async () => {
    const challenging = await startRun('challenging')
    vi.advanceTimersByTime(3000)
    await challenging.vm.$nextTick()
    expect(challenging.text()).toContain('Time: 00:03')

    const casual = await startRun('casual')
    expect(casual.text()).not.toContain('Time:')
  })

  it('shows the frozen final time on game over', async () => {
    const wrapper = await startRun('challenging')
    vi.advanceTimersByTime(4000)
    await wrapper.find('input[type="text"]').setValue('wrong')
    await wrapper.find('form.guess-form').trigger('submit')
    await wrapper.vm.$nextTick()
    await wrapper.find('input[type="text"]').setValue('wrong')
    await wrapper.find('form.guess-form').trigger('submit')
    await wrapper.vm.$nextTick()

    expect(wrapper.text()).toContain('Game Over')
    expect(wrapper.text()).toContain('Time: 00:04')
  })

  it('shows the frozen final time on completion', async () => {
    const wrapper = await startRun('challenging')
    vi.advanceTimersByTime(5000)
    await wrapper.find('input[type="text"]').setValue('pikachu')
    await wrapper.find('form.guess-form').trigger('submit')
    await wrapper.find('form').trigger('submit')
    await wrapper.vm.$nextTick()

    expect(wrapper.text()).toContain('Congratulations!')
    expect(wrapper.text()).toContain('Time: 00:05')
  })
})

describe('ChallengeView scramble mode', () => {
  it('hides difficulty selector and shows type chip + scrambled letters', async () => {
    const wrapper = mount(ChallengeView)
    await wrapper.get('[data-mode="scramble"]').trigger('click')

    expect(wrapper.find('fieldset.difficulty-picker').exists()).toBe(false)
    expect(wrapper.find('fieldset.generation-picker').exists()).toBe(true)

    await wrapper.get('button.start-button').trigger('click')
    await flushPromises()

    expect(wrapper.find('.scramble-frame').exists()).toBe(true)
    expect(wrapper.find('.silhouette-frame').exists()).toBe(false)
    expect(wrapper.find('.type-chip').text()).toBe('electric')
    expect(wrapper.findAll('.scramble-letter')).toHaveLength('pikachu'.length)
    expect(wrapper.find('.challenge-stage').classes()).not.toContain('has-leaderboard')
  })

  it('accepts the correct unscrambled name', async () => {
    const wrapper = mount(ChallengeView)
    await wrapper.get('[data-mode="scramble"]').trigger('click')
    await wrapper.get('button.start-button').trigger('click')
    await flushPromises()

    await wrapper.find('input[type="text"]').setValue('pikachu')
    await wrapper.find('form.guess-form').trigger('submit')
    await wrapper.vm.$nextTick()

    expect(wrapper.text()).toContain('Pikachu')
  })
})
