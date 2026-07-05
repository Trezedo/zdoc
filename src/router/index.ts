import { createRouter, createWebHashHistory, type RouteRecordRaw } from "vue-router";
import { handleHotUpdate, routes as fileRoutes } from "vue-router/auto-routes";

const customRoutes: RouteRecordRaw[] = [
    {
        path: "/msg",
        name: "对话框",
        component: () => import("@/components/MsgBox.vue"),
    },
];

export const router = createRouter({
    history: createWebHashHistory(""),
    routes: [...customRoutes, ...fileRoutes],
});

// 这将在运行时更新路由而无需重新加载页面
if (import.meta.hot) {
    handleHotUpdate(router);
}
