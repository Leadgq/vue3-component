import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import path from 'path'

const elementNamespaceScss = path
  .resolve(__dirname, 'src/styles/element/index.scss')
  .replace(/\\/g, '/')

export default defineConfig({
  plugins: [
    vue(),
    vueJsx(),
    // 不在库构建里用 unplugin-element-plus 按需注入样式：
    // 那些入口会绕过 namespace forward，打出 .el-*；主题统一由 style/index.scss 全量引入。
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  css: {
    preprocessorOptions: {
      scss: {
        // 业务 scss 编译前注入 $namespace=ep；跳过 node_modules 避免循环
        additionalData: (source, filename) => {
          const file = typeof filename === 'string' ? filename : ''
          if (
            file.includes('node_modules') ||
            file.replace(/\\/g, '/').endsWith('styles/element/index.scss')
          ) {
            return source
          }
          return `@use "${elementNamespaceScss}" as *;\n${source}`
        },
      },
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
      // vue-office / file-saver / xgplayer 勿打进 dist 异步 chunk：
      // 宿主 webpack + npm link 会把相对路径 chunk 解析成错误 publicPath（如 localhost:60001/C_Users_...）
      external: (id) =>
        id === 'vue' ||
        id === 'element-plus' ||
        id.startsWith('element-plus/') ||
        id.startsWith('@element-plus/') ||
        id.startsWith('@vue-office/') ||
        id === 'file-saver' ||
        id === 'xgplayer' ||
        id.startsWith('xgplayer/') ||
        id === 'yo-pc-ui-theme' ||
        id.startsWith('yo-pc-ui-theme/'),
      output: {
        globals: {
          vue: 'Vue',
          'element-plus': 'ElementPlus',
          'yo-pc-ui-theme': 'YoPcUiTheme',
        }
      }
    },
  },
})
