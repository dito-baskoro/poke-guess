import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import App from './App.vue'
import HomeView from './views/HomeView.vue'
import PokedexView from './views/PokedexView.vue'
import ChallengeView from './views/ChallengeView.vue'
import './styles.css'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: HomeView },
    { path: '/pokedex', component: PokedexView },
    { path: '/challenge', component: ChallengeView },
  ],
})

createApp(App).use(router).mount('#app')
