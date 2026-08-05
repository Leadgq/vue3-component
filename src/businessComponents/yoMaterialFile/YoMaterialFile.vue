<template>
  <div class="yo-material-file">
    <el-form-item v-for="(item, index) in modelValue" :key="item.MaterialId || index" class="material-row"
      v-bind="attrs" :prop="parentProp ? `${parentProp}.${index}.Files` : ''"
      :rules="item.IsRequired ? [{ required: true, message: '请上传' + item.MaterialName, trigger: 'change' }] : []">
      <!-- 左侧: label -->
      <template #label>
        <div class="material-label-container">
          <span class="label-text">{{ item.MaterialName }}</span>
          <template v-if="item.ExcelTempId">
            <div v-for="(tempId, subIndex) in splitIds(item.ExcelTempId)" :key="tempId" class="template-down">
              <el-button type="link" size="small" class="template-btn" @click="handleDownloadTemplate(tempId, index)">
                模板下载 {{ splitIds(item.ExcelTempId).length > 1 ? (subIndex + 1) : '' }}
              </el-button>
            </div>
          </template>
        </div>
      </template>

      <!-- 右侧：文件内容 -->
      <div class="material-content">

        <!-- 合同签署模式 (Channel 10) -->
        <template v-if="signContractChannel === 10">
          <div class="contract-view-container">
            <el-button type="primary" size="small" @click="handleViewContract(index)">查看</el-button>
            <YoImg :ref="el => (contractPreviewRefs[index] = el)" :ids="splitIds(item.ExcelSignTempId)" :apiUrl="apiUrl"
              class="hidden-preview" />
          </div>
        </template>

        <template v-else-if="readOnly || item.isUpload === false || item.readOnly">
          <!-- 有文件：只读展示 -->
          <YoFile v-if="hasFiles(item)" v-bind="$attrs" :layout="layout" v-model:ids="item.Files"
            :fileLimit="item.MaxCount" :readOnly="true" :apiUrl="apiUrl" :isShowTip="false" class="inline-yo-file"
            :uploadType="item.UploadType" />
          <!-- 无文件：暂无文件提示 -->
          <div v-else class="no-file-tag">
            <el-icon class="no-file-icon">
              <InfoFilled />
            </el-icon>
            <span>暂无文件</span>
          </div>
        </template>

        <YoFile v-else v-bind="$attrs" :layout="layout" v-model:ids="item.Files" :fileLimit="item.MaxCount"
          :readOnly="false" :apiUrl="apiUrl" :isShowTip="false" :uploadBtnName="uploadBtnName"
          :uploadType="item.UploadType" :class="hasFiles(item) ? 'inline-yo-file' : ''" />

      </div>
      <FileView ref="fileViewRef"></FileView>
    </el-form-item>
  </div>
</template>

<script setup>
import { getCurrentInstance, ref, onBeforeUpdate, useAttrs, onMounted, useTemplateRef } from 'vue'
import YoFile from '../yoFile/yoFile.vue'
import YoImg from '../yoImg/yoImg.vue'
import { InfoFilled } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { useYoConfig } from '../../core/config'
import FileView from '../fileView/fileView.vue'

const config = useYoConfig()

const fileViewRef = useTemplateRef("fileViewRef")
defineOptions({ name: 'YoMaterialFile' })

const attrs = useAttrs()

const modelValue = defineModel({
  type: Array,
  default: () => []
})

const props = defineProps({
  readOnly: { type: Boolean, default: false },
  apiUrl: { type: String, default: '' },
  uploadBtnName: { type: String, default: '上传' },
  signContractChannel: { type: Number, default: 0 },
  fileUrl: { type: String, default: '' },
  api: { type: String, default: '' },
  layout: { type: String, default: 'horizontal' },
  parentProp: { type: String, default: '' },
  fileData: { type: Array, default: () => [] },
})

const { proxy } = getCurrentInstance()

const contractPreviewRefs = ref([])

onBeforeUpdate(() => {
  contractPreviewRefs.value = []
})

// ── 判断某条记录是否已有文件 ──────────────────────────────────
const hasFiles = (item) => {
  if (!item.Files) return false
  if (Array.isArray(item.Files)) return item.Files.length > 0
  return String(item.Files).split(',').filter(id => id.trim()).length > 0
}

