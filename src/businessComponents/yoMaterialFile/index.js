import YoMaterialFile from './YoMaterialFile.vue'

YoMaterialFile.install = function (app) {
  app.component(YoMaterialFile.name || 'YoMaterialFile', YoMaterialFile)
}

export { YoMaterialFile }
export default YoMaterialFile
