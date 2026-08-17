import pc from "picocolors";

const TAG = "[vite-plugin-wps-enhance]";

export const logger = {
    info: (msg: string) =>
        console.log(`${pc.gray(new Date().toLocaleTimeString())} ${pc.cyan(TAG)} ${pc.green(msg)}`),
    warn: (msg: string) =>
        console.warn(`${pc.gray(new Date().toLocaleTimeString())} ${pc.yellow(TAG)} ${msg}`),
    error: (msg: string, err?: unknown) =>
        console.error(`${pc.gray(new Date().toLocaleTimeString())} ${pc.red(TAG)} ${msg}`, err),
};
