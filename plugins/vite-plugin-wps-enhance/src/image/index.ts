import fs from "fs/promises";
import path from "path";
import type { ImageTypeOptions, RibbonConfig } from "../common/typings.js";

import { watch } from "chokidar";

import { logger, writeIfChanged } from "../common/index.js";
import { collectAllIds } from "../ribbon/collect-ids.js";

export async function generateImageTypes(
    root: string,
    config: RibbonConfig,
    { imagesDir, outputFile }: ImageTypeOptions,
): Promise<void> {
    const imagesAbsolutePath = path.resolve(root, imagesDir);
    const outputAbsolutePath = path.resolve(root, outputFile);
    const imageExtensions = /\.(png|jpe?g|gif|svg|webp|bmp|ico)$/i;

    try {
        // 确保图片目录存在（如果不存在则创建空目录）
        await fs.mkdir(imagesAbsolutePath, { recursive: true });
        const files = await fs.readdir(imagesAbsolutePath);
        const imageFiles = files.filter((f) => imageExtensions.test(f));
        const allIds = collectAllIds(config);
        if (imageFiles.length === 0) {
            logger.warn(`No images found in ${imagesAbsolutePath}`);
        }

        let content = `// 此文件由 vite-plugin-wps-enhance 自动生成\n// 图片目录: ${imagesAbsolutePath}\n\n`;
        if (allIds.length > 0) {
            const idsUnion = allIds.map((id) => `    | "${id}"`).join("\n");
            content += `// 所有 Ribbon 控件的 ID\ntype RibbonControlId =\n${idsUnion};\n\n`;
        } else {
            content += `// 未发现任何控件 ID\ntype RibbonControlId = never;\n\n`;
        }
        const typeUnion = imageFiles.map((f) => `    | "${f}"`).join("\n");
        content += `type ImageFileName =\n${imageFiles.length ? typeUnion : `""`};\n`;

        const changed = await writeIfChanged(outputAbsolutePath, content);
        if (changed) {
            logger.info(
                `Generated image types: ${outputAbsolutePath} (${imageFiles.length} images)`,
            );
        } else {
            logger.info(
                `Skipped image types (unchanged): ${outputAbsolutePath} (${imageFiles.length} images)`,
            );
        }
    } catch (err) {
        logger.error(`Failed to generate image types:`, err);
    }
}

export function setupImageWatcher(root: string, config: RibbonConfig, options: ImageTypeOptions) {
    const imagesPath = path.resolve(root, options.imagesDir);
    const watcher = watch(imagesPath, {
        ignoreInitial: true,
        persistent: true,
    });
    watcher.on("add", () => generateImageTypes(root, config, options));
    watcher.on("unlink", () => generateImageTypes(root, config, options));
    watcher.on("change", () => generateImageTypes(root, config, options));
    return watcher;
}
