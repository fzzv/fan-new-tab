// 浏览器书签节点接口（基于Chrome书签API）
export interface BookmarkTreeNode {
  id: string
  parentId?: string
  index?: number
  url?: string
  title: string
  dateAdded?: number
  dateGroupModified?: number
  children?: BookmarkTreeNode[]
}

// HTML书签解析结果
export interface ParsedBookmark {
  title: string
  url: string
  addDate?: number
  icon?: string
  folder?: string
}

// HTML书签文件夹结构
export interface ParsedBookmarkFolder {
  title: string
  addDate?: number
  lastModified?: number
  bookmarks: ParsedBookmark[]
  subfolders: ParsedBookmarkFolder[]
}

// 书签导入结果
export interface BookmarkImportResult {
  totalBookmarks: number
  totalFolders: number
  createdFavorites: number
  addedSites: number
}

// 书签导出配置
export interface BookmarkExportOptions {
  includeIcons?: boolean
  filename?: string
  includeTimestamps?: boolean
}

// Chrome书签HTML格式的DT元素类型
export interface ChromeBookmarkElement {
  tagName: string
  href?: string
  title?: string
  addDate?: string
  icon?: string
  textContent?: string
  children?: ChromeBookmarkElement[]
}
