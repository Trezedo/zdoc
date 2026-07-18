/// <reference types="wps-jsapi-declare" />

export {};

/**
 * 将联合类型 `U` 转换为交叉类型（即合并为单个类型）。
 *
 * @example
 * type T1 = { a: 1 } | { b: 2 };
 * type T2 = UnionToIntersection<T1>; // { a: 1 } & { b: 2 }
 */
type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends (k: infer I) => void
    ? I
    : never;

/**
 * 获取类型 `T` 中所有属性值的**联合类型**。
 *
 * @example
 * type Obj = { a: string; b: number; c: boolean };
 * type Val = Values<Obj>; // string | number | boolean
 */
type Values<T> = T[keyof T];

// type Enum = typeof Kso.MsoTriState & ...

type Enum = UnionToIntersection<
    Values<{
        [K in keyof typeof EnumRegistry]: (typeof EnumRegistry)[K];
    }>
>;

type NewEnum = {
    [K in keyof typeof EnumRegistry]: (typeof EnumRegistry)[K];
};

// 扩展全局对象
declare global {
    // Kso、Wps 这两个不能用于运行时
    declare const EnumRegistry = {
        MsoCTPDockPosition: Kso.MsoCTPDockPosition, // TaskPane 需要
        MsoFileDialogType: Kso.MsoFileDialogType,
        MsoTextOrientation: Kso.MsoTextOrientation,
        MsoTriState: Kso.MsoTriState,
        WdCharacterWidth: Wps.WdCharacterWidth,
        WdColor: Wps.WdColor,
        WdColorIndex: Wps.WdColorIndex,
        WdFieldType: Wps.WdFieldType, // 枚举较多，未单独逐项注册
        WdHeaderFooterIndex: Wps.WdHeaderFooterIndex,
        WdInformation: Wps.WdInformation,
        WdLineSpacing: Wps.WdLineSpacing,
        WdPageNumberStyle: Wps.WdPageNumberStyle, // 枚举较多，未单独逐项注册
        WdParagraphAlignment: Wps.WdParagraphAlignment,
        WdRelativeHorizontalPosition: Wps.WdRelativeHorizontalPosition,
        WdRelativeVerticalPosition: Wps.WdRelativeVerticalPosition,
        WdSelectionType: Wps.WdSelectionType,
        WdShapePosition: Wps.WdShapePosition,
        WdStatistic: Wps.WdStatistic,
        WdStyleType: Wps.WdStyleType,
        WdTextureIndex: Wps.WdTextureIndex,
        WdThemeColorIndex: Wps.WdThemeColorIndex,
        WdWordDialog: Wps.WdWordDialog,
        WdWrapType: Wps.WdWrapType,
    };

    /** 扩充 Wps.Application 接口
     *  添加 Enum, NewEnum 属性（接口未声明，但实际支持）
     */
    declare namespace Wps {
        interface Application {
            // 拓展
            EnableEvents: boolean;
            /**
             * https://open.wps.cn/documents/app-integration-dev/wps365/client/wpsoffice/jsapi/addin-api/Application/member/confirm
             */
            confirm: (text: string) => boolean;
        }

        interface Range {
            // 原类型定义是 any，此处无法覆盖
            Parent: Document;
        }

        interface Application {
            /**
             * 包含 WPS 各种枚举常量
             */
            Enum: Enum;
            /**
             * 包含 WPS 各种枚举常量的根对象
             */
            NewEnum: NewEnum;
        }
    }
    const ActiveDocument: Wps.Document;

    const msoCTPDockPositionLeft = 0;
    const msoCTPDockPositionTop = 1;
    const msoCTPDockPositionRight = 2;
    const msoCTPDockPositionBottom = 3;
    const msoCTPDockPositionFloating = 4;

    const msoFileDialogOpen = 1;
    const msoFileDialogSaveAs = 2;
    const msoFileDialogFilePicker = 3;
    const msoFileDialogFolderPicker = 4;

    const msoTrue: -1;
    const msoFalse: 0;

    const msoTextOrientationMixed = -2;
    const msoTextOrientationHorizontal = 1;
    const msoTextOrientationUpward = 2;
    const msoTextOrientationDownward = 3;
    const msoTextOrientationVerticalFarEast = 4;
    const msoTextOrientationVertical = 5;
    const msoTextOrientationHorizontalRotatedFarEast = 6;

    const wdWidthHalfWidth = 6;
    const wdWidthFullWidth = 7;

    const wdAuto = 0;
    const wdColorAutomatic = -16777216;

    const wdHeaderFooterPrimary = 1;
    const wdHeaderFooterFirstPage = 2;
    const wdHeaderFooterEvenPages = 3;

    const wdLineSpaceSingle = 0;
    const wdLineSpace1pt5 = 1;
    const wdLineSpaceDouble = 2;
    const wdLineSpaceAtLeast = 3;
    const wdLineSpaceExactly = 4;
    const wdLineSpaceMultiple = 5;

    const wdAlignParagraphLeft = 0;
    const wdAlignParagraphCenter = 1;
    const wdAlignParagraphRight = 2;
    const wdAlignParagraphJustify = 3;
    const wdAlignParagraphDistribute = 4;

    const wdRelativeHorizontalPositionMargin = 0;
    const wdRelativeHorizontalPositionPage = 1;
    const wdRelativeHorizontalPositionColumn = 2;
    const wdRelativeHorizontalPositionCharacter = 3;
    const wdRelativeHorizontalPositionLeftMarginArea = 4;
    const wdRelativeHorizontalPositionRightMarginArea = 5;
    const wdRelativeHorizontalPositionInnerMarginArea = 6;
    const wdRelativeHorizontalPositionOuterMarginArea = 7;

    const wdRelativeVerticalPositionMargin = 0;
    const wdRelativeVerticalPositionPage = 1;
    const wdRelativeVerticalPositionParagraph = 2;
    const wdRelativeVerticalPositionLine = 3;
    const wdRelativeVerticalPositionTopMarginArea = 4;
    const wdRelativeVerticalPositionBottomMarginArea = 5;
    const wdRelativeVerticalPositionInnerMarginArea = 6;
    const wdRelativeVerticalPositionOuterMarginArea = 7;

    const wdNoSelection = 0;
    const wdSelectionIP = 1;
    const wdSelectionNormal = 2;
    const wdSelectionFrame = 3;
    const wdSelectionColumn = 4;
    const wdSelectionRow = 5;
    const wdSelectionBlock = 6;
    const wdSelectionInlineShape = 7;
    const wdSelectionShape = 8;

    const wdShapeTop = -999999;
    const wdShapeLeft = -999998;
    const wdShapeBottom = -999997;
    const wdShapeRight = -999996;
    const wdShapeCenter = -999995;
    const wdShapeInside = -999994;
    const wdShapeOutside = -999993;

    const wdStatisticWords = 0;
    const wdStatisticLines = 1;
    const wdStatisticPages = 2;
    const wdStatisticCharacters = 3;
    const wdStatisticParagraphs = 4;
    const wdStatisticCharactersWithSpaces = 5;
    const wdStatisticFarEastCharacters = 6;

    const wdStyleTypeParagraph = 1;
    const wdStyleTypeCharacter = 2;
    const wdStyleTypeTable = 3;
    const wdStyleTypeList = 4;
    const wdStyleTypeParagraphOnly = 5;
    const wdStyleTypeLinked = 6;

    const wdTextureNone = 0;

    // WdInformation
    const wdActiveEndAdjustedPageNumber = 1;
    const wdActiveEndSectionNumber = 2;
    const wdActiveEndPageNumber = 3;
    const wdNumberOfPagesInDocument = 4;
    const wdHorizontalPositionRelativeToPage = 5;
    const wdVerticalPositionRelativeToPage = 6;
    const wdHorizontalPositionRelativeToTextBoundary = 7;
    const wdVerticalPositionRelativeToTextBoundary = 8;
    const wdFirstCharacterColumnNumber = 9;
    const wdFirstCharacterLineNumber = 10;
    const wdFrameIsSelected = 11;
    const wdWithInTable = 12;
    const wdStartOfRangeRowNumber = 13;
    const wdEndOfRangeRowNumber = 14;
    const wdMaximumNumberOfRows = 15;
    const wdStartOfRangeColumnNumber = 16;
    const wdEndOfRangeColumnNumber = 17;
    const wdMaximumNumberOfColumns = 18;
    const wdZoomPercentage = 19;
    const wdSelectionMode = 20;
    const wdCapsLock = 21;
    const wdNumLock = 22;
    const wdOverType = 23;
    const wdRevisionMarking = 24;
    const wdInFootnoteEndnotePane = 25;
    const wdInCommentPane = 26;
    const wdInHeaderFooter = 28;
    const wdAtEndOfRowMarker = 31;
    const wdReferenceOfType = 32;
    const wdHeaderFooterType = 33;
    const wdInMasterDocument = 34;
    const wdInFootnote = 35;
    const wdInEndnote = 36;
    const wdInWordMail = 37;
    const wdInClipboard = 38;
    const wdInCoverPage = 41;
    const wdInBibliography = 42;
    const wdInFieldResult = 45;
    const wdInCitation = 43;
    const wdInFieldCode = 44;
    const wdInContentControl = 46;

    const wdWrapSquare = 0;
    const wdWrapTight = 1;
    const wdWrapThrough = 2;
    const wdWrapNone = 3;
    const wdWrapTopBottom = 4;
    const wdWrapBehind = 5;
    const wdWrapFront = 3;
    const wdWrapInline = 7;
}
