<script setup lang="ts">
import { ref } from 'vue'
import { CollapsibleRoot, CollapsibleTrigger, CollapsibleContent } from './index'

const isOpen1 = ref(false)
const isOpen2 = ref(true)
const isOpen3 = ref(false)
</script>

<template>
  <div class="min-h-screen bg-background p-8">
    <div class="max-w-4xl mx-auto space-y-8">
      <div class="text-center mb-8">
        <h1 class="text-3xl font-head font-bold text-foreground mb-2">Collapsible Data-State 测试</h1>
        <p class="text-muted-foreground">测试使用 data-state 属性控制折叠开关的功能</p>
      </div>

      <!-- 基础测试 -->
      <section class="space-y-4">
        <h2 class="text-xl font-head font-semibold text-foreground">基础功能测试</h2>
        
        <CollapsibleRoot v-model:open="isOpen1" variant="default" size="md">
          <CollapsibleTrigger variant="default" size="md" @click="isOpen1 = !isOpen1">
            <span class="font-medium">点击切换状态 (当前: {{ isOpen1 ? '展开' : '收起' }})</span>
          </CollapsibleTrigger>
          <CollapsibleContent variant="default" size="md">
            <div class="space-y-2">
              <p class="text-card-foreground">这是内容区域。</p>
              <p class="text-muted-foreground">通过 data-state 属性控制显示/隐藏。</p>
              <div class="bg-accent p-3 rounded">
                <p class="text-accent-foreground text-sm">
                  当前 data-state: {{ isOpen1 ? 'open' : 'closed' }}
                </p>
              </div>
            </div>
          </CollapsibleContent>
        </CollapsibleRoot>

        <!-- 默认展开状态 -->
        <CollapsibleRoot v-model:open="isOpen2" variant="outline" size="md">
          <CollapsibleTrigger variant="outline" size="md" @click="isOpen2 = !isOpen2">
            <span class="font-medium">默认展开状态 (当前: {{ isOpen2 ? '展开' : '收起' }})</span>
          </CollapsibleTrigger>
          <CollapsibleContent variant="outline" size="md">
            <div class="space-y-2">
              <p class="text-foreground">这个面板默认是展开的。</p>
              <p class="text-muted-foreground">图标应该显示为向上箭头。</p>
            </div>
          </CollapsibleContent>
        </CollapsibleRoot>

        <!-- Ghost 变体测试 -->
        <CollapsibleRoot v-model:open="isOpen3" variant="ghost" size="lg">
          <CollapsibleTrigger variant="ghost" size="lg" @click="isOpen3 = !isOpen3">
            <span class="font-medium">Ghost 变体大尺寸 (当前: {{ isOpen3 ? '展开' : '收起' }})</span>
          </CollapsibleTrigger>
          <CollapsibleContent variant="ghost" size="lg">
            <div class="space-y-2">
              <p class="text-foreground">Ghost 变体的内容区域。</p>
              <p class="text-muted-foreground">无边框，完全透明背景。</p>
            </div>
          </CollapsibleContent>
        </CollapsibleRoot>
      </section>

      <!-- 状态检查 -->
      <section class="space-y-4">
        <h2 class="text-xl font-head font-semibold text-foreground">Data-State 状态检查</h2>
        <div class="bg-muted p-6 rounded-lg">
          <h3 class="font-medium text-muted-foreground mb-4">当前各组件的 data-state 值：</h3>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div class="flex items-center gap-2">
              <div :class="isOpen1 ? 'bg-green-500' : 'bg-red-500'" class="w-3 h-3 rounded-full"></div>
              <span>面板1: data-state="{{ isOpen1 ? 'open' : 'closed' }}"</span>
            </div>
            <div class="flex items-center gap-2">
              <div :class="isOpen2 ? 'bg-green-500' : 'bg-red-500'" class="w-3 h-3 rounded-full"></div>
              <span>面板2: data-state="{{ isOpen2 ? 'open' : 'closed' }}"</span>
            </div>
            <div class="flex items-center gap-2">
              <div :class="isOpen3 ? 'bg-green-500' : 'bg-red-500'" class="w-3 h-3 rounded-full"></div>
              <span>面板3: data-state="{{ isOpen3 ? 'open' : 'closed' }}"</span>
            </div>
          </div>
        </div>
      </section>

      <!-- 控制按钮 -->
      <section class="space-y-4">
        <h2 class="text-xl font-head font-semibold text-foreground">批量控制</h2>
        <div class="flex flex-wrap gap-4">
          <button
            @click="() => { isOpen1 = true; isOpen2 = true; isOpen3 = true }"
            class="px-4 py-2 bg-primary text-primary-foreground border-2 border-border hover:bg-primary/80 transition-colors rounded"
          >
            全部展开
          </button>
          <button
            @click="() => { isOpen1 = false; isOpen2 = false; isOpen3 = false }"
            class="px-4 py-2 bg-secondary text-secondary-foreground border-2 border-border hover:bg-secondary/80 transition-colors rounded"
          >
            全部收起
          </button>
          <button
            @click="() => { isOpen1 = !isOpen1; isOpen2 = !isOpen2; isOpen3 = !isOpen3 }"
            class="px-4 py-2 bg-accent text-accent-foreground border-2 border-border hover:bg-accent/80 transition-colors rounded"
          >
            切换所有状态
          </button>
        </div>
      </section>

      <!-- 技术说明 -->
      <section class="space-y-4">
        <h2 class="text-xl font-head font-semibold text-foreground">技术实现说明</h2>
        <div class="bg-card p-6 border-2 border-border rounded-lg">
          <h3 class="font-medium text-card-foreground mb-3">Data-State 实现方式：</h3>
          <ul class="space-y-2 text-sm text-muted-foreground">
            <li>• <strong>CollapsibleRoot</strong>: 设置 <code>data-state</code> 属性为 "open" 或 "closed"</li>
            <li>• <strong>CollapsibleTrigger</strong>: 通过 inject 获取状态，控制图标旋转</li>
            <li>• <strong>CollapsibleContent</strong>: 通过 inject 获取状态，控制内容显示/隐藏</li>
            <li>• <strong>状态传递</strong>: 使用 Vue 的 provide/inject 机制在组件间传递状态</li>
            <li>• <strong>CSS 选择器</strong>: 可以使用 <code>[data-state="open"]</code> 和 <code>[data-state="closed"]</code> 选择器</li>
          </ul>
        </div>
      </section>
    </div>
  </div>
</template>

<style scoped>
/* 演示 data-state CSS 选择器的使用 */
:deep([data-state="open"]) {
  /* 可以在这里添加针对展开状态的样式 */
}

:deep([data-state="closed"]) {
  /* 可以在这里添加针对收起状态的样式 */
}
</style>
