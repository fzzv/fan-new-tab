import { defineConfig } from 'vite'
import { commonConfig } from './vite.config'
import { isDev, r } from './scripts/utils'
import packageJson from './package.json'

// 使用 vite 打包 background 内容
export default defineConfig({
  ...commonConfig,
  define: {
    __DEV__: isDev,
    __NAME__: JSON.stringify(packageJson.name),
    'process.env.NODE_ENV': JSON.stringify(isDev ? 'development' : 'production'),
  },
  build: {
    watch: isDev ? {} : undefined,
    outDir: r('extension/dist/background'),
    cssCodeSplit: false,
    emptyOutDir: false,
    sourcemap: isDev ? 'inline' : false,
    lib: {
      entry: r('src/background/index.ts'),
      name: packageJson.name,
      formats: ['iife'],
    },
    rollupOptions: {
      output: {
        entryFileNames: 'index.js',
        extend: true,
      },
    },
  },
})
