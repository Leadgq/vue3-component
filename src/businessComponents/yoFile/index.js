import YoFile from './yoFile.vue'

YoFile.install = function (app) {
  app.component(YoFile.name || 'YoFile', YoFile)
}

export { YoFile }
export default YoFile
