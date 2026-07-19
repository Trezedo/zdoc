import { computed, onMounted, ref } from "vue";

import { getBrowserFonts, getWpsFonts } from "@/utils/fonts";

const DEFAULT_CHINESE_FONTS = ["宋体", "仿宋", "黑体", "楷体"];
const DEFAULT_WESTERN_FONTS = ["Times New Roman", "Nimbus Roman"];

export function useFonts(options: { loadWestern?: boolean } = {}) {
    const chineseFonts = ref<string[]>([]);
    const westernFonts = ref<string[]>([]);
    const isLoading = ref(true);

    const chineseFontOptions = computed(() =>
        chineseFonts.value.map((font) => ({ label: font, value: font })),
    );

    const westernFontOptions = computed(() =>
        westernFonts.value.map((font) => ({ label: font, value: font })),
    );

    async function loadFonts() {
        isLoading.value = true;
        try {
            const [wpsChinese, wpsWestern] = getWpsFonts();
            if (wpsChinese?.length) {
                chineseFonts.value = wpsChinese;
                if (options.loadWestern && wpsWestern?.length) {
                    westernFonts.value = wpsWestern;
                }
            } else {
                const [chn, west] = await getBrowserFonts();
                chineseFonts.value = chn || DEFAULT_CHINESE_FONTS;
                if (options.loadWestern) {
                    westernFonts.value = west || DEFAULT_WESTERN_FONTS;
                }
            }
        } catch {
            chineseFonts.value = DEFAULT_CHINESE_FONTS;
            if (options.loadWestern) {
                westernFonts.value = DEFAULT_WESTERN_FONTS;
            }
        } finally {
            isLoading.value = false;
        }
    }

    onMounted(loadFonts);

    return {
        chineseFonts,
        westernFonts,
        chineseFontOptions,
        westernFontOptions,
        isLoading,
        loadFonts,
    };
}
