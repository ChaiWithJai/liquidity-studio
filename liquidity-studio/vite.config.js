import { defineConfig } from 'vite';
import { nativeEditorPlugin } from './scripts/native-editor-vite.js';
import { svelte } from '@sveltejs/vite-plugin-svelte';

export default defineConfig({
  plugins: [svelte(), nativeEditorPlugin()],
  esbuild: { jsx: "automatic" },
  server: {
    proxy: {
      '/api': 'http://localhost:8080'
    }
  }
});
