<template>
    <div class="flex flex-col h-screen bg-gray-50">
        <n-scrollbar class="flex-1 min-h-0">
            <div class="p-5">
                <div class="mb-6 text-center">
                    <h1 class="text-xl font-semibold text-gray-800">文本对比工具</h1>
                </div>

                <n-collapse :default-expanded-names="['input', 'config']" :accordion="false">
                    <!-- 配置面板：grid 两列均分，窄屏自动折叠 -->
                    <n-collapse-item name="config" title="⚙️ 对比配置">
                        <div class="grid grid-cols-1 min-[400px]:grid-cols-2 gap-4 items-start">
                            <div>
                                <label class="block text-sm font-medium text-gray-600 mb-1">
                                    对比模式
                                </label>
                                <n-select v-model:value="cleanupMode" :options="cleanupOptions" />
                            </div>
                            <div v-if="cleanupMode === 'efficiency'">
                                <label class="block text-sm font-medium text-gray-600 mb-1">
                                    差异精度
                                    <span class="text-xs text-gray-400 font-normal">
                                        （决定差异块长度）
                                    </span>
                                </label>

                                <n-input-number
                                    v-model:value="editCost"
                                    :min="1"
                                    :step="1"
                                    v-wheel-change="1"
                                    class="w-full"
                                />
                            </div>
                        </div>
                    </n-collapse-item>
                    <!-- 输入面板 -->
                    <n-collapse-item name="input" title="📝 输入文本">
                        <div class="flex flex-wrap gap-4">
                            <div class="flex-1 min-w-[200px]">
                                <label class="block font-medium mb-1.5 text-sm text-gray-700">
                                    旧文本
                                </label>
                                <n-input
                                    v-model:value="oldText"
                                    type="textarea"
                                    :autosize="{ minRows: 6, maxRows: 12 }"
                                    placeholder="请输入旧文本（原始版本）"
                                />
                            </div>
                            <div class="flex-1 min-w-[200px]">
                                <label class="block font-medium mb-1.5 text-sm text-gray-700">
                                    新文本
                                </label>
                                <n-input
                                    v-model:value="newText"
                                    type="textarea"
                                    :autosize="{ minRows: 6, maxRows: 12 }"
                                    placeholder="请输入新文本（修订版本）"
                                />
                            </div>
                        </div>
                    </n-collapse-item>
                </n-collapse>

                <!-- 对比结果 -->
                <div class="mt-4">
                    <TextDiff
                        :old-text="oldText"
                        :new-text="newText"
                        :cleanup-mode="cleanupMode"
                        :edit-cost="editCost"
                        @update:duration="onDurationUpdate"
                    />
                    <div v-if="duration > 0" class="text-right text-sm text-gray-500 mt-2 pr-2">
                        ⏱️ 对比耗时：{{ duration.toFixed(2) }} ms
                    </div>
                </div>
            </div>
        </n-scrollbar>

        <div class="flex flex-wrap gap-2 p-5 border-t border-gray-200 bg-white">
            <n-button size="small" class="flex-1" @click="loadExample">加载示例</n-button>
            <n-button size="small" type="primary" class="flex-1" @click="clearText">
                清空文本
            </n-button>
        </div>
    </div>
</template>

<script setup lang="ts">
import TextDiff from "@/components/TextDiff.vue";

const EXAMPLE_OLD = `会议指出，各相关部门应认真执行上级部署，确保各项工作任务落到实处。
会议强调，要加强组织领导，明确责任分工，密切协调配合，形成工作合力。
会议决定，对本次会议确定的重点工作任务实行台账管理，定期通报进展情况。`;

const EXAMPLE_NEW = `会议指出，各相关部门要切实提高政治站位，不折不扣落实上级部署，确保各项工作任务落地见效。
会议强调，要健全组织领导机制，细化责任分工，强化协调配合，增强工作合力。
会议决定，对本次会议确定的重点任务实行清单化管理、项目化推进，定期调度通报进展情况。`;

const oldText = ref("");
const newText = ref("");
const cleanupMode = ref<"efficiency" | "semantic" | "none">("efficiency");
const editCost = ref(4);
const duration = ref(0);

const cleanupOptions = [
    { label: "效率优化", value: "efficiency" },
    { label: "语义优化", value: "semantic" },
    { label: "原始输出", value: "none" },
];

const message = useMessage();

function loadExample() {
    oldText.value = EXAMPLE_OLD;
    newText.value = EXAMPLE_NEW;
    message.success("已加载示例");
}

function clearText() {
    oldText.value = "";
    newText.value = "";
    message.info("已清空文本");
}

function onDurationUpdate(ms: number) {
    duration.value = ms;
}
</script>

<style scoped></style>
