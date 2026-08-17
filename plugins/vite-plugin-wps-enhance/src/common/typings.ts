export interface RibbonConfig {
    onLoad?: string;
    tabs: Tab[];
}

// https://open.wps.cn/documents/app-integration-dev/wps365/client/wpsoffice/jsapi/idmso-list/wps-idmso-reference
export type WordTabMsoID =
    | "TabHome" // “开始”选项卡
    | "TabInsert" // “插入”选项卡
    | "TabPageLayoutWord" // “页面布局”选项卡
    | "TabReferences" // “引用”选项卡
    | "TabReviewWord" // “审阅”选项卡
    | "TabViewWord" // “视图”选项卡
    | "TabDeveloper"; // “工具”选项卡

export type TabMsoID = WordTabMsoID | (string & {});

export interface Tab {
    id: string;
    label: string;
    insertBeforeMso?: TabMsoID;
    insertAfterMso?: TabMsoID;
    insertBeforeQ?: string;
    insertAfterQ?: string;
    getVisible?: string;
    visible?: boolean;
    groups: Group[];
}

export interface Group {
    id?: string;
    label: string;
    insertBeforeMso?: TabMsoID;
    insertAfterMso?: TabMsoID;
    insertBeforeQ?: string;
    insertAfterQ?: string;
    getVisible?: string;
    visible?: boolean;
    getImage?: string;
    imageMso?: string;
    screentip?: string;
    supertip?: string;
    keytip?: string;
    showImage?: boolean;
    showLabel?: boolean;
    tag?: string;
    controls: Control[];
}

export interface BaseControl {
    id: string;
    size?: "large" | "normal";
    getImage?: string;
    imageMso?: string;
    screentip?: string;
    supertip?: string;
    keytip?: string;
    tag?: string;
    getVisible?: string;
    visible?: boolean;
    getEnabled?: string;
    enabled?: boolean;
    showImage?: boolean;
    showLabel?: boolean;
}

export interface Button extends BaseControl {
    type: "button";
    label: string;
    onAction?: string;
    getLabel?: string;
}

export interface CheckBox extends BaseControl {
    type: "checkbox";
    label: string;
    onAction?: string;
    getPressed?: string;
    pressed?: boolean;
    getLabel?: string;
}

export interface ToggleButton extends BaseControl {
    type: "toggleButton";
    label: string;
    onAction?: string;
    getPressed?: string;
    pressed?: boolean;
    getLabel?: string;
}

export interface EditBox extends BaseControl {
    type: "editBox";
    label?: string;
    onChange?: string;
    getText?: string;
    text?: string;
    getLabel?: string;
    maxLength?: number;
}

export interface ComboBox extends BaseControl {
    type: "comboBox";
    label?: string;
    onChange?: string;
    getText?: string;
    text?: string;
    getLabel?: string;
    getItemCount?: string;
    getItemLabel?: string;
    getItemID?: string;
    getSelectedItemID?: string;
    getSelectedItemIndex?: string;
    onSelectItem?: string;
    getItemImage?: string;
    getItemScreentip?: string;
    getItemSupertip?: string;
    maxLength?: number;
}

export interface DropDown extends BaseControl {
    type: "dropDown";
    label?: string;
    onChange?: string;
    getLabel?: string;
    getItemCount?: string;
    getItemLabel?: string;
    getItemID?: string;
    getSelectedItemID?: string;
    getSelectedItemIndex?: string;
    onSelectItem?: string;
    getItemImage?: string;
    getItemScreentip?: string;
    getItemSupertip?: string;
}

export interface LabelControl extends BaseControl {
    type: "labelControl";
    label?: string;
    getLabel?: string;
}

export interface SplitButton extends BaseControl {
    type: "splitButton";
    button: Button;
    menu?: Menu;
    getDescription?: string;
}

export interface Menu extends BaseControl {
    type: "menu";
    label?: string;
    items: (Button | MenuSeparator | CheckBox | ToggleButton | Menu)[];
    getDescription?: string;
    getLabel?: string;
}

export interface Separator {
    type: "separator";
}

export interface MenuSeparator {
    type: "menuSeparator";
    id: string;
}

export type Control =
    | Button
    | CheckBox
    | ToggleButton
    | EditBox
    | ComboBox
    | DropDown
    | LabelControl
    | SplitButton
    | Menu
    | Separator
    | MenuSeparator;

export interface ImageTypeOptions {
    imagesDir: string;
    outputFile: string;
    watch: boolean;
}

export interface RibbonPluginOptions {
    config: RibbonConfig;
    fileName?: string;
}

/**
 * Ribbon XML 生成配置。
 */
export interface RibbonOptions {
    config: RibbonConfig;
    /** 输出 ribbon.xml 的路径，默认 `ribbon.xml` */
    fileName?: string;
}

/**
 * `vite-plugin-wps-enhance` 插件配置。
 *
 * - `ribbon`: Ribbon XML 与图片类型声明生成；不传则跳过。
 * - `enum`: 枚举导出文件生成；不传则跳过。
 */
export interface WpsEnhanceOptions {
    ribbon?: RibbonOptions;
}
