<script setup lang="ts">
import { ref, watch } from 'vue'
import { soundEnabled } from '../composables/useSoundPreference'
import type { Pokemon } from '../domain/pokemon'

const props = defineProps<{
  pokemon: Pokemon
  compact?: boolean
  open?: boolean
}>()

const emit = defineEmits<{
  toggle: [id: number]
}>()

function formatStatName(name: string): string {
  if (name === 'special-attack') return 'SP. ATK'
  if (name === 'special-defense') return 'SP. DEF'
  return name.replace('-', ' ').toUpperCase()
}

const hasPlayedCry = ref(false)

watch(
  () => props.open,
  (open, wasOpen) => {
    if (
      !props.compact ||
      !open ||
      wasOpen ||
      hasPlayedCry.value ||
      !soundEnabled.value ||
      !props.pokemon.cryUrl
    ) {
      return
    }

    hasPlayedCry.value = true
    const cry = new Audio(props.pokemon.cryUrl)
    cry.volume = 0.5
    void cry.play()
  },
)
</script>

<template>
  <article
    class="pokemon-card"
    :class="{ 'is-compact': compact, 'is-open': compact && open }"
    :data-primary-type="pokemon.types[0]"
    @click="compact && emit('toggle', pokemon.id)"
  >
    <header class="card-header">
      <span>#{{ String(pokemon.id).padStart(3, '0') }}</span>
      <h2>{{ pokemon.displayName }}</h2>
    </header>

    <div class="artwork-frame">
      <img v-if="pokemon.imageUrl" :src="pokemon.imageUrl" :alt="pokemon.displayName" />
      <div v-else class="pokeball-loader" aria-hidden="true">
        <div class="pokeball">
          <div class="pokeball-top"></div>
          <div class="pokeball-center"></div>
          <div class="pokeball-bottom"></div>
        </div>
      </div>
    </div>

    <div class="type-row">
      <span v-for="type in pokemon.types" :key="type" class="type-pill" :data-type="type">
        {{ type }}
      </span>
    </div>

    <div class="card-details">
      <dl class="facts">
        <div>
          <dt>Height</dt>
          <dd>{{ pokemon.height * 10 }} cm</dd>
        </div>
        <div>
          <dt>Weight</dt>
          <dd>{{ (pokemon.weight * 0.1).toFixed(1) }} kg</dd>
        </div>
      </dl>

      <section class="abilities">
        <h3>Abilities</h3>
        <p>{{ pokemon.abilities.join(', ') || 'Unknown' }}</p>
      </section>

      <section class="stats">
        <h3>Stats</h3>
        <ul>
          <li v-for="stat in pokemon.stats" :key="stat.name">
            <span>{{ formatStatName(stat.name) }}</span>
            <span class="stat-bar" aria-hidden="true">
              <span class="stat-bar-fill" :style="{ width: `${(stat.value / 255) * 100}%` }"></span>
            </span>
            <strong>{{ stat.value }}</strong>
          </li>
        </ul>
      </section>
    </div>
  </article>
</template>
