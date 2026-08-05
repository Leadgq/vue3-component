<template>
    <el-radio-group v-bind="attrs" v-model="modelValue">
        <slot>
            <template v-if="options && options.length">
                <component :is="activeComp" v-for="opt in options" :key="opt.value" :label="opt.value">
                    {{ opt.label }}
                </component>
            </template>
        </slot>
    </el-radio-group>
</template>

<script setup>
import { computed, useAttrs } from "vue"
import { ElRadioGroup, ElRadio, ElRadioButton } from "element-plus"

const props = defineProps({
    options: {
        type: Array,
        default: () => []
    },
    activeType: {
        type: String,
        default: 'radio' // 'radio' or 'button'
    }
})

const attrs = useAttrs()
const modelValue = defineModel()

const activeComp = computed(() => {
    return props.activeType === 'button' ? ElRadioButton : ElRadio
})
</script>