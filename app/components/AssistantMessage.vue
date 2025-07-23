<template>
  <div
    class="flex items-start gap-x-4 p-4 rounded-lg bg-gray-50/60 dark:bg-gray-800/60"
  >
    <div class="w-12 h-12 p-3 rounded-full bg-blue-500/20">
      <UIcon
        name="i-lucide-sparkles"
        class="w-6 h-6 text-blue-400 dark:text-blue-500"
      />
    </div>

    <div class="flex-1 whitespace-pre-wrap text-sm text-gray-900 dark:text-gray-100">
      {{ content }}
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  content: string;
  messageId: string;
}>();
</script>

