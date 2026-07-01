import { render } from "./renderer.js";
import type {
    Button,
    CheckBox,
    ComboBox,
    Control,
    DropDown,
    EditBox,
    Group,
    LabelControl,
    Menu,
    MenuSeparator,
    RibbonConfig,
    Separator,
    SplitButton,
    Tab,
    ToggleButton,
} from "../common/typings.js";

export function tab(
    label: string,
    id: string,
    groups: Group[],
    options?: Partial<Omit<Tab, "id" | "label" | "groups">>,
): Tab {
    return {
        id,
        label,
        groups,
        insertBeforeMso: options?.insertBeforeMso,
        insertAfterMso: options?.insertAfterMso,
        insertBeforeQ: options?.insertBeforeQ,
        insertAfterQ: options?.insertAfterQ,
        getVisible: options?.getVisible,
        visible: options?.visible,
    };
}

export function group(
    label: string,
    id?: string,
    controls?: Control[],
    options?: Partial<Omit<Group, "id" | "label" | "controls">>,
): Group {
    return {
        id,
        label,
        controls: controls || [],
        insertBeforeMso: options?.insertBeforeMso,
        insertAfterMso: options?.insertAfterMso,
        insertBeforeQ: options?.insertBeforeQ,
        insertAfterQ: options?.insertAfterQ,
        getVisible: options?.getVisible,
        visible: options?.visible,
        getImage: options?.getImage,
        imageMso: options?.imageMso,
        screentip: options?.screentip,
        supertip: options?.supertip,
        keytip: options?.keytip,
        showImage: options?.showImage,
        showLabel: options?.showLabel,
        tag: options?.tag,
    };
}

export function button(
    label: string,
    id: string,
    options?: Partial<Omit<Button, "type" | "id" | "label">>,
): Button {
    return {
        type: "button",
        id,
        label,
        onAction: options?.onAction,
        size: options?.size,
        getImage: options?.getImage,
        imageMso: options?.imageMso,
        screentip: options?.screentip,
        supertip: options?.supertip,
        keytip: options?.keytip,
        tag: options?.tag,
        getVisible: options?.getVisible,
        visible: options?.visible,
        getEnabled: options?.getEnabled,
        enabled: options?.enabled,
        showImage: options?.showImage,
        showLabel: options?.showLabel,
        getLabel: options?.getLabel,
    };
}

export function checkBox(
    label: string,
    id: string,
    options?: Partial<Omit<CheckBox, "type" | "id" | "label">>,
): CheckBox {
    return {
        type: "checkbox",
        id,
        label,
        onAction: options?.onAction,
        size: options?.size,
        getImage: options?.getImage,
        imageMso: options?.imageMso,
        screentip: options?.screentip,
        supertip: options?.supertip,
        keytip: options?.keytip,
        tag: options?.tag,
        getVisible: options?.getVisible,
        visible: options?.visible,
        getEnabled: options?.getEnabled,
        enabled: options?.enabled,
        showImage: options?.showImage,
        showLabel: options?.showLabel,
        getPressed: options?.getPressed,
        pressed: options?.pressed,
        getLabel: options?.getLabel,
    };
}

export function toggleButton(
    label: string,
    id: string,
    options?: Partial<Omit<ToggleButton, "type" | "id" | "label">>,
): ToggleButton {
    return {
        type: "toggleButton",
        id,
        label,
        onAction: options?.onAction,
        size: options?.size,
        getImage: options?.getImage,
        imageMso: options?.imageMso,
        screentip: options?.screentip,
        supertip: options?.supertip,
        keytip: options?.keytip,
        tag: options?.tag,
        getVisible: options?.getVisible,
        visible: options?.visible,
        getEnabled: options?.getEnabled,
        enabled: options?.enabled,
        showImage: options?.showImage,
        showLabel: options?.showLabel,
        getPressed: options?.getPressed,
        pressed: options?.pressed,
        getLabel: options?.getLabel,
    };
}

export function editBox(id: string, options?: Partial<Omit<EditBox, "type" | "id">>): EditBox {
    return {
        type: "editBox",
        id,
        label: options?.label,
        onChange: options?.onChange,
        getText: options?.getText,
        text: options?.text,
        size: options?.size,
        getImage: options?.getImage,
        imageMso: options?.imageMso,
        screentip: options?.screentip,
        supertip: options?.supertip,
        keytip: options?.keytip,
        tag: options?.tag,
        getVisible: options?.getVisible,
        visible: options?.visible,
        getEnabled: options?.getEnabled,
        enabled: options?.enabled,
        showImage: options?.showImage,
        showLabel: options?.showLabel,
        getLabel: options?.getLabel,
        maxLength: options?.maxLength,
    };
}

