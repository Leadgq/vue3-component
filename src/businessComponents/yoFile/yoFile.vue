<template>
  <div class="yo-file"
    :class="{
      'is-vertical': layout === 'vertical' && uploadType !== 1,
      'is-inline': layout === 'inline' && uploadType !== 1,
      'plus-flex': uploadType === 1,
      'flex-wrap': uploadType === 1
    }">
    <!-- uploadType === 1 图片列表 -->
    <ul v-if="uploadType === 1 && fileList.length > 0"
      class="ep-upload-list ep-upload-list--picture-card yo-custom-picture-list">
      <li v-for="file in fileList" :key="file.id || file.uid" class="ep-upload-list__item is-success"
        :style="{ width: props.width, height: props.height }">
        <img v-if="isImgType(file.type)" class="ep-upload-list__item-thumbnail" :src="file.url" alt="" />
        <div v-else class="non-image-thumbnail">
          <img class="grid-file-icon" :src="getFileIcon(file)" alt="icon" />
          <span class="grid-file-name" :title="file.name">{{ file.name }}</span>
        </div>
        <span class="ep-upload-list__item-actions">
          <span class="ep-upload-list__item-preview" @click.stop="handlePreview(file)">
            <el-icon>
              <ZoomIn />
            </el-icon>
          </span>
          <span class="ep-upload-list__item-delete" @click.stop="handleDownLoad(file)">
            <el-icon>
              <Download />
            </el-icon>
          </span>
          <span v-if="!readOnly" class="ep-upload-list__item-delete" @click.stop="handleRemove(file)">
            <el-icon>
              <Delete />
            </el-icon>
          </span>
        </span>
      </li>
    </ul>

    <el-upload v-if="!readOnly && isShowUpload && (uploadType !== 1 || !fileLimit || fileList.length < fileLimit)"
      ref="uploadRef" v-bind="$attrs" :drag="dragMode" :accept="computedAccept" :show-file-list="false"
      :file-list="fileList" :http-request="customHttpRequest" :auto-upload="autoUpload"
      :before-upload="handleBeforeUpload" :on-change="handleFileChange"
      :class="{ 'avatar-uploader': uploadType === 1, 'yo-file-uploader': true }"
      :style="uploadType === 1 ? { width: props.width, height: props.height } : {}">
      <template v-if="uploadType === 1">
        <el-icon class="avatar-uploader-icon">
          <Plus />
        </el-icon>
        <div v-if="isHasText" class="yo-add-text">{{ uploadText || t('file.uploadImage') }}</div>
      </template>
      <template v-else-if="dragMode">
        <slot name="trigger">
          <div class="yo-drag-inner" v-if="!readOnly">
            <img :src="uploadIcon" class="yo-drag-icon-img" />
            <div class="yo-drag-title">{{ t('file.clickUpload') }}</div>
            <div class="yo-drag-sub">{{ t('file.dragHint') }}</div>
          </div>
        </slot>
      </template>
      <template v-else>
        <slot name="trigger">
          <el-button class="yo-file-upload-btn" v-if="!readOnly" :disabled="(fileList.length >= fileLimit) && fileLimit" type="primary"
            size="small">{{
              uploadBtnName || t('common.upload')
            }}</el-button>
        </slot>
      </template>

      <template #tip v-if="$slots.tip">
        <slot name="tip"></slot>
      </template>
    </el-upload>

    <!-- 从网盘选择按钮 -->
    <el-button v-if="!readOnly && showNetDisk" type="success" size="small" class="yo-net-disk-btn"
      :disabled="(fileList.length >= fileLimit) && fileLimit > 0" @click="openNetDisk">
      {{ t('file.fromNetDisk') }}
    </el-button>

    <!-- 列表模式展示-->
    <div v-if="fileList.length > 0 && uploadType !== 1" class="yo-file-list-wrapper">

      <!-- 表格样式列表 -->
      <div v-if="showTable" class="yo-file-table-container">
        <div class="yo-file-table-header">
          <div class="header-indicator"></div>
          <span class="header-title">{{ t('file.attachInfo', { count: fileList.length }) }}</span>
        </div>
        <div class="yo-file-table">
          <div class="table-header">
            <div class="col-name">{{ t('file.fileName') }}</div>
            <div class="col-size">{{ t('file.size') }}</div>
            <div class="col-status">{{ t('file.status') }}</div>
            <div class="col-action">{{ t('file.action') }}</div>
          </div>
          <div class="table-body">
            <div v-for="file in fileList" :key="file.id || file.uid" class="table-row">
              <div class="col-name file-name-container" @click.stop="handlePreview(file)">
                <img class="row-file-icon" :src="getFileIcon(file)" alt="icon" />
                <span class="row-file-name" :title="file.name">{{ file.name }}</span>
              </div>
              <div class="col-size">{{ formatSize(file.filesize || file.size || file.length) }}</div>
              <div class="col-status">
                <span v-if="file.status === 'ready'" class="status-ready">{{ t('file.pending') }}</span>
                <span v-else-if="file.status === 'uploading'" class="status-ready">{{ t('file.uploading') }}</span>
                <span v-else-if="file.status === 'error'" class="status-error">
                  <el-icon>
                    <CircleClose />
                  </el-icon> {{ t('file.uploadFail') }}
                </span>
                <span v-else class="status-success">
                  <el-icon>
                    <CircleCheck />
                  </el-icon> {{ t('file.uploadSuccess') }}
                </span>
              </div>
              <div class="col-action">
                <el-link v-if="file.status !== 'ready' && file.status !== 'error'"
                  :disabled="file.status === 'uploading'" type="primary" :underline="false"
                  @click.stop="handleDownLoad(file)" style="margin-right:12px;">{{ t('common.download') }}</el-link>
                <el-link v-if="!readOnly" type="primary" :underline="false"
                  @click.stop="handleRemove(file)">{{ t('common.delete') }}</el-link>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 原有普通列表样式 -->
      <div v-else class="yo-file-list" :class="{ 'yo-file-list-vertical': fileListLayout === 'vertical' }">
        <div v-for="file in fileList" :key="file.id || file.uid" class="yo-file-item"
          :class="{ 'yo-file-item-vertical': fileListLayout === 'vertical' }">
          <div class="file-info-container">
            <img class="file-icon-img" :src="getFileIcon(file)" alt="icon" />
            <div class="file-info">
              <span class="file-name" :title="file.name">{{ file.name }}</span>
              <span v-if="file.filesize || file.size || file.length" class="file-size">
                {{ formatSize(file.filesize || file.size || file.length) }}
              </span>
            </div>
          </div>

          <div class="file-actions">
              <el-link v-if="canPreview(file)" type="success" :underline="false"
              @click.stop="handlePreview(file)">{{ t('common.preview') }}</el-link>
            <el-link v-if="isVideoFile(file)" type="success" :underline="false"
              @click="playVideo(file)">{{ t('common.play') }}</el-link>
            <el-link type="primary" :underline="false" @click.stop="handleDownLoad(file)">{{ t('common.download') }}</el-link>
            <el-link v-if="!readOnly" type="danger" :underline="false" @click.stop="handleRemove(file)">{{ t('common.delete') }}</el-link>
          </div>
        </div>
      </div>
    </div>

    <YoPictureView ref="pictureViewRef" />
    <YoFileView ref="fileViewRef" />

    <!-- 视频播放对话框 -->
    <el-dialog v-model="videoDialogVisible" :title="currentVideo?.name || t('file.playVideo')" width="800px" append-to-body
      destroy-on-close @opened="handleVideoDialogOpened" @close="handleVideoDialogClose">
      <div id="mse" class="video-player-container"></div>
    </el-dialog>

    <!-- 网盘选择对话框 -->
    <el-dialog v-model="netDiskVisible" :title="t('file.netDiskTitle')" width="800px" append-to-body>
      <div v-loading="netDiskLoading" class="yo-net-disk-container">
        <el-table :data="netDiskFiles" height="400px" @selection-change="handleSelectionChange">
          <el-table-column type="selection" width="55" />
          <el-table-column :label="t('file.netDiskFileName')" min-width="200">
            <template #default="{ row }">
              <div class="file-name-cell">
                <img class="cell-file-icon" :src="getFileIcon(row)" alt="icon" />
                <span>{{ row.name }}</span>
              </div>
            </template>
          </el-table-column>
          <el-table-column :label="t('file.size')" width="120">
            <template #default="{ row }">
              {{ formatSize(row.size || row.filesize || row.length) }}
            </template>
          </el-table-column>
          <el-table-column prop="createTime" :label="t('file.uploadTime')" width="180" />
        </el-table>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="netDiskVisible = false">{{ t('common.cancel') }}</el-button>
          <el-button type="primary" :disabled="selectedNetFiles.length === 0" @click="handleNetDiskConfirm">
            {{ t('file.confirmCount', { count: selectedNetFiles.length }) }}
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, watch, getCurrentInstance, onMounted, useAttrs, nextTick } from 'vue'
import { Plus, ZoomIn, Download, Delete, CircleCheck, CircleClose } from '@element-plus/icons-vue'
import Player from "xgplayer"
import 'xgplayer/dist/index.min.css';
import { ElMessage, ElMessageBox } from 'element-plus'
import { YoFileView } from '../fileView'
import { YoPictureView } from '../pictureView'
import { useYoConfig } from '../../core/config'
import { isImgType, isVideoFile, canPreview, formatSize, getFileIcon, getFileExt, inferMimeFromExt } from '../fileType'
import { t, getLocale } from '../../core/i18n'
import uploadIcon from "../../assets/upload.png"

