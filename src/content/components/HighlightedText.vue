<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  text: string
  query: string
}

const props = defineProps<Props>()

const highlightedText = computed(() => {
  if (!props.query || !props.text) {
    return escapeHtml(props.text)
  }

  const query = props.query.toLowerCase()
  const text = props.text
  const textLower = text.toLowerCase()

  // 找到所有匹配项
  const matches: Array<{ start: number; end: number }> = []
  let index = 0

  while (index < textLower.length) {
    const matchIndex = textLower.indexOf(query, index)
    if (matchIndex === -1) break

    matches.push({
      start: matchIndex,
      end: matchIndex + query.length,
    })
    index = matchIndex + 1
  }

  if (matches.length === 0) {
    return escapeHtml(text)
  }

  // 实现文本高亮显示
  let result = ''
  let lastEnd = 0

  for (const match of matches) {
    // 拼接高亮词前面的文本
    result += escapeHtml(text.slice(lastEnd, match.start))
    // 拼接高亮词文本
    result += `<mark class="bg-yellow-200 dark:bg-yellow-800 text-yellow-900 dark:text-yellow-100 px-0.5 rounded">${escapeHtml(text.slice(match.start, match.end))}</mark>`

    lastEnd = match.end
  }

  // 拼接剩余的文本
  result += escapeHtml(text.slice(lastEnd))

  return result
})

// 将字符串进行 HTML 转义
function escapeHtml(text: string): string {
  const div = document.createElement('div')
  div.textContent = text
  return div.innerHTML
}
</script>

<template>
  <span v-html="highlightedText"></span>
</template>
