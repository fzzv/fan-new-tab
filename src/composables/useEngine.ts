import { useWebExtStorage } from '@/composables/useWebExtStorage'

interface SearchEngine {
  name: string
  url: string
  icon: string
}

const { data: selectedEngine, dataReady: selectedEngineDataReady } = useWebExtStorage('selectedEngine', {
  name: 'Google',
  url: 'https://www.google.com/search?q=',
  icon: '../../assets/google.jpg'
})
const { data: searchEngines, dataReady: searchEnginesDataReady } = useWebExtStorage('searchEngines', [
  {
    name: 'Google',
    url: 'https://www.google.com/search?q=',
    icon: '../../assets/google.jpg'
  },
  {
    name: 'Bing',
    url: 'https://www.bing.com/search?q=',
    icon: '../../assets/bing.png'
  },
  {
    name: 'Baidu',
    url: 'https://www.baidu.com/s?wd=',
    icon: '../../assets/baidu.png'
  }
])

export function useEngine() {
  
  const saveSearchEngines = () => {
    // 转换为数组后再存储
    searchEngines.value = Array.from(searchEngines.value)
  }
  
  const removeSearchEngine = (index: number) => {
    if (searchEngines.value.length <= 1) {
      alert('至少保留一个搜索引擎')
      return
    }
    
    searchEngines.value = Array.from(searchEngines.value).filter((_, i) => i !== index)
    saveSearchEngines()
  }
  
  const selectEngine = (engine: SearchEngine) => {
    selectedEngine.value = engine
    saveSearchEngines()
  }

  const addSearchEngine = (engine: SearchEngine) => {
    searchEngines.value.push(engine)
    saveSearchEngines()
  }

  return {
    selectedEngine,
    searchEngines,
    selectedEngineDataReady,
    searchEnginesDataReady,
    saveSearchEngines,
    removeSearchEngine,
    selectEngine,
    addSearchEngine
  }
}

