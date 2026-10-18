import {defineConfig} from 'vite';
import {svelte} from '@sveltejs/vite-plugin-svelte';
import {fileURLToPath} from 'node:url';
export default defineConfig({
  root:fileURLToPath(new URL('.',import.meta.url)),
  cacheDir:fileURLToPath(new URL('../../.defiant-vite-cache',import.meta.url)),
  plugins:[svelte()],
  server:{host:'127.0.0.1',port:39170,strictPort:true,fs:{allow:[fileURLToPath(new URL('../../',import.meta.url)),'/tmp/liquidity-native-modnet/liquidity-studio/node_modules']}}
});
