import type { RouteRecordRaw } from "vue-router";

import { createRouter, createWebHashHistory } from "vue-router";
import { routes as fileRoutes, handleHotUpdate } from "vue-router/auto-routes";

const customRoutes: RouteRecordRaw[] = [
    // 通过该方式打开的弹窗有白屏，延迟非常高，弃用
    // { path: "/msg", name: "对话框", component: () => import("@/components/MsgBox.vue") },
];

export const router = createRouter({
    history: createWebHashHistory(""),
    routes: [...customRoutes, ...fileRoutes],
});

// 这将在运行时更新路由而无需重新加载页面
if (import.meta.hot) {
    handleHotUpdate(router);
}
