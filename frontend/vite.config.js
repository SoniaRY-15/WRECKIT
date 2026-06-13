import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  plugins: [vue()],
  build: {
    rollupOptions: {
      input: {
        popup: resolve(__dirname, 'index.html'),
        content: resolve(__dirname, 'src/content/content.js'),
      },
      output: {
        entryFileNames: 'assets/[name].js',
      }
    },
    outDir: 'dist',
    emptyOutDir: true,
  },
})