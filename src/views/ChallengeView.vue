<script setup lang="ts">
import { computed, ref } from 'vue'
import { pickNextPokemonId } from '../domain/challenge'
import { isCorrectPokemonGuess } from '../domain/pokemon'
import {
  createGameSession,
  startGame,
  recordCorrect,
  recordWrong,
  resetToSetup,
  type GameSession,
} from '../domain/gameSession'
import type { Pokemon } from '../domain/pokemon'
import { pokemonRepository, SUPPORTED_GENERATIONS } from '../services/pokemonRepository'
import { useTimer } from '../composables/useTimer'
import { useI18n } from '../i18n'

const TIMER_DURATION = 30

const ids = ref<number[]>([])
const pokemon = ref<Pokemon | null>(null)
const session = ref<GameSession>(createGameSession())
const guess = ref('')
const isLoading = ref(false)
const isRevealed = ref(false)
const error = ref<string | null>(null)
const selectedGenerations = ref<number[]>([1])
const selectedDifficulty = ref<'casual' | 'challenging'>('casual')
const { t } = useI18n()

const allSelected = computed(() => selectedGenerations.value.length === SUPPORTED_GENERATIONS.length)

function toggleSelectAll() {
  if (allSelected.value) {
    selectedGenerations.value = []
  } else {
    selectedGenerations.value = [...SUPPORTED_GENERATIONS]
  }
}

const isChallenging = computed(() => session.value.config.difficulty === 'challenging')

const { remaining, isRunning, start: startTimer, stop: stopTimer, reset: resetTimer } = useTimer(
  TIMER_DURATION,
  () => {
    session.value = recordWrong(session.value)
    if (session.value.phase === 'playing') {
      loadRound(pokemon.value?.id ?? null)
    }
  },
)

const timerPercent = computed(() => (remaining.value / TIMER_DURATION) * 100)
const timerDanger = computed(() => remaining.value <= 10)

async function handleStart() {
  error.value = null
  isLoading.value = true
  try {
    const config = { generations: [...selectedGenerations.value], difficulty: selectedDifficulty.value }
    ids.value = (await pokemonRepository.getMultiGenerationCatalog(config.generations)).map((e) => e.id)
    session.value = startGame(session.value, config)
    await loadRound(null)
  } catch {
    error.value = t('challenge.initialError')
    isLoading.value = false
  }
}

async function loadRound(previousId: number | null) {
  isLoading.value = true
  stopTimer()
  try {
    const nextId = pickNextPokemonId(ids.value, previousId)
    pokemon.value = await pokemonRepository.getPokemon(nextId)
    guess.value = ''
    if (isChallenging.value) startTimer()
  } catch {
    error.value = t('challenge.roundError')
  } finally {
    isLoading.value = false
  }
}

function handleGuess() {
  if (!pokemon.value || isLoading.value || isRevealed.value) return
  if (!guess.value.trim()) return

  if (isCorrectPokemonGuess(guess.value, pokemon.value.name)) {
    stopTimer()
    session.value = recordCorrect(session.value)
    isRevealed.value = true
  } else {
    stopTimer()
    session.value = recordWrong(session.value)
    if (session.value.phase === 'playing') {
      guess.value = ''
      if (isChallenging.value) startTimer()
    }
  }
}

function handleContinue() {
  isRevealed.value = false
  loadRound(pokemon.value?.id ?? null)
}

function handleTryAgain() {
  session.value = resetToSetup(session.value)
  pokemon.value = null
  error.value = null
  resetTimer()
}
</script>

