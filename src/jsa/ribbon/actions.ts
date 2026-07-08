import { getTypoConfigWithDefault } from "@/config/typography";
import {
    convertIndentToSpace,
    convertSpaceToIndent,
    deleteNonBuiltInStyles,
    formatAttachments,
    removeShadingBackground,
} from "@/jsa/commands/document";
import { convertNumberingToStatic } from "@/jsa/commands/field";
import { quickFormat } from "@/jsa/commands/govDoc";
import { exportAllImages, formatInlineImages } from "@/jsa/commands/image";
import { getMailMergeSourcePath } from "@/jsa/commands/mergeMail";
import type { TypographyConfig } from "@/jsa/types";
import { withUndoRecord } from "@/jsa/utils/document";
import { getItem, setItem } from "@/jsa/utils/storage";
import { getRouterUrl } from "@/utils";

import { STORAGE_KEYS, toggleTaskPane } from "./taskPane";

interface RibbonAction {
    (): void;
}

function makeFarEastStyle(fontGetter: (config: TypographyConfig) => string, size?: number) {
    return () => {
        const config = getTypoConfigWithDefault();
        const font = Application.Selection.Font;

        // 获取原始的中、西文字体名称，判断是否为“使用中文字体”
        const originalEast = font.NameFarEast;
        const originalAscii = font.NameAscii;
        const wasUnified = originalEast === originalAscii;

        const asciiFontName = config.main.en || "Times New Roman";
        withUndoRecord("", () => {
            const newFont = fontGetter(config);

            // 显式设置 font.Name 会覆盖 font.NameAscii，同时避免出现中文标点符号显示为半角
            font.Name = newFont;
            font.NameFarEast = newFont;
            if (wasUnified) {
                // 原本文档未区分中西文，则整体统一为新字体
                font.NameAscii = newFont;
            } else {
                // 原本有区分，则设为用户配置的西文字体
                font.NameAscii = asciiFontName;
            }
            // 6. 若有字号参数则设置
            if (size !== undefined) font.Size = size;
        });
    };
}

function makeAsciiStyle(fontGetter: (config: TypographyConfig) => string) {
    return () => {
        const config = getTypoConfigWithDefault();
        const font = Application.Selection.Font;
        font.NameAscii = fontGetter(config);
    };
}

const actionHandlers: Partial<Record<RibbonControlId, RibbonAction>> = {
    // 文档处理
    btnGovDocTypo: () => {
        const config = getTypoConfigWithDefault();
        quickFormat(config);
    },
    btnTypoConfig: () => toggleTaskPane(STORAGE_KEYS.DOC_SETTINGS_ID),
    btnImageTypo: () => withUndoRecord("排版图片", formatInlineImages),
    btnTableTypo: () => {},
    btnJustifyAttach: () => withUndoRecord("对齐附件", formatAttachments),

    // 格式专区
    btnClearFormat: () => {
        const sel = Application.Selection;
        const isWholeDoc = sel.Type === wdSelectionIP;
        const rangeToClear = isWholeDoc ? Application.ActiveDocument.Content : sel.Range;
        rangeToClear.Select();
        sel.ClearFormatting();
        if (isWholeDoc) {
            sel.SetRange(0, 0);
            Application.ActiveWindow.ActivePane.VerticalPercentScrolled = 0;
        }
    },
    btnClearNonBuiltinStyles: () => {
        deleteNonBuiltInStyles();
        Application.ShowDialog(
            getRouterUrl("/msg"),
            "",
            400 * window.devicePixelRatio,
            400 * window.devicePixelRatio,
            true,
        );
    },
    btnRemoveShading: () => withUndoRecord("清除底纹背景", removeShadingBackground),

    // 快捷样式
    btnFontSize2: () => {
        Application.Selection.Font.Size = 22;
    },
    btnFontSize3: () => {
        Application.Selection.Font.Size = 16;
    },
    btnFontFZ: makeFarEastStyle((c) => c.title.zh),
    btnFontHei: makeFarEastStyle((c) => c.h1.font || "黑体"),
    btnFontKai: makeFarEastStyle((c) => c.h2.font || "楷体_GB2312"),
    btnFontFS: makeFarEastStyle((c) => c.main.zh || "仿宋_GB2312"),
    btnFontRoman: makeAsciiStyle((c) => c.main.en || "Times New Roman"),
    btnFontAsciiToEast: () => {},
    btnLineExactly: () => {
        const config = getTypoConfigWithDefault();
        const pf = Application.Selection.ParagraphFormat;
        withUndoRecord("", () => {
            pf.LineSpacingRule = wdLineSpaceExactly;
            pf.LineSpacing = config.main.spacing || 28.95;
            // 以下为针对未使用“公文正文”样式段落的补充设置
            pf.KeepWithNext = msoFalse;
            pf.KeepTogether = msoFalse;
            pf.SpaceBefore = 0;
            pf.SpaceAfter = 0;
        });
    },

    // 辅助
    btnClearIndent: () => {
        const pf = Application.Selection.ParagraphFormat;
        pf.CharacterUnitFirstLineIndent = 0;
        pf.FirstLineIndent = 0;
        pf.CharacterUnitLeftIndent = 0;
        pf.LeftIndent = 0;
    },
    btnIndent2Char: () => {
        Application.Selection.ParagraphFormat.CharacterUnitFirstLineIndent = 2;
    },
    btnToggleIndentToSpace: () =>
        withUndoRecord("空格缩进互转", () => {
            const sel = Application.Selection;
            const hasIndent = sel.Paragraphs.Item(1).CharacterUnitFirstLineIndent > 0; // 只用首段判断
            if (hasIndent) convertIndentToSpace();
            else convertSpaceToIndent();
        }),

    btnFullHalfWidth: () => {
        Application.Dialogs.Item(wps.Enum.wdDialogFormatChangeCase).Show();
    },
    btnTextViewCompare: () => toggleTaskPane(STORAGE_KEYS.TEXT_COMPARE_TASKPANE_ID),

    btnNumberToStatic: convertNumberingToStatic,
    btnViewMailSource: () => {
        const res = getMailMergeSourcePath();
        setItem(
            STORAGE_KEYS.MESSAGE,
            res.error ||
                `已复制路径！\n\n该文档引用 ${res.sourceType} 数据源：\n\n${res.filePath}\n\n${res.sheetName ? "Sheet: [" + res.sheetName + "]" : ""}`,
        );
        Application.confirm(
            res.success
                ? `已复制路径！\n\n该文档引用 ${res.sourceType} 数据源：\n\n${res.filePath}\n\n${
                      res.sheetName ? "Sheet: [" + res.sheetName + "]" : ""
                  }`
                : res.error,
        );
    },
    btnUpdateFiled: () => {
        const doc = ActiveDocument;
        const fld = doc.Fields;
        for (let i = 1; i <= fld.Count; i++) {
            let f = fld.Item(i);
            f.Update();
            // f.Unlink();
        }
    },

    // 图片工具
    btnPictureResize: () => toggleTaskPane(STORAGE_KEYS.IMAGE_RESIZE_TASKPANE_ID),
    btnExportPicture: exportAllImages,

    btnClearEmptyPara: () => {
        const sel = Application.Selection;
        if (sel.Type == wdSelectionIP) return alert("请选择需要清除空段的范围，避免误删");
        const paras = sel.Paragraphs;
        const count = paras.Count;
        for (let i = count; i >= 1; i--) {
            const p = paras.Item(i);
            // \x0E 分栏符不会被删掉
            if (p.Range.Text.trim() === "") p.Range.Delete();
        }
    },
};

