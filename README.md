# ZDoc - WPS 加载项

基于 Vue 3 + TypeScript + Vite 构建的 WPS 文字插件，核心功能是**一键公文排版**（符合《党政机关公文格式》GB/T 9704‑2012），并提供页面布局、图片处理、快捷样式、邮件合并等实用工具。通过自定义 CustomUI 选项卡集成到 WPS。

## ✨ 特性

- 📜 **一键排版**：自动设置页边距、页眉页脚、文档网格，应用标准的正文、标题样式，智能识别小标题（段旨句）
- 📄 **页面布局**：快速设置页边距（上 3.7cm / 下 3.5cm / 左 2.8cm / 右 2.6cm）、页眉页脚距离
- 🖼️ **图片处理**：批量修改嵌入型图片尺寸、排版居中、压缩及导出
- ⌨️ **快捷样式**：快速切换字体（二号小标宋/三号黑体/楷体/仿宋/西文罗马体）、固定行距、清除格式、删除非内置样式、清除底纹背景
- 🔢 **编号转换**：动态自动编号与静态文本互转（含一/二级标题序号转动态编号）
- 🧾 **页眉页脚**：可视化配置页眉内容/字体/位置，页脚支持页码（外侧/居中/内侧）、奇偶页设置
- 🔍 **文本对比**：基于 `diff-match-patch-es`，支持效率/字符两种对比模式及差异精度调节
- 📧 **邮件合并**：查看数据源信息并复制路径，一键更新所有域
- 🧹 **辅助清理**：清除空段落、空格与缩进互转、正则替换、标点全半角转换
- 🧩 **自定义 CustomUI**：通过 `src/jsa/ribbon/xmlConfig.ts` 与 `vite-plugin-wps-enhance` 插件生成 Ribbon 选项卡
- 🎨 **现代化 UI**：Tailwind CSS 3 + Naive UI 组件化视图，任务窗格交互
- ⚡ **条件引导启动**：弹窗与主应用按需加载，二次打开秒开（详见 [wiki](./wiki.md)）

## 🛠️ 技术栈

- **前端框架**：Vue 3 (Composition API)
- **语言**：TypeScript
- **构建工具**：Vite（基于 Rolldown）
- **WPS 集成**：JS 加载项 API + 自定义 Ribbon
- **样式**：Tailwind CSS 3
- **UI 组件库**：Naive UI（按需自动导入）
- **路由**：Vue Router（基于文件的路由，由 `unplugin-vue-router` 自动生成）
- **状态管理**：`@vueuse/core` 的 `useLocalStorage`（无 Pinia）
- **包管理**：pnpm (workspace)
- **工具库**：radash、@vueuse/core、axios、zod（配置校验）、diff-match-patch-es（文本对比）、chinese-number-format（序号转中文）
- **代码质量**：Prettier + lefthook Git 钩子
- **测试**：Vitest

## 🚀 快速开始

### 环境要求

- Node.js ≥ 24（推荐 LTS）
- pnpm ≥ 11
- WPS Office (需支持 JS 加载项)

### 安装依赖

```bash
# 全局安装 WPS JS 加载项官方工具
npm i -g wpsjs
# 安装项目依赖
pnpm install
```

### 开发模式

```bash
# 安装依赖
pnpm install

# 使用 wpsjs（自动打开 WPS）
wpsjs debug
```

启动后 Vite 会在 `http://localhost:3889` 提供服务，并支持热更新。注意：WPS 加载项的 Ribbon UI 不支持热更新，需要重启进程。

### 构建生产版本

```bash
pnpm build            # 前端构建
pnpm build:zip        # 构建打包为 7z 格式
pnpm build:exe        # Windows 建议使用该方式，生成 exe 安装包
```

- 前端构建输出目录：`dist/`
- 加载项输出目录：`wps-addon-build/`

### 其他常用命令

```bash
pnpm dev              # 仅启动 Vite 开发服务器（不打开 WPS）
pnpm preview          # 预览生产构建
pnpm fmt              # 使用 Prettier 格式化代码
pnpm typecheck        # TypeScript 类型检查
pnpm test             # 运行单元测试
```

### 安装到 WPS

1. **快速安装**：运行 `wps-addon-build/zdoc.exe`（Windows）即可自动安装。
2. **手动安装**：将 `wps-addon-build/` 下的 `zdoc.7z` 解压到 WPS 加载项目录（通常为 `%APPDATA%\kingsoft\wps\jsaddons\`）。
3. 重启 WPS，在“组件”选项卡中找到“ZDoc”。

银河麒麟系统安装/更新 zdoc 加载项脚本：

```sh
#!/bin/bash

