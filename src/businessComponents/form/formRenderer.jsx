import { cloneVNode } from 'vue'
import {
    ElDatePicker,
    ElInputNumber,
    ElSwitch
} from 'element-plus'
import YoInput from "../../components/input/input.vue"
import YoSelect from "../../components/select/select.vue"
import YoRadioGroup from "../../components/radio/radioGroup.vue"
import YoFile from "../yoFile/yoFile.vue"
import YoImage from "../yoImg/yoImg.vue"
import { YoUnitInput } from "../../components/unitInput"
import { YoTitle } from "../title"
import { YoContent } from "../content"
import { YoMaterialFile } from "../yoMaterialFile"

export const componentMap = {
    input: YoInput,
    select: YoSelect,
    date: ElDatePicker,
    number: ElInputNumber,
    switch: ElSwitch,
    radio: YoRadioGroup,
    file: YoFile,
    image: YoImage,
    unitInput: YoUnitInput,
    groupTitle: YoTitle,
    group: YoContent,
    materialFile: YoMaterialFile
}

export const getComponent = (type) => {
    return componentMap[type] || componentMap.input
}

// 内部渲染函数组件
export const RenderCell = (props, { attrs }) => {
    const vnode = props.render(props.model, props.item)
    if (vnode && (attrs.style || attrs.class)) {
        return cloneVNode(vnode, {
            style: attrs.style,
            class: attrs.class
        }, true)
    }
    return vnode
}

export const isSelectKind = (type) => ['select', 'radio', 'checkbox', 'date', 'file', 'image', 'unitInput', 'materialFile'].includes(type);
export const getVerb = (type) => isSelectKind(type) ? '请选择' : '请输入';

const evaluate = (val, model) => typeof val === 'function' ? val(model) : val;

const evaluteApi = (val, model) => typeof val === 'function' ? val(model) : val;


export const FieldItem = (props) => {
    const { model, item } = props;
    const Comp = getComponent(item.type);
    const verb = getVerb(item.type);
    const placeholder = item.placeholder || `${verb}${item.label || ''}`;
    const style = Object.assign(
        {},
        item.style || { flex: 1, width: '100%' },
        item.props?.width ? { width: item.props.width, flex: 'none' } : {}
    );

    const events = item.events || {};
    const modelProp = item.modelProp || 'modelValue';
    const updateEvent = `onUpdate:${modelProp}`;
    const unitProp = item.unitProp;
    const unitUpdateEvent = `onUpdate:unit`;

    const evaluatedProps = evaluate(item.props, model) || {};
    const evaluatedOptions = evaluate(item.options, model);
    const api = evaluteApi(item.api, model)
    return (
        <Comp
            {...{ [modelProp]: model[item.prop] }}
            {...{ [updateEvent]: (val) => (model[item.prop] = val) }}
            {...(unitProp ? { unit: model[unitProp] } : {})}
            {...(unitProp ? { [unitUpdateEvent]: (val) => (model[unitProp] = val) } : {})}
            placeholder={placeholder}
            size="default"
            style={style}
            options={evaluatedOptions}
            api={api}
            enumName={item.enumName}
            keyValue={item.keyValue}
            parentProp={item.prop}
            {...evaluatedProps}
            {...events}
        />
    );
};
