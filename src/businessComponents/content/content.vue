<template>
    <div class="yo-content" :class="{ 'with-side': slots.side }">
        <YoTitle v-if="title != ''" :content="title" :titleLevel="1" class="title">
            <template v-if="$slots.second" #second>
                <slot name="second"></slot>
            </template>
        </YoTitle>
        <div id="contentMain" class="my-content__main">
            <slot></slot>
        </div>
    </div>
</template>

<script setup>
import { YoTitle } from '../title';
import { useSlots } from 'vue'

const slots = useSlots();
const props = defineProps({
    title: {
        type: String,
        default: ''
    },
    sideStyle: {
        type: Object,
        default: () => ({})
    }
})
</script>

<style scoped lang="scss">
.yo-content {
    background-color: #fff;
    padding-top: 17px;
    padding-bottom: 26px;

    .title {
        padding-left: 20px;
    }

    .my-content__main {
        width: 100%;
        box-sizing: border-box;
        padding-left: 32px;
        padding-right: 21px;
        margin-top: 15px;
    }
}
</style>