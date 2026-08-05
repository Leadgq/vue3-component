import YoButton from "./button/button.vue";
import YoInput from "./input/input.vue";
import YoSearch from "./search/search.vue";
import YoSelect from "./select/select.vue";
import { YoUnitInput } from "./unitInput";
import { YoRadioGroup, YoRadioButton, YoRadio } from "./radio";
import YoEmpty from "./empty/empty.vue";
import {
  YoTitle, YoPictureView, YoFileView, YoContent
  , YoHeader,
  YoDetailCol,
  YoTable,
  YoQuery
  , YoGrid,
  YoForm,
  YoTree,
  YoImg,
  YoFile,
  YoMaterialFile
} from "../businessComponents";
import "./style/index.scss";
import * as ElementPlus from 'element-plus'
import { initLibAppKey } from '../core/appKey.js'
import { YO_CONFIG_KEY } from '../core/config.js'
export { getLibAppKey } from '../core/appKey.js'

// --- Generated Static Exports (Aliased from ElementPlus) ---
export const YoAffix = ElementPlus.ElAffix;
export const YoAlert = ElementPlus.ElAlert;
export const YoAnchor = ElementPlus.ElAnchor;
export const YoAnchorLink = ElementPlus.ElAnchorLink;
export const YoAside = ElementPlus.ElAside;
export const YoAutoResizer = ElementPlus.ElAutoResizer;
export const YoAutocomplete = ElementPlus.ElAutocomplete;
export const YoAvatar = ElementPlus.ElAvatar;
export const YoAvatarGroup = ElementPlus.ElAvatarGroup;
export const YoBacktop = ElementPlus.ElBacktop;
export const YoBadge = ElementPlus.ElBadge;
export const YoBreadcrumb = ElementPlus.ElBreadcrumb;
export const YoBreadcrumbItem = ElementPlus.ElBreadcrumbItem;
// export const YoButton = ElementPlus.ElButton; // 使用本地二开版本
export const YoButtonGroup = ElementPlus.ElButtonGroup;
export const YoCalendar = ElementPlus.ElCalendar;
export const YoCard = ElementPlus.ElCard;
export const YoCarousel = ElementPlus.ElCarousel;
export const YoCarouselItem = ElementPlus.ElCarouselItem;
export const YoCascader = ElementPlus.ElCascader;
export const YoCascaderPanel = ElementPlus.ElCascaderPanel;
export const YoCheckTag = ElementPlus.ElCheckTag;
export const YoCheckbox = ElementPlus.ElCheckbox;
export const YoCheckboxButton = ElementPlus.ElCheckboxButton;
export const YoCheckboxGroup = ElementPlus.ElCheckboxGroup;
export const YoCol = ElementPlus.ElCol;
export const YoCollapse = ElementPlus.ElCollapse;
export const YoCollapseItem = ElementPlus.ElCollapseItem;
export const YoCollapseTransition = ElementPlus.ElCollapseTransition;
export const YoColorPicker = ElementPlus.ElColorPicker;
export const YoColorPickerPanel = ElementPlus.ElColorPickerPanel;
export const YoConfigProvider = ElementPlus.ElConfigProvider;
export const YoContainer = ElementPlus.ElContainer;
export const YoCountdown = ElementPlus.ElCountdown;
export const YoDatePicker = ElementPlus.ElDatePicker;
export const YoDatePickerPanel = ElementPlus.ElDatePickerPanel;
export const YoDescriptions = ElementPlus.ElDescriptions;
export const YoDescriptionsItem = ElementPlus.ElDescriptionsItem;
export const YoDialog = ElementPlus.ElDialog;
export const YoDivider = ElementPlus.ElDivider;
export const YoDrawer = ElementPlus.ElDrawer;
export const YoDropdown = ElementPlus.ElDropdown;
export const YoDropdownItem = ElementPlus.ElDropdownItem;
export const YoDropdownMenu = ElementPlus.ElDropdownMenu;
// export const YoEmpty = ElementPlus.ElEmpty; // 使用本地二开版本
export const YoFooter = ElementPlus.ElFooter;
// export const YoForm = ElementPlus.ElForm;
export const YoFormItem = ElementPlus.ElFormItem;
// export const YoHeader = ElementPlus.ElHeader; // 使用业务组件库版本
export const YoIcon = ElementPlus.ElIcon;
export const YoImage = ElementPlus.ElImage;
export const YoImageViewer = ElementPlus.ElImageViewer;
export const YoInfiniteScroll = ElementPlus.ElInfiniteScroll;
// export const YoInput = ElementPlus.ElInput; // 使用本地二开版本
export const YoInputNumber = ElementPlus.ElInputNumber;
export const YoInputTag = ElementPlus.ElInputTag;
export const YoLink = ElementPlus.ElLink;
export const YoLoading = ElementPlus.ElLoading;
export const YoLoadingDirective = ElementPlus.ElLoadingDirective;
export const YoLoadingService = ElementPlus.ElLoadingService;
export const YoMain = ElementPlus.ElMain;
export const YoMention = ElementPlus.ElMention;
export const YoMenu = ElementPlus.ElMenu;
export const YoMenuItem = ElementPlus.ElMenuItem;
export const YoMenuItemGroup = ElementPlus.ElMenuItemGroup;
export const YoMessage = ElementPlus.ElMessage;
export const YoMessageBox = ElementPlus.ElMessageBox;
export const YoNotification = ElementPlus.ElNotification;
export const YoOption = ElementPlus.ElOption;
export const YoOptionGroup = ElementPlus.ElOptionGroup;
export const YoOverlay = ElementPlus.ElOverlay;
export const YoPageHeader = ElementPlus.ElPageHeader;
export const YoPagination = ElementPlus.ElPagination;
export const YoPopconfirm = ElementPlus.ElPopconfirm;
export const YoPopover = ElementPlus.ElPopover;
export const YoPopoverDirective = ElementPlus.ElPopoverDirective;
export const YoPopper = ElementPlus.ElPopper;
export const YoPopperArrow = ElementPlus.ElPopperArrow;
export const YoPopperContent = ElementPlus.ElPopperContent;
export const YoPopperTrigger = ElementPlus.ElPopperTrigger;
export const YoProgress = ElementPlus.ElProgress;
// export const YoRadio = ElementPlus.ElRadio; // 使用本地二开版本
// export const YoRadioButton = ElementPlus.ElRadioButton; // 使用本地二开版本
// export const YoRadioGroup = ElementPlus.ElRadioGroup; // 使用本地二开版本
export const YoRate = ElementPlus.ElRate;
export const YoResult = ElementPlus.ElResult;
export const YoRow = ElementPlus.ElRow;
export const YoScrollbar = ElementPlus.ElScrollbar;
export const YoSegmented = ElementPlus.ElSegmented;
// export const YoSelect = ElementPlus.ElSelect;
export const YoSelectV2 = ElementPlus.ElSelectV2;
export const YoSkeleton = ElementPlus.ElSkeleton;
export const YoSkeletonItem = ElementPlus.ElSkeletonItem;
export const YoSlider = ElementPlus.ElSlider;
export const YoSpace = ElementPlus.ElSpace;
export const YoSplitter = ElementPlus.ElSplitter;
export const YoSplitterPanel = ElementPlus.ElSplitterPanel;
export const YoStatistic = ElementPlus.ElStatistic;
export const YoStep = ElementPlus.ElStep;
export const YoSteps = ElementPlus.ElSteps;
export const YoSubMenu = ElementPlus.ElSubMenu;
export const YoSwitch = ElementPlus.ElSwitch;
export const YoTabPane = ElementPlus.ElTabPane;
// export const YoTable = ElementPlus.ElTable; // 使用业务组件库版本
export const YoTableColumn = ElementPlus.ElTableColumn;
export const YoTableV2 = ElementPlus.ElTableV2;
export const YoTabs = ElementPlus.ElTabs;
export const YoTag = ElementPlus.ElTag;
export const YoText = ElementPlus.ElText;
export const YoTimePicker = ElementPlus.ElTimePicker;
export const YoTimeSelect = ElementPlus.ElTimeSelect;
export const YoTimeline = ElementPlus.ElTimeline;
export const YoTimelineItem = ElementPlus.ElTimelineItem;
export const YoTooltip = ElementPlus.ElTooltip;
export const YoTour = ElementPlus.ElTour;
export const YoTourStep = ElementPlus.ElTourStep;
export const YoTransfer = ElementPlus.ElTransfer;
// export const YoTree = ElementPlus.ElTree;
export const YoTreeSelect = ElementPlus.ElTreeSelect;
export const YoTreeV2 = ElementPlus.ElTreeV2;
export const YoUpload = ElementPlus.ElUpload;
export const YoWatermark = ElementPlus.ElWatermark;

