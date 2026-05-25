<script setup lang="ts">
defineProps<{
  inline?: boolean
}>()
</script>

<template>
  <div class="pokeball-loader" :class="{ 'is-inline': inline }" aria-hidden="true">
    <div class="pokeball">
      <div class="pokeball-top"></div>
      <div class="pokeball-center"></div>
      <div class="pokeball-bottom"></div>
    </div>
  </div>
</template>
