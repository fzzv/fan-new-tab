<template>
  <span v-html="highlightedText"></span>
</template>

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

  // Find all matches
  const matches: Array<{ start: number; end: number }> = []
  let index = 0

  while (index < textLower.length) {
    const matchIndex = textLower.indexOf(query, index)
    if (matchIndex === -1) break

    matches.push({
      start: matchIndex,
      end: matchIndex + query.length
    })
    index = matchIndex + 1
  }

  if (matches.length === 0) {
    return escapeHtml(text)
  }

  // Build highlighted text
  let result = ''
  let lastEnd = 0

  for (const match of matches) {
    // Add text before match
    result += escapeHtml(text.slice(lastEnd, match.start))
    
    // Add highlighted match
    result += `<mark class="bg-yellow-200 dark:bg-yellow-800 text-yellow-900 dark:text-yellow-100 px-0.5 rounded">${escapeHtml(text.slice(match.start, match.end))}</mark>`
    
    lastEnd = match.end
  }

  // Add remaining text
  result += escapeHtml(text.slice(lastEnd))

  return result
})

function escapeHtml(text: string): string {
  const div = document.createElement('div')
  div.textContent = text
  return div.innerHTML
}
</script>

<style scoped>
/* Ensure mark elements have proper styling */
:deep(mark) {
  font-weight: 500;
}
</style>