set -e  # 遇到错误立即退出

# 颜色定义
if [ -t 1 ] && [ -t 2 ]; then
    # 交互式终端，启用颜色
    GREEN='\033[0;32m'
    RED='\033[0;31m'
    YELLOW='\033[0;33m'
    NC='\033[0m' # No Color
else
    GREEN=''
    RED=''
    YELLOW=''
    NC=''
fi

# 彩色输出函数
echo_info()  { echo -e "${GREEN}[INFO]${NC} $1"; }
echo_error() { echo -e "${RED}[ERROR]${NC} $1" >&2; }
echo_warn()  { echo -e "${YELLOW}[WARN]${NC} $1"; }

addonPath="$HOME/.local/share/Kingsoft/wps/jsaddons"
xmlFile="$addonPath/jsplugins.xml"

mkdir -p "$addonPath" # 确保目标目录存在

echo_info "正在查找包含 'zdoc' 的最新 .7z 压缩包..."
zdocFile=$(find . -maxdepth 1 -type f -name "*zdoc*.7z" -printf "%T@ %p\n" 2>/dev/null | sort -n | tail -1 | cut -d' ' -f2-)
if [ -z "$zdocFile" ]; then
    echo_error "当前目录下未找到包含 'zdoc' 的 .7z 文件"
    read -p "按回车键退出..."
    exit 1
fi
echo_info "找到文件：$zdocFile"

# 处理备份、删除旧文件、解压缩之前检测
if ! command -v 7z &> /dev/null; then
    echo "错误：未找到 7z 命令，请先安装：sudo apt install p7zip-full"
    exit 1
fi

# 备份并处理 jsplugins.xml
if [ -f "$xmlFile" ]; then
    cp "$xmlFile" "$xmlFile.bak"
    echo_info "已备份 $xmlFile 到 $xmlFile.bak"
fi

# 移除旧版本（如果存在）
if grep -q 'name="zdoc"' "$xmlFile" 2>/dev/null; then
    # 提取旧 URL 中的路径
    oldUrl=$(grep 'name="zdoc"' "$xmlFile" | sed -n 's/.*url="\([^"]*\)".*/\1/p')
    if [ -n "$oldUrl" ]; then
        oldPath="${oldUrl#file://}"   # 去掉 file:// 前缀
        if [ -d "$oldPath" ]; then
            echo_warn "删除旧版本目录：$oldPath"
            rm -rf "$oldPath"
        fi
    fi
    # 删除 XML 中的旧条目
    sed -i '/name="zdoc"/d' "$xmlFile"
    echo_info "已从 XML 中移除旧 zdoc 条目"
fi

echo_info "正在解压 $zdocFile 到 $addonPath ..."
if ! 7z x "$zdocFile" -aoa -o"$addonPath" >/dev/null 2>&1; then
    echo_error "解压失败，请检查文件是否损坏"
    read -p "按回车键退出..."
    exit 1
fi
echo_info "解压成功"

# 获取解压后的文件夹名
newFolder=$(find "$addonPath" -maxdepth 1 -type d -name "zdoc_*" | head -1)
if [ -z "$newFolder" ]; then
    echo_error "解压后未找到 zdoc_* 文件夹"
    read -p "按回车键退出..."
    exit 1
fi
folderName=$(basename "$newFolder")
echo_info "新文件夹：$folderName"

# 提取版本号
version="${folderName#zdoc_}"
if [ -z "$version" ]; then
    echo_error "无法从文件夹名提取版本号：$folderName"
    read -p "按回车键退出..."
    exit 1
fi

# 构建新的 URL（末尾带斜杠）
newUrl="file://$addonPath/$folderName/"

# 若 XML 文件不存在则创建基本结构
if [ ! -f "$xmlFile" ]; then
    echo '<jsplugins>' > "$xmlFile"
    echo '</jsplugins>' >> "$xmlFile"
fi

# 在 </jsplugins> 前插入新条目
sed -i "/<\/jsplugins>/i \  <jsplugin name=\"zdoc\" type=\"wps\" url=\"$newUrl\" version=\"$version\" />" "$xmlFile"
echo_info "已添加/更新 zdoc 插件，版本 $version"

echo_info "正在打开目录：$addonPath"
peony "$addonPath" > /dev/null 2>&1 &

echo_info "全部完成！"

