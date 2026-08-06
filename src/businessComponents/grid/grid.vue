    <template>
        <div class="yo-grid">
            <YoQuery ref="queryRef" :class="{ 'query-info': tabsProps.prop && tabsProps.config.length > 0 }"
                v-bind="queryProps" v-model:is-show-super-search-area="isShowSuperSearchArea" :model="query.model"
                :config="query.config" @search="handleSearch" @reload="handleReload" @quick-search="handleQuickSearch"
                :quick-search-key="queryProps.quickSearchKey" :showSetting="queryProps.showSetting">
                <template v-for="(_, name) in querySlots" #[name]="slotData">
                    <slot :name="name" v-bind="slotData"></slot>
                </template>
            </YoQuery>
            <div class="layout-container">
                <div class="yo-grid-toolbar" v-if="slots.toolbar">
                    <slot name="toolbar"></slot>
                </div>
                <div class="yo-grid-tabs" v-if="tabsProps.prop && tabsProps.config.length > 0">
                    <ElTabs v-model="activeTab" @tab-change="handleTabChange">
                        <ElTabPane v-for="item in tabsProps.config" :key="item.value" :label="item.label"
                            :name="item.value" />
                    </ElTabs>
                </div>
                <YoTable ref="tableRef" v-bind="tableProps" :table-data="tableData" :pagination="pagination"
                    :loading="loading" :showSetting="tableProps.showSetting" :key="activeTab"
                    @column-change="handleColumnChange" @page-change="handlePageChange" @size-change="handleSizeChange"
                    v-if="!hasDefaultSlot">
                    <template v-for="(_, name) in tableSlots" #[name]="slotData">
                        <slot :name="name" v-bind="slotData"></slot>
                    </template>
                </YoTable>
                <slot v-else></slot>
            </div>
        </div>
    </template>

<script setup lang="jsx">
import { ref, reactive, computed, useSlots, getCurrentInstance, watch, nextTick, provide } from "vue"
import { useLocalStorage } from "@vueuse/core"
import { YoQuery } from "../query"
import { YoTable } from "../table"
import { ElTabs, ElTabPane } from "element-plus"
import { getPageStoragePrefix } from '../../core/appKey.js'

const emit = defineEmits(["column-change", "search", "reload", "quick-search", "page-change", "size-change", "tabs-change"])
provide('yoGridContext', { isInsideGrid: true })

const props = defineProps({
    // Grouped Query Props
    query: {
        type: Object,
        default: () => ({})
    },

    // Grouped Table Props
    table: {
        type: Object,
        default: () => ({})
    },
    tabs: {
        type: Object,
        default: () => ({})
    },
    // 额外的静态参数
    staticParams: {
        type: Object,
        default: () => ({})
    },
    // 可指定表格请求地址
    api: {
        type: String,
        required: false,
    },
    // 默认方法
    method: {
        type: String,
        default: 'POST',
    },
    // 是否缓存
    isCache: {
        type: Boolean,
        default: true
    },
})

const queryRef = ref(null)
const tableRef = ref(null)
const slots = useSlots()
const { proxy } = getCurrentInstance()
const hasDefaultSlot = computed(() => {
    if (!slots.default) return false
    return slots.default().some(vnode => {
        const typeStr = vnode.type?.toString()
        if (typeStr === 'Symbol(Comment)' || typeStr === 'Symbol(v-cmt)' || vnode.type === 'comment') return false
        if (vnode.type === Text && typeof vnode.children === 'string' && !vnode.children.trim()) return false
        return true
    })
})
const isShowSuperSearchArea = defineModel('isShowSuperSearchArea', { default: false })

const queryProps = computed(() => {
    return {
        // Fallbacks
        quickSearchKey: "name",
        cols: 3,
        labelWidth: "100px",
        labelPosition: "left",
        labelGap: "12px",
        xGap: "41px",
        yGap: "30px",
        showSetting: false,
        isCache: props.isCache,
        btnPostion: 'end',
        ...props.query
    }
})

const tabsProps = computed(() => {
    const { config = [], prop, ...rest } = props.tabs || {}
    return {
        config,
        prop,
        ...rest
    }
})


const activeTab = ref("")

if (tabsProps.value.prop) {
    const tabCache = useLocalStorage(`${getPageStoragePrefix()}_active_tab`, tabsProps.value.default || tabsProps.value.config[0]?.value || "")
    activeTab.value = tabCache.value
    watch(activeTab, (newVal) => {
        emit("tabs-change", newVal)
        tabCache.value = newVal
    }, { immediate: true, flush: 'post' })
} else {
    activeTab.value = tabsProps.value.default || tabsProps.value.config[0]?.value || ""
}

const handleTabChange = async () => {
    await nextTick()
    pagination.pageNum = 1
    fetchData()
}

// 当前激活的tab配置
const currentTabConfig = computed(() =>
    tabsProps.value.config.find(item => item.value === activeTab.value) || {}
)

// ── grid 自己管理的分页状态 ──
const pagination = reactive({
    pageNum: 1,
    pageSize: 10,
    total: 0
})

const tableData = ref([])
const loading = ref(false)

