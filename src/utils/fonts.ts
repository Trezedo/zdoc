const chineseKeywords = ["宋体", "仿宋", "黑体", "楷体", "方正", "小标宋"];
const westernWhitelist = ["Times New Roman", "Nimbus Roman"];

/**
 * 获取 WPS 可用字体（限制白名单）
 * @returns [chineseFonts, westernFonts]
 */
export function getWpsFonts(): [string[], string[]] {
    let innerFonts: Wps.FontNames | null = null;
    const emptyResult: [string[], string[]] = [[], []];
    try {
        innerFonts = Application.FontNames;
    } catch (e) {
        console.warn("当前不在 WPS 环境中", e);
        return emptyResult;
    }
    if (!innerFonts) return emptyResult;
    const fonts: string[] = [];
    for (let i = 1; i <= innerFonts.Count; i++) {
        fonts.push(innerFonts.Item(i));
    }

    const chineseFonts = fonts.filter(
        (f) => chineseKeywords.some((kw) => f.includes(kw)) || /[\u4e00-\u9fa5]/.test(f),
    );
    const westernFonts = fonts.filter((f) => westernWhitelist.includes(f));

    return [chineseFonts, westernFonts];
}

/**
 * 获取 浏览器 可用字体（仅用于浏览器调试环境）
 *
 * window.queryLocalFonts 依赖用户授权才能工作，没法在 WPS JS 调试器中使用
 * @returns [chineseFonts, westernFonts]
 */
export async function getBrowserFonts(): Promise<[string[], string[]]> {
    if (!("queryLocalFonts" in window)) {
        console.warn("当前浏览器不支持 queryLocalFonts API");
        return [[], []];
    }

    try {
        const fonts = await window.queryLocalFonts();
        const fontNames = fonts.filter((f) => f.style == "Regular").map((font) => font.fullName);

        const chineseFonts = fontNames.filter(
            (f) => chineseKeywords.some((kw) => f.includes(kw)) || /[\u4e00-\u9fa5]/.test(f),
        );
        const westernFonts = fontNames.filter((f) => westernWhitelist.includes(f));

        return [chineseFonts, westernFonts];
    } catch (err) {
        console.error("用户拒绝授权或获取失败", err);
        return [[], []];
    }
}
