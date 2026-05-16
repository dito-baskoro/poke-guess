<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
</script>

<template>
  <div class="app-shell">
    <header class="site-header">
      <RouterLink to="/" class="brand">PokéGuess</RouterLink>
      <nav>
        <RouterLink to="/pokedex">Pokédex</RouterLink>
        <RouterLink to="/challenge">Challenge</RouterLink>
      </nav>
    </header>
    <main>
      <RouterView />
    </main>
  </div>
</template>
