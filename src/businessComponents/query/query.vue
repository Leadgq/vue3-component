<template>
    <div class="yo-query" :style="gridStyle">
        <YoTitle v-if="title" :content="title" class="yo-query__title"></YoTitle>
        <div class="yo-query__search plus-flex flex-end align-center" :class="{ 'is-active': isShowSuperSearchArea }">
            <YoSearch v-model="model[quickSearchKey]" :width="'386px'" :placeholder="t('query.quickSearch')" v-if="!isShowSuperSearchArea"
                @search="quickSearch"></YoSearch>
            <YoSearch :isSearchModel="false" :direction="isShowSuperSearchArea ? 'up' : 'down'" :button-type="'default'"
                class="yo-query__advanced" @advancedSearch="advancedSearch">
                {{ isShowSuperSearchArea ? t('query.collapse') : t('search.advanced') }}
            </YoSearch>

            <!-- 字段设置 (仅在高级搜索模式下显示) -->
            <el-popover placement="bottom-end" :width="210" trigger="click" popper-class="yo-setting-popover"
                v-if="showSetting && isShowSuperSearchArea" :persistent="false">
                <template #reference>
                    <el-icon class="yo-query__setting-icon cursor-pointer">
                        <Menu />
                    </el-icon>
                </template>
                <div class="yo-setting-popover__content">
                    <div class="yo-setting-popover__title plus-flex align-center">
                        <span class="yo-setting-popover__tips">{{ t('query.fieldSetting') }}</span>
                        <el-icon class="yo-setting-popover__reset cursor-pointer" style="margin-left: 8px;" @click="resetFields"
                            :title="t('query.resetFields')">
                            <Refresh />
                        </el-icon>
                    </div>
                    <div class="yo-setting-popover__list">
                        <el-checkbox-group v-model="visibleKeys">
                            <div v-for="item in config" :key="item.prop" class="yo-setting-popover__item">
                                <el-checkbox :label="item.prop">
                                    {{ item.label }}
                                </el-checkbox>
                            </div>
                        </el-checkbox-group>
                    </div>
                </div>
            </el-popover>
        </div>
        <el-form v-bind="formAttrs" :model="model" class="yo-query__form" v-if="isShowSuperSearchArea">
            <template v-for="item in visibleConfig" :key="item.prop">
                <el-form-item v-bind="item.formItemProps || {}" :label="item.label" :prop="item.prop"
                    :label-width="item.labelWidth" :style="{
                        gridColumn: `span ${item.span || 1}`,
                        '--query-label-gap': item.space ? (typeof item.space === 'number' ? `${item.space}px` : item.space) : '12px'
                    }" class="plus-flex align-center">
                    <!-- 1. 插槽支持 (最高优先级) -->
                    <slot v-if="item.isSlot" :name="item.prop" :item="item" :model="model"></slot>
                    <!-- 2.嵌套渲染 -->
                    <div v-else-if="item.children" class="yo-query__composite">
                        <template v-for="child in item.children" :key="child.prop">
                            <!-- 在嵌套模型下使用自定义 -->
                            <slot v-if="child.isSlot" :name="child.prop" :item="child" :model="model"></slot>
                            <!-- 在嵌套模型下使用自定义 -->
                            <RenderCell v-else-if="child.render" :render="child.render" :model="model" :item="child"
                                :style="[child.style || { flex: 1 }, child.props?.width ? { width: child.props.width, flex: 'none' } : {}]" />
                            <!-- 在嵌套模型下使用组件 -->
                            <FieldItem v-else :model="model" :item="child" />
                        </template>
                    </div>
                    <!-- render模式 -->
                    <RenderCell v-else-if="item.render" :render="item.render" :model="model" :item="item" />
                    <!-- 其他模式 -->
                    <FieldItem v-else :model="model" :item="item" />
                </el-form-item>
            </template>
        </el-form>

        <!-- 确认和重置 -->
        <div class="yo-query__footer plus-flex align-center" :class="{
            'flex-end': btnPostion === 'end',
            'flex-start': btnPostion === 'start',
            'justify-center': btnPostion === 'center'
        }" v-if="isShowSuperSearchArea">
            <yo-button type="primary" @click="reload">{{ t('common.reset') }}</yo-button>
            <yo-button type="default" @click="search">{{ t('common.search') }}</yo-button>
        </div>
    </div>
</template>

<script setup lang="jsx">
import { computed, useAttrs, onMounted, nextTick } from 'vue'
import {
    ElForm,
    ElFormItem,
    ElIcon,
    ElCheckbox,
    ElPopover,
    ElCheckboxGroup
} from 'element-plus'
import YoSearch from "../../components/search/search.vue"
import YoButton from "../../components/button/button.vue"
import { YoTitle } from "../title"
import { Menu, Refresh } from "@element-plus/icons-vue"
import { useQueryCache, useQueryFields } from './queryCacheUtil'
import { RenderCell, FieldItem } from "../form/formRenderer"
import { t } from '../../core/i18n'

