import { ref } from 'vue'
import { bookmarks } from 'webextension-polyfill'
import { useFavorite } from '@/composables/useFavorite'
import { useSite } from '@/composables/useSite'
import type { BookmarkTreeNode } from '@/types/bookmark'
import type { SiteData } from '@/newtab/components/SiteCardGrid.vue'
import type { TabItem } from '@/components/tabs'
import { v4 as uuidV4 } from 'uuid'
import { getFavicon, urlToBase64 } from '@/lib/utils'

const isSyncing = ref(false)

export function useBookmarkSync() {
  const { addFavorite, favorites } = useFavorite()
  const { addSite } = useSite()

  /**
   * 从浏览器同步书签
   */
  const syncBrowserBookmarks = async () => {
    if (isSyncing.value) return

    try {
      isSyncing.value = true

      // 获取浏览器书签树
      const bookmarkTree = await bookmarks.getTree()

      if (!bookmarkTree || bookmarkTree.length === 0) {
        throw new Error('无法获取浏览器书签')
      }

      // 处理书签树
      await processBookmarkTree(bookmarkTree)
    } catch (error) {
      console.error('同步浏览器书签失败:', error)
      throw error
    } finally {
      isSyncing.value = false
    }
  }

  /**
   * 处理书签树结构
   */
  const processBookmarkTree = async (nodes: BookmarkTreeNode[]) => {
    for (const node of nodes) {
      if (node.children) {
        // 这是一个文件夹
        await processFolderNode(node)
      }
    }
  }

  /**
   * 处理书签文件夹节点
   */
  const processFolderNode = async (folderNode: BookmarkTreeNode) => {
    if (!folderNode.children) return

    // 跳过根节点和一些系统文件夹
    if (!folderNode.title || folderNode.title === 'Bookmarks bar' || folderNode.title === '书签栏') {
      // 对于书签栏，直接处理其子项
      for (const child of folderNode.children) {
        if (child.children) {
          await processFolderNode(child)
        } else if (child.url) {
          // 书签栏中的直接书签放入默认收藏夹
          await addBookmarkToFavorite(child, 'default')
        }
      }
      return
    }

    // 检查是否已存在同名收藏夹
    const existingFavorite = favorites.value.find((fav) => fav.label === folderNode.title)
    let favoriteId: string | undefined

    if (existingFavorite) {
      favoriteId = existingFavorite.id
    } else {
      // 创建新的收藏夹
      const newFavorite: TabItem = {
        label: folderNode.title,
        value: '',
        icon: 'material-symbols:folder-outline',
        activeIcon: 'material-symbols:folder',
      }
      addFavorite(newFavorite)

      // 获取新创建的收藏夹ID
      const createdFavorite = favorites.value.find((fav) => fav.label === folderNode.title)
      favoriteId = createdFavorite?.id || 'default'
    }

    // 处理文件夹中的书签
    for (const child of folderNode.children) {
      if (child.children) {
        // 递归处理子文件夹
        await processFolderNode(child)
      } else if (child.url) {
        // 添加书签到对应收藏夹
        await addBookmarkToFavorite(child, typeof favoriteId === 'string' ? favoriteId : 'default')
      }
    }
  }

  /**
   * 将书签添加到指定收藏夹
   */
  const addBookmarkToFavorite = async (bookmark: BookmarkTreeNode, favoriteId: string) => {
    if (!bookmark.url || !bookmark.title) return

    try {
      // 尝试获取网站图标
      let imageUrl = ''
      try {
        // 构造favicon URL
        const url = new URL(bookmark.url)
        // const faviconUrl = `${url.protocol}//${url.hostname}/favicon.ico`
        const faviconUrl = getFavicon(`${url.protocol}//${url.hostname}`)
        imageUrl = await urlToBase64(faviconUrl)
      } catch (error) {
        // 如果获取favicon失败，使用默认图标
        console.warn('获取favicon失败:', error)
        imageUrl =
          'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEyIDJMMTMuMDkgOC4yNkwyMCA5TDEzLjA5IDE1Ljc0TDEyIDIyTDEwLjkxIDE1Ljc0TDQgOUwxMC45MSA4LjI2TDEyIDJaIiBmaWxsPSJjdXJyZW50Q29sb3IiLz4KPC9zdmc+'
      }

      // 创建网站数据
      const siteData: SiteData = {
        id: uuidV4(),
        title: bookmark.title,
        url: bookmark.url,
        imageUrl,
        favoriteId,
      }

      // 添加到网站列表
      addSite(siteData)
    } catch (error) {
      console.error('添加书签失败:', error)
    }
  }

  return {
    isSyncing,
    syncBrowserBookmarks,
  }
}
