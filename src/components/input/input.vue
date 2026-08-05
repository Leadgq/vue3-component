<script>
export default {
  inheritAttrs: false,
}
</script>

<script setup>
import { useAttrs, useSlots, ref } from 'vue'
import { ElInput } from 'element-plus'

const attrs = useAttrs()
const slots = useSlots()
const elInputRef = ref()

defineExpose({
  clear: () => elInputRef.value?.clear(),
  select: () => elInputRef.value?.select(),
  focus: () => elInputRef.value?.focus(),
  blur: () => elInputRef.value?.blur(),
})
</script>

<template>
  <el-input v-bind="attrs" ref="elInputRef">
    <template v-for="(_, name) in slots" #[name]="slotData">
      <template v-if="name === 'default'">
        <slot :name="name" />
      </template>
      <template v-else>
        <slot :name="name" v-bind="slotData" />
      </template>
    </template>
  </el-input>
</template>