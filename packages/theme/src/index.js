import { themePresets } from './presets/index.js'
import { buildPrimaryVars } from './color.js'

const DEFAULT_THEME_VALUE = 'defaultBlue'
let currentThemeValue = DEFAULT_THEME_VALUE

export function getTheme() {
  return themePresets.map(({ name, value }) => ({ name, value }))
}

export function setTheme(themeValue = DEFAULT_THEME_VALUE, options = {}) {
  if (typeof document === 'undefined') return null

  const value = themeValue || DEFAULT_THEME_VALUE
  const preset = themePresets.find((item) => item.value === value)
    || themePresets.find((item) => item.value === DEFAULT_THEME_VALUE)

  if (!preset || !preset.primary) return null

  const target = options.target || document.documentElement
  const vars = buildPrimaryVars(preset)
  Object.entries(vars).forEach(([key, cssValue]) => {
    target.style.setProperty(`--${key}`, cssValue)
  })

  currentThemeValue = preset.value
  return { name: preset.name, value: preset.value }
}

export function getCurrentTheme() {
  return currentThemeValue
}

export { themePresets, buildPrimaryVars }
