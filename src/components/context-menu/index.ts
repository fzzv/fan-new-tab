import ContextMenu from './ContextMenu.vue'
import ContextMenuItem from './ContextMenuItem.vue'

export interface MenuItemType {
  label: string
  icon?: string
  disabled?: boolean
  click?: () => void
}

export { ContextMenu, ContextMenuItem }
