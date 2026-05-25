import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import App from './App.vue'
import PokedexView from './views/PokedexView.vue'
import ChallengeView from './views/ChallengeView.vue'
import './styles.css'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', component: ChallengeView },
    { path: '/pokedex', component: PokedexView },
    { path: '/challenge', redirect: '/' },
  ],
})

createApp(App).use(router).mount('#app')
