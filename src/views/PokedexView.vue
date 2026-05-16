<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import PokemonCard from '../components/PokemonCard.vue'
import PaginationControls from '../components/PaginationControls.vue'
import {
  filterCatalog,
  paginatePokemon,
  type Pokemon,
  type PokemonCatalogEntry,
} from '../domain/pokemon'
import { pokemonRepository } from '../services/pokemonRepository'

const pageSize = 10
const currentPage = ref(1)
const generation = ref('1')
const searchQuery = ref('')
const catalog = ref<PokemonCatalogEntry[]>([])
const pokemon = ref<Pokemon[]>([])
const isInitialLoading = ref(true)
const isPageLoading = ref(false)
const error = ref<string | null>(null)

const filteredCatalog = computed(() => filterCatalog(catalog.value, searchQuery.value))
const totalPages = computed(() => Math.ceil(filteredCatalog.value.length / pageSize))
const currentIds = computed(() =>
  paginatePokemon(
    filteredCatalog.value.map((entry) => entry.id),
    currentPage.value,
    pageSize,
  ),
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
        ? 'Some Pokémon could not be loaded right now.'
        : 'Unable to load this Pokédex page right now.'
  }
  isPageLoading.value = false
}

async function initialize() {
  isInitialLoading.value = true
  try {
    catalog.value = await pokemonRepository.getGenerationCatalog(Number(generation.value))
    await loadPage()
  } catch {
    error.value = 'Unable to load the Gen 1 Pokédex right now.'
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
watch(currentPage, loadPage)
watch(searchQuery, () => {
  if (currentPage.value === 1) {
    void loadPage()
    return
  }

  currentPage.value = 1
})
watch(generation, async () => {
  isInitialLoading.value = true
  searchQuery.value = ''
  currentPage.value = 1
  try {
    catalog.value = await pokemonRepository.getGenerationCatalog(Number(generation.value))
    await loadPage()
  } catch {
    error.value = 'Unable to load the selected Pokédex generation right now.'
  } finally {
    isInitialLoading.value = false
  }
})
</script>

<template>
  <section class="page-header">
    <select v-model="generation" class="generation-select" aria-label="Generation">
      <option value="1">Generation I</option>
      <option value="2">Generation II</option>
    </select>
    <h1>Pokédex</h1>
    <p>Trading-card-inspired summaries by generation.</p>
  </section>

  <p v-if="error" class="status error">{{ error }}</p>
  <p v-if="isInitialLoading" class="status">Loading Pokémon...</p>

  <template v-if="!isInitialLoading">
    <section class="pokedex-toolbar">
      <label class="search-field">
        <span>Search</span>
        <input v-model="searchQuery" type="search" placeholder="Search Pokémon" />
      </label>

      <div class="toolbar-pagination">
        <span v-if="isPageLoading" class="status inline">Loading page...</span>
        <PaginationControls
          v-if="totalPages > 0"
          :current-page="currentPage"
          :total-pages="totalPages"
          @previous="previousPage"
          @next="nextPage"
        />
      </div>
    </section>

    <section v-if="pokemon.length > 0" class="card-grid" :class="{ 'is-loading': isPageLoading }">
      <PokemonCard v-for="entry in pokemon" :key="entry.id" :pokemon="entry" />
    </section>
    <p v-else-if="!isPageLoading" class="status">No Pokémon found.</p>

    <PaginationControls
      v-if="totalPages > 0"
      :current-page="currentPage"
      :total-pages="totalPages"
      @previous="previousPage"
      @next="nextPage"
    />
  </template>
</template>
