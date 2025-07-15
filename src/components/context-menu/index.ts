import ContextMenu from './ContextMenu.vue'
import ContextMenuItem from './ContextMenuItem.vue'
import type { TabItem } from '../tabs'

export interface MenuItemType extends Partial<TabItem> {
  label: string
  icon?: string
  disabled?: boolean
  click?: (item?: any) => void
}

export { ContextMenu, ContextMenuItem }
