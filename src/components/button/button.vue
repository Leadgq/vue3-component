<template>
  <template v-if="!isShowBadge">
    <el-button :type="props.type" v-bind="$attrs" :loading="loading" :disabled="disabled" @click="emit('click')">
      <template v-for="(_, name) in slots" :key="name" #[name]="slotData">
        <template v-if="name === 'default'">
          <slot :name="name" />
        </template>
        <template v-else>
          <slot :name="name" v-bind="slotData" />
        </template>
      </template>
    </el-button>
  </template>
  <template v-else>
    <el-badge v-bind="$attrs">
      <el-button :type="props.buttonType" @click="emit('click')">
        <slot />
      </el-button>
    </el-badge>
  </template>
</template>

<script setup>
import { ElButton, ElBadge } from 'element-plus'
import { useAttrs, useSlots } from 'vue';
const emit = defineEmits(['click'])
const $attrs = useAttrs()
const slots = useSlots()
const props = defineProps({
  type: {
    type: String,
    default: 'default'
  },
  loading: {
    type: Boolean,
    default: false
  },
  disabled: {
    type: Boolean,
    default: false
  },
  isShowBadge: {
    type: Boolean,
    default: false
  },
  buttonType: {
    type: String,
    default: 'primary'
  }
})
</script>
