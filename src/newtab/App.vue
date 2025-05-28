<script setup lang="ts">
import { ref, onMounted } from 'vue'
import SearchBar from './components/SearchBar.vue'
import bgImage from '../assets/bg.jpg'
import ModalContainer from '@/components/Modal/ModalContainer.vue'

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
  <div class="app-container pt-10 min-h-dvh w-full relative box-border" :style="bgStyle">
    <div class="max-w-[1200px] mx-auto p-5 relative z-10">
      <SearchBar />
    </div>
    <ModalContainer />
  </div>
</template>
