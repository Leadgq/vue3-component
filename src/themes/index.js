import { themePresets } from './presets'

let currentThemeValue = 'defaultBlue'
const DEFAULT_THEME_VALUE = 'defaultBlue'

/**
 * 获取所有可选主题
 * @returns {{ name: string, value: string }[]}
 *
 * @example
 * import { getTheme } from 'yo-pc-ui-component'
 * const themeList = getTheme()
 * // [{ name: '默认蓝', value: 'defaultBlue' }, ...]
 */
export function getTheme() {
  return themePresets.map(({ name, value }) => ({ name, value }))
}

/**
 * 按主题 value 切换：把产品提供的 colors 写入 CSS 变量
 * 不传 / 空字符串时回退默认蓝
 * @param {string} [themeValue='defaultBlue']
 * @param {object} [options]
 * @param {HTMLElement} [options.target=document.documentElement]
 * @returns {{ name: string, value: string } | null}
 *
 * @example
 * setTheme()
 * setTheme('defaultBlue')
 */
export function setTheme(themeValue = DEFAULT_THEME_VALUE, options = {}) {
  if (typeof document === 'undefined') return null

  const value = themeValue || DEFAULT_THEME_VALUE
  let preset = themePresets.find((t) => t.value === value)
  if (!preset) {
    console.warn('[yo-pc-ui] setTheme: unknown theme', themeValue, '→ fallback', DEFAULT_THEME_VALUE)
    preset = themePresets.find((t) => t.value === DEFAULT_THEME_VALUE)
  }
  if (!preset?.colors) {
    console.warn('[yo-pc-ui] setTheme: theme colors missing', value)
    return null
  }

  const { target = document.documentElement } = options
  Object.entries(preset.colors).forEach(([key, cssValue]) => {
    if (cssValue == null || cssValue === '') return
    target.style.setProperty(`--${key}`, cssValue)
  })

  currentThemeValue = preset.value
  return { name: preset.name, value: preset.value }
}

/** 当前已应用的主题 value */
export function getCurrentTheme() {
  return currentThemeValue
}

export { themePresets }
