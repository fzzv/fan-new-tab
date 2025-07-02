<script setup lang="ts">
import { ref } from 'vue'
import { closeColorPickerDialog } from '@/composables/useDialog.ts'
import { ModalContent, ModalHeader, ModalFooter } from '@/components/modal'
import { Button } from '@/components/button'
import { ColorPickerPanel } from '@/components/color-picker'
import { useSettings } from '@/composables/useSettings'

// 设置
const { setWallpaper, customColorList } = useSettings()

// 选中的颜色
const selectedColor = ref('#ff6b6b')

// 确认选择颜色
async function handleConfirm() {
  // 添加颜色到列表（如果不存在的话）
  if (!customColorList.value.includes(selectedColor.value)) {
    // 将新颜色插入到列表前面
    customColorList.value.unshift(selectedColor.value)
  }

  // 设置为壁纸
  await setWallpaper(selectedColor.value)
  closeColorPickerDialog()
}

// 取消选择
function handleCancel() {
  closeColorPickerDialog()
}
</script>

<template>
  <ModalContent size="md">
    <ModalHeader @close="handleCancel">
      <div class="text-xl">选择自定义颜色</div>
    </ModalHeader>

    <div class="p-6">
      <div class="space-y-4">
        <!-- 颜色预览 -->
        <div class="flex items-center gap-4">
          <div class="text-sm font-medium">当前颜色：</div>
          <div
            class="w-16 h-16 rounded-lg border-2 border-border shadow-sm"
            :style="{ backgroundColor: selectedColor }"
          />
          <div class="text-sm text-muted-foreground font-mono">{{ selectedColor }}</div>
        </div>

        <!-- 颜色选择器面板 -->
        <div class="border border-border rounded-lg p-4">
          <ColorPickerPanel
            v-model="selectedColor"
            mode="hex"
            :showAlpha="true"
            :showInput="true"
            :showFormatSwitch="false"
            :showPreview="false"
            :showPresets="true"
          />
        </div>
      </div>
    </div>

    <ModalFooter>
      <Button variant="outline" @click="handleCancel">取消</Button>
      <Button @click="handleConfirm">确认</Button>
    </ModalFooter>
  </ModalContent>
</template>
