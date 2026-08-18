import fs from "node:fs/promises";
import path from "node:path";

import pc from "picocolors";

const TAG = "[vite-plugin-wps-enhance]";

export const logger = {
    info: (msg: string) =>
        console.log(
            `${pc.gray(new Date().toLocaleTimeString())} ${pc.bold(pc.cyan(TAG))} ${pc.green(msg)}`,
        ),
    warn: (msg: string) =>
        console.warn(`${pc.gray(new Date().toLocaleTimeString())} ${pc.bold(pc.cyan(TAG))} ${msg}`),
    error: (msg: string, err?: unknown) =>
        console.error(
            `${pc.gray(new Date().toLocaleTimeString())} ${pc.bold(pc.cyan(TAG))} ${msg}`,
            err,
        ),
};

/**
 * 写入文件前比较内容：完全相同时跳过写入，避免触发 Vite 不必要的 HMR / 依赖重新优化。
 *
 * @returns `true` 如果写入了文件，`false` 如果内容未变化跳过了写入。
 */
export async function writeIfChanged(absolutePath: string, content: string): Promise<boolean> {
    try {
        const existing = await fs.readFile(absolutePath, "utf-8");
        if (existing === content) {
            return false;
        }
    } catch {
        // 文件不存在，正常写入
    }
    await fs.mkdir(path.dirname(absolutePath), { recursive: true });
    await fs.writeFile(absolutePath, content, "utf-8");
    return true;
}
