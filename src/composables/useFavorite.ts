import { useWebExtStorage } from '@/composables/useWebExtStorage'
import type { TabItem } from '@/components/tabs'
import { v4 as uuidV4 } from 'uuid'

const { data: favorites, dataReady: favoritesReady } = useWebExtStorage('favorites', [
  {
    id: 'default',
    label: '默认收藏夹',
    value: 'default',
    icon: 'material-symbols:star-outline-rounded',
    activeIcon: 'material-symbols:star-rounded',
  },
] as TabItem[])

export function useFavorite() {
  // 添加收藏夹
  const addFavorite = (favorite: TabItem) => {
    const id = uuidV4()
    const newFavorite: TabItem = {
      id,
      label: favorite.label,
      value: id,
      icon: favorite?.icon,
      activeIcon: favorite?.activeIcon,
    }
    favorites.value = [...favorites.value, newFavorite]
  }

  // 在指定位置添加收藏夹
  const addFavoriteAtPosition = (favorite: TabItem, position: number) => {
    const id = uuidV4()
    const newFavorite: TabItem = {
      id,
      label: favorite.label,
      value: id,
      icon: favorite?.icon,
      activeIcon: favorite?.activeIcon,
    }
    const newFavorites = [...favorites.value]
    newFavorites.splice(position, 0, newFavorite)
    favorites.value = newFavorites
  }

  // 删除收藏夹
  const removeFavorite = (favoriteId: string) => {
    favorites.value = favorites.value.filter((item) => item.id !== favoriteId)
  }

  // 更新收藏夹
  const updateFavorite = (favorite: TabItem) => {
    favorites.value = favorites.value.map((item) => (item.id === favorite.id ? favorite : item))
  }

  // 根据ID获取收藏夹
  const getFavoriteById = (id: string) => {
    return favorites.value.find((item) => item.id === id)
  }

  // 根据value获取收藏夹
  const getFavoriteByValue = (value: string) => {
    return favorites.value.find((item) => item.value === value)
  }

  // 更新收藏夹顺序
  const updateFavoritesOrder = (oldIndex: number, newIndex: number) => {
    const newFavorites = [...favorites.value]
    const [movedItem] = newFavorites.splice(oldIndex, 1)
    newFavorites.splice(newIndex, 0, movedItem)
    favorites.value = newFavorites
  }

  return {
    favorites,
    favoritesReady,
    addFavorite,
    addFavoriteAtPosition,
    removeFavorite,
    updateFavorite,
    getFavoriteById,
    getFavoriteByValue,
    updateFavoritesOrder,
  }
}