function onAddinLoad(ribbonUI: Kso.RibbonUI): boolean {
    if (typeof Application.ribbonUI !== "object") {
        // @ts-ignore
        Application.ribbonUI = ribbonUI;
    }
    wps.ApiEvent.AddApiEventListener("WindowSelectionChange", () => {
        try {
            Application.ribbonUI.InvalidateControl("btnIsEnabled");
        } catch (e) {
            console.error("刷新按钮状态失败", e);
        }
    });

    return true;
}

function onAction(control: Kso.RibbonControl): boolean {
    const eleId = control.Id as RibbonControlId;
    const handler = actionHandlers[eleId];
    if (handler) {
        try {
            handler();
        } catch (e) {
            console.error(`执行按钮 ${eleId} 动作失败`, e);
        }
    }
    return true;
}

function getImage(control: Kso.RibbonControl): string {
    const eleId = control.Id as RibbonControlId;

    const imageMap: Partial<Record<RibbonControlId, ImageFileName>> = {
        btnRemoveShading: "DelDocBackground.svg",
        btnTypoConfig: "OfficialVersionSettings.svg",
        btnExportPicture: "ExportChartAsPicture.svg",
        btnTextViewCompare: "ReviewCompare.svg",
    };
    return `images/${imageMap[eleId] ?? `${eleId}.png`}`;
}

function onGetEnabled(control: Kso.RibbonControl): boolean {
    const eleId = control.Id;
    switch (eleId) {
        case "btnShowDialog":
        case "btnShowTaskPane":
            return !!getItem(STORAGE_KEYS.ENABLE_FLAG);
        default:
            return true;
    }
}

function onGetLabel(control: Kso.RibbonControl): string {
    const eleId = control.Id as RibbonControlId;

    switch (eleId) {
        case "btnFontFS":
            return "设为仿宋三号字体";
        default:
            return "";
    }
}

/**
 * 绑定 CustomUI 与自定义事件
 */
export function setupRibbonBindings(): void {
    const bindings = {
        onAddinLoad,
        onAction,
        getImage,
        onGetLabel,
        onGetEnabled,
    };

    // 挂载全局对象，可在 ribbon.xml 中绑定事件
    Object.entries(bindings).forEach(([key, value]) => {
        // @ts-ignore
        window[key] = value;
    });
}
