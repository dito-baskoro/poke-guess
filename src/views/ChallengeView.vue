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

const ids = ref<number[]>([])
const generation = ref<'1' | '2' | 'all'>('1')
const pokemon = ref<Pokemon | null>(null)
const state = ref<ChallengeState | null>(null)
const guess = ref('')
const isLoading = ref(true)
const error = ref<string | null>(null)

const feedback = computed(() => {
  if (!state.value) return ''
  if (state.value.result === 'correct') return 'Correct!'
  if (state.value.result === 'incorrect') return 'Not quite — try again.'
  if (state.value.result === 'revealed') return `It was ${pokemon.value?.displayName}.`
  return 'Who’s that Pokémon?'
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
    error.value = 'Unable to load a challenge round right now.'
  } finally {
    isLoading.value = false
  }
}

async function initialize() {
  try {
    ids.value = await loadIdsForGeneration(generation.value)
    await loadRound()
  } catch {
    error.value = 'Unable to load the challenge right now.'
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
    error.value = 'Unable to load the selected challenge generation right now.'
    isLoading.value = false
  }
})
</script>

<template>
  <section class="page-header">
    <select v-model="generation" class="generation-select" aria-label="Challenge generation">
      <option value="1">Generation I</option>
      <option value="2">Generation II</option>
      <option value="all">All Generations</option>
    </select>
    <h1>Who’s That Pokémon?</h1>
    <p>Type the name, keep the streak alive, and move through endless rounds.</p>
  </section>

  <p v-if="error" class="status error">{{ error }}</p>
  <p v-else-if="isLoading" class="status">Loading challenge...</p>

  <section v-else-if="pokemon && state" class="challenge-card">
    <div class="scoreboard">
      <span>Streak <strong>{{ state.streak }}</strong></span>
      <span>Correct <strong>{{ state.totalCorrect }}</strong></span>
      <span>Attempts <strong>{{ state.totalAttempted }}</strong></span>
    </div>

    <div class="silhouette-frame" :class="{ revealed: state.isRevealed }">
      <img v-if="pokemon.imageUrl" :src="pokemon.imageUrl" :alt="pokemon.displayName" />
      <div v-else class="artwork-fallback">No artwork</div>
    </div>

    <p class="feedback">{{ feedback }}</p>

    <form class="guess-form" @submit.prevent="handleSubmit">
      <input v-model="guess" type="text" placeholder="Enter Pokémon name" />
      <button type="submit" :disabled="state.isRevealed">Guess</button>
    </form>

    <div class="challenge-actions">
      <button @click="handleReveal" :disabled="state.isRevealed">Reveal / Skip</button>
      <button @click="handleNext" :disabled="!state.isRevealed">Next Pokémon</button>
    </div>
  </section>
</template>
