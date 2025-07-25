<script setup lang="ts">
import { ref } from 'vue'
import { CollapsibleRoot, CollapsibleTrigger, CollapsibleContent } from '@/components/collapsible'
import { Icon } from '@iconify/vue'
import Button from '@/components/button/Button.vue'
import { useFavorite } from '@/composables/useFavorite'
import { useBookmarkSync } from '@/composables/useBookmarkSync'
import { useBookmarkImportExport } from '@/composables/useBookmarkImportExport'
import ModalDialog from '@/components/modal/ModalDialog.vue'
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
const { favorites, removeFavorite, updateFavoritesOrder } = useFavorite()

// 书签同步功能
const { syncBrowserBookmarks, isSyncing } = useBookmarkSync()

// 导入导出功能
const { importBookmarks, exportBookmarks, isImporting, isExporting } = useBookmarkImportExport()

// 文件输入引用
const fileInputRef = ref<HTMLInputElement>()

// 确认删除对话框状态
const showDeleteConfirm = ref(false)
const favoriteToDelete = ref<any>(null)

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
  favoriteToDelete.value = favorite
  showDeleteConfirm.value = true
}

const confirmDelete = () => {
  if (favoriteToDelete.value) {
    removeFavorite(favoriteToDelete.value.id)
    toast.success('收藏夹删除成功', { richColors: true })
  }
  showDeleteConfirm.value = false
  favoriteToDelete.value = null
}

const cancelDelete = () => {
  showDeleteConfirm.value = false
  favoriteToDelete.value = null
}

// 处理拖拽排序
const handleDragEnd = (event: any) => {
  const { oldIndex, newIndex } = event
  if (oldIndex !== newIndex) {
    updateFavoritesOrder(oldIndex, newIndex)
    toast.success('收藏夹顺序已更新', { richColors: true })
  }
}

// 计算可删除的收藏夹（排除默认收藏夹）
// const deletableFavorites = computed(() => {
//   return favorites.value.filter((fav) => fav.id !== 'default')
// })
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
          <div class="space-y-2 max-h-60 overflow-y-auto">
            <VueDraggableNext
              v-model="favorites"
              :animation="200"
              ghost-class="opacity-50"
              chosen-class="ring-2 ring-primary"
              @end="handleDragEnd"
            >
              <div
                v-for="favorite in favorites"
                :key="favorite.id"
                class="flex items-center justify-between p-3 bg-muted/50 rounded-lg border border-border hover:bg-muted/70 transition-colors cursor-move"
              >
                <div class="flex items-center gap-3">
                  <Icon icon="material-symbols:drag-indicator" class="w-4 h-4 text-muted-foreground" />
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
                <div v-else class="px-2 py-1 text-xs bg-primary/10 text-primary rounded">默认</div>
              </div>
            </VueDraggableNext>

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
      </div>
    </CollapsibleContent>
  </CollapsibleRoot>

  <!-- 删除确认对话框 -->
  <ModalDialog v-model="showDeleteConfirm">
    <div class="bg-background rounded-lg shadow-lg max-w-md w-full mx-4">
      <div class="p-6">
        <div class="flex items-center gap-3 mb-4">
          <Icon icon="material-symbols:warning-outline" class="w-6 h-6 text-destructive" />
          <h3 class="text-lg font-semibold">确认删除</h3>
        </div>

        <p class="text-muted-foreground mb-6">
          确定要删除收藏夹 "{{ favoriteToDelete?.label }}" 吗？此操作不可撤销，该收藏夹下的所有网站也将被删除。
        </p>

        <div class="flex justify-end gap-3">
          <Button @click="cancelDelete" variant="outline">取消</Button>
          <Button @click="confirmDelete" variant="default" class="bg-destructive hover:bg-destructive/90">
            确认删除
          </Button>
        </div>
      </div>
    </div>
  </ModalDialog>
</template>

<style scoped></style>
