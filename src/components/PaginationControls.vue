<script setup lang="ts">
defineProps<{
  currentPage: number
  totalPages: number
}>()

defineEmits<{
  previous: []
  next: []
}>()
</script>

<template>
  <nav class="pagination" aria-label="Pagination">
    <button :disabled="currentPage === 1" @click="$emit('previous')">Previous</button>
    <span>Page {{ currentPage }} of {{ totalPages }}</span>
    <button :disabled="currentPage === totalPages" @click="$emit('next')">Next</button>
  </nav>
</template>
