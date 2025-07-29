import browser from 'webextension-polyfill'

export class ContentActionHandler {
  // 用于处理上下文执行的操作
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async handleAction(action: string, _data?: any) {
    switch (action) {
      case 'copy-url':
        await this.copyToClipboard(window.location.href)
        break

      case 'copy-title':
        await this.copyToClipboard(document.title)
        break

      case 'save-page':
        this.triggerKeyboardShortcut('s', { ctrlKey: true })
        break

      case 'print-page':
        window.print()
        break

      case 'find-in-page':
        this.triggerKeyboardShortcut('f', { ctrlKey: true })
        break

      case 'fullscreen':
        await this.toggleFullscreen()
        break

      case 'open-dev-tools':
        this.triggerKeyboardShortcut('F12')
        break

      case 'inspect-element':
        this.triggerKeyboardShortcut('i', { ctrlKey: true, shiftKey: true })
        break

      case 'console':
        this.triggerKeyboardShortcut('j', { ctrlKey: true, shiftKey: true })
        break

      case 'network-tab':
      case 'performance-tab':
      case 'application-tab':
      case 'security-tab':
        // Open dev tools first, then navigate to specific tab
        this.triggerKeyboardShortcut('F12')
        // Note: Specific tab navigation would require more complex implementation
        break

      case 'toggle-javascript':
        // This would require site settings API or content script injection
        console.log('JavaScript toggle not implemented - requires site settings API')
        break

      case 'toggle-images':
        // This would require site settings API
        console.log('Image toggle not implemented - requires site settings API')
        break

      case 'go-back':
        window.history.back()
        break

      case 'go-forward':
        window.history.forward()
        break

      default:
        console.warn(`Unknown content action: ${action}`)
    }
  }

  // Copy text to clipboard using the modern Clipboard API
  private async copyToClipboard(text: string) {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text)
      } else {
        // Fallback for older browsers or non-secure contexts
        const textArea = document.createElement('textarea')
        textArea.value = text
        textArea.style.position = 'fixed'
        textArea.style.left = '-999999px'
        textArea.style.top = '-999999px'
        document.body.appendChild(textArea)
        textArea.focus()
        textArea.select()
        document.execCommand('copy')
        textArea.remove()
      }

      // Show a brief notification
      this.showNotification(`Copied: ${text.length > 50 ? text.substring(0, 50) + '...' : text}`)
    } catch (error) {
      console.error('Failed to copy to clipboard:', error)
      this.showNotification('Failed to copy to clipboard', 'error')
    }
  }

  // Trigger keyboard shortcuts programmatically
  private triggerKeyboardShortcut(
    key: string,
    modifiers: {
      ctrlKey?: boolean
      metaKey?: boolean
      shiftKey?: boolean
      altKey?: boolean
    } = {},
  ) {
    const event = new KeyboardEvent('keydown', {
      key,
      code: key === 'F12' ? 'F12' : `Key${key.toUpperCase()}`,
      ctrlKey: modifiers.ctrlKey || false,
      metaKey: modifiers.metaKey || false,
      shiftKey: modifiers.shiftKey || false,
      altKey: modifiers.altKey || false,
      bubbles: true,
      cancelable: true,
    })

    document.dispatchEvent(event)
  }

  // Toggle fullscreen mode
  private async toggleFullscreen() {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen()
      } else {
        await document.exitFullscreen()
      }
    } catch (error) {
      console.error('Failed to toggle fullscreen:', error)
      this.showNotification('Failed to toggle fullscreen', 'error')
    }
  }

  // Show a brief notification to the user
  private showNotification(message: string, type: 'success' | 'error' = 'success') {
    // Create notification element
    const notification = document.createElement('div')
    notification.className = `command-palette-notification ${type}`
    notification.textContent = message

    // Style the notification
    Object.assign(notification.style, {
      position: 'fixed',
      top: '20px',
      right: '20px',
      padding: '12px 16px',
      backgroundColor: type === 'success' ? '#10b981' : '#ef4444',
      color: 'white',
      borderRadius: '8px',
      fontSize: '14px',
      fontWeight: '500',
      zIndex: '10000',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
      transform: 'translateX(100%)',
      transition: 'transform 0.3s ease-in-out',
      maxWidth: '300px',
      wordWrap: 'break-word',
    })

    // Add to page
    document.body.appendChild(notification)

    // Animate in
    requestAnimationFrame(() => {
      notification.style.transform = 'translateX(0)'
    })

    // Remove after delay
    setTimeout(() => {
      notification.style.transform = 'translateX(100%)'
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification)
        }
      }, 300)
    }, 3000)
  }
}

// Global instance
export const contentActionHandler = new ContentActionHandler()

// Listen for messages from background script
browser.runtime.onMessage.addListener(async (message: any) => {
  if (message.action && message.action !== 'toggle-command-palette') {
    try {
      await contentActionHandler.handleAction(message.action, message?.data)
    } catch (error) {
      console.error('Content action error:', error)
    }
  }
})
