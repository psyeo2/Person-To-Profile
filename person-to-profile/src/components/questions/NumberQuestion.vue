<script setup lang="ts">
const props = defineProps<{
  label: string
  modelValue: number | null | undefined
  min?: number
  max?: number
  step?: number
  required?: boolean
  helper?: string
}>()

const emit = defineEmits<{
  'update:modelValue': [number | null]
}>()

const onInput = (event: Event) => {
  const target = event.target as HTMLInputElement
  const value = target.value === '' ? null : Number(target.value)
  emit('update:modelValue', Number.isNaN(value as number) ? null : value)
}
</script>

<template>
  <div class="form-field">
    <label class="form-label">
      {{ label }}
      <span v-if="required" class="required" aria-hidden="true">*</span>
    </label>
    <input
      class="input-control"
      type="number"
      :value="modelValue ?? ''"
      :min="min"
      :max="max"
      :step="step ?? 1"
      :required="required"
      @input="onInput"
    />
    <p v-if="helper" class="help-text">{{ helper }}</p>
  </div>
</template>
