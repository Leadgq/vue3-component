import iconAudio from '../assets/audio.png'
import iconExcel from '../assets/excel.png'
import iconImage from '../assets/image.png'
import iconMp4 from '../assets/mp4.png'
import iconPdf from '../assets/pdf.png'
import iconPpt from '../assets/ppt.png'
import iconText from '../assets/text.png'
import iconWord from '../assets/world.png'
import iconZip from '../assets/zip.png'
import iconEmty from '../assets/emty.png'

const IMAGE_MIMES = ['image/png', 'image/jpeg', 'image/gif', 'image/tiff', 'image/x-icon']
const VIDEO_EXTS = ['mp4', 'avi', 'rmvb', 'rm', 'flv', 'wmv', 'mkv', 'webm', 'mov']
const PREVIEW_MIMES = [
  'application/pdf',
  'application/msword',
  'application/vnd.ms-excel',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
]

const MIME_BY_EXT = {
  png: 'image/png',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  gif: 'image/gif',
  bmp: 'image/bmp',
  webp: 'image/webp',
  pdf: 'application/pdf',
  doc: 'application/msword',
  docx: 'application/msword',
  xls: 'application/vnd.ms-excel',
  xlsx: 'application/vnd.ms-excel',
  ppt: 'application/vnd.ms-powerpoint',
  pptx: 'application/vnd.ms-powerpoint',
  mp4: 'video/mp4',
  webm: 'video/webm',
  mov: 'video/mov',
  avi: 'video/avi',
  mkv: 'video/mkv',
  flv: 'video/flv',
  wmv: 'video/wmv',
}

const ICON_BY_EXT = {
  mp3: iconAudio, wav: iconAudio, wma: iconAudio, ogg: iconAudio, aac: iconAudio, flac: iconAudio,
  xls: iconExcel, xlsx: iconExcel, csv: iconExcel,
  png: iconImage, jpg: iconImage, jpeg: iconImage, gif: iconImage, bmp: iconImage,
  svg: iconImage, webp: iconImage, tiff: iconImage,
  mp4: iconMp4, avi: iconMp4, rmvb: iconMp4, rm: iconMp4, flv: iconMp4, wmv: iconMp4, mkv: iconMp4,
  pdf: iconPdf,
  ppt: iconPpt, pptx: iconPpt,
  txt: iconText, log: iconText, md: iconText,
  doc: iconWord, docx: iconWord,
  zip: iconZip, rar: iconZip, '7z': iconZip, tar: iconZip, gz: iconZip,
}

export function getFileExt(file) {
  const name = file?.name || file?.ItemName || file?.filepath || file?.Path || ''
  if (!name || !name.includes('.')) return ''
  return name.split('.').pop().toLowerCase()
}

export function inferMimeFromExt(ext) {
  return MIME_BY_EXT[ext] || ''
}

export function isImgType(filetype) {
  return IMAGE_MIMES.includes(filetype)
}

export function isVideoFile(file) {
  const type = (file?.type || '').toLowerCase()
  if (type.startsWith('video/')) return true
  return VIDEO_EXTS.includes(getFileExt(file))
}

export function canPreview(file) {
  return isImgType(file.type) || PREVIEW_MIMES.includes(file.type)
}

export function formatSize(size) {
  if (!size) return ''
  const numSize = Number(size)
  if (isNaN(numSize)) return ''
  if (numSize < 1024) return numSize + ' B'
  if (numSize < 1024 * 1024) return (numSize / 1024).toFixed(2) + ' KB'
  if (numSize < 1024 * 1024 * 1024) return (numSize / (1024 * 1024)).toFixed(2) + ' MB'
  return (numSize / (1024 * 1024 * 1024)).toFixed(2) + ' GB'
}

export function getFileIcon(file) {
  return ICON_BY_EXT[getFileExt(file)] || iconEmty
}