defineOptions({
  name: 'YoFile',
  inheritAttrs: false // 关键：阻止属性默认集成到外层 div
})

const videoDialogVisible = ref(false)
const currentVideo = ref(null)

const props = defineProps({
  modelValue: { type: [Array, String], default: () => [] },
  ids: { type: [Array, String], default: () => [] },
  uploadBtnName: { type: String, default: '' },
  uploadType: { type: Number, default: 3 }, // 1: picture-card, 3/4: file
  readOnly: { type: Boolean, default: false },
  isHasText: { type: Boolean, default: false },
  uploadText: { type: String, default: '' },
  isDelete: { type: Boolean, default: true },
  isShowUpload: { type: Boolean, default: true },
  showTable: { type: Boolean, default: false }, // 是否展示大表格样式的附件列表
  autoUpload: { type: Boolean, default: true },
  dragMode: { type: Boolean, default: false }, // 是否使用虚线卡片拖拽上传模式
  fileLimit: { type: Number, default: 0 },
  fileSize: { type: Number, default: 104857600 }, // 限制上传文件大小，单位MB，0表示不限制
  apiUrl: { type: String, default: '' },
  layout: { type: String, default: 'horizontal' }, // 'vertical' | 'horizontal' | 'inline'
  upType: { type: String, default: '' }, // '' 基础, 'qiniu' 七牛, 'minio' Minio
  qiNiuCdnAPI: { type: String, default: '' },
  minioApi: { type: String, default: '' },
  minioFetchAdress: { type: String, default: '' },
  // minio获取文件参数
  minioParmar: { type: [Object, String], default: () => ({}) },
  // minio上传参数
  uploadMinioParmars: { type: [Object, String], default: () => ({}) },
  showNetDisk: { type: Boolean, default: false }, // 是否显示从网盘选择按钮
  netDiskApi: { type: String, default: '' }, // 网盘数据接口地址
  width: { type: String, default: '100px' }, // 图片卡片宽度
  height: { type: String, default: '100px' }, // 图片卡片高度
  iconWidth: { type: String, default: '48px' },
  iconHeight: { type: String, default: '56px' },
  fileListLayout: { type: String, default: 'horizontal' }
})