export function comboBox(id: string, options?: Partial<Omit<ComboBox, "type" | "id">>): ComboBox {
    return {
        type: "comboBox",
        id,
        label: options?.label,
        onChange: options?.onChange,
        getText: options?.getText,
        text: options?.text,
        size: options?.size,
        getImage: options?.getImage,
        imageMso: options?.imageMso,
        screentip: options?.screentip,
        supertip: options?.supertip,
        keytip: options?.keytip,
        tag: options?.tag,
        getVisible: options?.getVisible,
        visible: options?.visible,
        getEnabled: options?.getEnabled,
        enabled: options?.enabled,
        showImage: options?.showImage,
        showLabel: options?.showLabel,
        getLabel: options?.getLabel,
        getItemCount: options?.getItemCount,
        getItemLabel: options?.getItemLabel,
        getItemID: options?.getItemID,
        getSelectedItemID: options?.getSelectedItemID,
        getSelectedItemIndex: options?.getSelectedItemIndex,
        onSelectItem: options?.onSelectItem,
        getItemImage: options?.getItemImage,
        getItemScreentip: options?.getItemScreentip,
        getItemSupertip: options?.getItemSupertip,
        maxLength: options?.maxLength,
    };
}

export function dropDown(id: string, options?: Partial<Omit<DropDown, "type" | "id">>): DropDown {
    return {
        type: "dropDown",
        id,
        label: options?.label,
        onChange: options?.onChange,
        size: options?.size,
        getImage: options?.getImage,
        imageMso: options?.imageMso,
        screentip: options?.screentip,
        supertip: options?.supertip,
        keytip: options?.keytip,
        tag: options?.tag,
        getVisible: options?.getVisible,
        visible: options?.visible,
        getEnabled: options?.getEnabled,
        enabled: options?.enabled,
        showImage: options?.showImage,
        showLabel: options?.showLabel,
        getLabel: options?.getLabel,
        getItemCount: options?.getItemCount,
        getItemLabel: options?.getItemLabel,
        getItemID: options?.getItemID,
        getSelectedItemID: options?.getSelectedItemID,
        getSelectedItemIndex: options?.getSelectedItemIndex,
        onSelectItem: options?.onSelectItem,
        getItemImage: options?.getItemImage,
        getItemScreentip: options?.getItemScreentip,
        getItemSupertip: options?.getItemSupertip,
    };
}

export function labelControl(
    id: string,
    options?: Partial<Omit<LabelControl, "type" | "id">>,
): LabelControl {
    return {
        type: "labelControl",
        id,
        label: options?.label,
        tag: options?.tag,
        getVisible: options?.getVisible,
        visible: options?.visible,
        getLabel: options?.getLabel,
    };
}

export function splitButton(
    id: string,
    options?: Partial<Omit<SplitButton, "type" | "id" | "button" | "menu">>,
    children?: [Button, Menu?],
): SplitButton {
    const [btn, mnu] = children || [button(id, "btn_" + id), undefined];
    return {
        type: "splitButton",
        id,
        button: btn,
        menu: mnu,
        size: options?.size,
        getImage: options?.getImage,
        imageMso: options?.imageMso,
        screentip: options?.screentip,
        supertip: options?.supertip,
        keytip: options?.keytip,
        tag: options?.tag,
        getVisible: options?.getVisible,
        visible: options?.visible,
        getEnabled: options?.getEnabled,
        enabled: options?.enabled,
        showImage: options?.showImage,
        showLabel: options?.showLabel,
        getDescription: options?.getDescription,
    };
}

export function menu(
    label: string,
    id: string,
    optionsOrItems?:
        | Partial<Omit<Menu, "type" | "id" | "label" | "items">>
        | (Button | MenuSeparator | CheckBox | ToggleButton | Menu)[],
    items?: (Button | MenuSeparator | CheckBox | ToggleButton | Menu)[],
): Menu {
    let opts: Partial<Omit<Menu, "type" | "id" | "label" | "items">> = {};
    let menuItems: (Button | MenuSeparator | CheckBox | ToggleButton | Menu)[] = [];

    if (Array.isArray(optionsOrItems)) {
        menuItems = optionsOrItems;
    } else if (optionsOrItems) {
        opts = optionsOrItems;
        menuItems = items || [];
    }

    return {
        type: "menu",
        id,
        label: label || undefined,
        size: opts.size,
        getImage: opts.getImage,
        imageMso: opts.imageMso,
        screentip: opts.screentip,
        supertip: opts.supertip,
        keytip: opts.keytip,
        tag: opts.tag,
        getVisible: opts.getVisible,
        visible: opts.visible,
        getEnabled: opts.getEnabled,
        enabled: opts.enabled,
        showImage: opts.showImage,
        showLabel: opts.showLabel,
        getDescription: opts.getDescription,
        getLabel: opts.getLabel,
        items: menuItems,
    };
}

export function separator(): Separator {
    return { type: "separator" };
}

export function menuSeparator(id: string): MenuSeparator {
    return { type: "menuSeparator", id };
}

export class RibbonBuilder {
    static create(config: RibbonConfig): RibbonConfig {
        return config;
    }

    static render(config: RibbonConfig): string {
        return render(config);
    }
}
