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
                        <PageSettings v-model="config.pageLayout" ref="pageRef" />
                    </n-collapse-item>
                    <n-collapse-item name="typography" title="📝 字体设置">
                        <TypographySettings v-model="config.typography" ref="typographyRef" />
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
import { getDefaultTypoConfig } from "@/config/typography";
import { validateGovDocConfig } from "@/config/validator";
import { DEFAULT_PAGE_LAYOUT_CONFIG } from "@/jsa/commands/document";
import type { GovDocConfig } from "@/jsa/types";
import { loadConfigLocal } from "@/jsa/utils/document";
import { loadGovDocConfig, saveGovDocConfig } from "@/jsa/utils/storage";

const typographyRef = ref<InstanceType<typeof TypographySettings> | null>(null);
const pageRef = ref<InstanceType<typeof PageSettings> | null>(null);

const message = useMessage();
const notification = useNotification();

type LocalConfig = Omit<GovDocConfig, "pagenum">;
const config = reactive<LocalConfig>(getDefaultConfigFull());

function getDefaultConfigFull(): LocalConfig {
    return {
        typography: getDefaultTypoConfig(),
        pageLayout: { ...DEFAULT_PAGE_LAYOUT_CONFIG },
    };
}

function loadConfig() {
    const saved = loadGovDocConfig();
    if (saved) {
        const validated = validateGovDocConfig(saved);
        Object.assign(config.typography, validated.typography);
        Object.assign(config.pageLayout, validated.pageLayout);
        message.success("已从配置加载");
    } else {
        const content = loadConfigLocal();
        if (content === null) {
            message.warning("未找到本地配置文件，使用默认配置");
        } else {
            message.error("配置文件解析失败，请检查文件格式");
        }
    }
}

function saveConfig() {
    const result = saveGovDocConfig(config);
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
    loadConfig();
}

async function applyAll() {
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

onMounted(() => {
    loadConfig();
});
</script>

<style scoped></style>
