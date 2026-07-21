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

import { setupRibbonBindings } from "@/jsa/ribbon/actions";

onMounted(() => {
    setupRibbonBindings();
});
</script>

<style></style>
