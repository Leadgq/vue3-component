<template>
    <div class="yo-title flex align-center">
        <div class="yo-title flex align-center" :class="`yo-title-level-${level}`">
            <span class="title-flag"></span>
            {{ content }}
        </div>
        <slot name="second"></slot>
        <!-- 默认插槽位置 -->
        <slot></slot>
    </div>
</template>
<script setup>

import { computed } from 'vue'


const props = defineProps({
    content: {
        type: String,
        default: ''
    },
    titleLevel: {
        type: Number,
        default: 1
    }
})

const level = computed(() => Number(props.titleLevel))
</script>
