<script setup lang="ts">
const props = defineProps<{
  label: string
  modelValue: string | null | undefined
  required?: boolean
  helper?: string
  placeholder?: string
}>()

const emit = defineEmits<{
  'update:modelValue': [string]
}>()

const onInput = (event: Event) => {
  const target = event.target as HTMLInputElement
  emit('update:modelValue', target.value.toUpperCase())
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
      type="text"
      :value="modelValue ?? ''"
      :placeholder="placeholder || 'e.g. SW1A 1AA'"
      inputmode="text"
      autocapitalize="characters"
      maxlength="8"
      :required="required"
      @input="onInput"
    />
    <p v-if="helper" class="help-text">{{ helper }}</p>
  </div>
</template>
