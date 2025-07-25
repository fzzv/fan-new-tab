<script setup lang="ts">
import { ref, computed } from 'vue'
import { CollapsibleRoot, CollapsibleTrigger, CollapsibleContent } from '@/components/collapsible'
import { Icon } from '@iconify/vue'
import Button from '@/components/button/Button.vue'
import { useFavorite } from '@/composables/useFavorite'
import { useBookmarkSync } from '@/composables/useBookmarkSync'
import { useBookmarkImportExport } from '@/composables/useBookmarkImportExport'
import { Modal } from '@/components/modal'
import { toast } from '@/lib/toast'
import { VueDraggableNext } from 'vue-draggable-next'

// 组件属性
interface SettingFavoritesProps {
  title?: string
}

withDefaults(defineProps<SettingFavoritesProps>(), {
  title: '收藏夹管理',
})

// 控制折叠面板的展开状态
const isFavoritesOpen = ref(true)

// 获取收藏夹数据
const { favorites, favoritesReady, removeFavorite, updateFavoritesOrder } = useFavorite()

// 创建可拖拽的收藏夹列表副本
const draggableFavorites = computed({
  get: () => [...favorites.value],
  set: (newValue) => {
    // 当拖拽改变顺序时，找出变化并更新原始数据
    const oldOrder = favorites.value
    const newOrder = newValue

    // 找到被移动的项目
    for (let i = 0; i < newOrder.length; i++) {
      if (oldOrder[i]?.id !== newOrder[i]?.id) {
        const movedItem = newOrder[i]
        const oldIndex = oldOrder.findIndex((item) => item.id === movedItem.id)
        const newIndex = i

        if (oldIndex !== -1 && oldIndex !== newIndex) {
          updateFavoritesOrder(oldIndex, newIndex)
        }
        break
      }
    }
  },
})

// 书签同步功能
const { syncBrowserBookmarks, isSyncing } = useBookmarkSync()

// 导入导出功能
const { importBookmarks, exportBookmarks, isImporting, isExporting } = useBookmarkImportExport()

// 文件输入引用
const fileInputRef = ref<HTMLInputElement>()

// 处理浏览器书签同步
const handleSyncBookmarks = async () => {
  try {
    await syncBrowserBookmarks()
    toast.success('浏览器书签同步成功', { richColors: true })
  } catch (error) {
    toast.error(`同步失败: ${error instanceof Error ? error.message : '未知错误'}`, { richColors: true })
  }
}

// 处理导入书签
const handleImportBookmarks = () => {
  fileInputRef.value?.click()
}

const handleFileChange = async (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]

  if (file) {
    try {
      await importBookmarks(file)
      toast.success('书签导入成功', { richColors: true })
      // 清空文件输入
      if (target) target.value = ''
    } catch (error) {
      toast.error(`导入失败: ${error instanceof Error ? error.message : '未知错误'}`, { richColors: true })
    }
  }
}

// 处理导出书签
const handleExportBookmarks = async () => {
  try {
    await exportBookmarks()
    toast.success('书签导出成功', { richColors: true })
  } catch (error) {
    toast.error(`导出失败: ${error instanceof Error ? error.message : '未知错误'}`, { richColors: true })
  }
}

// 处理删除收藏夹
const handleDeleteFavorite = (favorite: any) => {
  Modal.confirm({
    title: '确认删除',
    icon: 'material-symbols:warning-outline',
    content: `确定要删除收藏夹 "${favorite.label}" 吗？此操作不可撤销，该收藏夹下的所有网站也将被删除。`,
    okText: '确认删除',
    cancelText: '取消',
    onOk: () => {
      removeFavorite(favorite.id)
      toast.success('收藏夹删除成功', { richColors: true })
    },
  })
}

