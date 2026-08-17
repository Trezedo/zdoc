<template>
    <div class="flex flex-col h-screen bg-gray-50">
        <n-scrollbar class="flex-1 min-h-0">
            <div class="p-4">
                <div class="mb-6 text-center">
                    <h1 class="text-xl font-semibold text-gray-800">页眉页脚设置</h1>
                </div>

                <div class="card-base p-4 flex flex-wrap gap-2 mb-4">
                    <div class="flex items-center justify-between gap-2 flex-1">
                        <label class="text-sm font-medium text-gray-700 whitespace-nowrap">
                            页眉距离
                        </label>
                        <div class="flex flex-1 items-center gap-1">
                            <n-input-number
                                v-model:value="header.distance"
                                :min="0"
                                :step="0.1"
                                size="medium"
                                class="flex-1"
                                v-wheel-change
                            />
                            <span class="text-sm text-gray-400">cm</span>
                        </div>
                    </div>

                    <div class="flex items-center justify-between gap-2 flex-1">
                        <label class="text-sm font-medium text-gray-700 whitespace-nowrap">
                            页脚距离
                        </label>
                        <div class="flex flex-1 items-center gap-1">
                            <n-input-number
                                v-model:value="footer.distance"
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

                <n-collapse
                    :default-expanded-names="['header', 'footer']"
                    :accordion="false"
                    class="collapse-panel"
                    :trigger-areas="['main', 'arrow']"
                >
                    <n-collapse-item name="header">
                        <template #header>
                            <img
                                src="/images/header.svg"
                                alt="页眉设置"
                                class="w-4 h-4 inline-block mr-1"
                            />
                            <span>页眉设置</span>
                        </template>
                        <template #header-extra>
                            <div class="flex gap-2">
                                <n-button size="small" round type="info" @click="applyHeader">
                                    应用
                                </n-button>
                                <n-button size="small" round type="warning" @click="removeHeader">
                                    删除
                                </n-button>
                                <n-button size="small" round @click="resetDefaultHeader">
                                    重置
                                </n-button>
                            </div>
                        </template>

                        <!-- 传入 store 中的 header 配置 -->
                        <HeaderSettings v-model="header" />
                    </n-collapse-item>

                    <n-collapse-item name="footer">
                        <template #header>
                            <img
                                src="/images/footer.svg"
                                alt="页脚设置"
                                class="w-4 h-4 inline-block mr-1"
                            />
                            <span>页脚设置</span>
                        </template>
                        <template #header-extra>
                            <div class="flex gap-2">
                                <n-button size="small" round type="info" @click="applyFooter">
                                    应用
                                </n-button>
                                <n-button size="small" round type="warning" @click="removeFooter">
                                    删除
                                </n-button>
                                <n-button size="small" round @click="resetDefaultFooter">
                                    重置
                                </n-button>
                            </div>
                        </template>

                        <FooterSettings v-model="footer" />

                        <!-- 状态提示 -->
                        <n-alert v-if="hasPageNum" type="info" size="small" class="mt-4">
                            当前文档已设置页脚页码
                        </n-alert>
                        <n-alert v-else type="warning" size="small" class="mt-4">
                            当前文档未检测到页码
                        </n-alert>
                    </n-collapse-item>
                </n-collapse>
            </div>
        </n-scrollbar>

        <div
            class="flex flex-wrap items-center justify-around p-5 border-t border-gray-200 bg-white"
        >
            <n-button @click="importConfig">载入配置</n-button>
            <n-button @click="saveConfig">保存配置</n-button>
        </div>
    </div>
</template>

<script setup lang="ts">
import FooterSettings from "@/components/FooterSettings.vue";
import HeaderSettings from "@/components/HeaderSettings.vue";
import { DEFAULT_FOOTER_CONFIG, DEFAULT_HEADER_CONFIG } from "@/config/defaults";
import { removeAllHeaders, setHeader } from "@/jsa/commands/header";
import { addFooterPagenum, hasPagenum, removePagenum } from "@/jsa/commands/pagenum";
import { refreshDocumentView } from "@/jsa/utils/document";
import { useGovDocConfig } from "@/stores/govDocConfig";

const message = useMessage();
const notification = useNotification();

const config = useGovDocConfig();
const { header, footer } = config;

const hasPageNum = ref(false);

function checkPageNum() {
    try {
        hasPageNum.value = hasPagenum();
    } catch {
        hasPageNum.value = false;
    }
}

// ---- 页眉操作 ----
function applyHeader() {
    const { content, position, font, fontSize, distance } = header.value;
    setHeader(content, position, font, fontSize, distance);
    refreshDocumentView();
    message.info("已修改页眉");
}

function removeHeader() {
    removeAllHeaders();
    refreshDocumentView();
    message.info("已移除页眉");
}

function resetDefaultHeader() {
    header.value = { ...DEFAULT_HEADER_CONFIG };
    message.info("页眉配置已恢复默认");
}

// ---- 页脚操作 ----
function applyFooter() {
    try {
        addFooterPagenum(footer.value);
        checkPageNum();
        message.success("页码已插入/更新");
    } catch (e) {
        console.warn(e);
        message.error("插入页码失败，请确认处于 WPS 环境中");
    }
}

function removeFooter() {
    try {
        removePagenum();
        checkPageNum();
        message.success("所有页码已删除");
        refreshDocumentView();
    } catch (e) {
        console.warn(e);
        message.error("删除页码失败");
    }
}

function resetDefaultFooter() {
    footer.value = { ...DEFAULT_FOOTER_CONFIG };
    message.info("页脚配置已恢复默认");
}

function saveConfig() {
    const result = config.saveToFile();
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
    config.loadFromFile();
    message.success("已从配置文件重新载入");
}

onMounted(() => {
    checkPageNum();
});
</script>

<style scoped></style>
