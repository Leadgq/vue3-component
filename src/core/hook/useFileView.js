import { render, createVNode } from "vue";
import { YoFileView } from "../../businessComponents/index.js";

export function useFileView(container) {
    const vNode = createVNode(YoFileView)
    render(vNode, container || document.body)
    return {
        previewFile: vNode.component?.exposed?.previewFile,
        downLoadFille: vNode.component?.exposed?.downLoadFille
    }
}
