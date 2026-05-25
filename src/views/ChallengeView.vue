<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { pickNextPokemonId } from '../domain/challenge'
import { isCorrectPokemonGuess, normalizeGuess, type PokemonCatalogEntry, toDisplayName } from '../domain/pokemon'
import { scrambleName } from '../domain/scramble'
import {
  createGameSession,
  startGame,
  recordCorrect,
  recordWrong,
  completeGame,
  resetToSetup,
  type GameSession,
} from '../domain/gameSession'
import type { Pokemon } from '../domain/pokemon'
import { pokemonRepository, SUPPORTED_GENERATIONS } from '../services/pokemonRepository'
import { useTimer } from '../composables/useTimer'
import { useElapsedTimer } from '../composables/useElapsedTimer'
import { useLeaderboard } from '../composables/useLeaderboard'
import ChallengeLeaderboard from '../components/ChallengeLeaderboard.vue'
import PokeballLoader from '../components/PokeballLoader.vue'
import { useI18n } from '../i18n'
import { getTypeColor } from '../utils/typeColors'
import bgAsset from '../assets/bg-asset.png'

const TIMER_DURATION = 30
const NAME_STORAGE_KEY = 'pokedex-player-name'
const DEFAULT_PLAYER_NAME = 'Trainer'

type GameMode = 'silhouette' | 'scramble'

function readStoredName(): string {
  if (typeof window === 'undefined') return ''
  try {
    return window.localStorage.getItem(NAME_STORAGE_KEY) ?? ''
  } catch {
    return ''
  }
}

const pokemon = ref<Pokemon | null>(null)
const session = ref<GameSession>(createGameSession())
const guess = ref('')
const isLoading = ref(false)
const isRevealed = ref(false)
const error = ref<string | null>(null)
const selectedGenerations = ref<number[]>([1])
const selectedDifficulty = ref<'casual' | 'challenging'>('casual')
const finalElapsedSeconds = ref<number | null>(null)
const latestEntryId = ref<string | null>(null)
const gameMode = ref<GameMode | null>(null)
const scrambled = ref<string>('')
const catalogNames = ref<string[]>([])
const playerName = ref<string>(readStoredName())
const { topEntries, recordEntry } = useLeaderboard()
const { t } = useI18n()

watch(playerName, (next) => {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(NAME_STORAGE_KEY, next.trim())
  } catch {
    /* ignore quota */
  }
})

const generationLabels = computed(() => ({
  1: t('common.generationI'),
  2: t('common.generationII'),
  3: t('common.generationIII'),
}))

const MAX_SUGGESTIONS = 8

const datalistOptions = computed(() => {
  const names = catalogNames.value.filter(
    (name): name is string => typeof name === 'string' && name.length > 0,
  )
  const normalized = normalizeGuess(guess.value)
  const matches = normalized
    ? names.filter((name) => normalizeGuess(name).includes(normalized))
    : names
  return matches.slice(0, MAX_SUGGESTIONS).map((name) => ({ value: toDisplayName(name) }))
})

const resolvedPlayerName = computed(() => playerName.value.trim() || DEFAULT_PLAYER_NAME)

function selectMode(mode: GameMode) {
  gameMode.value = mode
  if (mode === 'scramble') {
    selectedDifficulty.value = 'casual'
  }
}

function backToModePicker() {
  gameMode.value = null
  error.value = null
}

const isSilhouetteMode = computed(() => gameMode.value === 'silhouette')
const isScrambleMode = computed(() => gameMode.value === 'scramble')
const isChallenging = computed(() => session.value.config.difficulty === 'challenging')
const canStart = computed(() => selectedGenerations.value.length > 0)

const { remaining, start: startTimer, stop: stopTimer, reset: resetTimer } = useTimer(
  TIMER_DURATION,
  () => {
    session.value = recordWrong(session.value)
    if (session.value.phase === 'playing') {
      loadRound(pokemon.value?.id ?? null)
    } else {
      finishElapsedTimer()
    }
  },
)
const {
  elapsed,
  start: startElapsedTimer,
  stop: stopElapsedTimer,
  reset: resetElapsedTimer,
} = useElapsedTimer()

