<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import PokemonCard from '../components/PokemonCard.vue'
import PaginationControls from '../components/PaginationControls.vue'
import PokeballLoader from '../components/PokeballLoader.vue'
import {
  filterCatalog,
  filterPokemonByType,
  paginatePokemon,
  type Pokemon,
  type PokemonCatalogEntry,
} from '../domain/pokemon'
import { pokemonRepository } from '../services/pokemonRepository'
import { soundEnabled, toggleSound } from '../composables/useSoundPreference'
import { useI18n } from '../i18n'

const pageSize = 20
const currentPage = ref(1)
const generation = ref('1')
const searchQuery = ref('')
const selectedType = ref('all')
const catalog = ref<PokemonCatalogEntry[]>([])
const pokemon = ref<Pokemon[]>([])
const generationPokemon = ref<Pokemon[]>([])
const isInitialLoading = ref(true)
const isPageLoading = ref(false)
const error = ref<string | null>(null)
const openCardId = ref<number | null>(null)
const { t } = useI18n()
let generationLoadToken = 0

function toggleCard(id: number) {
  openCardId.value = openCardId.value === id ? null : id
}

const filteredCatalog = computed(() => filterCatalog(catalog.value, searchQuery.value))
const availableTypes = computed(() =>
  [...new Set(generationPokemon.value.flatMap((entry) => entry.types))].sort(),
)
const filteredPokemon = computed(() =>
  filterPokemonByType(generationPokemon.value, selectedType.value).filter((entry) =>
    filteredCatalog.value.some((catalogEntry) => catalogEntry.id === entry.id),
  ),
)
const filteredIds = computed(() =>
  selectedType.value === 'all'
    ? filteredCatalog.value.map((entry) => entry.id)
    : filteredPokemon.value.map((entry) => entry.id),
)
const totalPages = computed(() => Math.ceil(filteredIds.value.length / pageSize))
const currentIds = computed(() =>
  paginatePokemon(filteredIds.value, currentPage.value, pageSize),
)

async function loadPage() {
  isPageLoading.value = true
  error.value = null
  const results = await Promise.allSettled(
    currentIds.value.map((id) => pokemonRepository.getPokemon(id)),
  )
  pokemon.value = results
    .filter((result): result is PromiseFulfilledResult<Pokemon> => result.status === 'fulfilled')
    .map((result) => result.value)
  generationPokemon.value = mergePokemon(generationPokemon.value, pokemon.value)
  if (results.some((result) => result.status === 'rejected')) {
    error.value =
      pokemon.value.length > 0
        ? t('pokedex.partialError')
        : t('pokedex.pageError')
  }
  isPageLoading.value = false
}

function mergePokemon(current: Pokemon[], incoming: Pokemon[]): Pokemon[] {
  const byId = new Map(current.map((entry) => [entry.id, entry]))
  incoming.forEach((entry) => byId.set(entry.id, entry))
  return [...byId.values()].sort((left, right) => left.id - right.id)
}

async function hydrateRemainingPokemon(
  entries: PokemonCatalogEntry[],
  loadedIds: number[],
  token: number,
) {
  const loadedIdSet = new Set(loadedIds)
  const remainingEntries = entries.filter((entry) => !loadedIdSet.has(entry.id))

  await Promise.allSettled(
    remainingEntries.map(async (entry) => {
      const detailedPokemon = await pokemonRepository.getPokemon(entry.id)
      if (token !== generationLoadToken) return
      generationPokemon.value = mergePokemon(generationPokemon.value, [detailedPokemon])
    }),
  )
}

async function loadGeneration(initialErrorKey: 'pokedex.initialError' | 'pokedex.generationError') {
  const token = ++generationLoadToken
  isInitialLoading.value = true
  try {
    catalog.value = await pokemonRepository.getGenerationCatalog(Number(generation.value))
    generationPokemon.value = []
    await loadPage()
    void hydrateRemainingPokemon(
      catalog.value,
      generationPokemon.value.map((entry) => entry.id),
      token,
    )
  } catch {
    error.value = t(initialErrorKey)
  } finally {
    if (token === generationLoadToken) {
      isInitialLoading.value = false
    }
  }
}

