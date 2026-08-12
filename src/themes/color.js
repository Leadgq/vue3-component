/**
 * 与 Element Plus 一致：mix(white/black, base, weight%)
 * weight 为第一种颜色的占比
 */
export function mix(hex1, hex2, weight) {
  const w = Math.min(100, Math.max(0, weight)) / 100
  const a = parseHex(hex1)
  const b = parseHex(hex2)
  if (!a || !b) return hex2
  const r = Math.round(a.r * w + b.r * (1 - w))
  const g = Math.round(a.g * w + b.g * (1 - w))
  const bl = Math.round(a.b * w + b.b * (1 - w))
  return `#${toHex(r)}${toHex(g)}${toHex(bl)}`
}

function parseHex(hex) {
  if (!hex || typeof hex !== 'string') return null
  let h = hex.trim().replace('#', '')
  if (h.length === 3) h = h.split('').map((c) => c + c).join('')
  if (h.length !== 6) return null
  return {
    r: parseInt(h.slice(0, 2), 16),
    g: parseInt(h.slice(2, 4), 16),
    b: parseInt(h.slice(4, 6), 16),
  }
}

function toHex(n) {
  return n.toString(16).padStart(2, '0')
}

/**
 * 由主色生成业务 + EP 主色相关 CSS 变量（不含 -- 前缀）
 * @param {{ primary: string, primaryDark?: string, primaryDisabled?: string }} preset
 */
export function buildPrimaryVars({ primary, primaryDark, primaryDisabled }) {
  const dark = primaryDark || mix('#000000', primary, 20)
  const disabled = primaryDisabled || mix('#ffffff', primary, 50)
  return {
    'primary-color': primary,
    'primary-color-dark': dark,
    'primary-color-disabled': disabled,
    'title-color-level-2': primary,
    'ep-color-primary': primary,
    'ep-color-primary-dark-2': dark,
    'ep-color-primary-light-3': mix('#ffffff', primary, 30),
    'ep-color-primary-light-5': mix('#ffffff', primary, 50),
    'ep-color-primary-light-7': mix('#ffffff', primary, 70),
    'ep-color-primary-light-8': mix('#ffffff', primary, 80),
    'ep-color-primary-light-9': mix('#ffffff', primary, 90),
  }
}