const emit = defineEmits(['update:modelValue', 'update:ids', 'update:fileList', 'delFile', 'callback', 'upload-complete'])
const attrs = useAttrs()

const { proxy } = getCurrentInstance()

const fileList = ref([])

const isUploadingGlobal = ref(false)
watch(() => fileList.value, (newList) => {
  const hasPending = newList.some(f => f.status === 'ready' || f.status === 'uploading')
  if (isUploadingGlobal.value && !hasPending) {
    updateIdsEmit()
    emit('upload-complete', newList)
  }
  isUploadingGlobal.value = hasPending
}, { deep: true })

const fileViewRef = ref(null)
const pictureViewRef = ref(null)

const playInstance = ref(null)
const playVideo = (file) => {
  currentVideo.value = file
  videoDialogVisible.value = true
}

const handleVideoDialogOpened = () => {
  if (!currentVideo.value) return
  playInstance.value = new Player({
    id: 'mse',
    url: currentVideo.value.orgurl,
    lang: getLocale() === 'en' ? 'en' : 'zh-cn',
    autoplay: true,
    fluid: true, // 宽高自适应
    width: '100%',
    height: '100%',
    cssFullscreen: false, 
  });
}

const handleVideoDialogClose = () => {
  if (playInstance.value) {
    playInstance.value.destroy()
    playInstance.value = null
  }
}


