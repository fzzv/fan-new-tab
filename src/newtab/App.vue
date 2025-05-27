<script setup lang="ts">
import { ref, onMounted } from 'vue'
import SearchBar from './components/SearchBar.vue'
import bgImage from '../assets/bg.jpg'

const bgStyle = ref({
  backgroundImage: `url(${bgImage})`,
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  backgroundRepeat: 'no-repeat'
})

// 从 storage 加载背景设置
onMounted(() => {
  const savedBgStyle = localStorage.getItem('bgStyle')
  if (savedBgStyle) {
    const saved = JSON.parse(savedBgStyle)
    // 保持背景图片不变，只更新其他样式
    bgStyle.value = {
      ...saved,
      backgroundImage: `url(${bgImage})`
    }
  }
})
</script>

<template>
  <div class="app-container" :style="bgStyle">
    <div class="content-container">
      <SearchBar />
    </div>
  </div>
</template>