// 处理拖拽排序
const handleDragEnd = (event: any) => {
  const { oldIndex, newIndex } = event
  if (oldIndex !== newIndex && oldIndex !== undefined && newIndex !== undefined) {
    updateFavoritesOrder(oldIndex, newIndex)
    toast.success('收藏夹顺序已更新', { richColors: true })
  }
}
</script>

<template>
  <!-- 可折叠面板 -->
  <CollapsibleRoot v-model:open="isFavoritesOpen" class="w-full" variant="default" size="md">
    <CollapsibleTrigger variant="default" size="md" @click="isFavoritesOpen = !isFavoritesOpen">
      <div class="flex items-center gap-2">
        <Icon icon="material-symbols:bookmark-manager-outline" width="20" height="20" />
        <span class="text-lg font-semibold">{{ title }}</span>
      </div>
      <template #expandIcon>
        <Icon v-if="isFavoritesOpen" icon="radix-icons:cross-2" class="h-4 w-4" />
        <Icon v-else icon="radix-icons:row-spacing" class="h-4 w-4" />
      </template>
    </CollapsibleTrigger>
    <CollapsibleContent variant="default" size="md">
      <div class="p-4 space-y-6">
        <!-- 浏览器书签同步 -->
        <div class="space-y-3">
          <div class="flex items-center justify-between">
            <h3 class="text-sm font-medium">浏览器书签同步</h3>
          </div>
          <p class="text-xs text-muted-foreground">从浏览器同步书签，将书签文件夹映射为收藏夹集合</p>
          <Button @click="handleSyncBookmarks" :disabled="isSyncing" class="w-full">
            <Icon v-if="isSyncing" icon="material-symbols:sync" class="w-4 h-4 mr-2 animate-spin" />
            <Icon v-else icon="material-symbols:sync" class="w-4 h-4 mr-2" />
            {{ isSyncing ? '同步中...' : '同步浏览器书签' }}
          </Button>
        </div>

        <!-- 导入书签 -->
        <div class="space-y-3">
          <div class="flex items-center justify-between">
            <h3 class="text-sm font-medium">导入书签</h3>
          </div>
          <p class="text-xs text-muted-foreground">支持导入Chrome导出的HTML书签文件</p>
          <Button @click="handleImportBookmarks" :disabled="isImporting" variant="outline" class="w-full">
            <Icon v-if="isImporting" icon="material-symbols:upload" class="w-4 h-4 mr-2 animate-pulse" />
            <Icon v-else icon="material-symbols:upload" class="w-4 h-4 mr-2" />
            {{ isImporting ? '导入中...' : '导入书签文件' }}
          </Button>
          <input ref="fileInputRef" type="file" accept=".html,.htm" class="hidden" @change="handleFileChange" />
        </div>

        <!-- 导出书签 -->
        <div class="space-y-3">
          <div class="flex items-center justify-between">
            <h3 class="text-sm font-medium">导出书签</h3>
          </div>
          <p class="text-xs text-muted-foreground">将收藏夹导出为Chrome兼容的HTML书签文件</p>
          <Button @click="handleExportBookmarks" :disabled="isExporting" variant="outline" class="w-full">
            <Icon v-if="isExporting" icon="material-symbols:download" class="w-4 h-4 mr-2 animate-pulse" />
            <Icon v-else icon="material-symbols:download" class="w-4 h-4 mr-2" />
            {{ isExporting ? '导出中...' : '导出书签文件' }}
          </Button>
        </div>

        <!-- 收藏夹列表管理 -->
        <div class="space-y-3">
          <div class="flex items-center justify-between">
            <h3 class="text-sm font-medium">收藏夹排序</h3>
          </div>
          <p class="text-xs text-muted-foreground">拖拽收藏夹项目来重新排序，点击删除按钮移除收藏夹</p>

          <!-- 收藏夹列表 -->
          <div v-if="favoritesReady" class="space-y-2 max-h-60 overflow-y-auto">
            <VueDraggableNext
              v-model="draggableFavorites"
              :animation="200"
              :delay="0"
              :delayOnTouchStart="true"
              :touchStartThreshold="5"
              ghost-class="drag-ghost"
              chosen-class="drag-chosen"
              drag-class="drag-active"
              handle=".drag-handle"
              @end="handleDragEnd"
            >
              <div
                v-for="favorite in draggableFavorites"
                :key="favorite.id"
                class="flex items-center justify-between p-3 bg-card/50 rounded-lg border border-border hover:bg-card/70 transition-colors mb-2"
              >
                <div class="flex items-center gap-3">
                  <div class="drag-handle cursor-grab active:cursor-grabbing p-1 hover:bg-muted rounded">
                    <Icon
                      icon="material-symbols:drag-indicator"
                      class="w-4 h-4 text-muted-foreground hover:text-foreground transition-colors"
                    />
                  </div>
                  <Icon :icon="favorite.icon || 'material-symbols:folder-outline'" class="w-4 h-4" />
                  <span class="text-sm font-medium">{{ favorite.label }}</span>
                </div>

                <!-- 删除按钮（默认收藏夹不可删除） -->
                <Button
                  v-if="favorite.id !== 'default'"
                  @click="handleDeleteFavorite(favorite)"
                  variant="outline"
                  size="sm"
                  class="text-destructive hover:text-destructive-foreground hover:bg-destructive"
                >
                  <Icon icon="material-symbols:delete-outline" class="w-4 h-4" />
                </Button>

                <!-- 默认收藏夹标识 -->
                <div v-else class="px-2 py-1 text-xs bg-foreground text-primary rounded">默认</div>
              </div>
            </VueDraggableNext>
          </div>

          <!-- 加载状态 -->
          <div v-else class="flex items-center justify-center py-8">
            <Icon icon="material-symbols:sync" class="w-6 h-6 animate-spin text-muted-foreground" />
            <span class="ml-2 text-sm text-muted-foreground">加载中...</span>
          </div>

          <!-- 空状态 -->
          <div
            v-if="favorites.length === 0"
            class="flex flex-col items-center justify-center py-8 text-muted-foreground"
          >
            <Icon icon="material-symbols:folder-off-outline" class="w-8 h-8 mb-2" />
            <p class="text-sm">暂无收藏夹</p>
          </div>
        </div>
      </div>
    </CollapsibleContent>
  </CollapsibleRoot>
