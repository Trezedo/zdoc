<template>
    <div class="space-y-4">
        <div class="border rounded-md p-4 shadow">
            <div class="flex justify-between items-center mb-3">
                <h4 class="font-medium text-sm">📝 标题</h4>
            </div>
            <div class="grid grid-cols-2 gap-3 mb-3">
                <div>
                    <label class="block text-xs text-gray-500 mb-1">中文字体</label>
                    <n-select
                        v-model:value="localConfig.title.zh"
                        :options="chineseFontOptions"
                        size="small"
                        filterable
                    />
                </div>
                <div>
                    <label class="block text-xs text-gray-500 mb-1">西文字体</label>
                    <n-select
                        v-model:value="localConfig.title.en"
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
                        v-model:value="localConfig.title.size"
                        :min="0"
                        :step="1"
                        size="small"
                        class="w-full"
                        v-wheel-change
                    >
                        <template #suffix>
                            <span class="text-gray-400 text-xs ml-1">
                                {{ getChineseFontSizeName(localConfig.title.size) }}
                            </span>
                        </template>
                    </n-input-number>
                </div>
                <div>
                    <label class="block text-xs text-gray-500 mb-1">行距(固定值)</label>
                    <n-input-number
                        v-model:value="localConfig.title.spacing"
                        :min="0"
                        :step="0.05"
                        size="small"
                        :precision="2"
                        class="w-full"
                    />
                </div>
            </div>
        </div>

        <div class="border rounded-md p-4 shadow">
            <div class="flex justify-between items-center mb-3">
                <h4 class="font-medium text-sm">📄 正文</h4>
            </div>
            <div class="grid grid-cols-2 gap-3 mb-3">
                <div>
                    <label class="block text-xs text-gray-500 mb-1">中文字体</label>
                    <n-select
                        v-model:value="localConfig.main.zh"
                        :options="chineseFontOptions"
                        size="small"
                    />
                </div>
                <div>
                    <label class="block text-xs text-gray-500 mb-1">西文字体</label>
                    <n-select
                        v-model:value="localConfig.main.en"
                        :options="mainWesternOptions"
                        size="small"
                    />
                </div>
            </div>
            <div class="grid grid-cols-3 gap-3">
                <div>
                    <label class="block text-xs text-gray-500 mb-1">首行缩进(字符)</label>
                    <n-input-number
                        v-model:value="localConfig.main.indent"
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
                        v-model:value="localConfig.main.size"
                        :min="0"
                        :step="1"
                        size="small"
                        class="w-full"
                        v-wheel-change
                    >
                        <template #suffix>
                            <span class="text-gray-400 text-xs ml-1">
                                {{ getChineseFontSizeName(localConfig.main.size) }}
                            </span>
                        </template>
                    </n-input-number>
                </div>
                <div>
                    <label class="block text-xs text-gray-500 mb-1">行距(固定值)</label>
                    <n-input-number
                        v-model:value="localConfig.main.spacing"
                        :min="0"
                        :step="0.05"
                        size="small"
                        :precision="2"
                        class="w-full"
                    />
                </div>
            </div>
        </div>

        <div class="border rounded-md p-4 shadow">
            <h4 class="font-medium text-sm mb-3">🔤 其他</h4>
            <div class="flex flex-col gap-2">
                <div class="flex items-center gap-2">
                    <span class="text-xs text-gray-500 w-16">主送机关</span>
                    <n-select
                        v-model:value="localConfig.salutation.font"
                        :options="chineseFontOptions"
                        size="small"
                        class="flex-1 min-w-0"
                    />
                    <n-checkbox v-model:checked="localConfig.salutation.bold">加粗</n-checkbox>
                </div>
                <div class="flex items-center gap-2">
                    <span class="text-xs text-gray-500 w-16">一级标题</span>
                    <n-select
                        v-model:value="localConfig.h1.font"
                        :options="chineseFontOptions"
                        size="small"
                        class="flex-1 min-w-0"
                    />
                    <n-checkbox v-model:checked="localConfig.h1.bold">加粗</n-checkbox>
                </div>
                <div class="flex items-center gap-2">
                    <span class="text-xs text-gray-500 w-16">二级标题</span>
                    <n-select
                        v-model:value="localConfig.h2.font"
                        :options="chineseFontOptions"
                        size="small"
                        class="flex-1 min-w-0"
                    />
                    <n-checkbox v-model:checked="localConfig.h2.bold">加粗</n-checkbox>
                </div>
                <div class="flex items-center gap-2">
                    <span class="text-xs text-gray-500 w-16">三级标题</span>
                    <n-select
                        v-model:value="localConfig.h3.font"
                        :options="chineseFontOptions"
                        size="small"
                        class="flex-1 min-w-0"
                    />
                    <n-checkbox v-model:checked="localConfig.h3.bold">加粗</n-checkbox>
                </div>
                <div class="flex items-center gap-2">
                    <span class="text-xs text-gray-500 w-16">小标题加粗</span>
                    <n-select
                        v-model:value="localConfig.topicBoldMode"
                        :options="topicBoldModeOptions"
                        size="small"
                        class="flex-1 min-w-0"
                    />
                    <div class="w-8"></div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { getDefaultTypoConfig } from "@/config/typography";
