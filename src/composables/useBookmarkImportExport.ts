import { ref } from 'vue'
import { saveAs } from 'file-saver'
import { useFavorite } from '@/composables/useFavorite'
import { useSite } from '@/composables/useSite'
import type {
  ParsedBookmark,
  ParsedBookmarkFolder,
  BookmarkImportResult,
  BookmarkExportOptions,
} from '@/types/bookmark'
import type { SiteData } from '@/newtab/components/SiteCardGrid.vue'
import type { TabItem } from '@/components/tabs'
import { v4 as uuidV4 } from 'uuid'

export function useBookmarkImportExport() {
  const isImporting = ref(false)
  const isExporting = ref(false)

  const { addFavorite, favorites } = useFavorite()
  const { addSite, sites } = useSite()

  /**
   * 导入HTML书签文件
   */
  const importBookmarks = async (file: File): Promise<BookmarkImportResult> => {
    if (isImporting.value) throw new Error('正在导入中，请稍候')

    try {
      isImporting.value = true

      // 读取文件内容
      const content = await readFileAsText(file)

      // 解析HTML书签
      const parsedData = parseBookmarkHTML(content)

      // 导入到应用中
      const result = await importParsedBookmarks(parsedData)

      return result
    } catch (error) {
      console.error('导入书签失败:', error)
      throw error
    } finally {
      isImporting.value = false
    }
  }

  /**
   * 导出书签为HTML文件
   */
  const exportBookmarks = async (options: BookmarkExportOptions = {}) => {
    if (isExporting.value) throw new Error('正在导出中，请稍候')

    try {
      isExporting.value = true

      const { includeIcons = true, filename = 'bookmarks.html', includeTimestamps = true } = options

      // 生成HTML内容
      const htmlContent = generateBookmarkHTML(includeIcons, includeTimestamps)

      // 创建并下载文件
      const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' })
      saveAs(blob, filename)
    } catch (error) {
      console.error('导出书签失败:', error)
      throw error
    } finally {
      isExporting.value = false
    }
  }

  /**
   * 读取文件为文本
   */
  const readFileAsText = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        if (typeof e.target?.result === 'string') {
          resolve(e.target.result)
        } else {
          reject(new Error('文件读取失败'))
        }
      }
      reader.onerror = () => reject(new Error('文件读取错误'))
      reader.readAsText(file, 'utf-8')
    })
  }

  /**
   * 解析Chrome书签HTML格式
   */
  const parseBookmarkHTML = (html: string): ParsedBookmarkFolder[] => {
    // 创建临时DOM元素来解析HTML
    const parser = new DOMParser()
    const doc = parser.parseFromString(html, 'text/html')

    const folders: ParsedBookmarkFolder[] = []

    // 查找所有的H3标签（文件夹）
    const h3Elements = doc.querySelectorAll('H3')

    h3Elements.forEach((h3) => {
      const folder = parseFolderElement(h3)
      if (folder) {
        folders.push(folder)
      }
    })

    return folders
  }

  /**
   * 解析文件夹元素
   */
  const parseFolderElement = (h3Element: Element): ParsedBookmarkFolder | null => {
    const title = h3Element.textContent?.trim()
    if (!title) return null

    const addDate = h3Element.getAttribute('ADD_DATE')
    const lastModified = h3Element.getAttribute('LAST_MODIFIED')

    const folder: ParsedBookmarkFolder = {
      title,
      addDate: addDate ? parseInt(addDate) * 1000 : undefined,
      lastModified: lastModified ? parseInt(lastModified) * 1000 : undefined,
      bookmarks: [],
      subfolders: [],
    }

    // 查找紧跟在H3后面的DL元素
    let nextElement = h3Element.nextElementSibling
    while (nextElement && nextElement.tagName !== 'DL') {
      nextElement = nextElement.nextElementSibling
    }

    if (nextElement && nextElement.tagName === 'DL') {
      // 解析DL中的书签和子文件夹
      const dtElements = nextElement.querySelectorAll(':scope > DT')

      dtElements.forEach((dt) => {
        const aElement = dt.querySelector('A')
        const h3Element = dt.querySelector('H3')

        if (aElement) {
          // 这是一个书签
          const bookmark = parseBookmarkElement(aElement)
          if (bookmark) {
            folder.bookmarks.push(bookmark)
          }
        } else if (h3Element) {
          // 这是一个子文件夹
          const subfolder = parseFolderElement(h3Element)
          if (subfolder) {
            folder.subfolders.push(subfolder)
          }
        }
      })
    }

    return folder
  }

  /**
   * 解析书签元素
   */
  const parseBookmarkElement = (aElement: Element): ParsedBookmark | null => {
    const url = aElement.getAttribute('HREF')
    const title = aElement.textContent?.trim()

    if (!url || !title) return null

    const addDate = aElement.getAttribute('ADD_DATE')
    const icon = aElement.getAttribute('ICON')

    return {
      title,
      url,
      addDate: addDate ? parseInt(addDate) * 1000 : undefined,
      icon: icon || undefined,
    }
  }

  /**
   * 导入解析后的书签数据
   */
  const importParsedBookmarks = async (folders: ParsedBookmarkFolder[]): Promise<BookmarkImportResult> => {
    let totalBookmarks = 0
    let totalFolders = 0
    let createdFavorites = 0
    let addedSites = 0

    for (const folder of folders) {
      totalFolders++

      // 检查是否已存在同名收藏夹
      let existingFavorite = favorites.value.find((fav) => fav.label === folder.title)
      let favoriteId: string | undefined

      if (existingFavorite) {
        favoriteId = existingFavorite.id
      } else {
        // 创建新收藏夹
        const newFavorite: TabItem = {
          label: folder.title,
          value: '',
          icon: 'material-symbols:folder-outline',
          activeIcon: 'material-symbols:folder',
        }
        addFavorite(newFavorite)
        createdFavorites++

        // 获取新创建的收藏夹ID
        existingFavorite = favorites.value.find((fav) => fav.label === folder.title)
        favoriteId = existingFavorite?.id || 'default'
      }

      // 添加书签到收藏夹
      for (const bookmark of folder.bookmarks) {
        totalBookmarks++

        const siteData: SiteData = {
          id: uuidV4(),
          title: bookmark.title,
          url: bookmark.url,
          imageUrl: bookmark.icon || generateDefaultIcon(),
          favoriteId,
        }

        addSite(siteData)
        addedSites++
      }

      // 递归处理子文件夹
      if (folder.subfolders.length > 0) {
        const subResult = await importParsedBookmarks(folder.subfolders)
        totalBookmarks += subResult.totalBookmarks
        totalFolders += subResult.totalFolders
        createdFavorites += subResult.createdFavorites
        addedSites += subResult.addedSites
      }
    }

    return {
      totalBookmarks,
      totalFolders,
      createdFavorites,
      addedSites,
    }
  }

  /**
   * 生成默认图标
   */
  const generateDefaultIcon = (): string => {
    return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEyIDJMMTMuMDkgOC4yNkwyMCA5TDEzLjA5IDE1Ljc0TDEyIDIyTDEwLjkxIDE1Ljc0TDQgOUwxMC45MSA4LjI2TDEyIDJaIiBmaWxsPSJjdXJyZW50Q29sb3IiLz4KPC9zdmc+'
  }

  /**
   * 生成书签HTML内容
   */
  const generateBookmarkHTML = (includeIcons: boolean, includeTimestamps: boolean): string => {
    const timestamp = includeTimestamps ? Math.floor(Date.now() / 1000) : 0

    let html = `<!DOCTYPE NETSCAPE-Bookmark-file-1>
<!-- This is an automatically generated file.
     It will be read and overwritten.
     DO NOT EDIT! -->
<META HTTP-EQUIV="Content-Type" CONTENT="text/html; charset=UTF-8">
<TITLE>Bookmarks</TITLE>
<H1>Bookmarks</H1>
<DL><p>
`

    // 为每个收藏夹生成HTML
    favorites.value.forEach((favorite) => {
      const favoriteSites = sites.value.filter((site) => site.favoriteId === favorite.id)

      if (favoriteSites.length > 0) {
        html += `    <DT><H3 ADD_DATE="${timestamp}" LAST_MODIFIED="${timestamp}">${escapeHtml(favorite.label)}</H3>\n`
        html += `    <DL><p>\n`

        favoriteSites.forEach((site) => {
          const iconAttr = includeIcons && site.imageUrl ? ` ICON="${site.imageUrl}"` : ''
          const addDateAttr = includeTimestamps ? ` ADD_DATE="${timestamp}"` : ''

          html += `        <DT><A HREF="${escapeHtml(site.url || '')}"${addDateAttr}${iconAttr}>${escapeHtml(site.title)}</A>\n`
        })

        html += `    </DL><p>\n`
      }
    })

    html += `</DL><p>`

    return html
  }

  /**
   * HTML转义
   */
  const escapeHtml = (text: string): string => {
    const div = document.createElement('div')
    div.textContent = text
    return div.innerHTML
  }

  return {
    isImporting,
    isExporting,
    importBookmarks,
    exportBookmarks,
  }
}
