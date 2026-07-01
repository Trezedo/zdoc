import { getDefaultConfig } from "@/config/typography";
import type { SimpleFontConfig, TopicBoldMode, TypographyConfig } from "@/types";
import { withUndoRecord } from "@/jsa/utils/document";

import { formatAttachments } from "./document";
import { findMainTitleBlocks, isSubtitleLine, type ParaInfo } from "@/utils";

const typographyContext = {
    titleSeeds: [] as number[],
};

// 注意：同段内有多个需要匹配的才加 g 标志
const salutationRegex = /^[^《》〔〕：]*：\r$/; // 抬头；发文事由可能包含转发上级的文件（书名号、六角括号）
const h1Regex = /^[一二三四五六七八九十]+、.*?(?:。|[^；;]\r)/; // 以分号结尾视为列表而不是层级标题
const h2Regex = /^（[一二三四五六七八九十]+）.{1,23}(?:。|[^；;]\r)/;
const h3Regex = /^[0-9]{1,2}\..{1,23}(?:。|[^；;]\r)/; // 23 为一行能容纳的字数
const topicRegex = /(?<=^|[。？！])[一二三四五六七八九十][是要].*?。/g; // 小标题
const topicPrefixRegex = /^[一二三四五六七八九十][是要]/;
const dateRegex = /^[0-9X]{4}年[0-9 X]{1,2}月[0-9 X]{1,2}日\s*\r/; // 落款日期

