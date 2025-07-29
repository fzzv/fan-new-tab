import fs from 'fs-extra'
import { isDev, port } from '../scripts/utils'
import type { Manifest } from 'webextension-polyfill'

export async function getManifest() {
  const pkg = await fs.readJson('package.json')

  const manifest: Manifest.WebExtensionManifest = {
    manifest_version: 3,
    name: pkg.displayName || pkg.name,
    version: pkg.version,
    description: pkg.description,
    action: {
      default_icon: './assets/logo.png',
      default_popup: './dist/popup/index.html',
    },
    chrome_url_overrides: {
      newtab: './dist/newtab/index.html',
    },
    icons: {
      16: './assets/logo.png',
      48: './assets/logo.png',
      128: './assets/logo.png',
    },
    commands: {
      'open-command-palette': {
        suggested_key: {
          default: 'Ctrl+Shift+K',
          mac: 'Command+Shift+K',
        },
        description: 'Open command palette',
      },
    },
    background: {
      service_worker: 'dist/background/index.js',
    },
    permissions: ['tabs', 'storage', 'activeTab', 'sidePanel', 'bookmarks', 'history', 'browsingData'],
    host_permissions: ['*://*/*'],
    content_scripts: [
      {
        matches: ['<all_urls>'],
        js: ['dist/content/index.global.js'],
        css: ['dist/content/style.css'],
        run_at: 'document_end',
      },
    ],
    content_security_policy: {
      extension_pages: isDev
        ? // 开发模式下，允许加载未经验证的内容脚本，以方便调试
          `script-src 'self' http://localhost:${port}; object-src 'self'`
        : "script-src 'self'; object-src 'self'",
    },
    web_accessible_resources: [
      {
        resources: ['assets/*', 'dist/content/*'],
        matches: ['<all_urls>'],
      },
    ],
  }

  return manifest
}
