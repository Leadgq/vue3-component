/**
 * 轻量颜色工具：解析 / 混色 / 生成主题色阶
 * 混色规则对齐 Element Plus（mix white/black）
 */

function clamp(n, min = 0, max = 255) {
  return Math.min(max, Math.max(min, Math.round(n)))
}

/**
 * @param {string} input
 * @returns {{ r: number, g: number, b: number } | null}
 */
export function parseColor(input) {
  if (!input || typeof input !== 'string') return null
  const value = input.trim()

  const hex = value.match(/^#([0-9a-f]{3}|[0-9a-f]{6}|[0-9a-f]{8})$/i)
  if (hex) {
    let h = hex[1]
    if (h.length === 3) {
      h = h.split('').map((c) => c + c).join('')
    } else if (h.length === 8) {
      h = h.slice(0, 6)
    }
    return {
      r: parseInt(h.slice(0, 2), 16),
      g: parseInt(h.slice(2, 4), 16),
      b: parseInt(h.slice(4, 6), 16),
    }
  }

  const rgb = value.match(/^rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)/i)
  if (rgb) {
    return {
      r: clamp(Number(rgb[1])),
      g: clamp(Number(rgb[2])),
      b: clamp(Number(rgb[3])),
    }
  }

  return null
}

export function toHex({ r, g, b }) {
  const h = (n) => clamp(n).toString(16).padStart(2, '0')
  return `#${h(r)}${h(g)}${h(b)}`
}

/**
 * Sass color.mix(c1, c2, weight%)：weight 为第一种颜色的占比
 * @param {{r:number,g:number,b:number}} c1
 * @param {{r:number,g:number,b:number}} c2
 * @param {number} weight 0-100
 */
export function mix(c1, c2, weight = 50) {
  const w = Math.min(100, Math.max(0, weight)) / 100
  const n = 1 - w
  return {
    r: c1.r * w + c2.r * n,
    g: c1.g * w + c2.g * n,
    b: c1.b * w + c2.b * n,
  }
}

const WHITE = { r: 255, g: 255, b: 255 }
const BLACK = { r: 0, g: 0, b: 0 }

/** @typedef {'primary' | 'success' | 'warning' | 'danger'} SemanticType */

/**
 * 由单个语义色生成完整色阶（对齐 theme.scss + Element Plus）
 * @param {SemanticType} type
 * @param {string} color
 * @returns {Record<string, string> | null}
 */
export function generateSemanticPalette(type, color) {
  const base = parseColor(color)
  if (!base) return null

  const light = (level) => toHex(mix(WHITE, base, level * 10))
  const dark = (level) => toHex(mix(BLACK, base, level * 10))
  const hex = toHex(base)

  return {
    [`${type}-color`]: hex,
    [`${type}-color-dark`]: dark(2),
    [`${type}-color-light`]: light(2),
    [`${type}-color-light-2`]: light(3),
    [`${type}-color-light-3`]: light(4),
    [`${type}-color-light-4`]: light(5),
    [`${type}-color-light-5`]: light(7),
    [`${type}-color-disabled`]: light(4),
    // Element Plus
    [`ep-color-${type}`]: hex,
    [`ep-color-${type}-dark-2`]: dark(2),
    [`ep-color-${type}-light-3`]: light(3),
    [`ep-color-${type}-light-5`]: light(5),
    [`ep-color-${type}-light-7`]: light(7),
    [`ep-color-${type}-light-8`]: light(8),
    [`ep-color-${type}-light-9`]: light(9),
  }
}

/**
 * @param {string} primary
 * @returns {Record<string, string> | null}
 */
export function generatePrimaryPalette(primary) {
  return generateSemanticPalette('primary', primary)
}

/** 默认字号（与 theme.scss 一致） */
export const DEFAULT_FONT_SIZE = {
  sm: 12,
  base: 14,
  lg: 16,
  xl: 28,
}

/**
 * 规范化字号配置
 * - number：以 base 为基准等比缩放
 * - object：按 key 覆盖（sm/base/lg/xl）
 * @param {number | Record<string, number|string>} fontSize
 * @returns {Record<string, string> | null}
 */
export function generateFontSizeVars(fontSize) {
  if (fontSize == null) return null

  if (typeof fontSize === 'number' && Number.isFinite(fontSize) && fontSize > 0) {
    const scale = fontSize / DEFAULT_FONT_SIZE.base
    return {
      'font-size-sm': `${Math.round(DEFAULT_FONT_SIZE.sm * scale)}px`,
      'font-size-base': `${Math.round(fontSize)}px`,
      'font-size-lg': `${Math.round(DEFAULT_FONT_SIZE.lg * scale)}px`,
      'font-size-xl': `${Math.round(DEFAULT_FONT_SIZE.xl * scale)}px`,
      'ep-font-size-extra-small': `${Math.round(DEFAULT_FONT_SIZE.sm * scale)}px`,
      'ep-font-size-base': `${Math.round(fontSize)}px`,
      'ep-font-size-medium': `${Math.round(DEFAULT_FONT_SIZE.lg * scale)}px`,
      'ep-font-size-large': `${Math.round(DEFAULT_FONT_SIZE.xl * scale * 0.65)}px`,
      'ep-font-size-extra-large': `${Math.round(DEFAULT_FONT_SIZE.xl * scale)}px`,
    }
  }

  if (typeof fontSize === 'object') {
    const toPx = (v, fallback) => {
      if (v == null) return `${fallback}px`
      if (typeof v === 'number') return `${v}px`
      return String(v).endsWith('px') ? String(v) : `${v}px`
    }
    const sm = toPx(fontSize.sm, DEFAULT_FONT_SIZE.sm)
    const base = toPx(fontSize.base, DEFAULT_FONT_SIZE.base)
    const lg = toPx(fontSize.lg, DEFAULT_FONT_SIZE.lg)
    const xl = toPx(fontSize.xl, DEFAULT_FONT_SIZE.xl)
    return {
      'font-size-sm': sm,
      'font-size-base': base,
      'font-size-lg': lg,
      'font-size-xl': xl,
      'ep-font-size-extra-small': sm,
      'ep-font-size-base': base,
      'ep-font-size-medium': lg,
      'ep-font-size-large': xl,
      'ep-font-size-extra-large': xl,
    }
  }

  return null
}
