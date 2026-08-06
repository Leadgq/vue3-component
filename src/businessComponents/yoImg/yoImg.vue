<template>
  <div class="yo-img-plus">
    <!-- 列表模式 -->
    <template v-if="fileList.length > 0 && type === 1">
      <div v-for="file in fileList" :key="file.id" class="yo-file-item" @click.stop="handlePreview(file)">
        <img class="file-icon-img" :src="getFileIcon(file)" alt="icon" />
        <div class="file-info">
          <span class="file-name" :title="file.name">{{ file.name }}</span>
          <span v-if="file.filesize || file.size || file.length" class="file-size">{{ formatSize(file.filesize ||
            file.size || file.length) }}</span>
        </div>
        <div class="file-actions">
          <el-link v-if="canPreview(file)" type="success" :underline="false"
            @click.stop="handlePreview(file)">预览</el-link>
          <el-link v-if="file.type === 'video/mp4'" type="success" :underline="false"
            @click.stop="playVideo(file)">播放</el-link>
          <el-link type="primary" :underline="false" @click.stop="handleDownLoad(file)">下载</el-link>
        </div>
      </div>
    </template>

    <!-- 网格模式 -->
    <template v-if="fileList.length > 0 && type === 2">
      <div class="yo-img-grid">
        <template v-for="(file, index) in fileList" :key="file.id || index">
          <el-image v-if="isImgType(file.type)" :src="file.url"
            :style="{ width: props.width, height: props.height, margin: '4px', cursor: 'pointer' }" :fit="fit"
            @click.stop="handlePreview(file, true)">
            <template #error>
              <div class="image-error">
                <el-image v-if="defaultUrl" :src="defaultUrl" />
                <el-icon v-else>
                  <Picture />
                </el-icon>
              </div>
            </template>
          </el-image>
          <div v-else class="grid-non-image-item" :style="{ width: props.width, height: props.height, margin: '4px' }"
            @click.stop="file.type === 'video/mp4' ? playVideo(file) : handlePreview(file)">
            <img class="grid-file-icon" :src="getFileIcon(file)" alt="icon" />
            <span class="grid-file-name" :title="file.name">{{ file.name }}</span>
            <div v-if="file.type === 'video/mp4'" class="grid-play-icon">
              <el-icon>
                <CaretRight />
              </el-icon>
            </div>
          </div>
        </template>
      </div>
    </template>

    <!-- 暂无数据 -->
    <div v-if="fileList.length === 0" class="yo-no-file">
      <el-image v-if="defaultUrl" :src="defaultUrl" />
      <div v-else class="no-file-text">
        <el-icon>
          <Warning />
        </el-icon> 暂无文件
      </div>
    </div>

    <YoPictureView ref="pictureViewRef"></YoPictureView>
    <!-- 预览组件 -->
    <YoFileView ref="fileViewRef" />

    <!-- 视频播放对话框 -->
    <el-dialog v-model="videoDialogVisible" :title="currentVideo?.name || '视频播放'" width="800px" append-to-body
      destroy-on-close @opened="handleVideoDialogOpened" @close="handleVideoDialogClose">
      <div id="mse" class="video-player-container"></div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, watch, computed, getCurrentInstance } from 'vue'
import { ElImage, ElIcon, ElLink, ElDialog } from 'element-plus'
import { Picture, Warning, CaretRight } from '@element-plus/icons-vue'
import Player from "xgplayer"
import 'xgplayer/dist/index.min.css';
import { YoFileView } from '../fileView'
import { YoPictureView } from "../pictureView"
import { useYoConfig } from '../../core/config'

import iconAudio from '../../assets/audio.png'
import iconExcel from '../../assets/excel.png'
import iconImage from '../../assets/image.png'
import iconMp4 from '../../assets/mp4.png'
import iconPdf from '../../assets/pdf.png'
import iconPpt from '../../assets/ppt.png'
import iconText from '../../assets/text.png'
import iconWord from '../../assets/world.png'
import iconZip from '../../assets/zip.png'
import iconEmty from '../../assets/emty.png'

