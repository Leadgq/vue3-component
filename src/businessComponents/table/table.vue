<template>
    <div class="yo-table-wrap">
        <el-table ref="tableRef" :data="displayData" v-loading="loading" v-bind="tableAttrs" :row-key="rowKey"
            :span-method="resolvedSpanMethod">
            <template #empty>
                <YoEmpty></YoEmpty>
            </template>
            <slot name="prepend"></slot>
            <el-table-column v-if="showCheckbox" type="selection" :width="checkboxWidth" align="center"
                :reserve-selection="reserveSelection" />
            <TableColumn v-for="(column, idx) in visibleColumns" :key="column.prop || column.label || idx"
                :column="column" />
            <!-- 当所有列都被隐藏时，增加一个占位列撐起剩余空间 -->
            <el-table-column v-if="visibleColumns.length === columns.filter(isSettingColumn).length + 1"
                min-width="100" />
            <slot></slot>
        </el-table>
        <div class="yo-table-pagination" v-if="isShowPagination">
            <el-pagination v-model:current-page="innerPagination.pageNum" v-model:page-size="innerPagination.pageSize"
                :page-sizes="paginSize" :total="innerPagination.total" :layout="layout"
                @current-change="handlePageChange" @size-change="handleSizeChange" />
        </div>
    </div>
</template>

<script setup lang="jsx">
import { ElTable, ElPagination, ElTableColumn, ElPopover, ElCheckboxGroup, ElCheckbox, ElIcon } from "element-plus"
import { Setting, Refresh } from "@element-plus/icons-vue"
import { computed, h, onMounted, reactive, ref, useAttrs, useSlots, watch, getCurrentInstance, inject, nextTick } from "vue";
import { useLocalStorage } from "@vueuse/core";
import { vLoading } from "element-plus"
import { YoEmpty } from "../../components/empty";
import { renderCell } from './table.utils.js'
import { getLibAppKey } from '../../core/appKey.js'
const proxy = getCurrentInstance().proxy;
const yoGridContext = inject('yoGridContext', null)

defineOptions({ inheritAttrs: false })

const emits = defineEmits(["page-change", "size-change", "column-change"])

const attrs = useAttrs()
const outerSlots = useSlots()
const props = defineProps({
    loading: {
        type: Boolean,
        default: false
    },
    // ── 外部数据模式（由 grid 传入）──
    // 外部传入的表格数据（优先使用）
    tableData: {
        type: Array,
        default: null
    },
    // 外部传入的分页信息（优先使用）
    pagination: {
        type: Object,
        default: null
    },
    layout: {
        type: String,
        default: 'total, prev, pager, next, sizes, jumper'
    },
    // ── 独立使用模式（自己请求）──
    api: {
        type: String,
        required: false
    },
    method: {
        type: String,
        default: 'POST'
    },
    queryParams: {
        type: Object,
        default: () => ({})
    },

    // ── 公共配置 ──
    columns: {
        type: Array,
        default: () => []
    },
    isShowPagination: {
        type: Boolean,
        default: true
    },
    paginationOptions: {
        type: Object,
        default: () => ({
            pageNum: 1,
            pageSize: 10,
            total: 0
        })
    },
    pageSizesOption: {
        type: Array,
        default: [10, 20, 50, 100]
    },
    // 序号宽度
    noWidth: {
        type: Number,
        required: false,
        default: 100
    },
    checkboxWidth: {
        type: Number,
        required: false,
        default: 50
    },
    // 是否显示多选框
    showCheckbox: {
        type: Boolean,
        default: false
    },
    // 是否显示列设置
    showSetting: {
        type: Boolean,
        default: false
    },
    // 行数据的 Key，跨页选中必须设置
    rowKey: {
        type: String,
        default: 'id'
    },
    // 是否跨页保留选中状态
    reserveSelection: {
        type: Boolean,
        default: false
    },
    // 列设置：指定哪些列出现在 checkbox 里（可控制显隐的列）
    // 不传则所有非固定列都可控
    settingColumns: {
        type: Array,
        default: null
    },
    // ── 行合并 ──
    // 自动合并：指定列名数组，相邻行 rowKey 相同时合并这些列
    mergeBy: {
        type: Array,
        default: null
    },
    // 手动合并：自定义 span-method，优先级高于 mergeBy
    spanMethod: {
        type: Function,
        default: null
    },
    // 是否是 Tabs 模式
    isTabs: {
        type: Boolean,
        default: false
    },
    // Tabs 模式下的唯一标识 Key
    tabsKey: {
        type: String,
        default: ''
    },
    // 额外静态参数
    staticParams: {
        type: Object,
        default: () => ({})
    }
})