const props = defineProps({
    title: {
        type: String,
        default: ''
    },
    quickSearchKey: {
        type: String,
        default: 'name'
    },
    config: {
        type: Array,
        required: true,
        default: () => []
    },
    model: {
        type: Object,
        required: true
    },
    cols: {
        type: Number,
        default: 3
    },
    labelWidth: {
        type: [String, Number],
        default: '100px'
    },
    labelGap: {
        type: [String, Number],
        default: '12px'
    },
    // x轴间距
    xGap: {
        type: [String, Number],
        default: '41px'
    },
    // y轴间距
    yGap: {
        type: [String, Number],
        default: '30px'
    },
    // 是否显示字段配置设置
    showSetting: {
        type: Boolean,
        default: false
    },
    // 搜索按钮位置
    btnPostion: {
        type: String,
        default: 'end' // start|center|right
    },
    // label 位置
    labelPosition: {
        type: String,
        default: 'left'
    },
    // 是否缓存查询条件 / 展开状态 / 字段显隐
    isCache: {
        type: Boolean,
        default: true
    }
})

const isShowSuperSearchArea = defineModel('isShowSuperSearchArea', { default: false })
// 缓存相关
const { saveCache, resetCache, deleteCacheByKey } = useQueryCache(props, props.model, isShowSuperSearchArea)
// 字段相关
const { visibleKeys, visibleConfig, resetFields } = useQueryFields(props)


// 在高级搜索
const handlerShowSuperSearch = () => {
    const activePropSet = new Set()
    let result = {};
    const collectProps = (items) => {
        items.forEach(item => {
            if (item.prop) activePropSet.add(item.prop)
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


const getFilteredModel = () => {
    return isShowSuperSearchArea.value ? handlerShowSuperSearch() : { [props.quickSearchKey]: props.model[props.quickSearchKey] }
}

const advancedSearch = () => {
    isShowSuperSearchArea.value = !isShowSuperSearchArea.value
}

const gridStyle = computed(() => ({
    '--query-cols': props.cols,
    '--query-label-gap': typeof props.labelGap === 'number' ? `${props.labelGap}px` : props.labelGap,
    '--query-x-gap': typeof props.xGap === 'number' ? `${props.xGap}px` : props.xGap,
    '--query-y-gap': typeof props.yGap === 'number' ? `${props.yGap}px` : props.yGap,
}))

const attrs = useAttrs()
const formAttrs = computed(() => ({
    labelWidth: props.labelWidth,
    labelPosition: props.labelPosition,
    ...attrs
}))

const emit = defineEmits(['change', 'reload', 'search', 'quickSearch'])
function search() {
    saveCache(props.model)
    emit('search', getFilteredModel())
}
function reload() {
    resetCache()
    emit('reload', props.model)
}
function quickSearch() {
    const val = props.model[props.quickSearchKey]
    const filteredModel = { [props.quickSearchKey]: val }
    saveCache(filteredModel)
    emit('quickSearch', filteredModel)
}

onMounted(async () => {
    await nextTick();
    // 初始化时通知外部当前生效的过滤参数
    emit('search', getFilteredModel())
})


// 组件提供移除特定key的方法
defineExpose({
    deleteCacheByKey
})
</script>

<style scoped lang="scss">
$space: 20px;

.yo-query {
    background-color: #fff;
    box-sizing: border-box;
    padding: $space;
    margin-bottom: $space;

    .yo-query__title {
        margin-bottom: 17px;
    }

    .yo-query__search {
        &.is-active {
            margin-bottom: 24px;
        }
    }

    .yo-query__advanced {
        margin-left: $space;
    }

    .yo-query__setting-icon {
        margin-left: 15px;
        color: #9a9a9a;
        font-size: 26px;
        display: block;

        &:hover {
            color: var(--primary-color);
        }
    }

    .yo-query__footer {
        margin-top: $space;
    }
}

.yo-query__form {
    display: grid;
    grid-template-columns: repeat(var(--query-cols), 1fr);
    gap: var(--query-y-gap) var(--query-x-gap);
    padding-left: 11px;
    padding-right: 11px;
    box-sizing: border-box;
}

.yo-query__composite {
    display: flex;
    gap: 8px;
    width: 100%;
}

:deep(.ep-form-item) {
    margin-bottom: 0px !important;
    margin-right: 0px !important;

    .ep-form-item__label {
        padding-right: var(--query-label-gap) !important;
        color: #6a7998;
    }

    .ep-form-item__label-wrap {
        margin-left: 0 !important;
    }
}

:deep(.ep-form-item__content) {
    display: flex;
    align-items: center;
}
</style>
