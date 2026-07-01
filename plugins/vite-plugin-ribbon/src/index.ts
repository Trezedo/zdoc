import type { Plugin } from "vite";
import { FSWatcher } from "chokidar";

import type { ImageTypeOptions, RibbonPluginOptions } from "./common/typings.js";
import { writeRibbonXml } from "./ribbon/index.js";
import { generateImageTypes, setupImageWatcher } from "./image/index.js";

export * from "./ribbon/factory.js";
export * from "./common/typings.js";

export function ribbonPlugin(options: RibbonPluginOptions): Plugin {
    const { config, fileName = "ribbon.xml" } = options;

    const imageTypeConfig: ImageTypeOptions = {
        imagesDir: "public/images",
        outputFile: "src/ribbon-images.d.ts",
        watch: true,
    };

    let imageWatcher: FSWatcher | null = null;

    return {
        name: "vite-plugin-ribbon",
        async configureServer() {
            await Promise.all([
                writeRibbonXml(config, fileName),
                generateImageTypes(process.cwd(), config, imageTypeConfig),
            ]);
            // 开发模式下监听图片目录变化
            if (imageTypeConfig.watch) {
                imageWatcher = setupImageWatcher(process.cwd(), config, imageTypeConfig);
            }
        },
        async writeBundle() {
            await Promise.all([
                writeRibbonXml(config, fileName),
                generateImageTypes(process.cwd(), config, imageTypeConfig),
            ]);
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
