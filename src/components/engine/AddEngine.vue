<script setup lang="ts">
import { ref, watch } from 'vue'
import { useEngine } from '@/composables/useEngine'
import { closeAddEngineDialog } from '@/composables/useDialog'
import { isValidDomain, getFavicon, generateAvatar, cn } from '@/lib/utils'
import ModalHeader from '@/components/modal/ModalHeader.vue'
import ModalContent from '@/components/modal/ModalContent.vue'
import ModalFooter from '@/components/modal/ModalFooter.vue'
import Input from '@/components/input/Input.vue'
import Button from '@/components/button/Button.vue'

const engineName = ref('')
const engineUrl = ref('')
const engineIcon = ref('')
const { addSearchEngine } = useEngine()

const avatar = ref('')
const activeIcon = ref('')

const isNameInvalid = ref(false)
const isUrlInvalid = ref(false)

watch(engineUrl, (newValue) => {
  if (newValue && isValidDomain(newValue)) {
    engineIcon.value = getFavicon(newValue)
  }
})

watch(
  engineName,
  (newValue) => {
    avatar.value = generateAvatar(newValue)
  },
  { immediate: true },
)

const validateName = () => {
  isNameInvalid.value = !engineName.value.trim()
}

const validateUrl = () => {
  const trimmedUrl = engineUrl.value.trim()
  isUrlInvalid.value = !trimmedUrl || !isValidDomain(trimmedUrl)
}

const validateInputs = () => {
  validateName()
  validateUrl()
}

const handleNameInput = () => {
  validateName()
}

const handleUrlInput = () => {
  validateUrl()
}

const handleAddEngine = () => {
  validateInputs()
  if (!isNameInvalid.value && !isUrlInvalid.value) {
    if (!activeIcon.value) {
      activeIcon.value = avatar.value
    }
    addSearchEngine({
      name: engineName.value.trim(),
      url: engineUrl.value.trim(),
      icon: activeIcon.value,
    })
    closeAddEngineDialog()
  }
}
</script>

<template>
  <ModalContent size="md">
    <ModalHeader @close="closeAddEngineDialog">
      <div class="text-xl">自定义搜索引擎</div>
    </ModalHeader>
    <form class="flex flex-col gap-4" @submit.prevent="handleAddEngine">
      <div class="flex flex-col pt-6 pb-4 px-4 gap-4">
        <Input
          v-model="engineName"
          placeholder="请输入搜索引擎名称"
          :invalid="isNameInvalid"
          @input="handleNameInput"
        />
        <Input v-model="engineUrl" placeholder="请输入搜索引擎URL" :invalid="isUrlInvalid" @input="handleUrlInput" />
        <div class="flex items-center w-full">
          <span class="text-base">图标：</span>
          <div class="flex flex-1 items-center gap-2">
            <img
              :src="avatar"
              :class="
                cn('w-10 h-10 border-4 border-transparent rounded-full', {
                  'border-4 border-primary': activeIcon === avatar,
                })
              "
              alt="favicon"
              @click="activeIcon = avatar"
            />
            <img
              v-if="engineIcon"
              :src="engineIcon"
              :class="
                cn('w-10 h-10 border-4 border-transparent rounded-full', {
                  'border-4 border-primary': activeIcon === engineIcon,
                })
              "
              alt="favicon"
              @click="activeIcon = engineIcon"
            />
          </div>
        </div>
      </div>
      <ModalFooter>
        <Button type="submit">确 定</Button>
      </ModalFooter>
    </form>
  </ModalContent>
</template>
