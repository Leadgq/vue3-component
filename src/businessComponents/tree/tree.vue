<template>
    <div class="yo-tree-wrap" v-loading="loading">
        <div v-if="showSearch" class="yo-tree-search-wrap">
            <el-input v-model="filterText" :placeholder="searchPlaceholder" clearable v-if="showFilter">
                <template #prefix>
                    <el-icon>
                        <Search />
                    </el-icon>
                </template>
            </el-input>
            <div v-if="showActions" class="yo-tree-actions">
                <el-tooltip content="展开全部" placement="top">
                    <el-icon class="action-icon" @click="toggleExpandAll(true)">
                        <Expand />
                    </el-icon>
                </el-tooltip>
                <el-tooltip content="收起全部" placement="top">
                    <el-icon class="action-icon" @click="toggleExpandAll(false)">
                        <Fold />
                    </el-icon>
                </el-tooltip>
                <el-tooltip v-if="showCheckbox" content="全选" placement="top">
                    <el-icon class="action-icon" @click="checkAll(true)">
                        <Checked />
                    </el-icon>
                </el-tooltip>
                <el-tooltip v-if="showCheckbox" content="全不选" placement="top">
                    <el-icon class="action-icon" @click="checkAll(false)">
                        <Delete />
                    </el-icon>
                </el-tooltip>
                <el-tooltip content="刷新" placement="top">
                    <el-icon class="action-icon" @click="loadData">
                        <Refresh />
                    </el-icon>
                </el-tooltip>
            </div>
        </div>
        <div class="yo-tree-content" :style="{ maxHeight: scrollHeight }">
            <el-tree ref="treeRef" :data="displayData" :props="treeProps" :node-key="nodeKey"
                :show-checkbox="showCheckbox" :filter-node-method="filterNode" v-bind="treeAttrs" @check="handleCheck"
                @node-click="handleNodeClick">
                <template #default="{ node, data }">
                    <span class="yo-tree-node-content">
                        <slot name="prefix" :node="node" :data="data"></slot>
                        <span class="node-label"
                            :class="{ 'is-highlight': filterText && node.label.includes(filterText) }">
                            {{ node.label }}
                        </span>
                        <span class="node-actions">
                            <slot name="extra" :node="node" :data="data"></slot>
                        </span>
                    </span>
                </template>
                <template #empty>
                    <YoEmpty></YoEmpty>
                </template>
            </el-tree>
        </div>
    </div>
</template>

<script setup>
import {
    ElTree, ElInput, ElIcon, ElTooltip
} from "element-plus"
import {
    Search, Refresh, Expand, Fold, Checked, Delete
} from "@element-plus/icons-vue"
import {
    ref, computed, watch, onMounted, useAttrs, getCurrentInstance, defineExpose
} from "vue"
import { YoEmpty } from "../../components/empty"

const proxy = getCurrentInstance().proxy

defineOptions({ inheritAttrs: false })

const props = defineProps({
    // 数据源
    data: {
        type: Array,
        default: null
    },
    // 接口配置 (同 Table)
    api: {
        type: String,
        default: ''
    },
    method: {
        type: String,
        default: 'POST'
    },
    showFilter: {
        type: Boolean,
        default: false
    },
    queryParams: {
        type: Object,
        default: () => ({})
    },
    loading: {
        type: Boolean,
        default: false
    },
    // 树配置
    nodeKey: {
        type: String,
        default: 'id'
    },
    treeProps: {
        type: Object,
        default: () => ({
            label: 'label',
            children: 'children',
            disabled: 'disabled'
        })
    },
    // 功能开关
    showSearch: {
        type: Boolean,
        default: true
    },
    searchPlaceholder: {
        type: String,
        default: '输入关键字过滤'
    },
    showActions: {
        type: Boolean,
        default: false
    },
    showCheckbox: {
        type: Boolean,
        default: false
    },
    // 滚动高度
    scrollHeight: {
        type: String,
        default: 'auto'
    }
})

const emits = defineEmits(['node-click', 'check-change', 'data-loaded'])

const attrs = useAttrs()
const treeAttrs = computed(() => attrs)
const treeRef = ref(null)
const innerData = ref([])
const innerLoading = ref(false)
const filterText = ref('')
const checkedNodes = ref([])

// 最终显示的数据
const displayData = computed(() => props.data !== null ? props.data : innerData.value)
const loading = computed(() => props.loading || innerLoading.value)


const loadData = async () => {
    if (!props.api) return
    try {
        innerLoading.value = true
        const fetchOptions = {
            method: props.method.toUpperCase(),
            url: props.api,
            ...(props.method.toUpperCase() === 'GET' ? { params: props.queryParams } : { data: props.queryParams })
        }
        const res = await proxy.$http(fetchOptions)
        innerData.value = Array.isArray(res) ? res : (res?.Items || res?.data || [])
        emits('data-loaded', innerData.value)
    } catch (e) {
        console.error('YoTree load error:', e)
    } finally {
        innerLoading.value = false
    }
}