// ── 模板下载 ──────────────────────────────────────────────────
const handleDownloadTemplate = async (id, index) => {
  if (!id) return
  try {
    const apiPath = `${props.apiUrl || config.attachApi}/api/Attach/GetAttachs`
    // 即使是单个 ID，接口通常也期望以数组形式发送
    const ids = Array.isArray(id) ? id : [id]
    const resp = await proxy.$http.post(apiPath, { ids })
    if (resp && resp.length > 0) {
      const { id: fileId, sign, timestamp, name } = resp[0]
      const base = props.apiUrl || config.attachApi
      triggerDownload(`${base}/api/Attach/Download?id=${fileId}&sign=${sign}&timestamp=${timestamp}`, name, index)
    } else {
      ElMessage.error('获取模板失败')
    }
  } catch (error) {
    console.error('Download template error:', error)
    ElMessage.error('下载遇到错误')
  }
}

const triggerDownload = (url, name, index) => {
  const currentFileRef = fileViewRef.value[index]
  currentFileRef.previewFile({
    src: url,
    fileName: name,
    down: true
  })
}

// ── 合同签署预览 ──────────────────────────────────────────────
const handleViewContract = (index) => {
  const refEl = contractPreviewRefs.value[index]
  if (refEl) {
    refEl.hanlderPreveFileList()
  } else {
    ElMessage.warning('暂无可查看的内容')
  }
}

// ── 工具函数 ──────────────────────────────────────────────────
const splitIds = (ids) => {
  if (!ids) return []
  if (Array.isArray(ids)) return ids
  return String(ids).split(',').filter(id => id.trim())
}

// ── 加载数据（通过 api/fileUrl 获取材料列表） ─────────────────
const loadData = async () => {
  const url = props.fileUrl || props.api
  if (!url) return
  try {
    const finalUrl = url.startsWith('/') ? url : '/' + url
    const requestUrl = `${props.apiUrl || config.attachApi}${finalUrl}`
    const resp = await proxy.$http.get(requestUrl)
    modelValue.value = Array.isArray(resp) ? resp : (resp?.Data || resp?.data || [])
  } catch (error) {
    console.error('Fetch material list error:', error)
  }
}

onMounted(() => {
  if (props.fileData.length > 0) {
    modelValue.value = props.fileData
    return
  }
  if (!modelValue.value || modelValue.value.length === 0) {
    loadData()
  }
})
</script>

<style scoped lang="scss">
.yo-material-file {
  width: 100%;
  display: flex;
  flex-direction: column;
  background-color: #fff;

  .material-row {
    padding: 8px 0;

    .material-label-container {
      display: flex;
      flex-direction: column;
      line-height: 1.4;
      margin-top: 4px;

      .label-text {
        // font-weight: bold;
        color: #6a7998;
      }

      .template-down {
        margin-top: 2px;
      }

      .template-btn {
        padding: 0;
        height: auto;
        font-size: 12px;
        color: #409eff;
        justify-content: flex-start;
        border: none;
      }
    }

    .material-content {
      width: 100%;
      min-height: 32px;
      display: flex;
      align-items: center;
    }
  }

  /* 覆盖嵌套 yo-file 的列表样式 */
  .inline-yo-file ::v-deep {
    .yo-file-list-wrapper {
      margin-top: 0;
    }

    .yo-file-item {
      background-color: #f5f7fa;
      border-radius: 4px;
      padding: 6px 16px;
      margin-bottom: 4px;
      display: flex;
      align-items: center;
      transition: background-color 0.2s;

      &:hover {
        background-color: #edf2f7;
      }

      &:last-child {
        margin-bottom: 0;
      }

      .file-info-container {
        flex: 1;
        display: flex;
        align-items: center;

        .file-icon-img {
          width: 18px;
          height: 18px;
          margin-right: 10px;
        }

        .file-name {
          color: #333;
          font-size: 14px;
          max-width: 400px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .file-size {
          color: #999;
          font-size: 12px;
          margin-left: 8px;
        }
      }

      .file-actions {
        display: flex;
        gap: 16px;

        .el-link {
          font-size: 13px;
          font-weight: normal;

          &.el-link--success {
            color: #67c23a;
          }

          &.el-link--primary {
            color: #409eff;
          }

          &::before {
            content: '[';
            color: #909399;
            margin-right: 2px;
          }

          &::after {
            content: ']';
            color: #909399;
            margin-left: 2px;
          }

          &:hover {
            opacity: 0.8;
          }
        }
      }
    }

    .el-upload {
      margin-bottom: 0;
    }
  }

  /* "暂无文件"标签 */
  .no-file-tag {
    display: inline-flex;
    align-items: center;
    padding: 2px 10px;
    background-color: #f0f2f5;
    color: #909399;
    border-radius: 4px;
    font-size: 13px;
    gap: 6px;

    .no-file-icon {
      font-size: 14px;
      color: #b0b4bb;
    }
  }

  .hidden-preview {
    height: 0;
    overflow: hidden;
    position: absolute;
    pointer-events: none;
  }
}
</style>
