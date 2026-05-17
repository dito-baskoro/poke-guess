import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  base: '/poke-guess/',
  plugins: [vue()],
  test: {
    environment: 'jsdom',
    setupFiles: './tests/setup.ts',
  },
})
