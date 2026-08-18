import fs from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";

import { logger } from "../common/index.js";

/**
 * 扫描到的枚举定义。
 */
export interface ScannedEnum {
    /** 枚举组名，如 `WdColor`、`MsoTriState` */
    name: string;
    /** 所属命名空间：
     *
     * 由所在 `.d.ts` 文件声明的 `declare namespace` 决定
     * （`lib.kso.d.ts` → `Kso`，`lib.wps.d.ts` → `Wps`）
     */
    namespace: "Kso" | "Wps";
    /** 成员名 → 数值 */
    members: Record<string, number>;
}

/**
 * 扫描结果：枚举组名 → 定义。
 */
export type EnumDatabase = Map<string, ScannedEnum>;

// ---- 文件解析 ----

/**
 * 从 `.d.ts` 内容中提取所有 `enum Name { member = value, ... }` 定义。
 *
 * 解析逻辑：
 * 1. 用正则找到所有 `enum Name {` 的起始位置
 * 2. 用花括号深度匹配找到对应的 `}`
 * 3. 在枚举体内用正则提取 `member = value` 条目
 *
 * 仅解析数值型成员（`name = <number>`），忽略字符串/引用型。
 */
export function scanEnums(dtsContent: string): EnumDatabase {
    const result: EnumDatabase = new Map();

    // 从文件内容检测所属命名空间：`declare namespace Kso` / `declare namespace Wps`。
    // lib.kso.d.ts 声明 Kso，lib.wps.d.ts 声明 Wps；按文件来源区分比按枚举名前缀
    // （`Mso*`→Kso）推断更准确——后者会把 `BackstageGroupStyle` 等非 `Mso` 开头的
    // Kso 枚举错判为 Wps。
    const nsMatch = /\bdeclare\s+namespace\s+(\w+)\b/.exec(dtsContent);
    const detectedNs = nsMatch?.[1];

    // 匹配 `enum Name {`（前面可能有 `declare`、空白、tab）
    const enumStartRegex = /\benum\s+(\w+)\s*\{/g;

    let match: RegExpExecArray | null;
    while ((match = enumStartRegex.exec(dtsContent)) !== null) {
        const name = match[1];
        const bodyStart = match.index + match[0].length;

        // 用花括号深度匹配找到闭合 `}`
        let depth = 1;
        let i = bodyStart;
        while (depth > 0 && i < dtsContent.length) {
            if (dtsContent[i] === "{") depth++;
            else if (dtsContent[i] === "}") depth--;
            i++;
        }

        if (depth !== 0) {
            logger.warn(`Failed to find closing brace for enum ${name}, skipping`);
            continue;
        }

        const body = dtsContent.slice(bodyStart, i - 1);

        // 解析成员：`memberName = numberValue`
        const members: Record<string, number> = {};
        const memberRegex = /(\w+)\s*=\s*(-?\d+)/g;
        let memberMatch: RegExpExecArray | null;
        while ((memberMatch = memberRegex.exec(body)) !== null) {
            members[memberMatch[1]] = parseInt(memberMatch[2], 10);
        }

        if (Object.keys(members).length === 0) {
            continue;
        }

        // 推断命名空间：优先用文件声明的 `declare namespace`；未检测到或非
        // `Kso`/`Wps` 时退回按名称前缀推断（`Mso*` → `Kso`，其余 → `Wps`）。
        const namespace: "Kso" | "Wps" =
            detectedNs === "Kso" || detectedNs === "Wps"
                ? detectedNs
                : name.startsWith("Mso")
                  ? "Kso"
                  : "Wps";
        result.set(name, { name, namespace, members });
    }

    return result;
}

// ---- 路径解析 ----

let cachedPkgDir: string | null = null;
/**
 * 解析 `wps-jsapi-declare` 包目录（带进程内缓存）。
 */
function resolveWpsDeclareDir(): string {
    if (cachedPkgDir) return cachedPkgDir;
    const require = createRequire(path.join(process.cwd(), "package.json"));
    let pkgDir: string;
    try {
        const indexPath = require.resolve("wps-jsapi-declare");
        pkgDir = path.dirname(indexPath);
    } catch {
        throw new Error(
            '[vite-plugin-wps-enhance] 无法解析 "wps-jsapi-declare"。请确认已安装：pnpm add -D wps-jsapi-declare',
        );
    }
    cachedPkgDir = pkgDir;
    return pkgDir;
}

/**
 * 解析 `wps-jsapi-declare` 包中所有 `.d.ts` 文件的路径。
 *
 * 该包通过 `index.d.ts` 引用 `lib.wps.d.ts` 和 `lib.kso.d.ts`，
 * 枚举分散在这两个文件中（`Wps` 命名空间在 wps，`Kso` 命名空间在 kso）。
 */
export function resolveWpsDtsPaths(): string[] {
    const pkgDir = resolveWpsDeclareDir();
    const candidates = ["lib.wps.d.ts", "lib.kso.d.ts"];
    const paths: string[] = [];
    for (const file of candidates) {
        const fullPath = path.join(pkgDir, file);
        if (fs.existsSync(fullPath)) {
            paths.push(fullPath);
        }
    }

    if (paths.length === 0) {
        throw new Error(
            `[vite-plugin-wps-enhance] 在 ${pkgDir} 下未找到 lib.wps.d.ts / lib.kso.d.ts`,
        );
    }

    return paths;
}

// ---- 扫描缓存 ----

let cachedDatabase: EnumDatabase | null = null;

/**
 * 落盘缓存文件路径（相对项目根目录）。
 *
 * 缓存 `scanWpsEnums` 的结果，使 dev 重启 / 多次 build 不必重新解析
 * `wps-jsapi-declare` 的两个 `.d.ts`（首扫约 16ms，命中落盘后 <1ms）。
 */
const DISK_CACHE_PATH = path.join(
    process.cwd(),
    "node_modules",
    ".cache",
    "vite-plugin-wps-enhance",
    "enums-db.json",
);

/**
 * 计算缓存失效 key：`wps-jsapi-declare` 版本 + 两个 `.d.ts` 的 mtime/size。
 *
 * 任一项变化（升级版本、改动 .d.ts）都会令缓存失效并触发重扫，
 * 否则直接复用上一次的扫描数据库。
 */
function computeCacheKey(): string {
    const pkgDir = resolveWpsDeclareDir();
    let version = "unknown";
    try {
        const pkg = JSON.parse(fs.readFileSync(path.join(pkgDir, "package.json"), "utf-8"));
        version = pkg?.version ?? "unknown";
    } catch {
        // 读取版本失败不影响正确性，仅令 key 退化为 unknown
    }
    const stats = resolveWpsDtsPaths()
        .map((p) => {
            try {
                const s = fs.statSync(p);
                return `${path.basename(p)}:${s.mtimeMs}:${s.size}`;
            } catch {
                return `${path.basename(p)}:0:0`;
            }
        })
        .join(";");
    return `v2|${version}|${stats}`;
}

/**
 * 读取落盘缓存；key 不匹配或解析失败时返回 null。
 */
function readDiskCache(expectedKey: string): EnumDatabase | null {
    try {
        const raw = fs.readFileSync(DISK_CACHE_PATH, "utf-8");
        const parsed = JSON.parse(raw) as { key: string; db: Record<string, ScannedEnum> };
        if (parsed.key !== expectedKey) return null;
        const db: EnumDatabase = new Map();
        for (const [name, def] of Object.entries(parsed.db)) {
            db.set(name, def);
        }
        return db;
    } catch {
        return null;
    }
}

/**
 * 写入落盘缓存（失败静默——缓存只是加速，不影响正确性）。
 */
function writeDiskCache(key: string, db: EnumDatabase): void {
    try {
        fs.mkdirSync(path.dirname(DISK_CACHE_PATH), { recursive: true });
        const obj: Record<string, ScannedEnum> = {};
        for (const [name, def] of db) obj[name] = def;
        fs.writeFileSync(DISK_CACHE_PATH, JSON.stringify({ key, db: obj }), "utf-8");
    } catch {
        // ignore
    }
}

/**
 * 扫描 `wps-jsapi-declare` 的 `.d.ts` 文件，返回所有枚举定义。
 *
 * 三级缓存：进程内 → 落盘 → 实扫。
 * - dev 重启 / 多次 build 共享同一份落盘缓存
 * - `wps-jsapi-declare` 升级或 `.d.ts` 被改动时自动失效重扫
 */
export function scanWpsEnums(): EnumDatabase {
    if (cachedDatabase) return cachedDatabase;

    const cacheKey = computeCacheKey();
    const t1 = performance.now();

    const disk = readDiskCache(cacheKey);
    if (disk) {
        cachedDatabase = disk;
        const t2 = performance.now();
        logger.info(`Loaded ${disk.size} enums from disk cache (${(t2 - t1).toFixed(0)}ms)`);
        return disk;
    }

    const paths = resolveWpsDtsPaths();
    const db: EnumDatabase = new Map();

    for (const filePath of paths) {
        const content = fs.readFileSync(filePath, "utf-8");
        const scanned = scanEnums(content);
        for (const [name, def] of scanned) {
            db.set(name, def);
        }
    }

    const t2 = performance.now();
    cachedDatabase = db;
    writeDiskCache(cacheKey, db);
    logger.info(`Scanned ${db.size} enums from wps-jsapi-declare (${(t2 - t1).toFixed(0)}ms)`);
    return db;
}
