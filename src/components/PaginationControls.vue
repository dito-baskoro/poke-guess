<script setup lang="ts">
import { useI18n } from '../i18n'

defineProps<{
  currentPage: number
  totalPages: number
}>()

defineEmits<{
  previous: []
  next: []
}>()

const { t } = useI18n()
</script>

<template>
  <nav class="pagination" aria-label="Pagination">
    <button :disabled="currentPage === 1" @click="$emit('previous')">
      ← {{ t('pagination.previous') }}
    </button>
    <span>{{ t('pagination.pageOf', { current: currentPage, total: totalPages }) }}</span>
    <button :disabled="currentPage === totalPages" @click="$emit('next')">
      {{ t('pagination.next') }} →
    </button>
  </nav>
</template>