export {
  YoButton,
  YoInput,
  YoSearch,
  YoRadioGroup,
  YoRadio,
  YoRadioButton,
  YoTitle,
  YoPictureView,
  YoFileView,
  YoContent,
  YoHeader,
  YoDetailCol,
  YoTable,
  YoQuery,
  YoGrid,
  YoForm,
  YoSelect,
  YoUnitInput,
  YoEmpty,
  YoImg,
  YoTree,
  YoFile,
  YoMaterialFile
};

const components = {
  YoAffix,
  YoAlert,
  YoAnchor,
  YoAnchorLink, YoAside,
  YoAutoResizer,
  YoAutocomplete, YoAvatar,
  YoAvatarGroup, YoBacktop,
  YoBadge, YoBreadcrumb,
  YoBreadcrumbItem,
  YoButtonGroup, YoCalendar,
  YoCard,
  YoCarousel,
  YoCarouselItem,
  YoCascader,
  YoCascaderPanel,
  YoCheckTag,
  YoCheckbox,
  YoCheckboxButton,
  YoCheckboxGroup,
  YoCol,
  YoCollapse, YoCollapseItem, YoCollapseTransition, YoColorPicker, YoColorPickerPanel, YoConfigProvider, YoContainer, YoCountdown, YoDatePicker, YoDatePickerPanel, YoDescriptions, YoDescriptionsItem, YoDialog, YoDivider, YoDrawer, YoDropdown, YoDropdownItem, YoDropdownMenu, YoFooter, YoForm, YoFormItem, YoIcon, YoImageViewer, YoInfiniteScroll, YoInputNumber, YoInputTag, YoLink, YoLoading, YoLoadingDirective, YoLoadingService, YoMain, YoMention, YoMenu, YoMenuItem, YoMenuItemGroup, YoMessage, YoMessageBox, YoNotification, YoOption, YoOptionGroup, YoOverlay, YoPageHeader, YoPagination, YoPopconfirm, YoPopover, YoPopoverDirective, YoPopper, YoPopperArrow, YoPopperContent, YoPopperTrigger, YoProgress, YoRate, YoResult, YoRow, YoScrollbar, YoSegmented, YoSelect, YoSelectV2, YoSkeleton, YoSkeletonItem, YoSlider, YoSpace, YoSplitter, YoSplitterPanel, YoStatistic, YoStep, YoSteps, YoSubMenu, YoSwitch, YoTabPane, YoTableColumn, YoTableV2, YoTabs, YoTag, YoText, YoTimePicker, YoTimeSelect, YoTimeline, YoTimelineItem, YoTooltip, YoTour, YoTourStep, YoTransfer, YoTreeSelect, YoTreeV2, YoUpload, YoWatermark,
  YoButton,
  YoInput,
  YoSearch,
  YoRadioGroup,
  YoRadio,
  YoRadioButton,
  YoTitle,
  YoPictureView,
  YoFileView,
  YoContent,
  YoHeader,
  YoDetailCol,
  YoTable,
  YoQuery,
  YoGrid,
  YoForm,
  YoSelect,
  YoUnitInput,
  YoEmpty,
  YoTree,
  YoImg,
  YoFile,
  YoMaterialFile
}


export default {

  install(app, options = {}) {
    initLibAppKey()

    // 注入全局配置
    app.provide(YO_CONFIG_KEY, {
      attachApi: options.attachApi || '',
      ...options
    });

    // 注册所有组件
    Object.entries(components).forEach(([name, component]) => {
      app.component(name, component);
    });

    if (options.locale) {
      app.use(ElementPlus, {
        locale: options.locale, // 传入语言包
      })
    }
  }
};

// ============ 导出组件列表（用于文档生成） ============
export const componentList = Object.keys(components);