</template>

<style scoped>
/* 拖拽相关样式 */
.drag-handle {
  touch-action: none;
}

.drag-handle:hover {
  background-color: rgba(0, 0, 0, 0.05);
}

/* 拖拽时的视觉反馈 */
:deep(.drag-ghost) {
  opacity: 0.5 !important;
  background-color: rgba(var(--primary), 0.2) !important;
  z-index: 9999 !important;
}

:deep(.drag-chosen) {
  ring-width: 2px !important;
  ring-color: rgb(var(--primary)) !important;
  background-color: rgba(var(--primary), 0.1) !important;
  z-index: 9998 !important;
}

:deep(.drag-active) {
  transform: rotate(1deg) scale(1.05) !important;
  z-index: 9997 !important;
}

/* 确保拖拽元素在最上层 - 保留原有的类名作为备用 */
:deep(.sortable-ghost) {
  z-index: 9999 !important;
}

:deep(.sortable-chosen) {
  z-index: 9998 !important;
}

:deep(.sortable-drag) {
  z-index: 9997 !important;
}

/* 兼容性样式 - 如果库使用了原来的类名 */
:deep(.opacity-50) {
  opacity: 0.5 !important;
  background-color: rgba(var(--primary), 0.2) !important;
}

:deep(.ring-2) {
  ring-width: 2px !important;
  ring-color: rgb(var(--primary)) !important;
  background-color: rgba(var(--primary), 0.1) !important;
}

:deep(.rotate-1) {
  transform: rotate(1deg) scale(1.05) !important;
}
</style>
