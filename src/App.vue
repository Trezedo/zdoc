<template>
    <NConfigProvider :locale="zhCN">
        <NNotificationProvider>
            <NMessageProvider>
                <NModalProvider>
                    <NDialogProvider>
                        <RouterView />
                    </NDialogProvider>
                </NModalProvider>
            </NMessageProvider>
        </NNotificationProvider>
    </NConfigProvider>
</template>

<script setup lang="ts">
import { zhCN } from "naive-ui";

import { useGovDocConfig } from "@/stores/govDocConfig";

// 挂载后从本地文件加载配置
// 因为弹窗从 localStorage 读取配置，只需要在主应用入口处导入文件配置
onMounted(() => {
    const store = useGovDocConfig();
    store.loadFromFile();
});
</script>

<style></style>
