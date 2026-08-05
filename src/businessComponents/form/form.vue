<template>
    <el-form ref="formRef" v-bind="formAttrs" :model="model" class="yo-form" :style="gridStyle">
        <template v-for="item in visibleConfig"
            :key="item.prop || (typeof item.label === 'function' ? item.label(model) : item.label)">
            <el-form-item v-bind="item.formItemProps || {}"
                :label="typeof item.label === 'function' ? item.label(model) : item.label" :required="isRequired(item)"
                :prop="item.children ? undefined : item.prop" :rules="getRules(item)" :label-width="item.labelWidth"
                :style="{
                    gridColumn: `span ${typeof item.span === 'function' ? item.span(model) : (item.span || 1)}`,
                    '--form-label-gap': item.space ? (typeof item.space === 'number' ? `${item.space}px` : item.space) : '12px'
                }">

                <!-- 1. 插槽支持 (最高优先级) -->
                <slot v-if="item.isSlot" :name="item.prop" :item="item" :model="model"></slot>

                <!-- 2. 嵌套渲染 -->
                <div v-else-if="item.children" class="yo-form-composite">
                    <template v-for="child in item.children" :key="child.prop">

                        <el-form-item v-if="child.prop" :prop="child.prop" :rules="getRules(child)"
                            v-bind="child.formItemProps || {}" class="yo-form-child-item">

                            <slot v-if="child.isSlot" :name="child.prop" :item="child" :model="model"></slot>

                            <RenderCell v-else-if="child.render" :render="child.render" :model="model" :item="child"
                                :style="[child.style || { flex: 1 }, child.props?.width ? { width: child.props.width, flex: 'none' } : {}]" />

                            <FieldItem v-else :model="model" :item="child" />
                        </el-form-item>


                        <template v-else>
                            <slot v-if="child.isSlot" :name="child.prop" :item="child" :model="model"></slot>

                            <RenderCell v-else-if="child.render" :render="child.render" :model="model" :item="child"
                                :style="[child.style || { flex: 1 }, child.props?.width ? { width: child.props.width, flex: 'none' } : {}]" />
                            <FieldItem v-else :model="model" :item="child" />
                        </template>
                    </template>
                </div>


                <RenderCell v-else-if="item.render" :render="item.render" :model="model" :item="item" />


                <FieldItem v-else :model="model" :item="item" />
            </el-form-item>
        </template>
        <!-- 额外默认插槽 -->
        <slot></slot>

        <!-- 表单操作按钮插槽，不属于 form 配置项 -->
        <div v-if="$slots.footer" class="yo-form-footer" :style="{ textAlign: footerAlign }">
            <slot name="footer"></slot>
        </div>
    </el-form>
</template>

<script setup lang="jsx">
import { computed, useAttrs, ref, watch } from 'vue'
import { ElForm, ElFormItem } from 'element-plus'
import { RenderCell, FieldItem, getVerb } from "./formRenderer"

const props = defineProps({
    model: {
        type: Object,
        required: true
    },
    config: {
        type: Array,
        required: true,
        default: () => []
    },
    cols: {
        type: Number,
        default: 3
    },
    labelWidth: {
        type: [String, Number],
        default: 'auto'
    },
    labelGap: {
        type: [String, Number],
        default: '12px'
    },
    xGap: {
        type: [String, Number],
        default: '41px'
    },
    yGap: {
        type: [String, Number],
        default: '26px'
    },
    loading: {
        type: Boolean,
        default: false
    },
    footerAlign: {
        type: String,
        default: 'right'
    },
    labelPosition: {
        type: String,
        default: 'left'
    }
})

const formRef = ref(null)
const attrs = useAttrs()

const formAttrs = computed(() => ({
    labelWidth: props.labelWidth,
    labelPosition: props.labelPosition,
    ...attrs
}))

// 获取全局校验规则
const globalRules = computed(() => attrs.rules || {})

const deepClone = (value) => {
    const cache = new Map();

    function _deepClone(value) {
        if (typeof value !== 'object' || value === null) {
            return value;
        }
        if (cache.has(value)) {
            return cache.get(value);
        }
        let result = Array.isArray(value) ? [] : {};
        cache.set(value, result);
        for (const key in value) {
            result[key] = _deepClone(value[key]);
        }
        return result;
    }

    return _deepClone(value)
}

