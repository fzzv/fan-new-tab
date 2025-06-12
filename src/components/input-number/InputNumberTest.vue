<script setup lang="ts">
import { ref } from 'vue'
import { InputNumber } from './index'
import Button from '@/components/button/Button.vue'

const testValue = ref<number>(10)

console.log('InputNumber组件测试页面加载')
</script>

<template>
  <div class="p-8 max-w-4xl mx-auto space-y-8">
    <div class="text-center">
      <h1 class="text-3xl font-head font-bold mb-4">InputNumber 组件样式测试</h1>
      <p class="text-muted-foreground mb-6">分离式设计，独立阴影效果的数字输入框</p>
    </div>

    <!-- 与Button组件对比 -->
    <div class="space-y-6">
      <h2 class="text-xl font-head font-semibold">样式对比</h2>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
        <!-- Button组件 -->
        <div class="space-y-4">
          <h3 class="text-lg font-head font-medium">Button 组件</h3>
          <div class="space-y-3">
            <Button variant="default">默认按钮</Button>
            <Button variant="outline">轮廓按钮</Button>
            <Button variant="secondary">次要按钮</Button>
            <Button size="sm">小按钮</Button>
            <Button size="lg">大按钮</Button>
          </div>
        </div>

        <!-- InputNumber组件 -->
        <div class="space-y-4">
          <h3 class="text-lg font-head font-medium">InputNumber 组件</h3>
          <div class="space-y-3">
            <div>
              <p class="text-xs text-muted-foreground mb-1">默认变体: {{ testValue }}</p>
              <InputNumber v-model="testValue" variant="default" placeholder="默认样式" />
            </div>
            <div>
              <p class="text-xs text-muted-foreground mb-1">轮廓变体</p>
              <InputNumber :default-value="15" variant="outline" placeholder="轮廓样式" />
            </div>
            <div>
              <p class="text-xs text-muted-foreground mb-1">幽灵变体</p>
              <InputNumber :default-value="25" variant="ghost" placeholder="幽灵样式" />
            </div>
            <div>
              <p class="text-xs text-muted-foreground mb-1">小尺寸</p>
              <InputNumber :default-value="5" size="sm" placeholder="小尺寸" />
            </div>
            <div>
              <p class="text-xs text-muted-foreground mb-1">大尺寸</p>
              <InputNumber :default-value="20" size="lg" placeholder="大尺寸" />
            </div>
          </div>
        </div>
      </div>

      <!-- 功能测试 -->
      <div class="space-y-4">
        <h3 class="text-lg font-head font-medium">功能测试</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <p class="text-xs text-muted-foreground mb-1">范围限制 (0-10)</p>
            <InputNumber :default-value="5" :min="0" :max="10" />
          </div>
          <div>
            <p class="text-xs text-muted-foreground mb-1">步长为5</p>
            <InputNumber :default-value="0" :step="5" />
          </div>
          <div>
            <p class="text-xs text-muted-foreground mb-1">小数步长0.1</p>
            <InputNumber :default-value="3.14" :step="0.1" />
          </div>
          <div>
            <p class="text-xs text-muted-foreground mb-1">禁用状态</p>
            <InputNumber :default-value="100" disabled />
          </div>
          <div>
            <p class="text-xs text-muted-foreground mb-1">货币格式</p>
            <InputNumber
              :default-value="1234.56"
              :format-options="{ style: 'currency', currency: 'CNY' }"
            />
          </div>
          <div>
            <p class="text-xs text-muted-foreground mb-1">百分比格式</p>
            <InputNumber
              :default-value="0.75"
              :format-options="{ style: 'percent' }"
              :step="0.01"
              :min="0"
              :max="1"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
