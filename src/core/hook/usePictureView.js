import { render } from "vue";
import { YoPictureView } from "../../businessComponents";
import { createVNode } from "vue";

export function usePictureView(container) {
    const vNode = createVNode(YoPictureView)
    render(vNode, container || document.body)
    return {
        showPictures: vNode.component?.exposed?.showPictures,
        showPicture: vNode.component?.exposed?.showPicture,
        destroyViewJs: vNode.component?.exposed?.destroyViewJs,
    }
}