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
    name: 'Yandex',
    url: 'https://yandex.com/search/?text=',
    icon: '../../assets/yandex.png'
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
  const removeSearchEngine = (index: number) => {
    if (searchEngines.value.length <= 1) {
      return
    }
    searchEngines.value = searchEngines.value.filter((_, i) => i !== index)
  }
  
  const selectEngine = (engine: SearchEngine) => {
    selectedEngine.value = engine
  }

  const addSearchEngine = (engine: SearchEngine) => {
    searchEngines.value = [...searchEngines.value, engine]
  }

  return {
    selectedEngine,
    searchEngines,
    selectedEngineDataReady,
    searchEnginesDataReady,
    removeSearchEngine,
    selectEngine,
    addSearchEngine
  }
}