read -p "按回车键退出..."
```

## 📁 目录结构（核心部分）

```text
.
├── public/                         # 静态资源
│   ├── manifest.xml                # 加载项清单（必需）
│   ├── ribbon.xml                  # 功能区定义（构建时由插件生成）
│   └── images/                     # 图标资源
├── src/
│   ├── components/                 # 公共 Vue 组件
│   │   ├── dialogs/                # 弹窗组件（按需加载，详见 wiki）
│   │   ├── FooterSettings.vue      # 页脚配置组件
│   │   ├── HeaderSettings.vue      # 页眉配置组件
│   │   ├── PageSettings.vue        # 页面设置组件
│   │   ├── TextDiff.vue            # 文本差异渲染组件
│   │   └── TypographySettings.vue  # 字体/段落设置组件
│   ├── composables/                # 组合式函数
│   │   └── useFonts.ts             # 字体列表
│   ├── config/                     # 配置文件（排版预设等）
│   │   ├── defaults.ts             # 默认排版配置（国标）
│   │   └── validator.ts            # 基于 zod 的配置校验
│   ├── directives/                 # 自定义指令（如滚轮调整数值）
│   ├── jsa/                        # WPS JS API 相关
│   │   ├── commands/               # 业务命令（与 WPS API 交互）
│   │   │   ├── document.ts         # 页面设置、样式清理、附件对齐等
│   │   │   ├── field.ts            # 域操作、编号转换
│   │   │   ├── govDoc.ts           # 公文排版核心（标题/正文/小标题识别）
│   │   │   ├── image.ts            # 图片批量处理（尺寸/导出/压缩）
│   │   │   ├── mergeMail.ts        # 邮件合并辅助
│   │   │   ├── batchTypo.ts        # 批量排版多文档
│   │   │   ├── header.ts           # 页眉
│   │   │   ├── pagenum.ts          # 页脚页码
│   │   │   └── table.ts            # 表格格式化
│   │   ├── ribbon/                 # Ribbon 配置
│   │   │   ├── actions.ts          # 按钮回调
│   │   │   ├── taskPane.ts         # 任务窗格管理
│   │   │   └── xmlConfig.ts        # Ribbon XML DSL 配置
│   │   ├── types/                  # WPS 业务类型声明
│   │   └── utils/                  # 文档工具函数
│   │       ├── document.ts         # 撤销录制、文档操作辅助
│   │       ├── filesSystem.ts      # 配置文件读写
│   │       ├── storage.ts          # PluginStorage 封装
│   │       └── styles.ts           # 字体/字号批量设置
│   ├── router/                     # Vue Router 配置（合并自动路由）
│   ├── stores/                     # 状态管理（基于 useLocalStorage）
│   │   └── govDocConfig.ts         # 公文配置
│   ├── styles/                     # 全局样式
│   ├── utils/                      # 通用工具函数
│   │   ├── fonts.ts                # 字体常量
│   │   ├── router.ts               # 路由 URL 辅助
│   │   ├── typo.ts                 # 排版工具
│   │   ├── globalErrorHandler.ts   # 全局错误处理
│   ├── views/                      # 任务窗格视图（文件路由自动生成）
│   │   ├── index.vue               # 首页（全部页面入口）
│   │   ├── settings.vue            # 公文设置窗格（页面 + 字体）
│   │   ├── header-footer.vue       # 页眉页脚设置窗格
│   │   ├── image-resize.vue        # 图片尺寸调整窗格
│   │   ├── batch-typo.vue          # 批量排版窗格
│   │   └── text-compare.vue        # 文本对比窗格
│   ├── App.vue                     # 根组件（注入 Naive UI 上下文）
│   ├── main.ts                     # 入口文件（条件引导启动，详见 wiki）
│   └── shims-vue.d.ts              # Vue 类型声明
├── plugins/                        # 自定义 Vite 插件
│   └── vite-plugin-wps-enhance/    # WPS 增强：ribbon.xml 生成 + 枚举注入
├── package.json
├── vite.config.ts
└── tailwind.config.js
```

> 完整目录结构请参考项目源码。

## 📦 主要功能模块

### 命令层 (`src/jsa/commands/`)

| 文件           | 提供的函数                                                                     |
| -------------- | ------------------------------------------------------------------------------ |
| `document.ts`  | `setPageLayout`、`deleteNonBuiltInStyles`、`formatAttachments` 等              |
| `image.ts`     | `batchResizeImages`、`formatInlineImages`、`compressImages`、`exportAllImages` |
| `mergeMail.ts` | `getMailMergeSourcePath`、`viewMailSourceInfo`、`copyText`                     |
| `govDoc.ts`    | 公文排版核心逻辑：`quickFormat`、`setupBodyStyle`、`setupTitleStyle` 等        |
| `field.ts`     | `convertNumberingToStatic`（动态编号转静态）                                   |
| `batchTypo.ts` | `formatSingleDoc`、`batchFormatDocs`（批量排版多文档）                         |
| `header.ts`    | `setHeader`、`removeAllHeaders`                                                |
| `pagenum.ts`   | `addFooterPagenum`、`removePagenum`、`hasPagenum`                              |
| `table.ts`     | `formatTables`                                                                 |

### 任务窗格视图 (`src/views/`)

- **`index.vue`**：首页（列出全部页面入口，加载项中无实际用途，仅用于普通浏览器）
- **`settings.vue`**：公文设置（页面布局 + 字体/段落参数，可载入/保存配置）
- **`header-footer.vue`**：页眉页脚设置（页眉内容/字体/位置、页脚页码、奇偶页）
- **`image-resize.vue`**：批量设置图片宽度/高度，支持锁定比例
- **`batch-typo.vue`**：拖拽多文档批量排版
- **`text-compare.vue`**：文本对比（效率/字符两种模式，可调精度）

### 弹窗组件 (`src/components/dialogs/`)

- **`quick-style.vue`**：快捷样式弹窗（通过 `?dialog=quick-style` 极速加载）

### 工具函数 (`src/utils/` 与 `src/jsa/utils/`)

- **`src/utils/`**：`fonts.ts`（字体常量）、`router.ts`（路由 URL 辅助）、`typo.ts`（排版工具）、`globalErrorHandler.ts`（全局错误处理）
- **`src/jsa/utils/`**：`document.ts`（`withUndoRecord` 撤销录制）、`filesSystem.ts`（配置读写）、`storage.ts`（`PluginStorage` 封装）、`styles.ts`（字体/字号批量设置）

### Ribbon 配置 (`src/jsa/ribbon/`)

- **`xmlConfig.ts`**：Ribbon XML DSL 配置（构建时由 `vite-plugin-wps-enhance` 渲染为 `public/ribbon.xml`）
- **`actions.ts`**：按钮回调（`onAction`、`getImage`、`onGetLabel`、`onGetEnabled`）
- **`taskPane.ts`**：任务窗格创建/切换/隐藏（单例缓存 + 互斥显示）

## ⚙️ 配置说明

### 公文排版默认值（符合国标）

| 元素        | 默认值          | 说明                           |
| ----------- | --------------- | ------------------------------ |
| 标题字体    | 方正小标宋\_GBK | 公文标题（居中、无缩进）       |
| 正文字体    | 仿宋\_GB2312    | 中文三号；西文 Times New Roman |
| 标题字号    | 二号 (22pt)     |                                |
| 正文字号    | 三号 (16pt)     |                                |
| 正文行距    | 固定 28.95pt    | 三号字对应行距                 |
| 首行缩进    | 2 字符          | 即两个中文字符                 |
| 一级标题 H1 | 黑体            | 不加粗                         |
| 二级标题 H2 | 楷体\_GB2312    | 不加粗                         |
| 三级标题 H3 | 仿宋\_GB2312    | 加粗                           |
| 抬头/称谓   | 楷体\_GB2312    | 顶格（无缩进，由代码控制）     |
| 小标题加粗  | 前缀加粗        | 可选“整句/前缀/不加粗”         |

### 页面布局默认值

|   参数   | 默认值 | 说明                   |
| :------: | :----: | ---------------------- |
|  上边距  |  37mm  | 纸张上边缘到正文上边缘 |
|  下边距  |  35mm  | 纸张下边缘到正文下边缘 |
|  左边距  |  28mm  | 纸张左边缘到正文左边缘 |
|  右边距  |  26mm  | 纸张右边缘到正文右边缘 |
| 页眉距离 |  15mm  | 纸张顶端到页眉下边缘   |
| 页脚距离 |  24mm  | 纸张底端到页脚下边缘   |

### 页眉/页脚默认值

|   参数   | 默认值 | 说明                 |
| :------: | :----: | -------------------- |
| 页眉字体 |  黑体  | 三号（16pt）         |
| 页眉位置 | 左对齐 | 可选左/中/右         |
| 页眉内容 |   空   | 由用户填写           |
| 页脚字体 |  宋体  | 四号（14pt）         |
| 页脚页码 |  外侧  | 可选左/中/右/内/外侧 |

以上数值可在“公文设置”与“页眉页脚”任务窗格中自定义。

## 🧩 自定义 Ribbon

JS 加载项通过 `ribbon.xml` 渲染功能区选项卡和按钮，配置在 `src/jsa/ribbon/xmlConfig.ts` 中以 DSL 方式定义。

由 `vite-plugin-wps-enhance` 在构建时生成 `public/ribbon.xml`。

按钮的回调在 `src/jsa/ribbon/actions.ts` 中实现，并通过 `setupRibbonBindings()` 挂载到 `window`。

## ⚠️ 注意事项

1. **WPS API 环境**：代码中使用了 `Application`、`wps.Enum` 等全局对象，这些仅在 WPS 运行时（或按 F12 打开的调试浏览器中）可用，在普通浏览器中无法调试。
2. **跨平台兼容**：当前在 Windows、银河麒麟 V10 均已测试可用，Mac 版未测试。
3. **安全策略**：加载项需在受信任后才能运行，开发调试时不需要。
4. **开发期 Ribbon 卡顿**：`dev` 模式下首次点击自定义选项卡可能短暂卡顿 2~3 秒（生产构建无此问题），详见 [wiki](./wiki.md)。

## 🧑‍💻 开发指南

请参考 [WPS JS 加载项官方文档](https://open.wps.cn/documents/app-integration-dev/wps365/client/wpsoffice/jsapi/addin-api/wps-addin-availability)

更多开发事项（条件引导启动模式、弹窗秒开原理、已知问题与规避方案等）见 [wiki.md](./wiki.md)。

### 添加新的 Ribbon 按钮

1. 在 `src/jsa/ribbon/xmlConfig.ts` 中使用 `RibbonBuilder` DSL 定义按钮。
2. 在 `src/jsa/ribbon/actions.ts` 的 `actionHandlers` 中注册与按钮 `id` 同名的回调。
3. 在 `src/jsa/commands/` 下实现具体 WPS 命令。

### 添加新的任务窗格

1. 在 `src/views/` 下创建 Vue 组件，路由会自动生成 TypeScript 类型提示到 `typed-router.d.ts`，例如 `my-pane.vue`，并注册路径 `/my-pane` 与之对应，参见 [基于文件的路由 - Vue Router](https://router.vuejs.org/zh/file-based-routing/)。
2. 在 `src/jsa/utils/storage.ts` 的 `STORAGE_KEYS` 中新增一个存储键常量。
3. 在 `src/jsa/ribbon/taskPane.ts` 的 `ROUTE_MAP` 中注册该键到对应的路由路径。
4. 在 `src/jsa/ribbon/actions.ts` 中调用 `toggleTaskPane(STORAGE_KEYS.YOUR_KEY)` 来显示/隐藏窗格。

```ts
// taskPane.ts 内部已封装为单例缓存 + 互斥显示
export function showTaskPane(key: string): void;
export function toggleTaskPane(key: string): void;
```

### 添加新的命令

在 `src/jsa/commands/` 下新建文件，并导出函数。

## 🐞 已知问题

### WPS 类型定义不全的修复

项目早期遇到 WPS JS API 中部分类型缺失的问题：

1. `Application.Enum`、`Application.NewEnum` 等属性在官方类型声明中未定义，但实际可用；
2. `msoTrue`、`wdAlignParagraphCenter` 等在 JS 宏编辑器中可直接使用的常量未定义。

已通过插件生成的 `src/wps-env.d.ts` 对全局对象进行类型扩充。
但由于从扩展后的 WpsNewEnum 扁平化的类型实在太多（6120+），实测已经严重影响性能，类型提示非常慢，建议直接使用裸名枚举，故仅定义为 Record：

```ts
declare namespace Wps {
    interface Application {
        Enum: Record<string, number>;
    }
}
```

### Tailwind CSS v4 兼容性

当前项目使用的 Tailwind CSS 为 **v3** 版本。经过测试，按照官网指引升级到 v4 后，CSS 样式无法正常加载。因此请继续使用 v3 版本，暂不建议升级。

## 📄 许可

本项目目前处于**持续开发完善阶段**，代码、功能及 API 均可能发生较大变动。

- **非商业用途**：在遵守项目文档说明的前提下，允许个人学习、研究及内部使用。
- **商业用途**：**未经明确书面授权，禁止用于任何商业目的**（包括但不限于集成到商业软件、提供收费服务、作为产品的一部分等）。
- **授权方式**：如需商业使用或获取正式授权，请联系项目维护者进行协商。

感谢您的理解与支持。

## 🤝 贡献

欢迎提交 Issue 或 Pull Request！

### 🐛 报告问题

- 在 [Issues](https://github.com/zedo/zdoc/issues) 页面搜索是否已有类似问题。
- 提供清晰的**复现步骤**、**WPS 版本**（如 2023 春季版 12.1.0.xxxx）、**操作系统**（Windows 10/银河麒麟）以及相关截图或错误信息。
