import { STORAGE_KEYS } from "@/jsa/ribbon/taskPane";
import type { GovDocConfig } from "@/jsa/types";

import { loadGovDocConfigFromFile, saveGovDocConfigToFile } from "./document";

export interface StorageSchema {
    [STORAGE_KEYS.DOC_SETTINGS_ID]: string;
    [STORAGE_KEYS.PAGE_SETUP_TASKPANE_ID]: string;
    [STORAGE_KEYS.IMAGE_RESIZE_TASKPANE_ID]: string;
    [STORAGE_KEYS.ENABLE_FLAG]: string;
    [STORAGE_KEYS.API_EVENT_FLAG]: string;
    [STORAGE_KEYS.MESSAGE]: string;
    LastSelectedFolder: string;
}

export type StorageKey = keyof StorageSchema;

function isJsonObject(str: string): boolean {
    try {
        const parsed = JSON.parse(str);
        return typeof parsed === "object" && parsed !== null;
    } catch {
        return false;
    }
}

export function getItem<K extends StorageKey>(key: K): StorageSchema[K] | null;
export function getItem(key: string): unknown;
export function getItem(key: string): unknown {
    const value = Application.PluginStorage.getItem(key);
    if (!value) return null;

    if (isJsonObject(value)) {
        try {
            return JSON.parse(value);
        } catch {
            return null;
        }
    }

    return value;
}

export function setItem<K extends StorageKey>(key: K, value: StorageSchema[K]): void;
export function setItem(key: string, value: unknown): void;
export function setItem(key: string, value: unknown): void {
    const str = typeof value === "string" ? value : JSON.stringify(value);
    Application.PluginStorage.setItem(key, str);
}

export function removeItem(key: string): void {
    Application.PluginStorage.removeItem(key);
}

export function saveGovDocConfig(config: GovDocConfig): ReturnType<typeof saveGovDocConfigToFile> {
    return saveGovDocConfigToFile(config);
}

export function loadGovDocConfig(): GovDocConfig | null {
    return loadGovDocConfigFromFile();
}