// --- 网盘选择逻辑 ---
const netDiskVisible = ref(false)
const netDiskLoading = ref(false)
const netDiskFiles = ref([])
const selectedNetFiles = ref([])

const openNetDisk = async () => {
  netDiskVisible.value = true
  netDiskLoading.value = true
  try {
    if (!minioServiceApi.value) {
      throw new Error(t('file.netDiskNeedMinio'))
    }
    const api = minioServiceApi.value + '/api/Directory/QueryPage';
    const res = await proxy.$http.post(api, {
      pageSize: 100,
      pageIndex: 1,
      ...props.minioParmar,
    })
    const dataList = Array.isArray(res) ? res : (res?.Items || [])
    netDiskFiles.value = dataList.map(item => {
      const file = { ...item }
      file.id = item.id || item.Id || item.ItemId
      file.name = item.name || item.ItemName || item.fileName
      file.size = item.size || item.FileSize || item.length
      file.type = item.type || item.ContentType || item.fileType
      let path = item.Path || item.filepath || ''
      if (path && !path.startsWith('/')) path = '/' + path
      file.url = finalApiUrl.value + path
      file.orgurl = finalApiUrl.value + path
      return file
    })
  } catch (error) {
    console.error('Fetch net disk files error:', error)
    ElMessage.error(t('file.netDiskFetchFail'))
  } finally {
    netDiskLoading.value = false
  }
}

const handleSelectionChange = (val) => {
  selectedNetFiles.value = val
}

const handleNetDiskConfirm = () => {
  const currentCount = fileList.value.length
  const limit = props.fileLimit || 999
  const remaining = limit - currentCount

  if (remaining <= 0) {
    ElMessage.warning(t('file.maxFiles', { limit }))
    return
  }

  const toAdd = selectedNetFiles.value.slice(0, remaining)
  if (selectedNetFiles.value.length > remaining) {
    ElMessage.warning(t('file.exceedLimit', { remaining }))
  }

  toAdd.forEach(file => {
    const exists = fileList.value.some(item => item.id === file.id)
    if (!exists) {
      file.status = 'success'
      fileList.value.push(file)
    }
  })

  updateIdsEmit()
  netDiskVisible.value = false
  selectedNetFiles.value = []
}

const config = useYoConfig()

// 业务接口地址（上传等通用接口）
const mainServiceApi = computed(() => props.apiUrl || config.attachApi)
// MinIO服务地址
const minioServiceApi = computed(() => props.minioApi || config.minioApi)

// 兼容老逻辑的回显基准地址
const finalApiUrl = computed(() => {
  if (props.upType === 'minio') return minioServiceApi.value
  return mainServiceApi.value
})
const minioAddres = computed(() => minioServiceApi.value)

const computedAccept = computed(() => {
  if (attrs.accept) return attrs.accept
  if (props.uploadType === 1) return 'image/*,.jpg,.jpeg,.png,.ico,.gif,.svg,.bmp,.webp'
  return ''
})

const uploadRef = ref(null)

//  === 外界统一上传 ===
const submitUpload = async () => {
  await nextTick();
  return new Promise((resolve) => {
    if (!uploadRef.value) {
      resolve(fileList.value)
      return
    }

    const hasPending = fileList.value.some(item => item.status === 'ready' || item.status === 'uploading')
    if (!hasPending) {
      resolve(fileList.value)
      return
    }

    const unwatch = watch(
      () => fileList.value,
      (newList) => {
        const stillPending = newList.some(item => item.status === 'ready' || item.status === 'uploading')
        if (!stillPending) {
          unwatch()
          resolve(newList)
        }
      },
      { deep: true }
    )
    uploadRef.value.submit()
  })
}

const clearFiles = () => {
  if (uploadRef.value) {
    uploadRef.value.clearFiles()
  }
}

defineExpose({
  submitUpload,
  clearFiles
})