<template>
  <!-- SETUP PHASE -->
  <section v-if="session.phase === 'setup'" class="challenge-setup">
    <h1>{{ t('challenge.title') }}</h1>
    <p>{{ t('challenge.description') }}</p>

    <fieldset class="generation-picker">
      <legend>{{ t('challenge.selectGenerations') }}</legend>
      <label class="checkbox-label">
        <input type="checkbox" :checked="allSelected" @change="toggleSelectAll" />
        {{ t('common.allGenerations') }}
      </label>
      <label v-for="gen in SUPPORTED_GENERATIONS" :key="gen" class="checkbox-label">
        <input type="checkbox" :value="gen" v-model="selectedGenerations" />
        {{ gen === 1 ? t('common.generationI') : t('common.generationII') }}
      </label>
    </fieldset>

    <fieldset class="difficulty-picker">
      <legend>{{ t('challenge.selectDifficulty') }}</legend>
      <label class="radio-label">
        <input type="radio" value="casual" v-model="selectedDifficulty" />
        <span>
          <strong>{{ t('challenge.casual') }}</strong>
          <small>{{ t('challenge.casualDescription') }}</small>
        </span>
      </label>
      <label class="radio-label">
        <input type="radio" value="challenging" v-model="selectedDifficulty" />
        <span>
          <strong>{{ t('challenge.challenging') }}</strong>
          <small>{{ t('challenge.challengingDescription') }}</small>
        </span>
      </label>
    </fieldset>

    <p v-if="error" class="status error">{{ error }}</p>
    <div v-if="isLoading" class="pokeball-loader">
      <div class="pokeball">
        <div class="pokeball-top"></div>
        <div class="pokeball-center"></div>
        <div class="pokeball-bottom"></div>
      </div>
    </div>

    <button class="start-button" @click="handleStart" :disabled="selectedGenerations.length === 0 || isLoading">
      {{ t('challenge.start') }}
    </button>
  </section>

  <!-- PLAYING PHASE -->
  <section v-else-if="session.phase === 'playing'" class="challenge-card">
    <div v-if="isChallenging" class="timer-bar" :class="{ danger: timerDanger }">
      <div class="timer-fill" :style="{ width: timerPercent + '%' }"></div>
      <span class="timer-text">{{ remaining }}s</span>
    </div>

    <div class="scoreboard">
      <span class="streak-counter" :class="{ 'on-fire': session.streak >= 3 }">
        {{ t('challenge.streak') }} <strong>{{ session.streak }}</strong>
        <span v-if="session.streak >= 3" aria-hidden="true">&#x1F525;</span>
      </span>
      <span class="health-display" :aria-label="t('challenge.health', { count: session.health })">
        <span v-for="i in session.maxHealth" :key="i" class="heart" :class="{ lost: i > session.health }">&#x2764;&#xFE0F;</span>
      </span>
      <span>{{ t('challenge.correctCount') }} <strong>{{ session.score }}</strong></span>
    </div>

    <div class="silhouette-frame" :class="{ revealed: isRevealed }">
      <img v-if="pokemon?.imageUrl" :src="pokemon.imageUrl" :alt="pokemon.displayName" />
      <div v-else class="artwork-fallback">No artwork</div>
    </div>

    <div v-if="isRevealed && pokemon" class="correct-reveal">
      <p class="correct-name">{{ pokemon.displayName }}</p>
      <form @submit.prevent="handleContinue">
        <button class="start-button" type="submit">{{ t('challenge.continue') }}</button>
      </form>
    </div>

    <template v-else>
      <p v-if="error" class="status error">{{ error }}</p>

      <form class="guess-form" @submit.prevent="handleGuess">
        <input v-model="guess" type="text" :placeholder="t('challenge.inputPlaceholder')" :disabled="isLoading" />
        <button type="submit" :disabled="isLoading">{{ t('challenge.guess') }}</button>
      </form>
    </template>
  </section>

  <!-- GAME OVER PHASE -->
  <section v-else-if="session.phase === 'gameOver'" class="game-over">
    <h2>{{ t('challenge.gameOver') }}</h2>

    <div v-if="pokemon" class="game-over-reveal">
      <img v-if="pokemon.imageUrl" :src="pokemon.imageUrl" :alt="pokemon.displayName" />
      <p>{{ t('challenge.guessedName', { name: pokemon.displayName }) }}</p>
    </div>

    <div class="final-score">
      <p>{{ t('challenge.finalScore', { score: session.score }) }}</p>
      <p>{{ t('challenge.bestStreak', { streak: session.bestStreak }) }}</p>
    </div>

    <button class="start-button" @click="handleTryAgain">{{ t('challenge.tryAgain') }}</button>
  </section>
</template>
