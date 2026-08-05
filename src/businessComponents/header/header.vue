<template>
    <div>
        <div id="common_header" class="my-header">
            <YoTitle v-if="title != ''" :content="title" :titleLevel="1">
                <template v-if="$slots.second" #second>
                    <slot name="second"></slot>
                </template>
            </YoTitle>
            <section class="flex">
                <slot name="action"></slot>
                <YoButton v-if="isShowBack" @click="handleClick">
                    <el-icon>
                        <Back />
                    </el-icon>
                    {{ btnText }}
                </YoButton>
            </section>
        </div>
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

const isBackEvnet = getCurrentInstance().vnode.props.onBack

function handleClick() {
    if (!isBackEvnet) {
        window.history.back();
    } else {
        emit("back");
    }
}
</script>

<style lang="scss" scoped>
.my-header {
    width: 100%;
    height: 46px;
    background-color: #fff;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-left: 20px;
    box-sizing: border-box;
    margin-bottom: 10px;
}
</style>