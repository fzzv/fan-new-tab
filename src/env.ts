const forbiddenProtocols = [
  'chrome-extension://',
  'chrome-search://',
  'chrome://',
  'devtools://',
  'edge://',
  'https://chrome.google.com/webstore',
]

/**
 * 是否是基于 Chromium 的浏览器
 * @param url
 */
export function isForbiddenUrl(url: string): boolean {
  return forbiddenProtocols.some((protocol) => url.startsWith(protocol))
}

// 是否为 firefox 浏览器
export const isFirefox = navigator.userAgent.includes('Firefox')
