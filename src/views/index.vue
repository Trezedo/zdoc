<template>
    <div class="max-w-[600px] mx-auto p-5">
        <h2 class="text-xl font-bold mb-4">全部页面</h2>
        <n-list>
            <n-list-item v-for="route in visibleRoutes" :key="route.path">
                <router-link
                    :to="route.path"
                    class="no-underline block text-inherit hover:bg-[#f0f0f0] transition-colors rounded px-3 py-2 -mx-3"
                >
                    <n-thing :title="String(route.name) || route.path" />
                </router-link>
            </n-list-item>
        </n-list>
    </div>
</template>

<script setup lang="ts">
const router = useRouter();

const visibleRoutes = computed(() => {
    return router.getRoutes().filter((route) => {
        if (route.redirect) return false;
        if (route.path.includes("*")) return false;
        if (route.path.includes(":")) return false;
        if (route.meta?.hidden) return false;
        return true;
    });
});
</script>

<style></style>
