/**
 * 默认蓝 —— 色值由产品提供，写死在主题文件中（不自动推算）
 * 与 themes/theme.scss 默认主色一致
 */
export default {
  name: '默认蓝',
  value: 'defaultBlue',
  // 切换主题时写入的 CSS 变量（不含 -- 前缀）
  colors: {
    'primary-color': '#4d6de6',
    'primary-color-dark': '#2B4DCD',
    'primary-color-light': '#6e80f7',
    'primary-color-light-2': '#8fadfc',
    'primary-color-light-3': '#acc4fa',
    'primary-color-light-4': '#c7dafa',
    'primary-color-light-5': '#e6eeff',
    'primary-color-disabled': '#ADBEFF',
    'title-color-level-2': '#4D6DE6',
    'title-color-level-3': '#989899',
    "title-color-level-1": "#333",
    // Element Plus
    'ep-color-primary': '#4d6de6',
    'ep-color-primary-dark-2': '#2B4DCD',
    'ep-color-primary-light-3': '#6e80f7',
    'ep-color-primary-light-5': '#8fadfc',
    'ep-color-primary-light-7': '#acc4fa',
    'ep-color-primary-light-8': '#c7dafa',
    'ep-color-primary-light-9': '#e6eeff',
  },
}