//  === 文件发生变化 ===
const handleFileChange = (file) => {
  if (file.status === 'ready') {
    const exists = fileList.value.some(item => item.name === file.name && item.size === file.size)
    if (!exists) {
      fileList.value.push({
        uid: file.uid,
        name: file.name,
        size: file.size,
        type: file.raw?.type,
        status: 'ready'
      })
      updateIdsEmit()
    } else {
      console.log('--- handleFileChange file exists ---', file.name)
      ElMessage.error(t('file.duplicateName'))
      if (uploadRef.value) uploadRef.value.handleRemove(file)
    }
  } else if (file.status === 'uploading') {
    let item = fileList.value.find(f => f.uid === file.uid)
    if (item) item.status = 'uploading'
    updateIdsEmit()
  }
}
//  === 上传之前 ===
const handleBeforeUpload = (file) => {
  const setFileError = () => {
    const item = fileList.value.find(f => f.uid === file.uid)
    if (item) item.status = 'error'
  }

  const sameFileName = fileList.value.some(item => item.name === file.name && String(item.uid) !== String(file.uid))
  if (sameFileName) {
    const isAlreadyNotified = !fileList.value.some(item => String(item.uid) === String(file.uid))
    if (!isAlreadyNotified) {
      ElMessage.error(t('file.duplicateName'))
    }
    setFileError()
    return false
  }
  if (props.fileSize && props.fileSize > 0) {
    const isBytes = props.fileSize > 10000;
    const limitBytes = isBytes ? props.fileSize : props.fileSize * 1024 * 1024;

    if (file.size > limitBytes) {
      const limitMB = (limitBytes / 1024 / 1024).toFixed(2);
      ElMessage.error(t('file.sizeLimit', { size: limitMB.replace('.00', '') }))
      setFileError()
      return false
    }
  }

  if (attrs['before-upload']) {
    const result = attrs['before-upload'](file)
    if (!result) {
      setFileError()
    }
    return result
  }
  return true
}

// === 判断逻辑 ===
const byDomainJudgePrefix = () => {
  let domainPrefix = 'https://qiniucnd.hnyotech.com.cn'
  if (props.qiNiuCdnAPI) return props.qiNiuCdnAPI
  let hostname = window.location.hostname
  if (hostname && hostname.indexOf('.hnprec.com') !== -1) {
    domainPrefix = 'https://qiniucnd.hnprec.com'
  }
  return domainPrefix
}

const updateIdsEmit = () => {
  // 过滤出有实际id的记录抛给v-model:ids，避免本地暂存未上传的项产生 undefined, 导致 ids 错乱
  const validFiles = fileList.value.filter(item => item.id)
  const newIdsArr = validFiles.map(item => item.id)

  const isStringMode = typeof props.ids === 'string' || typeof props.modelValue === 'string'

  if (isStringMode) {
    const idsStr = newIdsArr.join(',')
    emit('update:ids', idsStr)
    emit('update:modelValue', idsStr)
  } else {
    emit('update:ids', newIdsArr)
    emit('update:modelValue', newIdsArr)
  }
  // 对外完整暴露带有本地状态的所有 fileList
  emit('update:fileList', fileList.value)
  emit('callback', fileList.value)
}

// === 上传逻辑 ===
const customHttpRequest = async (param) => {

  if (attrs['http-request']) {
    return attrs['http-request'](param)
  }

  let form = new FormData()
  form.append('file', param.file, param.file.name)
  form.append('filename', param.file.name)

  let uploadUrl = ''
  if (props.upType === 'minio') {
    uploadUrl = (minioServiceApi.value || '') + '/api/Directory/UploadFile'
    if (props.uploadMinioParmars) {
      const query = typeof props.uploadMinioParmars === 'string'
        ? props.uploadMinioParmars
        : new URLSearchParams(props.uploadMinioParmars).toString()
      if (query) {
        uploadUrl += (uploadUrl.includes('?') ? '&' : '?') + query
      }
    }
  } else {
    // 默认情况下使用
    uploadUrl = (mainServiceApi.value || '') + '/api/Attach/SaveAttach'
  }

  if (!uploadUrl) {
    if (attrs.action && attrs.action !== '#') {
      uploadUrl = attrs.action
    }
  }

  try {
    const response = await proxy.$http.post(uploadUrl, form, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })

    let item = fileList.value.find(f => f.uid === param.file.uid)
    if (!item) {
      item = { uid: param.file.uid }
      fileList.value.push(item)
    }

    // 合并返回值
    Object.assign(item, response)
    item.id = response.id || response.Id || response.ItemId
    item.name = response.name || response.ItemName || param.file.name
    item.size = response.size || response.FileSize || param.file.size
    item.type = response.type || response.ContentType || param.file.type
    item.sign = response.sign
    item.timestamp = response.timestamp
    item.filepath = response.filepath || response.Path

    if (props.upType === 'minio') {
      let urlPath = item.filepath || ''
      if (urlPath && !urlPath.startsWith('/')) urlPath = '/' + urlPath
      item.orgurl = `${minioAddres.value}${urlPath}`
      item.url = item.orgurl
    } else {
      Object.assign(item, formatDefaultFile(item))
    }

    item.status = 'success'

    updateIdsEmit()
    param.onSuccess()
  } catch (error) {
    fileList.value = fileList.value.filter(f => f.uid !== param.file.uid)
    updateIdsEmit()
    console.error('Upload Error: ', error)
    ElMessage.error(t('file.uploadFailMsg'))
    param.onError(error)
  }
}

