<template>
    <div v-if="isSearchModel" class="search-input-plus" :style="{ width: width }">
        <YoInput v-model="searchValue" :placeholder="placeholder" v-bind="attrs" :type="type">
            <template #prefix>
                <el-icon>
                    <Search />
                </el-icon>
            </template>
            <template #suffix>
                <YoButton :type="buttonType" @click="handleSearch" v-bind="attrs">
                    <template v-if="slots.default">
                        <slot name="default" />
                    </template>
                    <template v-else>
                        搜索
                    </template>
                </YoButton>
            </template>
        </YoInput>
    </div>
    <template v-else>
        <YoButton :type="buttonType" v-bind="attrs" @click="handleAdvancedSearch">
            <template v-if="slots.default">
                <slot name="default" />
            </template>
            <template v-else>
                高级搜索
            </template>
            <el-icon class="ep-icon--right">
                <ArrowDown v-if="direction === 'down'" />
                <ArrowUp v-else />
            </el-icon>
        </YoButton>
    </template>
</template>

<script setup>
import { useAttrs, useSlots } from "vue"
import { Search, ArrowDown, ArrowUp } from "@element-plus/icons-vue"
import { ElIcon } from "element-plus"
import { YoInput } from "../input"
import { YoButton } from "../button"
const attrs = useAttrs()
const slots = useSlots()
const searchValue = defineModel()
const emit = defineEmits(["search", "advancedSearch"])
defineProps({
    width: {
        type: String,
        default: "240px"
    },
    placeholder: {
        type: String,
        default: "请输入"
    },
    isSearchModel: {
        type: Boolean,
        default: true
    },
    buttonType: {
        type: String,
        default: "primary"
    },
    type: {
        type: String,
        default: "text"
    },
    // 方向
    direction: {
        type: String,
        default: "down"
    }
})

const handleSearch = () => emit("search", searchValue.value)

const handleAdvancedSearch = () => emit("advancedSearch")
</script>

<style lang="scss" scoped>
.search-input-plus {
  /* 与右侧「高级搜索」按钮同高 */
  --yo-search-height: 38px;
  display: inline-block;
  vertical-align: middle;

  :deep(.ep-input) {
    height: var(--yo-search-height);
    --ep-input-height: var(--yo-search-height);
  }

  :deep(.ep-input__wrapper) {
    height: var(--yo-search-height);
    min-height: var(--yo-search-height);
    padding: 0 0 0 10px !important;
    /* center：图标和文字居中；右侧按钮单独 stretch 铺满 */
    align-items: center;
    box-sizing: border-box;
    overflow: hidden;
  }

  :deep(.ep-input__wrapper .ep-input__inner) {
    height: auto !important;
    line-height: normal !important;
    border: none !important;
    border-radius: 0 !important;
    box-shadow: none !important;
    background: transparent !important;
    padding: 0 !important;
  }

  /* 关键：还原 EP 流式布局，取消 Element UI 的 absolute */
  :deep(.ep-input__prefix),
  :deep(.ep-input__suffix) {
    position: static !important;
    top: auto !important;
    right: auto !important;
    left: auto !important;
    transform: none !important;
    display: inline-flex !important;
    pointer-events: auto !important;
    margin: 0 !important;
    padding: 0 !important;
  }

  /* 左侧图标：跟文字一样垂直居中 */
  :deep(.ep-input__prefix) {
    height: auto !important;
    align-items: center !important;
    align-self: center;
    line-height: 1 !important;
  }

  :deep(.ep-input__prefix-inner) {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    height: auto;
    line-height: 1;
    margin: 0 !important;
    padding: 0 !important;
    pointer-events: all;
  }

  :deep(.ep-input__prefix .ep-icon) {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    margin: 0;
    line-height: 1;
    height: 1em;
    width: 1em;
  }

  /* 右侧按钮区：铺满高度 */
  :deep(.ep-input__suffix) {
    align-self: stretch;
    align-items: stretch;
    height: auto !important;
  }

  :deep(.ep-input__suffix-inner) {
    display: inline-flex;
    align-items: stretch;
    height: 100%;
    margin: 0 !important;
    padding: 0 !important;
    pointer-events: all;
  }

  /* 按钮铺满后缀区，贴齐右侧，去掉组件库大 padding */
  :deep(.ep-button) {
    height: 100% !important;
    margin: 0 !important;
    padding: 0 16px !important;
    font-size: var(--font-size-lg);
    border: none !important;
    border-radius: 0 !important;
  }
}
</style>