const timerPercent = computed(() => (remaining.value / TIMER_DURATION) * 100)
const timerDanger = computed(() => remaining.value <= 10)
const formattedElapsedTime = computed(() => formatElapsedTime(elapsed.value))
const formattedFinalElapsedTime = computed(() =>
  finalElapsedSeconds.value === null ? null : formatElapsedTime(finalElapsedSeconds.value),
)

function formatElapsedTime(seconds: number) {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`
}

function finishElapsedTimer() {
  if (!isChallenging.value || finalElapsedSeconds.value !== null) return
  stopElapsedTimer()
  finalElapsedSeconds.value = elapsed.value
  const entry = recordEntry({
    name: resolvedPlayerName.value,
    score: session.value.score,
    streak: session.value.bestStreak,
    timeSeconds: finalElapsedSeconds.value,
  })
  latestEntryId.value = entry.id
}

async function handleStart() {
  error.value = null
  isLoading.value = true
  try {
    const config = { generations: [...selectedGenerations.value], difficulty: selectedDifficulty.value }
    const catalog: PokemonCatalogEntry[] = await pokemonRepository.getMultiGenerationCatalog(config.generations)
    catalogNames.value = catalog.map((entry) => entry.name)
    session.value = startGame(session.value, config, catalog.map((e) => e.id))
    finalElapsedSeconds.value = null
    resetElapsedTimer()
    if (config.difficulty === 'challenging') startElapsedTimer()
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
    const nextId = pickNextPokemonId(session.value.remainingPokemonIds, previousId)
    pokemon.value = await pokemonRepository.getPokemon(nextId)
    scrambled.value = scrambleName(pokemon.value.name)
    guess.value = ''
    error.value = null
    if (isChallenging.value) startTimer()
  } catch {
    error.value = t('challenge.roundError')
  } finally {
    isLoading.value = false
  }
}

function retryRound() {
  loadRound(pokemon.value?.id ?? null)
}

function handleGuess() {
  if (!pokemon.value || isLoading.value || isRevealed.value) return
  if (!guess.value.trim()) return

  if (isCorrectPokemonGuess(guess.value, pokemon.value.name)) {
    stopTimer()
    session.value = recordCorrect(session.value, pokemon.value.id)
    isRevealed.value = true
  } else {
    stopTimer()
    session.value = recordWrong(session.value)
    if (session.value.phase === 'gameOver') {
      finishElapsedTimer()
    }
    if (session.value.phase === 'playing') {
      guess.value = ''
      if (isChallenging.value) startTimer()
    }
  }
}

function handleSkip() {
  if (!pokemon.value || isLoading.value || isRevealed.value) return

  stopTimer()
  session.value = recordWrong(session.value)
  if (session.value.phase === 'gameOver') {
    finishElapsedTimer()
  }
  if (session.value.phase === 'playing') {
    isRevealed.value = true
  }
}

function handleContinue() {
  isRevealed.value = false
  if (!session.value.remainingPokemonIds.length) {
    session.value = completeGame(session.value)
    finishElapsedTimer()
    return
  }

  loadRound(pokemon.value?.id ?? null)
}

function handleTryAgain() {
  session.value = resetToSetup(session.value)
  pokemon.value = null
  error.value = null
  resetTimer()
  resetElapsedTimer()
  finalElapsedSeconds.value = null
  latestEntryId.value = null
  scrambled.value = ''
  gameMode.value = null
  isRevealed.value = false
}

function handleExit() {
  const inProgress = isChallenging.value && !isRevealed.value && session.value.phase === 'playing'
  if (inProgress && typeof window !== 'undefined' && !window.confirm(t('challenge.exitConfirm'))) {
    return
  }
  stopTimer()
  stopElapsedTimer()
  handleTryAgain()
}
</script>

<template>
  <!-- MODE PICKER -->
  <section v-if="gameMode === null" class="mode-picker">
    <h1>{{ t('challenge.modePickerTitle') }}</h1>
    <p class="mode-picker-intro">{{ t('challenge.modePickerDescription') }}</p>
    <div class="mode-grid">
      <button
        type="button"
        class="mode-card mode-card-silhouette"
        data-mode="silhouette"
        @click="selectMode('silhouette')"
      >
        <h2>{{ t('challenge.silhouetteModeTitle') }}</h2>
        <p>{{ t('challenge.silhouetteModeDescription') }}</p>
      </button>
      <button
        type="button"
        class="mode-card mode-card-scramble"
        data-mode="scramble"
        @click="selectMode('scramble')"
      >
        <h2>{{ t('challenge.scrambleModeTitle') }}</h2>
        <p>{{ t('challenge.scrambleModeDescription') }}</p>
      </button>
    </div>
  </section>

  <!-- SETUP PHASE -->
  <section v-else-if="session.phase === 'setup'" class="challenge-setup">
    <div v-if="isLoading" class="challenge-loading">
      <PokeballLoader />
    </div>

    <template v-else>
      <button type="button" class="back-link" @click="backToModePicker">&larr; {{ t('challenge.back') }}</button>
      <h1>{{ isScrambleMode ? t('challenge.scrambleTitle') : t('challenge.title') }}</h1>
      <p>{{ isScrambleMode ? t('challenge.scrambleDescription') : t('challenge.description') }}</p>

      <fieldset class="generation-picker">
        <legend>{{ t('challenge.selectGenerations') }}</legend>
        <label v-for="gen in SUPPORTED_GENERATIONS" :key="gen" class="checkbox-label">
          <input type="checkbox" :value="gen" v-model="selectedGenerations" />
          {{ generationLabels[gen] }}
        </label>
      </fieldset>

      <fieldset v-if="!isScrambleMode" class="difficulty-picker">
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

      <div v-if="!isScrambleMode" class="setup-section">
        <label>
          <span>{{ t('challenge.playerNameLabel') }}</span>
          <input
            v-model="playerName"
            type="text"
            maxlength="20"
            :placeholder="t('challenge.playerNamePlaceholder')"
            autocomplete="nickname"
          />
        </label>
      </div>

      <div v-if="error" class="error-block">
        <span>{{ error }}</span>
        <button type="button" class="is-ghost" @click="handleStart">{{ t('challenge.retry') }}</button>
      </div>

      <button class="start-button" @click="handleStart" :disabled="!canStart">
        {{ t('challenge.start') }}
      </button>
    </template>
  </section>

  <!-- PLAYING PHASE -->
  <div v-else class="challenge-stage" :class="{ 'has-leaderboard': isChallenging && isSilhouetteMode }">
    <section v-if="session.phase === 'playing'" class="challenge-card">
      <div v-if="isChallenging" class="timer-bar" :class="{ danger: timerDanger }">
        <div class="timer-fill" :style="{ width: timerPercent + '%' }"></div>
        <span class="timer-text">{{ remaining }}s</span>
      </div>

      <div class="scoreboard">
        <div>
          <span v-if="isChallenging" class="elapsed-time">
            {{ t('challenge.elapsedTime', { time: formattedElapsedTime }) }}
          </span>
          <span class="streak-counter" :class="{ 'on-fire': session.streak >= 3 }">
            {{ t('challenge.streak') }} <strong>{{ session.streak }}</strong>
            <span v-if="session.streak >= 3" aria-hidden="true">&#x1F525;</span>
          </span>
        </div>
        <span class="health-display" :aria-label="t('challenge.health', { count: session.health })">
          <span v-for="i in session.maxHealth" :key="i" class="heart" :class="{ lost: i > session.health }" aria-hidden="true"></span>
        </span>
        <span>{{ t('challenge.correctCount') }} <strong>{{ session.score }}</strong></span>
        <button type="button" class="is-ghost exit-button" @click="handleExit">
          {{ t('challenge.exit') }}
        </button>
      </div>

      <div
        v-if="isSilhouetteMode"
        class="silhouette-frame"
        :class="{ revealed: isRevealed }"
        :data-primary-type="pokemon?.types[0] ?? null"
        :style="{ '--bg-asset': `url(${bgAsset})` }"
      >
        <div class="silhouette-image">
          <img v-if="pokemon?.imageUrl" :src="pokemon.imageUrl" :alt="pokemon.displayName" />
          <PokeballLoader v-else inline />
        </div>
        <p v-if="isRevealed && pokemon" class="silhouette-name">{{ pokemon.displayName }}</p>
      </div>

      <div
        v-else
        class="scramble-frame"
        :class="{ revealed: isRevealed }"
        :data-primary-type="pokemon?.types[0] ?? null"
      >
        <div
          v-if="pokemon"
          class="type-chip-row"
          role="list"
          :aria-label="t('challenge.typeClueLabel')"
        >
          <span
            v-for="type in pokemon.types"
            :key="type"
            class="type-chip"
            role="listitem"
            :style="{ background: getTypeColor(type) }"
          >
            {{ type }}
          </span>
        </div>
        <p v-if="!isRevealed" class="scramble-prompt">{{ t('challenge.scramblePrompt') }}</p>
        <img
          v-if="isRevealed && pokemon?.imageUrl"
          class="scramble-reveal-image"
          :src="pokemon.imageUrl"
          :alt="pokemon.displayName"
        />
        <div v-if="pokemon && !isRevealed" class="scrambled-letters" :aria-label="scrambled">
          <span v-for="(letter, i) in scrambled" :key="i" class="scramble-letter">{{ letter }}</span>
        </div>
        <PokeballLoader v-else-if="!pokemon" inline />
        <p v-if="isRevealed && pokemon" class="silhouette-name">{{ pokemon.displayName }}</p>
      </div>

      <div v-if="isRevealed && pokemon" class="correct-reveal">
        <form @submit.prevent="handleContinue">
          <button class="start-button" type="submit">{{ t('challenge.continue') }}</button>
        </form>
      </div>

      <template v-else>
        <div v-if="error" class="error-block">
          <span>{{ error }}</span>
          <button type="button" class="is-ghost" @click="retryRound">{{ t('challenge.retry') }}</button>
        </div>

        <form class="guess-form" @submit.prevent="handleGuess">
          <input
            v-model="guess"
            type="text"
            list="pokemon-name-suggestions"
            autocomplete="off"
            :placeholder="isScrambleMode ? t('challenge.scrambleInputPlaceholder') : t('challenge.inputPlaceholder')"
            :disabled="isLoading"
          />
          <datalist id="pokemon-name-suggestions">
            <option v-for="option in datalistOptions" :key="option.value" :value="option.value"></option>
          </datalist>
          <div class="guess-actions">
            <button class="guess-button" type="submit" :disabled="isLoading">
              {{ t('challenge.guess') }}
            </button>
          </div>
          <button
            type="button"
            class="reveal-link"
            :disabled="isLoading"
            @click="handleSkip"
          >
            {{ t('challenge.giveUp') }}
          </button>
        </form>
      </template>
    </section>

    <!-- COMPLETED PHASE -->
    <section v-else-if="session.phase === 'completed'" class="game-over is-completed">
      <h2>
        <span class="party-popper" aria-hidden="true"></span>
        {{ t('challenge.completed') }}
        <span class="party-popper party-popper--flipped" aria-hidden="true"></span>
      </h2>
      <p>{{ t('challenge.completedDescription') }}</p>

      <div class="final-score">
        <p>{{ t('challenge.finalScore', { score: session.score }) }}</p>
        <p>{{ t('challenge.bestStreak', { streak: session.bestStreak }) }}</p>
        <p v-if="formattedFinalElapsedTime">{{ t('challenge.elapsedTime', { time: formattedFinalElapsedTime }) }}</p>
      </div>

      <button class="start-button" @click="handleTryAgain">{{ t('challenge.tryAgain') }}</button>
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
        <p v-if="formattedFinalElapsedTime">{{ t('challenge.elapsedTime', { time: formattedFinalElapsedTime }) }}</p>
      </div>

      <button class="start-button" @click="handleTryAgain">{{ t('challenge.tryAgain') }}</button>
    </section>

    <ChallengeLeaderboard
      v-if="isChallenging && isSilhouetteMode"
      :entries="topEntries"
      :highlight-id="latestEntryId"
    />
  </div>
</template>
