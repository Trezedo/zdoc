<template>
    <div class="flex flex-col h-screen bg-white">
        <!-- 滚动区域：占据剩余空间 -->
        <n-scrollbar class="flex-1 min-h-0">
            <div class="p-5">
                <!-- 标题配置 -->
                <div class="border rounded-md p-4 mb-4 shadow">
                    <div class="flex justify-between items-center mb-3">
                        <h4 class="font-medium text-sm">📝 标题</h4>
                    </div>
                    <div class="grid grid-cols-2 gap-3 mb-3">
                        <div>
                            <label class="block text-xs text-gray-500 mb-1">中文字体</label>
                            <n-select
                                v-model:value="config.title.zh"
                                :options="chineseFontOptions"
                                size="small"
                                filterable
                            />
                        </div>
                        <div>
                            <label class="block text-xs text-gray-500 mb-1">西文字体</label>
                            <n-select
                                v-model:value="config.title.en"
                                :options="titleWesternOptions"
                                size="small"
                                filterable
                            />
                        </div>
                    </div>
                    <div class="grid grid-cols-2 gap-3">
                        <div>
                            <label class="block text-xs text-gray-500 mb-1">字号(pt)</label>
                            <n-input-number
                                v-model:value="config.title.size"
                                :min="0"
                                :step="1"
                                size="small"
                                class="w-full"
                                v-wheel-change
                            >
                                <template #suffix>
                                    <span class="text-gray-400 text-xs ml-1">
                                        {{ getChineseFontSizeName(config.title.size) }}
                                    </span>
                                </template>
                            </n-input-number>
                        </div>
                        <div>
                            <label class="block text-xs text-gray-500 mb-1">行距(固定值)</label>
                            <n-input-number
                                v-model:value="config.title.spacing"
                                :min="0"
                                :step="0.05"
                                size="small"
                                :precision="2"
                                class="w-full"
                            />
                        </div>
                    </div>
                </div>

                <!-- 正文配置 -->
                <div class="border rounded-md p-4 mb-4 shadow">
                    <div class="flex justify-between items-center mb-3">
                        <h4 class="font-medium text-sm">📄 正文</h4>
                    </div>
                    <div class="grid grid-cols-2 gap-3 mb-3">
                        <div>
                            <label class="block text-xs text-gray-500 mb-1">中文字体</label>
                            <n-select
                                v-model:value="config.main.zh"
                                :options="chineseFontOptions"
                                size="small"
                            />
                        </div>
                        <div>
                            <label class="block text-xs text-gray-500 mb-1">西文字体</label>
                            <n-select
                                v-model:value="config.main.en"
                                :options="mainWesternOptions"
                                size="small"
                            />
                        </div>
                    </div>
                    <div class="grid grid-cols-3 gap-3">
                        <div>
                            <label class="block text-xs text-gray-500 mb-1">首行缩进(字符)</label>
                            <n-input-number
                                v-model:value="config.main.indent"
                                :min="0"
                                :step="0.5"
                                size="small"
                                :precision="1"
                                class="w-full"
                                v-wheel-change
                            />
                        </div>
                        <div>
                            <label class="block text-xs text-gray-500 mb-1">字号(pt)</label>
                            <n-input-number
                                v-model:value="config.main.size"
                                :min="0"
                                :step="1"
                                size="small"
                                class="w-full"
                                v-wheel-change
                            >
                                <template #suffix>
                                    <span class="text-gray-400 text-xs ml-1">
                                        {{ getChineseFontSizeName(config.main.size) }}
                                    </span>
                                </template>
                            </n-input-number>
                        </div>
                        <div>
                            <label class="block text-xs text-gray-500 mb-1">行距(固定值)</label>
                            <n-input-number
                                v-model:value="config.main.spacing"
                                :min="0"
                                :step="0.05"
                                size="small"
                                :precision="2"
                                class="w-full"
                            />
                        </div>
                    </div>
                </div>

                <!-- 其他元素 -->
                <div class="border rounded-md p-4 shadow">
                    <h4 class="font-medium text-sm mb-3">🔤 其他</h4>
                    <div class="flex flex-col gap-2">
                        <div class="flex items-center gap-2">
                            <span class="text-xs text-gray-500 w-16">主送机关</span>
                            <n-select
                                v-model:value="config.salutation.font"
                                :options="chineseFontOptions"
                                size="small"
                                class="flex-1 min-w-0"
                            />
                            <n-checkbox v-model:checked="config.salutation.bold">加粗</n-checkbox>
                        </div>
                        <div class="flex items-center gap-2">
                            <span class="text-xs text-gray-500 w-16">一级标题</span>
                            <n-select
                                v-model:value="config.h1.font"
                                :options="chineseFontOptions"
                                size="small"
                                class="flex-1 min-w-0"
                            />
                            <n-checkbox v-model:checked="config.h1.bold">加粗</n-checkbox>
                        </div>
                        <div class="flex items-center gap-2">
                            <span class="text-xs text-gray-500 w-16">二级标题</span>
                            <n-select
                                v-model:value="config.h2.font"
                                :options="chineseFontOptions"
                                size="small"
                                class="flex-1 min-w-0"
                            />
                            <n-checkbox v-model:checked="config.h2.bold">加粗</n-checkbox>
                        </div>
                        <div class="flex items-center gap-2">
                            <span class="text-xs text-gray-500 w-16">三级标题</span>
                            <n-select
                                v-model:value="config.h3.font"
                                :options="chineseFontOptions"
                                size="small"
                                class="flex-1 min-w-0"
                            />
                            <n-checkbox v-model:checked="config.h3.bold">加粗</n-checkbox>
                        </div>
                        <div class="flex items-center gap-2">
                            <span class="text-xs text-gray-500 w-16">小标题加粗</span>
                            <n-select
                                v-model:value="config.topicBoldMode"
                                :options="topicBoldModeOptions"
                                size="small"
                                class="flex-1 min-w-0"
                            />
                            <div class="w-8"></div>
                        </div>
                    </div>
                </div>
            </div>
        </n-scrollbar>

        <!-- 操作按钮 -->
        <div class="flex flex-wrap gap-2 p-5 pt-0 mt-4">
            <!-- <n-button size="small" class="flex-1" @click="importConfig"> 导入配置 </n-button> -->
            <n-button size="small" class="flex-1" @click="saveToFile"> 保存配置 </n-button>
            <n-button size="small" type="primary" class="flex-1" @click="applyStyle">
                应用样式
            </n-button>
            <n-button size="small" class="flex-1" @click="resetToDefault"> 恢复默认 </n-button>
        </div>
    </div>
