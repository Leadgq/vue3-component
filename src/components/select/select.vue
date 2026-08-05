<template>
    <div class="yo-select">
        <el-select v-bind="attrs" v-model="modelValue" popper-class="yo-select-dropdown" :loading="loading"
            @change="handleSelect">
            <template v-for="(_, name) in slots" #[name]="slotData">
                <slot :name="name" v-bind="slotData" />
            </template>
            <template v-if="!slots.default">
                <el-option v-for="item in localOptions" :key="item.value" :label="item.label" :value="item.value" />
            </template>
        </el-select>
    </div>
</template>
<script setup>
import { ElSelect, ElOption } from 'element-plus'
import { computed, useAttrs, useSlots, getCurrentInstance, ref, watchEffect, watch } from 'vue'
defineOptions({ inheritAttrs: false })
const props = defineProps({
    enumName: String,
    api: String,
    options: {
        type: Array,
        default: () => []
    },
    keyValue: {
        type: Object,
        default: () => ({ value: 'Value', label: 'Description' })
    }
})
const loading = ref(false);
const attrs = useAttrs()
const slots = useSlots()
const proxy = getCurrentInstance().proxy
const modelValue = defineModel()
const modelType = computed(() => {
    if (props.enumName) return 'enum'
    if (props.api) return 'api'
    return 'options'
})
const localOptions = ref([])


const getEnum = async () => {
    try {
        loading.value = true;
        const res = await proxy.$http.get('/api/Enum/GetEnumItems?fullname=' + props.enumName) || []
        const list = Array.isArray(res) ? res : (res.Data || res.data || [])
        localOptions.value = list.map(item => ({
            value: item.Value,
            label: item.Description
        }))
    } catch (error) {
        console.error(error)
    } finally {
        loading.value = false;
    }
}

const getApi = async () => {
    try {
        loading.value = true;
        const data = await proxy.$http.get(props.api) || []
        const { value, label } = props.keyValue
        const list = Array.isArray(data) ? data : (data.Data || data.data || [])
        localOptions.value = list.map(item => ({
            value: item[value],
            label: item[label]
        }))
    } catch (error) {
        console.error(error)
    } finally {
        loading.value = false;
    }
}

watchEffect(async () => {
    if (modelType.value === 'enum') {
        getEnum()
    } else if (modelType.value === 'api') {
        getApi()
    } else {
        const { value, label } = props.keyValue
        localOptions.value = props.options.map(item => ({
            value: item[value],
            label: item[label]
        }))
    }
})

const emits = defineEmits(["selectChange"])
const handleSelect = () => {
    const currentList = localOptions.value;
    const selectObject = localOptions.value.find((item) => modelValue.value === item.value)
    emits("selectChange", currentList, selectObject)
}
</script>
