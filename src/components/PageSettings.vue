<template>
    <div class="grid grid-cols-2 gap-4">
        <div class="flex items-center justify-between gap-2">
            <label class="text-sm font-medium text-gray-700">上边距</label>
            <div class="flex flex-1 items-center gap-1">
                <n-input-number
                    v-model:value="localConfig.top"
                    :min="0"
                    :step="0.1"
                    size="medium"
                    class="flex-1"
                    v-wheel-change
                />
                <span class="text-sm text-gray-400">cm</span>
            </div>
        </div>
        <div class="flex items-center justify-between gap-2">
            <label class="text-sm font-medium text-gray-700">下边距</label>
            <div class="flex flex-1 items-center gap-1">
                <n-input-number
                    v-model:value="localConfig.bottom"
                    :min="0"
                    :step="0.1"
                    size="medium"
                    class="flex-1"
                    v-wheel-change
                />
                <span class="text-sm text-gray-400">cm</span>
            </div>
        </div>
        <div class="flex items-center justify-between gap-2">
            <label class="text-sm font-medium text-gray-700">左边距</label>
            <div class="flex flex-1 items-center gap-1">
                <n-input-number
                    v-model:value="localConfig.left"
                    :min="0"
                    :step="0.1"
                    size="medium"
                    class="flex-1"
                    v-wheel-change
                />
                <span class="text-sm text-gray-400">cm</span>
            </div>
        </div>
        <div class="flex items-center justify-between gap-2">
            <label class="text-sm font-medium text-gray-700">右边距</label>
            <div class="flex flex-1 items-center gap-1">
                <n-input-number
                    v-model:value="localConfig.right"
                    :min="0"
                    :step="0.1"
                    size="medium"
                    class="flex-1"
                    v-wheel-change
                />
                <span class="text-sm text-gray-400">cm</span>
            </div>
        </div>
        <div class="flex items-center justify-between gap-2">
            <label class="text-sm font-medium text-gray-700">页眉距离</label>
            <div class="flex flex-1 items-center gap-1">
                <n-input-number
                    v-model:value="localConfig.header"
                    :min="0"
                    :step="0.1"
                    size="medium"
                    class="flex-1"
                    v-wheel-change
                />
                <span class="text-sm text-gray-400">cm</span>
            </div>
        </div>
        <div class="flex items-center justify-between gap-2">
            <label class="text-sm font-medium text-gray-700">页脚距离</label>
            <div class="flex flex-1 items-center gap-1">
                <n-input-number
                    v-model:value="localConfig.footer"
                    :min="0"
                    :step="0.1"
                    size="medium"
                    class="flex-1"
                    v-wheel-change
                />
                <span class="text-sm text-gray-400">cm</span>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { setPageLayout } from "@/jsa/commands/document";
import type { PageLayoutOptions } from "@/types";

const props = defineProps<{
    modelValue: PageLayoutOptions;
}>();

const emit = defineEmits<{
    "update:modelValue": [value: PageLayoutOptions];
}>();

const localConfig = reactive<PageLayoutOptions>({
    header: 1.5,
    top: 3.7,
    left: 2.8,
    right: 2.6,
    bottom: 3.5,
    footer: 2.4,
    ...props.modelValue,
});

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

const resetToDefault = () => {
    localConfig.header = 1.5;
    localConfig.top = 3.7;
    localConfig.left = 2.8;
    localConfig.right = 2.6;
    localConfig.bottom = 3.5;
    localConfig.footer = 2.4;
};

const applyMargins = () => {
    try {
        setPageLayout(localConfig);
    } catch (error) {
        console.error("应用边距失败:", error);
    }
};

defineExpose({
    applyMargins,
    resetToDefault,
});
</script>

<style scoped></style>
