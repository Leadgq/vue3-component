<template>
  <el-empty class="yo-empty" :image="image" :image-size="imageSize" :description="description" v-bind="$attrs">
    <template v-for="(_, name) in slots" #[name]="slotData">
      <slot :name="name" v-bind="slotData" />
    </template>
  </el-empty>
</template>

<script setup>
import { ElEmpty } from 'element-plus'
import { useSlots } from 'vue'
import defaultImage from '../../assets/emty.png'

defineOptions({
  name: 'YoEmpty',
  inheritAttrs: false
})

const slots = useSlots()

const props = defineProps({
  image: {
    type: String,
    default: defaultImage
  },
  imageSize: {
    type: Number
  },
  description: {
    type: String,
    default: '暂无数据'
  }
})
</script>

<style scoped lang="scss">
.yo-empty {
  padding: 40px 0;
}
</style>
