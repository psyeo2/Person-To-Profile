<script setup lang="ts">
const props = defineProps<{
  label: string
  modelValue: string | null | undefined
  placeholder?: string
  helper?: string
  required?: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [string]
}>()

const onInput = (event: Event) => {
  const target = event.target as HTMLTextAreaElement | HTMLInputElement
  emit('update:modelValue', target.value)
}
</script>

<template>
  <div class="form-field">
    <label class="form-label">
      {{ label }}
      <span v-if="required" class="required" aria-hidden="true">*</span>
    </label>
    <textarea
      class="textarea-control"
      :value="modelValue ?? ''"
      :placeholder="placeholder || 'Write a short response...'"
      :required="required"
      @input="onInput"
    ></textarea>
    <p v-if="helper" class="help-text">{{ helper }}</p>
  </div>
</template>
