<template>
    <div ref="viewer">
        <img :src="viewSrc" v-if="showSingle" style="display: none;" />
        <img v-else v-for="(item, index) in viewItems" :key="index" :src="item.src" :data-viewer-id="item.id"
            :alt="`Image ${index + 1}`" style="display: none;" />
    </div>
</template>

<script setup>
import { ref, nextTick, onBeforeUnmount } from 'vue';
import 'viewerjs/dist/viewer.css';
import Viewer from 'viewerjs';

let singleImgViewer = null;
const viewer = ref(null);
const viewItems = ref([]);
const viewSrc = ref('');
let container = null;
const showSingle = ref(true);

const initViewJs = async (option = {}, prevIndex = 0) => {
    const { container: customContainer } = option || {};
    await nextTick();
    container = viewer.value;
    if (typeof window === 'undefined') return;
    singleImgViewer = new Viewer(container, {
        container: customContainer || container,
        initialViewIndex: prevIndex,
        navbar: true,
        transition: true,
        zIndex: 3000,
        toolbar: {
            zoomIn: 1,
            zoomOut: 1,
            oneToOne: 1,
            reset: 1,
            prev: 1,
            play: 1,
            next: 1,
            rotateLeft: 1,
            rotateRight: 1,
            flipHorizontal: 1,
            flipVertical: 1,
            download: function () {
                const url = singleImgViewer.image.src;
                fetch(url)
                    .then(res => res.blob())
                    .then(async (blob) => {
                        let defaultName = url.split('?')[0].split('/').pop() || 'download';
                        const FileSaver = (await import('file-saver')).default;
                        FileSaver.saveAs(blob, defaultName);
                    })
            }
        },
        hidden: () => singleImgViewer.destroy(),
        ...option
    });
};

const destroyViewJs = () => {
    singleImgViewer && singleImgViewer.destroy();
    singleImgViewer = null;
};

const prevImage = (item) => {
    viewSrc.value = item;
    nextTick(() => {
        singleImgViewer && singleImgViewer.update();
        singleImgViewer && singleImgViewer.show();
    });
};

const showPictures = (items, prevIndex = 0, optipns = {}) => {
    showSingle.value = false;
    viewItems.value = items.map((item, index) => ({
        id: `img-${Date.now()}-${index}`,
        src: item.src
    }));
    initViewJs(optipns, prevIndex);
    nextTick(() => {
        singleImgViewer && singleImgViewer.update();
        singleImgViewer && singleImgViewer.show();
    });
};

const showPicture = (item) => {
    if (!item.src) {
        throw new Error('you should pass in a object that contain src');
    }
    destroyViewJs();
    showSingle.value = true;
    const { src, option } = item;
    initViewJs(option);
    prevImage(src);
};

onBeforeUnmount(() => {
    destroyViewJs();
});

// 导出方法
defineExpose({
    showPictures,
    showPicture,
    destroyViewJs
});
</script>

<style>
.viewer-download {
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 1024 1024' xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cpath d='M505.7 661a8 8 0 0 0 12.6 0l112-141.7c4.1-5.2.4-12.9-6.3-12.9h-74.1V168c0-4.4-3.6-8-8-8h-60c-4.4 0-8 3.6-8 8v338.3h-74.1c-6.7 0-10.4 7.7-6.3 12.9l112 141.7z' fill='%23ffffff'/%3E%3Cpath d='M878 626h-60c-4.4 0-8 3.6-8 8v154H214V634c0-4.4-3.6-8-8-8h-60c-4.4 0-8 3.6-8 8v198c0 17.7 14.3 32 32 32h684c17.7 0 32-14.3 32-32V634c0-4.4-3.6-8-8-8z' fill='%23ffffff'/%3E%3C/svg%3E") !important;
    background-size: 60% !important;
    background-position: center !important;
    background-repeat: no-repeat !important;
}

.viewer-download::before {
    content: "" !important;
}
</style>