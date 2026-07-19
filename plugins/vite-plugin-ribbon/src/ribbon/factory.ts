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

type BaseControlOptions = {
    size?: string;
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
    getLabel?: string;
};

function getBaseOptions<T extends BaseControlOptions>(options: T): T {
    return options;
}

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
    const base = getBaseOptions(options || {});
    return {
        type: "button",
        id,
        label,
        onAction: options?.onAction,
        ...base,
    };
}

export function checkBox(
    label: string,
    id: string,
    options?: Partial<Omit<CheckBox, "type" | "id" | "label">>,
): CheckBox {
    const base = getBaseOptions(options || {});
    return {
        type: "checkbox",
        id,
        label,
        onAction: options?.onAction,
        getPressed: options?.getPressed,
        pressed: options?.pressed,
        ...base,
    };
}

export function toggleButton(
    label: string,
    id: string,
    options?: Partial<Omit<ToggleButton, "type" | "id" | "label">>,
): ToggleButton {
    const base = getBaseOptions(options || {});
    return {
        type: "toggleButton",
        id,
        label,
        onAction: options?.onAction,
        getPressed: options?.getPressed,
        pressed: options?.pressed,
        ...base,
    };
}

export function editBox(id: string, options?: Partial<Omit<EditBox, "type" | "id">>): EditBox {
    const base = getBaseOptions(options || {});
    return {
        type: "editBox",
        id,
        label: options?.label,
        onChange: options?.onChange,
        getText: options?.getText,
        text: options?.text,
        maxLength: options?.maxLength,
        ...base,
    };
}

export function comboBox(id: string, options?: Partial<Omit<ComboBox, "type" | "id">>): ComboBox {
    const base = getBaseOptions(options || {});
    return {
        type: "comboBox",
        id,
        label: options?.label,
        onChange: options?.onChange,
        getText: options?.getText,
        text: options?.text,
        maxLength: options?.maxLength,
        ...base,
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

export function dropDown(id: string, options?: Partial<Omit<DropDown, "type" | "id">>): DropDown {
    const base = getBaseOptions(options || {});
    return {
        type: "dropDown",
        id,
        label: options?.label,
        onChange: options?.onChange,
        ...base,
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
    const base = getBaseOptions(options || {});
    return {
        type: "splitButton",
        id,
        button: btn,
        menu: mnu,
        getDescription: options?.getDescription,
        ...base,
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

    const base = getBaseOptions(opts);
    return {
        type: "menu",
        id,
        label: label || undefined,
        getDescription: opts.getDescription,
        items: menuItems,
        ...base,
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
