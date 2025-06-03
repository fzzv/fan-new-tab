import { TabsRoot, TabsIndicator } from 'reka-ui'
import TabsList from './TabsList.vue'
import TabsTrigger from './TabsTrigger.vue'
import TabsContent from './TabsContent.vue'
import Tabs from './Tabs.vue'

export interface TabItem {
  label: string
  value: string
  icon?: string
  activeIcon?: string
}

export { TabsRoot, TabsIndicator, TabsList, TabsTrigger, TabsContent, Tabs }