const tableProps = computed(() => {

    const { api, method, columns, pageSize, pageSizesOption, ...baseRest } = props.table || {}

    const { label, value, api: tabApi, columns: tabColumns, ...tabOverrides } = currentTabConfig.value

    const finalColumns = tabColumns || columns || []

    return {
        isShowPagination: true,
        pageSizesOption: pageSizesOption || [10, 20, 50, 100],
        showCheckbox: false,
        showSetting: false,
        autoLoad: false,
        isCache: props.isCache,
        ...baseRest,
        ...tabOverrides,
        columns: finalColumns,
        isTabs: !!tabsProps.value.prop,
        tabsKey: activeTab.value
    }
})


const querySlots = computed(() => {
    const config = props.query?.config || []
    const queryPropKeys = new Set()
    config.forEach(item => {
        if (item.isSlot) queryPropKeys.add(item.prop)
        if (item.children) {
            item.children.forEach(child => {
                if (child.isSlot) queryPropKeys.add(child.prop)
            })
        }
    })
    const result = {}
    Object.keys(slots).forEach(key => {
        if (queryPropKeys.has(key)) result[key] = slots[key]
    })
    return result
})

const tableSlots = computed(() => {
    const tablePropKeys = new Set()

    const baseColumns = props.table?.columns || []
    baseColumns.forEach(item => {
        if (item.isSlot) {
            const slotName = item.prop || (item.type === 'expand' ? 'expand' : null)
            if (slotName) tablePropKeys.add(slotName)
        }
    })

    const tabsConfig = props.tabs?.config || []
    tabsConfig.forEach(tab => {
        const tabColumns = tab.columns || []
        tabColumns.forEach(item => {
            if (item.isSlot) {
                const slotName = item.prop || (item.type === 'expand' ? 'expand' : null)
                if (slotName) tablePropKeys.add(slotName)
            }
        })
    })
    const result = {}
    Object.keys(slots).forEach(key => {
        if (tablePropKeys.has(key)) result[key] = slots[key]
    })
    return result
})

// 当前生效的搜索参数 (用于过滤隐藏字段)
const currentSearchParams = ref({})

// ── 请求数据 ──
const fetchData = async () => {
    if (hasDefaultSlot.value) {
        return;
    }
    const api = currentTabConfig.value.api || props.table.api || props.api
    const method = currentTabConfig.value.method || props.table.method || props.method || 'POST'
    if (!api) {
        throw new Error('Grid API is not defined')
    }
    loading.value = true
    const paginParams = tableProps.value.isShowPagination
        ? { PageIndex: pagination.pageNum, PageSize: pagination.pageSize }
        : {}

    const finalParams = {
        ...paginParams,
        ...currentSearchParams.value,
        ...props.staticParams,
        ...(tabsProps.value.prop ? { [tabsProps.value.prop]: activeTab.value } : {})
    }

    let res = null
    try {
        const fetchOptions = {
            method,
            url: api,
            ...(method === 'GET' ? { params: finalParams } : { data: finalParams })
        }
        res = await proxy.$http(fetchOptions)
    } catch (error) {
        console.error('Grid API fetch error:', error)
    } finally {
        loading.value = false
    }

    if (res) {
        if (Array.isArray(res)) {
            tableData.value = res
            pagination.total = res.length
        } else {
            tableData.value = res?.Items ?? []
            pagination.total = res?.TotalCount ?? 0
        }
    } else {
        tableData.value = []
        pagination.total = 0
    }
}

// ── 分页事件（来自 table emit）──
const handlePageChange = (paginInfo) => {
    pagination.pageNum = paginInfo.pageNum
    fetchData()
    emit("page-change", paginInfo)
}

const handleSizeChange = (paginInfo) => {
    pagination.pageSize = paginInfo.pageSize
    pagination.pageNum = 1
    fetchData()
    emit("size-change", paginInfo)
}

// ── 搜索事件 ──
const handleSearch = (filteredModel) => {
    currentSearchParams.value = filteredModel
    pagination.pageNum = 1
    fetchData()
    emit('search', filteredModel)
}

const handleReload = () => {
    currentSearchParams.value = {}
    pagination.pageNum = 1
    fetchData()
    const params = { ...currentSearchParams.value }
    emit('reload', params)
}

const handleQuickSearch = (filteredModel) => {
    currentSearchParams.value = filteredModel
    pagination.pageNum = 1
    fetchData()
    emit('quick-search', filteredModel)
}

const handleColumnChange = (newVal, visibleCols) => {
    emit("column-change", newVal, visibleCols)
}
defineExpose({
    reload: () => {
        pagination.pageNum = 1
        fetchData()
    },
    getSelection: () => tableRef.value?.getSelection(),
    deleteCacheByKey: (key) => queryRef.value?.deleteCacheByKey(key),
    queryRef,
    tableRef
})
</script>

<style scoped lang="scss">
.yo-grid {
    display: flex;
    flex-direction: column;
    width: 100%;
    background-color: #fff;

    .query-info {
        margin-bottom: 0;
        padding-bottom: 0;
    }
}

.layout-container {
    padding-left: 20px;
    padding-right: 20px;
}

.yo-grid-toolbar {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    margin-bottom: 12px;
}

.yo-grid-tabs {
    margin-bottom: 20px;

    :deep(.ep-tabs__nav-wrap) {
        &:after {
            height: 1px;
        }
    }
}

:deep(.ep-tabs__header) {
    margin-bottom: 0;
}
</style>