import { getBrowserFonts, getWpsFonts } from "@/utils/fonts";
import type { TypographyConfig } from "@/jsa/types";
import { withUndoRecord } from "@/jsa/utils/document";
import { setupBodyStyle, setupTitleStyle } from "@/jsa/commands/govDoc";

const props = defineProps<{
    modelValue: TypographyConfig;
}>();

const emit = defineEmits<{
    "update:modelValue": [value: TypographyConfig];
}>();

const chineseFonts = ref<string[]>([]);
const westernFonts = ref<string[]>([]);

const topicBoldModeOptions = [
    { label: "自动（短句整句加粗，长句仅前缀）", value: "auto" },
    { label: "仅前缀（如“一是”、“二是”）", value: "prefix" },
    { label: "不加粗", value: "none" },
];

const localConfig = reactive<TypographyConfig>({ ...props.modelValue });

watch(
    () => props.modelValue,
    (newVal) => {
        Object.assign(localConfig, newVal);
    },
    { deep: true },
);

watch(
    localConfig,
    (newVal) => {
        emit("update:modelValue", { ...newVal });
    },
    { deep: true },
);

const chineseFontOptions = computed(() =>
    chineseFonts.value.map((font) => ({ label: font, value: font })),
);

const rawWesternOptions = computed(() =>
    westernFonts.value.map((font) => ({ label: font, value: font })),
);

const titleWesternOptions = computed(() => [
    { label: "随中文：" + localConfig.title.zh, value: localConfig.title.zh },
    ...rawWesternOptions.value,
]);

const mainWesternOptions = computed(() => [
    { label: "随中文：" + localConfig.main.zh, value: localConfig.main.zh },
    ...rawWesternOptions.value,
]);

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

const getChineseFontSizeName = (pt: number): string => {
    return fontSizeMap[pt] || "";
};

watch(
    () => localConfig.title.zh,
    (newZh, oldZh) => {
        if (localConfig.title.en === oldZh) localConfig.title.en = newZh;
    },
);

watch(
    () => localConfig.main.zh,
    (newZh, oldZh) => {
        if (localConfig.main.en === oldZh) localConfig.main.en = newZh;
    },
);

const applyStyle = () => {
    withUndoRecord("应用样式", () => {
        setupBodyStyle(localConfig);
        setupTitleStyle(localConfig);
    });
};

const resetToDefault = () => {
    const def = getDefaultTypoConfig();
    Object.assign(localConfig, def);
};

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

onMounted(() => {
    loadFonts();
});

defineExpose({
    applyStyle,
    resetToDefault,
});
</script>

<style scoped>
/* 缩小 Select 下拉菜单的字体和间距 */
.n-base-select-menu .n-base-select-option {
    font-size: 12px;
}

.n-base-select-menu.n-base-select-menu--medium-size.n-select-menu {
    --n-option-height: 28px !important;
}
</style>
