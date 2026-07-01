import pc from "picocolors";

export const logger = {
    info: (msg: string) =>
        console.log(
            `${pc.gray(new Date().toLocaleTimeString())} ${pc.cyan("[vite-plugin-ribbon]")} ${pc.green(msg)}`,
        ),
    warn: (msg: string) =>
        console.warn(
            `${pc.gray(new Date().toLocaleTimeString())} ${pc.yellow("[vite-plugin-ribbon]")} ${msg}`,
        ),
    error: (msg: string, err?: unknown) =>
        console.error(
            `${pc.gray(new Date().toLocaleTimeString())} ${pc.red("[vite-plugin-ribbon]")} ${msg}`,
            err,
        ),
};
