<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { openAddEngineDialog } from '@/composables/useDialog'
import { useEngine } from '@/composables/useEngine'

const searchQuery = ref('')
const showEngineSettings = ref(false)
const { selectedEngine, searchEngines, removeSearchEngine, selectEngine } = useEngine()

const handleSearch = () => {
  if (searchQuery.value.trim()) {
    window.open(selectedEngine.value.url + encodeURIComponent(searchQuery.value), '_blank')
  }
}

const handleKeyPress = (e: KeyboardEvent) => {
  if (e.key === 'Enter') {
    handleSearch()
  }
}

const handleClickOutside = (event: MouseEvent) => {
  const settingsPanel = document.querySelector('.engine-settings')
  const searchBar = document.querySelector('.search-bar')
  if (showEngineSettings.value && settingsPanel && searchBar) {
    // 检查点击是否在设置面板外部且不是在搜索栏上
    if (!settingsPanel.contains(event.target as Node) && !searchBar.contains(event.target as Node)) {
      showEngineSettings.value = false
    }
  }
}

onMounted(() => {
  // 添加全局点击事件监听
  document.addEventListener('click', handleClickOutside)
})

// 组件卸载时移除事件监听
onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})

</script>

<template>
  <div class="search-container">
    <div class="search-bar">
      <img
        :src="selectedEngine.icon"
        class="engine-icon"
        @click="showEngineSettings = !showEngineSettings"
      />
      <input
        v-model="searchQuery"
        type="text"
        placeholder="输入搜索内容"
        @keypress="handleKeyPress"
      />
      <button @click="handleSearch">搜索</button>
    </div>

    <div v-if="showEngineSettings" class="engine-settings">
      <div class="engine-grid">
        <div
          v-for="(engine, index) in searchEngines"
          :key="engine.name"
          class="engine-grid-item"
          :class="{ active: selectedEngine.name === engine.name }"
          @click="selectEngine(engine)"
        >
          <img :src="engine.icon" class="engine-icon-large" :alt="engine.name" />
          <span class="engine-name">{{ engine.name }}</span>
          <button
            class="delete-btn"
            @click.stop="removeSearchEngine(index)"
            title="删除搜索引擎"
          >
            <svg viewBox="0 0 24 24" class="delete-icon">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
            </svg>
          </button>
        </div>
        <!-- 添加按钮 -->
        <div
          class="engine-grid-item"
          @click="openAddEngineDialog"
        >+</div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.search-container {
  position: relative;
  width: 100%;
  max-width: 600px;
  margin: 20px auto;
}

.search-bar {
  display: flex;
  align-items: center;
  background: white;
  border-radius: 24px;
  padding: 8px 16px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.search-bar input {
  flex: 1;
  border: none;
  outline: none;
  padding: 8px;
  font-size: 16px;
  margin: 0 8px;
}

.search-bar button {
  background: #4285f4;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 20px;
  cursor: pointer;
}

.engine-icon {
  width: 24px;
  height: 24px;
  cursor: pointer;
}

.engine-settings {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  padding: 16px;
  margin-top: 8px;
  z-index: 1000;
}

.engine-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
  gap: 16px;
  padding: 8px;
}

.engine-grid-item {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  aspect-ratio: 1;
  padding: 12px;
  border-radius: 12px;
  background: #f8f9fa;
  cursor: pointer;
  transition: all 0.2s ease;
}

.engine-grid-item:hover {
  background: #f0f2f5;
  transform: translateY(-2px);
}

.engine-grid-item.active {
  background: #e8f0fe;
  border: 2px solid #4285f4;
}

.engine-icon-large {
  width: 32px;
  height: 32px;
  margin-bottom: 8px;
}

.engine-name {
  font-size: 12px;
  color: #333;
  text-align: center;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  width: 100%;
}

.delete-btn {
  position: absolute;
  top: 4px;
  right: 4px;
  width: 20px;
  height: 20px;
  padding: 2px;
  border: none;
  border-radius: 50%;
  background: rgba(220, 53, 69, 0.1);
  color: #dc3545;
  cursor: pointer;
  opacity: 0;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.engine-grid-item:hover .delete-btn {
  opacity: 1;
}

.delete-btn:hover {
  background: #dc3545;
  color: white;
  transform: scale(1.1);
}

.delete-icon {
  width: 16px;
  height: 16px;
  fill: currentColor;
}
</style> 
