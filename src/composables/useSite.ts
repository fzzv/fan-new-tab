import { useWebExtStorage } from '@/composables/useWebExtStorage.ts'
import type { SiteData } from '@/newtab/components/SiteCardGrid.vue'

const { data: sites, dataReady: sitesReady } = useWebExtStorage('sites', [] as SiteData[])
export function useSite() {
  const addSite = (site: SiteData) => {
    sites.value = [...sites.value, site]
  }

  const removeSite = (site: SiteData) => {
    sites.value = sites.value.filter((s) => s.id !== site.id)
  }

  const updateSite = (site: SiteData) => {
    sites.value = sites.value.map((s) => (s.id === site.id ? site : s))
  }

  return {
    sites,
    sitesReady,
    addSite,
    removeSite,
    updateSite,
  }
}
