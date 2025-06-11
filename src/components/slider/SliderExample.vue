<script setup lang="ts">
import { ref } from 'vue'
import { Slider } from './index'
import Button from '@/components/button/Button.vue'

// 单值滑块
const singleValue = ref([50])

// 范围滑块
const rangeValue = ref([25, 75])

// 垂直滑块
const verticalValue = ref([30])

// 步长滑块
const stepValue = ref([20])

// 禁用滑块
const disabledValue = ref([60])

// 重置所有值
const resetValues = () => {
  singleValue.value = [50]
  rangeValue.value = [25, 75]
  verticalValue.value = [30]
  stepValue.value = [20]
  disabledValue.value = [60]
}
</script>

<template>
  <div class="p-8 space-y-8 max-w-4xl mx-auto">
    <div class="text-center">
      <h1 class="text-3xl font-head font-bold mb-4">Slider 滑块组件示例</h1>
      <p class="text-muted-foreground mb-6">基于 reka-ui 和项目主题的滑块组件</p>
      <Button @click="resetValues" variant="outline">重置所有值</Button>
    </div>

    <!-- 基础单值滑块 -->
    <div class="space-y-4">
      <h2 class="text-xl font-head font-semibold">基础单值滑块</h2>
      <div class="space-y-2">
        <p class="text-sm text-muted-foreground">当前值: {{ singleValue[0] }}</p>
        <Slider v-model="singleValue" :min="0" :max="100" />
      </div>
    </div>

    <!-- 范围滑块 -->
    <div class="space-y-4">
      <h2 class="text-xl font-head font-semibold">范围滑块</h2>
      <div class="space-y-2">
        <p class="text-sm text-muted-foreground">
          当前范围: {{ rangeValue[0] }} - {{ rangeValue[1] }}
        </p>
        <Slider v-model="rangeValue" :min="0" :max="100" :min-steps-between-thumbs="5" />
      </div>
    </div>

    <!-- 不同尺寸 -->
    <div class="space-y-4">
      <h2 class="text-xl font-head font-semibold">不同尺寸</h2>
      <div class="space-y-4">
        <div class="space-y-2">
          <p class="text-sm text-muted-foreground">小尺寸 (sm)</p>
          <Slider :default-value="[30]" size="sm" />
        </div>
        <div class="space-y-2">
          <p class="text-sm text-muted-foreground">中等尺寸 (md) - 默认</p>
          <Slider :default-value="[50]" size="md" />
        </div>
        <div class="space-y-2">
          <p class="text-sm text-muted-foreground">大尺寸 (lg)</p>
          <Slider :default-value="[70]" size="lg" />
        </div>
      </div>
    </div>

    <!-- 不同变体 -->
    <div class="space-y-4">
      <h2 class="text-xl font-head font-semibold">不同变体</h2>
      <div class="space-y-4">
        <div class="space-y-2">
          <p class="text-sm text-muted-foreground">默认变体 (primary)</p>
          <Slider :default-value="[40]" variant="default" />
        </div>
        <div class="space-y-2">
          <p class="text-sm text-muted-foreground">次要变体 (secondary)</p>
          <Slider :default-value="[60]" variant="secondary" />
        </div>
      </div>
    </div>

    <!-- 步长滑块 -->
    <div class="space-y-4">
      <h2 class="text-xl font-head font-semibold">自定义步长</h2>
      <div class="space-y-2">
        <p class="text-sm text-muted-foreground">
          当前值: {{ stepValue[0] }} (步长: 10)
        </p>
        <Slider v-model="stepValue" :min="0" :max="100" :step="10" />
      </div>
    </div>

    <!-- 禁用状态 -->
    <div class="space-y-4">
      <h2 class="text-xl font-head font-semibold">禁用状态</h2>
      <div class="space-y-2">
        <p class="text-sm text-muted-foreground">禁用的滑块</p>
        <Slider v-model="disabledValue" :min="0" :max="100" disabled />
      </div>
    </div>

    <!-- 垂直滑块 -->
    <div class="space-y-4">
      <h2 class="text-xl font-head font-semibold">垂直方向</h2>
      <div class="flex items-center space-x-8">
        <div class="space-y-2">
          <p class="text-sm text-muted-foreground">当前值: {{ verticalValue[0] }}</p>
          <div class="h-48 flex items-center">
            <Slider 
              v-model="verticalValue" 
              :min="0" 
              :max="100" 
              orientation="vertical"
              class="h-full"
            />
          </div>
        </div>
        <div class="space-y-2">
          <p class="text-sm text-muted-foreground">垂直范围滑块</p>
          <div class="h-48 flex items-center">
            <Slider 
              :default-value="[20, 80]" 
              :min="0" 
              :max="100" 
              orientation="vertical"
              size="lg"
              class="h-full"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- 反向滑块 -->
    <div class="space-y-4">
      <h2 class="text-xl font-head font-semibold">反向滑块</h2>
      <div class="space-y-2">
        <p class="text-sm text-muted-foreground">反向的滑块 (inverted)</p>
        <Slider :default-value="[30]" :min="0" :max="100" inverted />
      </div>
    </div>

    <!-- 事件处理 -->
    <div class="space-y-4">
      <h2 class="text-xl font-head font-semibold">事件处理</h2>
      <div class="space-y-2">
        <p class="text-sm text-muted-foreground">拖拽结束时会触发 valueCommit 事件</p>
        <Slider 
          :default-value="[50]" 
          :min="0" 
          :max="100"
          @value-commit="(value) => console.log('Value committed:', value)"
          @update:model-value="(value) => console.log('Value changed:', value)"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
/* 确保垂直滑块容器的样式 */
.h-48 {
  height: 12rem;
}
</style>
