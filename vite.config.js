import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import path from 'path'
import ElementPlus from 'unplugin-element-plus/vite'

export default defineConfig({
  plugins: [
    vue(),
    vueJsx(),
    ElementPlus({
      useSource: true,
    })
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  build: {
    lib: {
      entry: {
        index: path.resolve(__dirname, 'src/index.js'),
        locale: path.resolve(__dirname, 'src/core/i18n/index.js'),
      },
      name: 'MyComponents',
      formats: ['es']
    },
    rollupOptions: {
      external: (id) =>
        id === 'vue' ||
        id === 'element-plus' ||
        id.startsWith('element-plus/') ||
        id.startsWith('@element-plus/'),
      output: {
        globals: {
          vue: 'Vue',
          'element-plus': 'ElementPlus'
        }
      }
    },
  },
})