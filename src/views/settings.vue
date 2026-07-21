<template>
    <div class="flex flex-col h-screen bg-gray-50">
        <n-scrollbar class="flex-1 min-h-0">
            <div class="p-5">
                <div class="mb-6 text-center">
                    <h1 class="text-xl font-semibold text-gray-800">公文设置</h1>
                </div>

                <n-collapse
                    :default-expanded-names="['typography', 'page']"
                    :accordion="false"
                    class="collapse-panel"
                >
                    <n-collapse-item name="page" title="📐 页面设置">
                        <PageSettings v-model="pageLayout" ref="pageRef" />
                    </n-collapse-item>
                    <n-collapse-item name="typography" title="📝 字体设置">
                        <TypographySettings v-model="typography" ref="typographyRef" />
                    </n-collapse-item>
                </n-collapse>
            </div>
        </n-scrollbar>

        <div class="flex flex-wrap gap-2 p-5 border-t border-gray-200 bg-white">
            <n-button size="small" class="flex-1" @click="importConfig">载入配置</n-button>
            <n-button size="small" class="flex-1" @click="saveConfig">保存配置</n-button>
            <n-button size="small" type="primary" class="flex-1" @click="applyAll">
                应用所有设置
            </n-button>
            <n-button size="small" class="flex-1" @click="resetAll">恢复默认</n-button>
        </div>
    </div>
</template>

<script setup lang="ts">
import PageSettings from "@/components/PageSettings.vue";
import TypographySettings from "@/components/TypographySettings.vue";
import { getDefaultConfigFull } from "@/config/defaults";
import { useGovDocConfigStore } from "@/stores/govDocConfig";

const typographyRef = ref<InstanceType<typeof TypographySettings> | null>(null);
const pageRef = ref<InstanceType<typeof PageSettings> | null>(null);

const message = useMessage();
const notification = useNotification();

const store = useGovDocConfigStore();
// 使用 storeToRefs 解构，保持响应式
const { pageLayout, typography } = storeToRefs(store);

function saveConfig() {
    const result = store.saveToFile();
    if (result.success) {
        notification.success({
            title: "保存成功",
            content: "文件路径：" + result.path,
            duration: 3000,
            keepAliveOnHover: true,
        });
    } else {
        message.error("保存失败，路径：" + result.path);
    }
}

function importConfig() {
    store.reloadFromFile();
    message.success("已从配置文件重新载入");
}

async function applyAll() {
    pageRef.value?.applyMargins();
    typographyRef.value?.applyStyle();
    message.info("所有设置已应用");
}

function resetAll() {
    const def = getDefaultConfigFull();
    store.pageLayout = def.pageLayout;
    store.typography = def.typography;
    store.header = def.header!;
    store.footer = def.footer!;
    message.info("已恢复默认设置");
}
</script>

<style scoped></style>
