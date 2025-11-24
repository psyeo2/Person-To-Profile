<script setup lang="ts">
const props = defineProps<{
  label: string
  modelValue: string | number | null | undefined
  options?: string[]
  required?: boolean
  helper?: string
}>()

const emit = defineEmits<{
  'update:modelValue': [string]
}>()

const onChange = (event: Event) => {
  const target = event.target as HTMLSelectElement
  emit('update:modelValue', target.value)
}
</script>

<template>
  <div class="form-field">
    <label class="form-label">
      {{ label }}
      <span v-if="required" class="required" aria-hidden="true">*</span>
    </label>
    <select class="select-control" :value="modelValue ?? ''" @change="onChange" :required="required">
      <option value="" disabled>Select an option</option>
      <option v-for="option in options" :key="option" :value="option">
        {{ option }}
      </option>
    </select>
    <p v-if="helper" class="help-text">{{ helper }}</p>
  </div>
</template>
