import { reactive } from 'vue'
import { zhCn, en, ja, ko } from 'element-plus/es/locales.mjs'
import zhCnMessages from './zh-cn'
import enMessages from './en'

export { zhCn, en, ja, ko }

export const localeList = [
  { language: '中文', value: 'zh-cn' },
  { language: 'English', value: 'en' },
]

const epLocaleMap = {
  'zh-cn': zhCn,
  zh: zhCn,
  en,
  ja,
  ko,
}

const messageMap = {
  'zh-cn': zhCnMessages,
  zh: zhCnMessages,
  en: enMessages,
}

const DEFAULT_LOCALE = 'zh-cn'

/** 当前语言（组件读这个，ConfigProvider 绑 ep） */
export const localeState = reactive({
  value: DEFAULT_LOCALE,
  ep: zhCn,
  messages: zhCnMessages,
})

function resolveLocale(value) {
  const key = (value || DEFAULT_LOCALE).toLowerCase()
  if (epLocaleMap[key]) return key
  console.warn('[yo-pc-ui] setLocale: unknown locale', value, '→ fallback', DEFAULT_LOCALE)
  return DEFAULT_LOCALE
}

/**
 * 切换语言：EP 文案 + 组件库自己的文案
 * @param {string} [value='zh-cn'] zh-cn | en
 * @returns {{ language: string, value: string }}
 */
export function setLocale(value = DEFAULT_LOCALE) {
  const key = resolveLocale(value)
  localeState.value = key
  localeState.ep = epLocaleMap[key]
  localeState.messages = messageMap[key] || zhCnMessages
  return localeList.find((item) => item.value === key) || localeList[0]
}

export function getLocale() {
  return localeState.value
}

export function getLocaleList() {
  return localeList.map(({ language, value }) => ({ language, value }))
}

/**
 * @param {string} key 如 'file.preview'
 * @param {Record<string, string|number>} [params]
 */
export function t(key, params) {
  const text = String(key)
    .split('.')
    .reduce((obj, k) => (obj == null ? obj : obj[k]), localeState.messages)
  const str = text == null || text === '' ? key : String(text)
  if (!params) return str
  return str.replace(/\{(\w+)\}/g, (_, name) => (params[name] == null ? '' : String(params[name])))
}
