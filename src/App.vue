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
</script>

<style></style>