const props = defineProps({
  ids: { type: Array, default: () => [] },
  type: { type: Number, default: 1 }, // 1: 列表, 2: 网格
  width: { type: String, default: '100px' },
  height: { type: String, default: '100px' },
  fit: { type: String, default: 'cover' },
  defaultUrl: { type: String, default: '' },
  apiUrl: { type: String, default: '' },
  upType: { type: String, default: 'base' },  // minio单独
  qiNiuCdnAPI: { type: String, default: '' },
  minioApi: { type: String, default: '' },
  minioFetchAdress: { type: String, default: '' },
  minioParmar: { type: String, default: '' },
})

const { proxy } = getCurrentInstance()
const fileList = ref([])
const fileViewRef = ref(null)
const pictureViewRef = ref(null)

const videoDialogVisible = ref(false)
const currentVideo = ref(null)
const playInstance = ref(null)


const config = useYoConfig()

// 业务接口地址
const mainServiceApi = computed(() => props.apiUrl || config.attachApi)
// MinIO服务地址
const minioServiceApi = computed(() => props.minioApi || config.minioApi)

const finalApiUrl = computed(() => {
  if (props.upType === 'minio') return minioServiceApi.value
  return mainServiceApi.value
})

const minioAddres = computed(() => minioServiceApi.value)

const isImgType = (filetype) => {
  const ctypeArr = ["image/png", "image/jpeg", "image/gif", "image/tiff", "image/x-icon"]
  return ctypeArr.includes(filetype)
}

const canPreview = (file) => {
  const previewTypes = ["application/pdf", "application/msword", "application/vnd.ms-excel", "application/vnd.ms-powerpoint", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "application/vnd.openxmlformats-officedocument.presentationml.presentation"]
  return isImgType(file.type) || previewTypes.includes(file.type)
}

const byDomainJudgePrefix = () => {
  let domainPrefix = 'https://qiniucnd.hnyotech.com.cn'
  if (props.qiNiuCdnAPI) return props.qiNiuCdnAPI
  let hostname = window.location.hostname
  if (hostname && hostname.indexOf('.hnprec.com') !== -1) {
    domainPrefix = 'https://qiniucnd.hnprec.com'
  }
  return domainPrefix
}

const formatSize = (size) => {
  if (!size) return '';
  const numSize = Number(size);
  if (isNaN(numSize)) return '';
  if (numSize < 1024) return numSize + ' B';
  if (numSize < 1024 * 1024) return (numSize / 1024).toFixed(2) + ' KB';
  if (numSize < 1024 * 1024 * 1024) return (numSize / (1024 * 1024)).toFixed(2) + ' MB';
  return (numSize / (1024 * 1024 * 1024)).toFixed(2) + ' GB';
}

const getFileIcon = (file) => {
  const name = file.name || '';
  const ext = name.split('.').pop().toLowerCase();

  if (['mp3', 'wav', 'wma', 'ogg', 'aac', 'flac'].includes(ext)) {
    return iconAudio;
  }
  if (['xls', 'xlsx', 'csv'].includes(ext)) {
    return iconExcel;
  }
  if (['png', 'jpg', 'jpeg', 'gif', 'bmp', 'svg', 'webp', 'tiff'].includes(ext)) {
    return iconImage;
  }
  if (['mp4', 'avi', 'rmvb', 'rm', 'flv', 'wmv', 'mkv'].includes(ext)) {
    return iconMp4;
  }
  if (['pdf'].includes(ext)) {
    return iconPdf;
  }
  if (['ppt', 'pptx'].includes(ext)) {
    return iconPpt;
  }
  if (['txt', 'log', 'md'].includes(ext)) {
    return iconText;
  }
  if (['doc', 'docx'].includes(ext)) {
    return iconWord;
  }
  if (['zip', 'rar', '7z', 'tar', 'gz'].includes(ext)) {
    return iconZip;
  }
  return iconEmty;
}