const handleRemove = async (file) => {
  if (props.readOnly || !props.isDelete) {
    return
  }

  try {
    await ElMessageBox.confirm(t('file.deleteConfirm', { name: file.name }), t('common.tip'), {
      confirmButtonText: t('common.confirm'),
      cancelButtonText: t('common.cancel'),
      type: 'warning'
    })

    // 未上传的直接在本地移除
    if (file.status === 'ready' || file.status === 'error') {
      fileList.value = fileList.value.filter(item => (item.id || item.uid) !== (file.id || file.uid))
      updateIdsEmit()
      if (uploadRef.value) uploadRef.value.handleRemove(file)
      return
    }

    // 删除服务器中的文件
    const baseUrl = finalApiUrl.value || ''
    if (props.upType === 'minio') {
      await proxy.$http.post(`${baseUrl}/api/Directory/RemoveFile?fileid=${file.id}`)
    } else {
      try {
        if (file.id && file.sign) {
          await proxy.$http.post(`${baseUrl}/api/Attach/Delete?id=${file.id}&sign=${file.sign}&timestamp=${file.timestamp}`)
        }
      } catch (err) {
        console.error('delete remote file error', err)
      }
    }
    fileList.value = fileList.value.filter(item => item.id !== file.id)
    updateIdsEmit()
    emit('delFile', file.id)
    ElMessage.success(t('file.deleteSuccess'))
  } catch (e) {
    if (e !== 'cancel') {
      console.error('Remove file error:', e)
    }
  }
}

// === 获取数据回显逻辑 ===
const formatDefaultFile = (file) => {
  let item = { ...file }
  if (!item.type) item.type = inferMimeFromExt(getFileExt(file))
  if ((file.storagetype === 2 && file.filepath) || props.upType === 'qiniu') {
    item.orgurl = byDomainJudgePrefix() + file.filepath
    item.url = item.orgurl
  } else {
    const query = `id=${file.id}&sign=${file.sign}&timestamp=${file.timestamp}`
    const baseUrl = finalApiUrl.value || ''
    if (isImgType(item.type)) {
      item.orgurl = `${baseUrl}/api/Attach/ShowImage?${query}`
      item.url = `${baseUrl}/api/Attach/ShowThumbImage?${query}`
    } else if (item.type === "application/pdf") {
      item.orgurl = `${baseUrl}/api/Attach/Download?${query}`
      item.url = `${baseUrl}/api/Attach/ShowPDF?${query}`
    } else {
      item.orgurl = `${baseUrl}/api/Attach/Download?${query}`
      item.url = item.orgurl
    }
  }
  return item
}

const handlerMinIo = async () => {
  try {
    const res = await proxy.$http.post(`${minioAddres.value}${props.minioFetchAdress}`, props.minioParmar)
    const dataList = Array.isArray(res) ? res : (res?.Items || [])
    fileList.value = dataList.map(file => {
      let item = { ...file }
      item.id = file.Id || file.ItemId
      item.name = file.ItemName
      item.size = file.FileSize
      item.type = file.ContentType || inferMimeFromExt(getFileExt({ name: item.name, Path: file.Path, filepath: file.filepath }))
      let urlPath = file.Path || file.filepath || ''
      if (urlPath && !urlPath.startsWith('/')) urlPath = '/' + urlPath

      item.orgurl = `${minioAddres.value}${urlPath}`
      item.url = item.orgurl
      return item
    })
  } catch (error) {
    console.error('YoFile fetch minio:', error)
  }
}

// 回显数据
const handlerDefault = async (ids) => {
  try {
    const actualIds = typeof ids === 'string' ? ids.split(',').filter(id => id.trim()) : ids
    const res = await proxy.$http.post(`${finalApiUrl.value || ''}/api/Attach/GetAttachs`, { ids: actualIds })
    fileList.value = (res || []).map(file => formatDefaultFile(file))
  } catch (error) {
    console.error('YoFile fetch attach error:', error)
  }
}

