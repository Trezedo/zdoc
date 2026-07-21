<template>
    <div class="border rounded-md p-4 shadow">
        <div class="grid grid-cols-2 gap-4">
            <div class="flex items-center">
                <label class="text-sm font-medium text-gray-700">字体：</label>
                <n-select
                    v-model:value="localConfig.font"
                    :options="chineseFontOptions"
                    size="small"
                    class="flex-1"
                />
            </div>

            <div class="flex items-center">
                <label class="text-sm font-medium text-gray-700">字号：</label>
                <n-input-number
                    v-model:value="localConfig.fontSize"
                    :min="0"
                    :step="0.5"
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

            <div class="flex flex-col col-span-2">
                <label class="text-sm font-medium text-gray-700 mb-2">位置：</label>
                <n-radio-group
                    v-model:value="localConfig.position"
                    size="small"
                    class="flex flex-wrap justify-center gap-3"
                >
                    <n-radio
                        v-for="opt in positionOptions"
                        :key="opt.value"
                        :value="opt.value"
                        class="flex items-center gap-1"
                    >
                        <img :src="opt.icon" class="h-10 object-contain" :alt="opt.label" />
                        <span class="text-sm align-middle">{{ opt.label }}</span>
                    </n-radio>
                </n-radio-group>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { useFonts } from "@/composables/useFonts";
import { DEFAULT_FOOTER_CONFIG } from "@/config/defaults";
import type { FooterConfig } from "@/jsa/types";
import { getChineseFontSizeName } from "@/utils/fonts";

// 位置选项（图标直接放在 public/images/ 目录下）
const positionOptions = [
    { label: "左侧", value: "left", icon: "/images/Pagenum_BottomLeft.svg" },
    { label: "居中", value: "middle", icon: "/images/Pagenum_BottomMid.svg" },
    { label: "右侧", value: "right", icon: "/images/Pagenum_BottomRight.svg" },
    { label: "内侧", value: "inside", icon: "/images/Pagenum_BottomInside.svg" },
    { label: "外侧", value: "outside", icon: "/images/Pagenum_BottomOutside.svg" },
];

const props = defineProps<{
    modelValue: FooterConfig;
}>();

const emit = defineEmits<{
    "update:modelValue": [value: FooterConfig];
}>();

const localConfig = reactive<FooterConfig>({ ...DEFAULT_FOOTER_CONFIG });

watch(
    () => props.modelValue,
    (newVal) => {
        if (newVal) Object.assign(localConfig, newVal);
    },
    { deep: true, immediate: true },
);

watch(
    localConfig,
    (newVals, oldVals) => {
        console.log("watch triggered", newVals, oldVals);
        emit("update:modelValue", { ...localConfig });
    },
    { immediate: true },
);

const { chineseFontOptions } = useFonts();
</script>

<style lang="css">
.n-radio .n-radio__label {
    text-align: center;
}
</style>
