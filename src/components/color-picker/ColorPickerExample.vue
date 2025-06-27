<script setup lang="ts">
import { ref } from 'vue'
import ColorPicker from './ColorPicker.vue'
import type { ColorMode } from './types'

// 响应式数据
const selectedColor = ref('#ff6b6b')
const selectedMode = ref<ColorMode>('hex')
const showAlpha = ref(true)
const showPresets = ref(true)
const disabled = ref(false)
const size = ref<'sm' | 'md' | 'lg'>('md')

// 自定义预设颜色
const customPresets = [
  '#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57', '#ff9ff3',
  '#54a0ff', '#5f27cd', '#00d2d3', '#ff9f43', '#ee5a24', '#0abde3',
  '#10ac84', '#222f3e', '#576574', '#f368e0'
]

function handleColorChange(color: string, mode: ColorMode) {
  console.log('颜色变化:', color, '模式:', mode)
}
</script>

<template>
  <div class="max-w-4xl mx-auto p-6 space-y-8">
    <div class="text-center">
      <h1 class="text-3xl font-bold text-foreground mb-2">ColorPicker 颜色选择器</h1>
      <p class="text-muted-foreground">支持 RGB、HEX、HSL、HSV 四种颜色模式的颜色选择器组件</p>
    </div>

    <!-- 基础用法 -->
    <section class="space-y-4">
      <h2 class="text-xl font-semibold text-foreground">基础用法</h2>
      <div class="flex items-center gap-4 p-4 border-2 border-border rounded">
        <ColorPicker 
          v-model="selectedColor"
          @change="handleColorChange"
        />
        <div class="space-y-1">
          <div class="text-sm text-muted-foreground">选中的颜色:</div>
          <div class="font-mono text-foreground">{{ selectedColor }}</div>
        </div>
      </div>
    </section>

    <!-- 不同尺寸 -->
    <section class="space-y-4">
      <h2 class="text-xl font-semibold text-foreground">不同尺寸</h2>
      <div class="flex items-center gap-4 p-4 border-2 border-border rounded">
        <div class="flex items-center gap-2">
          <span class="text-sm text-muted-foreground">小:</span>
          <ColorPicker v-model="selectedColor" size="sm" />
        </div>
        <div class="flex items-center gap-2">
          <span class="text-sm text-muted-foreground">中:</span>
          <ColorPicker v-model="selectedColor" size="md" />
        </div>
        <div class="flex items-center gap-2">
          <span class="text-sm text-muted-foreground">大:</span>
          <ColorPicker v-model="selectedColor" size="lg" />
        </div>
      </div>
    </section>

    <!-- 不同模式 -->
    <section class="space-y-4">
      <h2 class="text-xl font-semibold text-foreground">不同颜色模式</h2>
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div class="p-4 border-2 border-border rounded text-center space-y-2">
          <div class="text-sm font-medium text-foreground">HEX 模式</div>
          <ColorPicker v-model="selectedColor" mode="hex" />
        </div>
        <div class="p-4 border-2 border-border rounded text-center space-y-2">
          <div class="text-sm font-medium text-foreground">RGB 模式</div>
          <ColorPicker v-model="selectedColor" mode="rgb" />
        </div>
        <div class="p-4 border-2 border-border rounded text-center space-y-2">
          <div class="text-sm font-medium text-foreground">HSL 模式</div>
          <ColorPicker v-model="selectedColor" mode="hsl" />
        </div>
        <div class="p-4 border-2 border-border rounded text-center space-y-2">
          <div class="text-sm font-medium text-foreground">HSV 模式</div>
          <ColorPicker v-model="selectedColor" mode="hsv" />
        </div>
      </div>
    </section>

    <!-- 自定义预设 -->
    <section class="space-y-4">
      <h2 class="text-xl font-semibold text-foreground">自定义预设颜色</h2>
      <div class="flex items-center gap-4 p-4 border-2 border-border rounded">
        <ColorPicker 
          v-model="selectedColor"
          :presets="customPresets"
        />
        <div class="space-y-1">
          <div class="text-sm text-muted-foreground">使用自定义预设颜色</div>
          <div class="text-xs text-muted-foreground">包含 16 种精选颜色</div>
        </div>
      </div>
    </section>

    <!-- 配置选项 -->
    <section class="space-y-4">
      <h2 class="text-xl font-semibold text-foreground">配置选项</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- 控制面板 -->
        <div class="space-y-4 p-4 border-2 border-border rounded">
          <h3 class="font-medium text-foreground">控制面板</h3>
          
          <div class="space-y-3">
            <label class="flex items-center gap-2">
              <input 
                v-model="showAlpha" 
                type="checkbox" 
                class="rounded border-border"
              />
              <span class="text-sm text-foreground">显示透明度</span>
            </label>
            
            <label class="flex items-center gap-2">
              <input 
                v-model="showPresets" 
                type="checkbox" 
                class="rounded border-border"
              />
              <span class="text-sm text-foreground">显示预设颜色</span>
            </label>
            
            <label class="flex items-center gap-2">
              <input 
                v-model="disabled" 
                type="checkbox" 
                class="rounded border-border"
              />
              <span class="text-sm text-foreground">禁用状态</span>
            </label>
          </div>

          <div class="space-y-2">
            <label class="text-sm text-foreground">尺寸:</label>
            <select 
              v-model="size" 
              class="w-full p-2 border-2 border-border rounded bg-background text-foreground"
            >
              <option value="sm">小 (sm)</option>
              <option value="md">中 (md)</option>
              <option value="lg">大 (lg)</option>
            </select>
          </div>

          <div class="space-y-2">
            <label class="text-sm text-foreground">颜色模式:</label>
            <select 
              v-model="selectedMode" 
              class="w-full p-2 border-2 border-border rounded bg-background text-foreground"
            >
              <option value="hex">HEX</option>
              <option value="rgb">RGB</option>
              <option value="hsl">HSL</option>
              <option value="hsv">HSV</option>
            </select>
          </div>
        </div>

        <!-- 预览区域 -->
        <div class="space-y-4 p-4 border-2 border-border rounded">
          <h3 class="font-medium text-foreground">实时预览</h3>
          
          <div class="flex items-center gap-4">
            <ColorPicker 
              v-model="selectedColor"
              :mode="selectedMode"
              :show-alpha="showAlpha"
              :show-presets="showPresets"
              :disabled="disabled"
              :size="size"
              @change="handleColorChange"
            />
            <div class="space-y-1">
              <div class="text-sm text-muted-foreground">当前配置:</div>
              <div class="text-xs font-mono text-foreground">{{ selectedColor }}</div>
            </div>
          </div>

          <div class="space-y-2">
            <div class="text-sm text-muted-foreground">配置信息:</div>
            <div class="text-xs space-y-1 font-mono text-muted-foreground">
              <div>模式: {{ selectedMode }}</div>
              <div>尺寸: {{ size }}</div>
              <div>透明度: {{ showAlpha ? '启用' : '禁用' }}</div>
              <div>预设: {{ showPresets ? '显示' : '隐藏' }}</div>
              <div>状态: {{ disabled ? '禁用' : '启用' }}</div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 代码示例 -->
    <section class="space-y-4">
      <h2 class="text-xl font-semibold text-foreground">代码示例</h2>
      <div class="p-4 border-2 border-border rounded bg-muted/20">
        <pre class="text-sm text-foreground overflow-x-auto"><code>&lt;template&gt;
  &lt;ColorPicker 
    v-model="selectedColor"
    :mode="selectedMode"
    :show-alpha="showAlpha"
    :show-presets="showPresets"
    :disabled="disabled"
    :size="size"
    @change="handleColorChange"
  /&gt;
&lt;/template&gt;

&lt;script setup&gt;
import { ref } from 'vue'
import ColorPicker from '@/components/color-picker/ColorPicker.vue'

const selectedColor = ref('#ff6b6b')
const selectedMode = ref('hex')

function handleColorChange(color, mode) {
  console.log('颜色变化:', color, '模式:', mode)
}
&lt;/script&gt;</code></pre>
      </div>
    </section>
  </div>
</template>
