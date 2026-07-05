import type { GovDocConfig } from "@/jsa/types";

import { getItem, setItem } from "./storage";

/**
 * 正则查找处理
 *
 * 对符合正则表达式的 **段落** 进行查找和处理
 * @param regexp 是正则表达式，应带有 "g" 标志
 * @param callback 是回调函数，如 (range) => {...}
 */
export function regexFindAndProcess(regexp: RegExp, callback: (range: Wps.Range) => void) {
    const doc = ActiveDocument;
    const paras = doc.Paragraphs;
    // 确保有 g 标志
    const globalRegex = new RegExp(
        regexp.source,
        regexp.flags.includes("g") ? regexp.flags : regexp.flags + "g",
    );
    for (let i = 1; i <= paras.Count; i++) {
        const para = paras.Item(i);
        const range = para.Range;

        let match: RegExpExecArray | null = null;
        while ((match = globalRegex.exec(range.Text)) !== null) {
            const startPos = range.Start + match.index;
            const endPos = startPos + match[0].length;
            const matchedRange = doc.Range(startPos, endPos); // 全文中匹配的范围
            callback(matchedRange);
        }
    }
}

/**
 * 获取系统剪切板的文本内容
 */
export function getClipboardText(): string {
    // 插入临时文本框
    const shape = ActiveDocument.Shapes.AddTextbox(1, 100, 100, 200, 30);
    shape.TextFrame.TextRange.Select();
    // 执行粘贴操作
    Application.Selection.Paste();

    const clipText = shape.TextFrame.TextRange.Text;
    shape.Delete();
    return clipText;
}

/**
 * 执行带撤销快照的通用操作
 * @param {string} undoName - 显示在撤销列表中的名称
 * @param {Function} action - 要执行的业务函数（可以返回任意值）
 * @returns action 的返回值
 */
export function withUndoRecord<T = void>(undoName: string = "", action: () => T): T {
    Application.ScreenUpdating = false;
    Application.EnableEvents = false;
    const record = Application.UndoRecord;
    record.StartCustomRecord(undoName);
    try {
        return action();
    } finally {
        record.EndCustomRecord();
        Application.ScreenUpdating = true;
        Application.EnableEvents = true;
    }
}

export function showFolderPicker(
    title: string = "请选择文件夹",
    initPath: string = "",
): string | null {
    const doc = ActiveDocument;
    let folderDialog = Application.FileDialog(msoFileDialogFolderPicker);

    let lastPath = getItem("LastSelectedFolder");
    let initialPath: string;

    if (!!lastPath) {
        // 如果上次保存的路径存在且非空，则使用该路径
        initialPath = lastPath;
    } else {
        // 否则使用当前文档所在目录，若文档未保存则使用 C:\
        initialPath = (doc ? doc.Path : "C:\\") + "\\";
    }

    folderDialog.Title = title;
    folderDialog.InitialFileName = initPath || initialPath; // 设置起始路径

    // 显示对话框，返回值 -1 表示用户点击了“确定”
    if (folderDialog.Show() !== -1) {
        return null;
    }
    let selectedPath = folderDialog.SelectedItems.Item(1);
    setItem("LastSelectedFolder", selectedPath);
    return selectedPath;
}

export const CONFIG_DIR = "/.zdoc/";
export const CONFIG_FILE_NAME = "govDocConfig.json";

/**
 * 将配置内容保存到本地文件系统中。
 *
 * 配置会存放在用户主目录下的 `.zdoc/` 文件夹中，文件名为 `govDocConfig.json`。
 * 如果目标目录不存在，会自动创建。
 *
 * @param content - 要保存的配置内容（JSON 字符串）
 * @returns 一个包含操作结果的对象：
 *          - `success`：布尔值，表示写入是否成功。
 *          - `path`：字符串，保存文件的完整路径。
 */
export function saveConfigLocal(content: string) {
    const fs = Application.FileSystem;
    // 注意 GetAppDataPath, GetProgramFilesPath, GetProgramDataPath 在 linux 上会得到空字符串
    const configFolderPath = Application.Env.GetHomePath() + CONFIG_DIR;
    // 不存在则创建目录
    if (!fs.Exists(configFolderPath)) {
        fs.Mkdir(configFolderPath);
    }
    const savePath = configFolderPath + CONFIG_FILE_NAME;
    const success = fs.WriteFile(savePath, content);
    return { success, path: savePath };
}

/**
 * 从本地文件系统加载配置内容。
 *
 * 默认读取用户主目录下的 `.zdoc/govDocConfig.json` 文件。
 *
 * @returns 如果文件存在，返回文件内容的字符串；否则返回 `null`。
 */
export function loadConfigLocal(): string | null {
    const fs = Application.FileSystem;
    const configFolderPath = Application.Env.GetHomePath() + CONFIG_DIR;
    const configPath = configFolderPath + CONFIG_FILE_NAME;
    if (fs.Exists(configPath)) {
        return fs.ReadFile(configPath);
    }
    return null;
}

export function saveGovDocConfigToFile(config: GovDocConfig) {
    return saveConfigLocal(JSON.stringify(config, null, 4));
}

export function loadGovDocConfigFromFile(): GovDocConfig | null {
    const content = loadConfigLocal();
    if (content) {
        try {
            return JSON.parse(content) as GovDocConfig;
        } catch (e) {
            console.error("解析本地配置文件失败", e);
        }
    }
    return null;
}