async function initialize() {
  await loadGeneration('pokedex.initialError')
}

function retryLoad() {
  void loadGeneration('pokedex.generationError')
}

function previousPage() {
  if (currentPage.value > 1) currentPage.value -= 1
}

function nextPage() {
  if (currentPage.value < totalPages.value) currentPage.value += 1
}

onMounted(initialize)
watch(currentPage, () => {
  openCardId.value = null
  loadPage()
})
watch(searchQuery, () => {
  if (currentPage.value === 1) {
    void loadPage()
    return
  }

  currentPage.value = 1
})
watch(selectedType, () => {
  if (currentPage.value === 1) {
    void loadPage()
    return
  }

  currentPage.value = 1
})
watch(generation, async () => {
  searchQuery.value = ''
  selectedType.value = 'all'
  currentPage.value = 1
  await loadGeneration('pokedex.generationError')
})
</script>

<template>
  <section class="page-header">
    <h1>{{ t('pokedex.title') }}</h1>
    <p>{{ t('pokedex.description') }}</p>
  </section>

  <p v-if="error && !isInitialLoading" class="error-block">
    <span>{{ error }}</span>
    <button type="button" class="is-ghost" @click="retryLoad">{{ t('pokedex.retry') }}</button>
  </p>

  <PokeballLoader v-if="isInitialLoading" />

  <template v-if="!isInitialLoading">
    <section class="pokedex-toolbar">
      <div class="filter-group">
        <label class="generation-field">
          <span>{{ t('common.generation') }}</span>
          <select v-model="generation" class="generation-select" aria-label="Generation">
            <option value="1">{{ t('common.generationI') }}</option>
            <option value="2">{{ t('common.generationII') }}</option>
            <option value="3">{{ t('common.generationIII') }}</option>
          </select>
        </label>

        <label class="search-field">
          <span>{{ t('common.search') }}</span>
          <input v-model="searchQuery" type="search" :placeholder="t('pokedex.searchPlaceholder')" />
        </label>

        <label class="type-field">
          <span>{{ t('common.type') }}</span>
          <select v-model="selectedType" class="type-select" aria-label="Type">
            <option value="all">{{ t('common.allTypes') }}</option>
            <option v-for="type in availableTypes" :key="type" :value="type">
              {{ type }}
            </option>
          </select>
        </label>
      </div>

      <div class="toolbar-pagination">
        <span v-if="isPageLoading" class="status inline">{{ t('pokedex.loadingPage') }}</span>
        <PaginationControls
          v-if="totalPages > 0"
          :current-page="currentPage"
          :total-pages="totalPages"
          @previous="previousPage"
          @next="nextPage"
        />
      </div>
    </section>

    <section v-if="isPageLoading" class="card-grid skeleton-grid" aria-hidden="true">
      <article v-for="index in pageSize" :key="index" class="pokemon-card skeleton-card">
        <span class="skeleton-line skeleton-line-short"></span>
        <span class="skeleton-line"></span>
        <span class="skeleton-artwork"></span>
        <span class="skeleton-line skeleton-line-short"></span>
      </article>
    </section>

    <section v-else-if="pokemon.length > 0" class="card-grid">
      <PokemonCard
        v-for="entry in pokemon"
        :key="entry.id"
        :pokemon="entry"
        compact
        :open="openCardId === entry.id"
        @toggle="toggleCard"
      />
    </section>
    <p v-else-if="!isPageLoading" class="status">{{ t('pokedex.empty') }}</p>

    <PaginationControls
      v-if="totalPages > 0"
      :current-page="currentPage"
      :total-pages="totalPages"
      @previous="previousPage"
      @next="nextPage"
    />

    <button
      class="sound-toggle"
      type="button"
      :aria-pressed="soundEnabled"
      @click="toggleSound"
    >
      {{ soundEnabled ? t('pokedex.soundOn') : t('pokedex.soundOff') }}
    </button>
  </template>
</template>
