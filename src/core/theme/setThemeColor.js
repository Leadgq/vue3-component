import {
  generateFontSizeVars,
  generatePrimaryPalette,
  generateSemanticPalette,
  parseColor,
} from './color'

const SEMANTIC_TYPES = ['primary', 'success', 'warning', 'danger']

/**
 * @param {HTMLElement} target
 * @param {Record<string, string>} vars
 */
function applyCssVars(target, vars) {
  Object.entries(vars).forEach(([key, value]) => {
    if (value == null || value === '') return
    target.style.setProperty(`--${key}`, value)
  })
}

/**
 * 统一设置主题：语义色 + 字号。
 * 宿主调色板选色后调用即可，未传的项保持默认。
 *
 * @param {object} theme
 * @param {string} [theme.primary] 主色
 * @param {string} [theme.success] 成功色
 * @param {string} [theme.warning] 警告色
 * @param {string} [theme.danger] 危险色
 * @param {number | { sm?: number|string, base?: number|string, lg?: number|string, xl?: number|string }} [theme.fontSize]
 *   传 number 时按 base 等比缩放；传对象可分别指定 sm/base/lg/xl
 * @param {object} [options]
 * @param {HTMLElement} [options.target=document.documentElement]
 * @param {Record<string, string>} [options.overrides] 覆盖自动生成的个别变量
 * @returns {Record<string, string>}
 *
 * @example
 * import { setTheme } from 'yo-pc-ui-component'
 *
 * setTheme({
 *   primary: '#4d6de6',
 *   success: '#42ba5b',
 *   warning: '#ed892f',
 *   danger: '#e85050',
 *   fontSize: 14, // 或 { sm: 12, base: 14, lg: 16, xl: 28 }
 * })
 */
export function setTheme(theme = {}, options = {}) {
  if (typeof document === 'undefined') return {}

  const { target = document.documentElement, overrides = {} } = options
  /** @type {Record<string, string>} */
  const applied = {}

  SEMANTIC_TYPES.forEach((type) => {
    const color = theme[type]
    if (!color) return
    const palette = generateSemanticPalette(type, color)
    if (!palette) {
      console.warn(`[yo-pc-ui] setTheme: invalid ${type} color`, color)
      return
    }
    Object.assign(applied, palette)
  })

  if (theme.primary && applied['primary-color'] && !overrides['title-color-level-2']) {
    applied['title-color-level-2'] = applied['primary-color']
  }

  const fontVars = generateFontSizeVars(theme.fontSize)
  if (fontVars) Object.assign(applied, fontVars)

  Object.assign(applied, overrides)
  applyCssVars(target, applied)
  return applied
}

/**
 * 仅改主色（兼容旧用法）
 * @param {string} primaryColor
 * @param {object} [options]
 */
export function setThemeColor(primaryColor, options = {}) {
  return setTheme({ primary: primaryColor }, options)
}

/**
 * 仅改字号
 * @param {number | { sm?: number|string, base?: number|string, lg?: number|string, xl?: number|string }} fontSize
 * @param {object} [options]
 * @param {HTMLElement} [options.target]
 * @param {Record<string, string>} [options.overrides]
 */
export function setFontSize(fontSize, options = {}) {
  return setTheme({ fontSize }, options)
}

/**
 * 单独改某一类语义色
 * @param {'primary'|'success'|'warning'|'danger'} type
 * @param {string} color
 * @param {object} [options]
 */
export function setSemanticColor(type, color, options = {}) {
  if (!SEMANTIC_TYPES.includes(type)) {
    console.warn('[yo-pc-ui] setSemanticColor: unknown type', type)
    return {}
  }
  return setTheme({ [type]: color }, options)
}

export {
  generateFontSizeVars,
  generatePrimaryPalette,
  generateSemanticPalette,
  parseColor,
} from './color'
