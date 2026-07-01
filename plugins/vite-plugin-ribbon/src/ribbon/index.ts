import fs from "fs/promises";
import path from "path";

import type { RibbonConfig } from "../common/typings.js";
import { RibbonBuilder } from "./factory.js";
import { logger } from "../common/index.js";

export async function writeRibbonXml(config: RibbonConfig, fileName: string): Promise<void> {
    const xmlContent = RibbonBuilder.render(config);
    const absolutePath = path.isAbsolute(fileName)
        ? fileName
        : path.resolve(process.cwd(), fileName);
    const dir = path.dirname(absolutePath);
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(absolutePath, xmlContent, "utf-8");
    logger.info(`Generated ${absolutePath}`);
}
