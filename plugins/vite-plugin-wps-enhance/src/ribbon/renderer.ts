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
    SplitButton,
    Tab,
    ToggleButton,
} from "../common/typings.js";

function renderAttributes(attrs: Record<string, any>): string {
    return Object.entries(attrs)
        .filter(([, v]) => v !== undefined && v !== null && v !== "")
        .map(([k, v]) => `${k}="${escapeXml(String(v))}"`)
        .join(" ");
}

type BaseControl = {
    id: string;
    label?: string;
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

function getBaseAttrs<T extends BaseControl>(ctrl: T): Record<string, any> {
    return {
        id: ctrl.id,
        label: ctrl.label,
        size: ctrl.size,
        getImage: ctrl.imageMso ? "" : ctrl.getImage,
        imageMso: ctrl.imageMso,
        screentip: ctrl.screentip,
        supertip: ctrl.supertip,
        keytip: ctrl.keytip,
        tag: ctrl.tag,
        getVisible: ctrl.getVisible,
        visible: ctrl.visible,
        getEnabled: ctrl.getEnabled,
        enabled: ctrl.enabled,
        showImage: ctrl.showImage,
        showLabel: ctrl.showLabel,
        getLabel: ctrl.getLabel,
    };
}

function renderTab(tab: Tab, indent: string): string {
    const attrs: Record<string, any> = {
        id: tab.id,
        label: tab.label,
        insertBeforeMso: tab.insertBeforeMso,
        insertAfterMso: tab.insertAfterMso,
        insertBeforeQ: tab.insertBeforeQ,
        insertAfterQ: tab.insertAfterQ,
        getVisible: tab.getVisible,
        visible: tab.visible,
    };
    let xml = `${indent}<tab ${renderAttributes(attrs)}>\n`;
    for (const group of tab.groups) {
        xml += renderGroup(group, indent + "  ") + "\n";
    }
    xml += `${indent}</tab>`;
    return xml;
}

function renderGroup(group: Group, indent: string): string {
    const attrs: Record<string, any> = {
        id: group.id,
        label: group.label,
        insertBeforeMso: group.insertBeforeMso,
        insertAfterMso: group.insertAfterMso,
        insertBeforeQ: group.insertBeforeQ,
        insertAfterQ: group.insertAfterQ,
        getVisible: group.getVisible,
        visible: group.visible,
        getImage: group.imageMso ? "" : group.getImage,
        imageMso: group.imageMso,
        screentip: group.screentip,
        supertip: group.supertip,
        keytip: group.keytip,
        showImage: group.showImage,
        showLabel: group.showLabel,
        tag: group.tag,
    };
    let xml = `${indent}<group ${renderAttributes(attrs)}>\n`;
    const controls = group.controls;
    for (let i = 0; i < controls.length; i++) {
        xml += renderControl(controls[i], indent + "  ");
        if (i < controls.length - 1) xml += "\n";
    }
    xml += `\n${indent}</group>`;
    return xml;
}

function renderButton(btn: Button, indent: string): string {
    const attrs = {
        ...getBaseAttrs(btn),
        onAction: btn.onAction ?? "onAction",
    };
    return `${indent}<button ${renderAttributes(attrs)} />`;
}

function renderCheckBox(cb: CheckBox, indent: string): string {
    const attrs = {
        ...getBaseAttrs(cb),
        onAction: cb.onAction ?? "onAction",
        getPressed: cb.getPressed,
        pressed: cb.pressed,
    };
    return `${indent}<checkBox ${renderAttributes(attrs)} />`;
}

function renderToggleButton(tb: ToggleButton, indent: string): string {
    const attrs = {
        ...getBaseAttrs(tb),
        onAction: tb.onAction ?? "onAction",
        getPressed: tb.getPressed,
        pressed: tb.pressed,
    };
    return `${indent}<toggleButton ${renderAttributes(attrs)} />`;
}

function renderEditBox(eb: EditBox, indent: string): string {
    const attrs = {
        ...getBaseAttrs(eb),
        onChange: eb.onChange ?? "onChange",
        getText: eb.getText ?? "getText",
        text: eb.text,
        maxLength: eb.maxLength,
    };
    return `${indent}<editBox ${renderAttributes(attrs)} />`;
}

function renderComboBox(cb: ComboBox, indent: string): string {
    const attrs = {
        ...getBaseAttrs(cb),
        onChange: cb.onChange ?? "onChange",
        getText: cb.getText ?? "getText",
        text: cb.text,
        getItemCount: cb.getItemCount ?? "getItemCount",
        getItemLabel: cb.getItemLabel ?? "getItemLabel",
        getItemID: cb.getItemID ?? "getItemID",
        getSelectedItemID: cb.getSelectedItemID ?? "getSelectedItemID",
        getSelectedItemIndex: cb.getSelectedItemIndex ?? "getSelectedItemIndex",
        onSelectItem: cb.onSelectItem ?? "onSelectItem",
        getItemImage: cb.getItemImage,
        getItemScreentip: cb.getItemScreentip,
        getItemSupertip: cb.getItemSupertip,
        maxLength: cb.maxLength,
    };
    return `${indent}<comboBox ${renderAttributes(attrs)} />`;
}

function renderDropDown(dd: DropDown, indent: string): string {
    const attrs = {
        ...getBaseAttrs(dd),
        onChange: dd.onChange ?? "onChange",
        getItemCount: dd.getItemCount ?? "getItemCount",
        getItemLabel: dd.getItemLabel ?? "getItemLabel",
        getItemID: dd.getItemID ?? "getItemID",
        getSelectedItemID: dd.getSelectedItemID ?? "getSelectedItemID",
        getSelectedItemIndex: dd.getSelectedItemIndex ?? "getSelectedItemIndex",
        onSelectItem: dd.onSelectItem ?? "onSelectItem",
        getItemImage: dd.getItemImage,
        getItemScreentip: dd.getItemScreentip,
        getItemSupertip: dd.getItemSupertip,
    };
    return `${indent}<dropDown ${renderAttributes(attrs)} />`;
}

function renderLabelControl(lc: LabelControl, indent: string): string {
    const attrs: Record<string, any> = {
        id: lc.id,
        label: lc.label,
        tag: lc.tag,
        getVisible: lc.getVisible,
        visible: lc.visible,
        getLabel: lc.getLabel,
    };
    return `${indent}<labelControl ${renderAttributes(attrs)} />`;
}

function renderMenu(menu: Menu, indent: string): string {
    const attrs = {
        ...getBaseAttrs(menu),
        getDescription: menu.getDescription,
    };
    let xml = `${indent}<menu ${renderAttributes(attrs)}>\n`;
    for (const item of menu.items) {
        xml +=
            (item.type == "button"
                ? renderButton(item, indent + "  ")
                : item.type == "menuSeparator"
                  ? renderMenuSeparator(item, indent + "  ")
                  : item.type == "checkbox"
                    ? renderCheckBox(item, indent + "  ")
                    : item.type == "toggleButton"
                      ? renderToggleButton(item, indent + "  ")
                      : item.type == "menu"
                        ? renderMenu(item, indent + "  ")
                        : "") + "\n";
    }
    xml += `${indent}</menu>`;
    return xml;
}

function renderSplitButton(sb: SplitButton, indent: string): string {
    const attrs = {
        id: sb.id,
        size: sb.size,
        getImage: sb.imageMso ? "" : sb.getImage,
        imageMso: sb.imageMso,
        screentip: sb.screentip,
        supertip: sb.supertip,
        keytip: sb.keytip,
        tag: sb.tag,
        getVisible: sb.getVisible,
        visible: sb.visible,
        getEnabled: sb.getEnabled,
        enabled: sb.enabled,
        showImage: sb.showImage,
        showLabel: sb.showLabel,
        getDescription: sb.getDescription,
    };
    let xml = `${indent}<splitButton ${renderAttributes(attrs)}>\n`;
    xml += renderButton(sb.button, indent + "  ") + "\n";
    xml += sb.menu ? renderMenu(sb.menu, indent + "  ") + "\n" : "";
    xml += `${indent}</splitButton>`;
    return xml;
}

function renderSeparator(indent: string): string {
    return `${indent}<separator />`;
}

function renderMenuSeparator(ms: MenuSeparator, indent: string): string {
    return `${indent}<menuSeparator id="${ms.id}" />`;
}

function renderControl(control: Control, indent: string): string {
    switch (control.type) {
        case "button":
            return renderButton(control, indent);
        case "checkbox":
            return renderCheckBox(control, indent);
        case "toggleButton":
            return renderToggleButton(control, indent);
        case "editBox":
            return renderEditBox(control, indent);
        case "comboBox":
            return renderComboBox(control, indent);
        case "dropDown":
            return renderDropDown(control, indent);
        case "labelControl":
            return renderLabelControl(control, indent);
        case "splitButton":
            return renderSplitButton(control, indent);
        case "menu":
            return renderMenu(control, indent);
        case "separator":
            return renderSeparator(indent);
        case "menuSeparator":
            return renderMenuSeparator(control, indent);
        default:
            return "";
    }
}

export function render(config: RibbonConfig): string {
    const rootAttrs: Record<string, any> = {
        xmlns: "http://schemas.microsoft.com/office/2006/01/customui",
        onLoad: config.onLoad,
    };
    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += `<customUI ${renderAttributes(rootAttrs)}>\n`;
    xml += `  <ribbon>\n`;
    xml += `    <tabs>\n`;
    for (const tab of config.tabs) {
        xml += renderTab(tab, "      ") + "\n";
    }
    xml += `    </tabs>\n`;
    xml += `  </ribbon>\n`;
    xml += `</customUI>`;
    return xml;
}

function escapeXml(str: string): string {
    return str.replace(/[<>&'"]/g, (c) => {
        switch (c) {
            case "<":
                return "&lt;";
            case ">":
                return "&gt;";
            case "&":
                return "&amp;";
            case "'":
                return "&apos;";
            case '"':
                return "&quot;";
            default:
                return c;
        }
    });
}
