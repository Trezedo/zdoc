/**
 * 获取当前页面的基础 URL（协议 + 域名 + 端口 + 路径目录）
 * 例如：http://127.0.0.1:3889/ 或 http://127.0.0.1:3889/subpath/
 * 也可能是 file:///.../kingsoft/wps/jsaddons/xxx_1.0.0/index.html#/subpath/
 */
function getBaseUrl(): string {
    const { protocol, host, pathname } = window.location;

    // 如果 pathname 以 '/' 结尾，说明是目录，直接使用
    if (pathname.endsWith("/")) {
        return `${protocol}//${host}${pathname}`;
    }

    // 否则可能是文件路径（如 /index.html），去掉文件名部分
    const lastSlash = pathname.lastIndexOf("/");
    const basePath = lastSlash >= 0 ? pathname.slice(0, lastSlash + 1) : "/";
    return `${protocol}//${host}${basePath}`;
}

/**
 * 生成 Vue Router (Hash 模式) 下的完整 URL
 * @param routePath - 路由路径，例如 'dialog' 或 '/dialog'
 * @returns 完整 URL，例如 'http://127.0.0.1:3889/#/dialog' 或 'file:///.../index.html#/dialog'
 */
export function getRouterUrl(routePath: string) {
    const base = getBaseUrl();
    // 确保 base 以 '/' 结尾
    let normalizedBase = base.endsWith("/") ? base : `${base}/`;

    // 如果是 file: 协议，并且 normalizedBase 看起来像一个目录（没有 .html 等文件后缀）
    // 则自动补上默认入口文件名（例如 index.html）
    if (window.location.protocol === "file:") {
        // 检查 base 是否已经以 .html / .htm 结尾（防止重复添加）
        const hasHtmlFile = /\.html?$/i.test(normalizedBase);
        if (!hasHtmlFile) {
            // 你可以修改这里的默认文件名，比如 "taskpane.html" 或 "index.html"
            normalizedBase = normalizedBase + "index.html";
        }
    }

    // 清理路由路径：去掉开头的 '/'
    const cleanPath = routePath.replace(/^\/+/, "");
    // 拼接标准 Hash 格式
    return `${normalizedBase}#/${cleanPath}`;
}
