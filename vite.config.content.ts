import { defineConfig } from 'vite'
import { commonConfig } from './vite.config'
import { isDev, r } from './scripts/utils'
import packageJson from './package.json'

// 使用 vite 打包 content 的内容
export default defineConfig({
  ...commonConfig,
  define: {
    __DEV__: isDev,
    __NAME__: JSON.stringify(packageJson.name),
    'process.env.NODE_ENV': JSON.stringify(isDev ? 'development' : 'production'),
  },
  build: {
    watch: isDev ? {} : undefined,
    outDir: r('extension/dist/content'),
    cssCodeSplit: false,
    emptyOutDir: false,
    sourcemap: isDev ? 'inline' : false,
    lib: {
      entry: r('src/content/index.ts'),
      name: packageJson.name,
      formats: ['iife'],
    },
    rollupOptions: {
      output: {
        entryFileNames: 'index.global.js',
        assetFileNames: (assetInfo) => {
          if (assetInfo.name?.endsWith('.css')) {
            return 'style.css'
          }
          return assetInfo.name || 'assets/[name].[ext]'
        },
        extend: true,
      },
    },
  },
})
