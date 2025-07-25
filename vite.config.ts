import { defineConfig, type UserConfig } from 'vite'
import { dirname, relative } from 'node:path'
import vue from '@vitejs/plugin-vue'
import { r, isDev, port } from './scripts/utils'
import packageJson from './package.json'
import AutoImport from 'unplugin-auto-import/vite'
import tailwindcss from '@tailwindcss/vite'

export const commonConfig: UserConfig = {
  root: r('src'), // 开发服务器启动和构建时的基础目录
  resolve: {
    alias: {
      '@/': `${r('src')}/`,
    },
  },
  plugins: [
    vue(),
    tailwindcss(),
    AutoImport({
      imports: [
        'vue',
        {
          'webextension-polyfill': [['=', 'browser']],
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
  optimizeDeps: {
    include: ['vue', 'webextension-polyfill'],
  },
}

// https://vite.dev/config/
export default defineConfig(({ command }) => ({
  ...commonConfig,
  define: {
    __DEV__: isDev,
    __NAME__: JSON.stringify(packageJson.name),
  },
  base: command === 'serve' ? `http://localhost:${port}/` : '/dist/',
  server: {
    port,
    hmr: {
      host: 'localhost',
    },
    origin: `http://localhost:${port}`,
    proxy: {
      '/api': {
        target: 'http://wallpaper.xyu.fan/api/v1',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
  build: {
    watch: isDev ? {} : undefined,
    outDir: r('extension/dist'),
    emptyOutDir: false,
    sourcemap: isDev ? 'inline' : false,
    terserOptions: {
      mangle: false,
    },
    rollupOptions: {
      input: {
        popup: r('src/popup/index.html'),
        newtab: r('src/newtab/index.html'),
      },
    },
  },
}))
