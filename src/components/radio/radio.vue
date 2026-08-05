<template>
    <el-radio v-bind="$attrs">
        <slot></slot>
    </el-radio>
</template>

<script setup >
import { ElRadio } from 'element-plus';
</script>