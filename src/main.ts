import { createApp } from "vue";

import "@/styles/main.css";
import App from "@/App.vue";
import { router } from "@/router/";

import { registerDirectives } from "./directives";
import { setupGlobalErrorHandler } from "./utils/globalErrorHandler";
import { setupGlobalEnum } from "@/jsa/global";

const app = createApp(App);

app.use(router);

registerDirectives(app);
setupGlobalErrorHandler(app);
setupGlobalEnum();

app.mount("#app");
