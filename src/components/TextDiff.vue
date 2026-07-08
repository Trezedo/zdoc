<template>
    <div
        class="bg-gray-50 border border-gray-200 rounded-lg p-4 min-h-[120px] font-sans leading-relaxed"
    >
        <div
            v-if="diffHtml"
            class="diff-result whitespace-pre-wrap break-words bg-white p-4 rounded-md border border-gray-200"
            v-html="diffHtml"
        ></div>
        <div v-else class="text-gray-400 text-center py-10">输入文本后自动显示差异</div>
    </div>
</template>

<script setup lang="ts">
import DiffMatchPatch from "diff-match-patch";

const props = defineProps<{
    oldText: string;
    newText: string;
    cleanupMode?: "semantic" | "efficiency" | "none";
    editCost?: number; // 仅当 cleanupMode === 'efficiency' 时有效
}>();

const emit = defineEmits<{
    (e: "update:duration", duration: number): void;
}>();

const diffHtml = ref<string>("");

function computeDiff() {
    if (!props.oldText && !props.newText) {
        diffHtml.value = "";
        emit("update:duration", 0);
        return;
    }

    const startTime = performance.now();

    const dmp = new DiffMatchPatch();
    let diffs = dmp.diff_main(props.oldText, props.newText);

    const mode = props.cleanupMode || "semantic";
    switch (mode) {
        case "semantic":
            dmp.diff_cleanupSemantic(diffs);
            break;
        case "efficiency":
            dmp.Diff_EditCost = props.editCost ?? 4;
            dmp.diff_cleanupEfficiency(diffs);
            break;
        case "none":
            break;
    }

    diffHtml.value = dmp.diff_prettyHtml(diffs);

    const endTime = performance.now();
    emit("update:duration", endTime - startTime);
}

watch(
    () => [props.oldText, props.newText, props.cleanupMode, props.editCost],
    () => computeDiff(),
    { immediate: true },
);

onMounted(computeDiff);
</script>

<style>
/* 全局样式，覆盖 diff_prettyHtml 生成的标签 */
.diff-result del {
    background-color: #fde8e8;
    color: #b91c1c;
    text-decoration: line-through;
    border-radius: 2px;
    padding: 0 2px;
}

.diff-result ins {
    background-color: #e6f7e6;
    color: #0b7e3d;
    text-decoration: none;
    border-radius: 2px;
    padding: 0 2px;
}
</style>
