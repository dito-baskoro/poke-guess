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
      <div class="language-toggle" role="group" :aria-label="t('nav.language')">
        <button
          type="button"
          class="language-option"
          :class="{ 'is-active': locale === 'en' }"
          :aria-pressed="locale === 'en'"
          aria-label="English"
          @click="locale = 'en'"
        >
          <span class="flag-icon flag-icon--gb" aria-hidden="true"></span>
          <span>EN</span>
        </button>
        <button
          type="button"
          class="language-option"
          :class="{ 'is-active': locale === 'id' }"
          :aria-pressed="locale === 'id'"
          aria-label="Bahasa Indonesia"
          @click="locale = 'id'"
        >
          <span class="flag-icon flag-icon--id" aria-hidden="true"></span>
          <span>ID</span>
        </button>
      </div>
    </header>
    <main>
      <RouterView />
    </main>
    <footer class="site-footer">
      <p>
        Images and sounds © Nintendo. Send feedback and contribute to
        <a href="https://github.com/dito-baskoro/poke-guess" target="_blank" rel="noopener noreferrer">github</a>
      </p>
    </footer>
  </div>
</template>
