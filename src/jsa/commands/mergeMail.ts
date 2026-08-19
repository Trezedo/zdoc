import { withUndoRecord } from "@/jsa/utils/document";

// 创建文本框，放入字符串后复制再删除
export function copyText(text: string) {
    withUndoRecord("避免撤回时出现文本框", () => {
        const doc = ActiveDocument;
        const tb = doc.Shapes.AddTextbox(1, 0, 0, 100, 100);
        tb.TextFrame.TextRange.Text = text;
        tb.TextFrame.TextRange.Copy();
        tb.Delete();
    });
}

/**
 * 邮件合并数据源解析结果
 */
type SourceType = "Excel" | "Word";

type MailMergeSourceResultSuccess = {
    success: true;
    filePath: string; // 或非 undefined
    sheetName?: string;
    sourceType?: SourceType;
    error?: undefined; // 或省略
};

type MailMergeSourceResultFailure = {
    success: false;
    error: string;
    filePath?: undefined;
    sheetName?: undefined;
    sourceType?: undefined;
};

export type MailMergeSourceResult = MailMergeSourceResultSuccess | MailMergeSourceResultFailure;

/**
 * 获取邮件合并数据源的文件路径，支持 xls(x), doc(x) 后缀的数据源
 */
export function getMailMergeSourcePath(doc: Wps.Document = ActiveDocument): MailMergeSourceResult {
    const ds = doc.MailMerge.DataSource;
    const cs = ds.ConnectString;
    const qs = ds.QueryString;
    if (!cs && !qs) {
        return { success: false, error: "该文档未引用数据源" };
    }

    let dsPath, sheetName: string | undefined;
    let sourceType: SourceType | "" = ""; // 默认 Word
    if (cs) {
        sourceType = "Excel";
        dsPath = /Data Source=([^;]+)/.exec(cs)?.[1];
        sheetName = /`([^`]+)\$`/.exec(qs)?.[1];
    } else {
        sourceType = "Word";
        dsPath = /SELECT \* FROM\s+(.+)$/i.exec(qs)?.[1]?.replace(/^`|`$/g, "");
    }
    if (!dsPath) return { success: false, error: "路径解析失败，原始连接信息：" + (cs || qs) };
    copyText(dsPath);
    return {
        success: true,
        filePath: dsPath,
        sheetName: sheetName,
        sourceType: sourceType,
    };
}

/**
 * 查看数据源信息
 */
export function viewMailSourceInfo() {
    const res = getMailMergeSourcePath();
    const msg = res.success
        ? `已复制路径！\n\n该文档引用 ${res.sourceType} 数据源：\n\n${res.filePath}\n\n${
              res.sheetName ? "Sheet: [" + res.sheetName + "]" : ""
          }`
        : res.error;
    wpsConfirm(msg);
}
