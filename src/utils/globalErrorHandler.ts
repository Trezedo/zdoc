import type { App } from "vue";

import { createDiscreteApi } from "naive-ui";
import { throttle } from "radash";

const { message, notification } = createDiscreteApi(["message", "notification"]);

// 判断是否为 WPS / Office 环境缺失错误
function isWpsMissingError(err: unknown): boolean {
    if (!err) return false;
    const msg = err instanceof Error ? err.message : String(err);
    // 匹配常见未定义错误：WPS、Application、Excel、Word、PPT 等全局对象
    return /(WPS|Application|Excel|Word|PowerPoint|Office) is not defined/i.test(msg);
}

function handleErrorRaw(err: unknown, _instance: any, _info: string) {
    // 开发环境：打印完整错误堆栈
    if (import.meta.env.DEV) {
        console.error("🔴 [加载项错误]", err);
    }

    let userMessage = "程序遇到了未知错误，请重试";
    let isEnvError = false;

    if (isWpsMissingError(err)) {
        userMessage = "WPS 环境未就绪，请确保已正确安装并打开 WPS Office，然后重新加载加载项";
        isEnvError = true;
    } else if (typeof err === "string") {
        userMessage = err;
    } else if (err instanceof Error) {
        userMessage = err.message;
    }

    // 使用 Naive UI 展示提示
    if (isEnvError) {
        notification.error({
            title: "环境异常",
            content: userMessage,
            duration: 5000,
            keepAliveOnHover: true,
        });
    } else {
        message.error(userMessage, {
            duration: 3000,
            keepAliveOnHover: true,
        });
    }

    // 生产环境
    if (import.meta.env.PROD) {
    }
}

// 未捕获的 Promise 拒绝处理
function handleUnhandledRejectionRaw(event: PromiseRejectionEvent) {
    const reason = event.reason;

    if (isWpsMissingError(reason)) {
        notification.error({
            title: "环境未就绪",
            content: "WPS 对象未定义，请检查加载项是否在 WPS 环境中运行",
            duration: 5000,
        });
    } else {
        message.error(reason?.message || "未捕获的异步错误", { duration: 3000 });
    }
    console.error("Unhandled Rejection:", reason);
}

const handleError = throttle({ interval: 3000 }, handleErrorRaw);
const handleUnhandledRejection = throttle({ interval: 3000 }, handleUnhandledRejectionRaw);

export function setupGlobalErrorHandler(app: App) {
    app.config.errorHandler = handleError;
    window.addEventListener("unhandledrejection", handleUnhandledRejection);
}
