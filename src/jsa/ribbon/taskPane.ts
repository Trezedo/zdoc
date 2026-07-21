import type { RouteNamedMap } from "vue-router/auto-routes";

import { getItem, removeItem, setItem } from "@/jsa/utils/storage";
import { getRouterUrl } from "@/utils";

// 存储键名常量
export const STORAGE_KEYS = {
    // 公文排版配置
    OFFICIAL_TYPOGRAPHY_CONFIG: "official_typography_config",
    // 任务窗格相关
    DOC_SETTINGS_ID: "official_taskpane_id",
    PAGE_SETUP_TASKPANE_ID: "page_setup_taskpane_id",
    IMAGE_RESIZE_TASKPANE_ID: "image_resize_taskpane_id",
    TEXT_COMPARE_TASKPANE_ID: "text_compare_taskpane_id",
    HEADER_FOOTER_TASKPANE_ID: "header_footer_taskpane_id",
    // 功能开关
    ENABLE_FLAG: "EnableFlag",
    API_EVENT_FLAG: "ApiEventFlag",
    // 消息
    MESSAGE: "msg",
} as const;

export type StorageKey = (typeof STORAGE_KEYS)[keyof typeof STORAGE_KEYS];

interface TaskPaneConfig {
    storageKey: string;
    routePath: keyof RouteNamedMap;
    onCreate?: (taskPaneId: number) => void;
}

// 存储已创建窗格的 ID 映射
const paneIdCache = new Map<string, number>();

const TASK_PANE_CONFIGS: TaskPaneConfig[] = [
    { storageKey: STORAGE_KEYS.DOC_SETTINGS_ID, routePath: "/settings" },
    { storageKey: STORAGE_KEYS.IMAGE_RESIZE_TASKPANE_ID, routePath: "/image-resize" },
    { storageKey: STORAGE_KEYS.TEXT_COMPARE_TASKPANE_ID, routePath: "/text-compare" },
    { storageKey: STORAGE_KEYS.HEADER_FOOTER_TASKPANE_ID, routePath: "/header-footer" },
];

function getPaneId(storageKey: string): number | null {
    if (paneIdCache.has(storageKey)) return paneIdCache.get(storageKey)!;
    const stored = getItem(storageKey);
    if (stored) {
        const id = Number(stored);
        paneIdCache.set(storageKey, id);
        return id;
    }
    return null;
}

function setPaneId(storageKey: string, id: number): void {
    paneIdCache.set(storageKey, id);
    setItem(storageKey, String(id));
}

function removePaneId(storageKey: string): void {
    paneIdCache.delete(storageKey);
    removeItem(storageKey);
}

function getRoutePath(storageKey: string): keyof RouteNamedMap | undefined {
    return TASK_PANE_CONFIGS.find((p) => p.storageKey === storageKey)?.routePath;
}

function hideAllOtherPanes(excludeStorageKey: string): void {
    for (const pane of TASK_PANE_CONFIGS) {
        if (pane.storageKey === excludeStorageKey) continue;
        const paneId = getPaneId(pane.storageKey);
        if (paneId) {
            const taskPane = Application.GetTaskPane(paneId);
            if (taskPane) {
                taskPane.Visible = false;
            } else {
                removePaneId(pane.storageKey);
            }
        }
    }
}

export function showTaskPane(storageKey: string): void {
    hideAllOtherPanes(storageKey);

    let paneId = getPaneId(storageKey);
    let taskPane = paneId ? Application.GetTaskPane(paneId) : null;

    if (!taskPane) {
        if (paneId) removePaneId(storageKey);
        const routePath = getRoutePath(storageKey);
        if (!routePath) {
            console.error(`找不到路由路径: ${storageKey}`);
            return;
        }
        const url = getRouterUrl(routePath);
        taskPane = Application.CreateTaskPane(url);
        // 介于 1/3 和 1/4 之间的屏幕宽度
        let width = Application.System.HorizontalResolution * 0.28 * window.devicePixelRatio;
        taskPane.MinWidth = ~~width;
        if (!taskPane) {
            console.error(`创建任务窗格失败: ${storageKey}`);
            return;
        }
        setPaneId(storageKey, taskPane.ID);
    }

    taskPane.Visible = true;
}

export function toggleTaskPane(storageKey: string): void {
    const paneId = getPaneId(storageKey);
    const taskPane = paneId ? Application.GetTaskPane(paneId) : null;

    if (taskPane) {
        if (taskPane.Visible) {
            taskPane.Visible = false;
        } else {
            showTaskPane(storageKey);
        }
    } else {
        showTaskPane(storageKey);
    }
}
