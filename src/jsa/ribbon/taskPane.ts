import { getRouterUrl } from "@/utils";
import type { RouteNamedMap } from "vue-router/auto-routes";

// 存储键名常量
export const STORAGE_KEYS = {
    // 公文排版配置
    OFFICIAL_TYPOGRAPHY_CONFIG: "official_typography_config",
    // 任务窗格相关
    OFFICIAL_TASKPANE_ID: "official_taskpane_id",
    PAGE_SETUP_TASKPANE_ID: "page_setup_taskpane_id",
    IMAGE_RESIZE_TASKPANE_ID: "image_resize_taskpane_id",
    // 功能开关
    ENABLE_FLAG: "EnableFlag",
    API_EVENT_FLAG: "ApiEventFlag",
    // 消息
    MESSAGE: "msg",
} as const;

export type StorageKey = (typeof STORAGE_KEYS)[keyof typeof STORAGE_KEYS];

interface TaskPaneConfig {
    storageKey: string;
    routePath: string;
    onCreate?: (taskPaneId: number) => void;
}

// 存储已创建窗格的 ID 映射
const paneIdCache = new Map<string, number>();

const TASK_PANE_CONFIGS: TaskPaneConfig[] = [
    { storageKey: STORAGE_KEYS.OFFICIAL_TASKPANE_ID, routePath: "/typography" },
    { storageKey: STORAGE_KEYS.PAGE_SETUP_TASKPANE_ID, routePath: "/page-setup" },
    { storageKey: STORAGE_KEYS.IMAGE_RESIZE_TASKPANE_ID, routePath: "/image-resize" },
];

function getPaneId(storageKey: string): number | null {
    if (paneIdCache.has(storageKey)) return paneIdCache.get(storageKey)!;
    const stored = Application.PluginStorage.getItem(storageKey);
    if (stored) {
        const id = Number(stored);
        paneIdCache.set(storageKey, id);
        return id;
    }
    return null;
}

function setPaneId(storageKey: string, id: number): void {
    paneIdCache.set(storageKey, id);
    Application.PluginStorage.setItem(storageKey, String(id));
}

function removePaneId(storageKey: string): void {
    paneIdCache.delete(storageKey);
    Application.PluginStorage.removeItem(storageKey);
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

export function showTaskPane(storageKey: string, routePath: keyof RouteNamedMap): void {
    hideAllOtherPanes(storageKey);

    let paneId = getPaneId(storageKey);
    let taskPane = paneId ? Application.GetTaskPane(paneId) : null;

    if (!taskPane) {
        if (paneId) removePaneId(storageKey);
        const url = getRouterUrl(routePath);
        taskPane = Application.CreateTaskPane(url);
        let width = (Application.System.HorizontalResolution / 4) * window.devicePixelRatio;
        taskPane.MinWidth = ~~width;
        if (!taskPane) {
            console.error(`创建任务窗格失败: ${storageKey}`);
            return;
        }
        setPaneId(storageKey, taskPane.ID);
    }

    taskPane.Visible = true;
}

export function showOfficialTaskPane(): void {
    showTaskPane(STORAGE_KEYS.OFFICIAL_TASKPANE_ID, "/official");
}

export function showLayoutTaskPane(): void {
    showTaskPane(STORAGE_KEYS.PAGE_SETUP_TASKPANE_ID, "/page-setup");
}

export function showImageResizeTaskPane(): void {
    showTaskPane(STORAGE_KEYS.IMAGE_RESIZE_TASKPANE_ID, "/image-resize");
}