const loadData = (ids) => {
  if (props.upType === 'minio') {
    handlerMinIo()
    return
  }
  if (!ids) {
    fileList.value = []
    return
  }
  handlerDefault(ids)
}

// === 预览与下载 ===
const imageList = computed(() => {
  return fileList.value.filter(f => isImgType(f.type)).map(f => {
    return { src: f.orgurl, id: f.id }
  })
})

// 预览组件
const handlePreview = (file) => {
  if (isVideoFile(file)) {
    playVideo(file)
    return
  }
  if (isImgType(file.type)) {
    const index = imageList.value.findIndex(item => item.src === file.orgurl)
    if (index !== -1 && imageList.value.length > 1) {
      pictureViewRef.value.showPictures(imageList.value, index)
    } else {
      pictureViewRef.value.showPicture({ src: file.orgurl, option: { container: document.body } })
    }
  } else {
    fileViewRef.value?.previewFile({ src: file.orgurl, type: file.type, fileName: file.name })
  }
}

// 下载
const handleDownLoad = (file) => {
  fileViewRef.value?.downLoadFille(file.orgurl, file.name)
}


onMounted(() => {
  console.log('props.layout', props.layout,'执行')
  const activeIds = (props.ids && props.ids.length) ? props.ids : props.modelValue;
  if (activeIds || props.upType === 'minio') {
    loadData(activeIds)
  }
})

// css样式
const itemWidth = computed(() => {
  const len = fileList.value.length
  if (len === 0) return '100%'
  return (100 / len).toFixed(2) + '%'
})
</script>

<style scoped lang="scss">
.flex-wrap {
  flex-wrap: wrap;
}

.yo-file {
  width: 100%;

  .ep-upload-list--picture-card {
    flex-wrap: nowrap;
  }

  &.is-vertical {
    display: flex;
    flex-direction: row;
    align-items: center;
    flex-wrap: wrap;
    gap: 12px;

    .yo-file-item {
      flex: 1;
    }

    .yo-file-uploader {
      margin-bottom: 0;
    }

    .yo-file-list-wrapper {
      margin-top: 0;
      flex: 1;
      min-width: 0;
    }

    .yo-file-list {
      display: flex;
      flex-direction: column;
      flex-wrap: wrap;
      gap: 8px;
    }

    .yo-file-item {
      margin-bottom: 0;
      width: auto;
      min-width: 260px;
    }

    .yo-custom-picture-list {
      order: 2;
    }

    .yo-file-uploader {
      order: 1;
      width: fit-content !important;
      flex: none !important;
    }

    .yo-file-list-wrapper {
      order: 3;
    }
  }

  &.is-inline {
    display: flex;
    flex-direction: row;
    align-items: center;
    flex-wrap: wrap;
    gap: 8px;
    width: auto;
    flex: 1;
    min-width: 0;

    .yo-file-uploader {
      margin-bottom: 0;
      width: fit-content !important;
      flex: none !important;
      order: 1;
    }

    .yo-net-disk-btn {
      order: 2;
      margin-left: 0;
    }

    .yo-file-list-wrapper {
      order: 3;
      flex-basis: 100%;
      width: 100%;
      margin-top: 8px;
      flex: none;
      min-width: 0;
    }
  }

  .yo-net-disk-btn {
    margin-left: 12px;
  }

  .yo-file-list-vertical {
    display: flex;
    gap: 10px;

    .yo-file-item-vertical {
      width: v-bind(itemWidth);
    }
  }
}

.file-name-cell {
  display: flex;
  align-items: center;
  gap: 8px;

  .cell-file-icon {
    width: 24px;
    height: 28px;
  }
}

.yo-net-disk-container {
  min-height: 400px;
}

.non-image-thumbnail {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: #f5f7fa;
  padding: 8px;
  box-sizing: border-box;
}

.non-image-thumbnail .grid-file-icon {
  width: v-bind(iconWidth);
  height: v-bind(iconHeight);
  margin-bottom: 8px;
  object-fit: contain;
}

