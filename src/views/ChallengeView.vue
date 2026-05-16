<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { pickNextPokemonId } from '../domain/challenge'
import {
  beginNextRound,
  createChallengeState,
  revealCurrentPokemon,
  submitGuess,
  type ChallengeState,
} from '../domain/challengeState'
import type { Pokemon } from '../domain/pokemon'
import { pokemonRepository } from '../services/pokemonRepository'
import { useI18n } from '../i18n'

const ids = ref<number[]>([])
const generation = ref<'1' | '2' | 'all'>('1')
const pokemon = ref<Pokemon | null>(null)
const state = ref<ChallengeState | null>(null)
const guess = ref('')
const isLoading = ref(true)
const error = ref<string | null>(null)
const { t } = useI18n()

const feedback = computed(() => {
  if (!state.value) return ''
  if (state.value.result === 'correct') return t('challenge.correct')
  if (state.value.result === 'incorrect') return t('challenge.incorrect')
  if (state.value.result === 'revealed') {
    return t('challenge.guessedName', { name: pokemon.value?.displayName ?? '' })
  }
  return t('challenge.prompt')
})

async function loadRound(previousId: number | null = null) {
  isLoading.value = true
  error.value = null
  try {
    const nextId = pickNextPokemonId(ids.value, previousId)
    pokemon.value = await pokemonRepository.getPokemon(nextId)
    state.value = state.value ? beginNextRound(state.value, nextId) : createChallengeState(nextId)
    guess.value = ''
  } catch {
    error.value = t('challenge.roundError')
  } finally {
    isLoading.value = false
  }
}

async function initialize() {
  try {
    ids.value = await loadIdsForGeneration(generation.value)
    await loadRound()
  } catch {
    error.value = t('challenge.initialError')
    isLoading.value = false
  }
}

async function loadIdsForGeneration(selectedGeneration: '1' | '2' | 'all') {
  const catalog =
    selectedGeneration === 'all'
      ? await pokemonRepository.getAllSupportedCatalog()
      : await pokemonRepository.getGenerationCatalog(Number(selectedGeneration))
  return catalog.map((entry) => entry.id)
}

function handleSubmit() {
  if (!pokemon.value || !state.value || state.value.isRevealed) return
  state.value = submitGuess(state.value, guess.value, pokemon.value.name)
}

function handleReveal() {
  if (!state.value) return
  state.value = revealCurrentPokemon(state.value)
}

async function handleNext() {
  await loadRound(state.value?.currentId ?? null)
}

onMounted(initialize)
watch(generation, async () => {
  isLoading.value = true
  error.value = null
  try {
    ids.value = await loadIdsForGeneration(generation.value)
    state.value = null
    await loadRound()
  } catch {
    error.value = t('challenge.generationError')
    isLoading.value = false
  }
})
</script>

<template>
  <section class="page-header">
    <select v-model="generation" class="generation-select" aria-label="Challenge generation">
      <option value="1">{{ t('common.generationI') }}</option>
      <option value="2">{{ t('common.generationII') }}</option>
      <option value="all">{{ t('common.allGenerations') }}</option>
    </select>
    <h1>{{ t('challenge.title') }}</h1>
    <p>{{ t('challenge.description') }}</p>
  </section>

  <p v-if="error" class="status error">{{ error }}</p>
  <p v-else-if="isLoading" class="status">{{ t('challenge.loading') }}</p>

  <section v-else-if="pokemon && state" class="challenge-card">
    <div class="scoreboard">
      <span class="streak-counter" :class="{ 'on-fire': state.streak >= 3 }">
        {{ t('challenge.streak') }} <strong>{{ state.streak }}</strong>
        <span v-if="state.streak >= 3" aria-hidden="true">🔥</span>
      </span>
      <span>{{ t('challenge.correctCount') }} <strong>{{ state.totalCorrect }}</strong></span>
      <span>{{ t('challenge.attempts') }} <strong>{{ state.totalAttempted }}</strong></span>
    </div>

    <div class="silhouette-frame" :class="{ revealed: state.isRevealed }">
      <img v-if="pokemon.imageUrl" :src="pokemon.imageUrl" :alt="pokemon.displayName" />
      <div v-else class="artwork-fallback">No artwork</div>
    </div>

    <p class="feedback" :class="state.result">{{ feedback }}</p>

    <form class="guess-form" @submit.prevent="handleSubmit">
      <input v-model="guess" type="text" :placeholder="t('challenge.inputPlaceholder')" />
      <button type="submit" :disabled="state.isRevealed">{{ t('challenge.guess') }}</button>
    </form>

    <div class="challenge-actions">
      <button @click="handleReveal" :disabled="state.isRevealed">
        {{ t('challenge.reveal') }}
      </button>
      <button @click="handleNext" :disabled="!state.isRevealed">
        {{ t('challenge.next') }}
      </button>
    </div>
  </section>
</template>
