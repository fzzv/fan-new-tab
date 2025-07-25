import { isFirefox, isForbiddenUrl } from '@/env'

// 火狐浏览器会从缓存中获取文件，而不会从磁盘重新加载更改内容
// HMR 不适用于基于 Chromium 的浏览器
browser.webNavigation.onCommitted.addListener(({ tabId, frameId, url }) => {
  // 过滤掉非主窗口事件
  if (frameId !== 0) return

  if (isForbiddenUrl(url)) return

  // 注入最新的 script
  browser.tabs
    .executeScript(tabId, {
      file: `${isFirefox ? '' : '.'}/dist/content/index.global.js`,
      runAt: 'document_end',
    })
    .catch((error) => console.error(error))
})
