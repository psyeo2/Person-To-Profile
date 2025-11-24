<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  label: string
  modelValue: number | null | undefined
  min?: number
  max?: number
  step?: number
  helper?: string
  required?: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [number]
}>()

const valueLabel = computed(() => props.modelValue ?? props.min ?? 0)

const onInput = (event: Event) => {
  const target = event.target as HTMLInputElement
  emit('update:modelValue', Number(target.value))
}
</script>

<template>
  <div class="form-field">
    <label class="form-label">
      {{ label }}
      <span v-if="required" class="required" aria-hidden="true">*</span>
    </label>
    <div class="slider-row">
      <input
        type="range"
        :value="modelValue ?? min ?? 0"
        :min="min"
        :max="max"
        :step="step ?? 1"
        :required="required"
        @input="onInput"
      />
      <span class="slider-value">{{ valueLabel }}</span>
    </div>
    <p v-if="helper" class="help-text">{{ helper }}</p>
  </div>
</template>
