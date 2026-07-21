import {
    DEFAULT_FOOTER_CONFIG,
    DEFAULT_HEADER_CONFIG,
    DEFAULT_PAGE_LAYOUT_CONFIG,
    DEFAULT_TYPO_CONFIG,
    getDefaultConfigFull,
} from "@/config/defaults";
import { validateGovDocConfig } from "@/config/validator";
import type {
    FooterConfig,
    GovDocConfig,
    HeaderConfig,
    PageLayoutConfig,
    TypographyConfig,
} from "@/jsa/types";
import { loadGovDocConfig, saveGovDocConfig } from "@/jsa/utils/storage";

type GovDocConfigState = GovDocConfig & { loaded: boolean };

export const useGovDocConfigStore = defineStore("govDocConfig", {
    state: (): GovDocConfigState => ({
        typography: { ...DEFAULT_TYPO_CONFIG } as TypographyConfig,
        pageLayout: { ...DEFAULT_PAGE_LAYOUT_CONFIG } as PageLayoutConfig,
        header: { ...DEFAULT_HEADER_CONFIG } as HeaderConfig,
        footer: { ...DEFAULT_FOOTER_CONFIG } as FooterConfig,
        loaded: false,
    }),

    actions: {
        /**
         * 从文件加载配置
         */
        loadFromFile() {
            const saved = loadGovDocConfig();
            if (saved) {
                try {
                    const validated = validateGovDocConfig(saved);
                    // 直接赋值给各个 state 属性
                    this.typography = validated.typography || { ...DEFAULT_TYPO_CONFIG };
                    this.pageLayout = validated.pageLayout || { ...DEFAULT_PAGE_LAYOUT_CONFIG };
                    this.header = validated.header || { ...DEFAULT_HEADER_CONFIG };
                    this.footer = validated.footer || { ...DEFAULT_FOOTER_CONFIG };
                } catch (error) {
                    console.warn("配置校验失败，使用默认配置", error);
                    this.resetToDefault();
                }
            } else {
                this.resetToDefault();
            }
            this.loaded = true;
        },

        /**
         * 保存到文件
         */
        saveToFile() {
            const config = {
                pageLayout: this.pageLayout,
                typography: this.typography,
                header: this.header,
                footer: this.footer,
            };
            return saveGovDocConfig(config);
        },

        /**
         * 重置为默认值
         */
        resetToDefault() {
            const def = getDefaultConfigFull();
            this.typography = def.typography;
            this.pageLayout = def.pageLayout;
            this.header = def.header!;
            this.footer = def.footer!;
        },

        /**
         * 重新从文件载入（用户点击"载入配置"时调用）
         */
        reloadFromFile() {
            this.loadFromFile();
        },
    },
});
