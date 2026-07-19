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
                                v-model:value="headerConfig.distance"
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
                                v-model:value="footerConfig.distance"
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
                            <n-button size="small" round @click="resetDefaultHeader">
                                重置
                            </n-button>
                        </template>

                        <HeaderSettings v-model="headerConfig" />
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
                            <n-button size="small" round @click="resetDefaultFooter">
                                重置
                            </n-button>
                        </template>

                        <FooterSettings v-model="footerConfig" />

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
            class="flex flex-wrap items-center justify-between p-5 border-t border-gray-200 bg-white"
        >
            <div class="flex flex-wrap items-center gap-2">
                <n-button type="info" size="medium" @click="insertHeader">修改页眉</n-button>
                <n-button type="error" size="medium" @click="removeHeader">删除页眉</n-button>
            </div>
            <div class="flex flex-wrap items-center gap-2">
                <n-button type="success" size="medium" @click="insertFooter">设置页码</n-button>
                <n-button type="warning" size="medium" @click="removeFooterPagenum">
                    删除页码
                </n-button>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import FooterSettings from "@/components/FooterSettings.vue";
import { DEFAULT_HEADER_CONFIG, removeAllHeaders, setHeader } from "@/jsa/commands/header";
import {
    addFooterPagenum,
    DEFAULT_FOOTER_CONFIG,
    hasPagenum,
    removePagenum,
} from "@/jsa/commands/pagenum";
import type { FooterConfig, HeaderConfig } from "@/jsa/types";
import { refreshDocumentView } from "@/jsa/utils/document";

const message = useMessage();

// 注意必须展开,创建对象副本
const headerConfig = ref<HeaderConfig>({ ...DEFAULT_HEADER_CONFIG });

function insertHeader() {
    const { content, position, font, fontSize, distance } = headerConfig.value;
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
    headerConfig.value = { ...DEFAULT_HEADER_CONFIG };
    message.info("页眉配置已恢复默认");
}

// -------------------- 页脚 --------------------
const footerConfig = ref<FooterConfig>({ ...DEFAULT_FOOTER_CONFIG });

// 页码是否存在
const hasPageNum = ref(false);

// 检测页码状态
function checkPageNum() {
    try {
        hasPageNum.value = hasPagenum();
    } catch {
        hasPageNum.value = false;
    }
}

function insertFooter() {
    try {
        addFooterPagenum(footerConfig.value);
        checkPageNum();
        message.success("页码已插入/更新");
    } catch (e) {
        console.warn(e);
        message.error("插入页码失败，请确认处于 WPS 环境中");
    }
}

function removeFooterPagenum() {
    try {
        removePagenum(); // 使用默认主页脚
        checkPageNum();
        message.success("所有页码已删除");
        refreshDocumentView();
    } catch (e) {
        console.warn(e);
        message.error("删除页码失败");
    }
}

function resetDefaultFooter() {
    footerConfig.value = { ...DEFAULT_FOOTER_CONFIG };
    message.info("页脚配置已恢复默认");
}

onMounted(() => {
    checkPageNum();
});
</script>

<style scoped></style>
