<script setup lang="ts">
import { ref } from 'vue'
import { InputNumber } from './index'
import Button from '@/components/button/Button.vue'

// 基础数字输入
const basicValue = ref<number>(10)

// 范围限制
const rangeValue = ref<number>(5)

// 步长设置
const stepValue = ref<number>(0)

// 小数
const decimalValue = ref<number>(3.14)

// 禁用状态
const disabledValue = ref<number>(100)

// 货币格式
const currencyValue = ref<number>(1234.56)

// 百分比格式
const percentValue = ref<number>(0.75)

// 重置所有值
const resetValues = () => {
  basicValue.value = 10
  rangeValue.value = 5
  stepValue.value = 0
  decimalValue.value = 3.14
  disabledValue.value = 100
  currencyValue.value = 1234.56
  percentValue.value = 0.75
}

// 事件处理
const handleValueChange = (value: number | undefined, label: string) => {
  console.log(`${label} 值变化:`, value)
}
</script>

<template>
  <div class="p-8 space-y-8 max-w-4xl mx-auto">
    <div class="text-center">
      <h1 class="text-3xl font-head font-bold mb-4">InputNumber 数字输入框示例</h1>
      <p class="text-muted-foreground mb-6">基于 reka-ui 和项目主题的数字输入组件</p>
      <Button @click="resetValues" variant="outline">重置所有值</Button>
    </div>

    <!-- 基础用法 -->
    <div class="space-y-4">
      <h2 class="text-xl font-head font-semibold">基础用法</h2>
      <div class="space-y-2">
        <p class="text-sm text-muted-foreground">当前值: {{ basicValue }}</p>
        <InputNumber 
          v-model="basicValue" 
          placeholder="请输入数字"
          @value-change="(value) => handleValueChange(value, '基础输入')"
        />
      </div>
    </div>

    <!-- 不同尺寸 -->
    <div class="space-y-4">
      <h2 class="text-xl font-head font-semibold">不同尺寸</h2>
      <div class="space-y-4">
        <div class="space-y-2">
          <p class="text-sm text-muted-foreground">小尺寸 (sm)</p>
          <InputNumber :default-value="10" size="sm" />
        </div>
        <div class="space-y-2">
          <p class="text-sm text-muted-foreground">中等尺寸 (md) - 默认</p>
          <InputNumber :default-value="20" size="md" />
        </div>
        <div class="space-y-2">
          <p class="text-sm text-muted-foreground">大尺寸 (lg)</p>
          <InputNumber :default-value="30" size="lg" />
        </div>
      </div>
    </div>

    <!-- 不同变体 -->
    <div class="space-y-4">
      <h2 class="text-xl font-head font-semibold">不同变体</h2>
      <div class="space-y-4">
        <div class="space-y-2">
          <p class="text-sm text-muted-foreground">默认变体 (default)</p>
          <InputNumber :default-value="10" variant="default" />
        </div>
        <div class="space-y-2">
          <p class="text-sm text-muted-foreground">轮廓变体 (outline)</p>
          <InputNumber :default-value="20" variant="outline" />
        </div>
        <div class="space-y-2">
          <p class="text-sm text-muted-foreground">幽灵变体 (ghost)</p>
          <InputNumber :default-value="30" variant="ghost" />
        </div>
      </div>
    </div>

    <!-- 范围限制 -->
    <div class="space-y-4">
      <h2 class="text-xl font-head font-semibold">范围限制</h2>
      <div class="space-y-2">
        <p class="text-sm text-muted-foreground">
          当前值: {{ rangeValue }} (范围: 0-10)
        </p>
        <InputNumber 
          v-model="rangeValue" 
          :min="0" 
          :max="10" 
          placeholder="0-10之间"
        />
      </div>
    </div>

    <!-- 步长设置 -->
    <div class="space-y-4">
      <h2 class="text-xl font-head font-semibold">步长设置</h2>
      <div class="space-y-2">
        <p class="text-sm text-muted-foreground">
          当前值: {{ stepValue }} (步长: 5)
        </p>
        <InputNumber 
          v-model="stepValue" 
          :step="5" 
          placeholder="步长为5"
        />
      </div>
    </div>

    <!-- 小数支持 -->
    <div class="space-y-4">
      <h2 class="text-xl font-head font-semibold">小数支持</h2>
      <div class="space-y-2">
        <p class="text-sm text-muted-foreground">
          当前值: {{ decimalValue }} (步长: 0.1)
        </p>
        <InputNumber 
          v-model="decimalValue" 
          :step="0.1" 
          placeholder="支持小数"
        />
      </div>
    </div>

    <!-- 禁用状态 -->
    <div class="space-y-4">
      <h2 class="text-xl font-head font-semibold">禁用状态</h2>
      <div class="space-y-2">
        <p class="text-sm text-muted-foreground">禁用的数字输入框</p>
        <InputNumber v-model="disabledValue" disabled />
      </div>
    </div>

    <!-- 格式化显示 -->
    <div class="space-y-4">
      <h2 class="text-xl font-head font-semibold">格式化显示</h2>
      <div class="space-y-4">
        <div class="space-y-2">
          <p class="text-sm text-muted-foreground">
            货币格式: {{ currencyValue }}
          </p>
          <InputNumber 
            v-model="currencyValue" 
            :format-options="{ style: 'currency', currency: 'CNY' }"
            placeholder="货币格式"
          />
        </div>
        <div class="space-y-2">
          <p class="text-sm text-muted-foreground">
            百分比格式: {{ percentValue }}
          </p>
          <InputNumber 
            v-model="percentValue" 
            :format-options="{ style: 'percent' }"
            :step="0.01"
            :min="0"
            :max="1"
            placeholder="百分比格式"
          />
        </div>
      </div>
    </div>

    <!-- 组合示例 -->
    <div class="space-y-4">
      <h2 class="text-xl font-head font-semibold">组合示例</h2>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <InputNumber 
          :default-value="10" 
          size="sm" 
          variant="outline" 
          :min="0" 
          :max="100" 
          placeholder="小号轮廓"
        />
        <InputNumber 
          :default-value="50" 
          size="md" 
          variant="default" 
          :step="10" 
          placeholder="中号默认"
        />
        <InputNumber 
          :default-value="90" 
          size="lg" 
          variant="ghost" 
          :min="0" 
          :max="100" 
          placeholder="大号幽灵"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
/* 确保网格布局在小屏幕上正确显示 */
@media (max-width: 768px) {
  .grid-cols-1.md\:grid-cols-3 {
    grid-template-columns: 1fr;
  }
}
</style>
