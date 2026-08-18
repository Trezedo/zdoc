import crypto from "node:crypto";
import path from "node:path";
import type { EnumEnhanceOptions } from "../common/typings.js";
import type { ScannedEnum } from "./scanner.js";

import { logger, writeIfChanged } from "../common/index.js";
import { scanWpsEnums } from "./scanner.js";
import { scanUsedEnums } from "./source-scanner.js";

/**
 * 从扫描数据库中获取指定枚举组的定义，并校验名称。
 * 如果传入空数组，返回空数组。
 */
export function getRegisteredEnums(groupNames: readonly string[]): ScannedEnum[] {
    const db = scanWpsEnums();
    const result: ScannedEnum[] = [];

    for (const name of groupNames) {
        const def = db.get(name);
        if (!def) {
            const available = [...db.keys()].sort();
            logger.error(`Unknown enum group: "${name}"`);
            logger.error(`Available: ${available.join(", ")}`);
            throw new Error(`Unknown enum group: "${name}"`);
        }
        result.push(def);
    }

    return result;
}

/**
 * 获取所有可用的 WPS 枚举组名（从扫描数据库中派生）。
 */
export function getAllEnumNames(): string[] {
    return [...scanWpsEnums().keys()].sort();
}

/**
 * 返回给定枚举组中所有平铺的枚举成员 key（已去重）。
 * 当不提供参数时，自动扫描源码推导。
 */
export function getFlatEnumKeys(
    groupNames?: readonly string[],
    options: {
        cwd?: string;
        sourceDirs?: string[];
        extensions?: string[];
    } = {},
): string[] {
    const groups =
        groupNames && groupNames.length > 0 ? groupNames : scanUsedEnums(options).usedGroups;

    const enums = getRegisteredEnums(groups);
    const seen = new Map<string, number>();

    for (const { members } of enums) {
        for (const [key, value] of Object.entries(members)) {
            if (seen.has(key) && seen.get(key) !== value) {
                logger.warn(
                    `Duplicate enum key "${key}" with different values: ${seen.get(key)} vs ${value}`,
                );
            }
            seen.set(key, value);
        }
    }

    return [...seen.keys()];
}

/**
 * 按实际使用的成员 key 过滤枚举组（返回新对象，不修改扫描数据库缓存）。
 *
 * 一个枚举组只要被 `usedGroups` 收录，就必然有至少一个成员在 `usedKeys` 中
 * （`scanUsedEnums` 由成员反推所属组），故过滤后不会产生空组。
 */
function filterEnumMembers(def: ScannedEnum, usedKeys: ReadonlySet<string>): ScannedEnum {
    const members: Record<string, number> = {};
    for (const [key, value] of Object.entries(def.members)) {
        if (usedKeys.has(key)) members[key] = value;
    }
    return { ...def, members };
}

/**
 * 统计导出的枚举组数与去重后的成员 key 数（用于日志）。
 */
function countExportedMembers(enums: ScannedEnum[]): {
    groupCount: number;
    keyCount: number;
} {
    const keys = new Set<string>();
    for (const def of enums) {
        for (const k of Object.keys(def.members)) keys.add(k);
    }
    return { groupCount: enums.length, keyCount: keys.size };
}

/**
 * 生成 `wps-enums.generated.ts` 文件内容。
 *
 * 直接硬编码官方 .d.ts 中提取的数值，作为具名常量导出。
 */
function buildEnumFileContent(registeredEnums: ScannedEnum[]): string {
    // 收集所有枚举成员键值对，重名时保留最先遇到的
    const keyToValue = new Map<string, number | string>();
    for (const def of registeredEnums) {
        for (const [key, value] of Object.entries(def.members)) {
            if (!keyToValue.has(key)) {
                keyToValue.set(key, value);
            }
        }
    }

    // 生成具名导出常量，直接硬编码数值
    const enumDeclarations = Array.from(keyToValue.entries())
        .map(([key, value]) => {
            // 数值可能是数字或字符串，按字面量输出
            const valStr = typeof value === "string" ? `'${value}'` : String(value);
            return `export const ${key} = ${valStr};`;
        })
        .join("\n");

    // 使用模板字符串返回完整文件内容
    return `// ⚠️ 此文件由 vite-plugin-wps-enhance 自动生成

${enumDeclarations}
`;
}

/**
 * 计算字符串的短哈希（用于日志中的内容指纹比对）。
 */
function contentHash(content: string): string {
    return crypto.createHash("sha1").update(content).digest("hex").slice(0, 8);
}

/**
 * 根据配置生成 `wps-enums.generated.ts` 文件。
 */
export async function generateEnumExports(
    options: EnumEnhanceOptions,
    isDev = false,
): Promise<void> {
    const t0 = performance.now();
    const { outputFile = "src/wps-enums.generated.ts" } = options;
    // dev：全量（不扫源码、不过滤）；build：仅用到（扫源码 + 成员级过滤）
    const onlyUsedMembers = !isDev && (options.onlyUsedMembers ?? true);

    // dev 取全量组名；build 扫源码推导使用组与成员
    let groupNames: string[];
    let usedKeys: string[] = [];
    if (isDev) {
        groupNames = getAllEnumNames();
    } else {
        const scanned = scanUsedEnums({
            cwd: process.cwd(),
            sourceDirs: options.sourceDirs,
            extensions: options.extensions,
        });
        usedKeys = scanned.usedKeys;
        groupNames = scanned.usedGroups;
    }

    if (groupNames.length === 0) {
        logger.warn("No enum groups detected in source, skipping enum exports generation");
        return;
    }

    const t1 = performance.now();
    const registeredEnums = getRegisteredEnums(groupNames);

    // 组内成员级过滤（仅 build 默认开启）：只保留源码中实际引用的成员。
    // wps.Enum.xxx 不受影响，WPS 宿主运行时天然支持。
    const usedKeySet = onlyUsedMembers && usedKeys.length > 0 ? new Set(usedKeys) : null;
    const exportedEnums = usedKeySet
        ? registeredEnums.map((def) => filterEnumMembers(def, usedKeySet))
        : registeredEnums;

    const t2 = performance.now();
    const content = buildEnumFileContent(exportedEnums);
    const t3 = performance.now();

    const absolutePath = path.isAbsolute(outputFile)
        ? outputFile
        : path.resolve(process.cwd(), outputFile);

    const changed = await writeIfChanged(absolutePath, content);
    const t4 = performance.now();

    const { groupCount, keyCount } = countExportedMembers(exportedEnums);
    const profile =
        `discover=${(t1 - t0).toFixed(0)}ms filter=${(t2 - t1).toFixed(0)}ms ` +
        `build=${(t3 - t2).toFixed(0)}ms write=${(t4 - t3).toFixed(0)}ms total=${(t4 - t0).toFixed(0)}ms`;
    const keysLabel = onlyUsedMembers ? `${keyCount} used keys` : `${keyCount} keys`;

    if (changed) {
        logger.info(
            `Generated enum exports: ${absolutePath} (${groupCount} groups, ${keysLabel}) [${profile} hash=${contentHash(content)}]`,
        );
    } else {
        logger.info(
            `Skipped enum exports (unchanged): ${absolutePath} (${groupCount} groups, ${keysLabel}) [${profile}]`,
        );
    }
}
