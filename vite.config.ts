import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';
export default defineConfig({ plugins: [vue(), tailwindcss()], resolve: { alias: { '@': path.resolve(__dirname, './client/src') } }, root: 'client', server: { port: 5173, proxy: { '/api': { target: 'http://localhost:4000', changeOrigin: true } } }, build: { outDir: '../dist-client', emptyOutDir: true } });
