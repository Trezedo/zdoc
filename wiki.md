# WPS 插件开发中 `main.ts` 的“条件引导启动”模式说明

## 📌 背景

在常规的 Vue 3 单页应用（SPA）开发中，我们通常这样写入口文件：

```ts
import { createApp } from "vue";

import App from "./App.vue";
import router from "./router";

const app = createApp(App);
app.use(router);
app.mount("#app");
```

这种写法在浏览器中运行良好，因为整个页面生命周期只执行一次，路由切换由 `vue-router` 在内存中完成。

但在 **WPS 加载项（Add-in）** 环境中，情况完全不同。

---

## 🤔 问题：弹窗为什么会有 2~3 秒的白屏延迟？

WPS 的 `Application.ShowDialog(url)` 会**新建一个独立的浏览器控件（CEF）窗口**，并**重新加载并执行**该 URL 对应的全部脚本。这意味着：

- 每次打开弹窗，`main.ts` 都会被**重新执行**。
- 如果 `main.ts` 像 SPA 那样全量加载（Vue + Router + Pinia + Stores + 全局组件库），那么每次弹窗都会重复加载这些代码。
- WPS 内置的 CEF 浏览器性能较弱（尤其较旧版本），解析执行数百 KB 的代码需耗时 2~3 秒，导致用户看到白屏。

---

## 💡 解决方案：基于 URL 参数的条件式引导加载

核心思想是 **让同一个 `main.ts` 在不同启动场景下加载不同的依赖**：

- **主任务窗格（TaskPane）**：需要完整功能，加载所有模块。
- **弹窗（Dialog）**：通常只展示少量内容，仅需 Vue + 对应组件。

通过读取 URL 查询参数（如 `?dialog=msg`），在 `main.ts` 开头进行分支判断，实现“按需加载”。

### 代码结构示例

```ts
import { createApp } from "vue";

import "@/styles/main.css";

// 收集所有弹窗组件
const dialogModules = import.meta.glob<{ default: import("vue").Component }>(
    "@/components/dialogs/*.vue",
);

const urlParams = new URLSearchParams(window.location.search);
const dialogType = urlParams.get("dialog");

(
    /**
     * 启动函数，根据 URL 参数判断启动模式：
     * - 弹窗模式：只加载 Vue + 对应组件，不加载主应用依赖 → 秒开。
     * - 主应用模式：完整加载，并预加载所有弹窗以便二次打开秒开。
     *
     * 自执行异步函数，避免顶层 await
     */
    async function boot() {
        if (dialogType) {
            // ========== 弹窗模式（极速加载） ==========
            // 注意：文件命名必须与 dialogType 完全一致（大小写敏感），建议统一小写
            const loader = dialogModules[`/src/components/dialogs/${dialogType}.vue`];
            if (!loader) {
                console.error(`未知弹窗类型: ${dialogType}`);
                document.body.innerHTML = `<div style="padding:20px;color:red;">未知弹窗类型: ${dialogType}</div>`;
                return;
            }

            try {
                // 加载弹窗组件
                const [module] = await Promise.all([loader()]);
                const app = createApp(module.default);
                app.mount("#app");
            } catch (err) {
                console.error(`加载弹窗失败: ${dialogType}`, err);
            }
        } else {
            // ========== 主应用模式 ==========
            try {
                const [
                    { default: App },
                    { setupRibbonBindings },
                    { router },
                    // 其他代码……
                ] = await Promise.all([
                    import("@/App.vue"),
                    import("@/jsa/ribbon/actions"),
                    import("@/router/"),
                ]);

                // 初始化 WPS 回调绑定
                setupRibbonBindings();

                const app = createApp(App);
                app.use(router);
                app.mount("#app");

                // 其他代码……
            } catch (err) {
                console.error("主应用初始化失败:", err);
            }
        }
    }
)();
```

---

## 🔍 为什么传统 Vue 项目没有这种写法？

| 特性               | 传统 SPA             | WPS 插件                 |
| ------------------ | -------------------- | ------------------------ |
| 运行环境           | 浏览器 Tab（单实例） | WPS CEF 多窗口（多实例） |
| `main.ts` 执行次数 | 1 次                 | 每次打开窗口都重新执行   |
| 路由切换           | 内存中替换组件       | 每次都是全新加载         |
| 优化目标           | 首屏加载速度         | **每次弹窗加载速度**     |

因此，**必须**在 `main.ts` 中区分“主应用”和“弹窗”两种启动模式，这是由多实例环境决定的。

---

## 📚 总结

这种“条件引导启动”模式，本质是**将入口文件作为一个“智能分发器”**，根据当前窗口的职责（主应用 vs 弹窗）决定加载最小必要的代码集。

它是 WPS 插件开发特有的实践，也适用于 Electron、浏览器扩展等多窗口/多实例场景。虽然在传统 Vue 项目中不常见，但在插件领域是成熟且必要的优化手段。

## 已知问题

### 1. 开发环境下点击自定义功能区（Ribbon）偶现卡顿

#### 现象描述

在 `pnpm dev` 开发模式下，启动 WPS 并点击插件的自定义选项卡（Tab）时，WPS 界面可能卡死，期间无法操作，只能终止后台应用程序。

经过测试，问题主要在于 XML 中的 `getImage`，该问题在生产打包后不会出现。

#### 影响范围

- 仅影响 `dev` 环境，不影响最终用户体验。
- 仅当 Ribbon 中的按钮使用了 `getImage` 回调时触发。

#### 规避方案（开发时）

- 启动 WPS 后，先点击其他选项卡（如“开始”或“插入”），等待 2~3 秒再切回本插件选项卡。
- 或在插件代码加载完成前（约 3 秒内）避免点击插件选项卡。

### 2. JS 加载项不支持 JSA 编辑器中的特性：

```js
function demo() {
    // 使用 CreateObject 创建 kwps.application 对象，这是控制 WPS 文字的入口
    const app = CreateObject("kwps.application");

    // 通过 Documents 集合的 Add 方法创建一个新文档
    const doc = app.Documents.Add();

    // 在新文档中插入文字
    doc.Content.Text = "Hello from WPS Spreadsheet!";
}
```

```js
// 在 WPS 文字（.docx）的 JS 宏中运行，自动创建一个新的 WPS 表格文件
function createNewExcel() {
    // 1. 创建 WPS 表格的应用实例
    const etApp = CreateObject("ket.application");
    // 2. 通过 Workbooks 集合的 Add 方法创建新工作簿
    const workbook = etApp.Workbooks.Add();
    // 3. 获取活动工作表对象
    const sheet = workbook.ActiveSheet;
    // 4. 向 A1 单元格写入数据
    sheet.Range("A1").Value2 = "Hello from WPS Writer!";
    // 5. 设置表格应用为可见状态，以便查看生成结果
    etApp.Visible = true;
}
```
