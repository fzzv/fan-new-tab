import { computed } from 'vue'
import { useSite } from '@/composables/useSite'
import { useSettings } from '@/composables/useSettings'
import type { SiteData } from '@/newtab/components/SiteCardGrid.vue'

// 自动计算的面板数据接口
export interface AutoPanelData {
  id: string
  sites: SiteData[]
  startIndex: number
  endIndex: number
}

export function useStandardModeAuto() {
  const { sites } = useSite()
  const { currentLayoutConfig } = useSettings()

  // 计算每个面板的最大容量
  const panelCapacity = computed(() => {
    const rows = currentLayoutConfig.value.rows
    const cols = currentLayoutConfig.value.cols
    return rows * cols
  })

  // 计算需要的面板数量
  const totalPanels = computed(() => {
    if (sites.value.length === 0) return 1
    return Math.ceil(sites.value.length / panelCapacity.value)
  })

  // 自动生成面板数据
  const panels = computed<AutoPanelData[]>(() => {
    const panelList: AutoPanelData[] = []
    const capacity = panelCapacity.value
    
    for (let i = 0; i < totalPanels.value; i++) {
      const startIndex = i * capacity
      const endIndex = Math.min(startIndex + capacity, sites.value.length)
      const panelSites = sites.value.slice(startIndex, endIndex)
      
      panelList.push({
        id: `auto-panel-${i + 1}`,
        sites: panelSites,
        startIndex,
        endIndex
      })
    }
    
    return panelList
  })

  // 获取指定面板的网站数据
  const getPanelSites = (panelIndex: number): SiteData[] => {
    if (panelIndex < 0 || panelIndex >= panels.value.length) {
      return []
    }
    return panels.value[panelIndex].sites
  }

  // 更新网站数据（处理拖拽排序）
  const updateSites = (newSites: SiteData[]) => {
    // 这里需要调用 useSite 的更新方法
    // 由于我们直接使用 sites.value，这个会自动触发重新计算
    sites.value.splice(0, sites.value.length, ...newSites)
  }

  // 处理面板内拖拽排序
  const updatePanelSites = (panelIndex: number, newPanelSites: SiteData[]) => {
    if (panelIndex < 0 || panelIndex >= panels.value.length) {
      return false
    }

    const panel = panels.value[panelIndex]
    const capacity = panelCapacity.value
    
    // 创建新的完整网站列表
    const newSites = [...sites.value]
    
    // 替换指定面板的网站数据
    const startIndex = panel.startIndex
    const sitesToReplace = Math.min(newPanelSites.length, capacity)
    
    // 移除原有的网站
    newSites.splice(startIndex, panel.sites.length)
    
    // 插入新的网站
    newSites.splice(startIndex, 0, ...newPanelSites.slice(0, sitesToReplace))
    
    // 更新全局网站数据
    updateSites(newSites)
    return true
  }

  // 处理跨面板拖拽
  const moveSiteBetweenPanels = (
    fromPanelIndex: number,
    toPanelIndex: number,
    siteIndex: number,
    targetIndex: number
  ) => {
    if (
      fromPanelIndex < 0 || fromPanelIndex >= panels.value.length ||
      toPanelIndex < 0 || toPanelIndex >= panels.value.length
    ) {
      return false
    }

    const fromPanel = panels.value[fromPanelIndex]
    const toPanel = panels.value[toPanelIndex]
    
    if (siteIndex < 0 || siteIndex >= fromPanel.sites.length) {
      return false
    }

    // 检查目标面板是否有空间
    if (toPanel.sites.length >= panelCapacity.value) {
      return false
    }

    const newSites = [...sites.value]
    const siteToMove = fromPanel.sites[siteIndex]
    
    // 从原位置移除
    const globalFromIndex = fromPanel.startIndex + siteIndex
    newSites.splice(globalFromIndex, 1)
    
    // 计算目标位置
    const globalToIndex = toPanel.startIndex + Math.min(targetIndex, toPanel.sites.length)
    
    // 插入到新位置
    newSites.splice(globalToIndex, 0, siteToMove)
    
    // 更新全局网站数据
    updateSites(newSites)
    return true
  }

  // 添加网站到指定面板
  const addSiteToPanel = (panelIndex: number, site: SiteData) => {
    if (panelIndex < 0 || panelIndex >= panels.value.length) {
      return false
    }

    const panel = panels.value[panelIndex]
    
    // 检查面板是否有空间
    if (panel.sites.length >= panelCapacity.value) {
      return false
    }

    const newSites = [...sites.value]
    const insertIndex = panel.endIndex
    
    // 在面板末尾插入新网站
    newSites.splice(insertIndex, 0, site)
    
    // 更新全局网站数据
    updateSites(newSites)
    return true
  }

  // 从面板中移除网站
  const removeSiteFromPanel = (panelIndex: number, siteIndex: number) => {
    if (panelIndex < 0 || panelIndex >= panels.value.length) {
      return false
    }

    const panel = panels.value[panelIndex]
    
    if (siteIndex < 0 || siteIndex >= panel.sites.length) {
      return false
    }

    const newSites = [...sites.value]
    const globalIndex = panel.startIndex + siteIndex
    
    // 移除网站
    newSites.splice(globalIndex, 1)
    
    // 更新全局网站数据
    updateSites(newSites)
    return true
  }

  return {
    // 计算属性
    panels,
    totalPanels,
    panelCapacity,
    
    // 方法
    getPanelSites,
    updatePanelSites,
    moveSiteBetweenPanels,
    addSiteToPanel,
    removeSiteFromPanel,
    updateSites,
  }
}
