export interface TitleConfig {
    /**
     * 中文字体
     */
    zh: string;
    /**
     * 西文字体，如 "Times New Roman" 等
     */
    en?: string;
    /**
     * 字号磅值，如 16 对应 "三号"
     */
    size: number;
    /**
     * 行距，默认为固定磅值
     */
    spacing: number;
}

export interface MainConfig extends TitleConfig {
    /**
     * 首行缩进（字符数）
     */
    indent: number;
}

export interface SimpleFontConfig {
    font?: string; // 字体名称
    bold?: boolean; // 是否加粗，可选
}

/**
 * 小标题加粗模式
 *
 * - `auto`: 默认整句加粗，内容较长时按 "prefix" 模式处理
 * - `prefix`: 仅加粗段首的 2-3 个字（如"一是"、"二是"）
 * - `none`: 不加粗
 * - 未定义时（undefined）等同于 "auto"
 */
export type TopicBoldMode = "auto" | "prefix" | "none" | undefined;

/**
 * 完整排版配置
 */
export interface TypographyConfig {
    title: TitleConfig;
    /**
     * 正文
     */
    main: MainConfig;
    /**
     * 抬头 / 称谓，或主送机关
     */
    salutation: SimpleFontConfig;
    /**
     * 一级标题：一、二、...
     */
    h1: SimpleFontConfig;
    /**
     * 二级标题：（一）（二）...
     */
    h2: SimpleFontConfig;
    /**
     * 三级标题：1. 2. ...
     */
    h3: SimpleFontConfig;
    /**
     * 小标题加粗模式，或段落中对仗的"小标题"（一是...）
     */
    topicBoldMode: TopicBoldMode;
}

export interface PageLayoutOptions {
    /** 上边距（厘米） */
    top?: number;
    /** 下边距（厘米） */
    bottom?: number;
    /** 左边距（厘米） */
    left?: number;
    /** 右边距（厘米） */
    right?: number;
    /** 页眉距纸张顶端距离（厘米） */
    header?: number;
    /** 页脚距纸张底端距离（厘米） */
    footer?: number;
}

export interface HeaderFooterConfig {
    header: {
        content: string;
        alignment: "left" | "center" | "right";
        font: string;
        fontSize: number;
    };
    pagenum: {
        font: string;
        fontSize: number;
        position: "left" | "right" | "middle" | "inside" | "outside";
    };
}

export interface GovDocConfig {
    typography: TypographyConfig;
    pageLayout: PageLayoutOptions;
}

export interface ParaInfo {
    index: number; // 段落序号（1-based）
    isEmpty: boolean; // 是否空行（trim 后为空）
    isSubtitle: boolean; // 匹配副标题特征（稿、——、双空格、文号）
    isAttachmentLabel: boolean; // 匹配 "附件X" 开头
    isHeading: boolean; // 匹配层级标题（一、 （一） 1.）
    hasForbidden: boolean; // 是否包含禁止符号
}
