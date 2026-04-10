import { defineConfig } from 'vite'
import solidPlugin from 'vite-plugin-solid'
import vike from 'vike/plugin'

export default defineConfig({
  plugins: [vike(), solidPlugin({ ssr: true })],
  server: {
    port: 3000,
  },
  build: {
    target: 'esnext',
  },
})
