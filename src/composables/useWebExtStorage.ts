import { ref, shallowRef, watch, getCurrentScope, onScopeDispose, toValue } from 'vue'
import type { MaybeRef, ComputedRef } from 'vue'
import { storage } from 'webextension-polyfill'
import type { Storage } from 'webextension-polyfill'
import type { StorageOptions, StorageLikeAsync } from '@/types'
import { StorageSerializers } from '@/types'

type MaybeRefOrGetter<T = any> = MaybeRef<T> | ComputedRef<T> | (() => T)

// 猜测序列化类型
function guessSerializerType(initData: unknown) {
  return initData == null
    ? 'any'
    : initData instanceof Set
      ? 'set'
      : initData instanceof Map
        ? 'map'
        : initData instanceof Date
          ? 'date'
          : typeof initData === 'boolean'
            ? 'boolean'
            : typeof initData === 'string'
              ? 'string'
              : typeof initData === 'object'
                ? 'object'
                : Number.isNaN(initData)
                  ? 'any'
                  : 'number'
}

/**
 * 响应式同步的 storage hook
 * @param key 存储的 key
 * @param defaultValue 默认值
 * @param options 配置项
 */
export function useWebExtStorage<T>(key: string, defaultValue: MaybeRefOrGetter<T>, options: StorageOptions<T> = {}) {
  const {
    area = 'local',
    flush = 'pre',
    shallow = false,
    deep = true,
    writeDefaults = true,
    mergeDefaults = false,
    listenToStorageChanges = true,
    onError = (error: unknown) => {
      console.log(error)
    },
  } = options

  const storageInterface: StorageLikeAsync = {
    removeItem(key: string) {
      return storage[area].remove(key)
    },
    setItem(key: string, value: string) {
      return storage[area].set({ [key]: value })
    },
    async getItem(key: string) {
      const storedData = await storage[area].get(key)
      return storedData[key] as string
    },
  }

  // 初始值
  const initData: T = toValue(defaultValue)
  // 猜测序列化类型
  const type = guessSerializerType(initData)
  // 如果提供了类型，则使用对应的序列化器，没有提供就根据猜测的类型使用对应的序列化器
  const serializer = options.serializer ?? StorageSerializers[type]
  // 响应式数据
  const data = (shallow ? shallowRef : ref)(initData)

  // 从 storage 读取数据并同步到 data
  async function read(event?: { key: string; newValue: string | null }) {
    if (event && event.key !== key) return

    try {
      const rawValue = event ? event.newValue : await storageInterface.getItem(key)
      if (rawValue == null) {
        data.value = initData
        if (writeDefaults && initData !== null) await storageInterface.setItem(key, await serializer.write(initData))
      } else if (mergeDefaults) {
        const value = (await serializer.read(rawValue)) as T
        if (typeof mergeDefaults === 'function') data.value = mergeDefaults(value, initData)
        else if (type === 'object' && !Array.isArray(value))
          data.value = {
            ...(initData as Record<keyof unknown, unknown>),
            ...(value as Record<keyof unknown, unknown>),
          } as T
        else data.value = value
      } else {
        data.value = (await serializer.read(rawValue)) as T
      }
    } catch (error) {
      onError(error)
    }
  }

  // 异步加载初始数据，确保 data.value 是存储中的最新状态
  const dataReadyPromise = new Promise<T>((resolve, reject) => {
    read()
      .then(() => resolve(data.value))
      .catch(reject)
  })

  const { pause, resume } = watch(data, write, { deep, flush })

  // 写入 data 到 storage
  async function write() {
    pause()
    try {
      await (data.value == null
        ? storageInterface.removeItem(key)
        : storageInterface.setItem(key, await serializer.write(data.value)))
    } catch (error) {
      onError(error)
    } finally {
      resume()
    }
  }

  // 监听 storage 变化，自动同步到 data
  if (listenToStorageChanges) {
    const listener = async (changes: Record<string, Storage.StorageChange>) => {
      try {
        pause()
        for (const [key, change] of Object.entries(changes)) {
          await read({
            key,
            newValue: change.newValue as string | null,
          })
        }
      } catch (error) {
        onError(error)
      } finally {
        resume()
      }
    }

    storage.onChanged.addListener(listener)

    // 组合函数中 卸载时移除监听
    if (getCurrentScope()) {
      onScopeDispose(() => storage.onChanged.removeListener(listener))
    }
  }

  return {
    data: data,
    dataReady: dataReadyPromise,
  }
}
