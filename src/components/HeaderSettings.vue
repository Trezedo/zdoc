<template>
    <div class="border rounded-md p-4 shadow">
        <div class="grid grid-cols-2 gap-4">
            <div class="flex items-center col-span-2">
                <label class="text-sm font-medium text-gray-700 whitespace-nowrap">
                    页眉内容：
                </label>
                <n-input
                    v-model:value="localConfig.content"
                    placeholder="请输入页眉内容"
                    size="small"
                    class="flex-1"
                    clearable
                />
            </div>

            <div class="flex items-center">
                <label class="text-sm font-medium text-gray-700">字体：</label>
                <n-select
                    v-model:value="localConfig.font"
                    :options="chineseFontOptions"
                    size="small"
                    class="flex-1"
                    placeholder="选择字体"
                />
            </div>

            <div class="flex items-center">
                <label class="text-sm font-medium text-gray-700">字号：</label>
                <n-input-number
                    v-model:value="localConfig.fontSize"
                    :min="0"
                    :step="1"
                    size="small"
                    class="flex-1"
                    v-wheel-change
                >
                    <template #suffix>
                        <span class="text-gray-400 text-xs ml-1">
                            {{ getChineseFontSizeName(localConfig.fontSize) }}
                        </span>
                    </template>
                </n-input-number>
            </div>

            <div class="flex items-center w-full">
                <label class="text-sm font-medium text-gray-700">位置：</label>
                <n-select
                    v-model:value="localConfig.position"
                    :options="positionOptions"
                    size="small"
                    filterable
                    class="flex-1"
                />
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { DEFAULT_HEADER_CONFIG } from "@/jsa/commands/header";
import type { HeaderConfig } from "@/jsa/types";
import { getWpsFonts, getBrowserFonts, getChineseFontSizeName } from "@/utils/fonts";

const positionOptions = [
    { label: "左侧", value: "left" },
    { label: "居中", value: "center" },
    { label: "右侧", value: "right" },
];

const props = defineProps<{
    modelValue: HeaderConfig;
}>();

const emit = defineEmits<{
    "update:modelValue": [value: HeaderConfig];
}>();

// 必须创建配置副本
const localConfig = reactive<HeaderConfig>({ ...DEFAULT_HEADER_CONFIG });

watch(
    () => props.modelValue,
    (newVal) => {
        if (newVal) Object.assign(localConfig, newVal);
    },
    { deep: true, immediate: true },
);

watch(
    [
        () => localConfig.content,
        () => localConfig.font,
        () => localConfig.fontSize,
        () => localConfig.position,
    ],
    () => {
        emit("update:modelValue", { ...localConfig });
    },
    { immediate: true },
);

const chineseFonts = ref<string[]>([]);
const chineseFontOptions = computed(() =>
    chineseFonts.value.map((font) => ({ label: font, value: font })),
);

async function loadFonts() {
    try {
        const [wpsChinese] = getWpsFonts();
        if (wpsChinese?.length) {
            chineseFonts.value = wpsChinese;
        } else {
            const [chn] = await getBrowserFonts();
            chineseFonts.value = chn || ["宋体", "仿宋", "黑体", "楷体"];
        }
    } catch {
        chineseFonts.value = ["宋体", "仿宋", "黑体", "楷体"];
    }
}

onMounted(loadFonts);
</script>

<style scoped></style>
