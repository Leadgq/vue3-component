<template>
  <div class="yo-unit-input" :class="{ 'is-disabled': disabled }">
    <el-input v-bind="inputAttrs" v-model="modelValue" :disabled="disabled" class="unit-input-inner">
      <template #append>
        <el-select v-model="unitValue" :disabled="disabled" :placeholder="unitPlaceholder" class="unit-select-inner"
          :style="{ width: unitWidth + 'px' }" v-bind="selectAttrs">
          <template v-for="(_, name) in selectSlots" #[name]="slotData">
            <slot :name="'unit-' + name" v-bind="slotData" />
          </template>
          <template v-if="!selectSlots.default">
            <el-option v-for="item in localOptions" :key="item[keyValue.value]" :label="item[keyValue.label]"
              :value="item[keyValue.value]" />
          </template>
        </el-select>
      </template>
      <!-- Pass through input slots -->
      <template v-for="(_, name) in inputSlots" #[name]="slotData">
        <slot :name="name" v-bind="slotData" />
      </template>
    </el-input>
  </div>
</template>

<script setup>
import { computed, useAttrs, useSlots, ref, watchEffect, getCurrentInstance, watch } from 'vue'
import { ElInput, ElSelect, ElOption } from 'element-plus'

defineOptions({ inheritAttrs: false })

const props = defineProps({
  modelValue: [String, Number],
  unit: [String, Number],
  options: {
    type: Array,
    default: () => []
  },
  api: String,
  enumName: String,
  keyValue: {
    type: Object,
    default: () => ({ value: 'Value', label: 'Description' })
  },
  unitWidth: {
    type: [String, Number],
    default: 100
  },
  unitPlaceholder: {
    type: String,
    default: ''
  },
  disabled: Boolean
})

const emit = defineEmits(['update:modelValue', 'update:unit', 'change', 'unit-change'])

const attrs = useAttrs()
const slots = useSlots()
const proxy = getCurrentInstance().proxy


const inputAttrs = computed(() => {
  const result = { ...attrs }
  return result
})

const selectAttrs = computed(() => {
  return {}
})

const inputSlots = computed(() => {
  const result = {}
  Object.keys(slots).forEach(name => {
    if (!name.startsWith('unit-') && name !== 'append') {
      result[name] = slots[name]
    }
  })
  return result
})

const selectSlots = computed(() => {
  const result = {}
  Object.keys(slots).forEach(name => {
    if (name.startsWith('unit-')) {
      result[name.replace('unit-', '')] = slots[name]
    }
  })
  return result
})

const modelValue = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const innerUnit = ref(props.unit)
watch(() => props.unit, (val) => {
  innerUnit.value = val
})

const unitValue = computed({
  get: () => innerUnit.value,
  set: (val) => {
    innerUnit.value = val
    emit('update:unit', val)
    emit('unit-change', val)
  }
})

const localOptions = ref([])
const modelType = computed(() => {
  if (props.enumName) return 'enum'
  if (props.api) return 'api'
  return 'options'
})

watchEffect(async () => {
  const { value: valueKey, label: labelKey } = props.keyValue

  if (modelType.value === 'enum') {
    const res = await proxy.$http.get('/api/Enum/GetEnumItems?fullname=' + props.enumName) || []
    const list = Array.isArray(res) ? res : (res.Data || res.data || [])
    localOptions.value = list.map(item => ({
      [valueKey]: item.Value,
      [labelKey]: item.Description
    }))
    if (localOptions.value.length > 0 && !unitValue.value) {
      unitValue.value = localOptions.value[0][valueKey]
    }
  } else if (modelType.value === 'api') {
    const data = await proxy.$http.get(props.api) || []
    const list = Array.isArray(data) ? data : (data.Data || data.data || [])
    localOptions.value = list.map(item => ({
      [valueKey]: item[valueKey],
      [labelKey]: item[labelKey]
    }))
    if (localOptions.value.length > 0 && !unitValue.value) {
      unitValue.value = localOptions.value[0][valueKey]
    }
  } else {
    localOptions.value = (props.options || []).map(item => ({
      [valueKey]: item[valueKey],
      [labelKey]: item[labelKey]
    }))
  }
})
</script>

<style lang="scss" scoped>
.yo-unit-input {
  width: 100%;

  /* Vue 3 推荐的深度选择器语法是 :deep(selector) */
  :deep(.ep-input-group__append) {
    background-color: transparent;
    border: none;
    padding-bottom: 1px;
    padding-top: 1px;
  }

  /* 针对 Element Plus 不同版本的兼容写法 (el-input__wrapper 或 ep-select__wrapper) */
  :deep(.unit-select-inner .ep-select__wrapper),
  :deep(.unit-select-inner .ep-input__wrapper) {
    box-shadow: none !important;
    background-color: transparent !important;
    border: none !important;
  }

  :deep(.unit-select-inner .ep-input__inner) {
    text-align: center;
  }

}
</style>
