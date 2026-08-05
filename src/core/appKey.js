/**
 * 应用级唯一标识管理
 * 独立模块，避免循环依赖
 */

let _libAppKey = ''

/**
 * 获取当前应用的唯一 Key
 * 需要在 install() 之后调用才有值
 */
export const getLibAppKey = () => _libAppKey

/**
 * 初始化 appKey（在 install 时调用）
 */
export const initLibAppKey = () => {
  const appIdentifier = window.__INJECTED_PUBLIC_PATH_BY_QIANKUN__
    ?? window.location.origin

  const storageKey = `__lib_app_key__${appIdentifier}`

  let appKey = localStorage.getItem(storageKey)
  if (!appKey) {
    appKey = crypto.randomUUID()
    localStorage.setItem(storageKey, appKey)
  }

  _libAppKey = appKey
}
