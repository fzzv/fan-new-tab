<script setup lang="ts">
import { ref } from 'vue'
import { CollapsibleRoot, CollapsibleTrigger, CollapsibleContent } from './index'

const isOpen1 = ref(false)
const isOpen2 = ref(false)
const isOpen3 = ref(false)
const isOpen4 = ref(false)
const isOpen5 = ref(false)
const isOpen6 = ref(false)
</script>

<template>
  <div class="min-h-screen bg-background p-8">
    <div class="max-w-4xl mx-auto space-y-8">
      <div class="text-center mb-8">
        <h1 class="text-3xl font-head font-bold text-foreground mb-2">Collapsible 主题样式测试</h1>
        <p class="text-muted-foreground">测试不同变体和尺寸的主题样式效果</p>
      </div>

      <!-- 不同变体测试 -->
      <section class="space-y-4">
        <h2 class="text-xl font-head font-semibold text-foreground">样式变体测试</h2>
        
        <!-- Default 变体 -->
        <CollapsibleRoot v-model:open="isOpen1" variant="default" size="md">
          <CollapsibleTrigger variant="default" size="md" @click="isOpen1 = !isOpen1">
            <span class="font-medium">Default 变体 - 带边框和背景</span>
          </CollapsibleTrigger>
          <CollapsibleContent variant="default" size="md">
            <div class="space-y-2">
              <p class="text-card-foreground">这是 default 变体的内容区域。</p>
              <p class="text-muted-foreground">具有边框、背景色和阴影效果。</p>
            </div>
          </CollapsibleContent>
        </CollapsibleRoot>

        <!-- Outline 变体 -->
        <CollapsibleRoot v-model:open="isOpen2" variant="outline" size="md">
          <CollapsibleTrigger variant="outline" size="md" @click="isOpen2 = !isOpen2">
            <span class="font-medium">Outline 变体 - 仅边框</span>
          </CollapsibleTrigger>
          <CollapsibleContent variant="outline" size="md">
            <div class="space-y-2">
              <p class="text-foreground">这是 outline 变体的内容区域。</p>
              <p class="text-muted-foreground">只有边框，背景透明。</p>
            </div>
          </CollapsibleContent>
        </CollapsibleRoot>

        <!-- Ghost 变体 -->
        <CollapsibleRoot v-model:open="isOpen3" variant="ghost" size="md">
          <CollapsibleTrigger variant="ghost" size="md" @click="isOpen3 = !isOpen3">
            <span class="font-medium">Ghost 变体 - 无边框</span>
          </CollapsibleTrigger>
          <CollapsibleContent variant="ghost" size="md">
            <div class="space-y-2">
              <p class="text-foreground">这是 ghost 变体的内容区域。</p>
              <p class="text-muted-foreground">完全透明，无边框和背景。</p>
            </div>
          </CollapsibleContent>
        </CollapsibleRoot>
      </section>

      <!-- 不同尺寸测试 -->
      <section class="space-y-4">
        <h2 class="text-xl font-head font-semibold text-foreground">尺寸变体测试</h2>
        
        <!-- Small 尺寸 -->
        <CollapsibleRoot v-model:open="isOpen4" variant="default" size="sm">
          <CollapsibleTrigger variant="default" size="sm" @click="isOpen4 = !isOpen4">
            <span class="font-medium">Small 尺寸 (sm)</span>
          </CollapsibleTrigger>
          <CollapsibleContent variant="default" size="sm">
            <p class="text-card-foreground">小尺寸的内容区域，文字和间距都较小。</p>
          </CollapsibleContent>
        </CollapsibleRoot>

        <!-- Medium 尺寸 -->
        <CollapsibleRoot v-model:open="isOpen5" variant="default" size="md">
          <CollapsibleTrigger variant="default" size="md" @click="isOpen5 = !isOpen5">
            <span class="font-medium">Medium 尺寸 (md) - 默认</span>
          </CollapsibleTrigger>
          <CollapsibleContent variant="default" size="md">
            <p class="text-card-foreground">中等尺寸的内容区域，这是默认尺寸。</p>
          </CollapsibleContent>
        </CollapsibleRoot>

        <!-- Large 尺寸 -->
        <CollapsibleRoot v-model:open="isOpen6" variant="default" size="lg">
          <CollapsibleTrigger variant="default" size="lg" @click="isOpen6 = !isOpen6">
            <span class="font-medium">Large 尺寸 (lg)</span>
          </CollapsibleTrigger>
          <CollapsibleContent variant="default" size="lg">
            <p class="text-card-foreground">大尺寸的内容区域，文字和间距都较大。</p>
          </CollapsibleContent>
        </CollapsibleRoot>
      </section>

      <!-- 主题色彩展示 -->
      <section class="space-y-4">
        <h2 class="text-xl font-head font-semibold text-foreground">主题色彩展示</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="space-y-2">
            <h3 class="font-medium text-foreground">当前主题色彩</h3>
            <div class="space-y-1 text-sm">
              <div class="flex items-center gap-2">
                <div class="w-4 h-4 bg-primary border border-border"></div>
                <span>Primary: var(--primary)</span>
              </div>
              <div class="flex items-center gap-2">
                <div class="w-4 h-4 bg-secondary border border-border"></div>
                <span>Secondary: var(--secondary)</span>
              </div>
              <div class="flex items-center gap-2">
                <div class="w-4 h-4 bg-accent border border-border"></div>
                <span>Accent: var(--accent)</span>
              </div>
              <div class="flex items-center gap-2">
                <div class="w-4 h-4 bg-muted border border-border"></div>
                <span>Muted: var(--muted)</span>
              </div>
              <div class="flex items-center gap-2">
                <div class="w-4 h-4 bg-card border border-border"></div>
                <span>Card: var(--card)</span>
              </div>
              <div class="flex items-center gap-2">
                <div class="w-4 h-4 border-2 border-border"></div>
                <span>Border: var(--border)</span>
              </div>
            </div>
          </div>
          <div class="space-y-2">
            <h3 class="font-medium text-foreground">文字颜色</h3>
            <div class="space-y-1 text-sm">
              <div class="text-foreground">Foreground: var(--foreground)</div>
              <div class="text-card-foreground">Card Foreground: var(--card-foreground)</div>
              <div class="text-muted-foreground">Muted Foreground: var(--muted-foreground)</div>
              <div class="text-accent-foreground bg-accent px-2 py-1 rounded">Accent Foreground</div>
              <div class="text-primary-foreground bg-primary px-2 py-1 rounded">Primary Foreground</div>
              <div class="text-secondary-foreground bg-secondary px-2 py-1 rounded">Secondary Foreground</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<style scoped></style>