</template>

<script setup lang="ts">
import { debounce } from "radash";

import { getDefaultConfig } from "@/config/typography";
import { getBrowserFonts, getWpsFonts } from "@/utils/fonts";
import { STORAGE_KEYS } from "@/jsa/ribbon/taskPane";
import type { TypographyConfig } from "@/types";
import { saveConfigLocal, withUndoRecord } from "@/jsa/utils/document";
import { setupBodyStyle, setupTitleStyle } from "@/jsa/commands/govDoc";

const STORAGE_KEY = STORAGE_KEYS.OFFICIAL_TYPOGRAPHY_CONFIG;

// 字体列表（纯中文字体 / 纯西文字体）
const chineseFonts = ref<string[]>([]);
const westernFonts = ref<string[]>([]);

// 加粗模式选项
const topicBoldModeOptions = [
    { label: "自动（短句整句加粗，长句仅前缀）", value: "auto" },
    { label: "仅前缀（如“一是”、“二是”）", value: "prefix" },
    { label: "不加粗", value: "none" },
];

const config: TypographyConfig = reactive(getDefaultConfig());

const message = useMessage();
const notification = useNotification();

// 中文字体选项
const chineseFontOptions = computed(() =>
    chineseFonts.value.map((font) => ({ label: font, value: font })),
);

// 纯西文字体选项（不含中文）
const rawWesternOptions = computed(() =>
    westernFonts.value.map((font) => ({ label: font, value: font })),
);

