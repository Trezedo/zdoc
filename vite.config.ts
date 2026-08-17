import { fileURLToPath, URL } from "node:url";

import legacy from "@vitejs/plugin-legacy";
import vue from "@vitejs/plugin-vue";
import { ribbonPlugin } from "#vite-plugin-ribbon";
import AutoImport from "unplugin-auto-import/vite";
import { NaiveUiResolver } from "unplugin-vue-components/resolvers";
import Components from "unplugin-vue-components/vite";
import { defineConfig } from "vite";
import bundleObfuscator from "vite-plugin-bundle-obfuscator";
import VueRouter from "vue-router/vite";

import { xmlConfig } from "./src/jsa/ribbon/xmlConfig.ts";

export default defineConfig({
    base: "./",
    build: {
        rolldownOptions: {
            output: {
                codeSplitting: {
                    groups: [
                        { name: "vendor", test: "node_modules" },
                        {
                            name: "main",
                            test: (id) => {
                                const normalized = id.replace(/\\/g, "/");
                                // 在 src 目录下的 ts/vue 文件
                                const isInSrc = normalized.includes("/src/");
                                const isTargetExt = /\.([jt]s|vue)$/.test(normalized);
                                // 排除 dialogs 目录
                                const isInDialogs = normalized.includes("/components/dialogs/");

                                return isInSrc && !isInDialogs && isTargetExt;
                            },
                        },
                    ],
                },
            },
        },
        chunkSizeWarningLimit: 1000,
    },
    plugins: [
        VueRouter({
            // 注意：必须放在 vue() 插件之前
            routesFolder: "src/views", // 指定待生成自动路由文件夹
            dts: "./src/typed-router.d.ts",
        }),
        vue(),
        AutoImport({
            resolvers: [NaiveUiResolver()],
            imports: [
                "vue",
                "vue-router",
                {
                    "naive-ui": ["useDialog", "useMessage", "useNotification", "useLoadingBar"],
                },
            ],
            dts: "src/auto-imports.d.ts",
        }),
        Components({
            resolvers: [NaiveUiResolver()],
            dts: "src/components.d.ts",
            // 仅扫描必要目录
            dirs: ["src/components", "src/views"],
            // 限制文件扩展名，只处理 .vue
            extensions: ["vue"],
            exclude: [/node_modules/, /\.test\.vue$/],
        }),
        // 加载项 UI 配置
        ribbonPlugin({ config: xmlConfig, fileName: "./public/ribbon.xml" }),

        bundleObfuscator({
            // 指定需要混淆的 chunk 名称（与 manualChunks 中定义的一致）
            excludes: ["polyfills", "rolldown-runtime", "vendor", "index"], // 排除第三方库，但似乎效果不太理想，暂时放弃
            options: {
                unicodeEscapeSequence: true, // 字符串字面量 → Unicode 转义序列
                transformObjectKeys: false, // 点语法 → 方括号语法 启用后与 legacy 不兼容
                stringArray: true, // 将所有字符串字面量提取到一个全局数组中，然后通过数组索引访问
                // https://obfuscator.io/docs/basic-obfuscation/string-array
                stringArrayEncoding: ["base64", "rc4"], // 对 stringArray 中存储的字符串进行编码
                controlFlowFlattening: true, // 将代码的控制流（if/else, while, for 等）扁平化，打乱逻辑顺序，插入 switch 结构
                deadCodeInjection: true, // 随机注入死代码
                selfDefending: true, // 开启后，代码被格式化则无法执行
                debugProtection: true, // 让开发者工具的 debugger 功能无法使用
            },
        }),
        // legacy 通常放在最后
        legacy({
            targets: ["chrome 85"], // 指定目标浏览器版本
            additionalLegacyPolyfills: ["regenerator-runtime/runtime"],
            renderModernChunks: false, // 不生成现代版 chunk
            renderLegacyChunks: true,
        }),
    ],
    resolve: {
        alias: {
            "@": fileURLToPath(new URL("./src", import.meta.url)),
        },
    },

    server: {
        host: "0.0.0.0",
    },
});
