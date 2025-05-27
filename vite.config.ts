import { defineConfig } from 'vite'
import { dirname, relative } from 'node:path'
import vue from '@vitejs/plugin-vue'
import { r, isDev, port } from './scripts/utils'
import packageJson from './package.json'
import AutoImport from 'unplugin-auto-import/vite'

// https://vite.dev/config/
export default defineConfig(({ command }) => ({
  root: r('src'), // 开发服务器启动和构建时的基础目录
  resolve: {
    alias: {
      '@/': `${r('src')}/`,
    },
  },
  define: {
    __DEV__: isDev,
    __NAME__: JSON.stringify(packageJson.name),
  },
  plugins: [
    vue(),
    AutoImport({
      imports: [
        'vue',
        {
          'webextension-polyfill': [
            ['=', 'browser'],
          ],
        },
      ],
    }),
    {
      name: 'assets-rewrite',
      enforce: 'post',
      apply: 'build',
      transformIndexHtml(html, { path }) {
        return html.replace(/"\/assets\//g, `"${relative(dirname(path), '/assets')}/`)
      },
    },
  ],
  base: command === 'serve' ? `http://localhost:${port}/` : '/dist/',
  server: {
    port,
    hmr: {
      host: 'localhost',
    },
    origin: `http://localhost:${port}`,
  },
  build: {
    watch: isDev
      ? {}
      : undefined,
    outDir: r('extension/dist'),
    emptyOutDir: false,
    sourcemap: isDev ? 'inline' : false,
  },
  rollupOptions: {
    popup: r('src/popup/index.html'),
    newtab: r('src/newtab/index.html')
  },
}))