const cloneData = ref();

watch(() => props.loading, () => {
    cloneData.value = deepClone(props.model)
}, { immediate: true })


const hiddenSet = new Set();
// 动态计算可见的配置 (处理 linkage 联动)
const visibleConfig = computed(() => {
    return props.config.filter(item => {
        // 处理 hidden 逻辑
        if (typeof item.hidden === 'function') {
            const isHidden = item.hidden(props.model);
            handlerHidden(isHidden, item)
            return !isHidden;
        }
        if (typeof item.hidden === 'boolean') {
            handlerHidden(item.hidden, item)
            return !item.hidden;
        }
        return true;
    });
})

const handlerHidden = (isHidden, item) => {
    const prop = item.prop;
    if (isHidden) {
        if (prop) {
            props.model[prop] = cloneData.value[prop];
        }
        hiddenSet.add(prop)
    } else {
        hiddenSet.delete(prop)
    }
}

const getVisibleValues = () => {
    const activePropSet = new Set()
    let result = {};
    const collectProps = (items) => {
        items.forEach(item => {
            if (item.prop && !hiddenSet.has(item.prop)) activePropSet.add(item.prop)
            if (item.children) collectProps(item.children)
        })
    }
    // 递归去取子项里面的值，包括跨列的组件,但必须是可见的
    collectProps(visibleConfig.value)
    Object.keys(props.model).forEach(key => {
        if (activePropSet.has(key)) {
            result[key] = props.model[key]
        }
    })
    return result
}
const gridStyle = computed(() => ({
    '--form-cols': props.cols,
    '--form-label-gap': typeof props.labelGap === 'number' ? `${props.labelGap}px` : props.labelGap,
    '--form-x-gap': typeof props.xGap === 'number' ? `${props.xGap}px` : props.xGap,
    '--form-y-gap': typeof props.yGap === 'number' ? `${props.yGap}px` : props.yGap,
}))

const isFieldRequired = (configItem) => {
    if (typeof configItem.required === 'function') return configItem.required(props.model);
    if (configItem.required) return true;
    const rules = configItem.rules || globalRules.value[configItem.prop];
    if (Array.isArray(rules)) {
        return rules.some(r => r.required);
    } else if (rules && rules.required) {
        return true;
    }
    return false;
}

const isRequired = (item) => {
    if (isFieldRequired(item)) return true;
    if (item.children) {
        return item.children.some(child => isFieldRequired(child));
    }
    return false;
}

const getRules = (item) => {
    const rules = item.rules || globalRules.value[item.prop];
    if (item.required && !rules) {
        const verb = getVerb(item.type);
        return [{ required: true, message: `${verb}${item.label || ''}`, trigger: ['blur', 'change'] }];
    }
    return rules;
}

defineExpose({
    validate: (...args) => formRef.value?.validate(...args),
    resetFields: (...args) => formRef.value?.resetFields(...args),
    clearValidate: (...args) => formRef.value?.clearValidate(...args),
    scrollToField: (...args) => formRef.value?.scrollToField(...args),
    formRef,
    getVisibleValues
})
</script>

<style scoped lang="scss">
.yo-form {
    display: grid;
    grid-template-columns: repeat(var(--form-cols, 3), 1fr);
    gap: var(--form-y-gap, 12px) var(--form-x-gap, 41px);
    width: 100%;
}

.yo-form-footer {
    grid-column: 1 / -1;
    /* 占据所有列，使其独立于表单项 */
    width: 100%;
}

.yo-form-composite {
    display: flex;
    gap: 8px;
    width: 100%;
}

:deep(.el-form-item) {
    margin-bottom: 0px !important;
    margin-right: 0px !important;
    display: flex;
    align-items: center;

    .el-form-item__label {
        padding-right: var(--form-label-gap, 12px) !important;
        color: #6a7998;
    }

    .el-form-item__label-wrap {
        margin-left: 0 !important;
    }
}

:deep(.el-form-item__content) {
    display: flex;
    align-items: center;
}
</style>
