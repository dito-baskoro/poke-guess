<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import PokemonCard from '../components/PokemonCard.vue'
import PaginationControls from '../components/PaginationControls.vue'
import {
  filterCatalog,
  filterPokemonByType,
  paginatePokemon,
  type Pokemon,
  type PokemonCatalogEntry,
} from '../domain/pokemon'
import { pokemonRepository } from '../services/pokemonRepository'
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
  if (results.some((result) => result.status === 'rejected')) {
    error.value =
      pokemon.value.length > 0
        ? t('pokedex.partialError')
        : t('pokedex.pageError')
  }
  isPageLoading.value = false
}

async function initialize() {
  isInitialLoading.value = true
  try {
    catalog.value = await pokemonRepository.getGenerationCatalog(Number(generation.value))
    generationPokemon.value = await Promise.all(
      catalog.value.map((entry) => pokemonRepository.getPokemon(entry.id)),
    )
    await loadPage()
  } catch {
    error.value = t('pokedex.initialError')
  } finally {
    isInitialLoading.value = false
  }
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
  isInitialLoading.value = true
  searchQuery.value = ''
  selectedType.value = 'all'
  currentPage.value = 1
  try {
    catalog.value = await pokemonRepository.getGenerationCatalog(Number(generation.value))
    generationPokemon.value = await Promise.all(
      catalog.value.map((entry) => pokemonRepository.getPokemon(entry.id)),
    )
    await loadPage()
  } catch {
    error.value = t('pokedex.generationError')
  } finally {
    isInitialLoading.value = false
  }
})
</script>

<template>
  <section class="page-header">
    <select v-model="generation" class="generation-select" aria-label="Generation">
      <option value="1">{{ t('common.generationI') }}</option>
      <option value="2">{{ t('common.generationII') }}</option>
    </select>
    <h1>{{ t('pokedex.title') }}</h1>
    <p>{{ t('pokedex.description') }}</p>
  </section>

  <p v-if="error" class="status error">{{ error }}</p>
  <p v-if="isInitialLoading" class="status">{{ t('pokedex.loadingPokemon') }}</p>

  <template v-if="!isInitialLoading">
    <section class="pokedex-toolbar">
      <div class="filter-group">
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
  </template>
</template>
