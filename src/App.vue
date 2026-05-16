<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
import { useI18n } from './i18n'

const { locale, t } = useI18n()
</script>

<template>
  <div class="app-shell">
    <div class="pokeball-decoration" aria-hidden="true"></div>
    <header class="site-header">
      <RouterLink to="/" class="brand">PokéGuess</RouterLink>
      <nav>
        <RouterLink to="/pokedex">{{ t('nav.pokedex') }}</RouterLink>
        <RouterLink to="/challenge">{{ t('nav.challenge') }}</RouterLink>
      </nav>
      <label class="language-select">
        <span class="sr-only">{{ t('nav.language') }}</span>
        <select v-model="locale" aria-label="Language">
          <option value="en">🇬🇧 English</option>
          <option value="id">🇮🇩 Bahasa Indonesia</option>
        </select>
      </label>
    </header>
    <main>
      <RouterView />
    </main>
  </div>
</template>
