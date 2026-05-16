<script setup lang="ts">
import { useI18n } from '../i18n'

const { t } = useI18n()
</script>

<template>
  <section class="hero">
    <h1>{{ t('home.title') }}</h1>
    <p class="hero-copy">{{ t('home.intro') }}</p>

    <div class="home-grid">
      <RouterLink to="/pokedex" class="home-card">
        <h2>{{ t('nav.pokedex') }}</h2>
        <p>{{ t('home.pokedexDescription') }}</p>
      </RouterLink>
      <RouterLink to="/challenge" class="home-card">
        <h2>{{ t('nav.challenge') }}</h2>
        <p>{{ t('home.challengeDescription') }}</p>
      </RouterLink>
    </div>
  </section>
</template>
