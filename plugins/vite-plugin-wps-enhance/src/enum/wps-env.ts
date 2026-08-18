import path from "path";
import type { EnumEnhanceOptions } from "../common/typings.js";
import type { ScannedEnum } from "./scanner.js";

import { logger, writeIfChanged } from "../common/index.js";
import { getAllEnumNames, getRegisteredEnums } from "./index.js";
import { scanUsedEnums } from "./source-scanner.js";

/**
 * 计算从 `fromFile` 到 `toFile`（不含扩展名）的相对导入路径。
 */
function getRelativeImportPath(fromFile: string, toFile: string): string {
    const fromDir = path.dirname(fromFile);
    const toWithoutExt = toFile.replace(/\.[jt]s$/, "");
    let relative = path.relative(fromDir, toWithoutExt).replace(/\\/g, "/");
    if (!relative.startsWith(".")) {
        relative = "./" + relative;
    }
    return relative;
}

/**
 * 生成 `wps-env.d.ts` 文件内容。
 *
 * 导出所有 WPS 裸名枚举及其 Group
 */
function buildWpsEnvContent(registeredEnums: ScannedEnum[], enumImportPath: string): string {
    // 动态部分： WpsNewEnumGenerated 的声明合并（枚举组名 → WPS 枚举类型）
    const registryEntries = registeredEnums
        .map((def) => `        ${def.name}: typeof ${def.namespace}.${def.name};`)
        .join("\n");

    // 为每个成员生成 declare const，提供裸名补全与类型（指向生成的枚举导出文件）。
    const seen = new Set<string>();
    const lines: string[] = [];
    for (const def of registeredEnums) {
        for (const key of Object.keys(def.members)) {
            if (seen.has(key)) continue;
            seen.add(key);
            lines.push(`    const ${key}: typeof import("${enumImportPath}")["${key}"];`);
        }
    }
    const bareSection = lines.length > 0 ? `\n${lines.join("\n")}` : "";

    return `// ⚠️ 此文件由 vite-plugin-wps-enhance 自动生成
/// <reference types="vite-plugin-wps-enhance/global-types" />

export {};

declare global {
    interface WpsNewEnumGenerated {
${registryEntries}
    }

    interface WpsNewEnum extends WpsNewEnumGenerated {}
${bareSection}
}
`;
}

/**
 * 生成 `wps-env.d.ts` 全局类型声明文件。
 */
export async function generateWpsEnv(
    options: EnumEnhanceOptions,
    isDev = false,
    registeredEnums?: ScannedEnum[],
): Promise<void> {
    const { outputFile = "src/wps-enums.generated.ts", envFile = "src/wps-env.d.ts" } = options;

    // dev：全量组名；build：扫源码推导使用组
    if (!registeredEnums || registeredEnums.length === 0) {
        const groupNames = isDev
            ? getAllEnumNames()
            : scanUsedEnums({
                  cwd: process.cwd(),
                  sourceDirs: options.sourceDirs,
                  extensions: options.extensions,
              }).usedGroups;
        registeredEnums = getRegisteredEnums(groupNames);
    }

    const projectRoot = process.cwd();

    const enumFileAbsolute = path.isAbsolute(outputFile)
        ? outputFile
        : path.resolve(projectRoot, outputFile);
    const envFileAbsolute = path.isAbsolute(envFile) ? envFile : path.resolve(projectRoot, envFile);

    const enumImportPath = getRelativeImportPath(envFileAbsolute, enumFileAbsolute);

    const content = buildWpsEnvContent(registeredEnums, enumImportPath);

    const changed = await writeIfChanged(envFileAbsolute, content);
    if (changed) {
        logger.info(
            `Generated wps-env: ${envFileAbsolute} (${registeredEnums.length} enum groups${isDev ? ", dev full" : ""})`,
        );
    } else {
        logger.info(
            `Skipped wps-env (unchanged): ${envFileAbsolute} (${registeredEnums.length} enum groups${isDev ? ", dev full" : ""})`,
        );
    }
}
