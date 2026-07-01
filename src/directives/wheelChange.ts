import type { Directive, DirectiveBinding, VNode } from "vue";

declare module "vue" {
    export interface GlobalDirectives {
        vWheelChange: Directive<HTMLElement, number | undefined>;
    }
}

/**
 * 解析步长：支持 number 或 string（如 "0.1"），无效值返回默认值 defaultValue
 */
function parseStep(value: unknown, defaultValue = 1): number {
    if (typeof value === "number" && !isNaN(value)) {
        return Math.abs(value);
    }
    if (typeof value === "string") {
        const num = parseFloat(value);
        if (!isNaN(num)) return Math.abs(num);
    }
    return defaultValue;
}

/**
 * 根据步长和方向计算新值，处理浮点数精度
 */
function computeNewValue(current: number, direction: number, step: number): number {
    let newValue = current + direction * step;
    const stepStr = step.toString();
    const decimalPlaces = stepStr.includes(".") ? stepStr.split(".")[1].length : 0;
    if (decimalPlaces > 0) {
        newValue = parseFloat(newValue.toFixed(decimalPlaces));
    } else {
        newValue = Math.round(newValue);
    }
    return newValue;
}

/**
 * 创建滚轮事件处理器（闭包捕获 ctx，动态读取元素上的指令步长和 props）
 */
function createHandler(el: HTMLElement, ctx: any): (event: WheelEvent) => void {
    return (event: WheelEvent) => {
        event.preventDefault();
        event.stopPropagation();

        const props = ctx.props || {};

        // 1. 优先使用指令传入的步长（存储在 _directiveStep 中）
        let step: number;
        const directiveStep = (el as any)._directiveStep;
        if (directiveStep !== undefined) {
            step = parseStep(directiveStep);
        } else {
            // 2. 未传指令值时，使用 props.step，若无效则默认 1
            step = parseStep(props.step, 1);
        }

        // 读取边界和当前值
        let min = typeof props.min === "number" ? props.min : -Infinity;
        let max = typeof props.max === "number" ? props.max : Infinity;
        let current = props.value ?? props.modelValue;
        if (typeof current !== "number") {
            current = parseFloat(current) || 0;
        }

        const direction = event.deltaY > 0 ? -1 : 1;
        let newValue = computeNewValue(current, direction, step);

        if (newValue < min) newValue = min;
        if (newValue > max) newValue = max;

        ctx.emit("update:value", newValue);
        ctx.emit("update:modelValue", newValue);
        ctx.emit("change", newValue);
    };
}

/**
 * 自定义指令 v-wheel-change
 * 支持：
 *   - 无参数：使用组件 props.step
 *   - 有参数：使用指定步长（优先级高于 props.step）
 *
 * 用法：
 *   <n-input-number v-model:value="num" v-wheel-change :min="0" :max="10" :step="0.1" />
 *   <n-input-number v-model:value="num" v-wheel-change="0.5" :min="0" :max="10" />
 */
export const vWheelChange: Directive = {
    mounted(el: HTMLElement, binding: DirectiveBinding<number>, vnode: VNode) {
        const ctx = (vnode as any).ctx ?? (vnode.component as any)?.ctx;
        if (!ctx) {
            console.warn("[vWheelChange] 无法获取组件实例，指令将不起作用");
            return;
        }

        // 存储指令传入的步长（undefined 表示未传，使用 props.step）
        (el as any)._directiveStep = binding.value;

        const handler = createHandler(el, ctx);
        (el as any)._wheelHandler = handler;

        el.addEventListener("wheel", handler, { passive: false });
    },

    updated(el: HTMLElement, binding: DirectiveBinding) {
        // 指令值可能动态变化，更新存储的指令步长
        (el as any)._directiveStep = binding.value;
        // 注意：无需重建 handler，因为 handler 中每次都会读取 _directiveStep 和最新的 props.step
    },

    unmounted(el: HTMLElement) {
        const handler = (el as any)._wheelHandler;
        if (handler) {
            el.removeEventListener("wheel", handler);
            delete (el as any)._wheelHandler;
        }
        delete (el as any)._directiveStep;
    },
};
