<template>
    <div class="flex h-screen flex-col items-center justify-center bg-white p-6">
        <div class="text-center">
            <p class="mb-6 text-lg text-gray-800">{{ message }}</p>
            <n-button @click="closeDialog()"> 确定 </n-button>
        </div>
    </div>
</template>

<script setup lang="ts">
import { STORAGE_KEYS } from "@/jsa/ribbon/taskPane";

const message = ref<string>("");

// 从 PluginStorage 读取消息
const loadMessage = () => {
    try {
        const rawMsg = Application.PluginStorage.getItem(STORAGE_KEYS.MESSAGE);
        if (rawMsg && rawMsg.trim() !== "") {
            message.value = rawMsg;
        } else {
            message.value = "暂无消息内容";
        }
    } catch (error) {
        console.error("读取 PluginStorage 失败:", error);
        message.value = "读取消息失败";
    }
};

// 关闭对话框（路由页面）
const closeDialog = () => {
    // 直接调用 window.close() 关闭由 ShowDialog 打开的窗口
    window.close();
};

onMounted(() => {
    loadMessage();
});
</script>
