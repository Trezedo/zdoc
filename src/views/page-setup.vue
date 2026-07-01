<template>
    <div class="min-h-screen bg-gray-50 p-6 font-sans">
        <div class="mx-auto max-w-2xl">
            <!-- 标题 -->
            <div class="mb-8 text-center">
                <h1 class="text-2xl font-semibold text-gray-800">页面边距设置</h1>
                <p class="mt-1 text-sm text-gray-500">单位：毫米 (mm)</p>
            </div>

            <!-- 边距参数卡片 -->
            <div class="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                <div class="border-b border-gray-100 bg-gray-50 px-6 py-3">
                    <h2 class="text-base font-medium text-gray-700">边距参数</h2>
                </div>
                <div class="space-y-5 p-6">
                    <!-- 页眉边距离 -->
                    <div class="flex items-center justify-between gap-4">
                        <label class="w-24 text-sm font-medium text-gray-700">页眉边距离</label>
                        <div class="flex flex-1 items-center gap-2">
                            <n-input-number
                                v-model:value="margins.header"
                                :min="0"
                                :step="0.1"
                                size="medium"
                                class="flex-1"
                                v-wheel-change
                            />
                            <span class="w-8 text-sm text-gray-400">mm</span>
                        </div>
                    </div>

                    <!-- 上边距 -->
                    <div class="flex items-center justify-between gap-4">
                        <label class="w-24 text-sm font-medium text-gray-700">上边距</label>
                        <div class="flex flex-1 items-center gap-2">
                            <n-input-number
                                v-model:value="margins.top"
                                :min="0"
                                :step="0.1"
                                size="medium"
                                class="flex-1"
                                v-wheel-change
                            />
                            <span class="w-8 text-sm text-gray-400">mm</span>
                        </div>
                    </div>

                    <!-- 左边距 与 右边距 同行 -->
                    <div class="grid grid-cols-2 gap-4">
                        <div class="flex items-center justify-between gap-2">
                            <label class="text-sm font-medium text-gray-700">左边距</label>
                            <div class="flex flex-1 items-center gap-1">
                                <n-input-number
                                    v-model:value="margins.left"
                                    :min="0"
                                    :step="0.1"
                                    size="medium"
                                    class="flex-1"
                                    v-wheel-change
                                />
                                <span class="text-sm text-gray-400">mm</span>
                            </div>
                        </div>
                        <div class="flex items-center justify-between gap-2">
                            <label class="text-sm font-medium text-gray-700">右边距</label>
                            <div class="flex flex-1 items-center gap-1">
                                <n-input-number
                                    v-model:value="margins.right"
                                    :min="0"
                                    :step="0.1"
                                    size="medium"
                                    class="flex-1"
                                    v-wheel-change
                                />
                                <span class="text-sm text-gray-400">mm</span>
                            </div>
                        </div>
                    </div>

                    <!-- 下边距 -->
                    <div class="flex items-center justify-between gap-4">
                        <label class="w-24 text-sm font-medium text-gray-700">下边距</label>
                        <div class="flex flex-1 items-center gap-2">
                            <n-input-number
                                v-model:value="margins.bottom"
                                :min="0"
                                :step="0.1"
                                size="medium"
                                class="flex-1"
                                v-wheel-change
                            />
                            <span class="w-8 text-sm text-gray-400">mm</span>
                        </div>
                    </div>

                    <!-- 页脚距离 -->
                    <div class="flex items-center justify-between gap-4">
                        <label class="w-24 text-sm font-medium text-gray-700">页脚距离</label>
                        <div class="flex flex-1 items-center gap-2">
                            <n-input-number
                                v-model:value="margins.footer"
                                :min="0"
                                :step="0.1"
                                size="medium"
                                class="flex-1"
                                v-wheel-change
                            />
                            <span class="w-8 text-sm text-gray-400">mm</span>
                        </div>
                    </div>

                    <!-- 操作按钮 -->
                    <div class="flex gap-3 pt-4">
                        <n-button @click="resetToDefault" class="flex-1">重置默认</n-button>
                        <n-button type="primary" @click="applyMargins" class="flex-1"
                            >应用到文档</n-button
                        >
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { setPageLayout } from "@/jsa/commands/document";

const message = useMessage();

// 边距数据对象（单位：毫米）- 公文默认值
const margins = reactive({
    header: 1.5, // 页眉边距离
    top: 3.7, // 上边距
    left: 2.8, // 左边距
    right: 2.6, // 右边距
    bottom: 3.5, // 下边距
    footer: 2.4, // 页脚距离
});

// 重置为公文推荐默认值
const resetToDefault = () => {
    margins.header = 1.5;
    margins.top = 3.7;
    margins.left = 2.8;
    margins.right = 2.6;
    margins.bottom = 3.5;
    margins.footer = 2.4;
    message.info("已重置为公文默认值");
};

// 应用到文档
const applyMargins = () => {
    try {
        setPageLayout(margins);
        message.info("边距设置已成功应用");
    } catch (error) {
        console.error("应用边距失败:", error);
        message.info("设置边距时出错，请重试");
    }
};
</script>

<style></style>
