import { useLocalStorage, useCloned } from '@vueuse/core'
import { computed, ref, watch } from "vue"
import { getLibAppKey } from '../../core/appKey.js'

// 生成当前页面级唯一的 storage key 前缀
const getStoragePrefix = () => {
    const appKey = getLibAppKey()
    const pagePath = window.location.pathname
    return `${appKey}${pagePath}`
}

// 缓存值
export function useQueryCache(props, model, isShowSuperSearchArea) {
    // 1. 计算不需要缓存的字段
    const ignoredKeys = computed(() => {
        const keys = new Set()
        const traverse = (items) => {
            items.forEach(item => {
                if (item.isCache === false) keys.add(item.prop)
                if (item.children) traverse(item.children)
            })
        }
        traverse(props.config)
        return keys
    })

    // 2. 初始值快照 (用于重置)
    const { cloned } = useCloned(model)
    const clonedValue = ref(cloned.value)

    const prefix = getStoragePrefix()

    // 3. 展开状态持久化
    const expandCache = useLocalStorage(prefix + '_expand', isShowSuperSearchArea.value)
    isShowSuperSearchArea.value = expandCache.value
    watch(isShowSuperSearchArea, (val) => {
        expandCache.value = val
    })

    // 4. 数据缓存持久化
    const cache = useLocalStorage(prefix + '_query_data', model)

    // 5. 初始化恢复
    if (cache?.value) {
        const filteredCache = { ...cache.value }
        ignoredKeys.value.forEach(key => delete filteredCache[key])
        Object.assign(model, filteredCache)
    }

    // 保存缓存
    const saveCache = (currentModel) => {
        const savedModel = { ...currentModel }
        ignoredKeys.value.forEach(key => delete savedModel[key])
        cache.value = savedModel
    }

    const resetCache = () => {
        if (clonedValue.value) {
            Object.assign(model, clonedValue.value)
        }
        cache.value = null
    }

    // 删除对应key的缓存
    const deleteCacheByKey = (key) => {
        if (cache?.value) {
            delete cache.value[key]
        }
    }

    return {
        saveCache,
        resetCache,
        deleteCacheByKey
    }
}

const getToggleableKeys = (props) => {
    return props.config.map(item => item.prop).filter(Boolean);
}

/**
 * 封装查询组件字段展示逻辑
 * visibleKeys ==> checkBox用
 * visibleConfig ==> 产生具体的搜索项目
 */
export function useQueryFields(props) {
    const allKeys = getToggleableKeys(props);
    const visibleKeys = ref([...allKeys])

    const prefix = getStoragePrefix()
    const fieldCache = useLocalStorage(prefix + '_query_fields', [...allKeys])
    visibleKeys.value = fieldCache.value
    watch(visibleKeys, (newVal) => {
        fieldCache.value = newVal
    }, { deep: true })

    const visibleConfig = computed(() => {
        const keySet = new Set(visibleKeys.value)
        return props.config.filter(item => !item.prop || keySet.has(item.prop))
    })

    const resetFields = () => {
        visibleKeys.value = [...allKeys]
    }

    return {
        visibleKeys,
        visibleConfig,
        resetFields
    }
}