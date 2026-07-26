import path from "node:path";
import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'

// https://vite.dev/config/
export default defineConfig({
  plugins: [svelte()],
  resolve: { alias: { "@": path.resolve(__dirname, "./src") } },
  server: {
    port: 5001
  }
})
