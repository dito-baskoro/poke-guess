<script setup lang="ts">
import { computed } from 'vue'
import type { LeaderboardEntry } from '../composables/useLeaderboard'
import { useI18n } from '../i18n'

const props = defineProps<{
  entries: readonly LeaderboardEntry[]
  highlightId?: string | null
}>()

const { t } = useI18n()

const rows = computed(() => props.entries)

function formatTime(seconds: number) {
  const minutes = Math.floor(seconds / 60)
  const remaining = seconds % 60
  return `${String(minutes).padStart(2, '0')}:${String(remaining).padStart(2, '0')}`
}
</script>

<template>
  <aside class="leaderboard-card" aria-labelledby="leaderboard-title">
    <header class="leaderboard-header">
      <span class="leaderboard-trophy" aria-hidden="true"></span>
      <h2 id="leaderboard-title">{{ t('challenge.leaderboard.title') }}</h2>
    </header>

    <div v-if="rows.length === 0" class="leaderboard-empty">
      {{ t('challenge.leaderboard.empty') }}
    </div>

    <ol v-else class="leaderboard-list">
      <li class="leaderboard-row leaderboard-row--head">
        <span class="leaderboard-rank">#</span>
        <span class="leaderboard-name">{{ t('challenge.leaderboard.name') }}</span>
        <span class="leaderboard-streak">{{ t('challenge.leaderboard.streak') }}</span>
        <span class="leaderboard-score">{{ t('challenge.leaderboard.score') }}</span>
        <span class="leaderboard-time">{{ t('challenge.leaderboard.time') }}</span>
      </li>
      <li
        v-for="(entry, index) in rows"
        :key="entry.id"
        class="leaderboard-row"
        :class="{ 'is-highlight': entry.id === highlightId, 'is-top': index === 0 }"
      >
        <span class="leaderboard-rank" :data-rank="index + 1">{{ index + 1 }}</span>
        <span class="leaderboard-name" :title="entry.name">{{ entry.name }}</span>
        <span class="leaderboard-streak">{{ entry.streak }}</span>
        <span class="leaderboard-score">{{ entry.score }}</span>
        <span class="leaderboard-time">{{ formatTime(entry.timeSeconds) }}</span>
      </li>
    </ol>
  </aside>
</template>