const imageList = computed(() => {
  return fileList.value.filter(f => isImgType(f.type)).map(f => {
    return {
      src: f.orgurl,
      id: f.id
    }
  })
})

const handlerMinIo = async () => {
  const res = await proxy.$http.post(`${minioAddres.value}${props.minioFetchAdress}`, props.minioParmar)
  // 兼容返回数据：当为对象且包含 Items 时取 Items，否则认为返回的是数组
  const dataList = Array.isArray(res) ? res : (res?.Items || [])

  fileList.value = dataList.map(file => {
    let item = { ...file }
    item.id = file.Id || file.ItemId
    item.name = file.ItemName
    item.size = file.FileSize
    item.type = file.ContentType
    let ext = ''
    if (item.name && item.name.includes('.')) {
      ext = item.name.split('.').pop().toLowerCase()
    } else if (file.Path && file.Path.includes('.')) {
      ext = file.Path.split('.').pop().toLowerCase()
    }

    if (!item.type && ext) {
      if (['png', 'jpg', 'jpeg', 'gif', 'bmp', 'webp'].includes(ext)) {
        item.type = `image/${ext === 'jpg' ? 'jpeg' : ext}`
      } else if (ext === 'pdf') {
        item.type = 'application/pdf'
      } else if (['doc', 'docx'].includes(ext)) {
        item.type = 'application/msword'
      } else if (['xls', 'xlsx'].includes(ext)) {
        item.type = 'application/vnd.ms-excel'
      } else if (['ppt', 'pptx'].includes(ext)) {
        item.type = 'application/vnd.ms-powerpoint'
      }
    }
    let urlPath = file.Path || ''
    if (urlPath && !urlPath.startsWith('/')) urlPath = '/' + urlPath

    item.orgurl = `${minioAddres.value}${urlPath}`
    item.url = item.orgurl // 缩略图默认和原图保持一致即可

    return item
  })
}

const formatDefaultFile = (file) => {
  let item = { ...file }
  if ((file.storagetype === 2 && file.filepath) || props.upType === 'qiniu') {
    item.orgurl = byDomainJudgePrefix() + file.filepath
    item.url = item.orgurl
  } else {
    const query = `id=${file.id}&sign=${file.sign}&timestamp=${file.timestamp}`
    if (isImgType(file.type)) {
      item.orgurl = `${finalApiUrl.value}/api/Attach/ShowImage?${query}`
      item.url = `${finalApiUrl.value}/api/Attach/ShowThumbImage?${query}`
    } else if (file.type === "application/pdf") {
      item.orgurl = `${finalApiUrl.value}/api/Attach/Download?${query}`
      item.url = `${finalApiUrl.value}/api/Attach/ShowPDF?${query}`
    } else {
      item.orgurl = `${finalApiUrl.value}/api/Attach/Download?${query}`
      item.url = item.orgurl
    }
  }
  return item
}

const toIdsString = (ids) => {
  if (ids == null || ids === '') return ''
  if (typeof ids === 'string') return ids.split(',').map(id => id.trim()).filter(Boolean).join(',')
  if (Array.isArray(ids)) return ids.filter(id => id != null && id !== '').join(',')
  return String(ids)
}

const handlerDefault = async (ids) => {
  try {
    const idsStr = toIdsString(ids)
    if (!idsStr) {
      fileList.value = []
      return
    }
    const res = await proxy.$http.post(`${finalApiUrl.value}/api/Attach/GetAttachs`, { ids: idsStr })
    fileList.value = (res || []).map(file => formatDefaultFile(file))
  } catch (error) {
    console.error('YoImg loadData error:', error)
  }
}

