declare module "*.vue" {
    import type { DefineComponent } from "vue";
    const component: DefineComponent<{}, {}, any>;
    export default component;
}

// 添加字体查询的类型
export {};
declare global {
    interface Window {
        queryLocalFonts(options?: QueryOptions): Promise<FontData[]>;
    }

    interface QueryOptions {
        postscriptNames?: string[];
    }

    interface FontData {
        family: string;
        fullName: string;
        postscriptName: string;
        style: string;
        blob(): Promise<Blob>;
    }
}
