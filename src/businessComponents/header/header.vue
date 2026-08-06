<template>
    <div class="yo-header-wrap">
        <div id="common_header" class="my-header">
            <YoTitle v-if="title != ''" :content="title" :titleLevel="1">
                <template v-if="$slots.second" #second>
                    <slot name="second"></slot>
                </template>
            </YoTitle>
            <section class="my-header__action flex align-center">
                <slot name="action"></slot>
                <YoButton v-if="isShowBack" @click="handleClick">
                    <el-icon>
                        <Back />
                    </el-icon>
                    {{ btnText }}
                </YoButton>
            </section>
        </div>
        <!-- 主应用 AppContent 在吸顶时会显示，避免内容上跳 -->
        <div id="hide_show"></div>
    </div>
</template>

<script setup>
import { YoTitle } from '../title';
import { YoButton } from "../../components/button"
import { getCurrentInstance } from 'vue';
import { Back } from '@element-plus/icons-vue'
import { ElIcon } from 'element-plus';
const emit = defineEmits(['back'])
const props = defineProps({
    title: {
        type: String,
        default: ''
    },
    isShowBack: {
        type: Boolean,
        default: false
    },
    btnText: {
        type: String,
        default: '返回'
    }
})

const isBackEvnet = getCurrentInstance().vnode.props?.onBack

function handleClick() {
    if (!isBackEvnet) {
        window.history.back();
    } else {
        emit("back");
    }
}
</script>

<style lang="scss" scoped>
.yo-header-wrap {
    width: 100%;
}

.my-header {
    width: 100%;
    height: 46px;
    background-color: #fff;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-left: 20px;
    padding-right: 20px;
    box-sizing: border-box;
    margin-bottom: 10px;
    /* 整栏吸顶（标题 + 右侧按钮一起），不依赖主应用残缺的 my-header-float */
    position: sticky;
    top: 0;
    z-index: 100;
}

.my-header__action {
    flex-shrink: 0;
    gap: 8px;
    margin-left: 12px;
}

/* 主应用滚动时会挂上此类：补全 fixed，并避免 width:100% + left 把右侧按钮顶出视口 */
.my-header.my-header-float {
    position: fixed;
    top: 70px;
    left: 250px;
    right: 0;
    width: auto !important;
    margin-bottom: 0;
    box-shadow: 1px 1px 3px #dedede;
    z-index: 997;
}

#hide_show {
    height: 46px;
    display: none;
}
</style>
