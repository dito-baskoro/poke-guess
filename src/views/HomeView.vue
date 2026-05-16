<template>
  <section class="hero">
    <h1>Explore the Pokémon world.</h1>
    <p class="hero-copy">
      Browse a card-style Pokédex or test yourself in an endless silhouette challenge.
    </p>

    <div class="home-grid">
      <RouterLink to="/pokedex" class="home-card">
        <h2>Pokédex</h2>
        <p>Browse richly detailed cards for every Gen 1 Pokémon.</p>
      </RouterLink>
      <RouterLink to="/challenge" class="home-card">
        <h2>Challenge</h2>
        <p>Guess silhouettes and keep your streak alive.</p>
      </RouterLink>
    </div>
  </section>
</template>
