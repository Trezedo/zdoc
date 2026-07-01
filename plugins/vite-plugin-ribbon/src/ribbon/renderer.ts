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
    const attrs: Record<string, any> = {
        id: btn.id,
        label: btn.label,
        onAction: btn.onAction ?? "onAction",
        size: btn.size,
        getImage: btn.imageMso ? "" : (btn.getImage ?? "getImage"),
        imageMso: btn.imageMso,
        screentip: btn.screentip,
        supertip: btn.supertip,
        keytip: btn.keytip,
        tag: btn.tag,
        getVisible: btn.getVisible,
        visible: btn.visible,
        getEnabled: btn.getEnabled,
        enabled: btn.enabled,
        showImage: btn.showImage,
        showLabel: btn.showLabel,
        getLabel: btn.getLabel,
    };
    return `${indent}<button ${renderAttributes(attrs)} />`;
}

function renderCheckBox(cb: CheckBox, indent: string): string {
    const attrs: Record<string, any> = {
        id: cb.id,
        label: cb.label,
        onAction: cb.onAction ?? "onAction",
        size: cb.size,
        getImage: cb.imageMso ? "" : cb.getImage,
        imageMso: cb.imageMso,
        screentip: cb.screentip,
        supertip: cb.supertip,
        keytip: cb.keytip,
        tag: cb.tag,
        getVisible: cb.getVisible,
        visible: cb.visible,
        getEnabled: cb.getEnabled,
        enabled: cb.enabled,
        showImage: cb.showImage,
        showLabel: cb.showLabel,
        getPressed: cb.getPressed,
        pressed: cb.pressed,
        getLabel: cb.getLabel,
    };
    return `${indent}<checkBox ${renderAttributes(attrs)} />`;
}

function renderToggleButton(tb: ToggleButton, indent: string): string {
    const attrs: Record<string, any> = {
        id: tb.id,
        label: tb.label,
        onAction: tb.onAction ?? "onAction",
        size: tb.size,
        getImage: tb.imageMso ? "" : tb.getImage,
        imageMso: tb.imageMso,
        screentip: tb.screentip,
        supertip: tb.supertip,
        keytip: tb.keytip,
        tag: tb.tag,
        getVisible: tb.getVisible,
        visible: tb.visible,
        getEnabled: tb.getEnabled,
        enabled: tb.enabled,
        showImage: tb.showImage,
        showLabel: tb.showLabel,
        getPressed: tb.getPressed,
        pressed: tb.pressed,
        getLabel: tb.getLabel,
    };
    return `${indent}<toggleButton ${renderAttributes(attrs)} />`;
}

function renderEditBox(eb: EditBox, indent: string): string {
    const attrs: Record<string, any> = {
        id: eb.id,
        label: eb.label,
        onChange: eb.onChange ?? "onChange",
        getText: eb.getText ?? "getText",
        text: eb.text,
        size: eb.size,
        getImage: eb.imageMso ? "" : eb.getImage,
        imageMso: eb.imageMso,
        screentip: eb.screentip,
        supertip: eb.supertip,
        keytip: eb.keytip,
        tag: eb.tag,
        getVisible: eb.getVisible,
        visible: eb.visible,
        getEnabled: eb.getEnabled,
        enabled: eb.enabled,
        showImage: eb.showImage,
        showLabel: eb.showLabel,
        getLabel: eb.getLabel,
        maxLength: eb.maxLength,
    };
    return `${indent}<editBox ${renderAttributes(attrs)} />`;
}

function renderComboBox(cb: ComboBox, indent: string): string {
    const attrs: Record<string, any> = {
        id: cb.id,
        label: cb.label,
        onChange: cb.onChange ?? "onChange",
        getText: cb.getText ?? "getText",
        text: cb.text,
        size: cb.size,
        getImage: cb.imageMso ? "" : cb.getImage,
        imageMso: cb.imageMso,
        screentip: cb.screentip,
        supertip: cb.supertip,
        keytip: cb.keytip,
        tag: cb.tag,
        getVisible: cb.getVisible,
        visible: cb.visible,
        getEnabled: cb.getEnabled,
        enabled: cb.enabled,
        showImage: cb.showImage,
        showLabel: cb.showLabel,
        getLabel: cb.getLabel,
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
    const attrs: Record<string, any> = {
        id: dd.id,
        label: dd.label,
        onChange: dd.onChange ?? "onChange",
        size: dd.size,
        getImage: dd.imageMso ? "" : dd.getImage,
        imageMso: dd.imageMso,
        screentip: dd.screentip,
        supertip: dd.supertip,
        keytip: dd.keytip,
        tag: dd.tag,
        getVisible: dd.getVisible,
        visible: dd.visible,
        getEnabled: dd.getEnabled,
        enabled: dd.enabled,
        showImage: dd.showImage,
        showLabel: dd.showLabel,
        getLabel: dd.getLabel,
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
    const attrs: Record<string, any> = {
        id: menu.id,
        label: menu.label,
        size: menu.size,
        getImage: menu.imageMso ? "" : (menu.getImage ?? "getImage"),
        imageMso: menu.imageMso,
        screentip: menu.screentip,
        supertip: menu.supertip,
        keytip: menu.keytip,
        tag: menu.tag,
        getVisible: menu.getVisible,
        visible: menu.visible,
        getEnabled: menu.getEnabled,
        enabled: menu.enabled,
        showImage: menu.showImage,
        showLabel: menu.showLabel,
        getDescription: menu.getDescription,
        getLabel: menu.getLabel,
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
    const attrs: Record<string, any> = {
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
