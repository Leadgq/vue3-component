<template>
    <ElDrawer v-model="drawer" title="文件预览" size="100%" :z-index="999" append-to-body>
        <component v-if="currentOfficeComponent" :is="currentOfficeComponent" :src="src" style="height: 85vh"
            @rendered="renderedHandler" @error="handleRenderError" :options="options">
        </component>
    </ElDrawer>
</template>

<script setup>
import { ElDrawer } from "element-plus"
import { computed, ref, defineAsyncComponent } from 'vue'
import '@vue-office/docx/lib/v3/index.css';
import '@vue-office/excel/lib/v3/index.css';

const VueOfficeDocx = defineAsyncComponent(() => import('@vue-office/docx/lib/v3/vue-office-docx.mjs'));
const vueOfficeXlsx = defineAsyncComponent(() => import('@vue-office/excel/lib/v3/vue-office-excel.mjs'));
const vueOfficePdf = defineAsyncComponent(() => import('@vue-office/pdf/lib/v3/vue-office-pdf.mjs'));
const vueOfficePPtx = defineAsyncComponent(() => import('@vue-office/pptx/lib/v3/vue-office-pptx.mjs'));

const options = ref({
    xls: false, // 预览xlsx文件设为false；预览xls文件设为true
    minColLength: 0, // excel最少渲染多少列，如果想实现xlsx文件内容有几列，就渲染几列，可以将此值设置为0.
    minRowLength: 0, // excel最少渲染多少行，如果想实现根据xlsx实际函数渲染，可以将此值设置为0.
    widthOffset: 10, // 如果渲染出来的结果感觉单元格宽度不够，可以在默认渲染的列表宽度上再加 Npx宽
    heightOffset: 10, // 在默认渲染的列表高度上再加 Npx高
    beforeTransformData: (workbookData) => {
        return workbookData;
    }, // 底层通过exceljs获取excel文件内容，通过该钩子函数，可以对获取的excel文件内容进行修改，比如某个单元格的数据显示不正确，可以在此自行修改每个单元格的value值。
    transformData: (workbookData) => {
        return workbookData;
    } // 将获取到的exce
})

const emit = defineEmits(['finish-render', 'error'])

function handleRenderError(e) {
    console.error('vue-office渲染出错:', e)
    emit('error', e)
}

function renderedHandler() {
    emit('finish-render')
}

const drawer = ref(false)

const src = ref()
const type = ref('')


const downLoadFille = async (url, fileName) => {
    const FileSaver = (await import('file-saver')).default;
    FileSaver.saveAs(url, fileName);
}

const getFileSuffix = computed(() => {
    const mimeMap = {
        'application/pdf': 'pdf',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
        'application/msword': 'doc',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'xlsx',
        'application/vnd.ms-excel': 'xls',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'pptx',
        'application/vnd.ms-powerpoint': 'pptx'
    }
    if (type.value && mimeMap[type.value]) {
        return mimeMap[type.value]
    }
    if (typeof src.value === 'string') {
        return src.value.split('.').pop().toLowerCase()
    }
    return ''
})

const currentOfficeComponent = computed(() => {
    const suffix = getFileSuffix.value;
    if (suffix === 'pdf') return vueOfficePdf;
    if (suffix === 'xlsx' || suffix === 'xls') return vueOfficeXlsx;
    if (suffix === 'pptx') return vueOfficePPtx;
    if (suffix === 'docx' || suffix === 'doc') return VueOfficeDocx;
    return null;
})

const isFile = computed(() => {
    const fileList = [
        'docx',
        'xlsx',
        'pdf',
        'doc',
        'xls',
        'pptx'
    ];
    return fileList.includes(getFileSuffix.value)
})


const previewFile = ({ src: source, type: fileType, fileName, down = false }) => {
    if (!source) {
        throw new Error("文件地址不能为空")
    }
    if (down) {
        downLoadFille(source, fileName)
        return;
    }
    src.value = source
    type.value = fileType
    if (isFile.value) {
        options.value.xls = getFileSuffix.value === 'xls';
        drawer.value = true;
    } else {
        downLoadFille(source, fileName)
    }
}

defineExpose({
    previewFile,
    downLoadFille
})

</script>