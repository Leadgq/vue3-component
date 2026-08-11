import defaultBlue from './defaultBlue'

/**
 * 主题注册表
 * 产品给新主题色值后：
 * 1. 在 presets/ 新建 xxx.js，按 defaultBlue 结构填入 colors
 * 2. 在此 import 并加入 themePresets
 */
export const themePresets = [defaultBlue]

export { defaultBlue }
