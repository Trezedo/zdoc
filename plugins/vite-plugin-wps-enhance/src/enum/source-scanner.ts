import fs from "node:fs";
import path from "node:path";

import { logger } from "../common/index.js";
import { scanWpsEnums } from "./scanner.js";

/**
 * 源码扫描结果缓存。
 *
 * 缓存 key: cwd + sourceDirs + extensions 的哈希，value: UsedEnumsResult
 */
let _scanCache: Map<string, UsedEnumsResult> | null = null;

function getScanCache(): Map<string, UsedEnumsResult> {
    if (!_scanCache) {
        _scanCache = new Map();
    }
    return _scanCache;
}

function cacheKey(cwd: string, sourceDirs: string[], extensions: string[]): string {
    return `${cwd}|${sourceDirs.join(";")}|${extensions.join(";")}`;
}

/**
 * 源码中允许裸名引用的枚举成员。
 *
 * 命名规则：
 * - `mso*` — Mso 系列枚举成员（如 `msoTrue`、`msoFileDialogFolderPicker`）
 * - `wd*`  — Wd 系列枚举成员（如 `wdLineSpaceExactly`、`wdAlignParagraphCenter`）
 */
const ENUM_KEY_PATTERN = /\b(mso[A-Z]\w*|wd[A-Z]\w*)\b/g;

/**
 * 默认源码扫描根目录（相对于项目根目录）。
 */
const DEFAULT_SOURCE_DIRS = ["src"];

/**
 * 默认扫描的文件扩展名。
 */
const DEFAULT_EXTENSIONS = [".ts", ".tsx", ".vue", ".js", ".jsx"];

/**
 * 扫描结果结构。
 */
export interface UsedEnumsResult {
    /** 源码中实际使用到的枚举成员 key 列表 */
    usedKeys: string[];
    /** usedKeys 所属的枚举组名列表 */
    usedGroups: string[];
    /** 扫描到的源码文件数 */
    scannedFiles: number;
    /** 扫描耗时（毫秒） */
    elapsedMs: number;
}

/**
 * 检查文件路径是否在排除列表中（声明文件、生成文件、测试文件等）。
 */
function isExcluded(filePath: string): boolean {
    return (
        filePath.endsWith(".d.ts") ||
        filePath.endsWith(".generated.ts") ||
        filePath.includes("node_modules") ||
        filePath.includes("dist") ||
        /\.(test|spec)\.(ts|tsx|vue|js)$/.test(filePath)
    );
}

/**
 * 递归扫描目录，返回所有符合扩展名且未排除的源码文件绝对路径。
 */
function walkDir(rootDir: string, extensions: string[]): string[] {
    const results: string[] = [];

    if (!fs.existsSync(rootDir)) {
        return results;
    }

    const stack = [rootDir];
    while (stack.length > 0) {
        const dir = stack.pop()!;
        let entries: fs.Dirent[];
        try {
            entries = fs.readdirSync(dir, { withFileTypes: true });
        } catch {
            continue;
        }

        for (const entry of entries) {
            const fullPath = path.join(dir, entry.name);
            if (entry.isDirectory()) {
                if (!isExcluded(fullPath)) {
                    stack.push(fullPath);
                }
            } else if (entry.isFile()) {
                if (extensions.some((ext) => entry.name.endsWith(ext)) && !isExcluded(fullPath)) {
                    results.push(fullPath);
                }
            }
        }
    }

    return results;
}

/**
 * 从单个源码文件中提取所有疑似枚举成员的标识符（词法匹配）。
 */
function extractEnumKeysFromFile(filePath: string): Set<string> {
    const content = fs.readFileSync(filePath, "utf-8");
    const keys = new Set<string>();
    let match: RegExpExecArray | null;

    ENUM_KEY_PATTERN.lastIndex = 0;
    while ((match = ENUM_KEY_PATTERN.exec(content)) !== null) {
        keys.add(match[1]);
    }

    return keys;
}

/**
 * 扫描源码目录，识别实际使用的 WPS 枚举，并推导出所属的枚举组。
 */
export function scanUsedEnums(
    options: {
        cwd?: string;
        sourceDirs?: string[];
        extensions?: string[];
    } = {},
): UsedEnumsResult {
    const cwd = options.cwd ?? process.cwd();
    const sourceDirs = options.sourceDirs ?? DEFAULT_SOURCE_DIRS;
    const extensions = options.extensions ?? DEFAULT_EXTENSIONS;

    // 命中缓存则直接返回
    const cache = getScanCache();
    const key = cacheKey(cwd, sourceDirs, extensions);
    const cached = cache.get(key);
    if (cached) {
        return cached;
    }

    const t0 = performance.now();

    // 构建反向索引：key → groupName（从 wps-jsapi-declare 扫描结果）
    const db = scanWpsEnums();
    const keyToGroup = new Map<string, string>();
    for (const [groupName, { members }] of db) {
        for (const k of Object.keys(members)) {
            if (!keyToGroup.has(k)) keyToGroup.set(k, groupName);
        }
    }

    // 扫描源码，提取所有 mso/wd 标识符
    const rawKeys = new Set<string>();
    let scannedFiles = 0;

    for (const dir of sourceDirs) {
        const absDir = path.isAbsolute(dir) ? dir : path.resolve(cwd, dir);
        const files = walkDir(absDir, extensions);
        for (const file of files) {
            const keys = extractEnumKeysFromFile(file);
            for (const k of keys) {
                rawKeys.add(k);
            }
            scannedFiles++;
        }
    }

    // 过滤：只保留 WPS 枚举数据库中真实存在的 key
    const usedKeys = new Set<string>();
    const usedGroups = new Set<string>();

    for (const k of rawKeys) {
        const group = keyToGroup.get(k);
        if (group) {
            usedKeys.add(k);
            usedGroups.add(group);
        }
    }

    const t1 = performance.now();
    const elapsedMs = t1 - t0;
    const result: UsedEnumsResult = {
        usedKeys: [...usedKeys].sort(),
        usedGroups: [...usedGroups].sort(),
        scannedFiles,
        elapsedMs,
    };

    logger.info(
        `Scanned source: ${scannedFiles} files → ${result.usedKeys.length} enum keys (${result.usedGroups.length} groups) (${elapsedMs.toFixed(0)}ms)`,
    );

    cache.set(key, result);
    return result;
}
