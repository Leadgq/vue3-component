import { themePresets } from './presets'
import { buildPrimaryVars } from './color'

let currentThemeValue = 'defaultBlue'
const DEFAULT_THEME_VALUE = 'defaultBlue'

/**
 * 获取所有可选主题
 * @returns {{ name: string, value: string }[]}
 */
export function getTheme() {
  return themePresets.map(({ name, value }) => ({ name, value }))
}

/**
 * 按主题 value 切换主色（浅色阶自动生成并写入 --ep-color-primary*）
 * @param {string} [themeValue='defaultBlue']
 * @param {{ target?: HTMLElement }} [options]
 */
export function setTheme(themeValue = DEFAULT_THEME_VALUE, options = {}) {
  if (typeof document === 'undefined') return null

  const value = themeValue || DEFAULT_THEME_VALUE
  let preset = themePresets.find((t) => t.value === value)
  if (!preset) {
    console.warn('[yo-pc-ui] setTheme: unknown theme', themeValue, '→ fallback', DEFAULT_THEME_VALUE)
    preset = themePresets.find((t) => t.value === DEFAULT_THEME_VALUE)
  }
  if (!preset?.primary) {
    console.warn('[yo-pc-ui] setTheme: theme primary missing', value)
    return null
  }

  const { target = document.documentElement } = options
  const vars = buildPrimaryVars(preset)
  Object.entries(vars).forEach(([key, cssValue]) => {
    target.style.setProperty(`--${key}`, cssValue)
  })

  currentThemeValue = preset.value
  return { name: preset.name, value: preset.value }
}

/** 当前已应用的主题 value */
export function getCurrentTheme() {
  return currentThemeValue
}

export { themePresets, buildPrimaryVars }