const tableAttrs = computed(() => attrs)

// 需要从列配置中剔除的自定义字段，避免透传给 el-table-column 产生警告
const STRIP_KEYS = ['render', 'dateFormat', 'format', 'isSlot', 'children']


const makeColProps = (col) => {
    const result = { ...col }
    STRIP_KEYS.forEach(k => delete result[k])
    return result
}

const TableColumn = (colProps) => {
    const col = colProps.column

    // 分组列：递归渲染子列
    if (col.children?.length) {
        const groupSlots = {
            default: () => col.children.map((child, idx) =>
                h(TableColumn, { key: child.prop || child.label || idx, column: child })
            )
        }
        return h(ElTableColumn, { label: col.label, ...makeColProps(col) }, groupSlots)
    }

    const colSlots = {}

    // ── default slot ──
    if (col.render) {
        colSlots.default = (scope) => col.render(scope.row, scope.$index)
    } else if (col.format || ["multKey", "moneymultKey", "date"].includes(col.type)) {
        colSlots.default = (scope) => renderCell(scope.row, col, scope.$index)
    } else if (col.isSlot) {
        const slotName = col.prop || (col.type === 'expand' ? 'expand' : null)
        if (slotName) colSlots.default = (scope) => outerSlots[slotName]?.({ data: scope.row, index: scope.$index })
    }

    // ── header slot：独立判断，与 default slot 互不影响 ──
    if (props.showSetting && isSettingColumn(col)) {
        colSlots.header = (scope) => (
            <div
                class={['flex align-center pointer header-setting-wrap',
                    col.align === 'right' ? 'flex-end' : col.align === 'center' ? 'justify-center' : '']}
            >
                <span>{scope.column.label}</span>
                {col.type !== 'expand' && (
                    <ElPopover placement="bottom-end" width={200} trigger="click" popper-class="yo-table-setting-popover" persistent={false}>
                        {{
                            reference: () => (
                                <ElIcon class="setting-icon cursor-pointer" size={16} onClick={(e) => e.stopPropagation()}>
                                    <Setting />
                                </ElIcon>
                            ),
                            default: () => (
                                <div class="setting-content">
                                    <div class="flex align-center setting-title">
                                        <span class="tips">选择列中要展示的信息</span>
                                        <ElIcon class="pointer cursor-pointer" style="margin-left: 8px;" onClick={resetColumns} title="重置列">
                                            <Refresh />
                                        </ElIcon>
                                    </div>
                                    <div class="setting-list">
                                        <ElCheckboxGroup v-model={visibleKeys.value}>
                                            {settingColsList.value.map(item => (
                                                <div key={item.prop || item.label} class="setting-item">
                                                    <ElCheckbox label={item.prop || item.label}>
                                                        {item.label}
                                                    </ElCheckbox>
                                                </div>
                                            ))}
                                        </ElCheckboxGroup>
                                    </div>
                                </div>
                            )
                        }}
                    </ElPopover>
                )}
            </div>
        )
    }

    return h(ElTableColumn, makeColProps(col), colSlots)
}


/**
 * 判断是否为需要放置设置图标的列 (通常是操作列或最后一列)
 */
const isSettingColumn = (col) => {
    if (!col) return false
    const label = (col.label || '').trim()
    return col.fixed === 'right' || label === '操作' || col.prop === 'op' || col.showSetting === true || col.type === 'expand'
}

/**
 * 列显示/隐藏逻辑封装
 */
