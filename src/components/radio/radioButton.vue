<template>
    <el-radio-button v-bind="$attrs">
        <slot></slot>
    </el-radio-button>
</template>

<script setup >
import { ElRadioButton } from 'element-plus';
</script>