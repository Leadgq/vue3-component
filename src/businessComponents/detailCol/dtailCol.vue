<template>
    <div class="yo-detail-col">
        <template v-for="(li, ind) in rowData" :key="ind">
            <div class="yo-detail-col__row">
                <template v-for="(newLi, newIndex) in li" :key="newIndex">
                    <div :class="['yo-detail-col__item', isUnderClass(newLi)]" v-if="isShowItem(newLi)"
                        :style="getItemStyle(newLi)">
                        <RenderBefore v-if="newLi.before" :before="newLi.before" :data="newLi" />
                        <span :class="['yo-detail-col__label', 'is-align-' + (getAlign(newLi.labelAlign) || labelAlignVal)]"
                            v-show="newLi.title" :style="{
                                width: newLi.labelWidth ? newLi.labelWidth : props.labelWidth + 'px',
                                marginRight: newLi.space ? newLi.space : props.space + 'px',
                                marginBottom: isUnderClass(newLi) ? '10px' : '0px'
                            }" v-html="getHtml(newLi.title)">
                        </span>
                        <RenderMiddle v-if="newLi.middle" :middle="newLi.middle" :data="newLi" />
                        <div :class="['yo-detail-col__value', 'is-align-' + (getAlign(newLi.valueAlign) || valueAlignVal)]">
                            <RenderCell v-if="newLi.render" :render="newLi.render" :data="newLi" />
                            <template v-else>
                                <div v-html="newLi.value" :style="{ backgroundColor: getBackgroundColor() }"></div>
                            </template>
                        </div>
                        <RenderAfter v-if="newLi.after" :after="newLi.after" :data="newLi" />
                    </div>
                </template>
            </div>
        </template>
    </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
    rowData: {
        type: Array,
        default: () => []
    },
    labelWidth: {
        type: Number,
        default: 70
    },
    labelAlign: {
        type: String,
        default: 'left', // 'left' | 'center' | 'right'
        validator: (val) => ['left', 'center', 'right'].includes(val)
    },
    valueAlign: {
        type: String,
        default: 'left', // 'left' | 'center' | 'right'
        validator: (val) => ['left', 'center', 'right'].includes(val)
    },
    underLine: {
        type: Boolean,
        default: false
    },
    space: {
        type: [Number, String],
        default: 12
    },
    backgroundColor: {
        type: String,
        default: ''
    },
    preFixTips: {
        type: String,
        default: ':'
    }
})

const getAlign = (val) => {
    const map = {
        left: 'start',
        center: 'center',
        right: 'end'
    }
    return map[val] || val
}

const labelAlignVal = computed(() => getAlign(props.labelAlign))
const valueAlignVal = computed(() => getAlign(props.valueAlign))

const getHtml = (title) => {
    return `${title}${props.preFixTips}`
}

const getItemStyle = (li) => {
    const span = li.span || 8
    return {
        gridColumn: `span ${span}`
    }
}

const isUnderClass = (li) => {
    if (props.backgroundColor) {
        return ''
    }
    if (li.underLine === false) {
        return ''
    }
    if ((li.underLine || props.underLine)) {
        return 'is-underline'
    }
    return ''
}
const getBackgroundColor = () => {
    return props.backgroundColor
}

const isShowItem = (li) => {
    return li?.isVisiable !== false
}


const RenderBefore = (props) => {
    return props.before(props.data)
}

const RenderMiddle = (props) => {
    return props.middle(props.data)
}

const RenderAfter = (props) => {
    return props.after(props.data)
}

const RenderCell = (props) => {
    return props.render(props.data)
}
</script>
