import type { RibbonConfig, Control, Tab, Group } from "../common/typings.js";

function collectIdsFromControl(control: Control): string[] {
    switch (control.type) {
        case "button":
            return [control.id];
        case "checkbox":
            return [control.id];
        case "toggleButton":
            return [control.id];
        case "editBox":
            return [control.id];
        case "comboBox":
            return [control.id];
        case "dropDown":
            return [control.id];
        case "labelControl":
            return [control.id];
        case "splitButton":
            return [
                control.id,
                ...(control.button ? collectIdsFromControl(control.button) : []),
                ...(control.menu ? collectIdsFromControl(control.menu) : []),
            ];
        case "menu":
            return [control.id, ...control.items.flatMap((item) => collectIdsFromControl(item))];
        case "separator":
            return [];
        case "menuSeparator":
            return [control.id];
        default:
            return [];
    }
}

function collectIdsFromGroup(group: Group): string[] {
    const groupId = group.id ? [group.id] : [];
    const controlsIds = group.controls.flatMap((control) => collectIdsFromControl(control));
    return [...groupId, ...controlsIds];
}

function collectIdsFromTab(tab: Tab): string[] {
    const tabId = [tab.id];
    const groupsIds = tab.groups.flatMap((group) => collectIdsFromGroup(group));
    return [...tabId, ...groupsIds];
}

export function collectAllIds(config: RibbonConfig): string[] {
    return [...new Set(config.tabs.flatMap((tab) => collectIdsFromTab(tab)))];
}