.non-image-thumbnail .grid-file-name {
  font-size: 12px;
  color: #606266;
  text-align: center;
  width: 100%;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.yo-custom-picture-list {
  // display: inline-flex; 
  display: flex;
  vertical-align: top;
  margin: 0;
  padding: 0;

  .ep-upload-list__item {
    flex: none;
  }

  .ep-upload-list__item-thumbnail {
    object-fit: cover;
  }
}

.yo-file-uploader.avatar-uploader {
  display: inline-block;
  vertical-align: top;
  flex: none !important;
}

.avatar-uploader :deep(.ep-upload) {
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: border-color 0.3s;
}

.avatar-uploader :deep(.ep-upload):hover {
  border-color: var(--primary-color);
}

.yo-file-uploader.avatar-uploader :deep(.ep-upload) {
  width: 100%;
  height: 100%;
}

.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 100%;
  height: 100%;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
}



.yo-add-text {
  position: absolute;
  width: 100%;
  top: 70%;
  font-size: 14px;
  color: #666;
  text-align: center;
}

.yo-file-list {
  &:first-child {
    margin-top: 8px;
  }

  .yo-file-item {
    display: flex;
    align-items: center;
    padding: 8px 12px;
    box-sizing: border-box;
    height: 50px;
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
      line-height: 1;
    }

    .file-size {
      font-size: 12px;
      color: #A8A9AB;
      margin-top: 4px;
      line-height: 1;
    }

    .file-actions {
      display: flex;
      gap: 16px;
      margin-left: 16px;
    }
  }

  .yo-file-item-vertical {}

}


.file-info-container {
  display: flex;
  flex: 1;
  align-items: center;
  overflow: hidden;
}

.yo-file-table-container {
  margin-top: 16px;
}

.yo-file-table-header {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
}

.header-indicator {
  width: 3px;
  height: 14px;
  background-color: var(--primary-color);
  margin-right: 6px;
}

.header-title {
  font-size: 14px;
  font-weight: bold;
  color: #303133;
}

.yo-file-table {
  border: 1px solid #ebeef5;
  border-radius: 4px;
  overflow: hidden;
}

.table-header {
  display: flex;
  background-color: #FAFAFA;
  padding: 10px 16px;
  border-bottom: 1px solid #ebeef5;
  font-size: 13px;
  color: #909399;
}

.table-row {
  display: flex;
  padding: 12px 16px;
  align-items: center;
  border-bottom: 1px solid #ebeef5;
  font-size: 13px;
  color: #606266;
}

.table-row:last-child {
  border-bottom: none;
}

.col-name {
  flex: 3;
  overflow: hidden;
}

.col-size {
  flex: 1;
  color: #909399;
}

.col-status {
  flex: 1;
}

.col-action {
  flex: 1;
  text-align: center;
}

.file-name-container {
  display: flex;
  align-items: center;
  cursor: pointer;
}

.file-name-container:hover .row-file-name {
  color: var(--primary-color);
}

.row-file-icon {
  width: 24px;
  height: 28px;
  margin-right: 8px;
}

.row-file-name {
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.status-success {
  color: #67C23A;
  display: flex;
  align-items: center;
  gap: 4px;
}

.status-error {
  color: #F56C6C;
  display: flex;
  align-items: center;
  gap: 4px;
}

.status-ready {
  color: #909399;
}

.yo-file-uploader:not(.avatar-uploader) :deep(.ep-upload) {
  display: block;
}

.yo-file-uploader:not(.avatar-uploader) :deep(.ep-upload-dragger) {
  padding: 30px 0;
  background-color: #F8F9FA;
  border: 1px dashed #DCDFE6;
  border-radius: 4px;
}

.yo-file-uploader:not(.avatar-uploader) :deep(.ep-upload-dragger:hover) {
  border-color: var(--primary-color);
  background-color: #F0F7FF;
}

.yo-drag-inner {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.yo-drag-icon-img {
  width: 32px;
  height: 32px;
  margin-bottom: 8px;
}

.yo-drag-title {
  font-size: 14px;
  color: #303133;
  line-height: 20px;
  margin-bottom: 4px;
}

.yo-drag-sub {
  font-size: 12px;
  color: #909399;
  line-height: 18px;
}

.video-player-container {
  width: 100%;
  height: 450px;
  background-color: #000;
  border-radius: 4px;
  overflow: hidden;
}

:deep(.ep-dialog__body) {
  padding: 0;
}
.yo-file-upload-btn {
    width: fit-content;
}
</style>

<style lang="scss">
/* 配合 layout="inline" 使用，加在 ep-form-item 上 */
.yo-file-inline-item {
  .ep-form-item__label {
    width: auto !important;
    padding-right: 8px;
  }

  .ep-form-item__content {
    margin-left: 0 !important;
    flex: 1;
    min-width: 0;
  }
}
</style>
