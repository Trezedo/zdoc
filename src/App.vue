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
import { setupRibbonBindings } from "@/jsa/ribbon/actions";
import { zhCN } from "naive-ui";

onMounted(() => {
    setupRibbonBindings();
});
</script>

<style></style>