// 标题中禁止出现的符号
export const forbiddenSymbolsRegex = /[。；！？【】〖〗_=|{}<>#&~$^*※\[\]\\]/;
export const attachmentWildcards = "^m附件[0-9]{1,}^p"; // 附件通配符
export const attachmentListRegex = /[ \u3000]*附件[：:]\s*([\s\S]+?)(?=[\r\n]{2}|\f|$)/g;
export const attachmentListWildcards = "附件[:：]*^p^p";

/**
 * 应用简单的字体配置
 * @param range 范围
 * @param fontConfig 字体配置
 */
function applySimpleFontConfig(range: Wps.Range, fontConfig: SimpleFontConfig) {
    const font = range.Font;
    if (fontConfig.font) {
        font.NameFarEast = fontConfig.font;
    }
    if (fontConfig.bold !== undefined) {
        font.Bold = fontConfig.bold ? msoTrue : msoFalse;
    }
}

/**
 * 设置正文样式，避免频繁地直接操作 Range，优化运行效率
 * @param config 样式配置
 * @param doc 目标文档，默认为当前活动文档
 */
export function setupBodyStyle(
    config: TypographyConfig,
    doc: Wps.Document = ActiveDocument,
): Wps.Style {
    let style = doc.Styles.Item("公文正文");
    if (!style) {
        style = doc.Styles.Add("公文正文", wdStyleTypeParagraph);
    }
    // 设置默认字体格式
    const font = style.Font;
    font.Name = config.main.zh || "仿宋_GB2312"; // Name 属性会影响中文和西文
    font.NameFarEast = font.Name;
    font.NameAscii = config.main.en || "Times New Roman";
    font.Size = config.main.size || 16;
    font.SizeBi = font.Size; // Bi 后缀的是复杂文种
    font.Bold = msoFalse;
    font.Italic = msoFalse;

    // 设置默认段落格式
    const pf = style.ParagraphFormat;
    pf.Alignment = wdAlignParagraphJustify; // 两端对齐
    pf.SpaceBefore = 0; // 段前间距
    pf.SpaceAfter = 0; // 段后间距
    pf.LineSpacingRule = wdLineSpaceExactly; // 固定行距
    pf.LineSpacing = config.main.spacing || 28.95; // 行距（磅）

    pf.CharacterUnitFirstLineIndent = config.main.indent || 2; // 首行缩进（字符）
    pf.FirstLineIndent = 0; // 非字符单位的首行缩进（磅）
    pf.WordWrap = msoTrue; // 西文换行
    pf.AddSpaceBetweenFarEastAndAlpha = msoTrue; // 中文、英文之间添加间距
    pf.AddSpaceBetweenFarEastAndDigit = msoTrue; // 中文、数字之间添加间距

    // todo : 应当只修改配置中指定的属性，目前的实现会覆盖默认值
    pf.WidowControl = msoFalse; // 孤行控制
    pf.KeepWithNext = msoFalse; // 与下段同页
    pf.KeepTogether = msoFalse; // 段中不分页
    pf.PageBreakBefore = msoFalse; // 段前分页
    // pf.WordWrap = msoTrue 表示允许西文在单词中间换行

    return style;
}

/**
 * 基于正文样式设置标题样式
 * @param config 样式配置
 * @param doc 目标文档，默认为当前活动文档
 */
export function setupTitleStyle(
    config: TypographyConfig,
    doc: Wps.Document = ActiveDocument,
): Wps.Style {
    let style = doc.Styles.Item("公文标题");
    if (!style) {
        style = doc.Styles.Add("公文标题", wdStyleTypeParagraph);
    }
    style.BaseStyle = "公文正文";
    style.NextParagraphStyle = "公文正文";
    const font = style.Font;
    font.Name = config.title.zh || "方正小标宋简体";
    font.NameFarEast = font.Name;
    font.NameAscii = config.title.en || "方正小标宋简体";
    font.Size = config.title.size || 22;
    font.SizeBi = font.Size;
    font.Bold = msoFalse;

    const pf = style.ParagraphFormat;
    pf.LineSpacingRule = wdLineSpaceExactly;
    pf.LineSpacing = config.title.spacing || 28.95;

    pf.Alignment = wdAlignParagraphCenter;
    pf.CharacterUnitFirstLineIndent = 0;
    pf.FirstLineIndent = 0;

    return style;
}

/**
 * 处理抬头（一般为楷体、顶格）
 * @param range 匹配到的抬头范围
 * @param config 排版配置
 */
function processSalutation(range: Wps.Range, config: TypographyConfig) {
    const text = range.Text;

    // 1. 抬头黑名单
    const excludeRegex = /贯彻|落实|关于|根据|如下|下列|。/;
    if (excludeRegex.test(text)) return;

    const words = text.split("、");
    // 已知问题：此处使用 range.ComputeStatistics(wdStatisticLines); 会导致缩进为 0 但显示为 2
    const regex1 = /省|自治区|市|县|乡|镇|村|社区|委.*?(?:部|办)|局|工会|妇联|企业|党组织|大学/;
    const regex2 = /各.*?(?:单位|部门)/;
    // 检查关键字
    const pattern = words.some((w) => regex1.test(w) || regex2.test(w));

    // 2. 短文本（≤10个字符）且不含排除词，直接视为抬头
    if (!pattern) {
        if (text.length > 10) return;
    }
    const font = range.Font;
    font.NameFarEast = config.salutation.font || config.main.zh;
    font.Bold = config.salutation.bold ? msoTrue : msoFalse;
    const pf = range.ParagraphFormat;
    pf.CharacterUnitFirstLineIndent = 0;
    pf.FirstLineIndent = 0;
}

/**
 * 根据小标题内容决定加粗方式。
 * 多于 2 个逗号或者超过一行 26 个字的不会被整句加粗。
 * @param range 匹配到的小标题范围
 * @param mode 加粗模式
 */
function boldTopicSentence(range: Wps.Range, mode: TopicBoldMode) {
    const font = range.Font;
    if (mode === "none") {
        font.Bold = msoFalse;
        return;
    }

    const text = range.Text; // 匹配的整句文本
    const commaCount = (text.match(/，/g) || []).length; // 中文逗号个数
    // 句内最多1个逗号，且小于一行（28 字 - 2 缩进 = 26 字）
    const shouldFullBold = mode === "auto" && commaCount < 2 && text.length <= 26;
    if (shouldFullBold) {
        font.Bold = msoTrue;
        return;
    }
    // 只加粗前缀 "X是" 或 "X要"
    font.Bold = msoFalse;
    const prefixMatch = text.match(topicPrefixRegex);
    if (prefixMatch) {
        const prefix = prefixMatch[0];
        const prefixRange = range.Document.Range(range.Start, range.Start + prefix.length);
        prefixRange.Font.Bold = msoTrue;
    }
}

/**
 * 根据正则表达式的全局标志，返回匹配结果的迭代器。
 * - 若 regex.global === true，使用 matchAll 返回所有匹配（惰性迭代）。
 * - 若 regex.global === false，使用 exec 最多返回第一个匹配（无匹配则不返回）。
 *
 * @param text - 待匹配的字符串
 * @param regex - 正则表达式
 * @yields {RegExpExecArray} 每个匹配对象，包含匹配文本、捕获组、index 等
 */
function* iterateMatches(text: string, regex: RegExp): Iterable<RegExpExecArray> {
    if (regex.global) {
        yield* text.matchAll(regex);
    } else {
        const match = regex.exec(text);
        if (match) yield match;
    }
}

interface RegexMatcher {
    regex: RegExp;
    handler: (r: Wps.Range) => void;
}

/**
 * 对单个段落应用层级标题样式（抬头、一/二/三级标题、小标题）
 * @param range 段落 Range
 * @param text 段落文本
 * @param config 排版配置
 * @returns 是否已应用任何层级样式（用于主循环中跳过后续处理，但当前设计仅用于封装逻辑，不影响主流程）
 */
function applyHierarchicalStyles(
    range: Wps.Range,
    text: string,
    config: TypographyConfig,
): boolean {
    // 优先级匹配（只执行第一个匹配的）
    const matchers: RegexMatcher[] = [
        { regex: salutationRegex, handler: (r) => processSalutation(r, config) },
        { regex: h1Regex, handler: (r) => applySimpleFontConfig(r, config.h1) },
        { regex: h2Regex, handler: (r) => applySimpleFontConfig(r, config.h2) },
        { regex: h3Regex, handler: (r) => applySimpleFontConfig(r, config.h3) },
        { regex: topicRegex, handler: (r) => boldTopicSentence(r, config.topicBoldMode) },
    ];

    let applied = false;
    for (const { regex, handler } of matchers) {
        for (const match of iterateMatches(text, regex)) {
            const subRange = range.Document.Range(
                range.Start + match.index,
                range.Start + match.index + match[0].length,
            );
            handler(subRange);
            applied = true;
        }
    }
    return applied; // 无匹配
}

/**
 * 排版公文
 *
 * - 处理正文样式、层级标题（一/二/三级、小标题）
 * - 若未传入 range（处理全文），额外执行：自动识别多行主标题（附件后、文档开头、换页符后等）并应用标题样式
 * - 若传入 range（用户选中局部区域），仅对范围内的段落应用正文和层级样式，
 *   不进行全局性的主标题识别、落款及附件处理，以避免脱离上下文的误判。
 *
 * @param config 排版配置
 * @param doc 目标文档，默认为当前活动文档
 * @param range 排版范围，不传则处理整个文档；传入则仅处理该范围内的段落
 */
function formatGovDoc(
    config: TypographyConfig = getDefaultConfig(),
    doc: Wps.Document = ActiveDocument,
    range?: Wps.Range,
) {
    const paras = range ? range.Paragraphs : doc.Paragraphs;
    const count = paras.Count;
    const mainStyle = setupBodyStyle(config, doc);
    const titleStyle = setupTitleStyle(config, doc);
    const mainStyleName = mainStyle.NameLocal;
    const titleStyleName = titleStyle.NameLocal;

    // 存储所有段落信息（索引与段落顺序一致）
    const paraInfos: ParaInfo[] = [];

    // ---------- 第一遍遍历：应用正文样式 + 层级标题 ----------
    for (let i = 1; i <= count; i++) {
        const para = paras.Item(i);
        const paraRange = para.Range;
        const text = paraRange.Text;

        // 是否在有效范围内（若 range 存在则必须在范围内，否则视为有效）
        const isInRange = range
            ? paraRange.Start >= range.Start && paraRange.End <= range.End
            : true;
        const isTable = text.includes("\x07");

        // 构建信息对象
        const info: ParaInfo = {
            text,
            isEmpty: text.trim() === "",
            isAttachment: /^附件\s*[0-9]+/.test(text.trim()),
            hasFormFeed: text.includes("\f"),
            hasForbidden: forbiddenSymbolsRegex.test(text.trim()),
            isHeading: false,
            isInRange,
        };
        paraInfos.push(info);

        // 仅处理范围内且非表格的段落
        if (isInRange && !isTable) {
            // 应用正文样式
            const curStyleName = (paraRange.Style as Wps.Style).NameLocal;
            if (curStyleName !== mainStyleName) {
                paraRange.Style = mainStyle;
            }

            // 应用层级标题（并记录是否匹配）
            const level = applyHierarchicalStyles(paraRange, text, config);
            if (level !== false) {
                info.isHeading = true;
            }

            // 注：附件格式独立处理（保持原有逻辑）
            // 这里可以保留原有的附件处理代码，或者交由后续统一处理
            if (/^附件\s*[0-9]+/.test(text.trim())) {
                paraRange.Font.Name = "黑体";
                paraRange.Font.NameAscii = "Times New Roman";
                paraRange.ParagraphFormat.CharacterUnitFirstLineIndent = 0;
                paraRange.ParagraphFormat.FirstLineIndent = 0;
            }
        }
    }

    // ---------- 第二遍遍历：查找并应用主标题 ----------
    if (!range) {
        const blocks = findMainTitleBlocks(paraInfos);
        for (const [start, end] of blocks) {
            for (let idx = start; idx <= end; idx++) {
                const para = paras.Item(idx + 1);
                const rng = para.Range;
                if ((rng.Style as Wps.Style).NameLocal !== titleStyleName) {
                    rng.Style = titleStyle;
                }
                const text = rng.Text;
                if (isSubtitleLine(text)) {
                    const font = rng.Font;
                    font.NameFarEast = "楷体_GB2312";
                    font.NameAscii = "Times New Roman";
                    font.Size = 16;
                    font.Bold = msoFalse;
                }
                typographyContext.titleSeeds.push(idx + 1);
            }
        }
    }
}

/**
 * 处理多行标题
 * - 从排版上下文中获取之前收集的标题种子
 * - 向上查找同样居中、字体大于三号的段落，合并为多行标题
 * @param doc 目标文档，默认为当前活动文档
 */
function processMultiLineTitle(doc: Wps.Document = ActiveDocument) {
    const paras = doc.Paragraphs;
    const anchors = [...typographyContext.titleSeeds];
    for (let idx = anchors.length - 1; idx >= 0; idx--) {
        const seed = anchors[idx];
        let start = seed;
        // 向上查找同样居中、字体大于三号的段落
        while (start > 1) {
            const prevPara = paras.Item(start - 1);
            const isCenter = prevPara.Alignment === wdAlignParagraphCenter;
            const isFontLarge = prevPara.Range.Font.Size > 16;
            const isInTable = prevPara.Range.Text.includes("\x07");
            if (isCenter && !isInTable && isFontLarge) start--;
            else break;
        }
        // 替换从 start 到 seed-1 的段落（种子本身不替换）
        for (let i = seed - 1; i >= start; i--) {
            const rng = paras.Item(i).Range;
            if (rng.Text.endsWith("\r")) rng.Text = rng.Text.slice(0, -1) + "\v";
        }
    }
}

/**
 * 落款：署名（发文机关）、成文日期
 * @param doc 目标文档，默认为当前活动文档
 */
function formatSignature(doc: Wps.Document = ActiveDocument) {
    let datePara = null,
        unitPara = null;

    const paras = doc.Paragraphs;
    const count = paras.Count;
    // 从后往前查找日期段落
    for (let i = count; i >= 1; i--) {
        const p = paras.Item(i);
        if (dateRegex.test(p.Range.Text)) {
            datePara = p;
            unitPara = datePara.Previous();
            break;
        }
    }
    if (!datePara || !unitPara) return; // "未找到成文日期或署名"

    // 去除段落首位空白字符，使得多次运行的效果仍保持一致
    let unitText = unitPara.Range.Text.trim();
    let dateText = datePara.Range.Text.trim();
    // 等效长度：中文=2，半角（英文/数字/空格）=1
    const eqLen = (s: string) =>
        [...s].reduce((sum, cur) => sum + (/[\u0000-\u00ff]/.test(cur) ? 1 : 2), 0);

    const processPara = (para: Wps.Paragraph, text: string) => {
        if (!para || para.Range.Text.trim().length < 1) return;
        para.Range.Text = text;
        para.Alignment = wdAlignParagraphRight; // 右对齐
        para.WordWrap = 0; // 避免段落末尾空格不占空间
    };

    const unitLen = eqLen(unitText);
    const dateLen = eqLen(dateText);

    const diff = Math.round(dateLen / 2 + 4 * 2 + 5 / 4 - unitLen / 2);
    if (diff >= 0) {
        unitText = unitText + " ".repeat(diff) + "\r";
        dateText = dateText + " ".repeat(8) + "\r";
    } else {
        unitText = unitText + "\r";
        dateText = dateText + " ".repeat(8 - diff) + "\r";
    }
    processPara(unitPara, unitText);
    datePara = unitPara.Next(1); // 更新引用，因为手动添加了 "\r" 导致原引用失效
    processPara(datePara, dateText);
}

/**
 * 一键排版
 * - 根据配置，按合适的顺序排版公文各要素
 * - 应当避免涉及大量操作的函数在 vue 组件中调用，否则会有明显的延迟
 * @param config 排版配置
 * @param doc 目标文档，默认为当前活动文档
 */
export function oneClickTypography(config: TypographyConfig, doc: Wps.Document = ActiveDocument) {
    const start = performance.now();
    withUndoRecord("一键排版", () => {
        typographyContext.titleSeeds = [];
        // 排版前需要将动态编号转静态，否则编号会消失
        doc.Content.ListFormat.ConvertNumbersToText();
        // 主排版：设置样式、查找层级标题、收集标题种子
        formatGovDoc(config, doc);
        // 处理落款和附件
        formatSignature(doc);
        formatAttachments(doc);
    });
    const end = performance.now();
    console.log(`格式化耗时 ${(end - start).toFixed(2)} 毫秒`);
}
