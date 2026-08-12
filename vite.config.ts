import { fileURLToPath, URL } from "node:url";
import vue from "@vitejs/plugin-vue";
import { ribbonPlugin } from "#vite-plugin-ribbon";
import AutoImport from "unplugin-auto-import/vite";
import { NaiveUiResolver } from "unplugin-vue-components/resolvers";
import Components from "unplugin-vue-components/vite";
import { defineConfig } from "vite";
import bundleObfuscator from "vite-plugin-bundle-obfuscator";
import VueRouter from "vue-router/vite";

import { xmlConfig } from "./src/jsa/ribbon/xmlConfig";

export default defineConfig({
    base: "./",
    build: {
        rollupOptions: {
            output: {
                manualChunks(id) {
                    // if (id.includes("/views/")) return "sfc";
                    // if (id.includes(".ts")) return "core";
                    // return null;
                    return "all"; // 同类型 js, css 打包进同一个文件
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
                "pinia",
                {
                    "naive-ui": ["useDialog", "useMessage", "useNotification", "useLoadingBar"],
                },
            ],
            dts: "src/auto-imports.d.ts",
        }),
        Components({
            resolvers: [NaiveUiResolver()],
            dts: "src/components.d.ts",
        }),
        // 加载项 UI 配置
        ribbonPlugin({ config: xmlConfig, fileName: "./public/ribbon.xml" }),
        bundleObfuscator({
            // 指定需要混淆的 chunk 名称（与 manualChunks 中定义的一致）
            excludes: [], // 排除第三方库，但似乎效果不太理想，暂时放弃
            options: {
                unicodeEscapeSequence: true, // 字符串字面量 → Unicode 转义序列
                transformObjectKeys: true, // 点语法 → 方括号语法
                stringArray: true, // 将所有字符串字面量提取到一个全局数组中，然后通过数组索引访问
                // https://obfuscator.io/docs/basic-obfuscation/string-array
                stringArrayEncoding: ["base64", "rc4"], // 对 stringArray 中存储的字符串进行编码
                controlFlowFlattening: true, // 将代码的控制流（if/else, while, for 等）扁平化，打乱逻辑顺序，插入 switch 结构
                deadCodeInjection: false, // 向代码中随机注入永远不会执行的死代码
                selfDefending: true, // 如果混淆后的代码被格式化、美化或调试，它会故意触发错误或进入死循环
                debugProtection: true, // 禁止在浏览器开发工具中调试代码，尝试调试会触发错误
            },
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
