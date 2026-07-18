import type { HeaderConfig } from "../types";

/** 默认页眉配置 */
export const DEFAULT_HEADER_CONFIG: HeaderConfig = Object.freeze({
    content: "",
    font: "黑体",
    fontSize: 16,
    position: "left",
    distance: 1.5,
});

/**
 * 设置当前文档的主页眉
 * @param {string} content     页眉文本内容
 * @param {string} position    对齐方式：'left' | 'center' | 'right'
 * @param {string} fontName    字体名称，如 "宋体"、"黑体" 等
 * @param {number} fontSize    字号（磅值），如 14
 */
export function setHeader(
    content: string,
    position: string,
    fontName: string,
    fontSize: number,
    doc: Wps.Document = ActiveDocument,
) {
    if (!doc) {
        alert("未打开任何文档");
        return;
    }

    // 获取第一节的主页眉（wdHeaderFooterPrimary = 1）
    const section = doc.Sections.Item(1);
    const header = section.Headers.Item(1); // 1 表示 wdHeaderFooterPrimary

    // 清空原有内容，写入新文本
    header.Range.Text = content;

    // 设置字体
    if (fontName) {
        header.Range.Font.Name = fontName;
    }
    if (fontSize && fontSize > 0) {
        header.Range.Font.Size = fontSize;
    }

    // 设置段落对齐方式
    let align = wdAlignParagraphLeft; // 默认左对齐
    if (position === "center") {
        align = wdAlignParagraphCenter;
    } else if (position === "right") {
        align = wdAlignParagraphRight;
    }
    header.Range.ParagraphFormat.Alignment = align;
}

/**
 * 删除所有页眉（全部节 + 全部类型）
 */
export function removeAllHeaders(doc: Wps.Document = ActiveDocument): void {
    if (!doc) {
        alert("没有打开的文档");
        return;
    }

    for (let i = 1; i <= doc.Sections.Count; i++) {
        const section = doc.Sections.Item(i);
        // 1=主页眉，2=首页页眉，3=偶数页页眉
        [wdHeaderFooterPrimary, wdHeaderFooterEvenPages, wdHeaderFooterFirstPage].forEach(
            (type) => {
                try {
                    const header = section.Headers.Item(type);
                    if (header) header.Range.Text = "";
                } catch {}
            },
        );
    }
}
