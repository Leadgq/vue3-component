import defaultBlue from './defaultBlue'
import businessGreen from './businessGreen'
import vitalityOrange from './vitalityOrange'

/**
 * 主题注册表
 * 新产品主题：新建 presets/xxx.js（primary 必填），再 import 加入数组
 */
export const themePresets = [defaultBlue, businessGreen, vitalityOrange]

export { defaultBlue, businessGreen, vitalityOrange }
