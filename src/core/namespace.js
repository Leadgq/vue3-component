/** Element Plus DOM/CSS 前缀，须与 styles/element/index.scss 中 $namespace 一致 */
export const YO_EP_NAMESPACE = 'ep'

/** 自研业务组件 BEM 前缀：yo-header、yo-header__action、yo-header--float */
export const YO_NAMESPACE = 'yo'

export const statePrefix = 'is-'

function bem(namespace, block, blockSuffix = '', element = '', modifier = '') {
  let cls = `${namespace}-${block}`
  if (blockSuffix) cls += `-${blockSuffix}`
  if (element) cls += `__${element}`
  if (modifier) cls += `--${modifier}`
  return cls
}

/**
 * 自研组件 class 生成：ns.b() / ns.e('action') / ns.m('plain') / ns.is('disabled')
 * EP 二开组件不要用这个，继续走 .ep-* 。
 */
export function useNamespace(block) {
  const namespace = YO_NAMESPACE
  const b = (blockSuffix = '') => bem(namespace, block, blockSuffix, '', '')
  const e = (element) => (element ? bem(namespace, block, '', element, '') : '')
  const m = (modifier) => (modifier ? bem(namespace, block, '', '', modifier) : '')
  const is = (name, state = true) => (name && state ? `${statePrefix}${name}` : '')
  return { namespace, b, e, m, is }
}
