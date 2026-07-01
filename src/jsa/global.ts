/**
 * 全局注册常量
 * @param name
 * @param value
 */
function defineGlobal(name: string, value: any) {
    // @ts-ignore
    window[name] = value;
}

type EnumKey = keyof typeof EnumRegistry;

// 用于检查注册缺少的 key
function defineEnumRegistryArr<T extends readonly EnumKey[]>(
    arr: T &
        (Exclude<EnumKey, T[number]> extends never ? T : `Missing: ${Exclude<EnumKey, T[number]>}`),
): T {
    return arr;
}

/**
 * 需要注册的枚举 key
 */
const EnumRegistryArr = defineEnumRegistryArr([
    "MsoCTPDockPosition",
    "MsoFileDialogType",
    "MsoTriState",
    "WdCharacterWidth",
    "WdColor",
    "WdColorIndex",
    "WdInformation",
    "WdLineSpacing",
    "WdParagraphAlignment",
    "WdSelectionType",
    "WdStatistic",
    "WdStyleType",
    "WdTextureIndex",
    "WdThemeColorIndex",
    "WdWordDialog",
]);

export function setupGlobalEnum() {
    // 检查是否在 WPS 加载项环境中
    if (typeof wps === "undefined") {
        console.warn("当前不在 WPS 加载项环境中，请在 WPS 加载项中运行以确保功能正常");
        return;
    }
    const startTime = performance.now(); // 开始计时
    console.groupCollapsed("注册全局枚举");
    // 自动遍历 EnumRegistry 中的所有枚举对象，注册其成员到全局
    const newEnum = Application.NewEnum;
    let count = 0;
    // 只遍历 EnumRegistryArr 中列出的枚举名称
    for (const enumName of EnumRegistryArr) {
        const enumObj = newEnum[enumName];
        if (enumObj && typeof enumObj === "object") {
            for (const [key, value] of Object.entries(enumObj)) {
                if (typeof value === "number") {
                    console.log(`${key} = ${value}`);
                    defineGlobal(key, value);
                    count++;
                }
            }
        }
    }
    const endTime = performance.now(); // 结束计时
    const elapsed = endTime - startTime;
    console.groupEnd();
    console.log(`✅ ${count} 个全局枚举注册完成，耗时 ${elapsed.toFixed(2)} 毫秒`);
}

// @ts-ignore
if (typeof window.ActiveDocument === "undefined") {
    Object.defineProperty(window, "ActiveDocument", {
        get: function () {
            return Application.ActiveDocument;
        },
        enumerable: false,
        configurable: false,
    });
}
