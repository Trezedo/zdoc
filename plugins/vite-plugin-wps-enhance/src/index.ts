import type { Plugin } from "vite";
import type { ImageTypeOptions, WpsEnhanceOptions } from "./common/typings.js";

import { FSWatcher } from "chokidar";

import { generateImageTypes, setupImageWatcher } from "./image/index.js";
import { writeRibbonXml } from "./ribbon/index.js";

export * from "./ribbon/factory.js";
export * from "./common/typings.js";

/**
 * WPS 加载项增强插件。
 *
 * 集成以下能力（均可选）：
 * - `ribbon`: 生成 `ribbon.xml` + 图片类型声明文件（`ribbon-images.d.ts`），开发模式监听图片目录变化
 */
export function wpsEnhancePlugin(options: WpsEnhanceOptions): Plugin {
    const { ribbon } = options;

    const imageTypeConfig: ImageTypeOptions = {
        imagesDir: "public/images",
        outputFile: "src/ribbon-images.d.ts",
        watch: true,
    };

    let imageWatcher: FSWatcher | null = null;

    return {
        name: "vite-plugin-wps-enhance",
        async configureServer() {
            const tasks: Promise<void>[] = [];
            if (ribbon) {
                const { config, fileName = "ribbon.xml" } = ribbon;
                tasks.push(writeRibbonXml(config, fileName));
                tasks.push(generateImageTypes(process.cwd(), config, imageTypeConfig));
            }

            await Promise.all(tasks);
            // 开发模式下监听图片目录变化
            if (ribbon && imageTypeConfig.watch) {
                imageWatcher = setupImageWatcher(process.cwd(), ribbon.config, imageTypeConfig);
            }
        },
        async writeBundle() {
            const tasks: Promise<void>[] = [];
            if (ribbon) {
                const { config, fileName = "ribbon.xml" } = ribbon;
                tasks.push(writeRibbonXml(config, fileName));
                tasks.push(generateImageTypes(process.cwd(), config, imageTypeConfig));
            }
            await Promise.all(tasks);
        },
        async buildEnd() {
            // 清理 watcher
            if (imageWatcher) {
                await imageWatcher.close();
                imageWatcher = null;
            }
        },
    };
}