// ── Filter ──
watch(filterText, (val) => {
    treeRef.value?.filter(val)
})

const filterNode = (value, data) => {
    if (!value) return true
    const labelKey = props.treeProps.label || 'label'
    return data[labelKey]?.toLowerCase().includes(value.toLowerCase())
}

const toggleExpandAll = (expanded) => {
    const nodes = treeRef.value?.store.nodesMap
    for (const i in nodes) {
        nodes[i].expanded = expanded
    }
}

const checkAll = (checked) => {
    if (checked) {
        const allKeys = getAllKeys(displayData.value)
        treeRef.value?.setCheckedKeys(allKeys)
    } else {
        treeRef.value?.setCheckedKeys([])
    }
    updateCheckedNodes()
}

const getAllKeys = (data) => {
    let keys = []
    data.forEach(item => {
        keys.push(item[props.nodeKey])
        if (item[props.treeProps.children]) {
            keys = keys.concat(getAllKeys(item[props.treeProps.children]))
        }
    })
    return keys
}

const updateCheckedNodes = () => {
    checkedNodes.value = treeRef.value?.getCheckedNodes() || []
}

// ── Events ──
const handleCheck = (data, state) => {
    updateCheckedNodes()
    emits('check-change', { data, state, checkedNodes: checkedNodes.value })
}

const handleNodeClick = (data, node) => {
    emits('node-click', data, node)
}

onMounted(() => {
    if (props.api) loadData()
})

defineExpose({
    reload: loadData,
    getCheckedNodes: () => treeRef.value?.getCheckedNodes() ?? [],
    getCheckedKeys: () => treeRef.value?.getCheckedKeys() ?? [],
    setCheckedKeys: (keys) => treeRef.value?.setCheckedKeys(keys),
    filter: (text) => treeRef.value?.filter(text)
})
</script>

<style lang="scss" scoped>
.yo-tree-wrap {
    background: #fff;
    border-radius: 8px;
    padding: 16px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
    display: flex;
    flex-direction: column;
    gap: 12px;
    transition: all 0.3s ease;

    &:hover {
        box-shadow: 0 6px 16px rgba(0, 0, 0, 0.08);
    }

    .yo-tree-search-wrap {
        display: flex;
        align-items: center;
        gap: 12px;

        .el-input {
            flex: 1;

            :deep(.el-input__wrapper) {
                background-color: #f5f7fa;
                box-shadow: none !important;
                border: 1px solid transparent;
                transition: all 0.3s;
                border-radius: 6px;

                &.is-focus {
                    background-color: #fff;
                    border-color: var(--el-color-primary);
                }
            }
        }

        .yo-tree-actions {
            display: flex;
            align-items: center;
            gap: 8px;
            color: #909399;

            .action-icon {
                font-size: 18px;
                cursor: pointer;
                padding: 4px;
                border-radius: 4px;
                transition: all 0.2s;

                &:hover {
                    color: var(--el-color-primary);
                    background-color: #ecf5ff;
                }
            }
        }
    }

    .yo-tree-selection-summary {
        font-size: 13px;
        color: #606266;
        padding: 8px 12px;
        background: #f0f9eb;
        border-radius: 4px;
        border-left: 4px solid #67c23a;
        display: flex;
        justify-content: space-between;
        align-items: center;

        span {
            color: #67c23a;
            font-weight: bold;
            margin: 0 2px;
        }

        .clear-selection {
            color: #909399;
            cursor: pointer;
            font-weight: normal;
            font-size: 12px;

            &:hover {
                color: #f56c6c;
                text-decoration: underline;
            }
        }
    }

    .yo-tree-content {
        overflow-y: auto;
        padding-right: 4px;

        &::-webkit-scrollbar {
            width: 6px;
        }

        &::-webkit-scrollbar-thumb {
            background: #e4e7ed;
            border-radius: 3px;
        }

        &::-webkit-scrollbar-track {
            background: transparent;
        }

        :deep(.el-tree) {
            --el-tree-node-hover-bg-color: #f5f7fa;

            .el-tree-node__content {
                height: 38px;
                border-radius: 4px;
                margin: 2px 0;
                transition: padding 0.2s;

                &:hover {
                    .node-actions {
                        opacity: 1;
                    }
                }
            }

            .el-tree-node.is-current>.el-tree-node__content {
                background-color: #ecf5ff;
                color: var(--el-color-primary);
                font-weight: 600;
            }
        }
    }

    .yo-tree-node-content {
        flex: 1;
        display: flex;
        align-items: center;
        justify-content: space-between;
        font-size: 14px;
        color: #475166;
        padding-right: 8px;

        .node-label {
            flex: 1;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;

            &.is-highlight {
                color: var(--el-color-primary);
                background-color: #fff8e6;
                padding: 0 2px;
                border-radius: 2px;
            }
        }

        .node-actions {
            opacity: 0;
            transition: opacity 0.2s;
            display: flex;
            align-items: center;
            gap: 4px;
        }
    }
}
</style>
