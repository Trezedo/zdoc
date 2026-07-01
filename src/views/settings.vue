<template>
    <div class="flex flex-col h-screen bg-gray-50">
        <n-scrollbar class="flex-1 min-h-0">
            <div class="p-5">
                <div class="mb-6 text-center">
                    <h1 class="text-xl font-semibold text-gray-800">公文设置</h1>
                </div>

                <n-collapse
                    :default-expanded-names="['typography', 'page']"
                    accordion
                    class="collapse-panel"
                >
                    <n-collapse-item name="typography" title="📝 字体设置">
                        <TypographySettings v-model="config.typography" ref="typographyRef" />
                    </n-collapse-item>

                    <n-collapse-item name="page" title="📐 页面设置">
                        <div class="space-y-5 p-4">
                            <PageSettings v-model="config.pageLayout" ref="pageRef" />
                        </div>
                    </n-collapse-item>
                </n-collapse>
            </div>
        </n-scrollbar>

        <div class="flex flex-wrap gap-2 p-5 pt-0 border-t border-gray-200 bg-white">
            <n-button size="small" class="flex-1" @click="saveConfig">保存配置</n-button>
            <n-button size="small" class="flex-1" @click="importConfig">载入配置</n-button>
            <n-button size="small" type="primary" class="flex-1" @click="applyAll">
                应用所有设置
            </n-button>
            <n-button size="small" class="flex-1" @click="resetAll">恢复默认</n-button>
        </div>
    </div>
</template>

<script setup lang="ts">
import { debounce } from "radash";

import TypographySettings from "@/components/TypographySettings.vue";
import PageSettings from "@/components/PageSettings.vue";
import { getDefaultConfig } from "@/config/typography";
import { STORAGE_KEYS } from "@/jsa/ribbon/taskPane";
import type { GovDocConfig } from "@/types";
import { saveConfigLocal, loadConfigLocal } from "@/jsa/utils/document";

const typographyRef = ref<InstanceType<typeof TypographySettings> | null>(null);
const pageRef = ref<InstanceType<typeof PageSettings> | null>(null);

const message = useMessage();
const notification = useNotification();

const defaultPageLayout = {
    header: 1.5,
    top: 3.7,
    left: 2.8,
    right: 2.6,
    bottom: 3.5,
    footer: 2.4,
};

const config = reactive<GovDocConfig>({
    typography: getDefaultConfig(),
    pageLayout: { ...defaultPageLayout },
});

function getDefaultConfigFull(): GovDocConfig {
    return {
        typography: getDefaultConfig(),
        pageLayout: { ...defaultPageLayout },
    };
}

function loadFromLocalFile() {
    const content = loadConfigLocal();
    if (content) {
        try {
            const saved = JSON.parse(content) as Partial<GovDocConfig>;
            if (saved.typography) {
                Object.assign(config.typography, saved.typography);
            }
            if (saved.pageLayout) {
                Object.assign(config.pageLayout, saved.pageLayout);
            }
            message.info("已从本地配置文件加载");
        } catch (e) {
            console.error("加载配置文件失败", e);
            message.error("配置文件格式错误");
        }
    }
}

function loadFromPluginStorage() {
    const stored = Application.PluginStorage.getItem(STORAGE_KEYS.OFFICIAL_TYPOGRAPHY_CONFIG);
    if (stored) {
        try {
            const saved = JSON.parse(stored) as Partial<GovDocConfig["typography"]>;
            Object.assign(config.typography, saved);
        } catch (e) {
            console.error("加载插件存储失败", e);
        }
    }
}

function saveToPluginStorage() {
    Application.PluginStorage.setItem(
        STORAGE_KEYS.OFFICIAL_TYPOGRAPHY_CONFIG,
        JSON.stringify(config.typography),
    );
}

function saveConfig() {
    const result = saveConfigLocal(JSON.stringify(config, null, 4));
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
    loadFromLocalFile();
}

function applyAll() {
    typographyRef.value?.applyStyle();
    pageRef.value?.applyMargins();
    message.info("所有设置已应用");
}

function resetAll() {
    const def = getDefaultConfigFull();
    Object.assign(config.typography, def.typography);
    Object.assign(config.pageLayout, def.pageLayout);
    message.info("已恢复默认设置");
}

const debouncedSave = debounce({ delay: 500 }, saveToPluginStorage);

watch(
    config,
    () => {
        debouncedSave();
    },
    { deep: true },
);

onMounted(() => {
    loadFromPluginStorage();
    loadFromLocalFile();
});
</script>

<style scoped></style>
