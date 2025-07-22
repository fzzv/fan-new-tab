<script setup lang="ts">
import { ref } from 'vue'
import ModalHeader from '@/components/modal/ModalHeader.vue'
import ModalContent from '@/components/modal/ModalContent.vue'
import ModalFooter from '@/components/modal/ModalFooter.vue'
import Button from '@/components/button/Button.vue'
import Input from '@/components/input/Input.vue'
import { closeAddFavoriteDialog, addFavoritePosition } from '@/composables/useDialog'
import { useFavorite } from '@/composables/useFavorite'

const favoriteName = ref('')
const isInvalid = ref(false)

const { addFavorite, addFavoriteAtPosition } = useFavorite()

const validateInput = () => {
  isInvalid.value = !favoriteName.value.trim()
}

const handleInput = () => {
  validateInput()
}

const handleAddFavorite = () => {
  validateInput()
  if (!isInvalid.value) {
    const favoriteData = {
      label: favoriteName.value.trim(),
      value: '',
    }

    // 如果指定了位置，使用位置插入，否则添加到末尾
    if (addFavoritePosition.value !== null) {
      addFavoriteAtPosition(favoriteData, addFavoritePosition.value)
    } else {
      addFavorite(favoriteData)
    }

    closeAddFavoriteDialog()
  }
}
</script>

<template>
  <ModalContent size="sm">
    <ModalHeader @close="closeAddFavoriteDialog">
      <div class="text-xl">添加收藏夹</div>
    </ModalHeader>
    <form class="flex flex-col gap-4" @submit.prevent="handleAddFavorite">
      <div class="flex flex-col pt-6 pb-4 px-4 gap-4">
        <div class="flex flex-col gap-1">
          <Input v-model="favoriteName" placeholder="收藏夹名称" :invalid="isInvalid" @input="handleInput" />
        </div>
      </div>
      <ModalFooter>
        <Button type="submit">确 定</Button>
      </ModalFooter>
    </form>
  </ModalContent>
</template>
