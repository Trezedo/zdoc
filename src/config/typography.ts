import type { TypographyConfig } from "@/jsa/types";
import { loadGovDocConfigFromFile } from "@/jsa/utils/document";

/**
 * 返回默认的公文样式配置（符合党政机关公文格式规范）
 *  - 正文：仿宋_GB2312，三号（16磅），固定行距28.95磅，首行缩进2字符，两端对齐
 *  - 标题：方正小标宋简体，二号（22磅），居中，无缩进
 *  - 抬头：楷体_GB2312，顶格（无缩进，由代码控制）
 *  - 一级标题：黑体
 *  - 二级标题：楷体_GB2312
 *  - 三级标题：加粗
 *  - 小标题：加粗
 */
export function getDefaultTypoConfig(): TypographyConfig {
    return (() => ({
        // 公文标题
        title: {
            zh: "方正小标宋_GBK",
            en: "方正小标宋_GBK",
            size: 22, // 二号
            spacing: 28.95,
        },
        main: {
            zh: "仿宋_GB2312",
            en: "Times New Roman",
            size: 16, // 三号
            spacing: 28.95,
            indent: 2,
        },
        salutation: { font: "楷体_GB2312", bold: false },
        h1: { font: "黑体", bold: false },
        h2: { font: "楷体_GB2312", bold: false },
        h3: { font: "仿宋_GB2312", bold: true },
        topicBoldMode: "prefix",
    }))();
}

export function getTypoConfigWithDefault(): TypographyConfig {
    const localConfig = loadGovDocConfigFromFile();
    if (localConfig && localConfig.typography) return localConfig.typography;

    return getDefaultTypoConfig();
}