function useTableColumns(props, emit) {

    const visibleKeys = ref([])

    const visibleColumns = computed(() => {
        // 创建副本，避免直接修改 props.columns 导致死循环
        let cols = [...props.columns]

        // 如果开启了列设置，则根据 visibleKeys 过滤显示的列
        if (props.showSetting && visibleKeys.value.length > 0) {
            cols = cols.filter(col => {
                // 固定列、操作列、expand列等始终显示
                if (isSettingColumn(col)) return true
                // 只有在已选 keys 中的才显示
                const key = col.prop || col.label
                return visibleKeys.value.includes(key)
            })
        }

        // 注入序号列
        if (cols.length > 0) {
            const hasIndex = cols.some(c => c.type === 'index' || c.prop === '__index')
            if (!hasIndex) {
                const indexCol = { type: 'index', label: '序号', width: props.noWidth, align: 'center', prop: '__index', fixed: 'left' }
                const expandIdx = cols.findIndex(c => c.type === 'expand')
                if (expandIdx !== -1) {
                    cols.splice(expandIdx + 1, 0, indexCol)
                } else {
                    cols.unshift(indexCol)
                }
            }
        }
        return cols
    })

    // 将外界配置的拿出来
    const settingColsList = computed(() => {
        if (props.settingColumns && props.settingColumns.length > 0) {
            const keySet = new Set(props.settingColumns)
            return props.columns.filter(col => keySet.has(col.prop || col.label) && !isSettingColumn(col))
        }

        return props.columns.filter(col => !isSettingColumn(col))
    })

    const isReset = ref(false)


    // 可控列的全部 key
    const allKeys = computed(() => settingColsList.value.map(c => c.prop || c.label).filter(Boolean))

    // 只有外界需要缓存的时候checkBox才进行缓存
    if (props.showSetting) {
        const appKey = getLibAppKey()
        const pagePath = window.location.pathname
        const storageKey = `${appKey}${pagePath}${props.isTabs ? '_' + props.tabsKey : ''}_checkbox`
        const columnCache = useLocalStorage(storageKey, allKeys.value)
        const isFirstLoadCacheKey = `${appKey}${pagePath}${props.isTabs ? '_' + props.tabsKey : ''}_first_load`
        const isFirstLoadCache = useLocalStorage(isFirstLoadCacheKey, true)
        if (isFirstLoadCache.value) {
            visibleKeys.value = [...allKeys.value]
            isFirstLoadCache.value = false
        } else {
            visibleKeys.value = columnCache.value
        }
        watch(visibleKeys, (newVal, oldVal) => {
            columnCache.value = newVal
            if (isReset.value) {
                return
            }
            // 只在勾选（新增）时触发，取消勾选不 emit
            const added = newVal.find(k => !oldVal.includes(k))
            if (!added) return
            const changedCol = props.columns.find(col => (col.prop || col.label) === added)
            emit('column-change', added, changedCol)
        }, { deep: true })
    }

    const resetColumns = () => {
        isReset.value = true
        visibleKeys.value = [...allKeys.value]
        emit('column-change', visibleKeys.value)
        nextTick(() => {
            isReset.value = false
        })
    }

    return {
        settingColsList,
        visibleKeys,
        visibleColumns,
        resetColumns
    }
}

const { settingColsList, visibleKeys, visibleColumns, resetColumns } = useTableColumns(props, emits)

TableColumn.props = ['column']

/**
 * 根据 mergeBy + rowKey 预计算每个单元格的 rowspan
 * 返回 Map<colProp, number[]>，index 对应行的 rowspan 值
 */
function computeMergeSpans(data, mergeBy, rowKey) {
    const spanMap = {}
    for (const col of mergeBy) {
        const spans = new Array(data.length).fill(1)
        let i = 0
        while (i < data.length) {
            let j = i + 1
            // 以 rowKey 值相同为合并条件
            while (j < data.length && data[j][rowKey] === data[i][rowKey]) {
                spans[j] = 0
                j++
            }
            spans[i] = j - i;
            i = j
        }
        spanMap[col] = spans
    }
    return spanMap
}

// 最终传给 el-table 的 span-method
const resolvedSpanMethod = computed(() => {
    // 手动模式优先
    if (props.spanMethod) return props.spanMethod

    // 自动模式
    if (props.mergeBy && props.mergeBy.length > 0) {
        const mergeSet = new Set(props.mergeBy)
        return ({ row, column, rowIndex }) => {
            const prop = column.property
            if (!mergeSet.has(prop)) return [1, 1]
            const spans = mergeSpans.value
            const rowspan = spans[prop]?.[rowIndex] ?? 1
            return [rowspan, rowspan === 0 ? 0 : 1]
        }
    }

    return undefined
})

// 预计算 span 数据，displayData 变化时重新计算
const mergeSpans = computed(() => {
    if (!props.mergeBy || props.mergeBy.length === 0) return {}
    return computeMergeSpans(displayData.value ?? [], props.mergeBy, props.rowKey)
})

const isExternalMode = computed(() => props.tableData !== null)
const innerTableData = ref([])
const innerLoading = ref(false)
const loading = computed(() => props.loading || innerLoading.value);

// 外界传来和自己请求回来的
const displayData = computed(() => isExternalMode.value ? props.tableData : innerTableData.value)

