import type { App } from "vue";
import { vWheelChange } from "./wheelChange";

export function registerDirectives(app: App) {
    app.directive("wheelChange", vWheelChange);
}
