import App from "@/App.vue";
import { setupGlobalEnum } from "@/jsa/global";
import { router } from "@/router/";
import "@/styles/main.css";

import { registerDirectives } from "./directives";
import { useGovDocConfigStore } from "./stores/govDocConfig";
import { setupGlobalErrorHandler } from "./utils/globalErrorHandler";

const app = createApp(App);
const pinia = createPinia();

app.use(router);
app.use(pinia);

registerDirectives(app);
setupGlobalErrorHandler(app);
setupGlobalEnum();

app.mount("#app");

// 在应用挂载后加载配置
const store = useGovDocConfigStore();
store.loadFromFile();