const selfPagination = reactive({ pageNum: 1, pageSize: 10, total: 0 })
let paginSize = reactive([])

const innerPagination = computed(() => {
    if (isExternalMode.value && props.pagination) return props.pagination
    return selfPagination
})

const getTableData = async () => {
    let res = null
    const params = {
        ...props.queryParams,
        ...props.staticParams,
        ...(props.isShowPagination ? { PageIndex: selfPagination.pageNum, PageSize: selfPagination.pageSize } : {})
    }
    if (props.api) {
        const fetchOptions = {
            method: (props.method || 'POST').toUpperCase(),
            url: props.api,
            ...(props.method.toUpperCase() === 'GET' ? { params } : { data: params })
        }
        try {
            res = await proxy.$http(fetchOptions)
        } catch (error) {
            console.error('Table API fetch error:', error)
            return null
        }
    } else {
        console.warn('YoTable: No `api` provided for standalone mode.')
        return null
    }
    return res
}

// 是否是对象
const isObject = (v) => {
    return typeof v === 'object' && v !== null
}
const setTableData = (res) => {
    if (isObject(res)) {
        innerTableData.value = res?.Items ?? []
        selfPagination.total = res?.TotalCount ?? 0
    } else if (Array.isArray(res)) {
        innerTableData.value = res ?? []
        if (props.isShowPagination) {
            selfPagination.total = res?.length ?? 0
        }
    }
}

const loadData = async () => {
    if (isExternalMode.value) return
    try {
        innerLoading.value = true
        const res = await getTableData()
        setTableData(res)
    } catch (error) {
        console.error(error)
    } finally {
        innerLoading.value = false
    }
}

// ── 分页事件处理 ──
const handlePageChange = (page) => {
    if (isExternalMode.value) {
        emits('page-change', { ...innerPagination.value, pageNum: page })
    } else {
        selfPagination.pageNum = page
        loadData()
    }
}

const handleSizeChange = (size) => {
    if (isExternalMode.value) {
        emits('size-change', { ...innerPagination.value, pageSize: size, pageNum: 1 })
    } else {
        selfPagination.pageSize = size
        selfPagination.pageNum = 1
        loadData()
    }
}

const reload = () => {
    if (isExternalMode.value) {
        return
    }
    selfPagination.pageNum = 1
    selfPagination.pageSize = props.paginationOptions.pageSize
    loadData()
}

watch(() => props.queryParams, () => {
    if (!isExternalMode.value) {
        selfPagination.pageNum = 1
        loadData()
    }
}, { deep: true })


onMounted(() => {
    if (props.isShowPagination) {
        Object.assign(selfPagination, props.paginationOptions)
        paginSize = props.pageSizesOption
    }
    // 你不传tableData 并且还是使用默认插槽配出来
    if (!isExternalMode.value && !yoGridContext?.isInsideGrid) {
        loadData()
    }
    // 如果不是在grid组件内部，而是在外界自己配置的api
    if (!yoGridContext?.isInsideGrid && props.api) {
        loadData()
    }
})

const tableRef = ref(null)

defineExpose({
    reload,
    loadData,
    getSelection: () => tableRef.value?.getSelectionRows() ?? []
})
</script>

<style lang="scss">
.yo-table-wrap {
    width: 100%;
    background-color: #fff;

    .el-table {
        --el-table-text-color: #475166;
    }
}

.yo-table-pagination {
    margin-top: 16px;
    display: flex;
    justify-content: flex-end;
    padding-bottom: 20px;
    padding-right: 20px;

    .yo-table-pagination {
        background-color: #fff;
    }
}

.header-setting-wrap {
    width: 100%;
    color: #333;

    .setting-icon {
        color: #9A9A9A;
        transition: color 0.3s;
        margin-left: 15px;
        display: block;
        flex-shrink: 0;

        &:hover {
            color: var(--primary-color) !important;
        }
    }
}
</style>

<style lang="scss">
.yo-table-setting-popover {
    padding: 12px 0 !important;


    .setting-content {
        .tips {
            color: #BDC1CC;
        }

        .pointer {
            color: #BDC1CC;
        }

        .setting-title {
            padding: 0 16px 8px 16px;
            border-bottom: 1px solid #ebeef5;
            margin-bottom: 8px;
        }

        .setting-list {
            max-height: 250px;
            overflow-y: auto;
            padding: 0 16px;

            .setting-item {
                padding: 4px 0;
            }
        }
    }
}
</style>