const loadData = async (ids) => {
  // minIo逻辑
  if (props.upType === 'minio') {
    handlerMinIo()
    return
  }
  // 走七牛和基础
  if (!ids) {
    fileList.value = []
    return
  }
  handlerDefault(ids)
}

const handlePreview = (file, isImageList = false, options = {}) => {
  if (file.type === 'video/mp4') {
    playVideo(file)
    return
  }
  if (isImgType(file.type)) {
    if (!isImageList) {
      pictureViewRef.value.showPicture({ src: file.orgurl, option: { container: document.body } })
    } else {
      const index = imageList.value.findIndex(item => item.src === file.orgurl)
      pictureViewRef.value.showPictures(imageList.value, index, options)
    }
    return
  }
  fileViewRef.value?.previewFile({ src: file.orgurl, type: file.type, fileName: file.name })
}

const playVideo = (file) => {
  currentVideo.value = file
  videoDialogVisible.value = true
}

const handleVideoDialogOpened = () => {
  if (!currentVideo.value) return
  playInstance.value = new Player({
    id: 'mse',
    url: currentVideo.value.orgurl,
    lang: 'zh-cn',
    autoplay: true,
    fluid: true,
    width: '100%',
    height: '100%'
  });
}

const handleVideoDialogClose = () => {
  if (playInstance.value) {
    playInstance.value.destroy()
    playInstance.value = null
  }
}

const hanlderPreveFileList = () => {
  if (fileList.value && fileList.value.length > 0) {
    const file = fileList.value[0];
    handlePreview(file, true, { container: document.body });
  }
}
const handleDownLoad = (file) => {
  fileViewRef.value?.downLoadFille(file.orgurl, file.name)
}


watch(
  () => props.ids,
  (ids) => {
    loadData(ids)
  },
  { immediate: true, deep: true }
)

defineExpose({
  hanlderPreveFileList
})
</script>

<style scoped lang="scss">
.yo-img-plus {
  width: 100%;
  .yo-file-item {
  display: flex;
  align-items: center;
  padding: 8px 12px;
  height: 36px;
  background-color: #f0f2f5;
  border-radius: 4px;
  margin-bottom: 8px;
  cursor: pointer;
  transition: background-color 0.3s;

  &:hover {
    background-color: #e4e7ed;
  }

  .file-icon-img {
    width: 28px;
    height: 34px;
    margin-right: 12px;
    flex-shrink: 0;
  }

  .file-info {
    display: flex;
    flex-direction: column;
    flex: 1;
    overflow: hidden;
  }

  .file-name {
    font-size: 14px;
    color: #535559;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }

  .file-size {
    font-size: 12px;
    color: #A8A9AB;
    margin-top: 4px;
  }

  .file-actions {
    display: flex;
    gap: 18px;
    margin-left: 16px;
  }
}

.yo-img-grid {
  display: flex;
  flex-wrap: wrap;
}

.grid-non-image-item {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background-color: #f0f2f5;
  border-radius: 4px;
  cursor: pointer;
  padding: 8px;
  box-sizing: border-box;
  transition: background-color 0.3s;
  position: relative;

  &:hover {
    background-color: #e4e7ed;
  }

  .grid-file-icon {
    width: 36px;
    height: 36px;
    margin-bottom: 8px;
  }

  .grid-file-name {
    font-size: 12px;
    color: #606266;
    text-align: center;
    width: 100%;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }
}

.image-error {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  background-color: #f5f7fa;
  color: #909399;
}

.yo-no-file {
  padding: 20px;
  text-align: center;
  color: #c0c4cc;

  .no-file-text {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
  }
}

.video-player-container {
  width: 100%;
  height: 450px;
  background-color: #000;
  border-radius: 4px;
  overflow: hidden;
}

.grid-play-icon {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: rgba(0, 0, 0, 0.5);
  border-radius: 50%;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 20px;
}

:deep(.ep-dialog__body) {
  padding: 0;
}
}
</style>