// 标题的西文字体选项
const titleWesternOptions = computed(() => [
    { label: "随中文：" + config.title.zh, value: config.title.zh },
    ...rawWesternOptions.value,
]);

// 正文的西文字体选项
const mainWesternOptions = computed(() => [
    { label: "随中文：" + config.main.zh, value: config.main.zh },
    ...rawWesternOptions.value,
]);

// 字号映射表（单位：pt → 中文名称）
const fontSizeMap: Record<number, string> = {
    5: "八号",
    5.5: "七号",
    6.5: "小六",
    7.5: "六号",
    9: "小五",
    10.5: "五号",
    12: "小四",
    14: "四号",
    15: "小三",
    16: "三号",
    18: "小二",
    22: "二号",
    24: "小一",
    26: "一号",
    36: "小初",
    42: "初号",
};

// 获取中文字号的函数（现在可以安全地用 number 索引）
const getChineseFontSizeName = (pt: number): string => {
    return fontSizeMap[pt] || "";
};

// 监听标题中文字体变化，自动更新标题西文字体（如果西文与旧中文相同）
watch(
    () => config.title.zh,
    (newZh, oldZh) => {
        if (config.title.en === oldZh) config.title.en = newZh;
    },
);

// 监听正文中文字体变化，自动更新正文西文字体
watch(
    () => config.main.zh,
    (newZh, oldZh) => {
        if (config.main.en === oldZh) config.main.en = newZh;
    },
);

function saveToStorage() {
    Application.PluginStorage.setItem(STORAGE_KEY, JSON.stringify(config));
}

function loadConfig() {
    const stored = Application.PluginStorage.getItem(STORAGE_KEY);
    if (stored) {
        try {
            const saved = JSON.parse(stored) as Partial<TypographyConfig>;
            // 合并默认值（防止缺失字段）
            const defaultConfig = getDefaultConfig();
            const mergedConfig = {
                title: { ...defaultConfig.title, ...saved.title },
                main: { ...defaultConfig.main, ...saved.main },
                salutation: { ...defaultConfig.salutation, ...saved.salutation },
                h1: { ...defaultConfig.h1, ...saved.h1 },
                h2: { ...defaultConfig.h2, ...saved.h2 },
                h3: { ...defaultConfig.h3, ...saved.h3 },
                topicBoldMode: saved.topicBoldMode ?? defaultConfig.topicBoldMode,
            };
            Object.assign(config, mergedConfig);
        } catch (e) {
            console.error("加载配置失败", e);
            resetToDefault();
        }
    } else {
        resetToDefault();
    }
}

function resetToDefault() {
    const def = getDefaultConfig();
    Object.assign(config, def);
    message.info("已恢复默认，配置已自动保存");
    saveToStorage();
}

function applyStyle() {
    withUndoRecord("应用样式", () => {
        setupBodyStyle(config);
        setupTitleStyle(config);
    });
}

function saveToFile() {
    const result = saveConfigLocal(JSON.stringify(config, null, 4));
    if (result.success) {
        return notification.success({
            title: "保存成功",
            content: "文件路径：" + result.path,
            duration: 3000,
            keepAliveOnHover: true,
        });
    }
    return message.error("保存失败，路径：" + result.path);
}

// 加载系统字体列表
async function loadFonts() {
    const [wpsChinese, wpsWestern] = getWpsFonts();
    if (wpsChinese.length > 0) {
        chineseFonts.value = wpsChinese;
        westernFonts.value = wpsWestern;
    } else {
        const [chn, west] = await getBrowserFonts();
        chineseFonts.value = chn;
        westernFonts.value = west;
    }
}

const debouncedSave = debounce({ delay: 500 }, saveToStorage);

watch(
    () => config,
    () => {
        debouncedSave();
    },
    { deep: true },
);

onMounted(() => {
    loadFonts();
    loadConfig();
});
</script>

<style>
/* 缩小 Select 下拉菜单的字体和间距 */
.n-base-select-menu .n-base-select-option {
    font-size: 12px;
}

.n-base-select-menu.n-base-select-menu--medium-size.n-select-menu {
    --n-option-height: 28px !important;
}
</style>
