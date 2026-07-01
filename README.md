# ZDoc - WPS 加载项

基于 Vue 3 + TypeScript + Vite 构建的 WPS 文字插件，核心功能是**一键公文排版**（符合《党政机关公文格式》GB/T 9704‑2012），并提供页面布局、图片处理、快捷样式、邮件合并等实用工具。通过自定义 CustomUI 选项卡集成到 WPS。

## ✨ 特性

- 📜 **一键公文排版**：自动设置页边距、页眉页脚、文档网格，应用标准的正文、标题样式，智能识别小标题（段旨句）
- 📄 **页面布局**：快速设置页边距（上 3.7cm / 下 3.5cm / 左 2.8cm / 右 2.6cm）、页眉页脚距离
- 🖼️ **图片处理**：批量修改嵌入型图片尺寸、排版居中、压缩及导出
- ⌨️ **快捷操作**：快速切换字体（二号小标宋/三号黑体/楷体/仿宋）、清除格式、删除非内置样式
- 🔢 **编号转换**：自动编号与静态文本互转
- 📧 **邮件合并**：获取数据源路径并复制到剪贴板
- 🧩 **自定义 CustomUI**：通过 `src/jsa/ribbon/xmlConfig.ts` 和 `vite-plugin-ribbon` 插件生成自定义选项卡
- 🎨 **现代化 UI**：Tailwind CSS + 组件化视图，支持任务窗格交互

## 🛠️ 技术栈

- **前端框架**：Vue 3 (Composition API)
- **语言**：TypeScript
- **构建工具**：Vite
- **WPS 集成**：JS 加载项 API + 自定义 Ribbon
- **样式**：Tailwind CSS 3
- **UI 组件库**：Naive UI
- **路由**：Vue Router
- **包管理**：pnpm (workspace)
- **工具库**：radash、@vueuse/core、axios
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
├── public/                     # 静态资源
│   ├── manifest.xml           # 加载项清单（必需）
│   ├── ribbon.xml             # 功能区定义
│   └── images/                # 图标资源
├── src/
│   ├── components/            # 公共 Vue 组件
│   ├── config/                # 配置文件（排版预设等）
│   ├── directives/            # 自定义指令
│   ├── jsa/                   # WPS JS API 相关
│   │   ├── commands/          # 业务命令（与 WPS API 交互）
│   │   │   ├── document.ts    # 页面设置、选区、样式清理等
│   │   │   ├── field.ts       # 域操作、编号转换
│   │   │   ├── govDoc.ts      # 公文排版核心
│   │   │   ├── image.ts       # 图片批量处理
│   │   │   ├── mergeMail.ts   # 邮件合并辅助
│   │   │   └── paragraphInfo.ts # 段落信息
│   │   ├── ribbon/            # Ribbon 配置
│   │   │   ├── actions.ts     # 按钮回调
│   │   │   ├── taskPane.ts    # 任务窗格管理
│   │   │   └── xmlConfig.ts   # Ribbon XML 配置
│   │   ├── utils/             # 文档工具函数
│   │   │   └── document.ts    # 文档操作辅助
│   │   └── global.ts          # 全局初始化
│   ├── router/                # Vue Router 配置
│   ├── styles/                # 全局样式
│   ├── types/                 # TypeScript 类型声明
│   ├── utils/                 # 通用工具函数（单位转换等）
│   ├── views/                 # 任务窗格视图
│   │   ├── index.vue          # 首页
│   │   ├── official.vue       # 公文排版配置窗格
│   │   ├── image-resize.vue   # 图片尺寸调整窗格
│   │   └── page-setup.vue     # 页面布局设置窗格
│   ├── App.vue                # 根组件
│   ├── main.ts                # 入口文件
│   └── shims-vue.d.ts         # Vue 类型声明
├── plugins/                   # 自定义 Vite 插件
│   └── vite-plugin-ribbon/    # 处理 ribbon.xml 注入
├── package.json
├── vite.config.ts
└── tailwind.config.js
```

> 完整目录结构请参考项目源码。

## 📦 主要功能模块

### 命令层 (`src/jsa/commands/`)

| 文件               | 提供的函数                                                                                  |
| ------------------ | ------------------------------------------------------------------------------------------- |
| `document.ts`      | `setPageLayout`、`getCurrentRange`、`deleteNonBuiltInStyles`、`convertNumberingToStatic` 等 |
| `image.ts`         | `batchResizeImages`、`formatInlineImages`、`compressImages`、`exportAllImages`              |
| `mergeMail.ts`     | `getMailMergeDataSourcePath`、复制数据源路径                                                |
| `govDoc.ts`        | 一键公文排版核心逻辑（`applyOfficialTyping`、`setDocumentGrid` 等）                         |
| `field.ts`         | 域操作、编号转换                                                                            |
| `paragraphInfo.ts` | 段落信息获取                                                                                |

### 任务窗格视图 (`src/views/`)

- **`official.vue`**：公文排版参数配置（字体、字号、行距、小标题加粗模式等）
- **`image-resize.vue`**：批量设置图片宽度/高度，支持锁定比例
- **`page-setup.vue`**：页面布局设置（边距、页眉页脚）
- **`index.vue`**：首页

### 工具函数 (`src/utils/`)

- **单位转换**：`cmToPoints`、`pointsToCm`
- **文档范围获取**：`getActiveRange`、`isSelectionEmpty`
- **字体操作**：批量设置中文字体、英文字体

### Ribbon 配置 (`src/jsa/ribbon/`)

- **`xmlConfig.ts`**：Ribbon XML 配置定义
- **`actions.ts`**：按钮回调函数
- **`taskPane.ts`**：任务窗格管理

## ⚙️ 配置说明

### 公文排版默认值（符合国标）

| 元素       | 默认值         | 说明                   |
| ---------- | -------------- | ---------------------- |
| 标题字体   | 方正小标宋简体 | 二级标题使用黑体       |
| 正文字体   | 仿宋\_GB2312   | 三号                   |
| 标题字号   | 二号 (22pt)    |                        |
| 正文字号   | 三号 (16pt)    |                        |
| 正文行距   | 固定 28.95pt   | 三号字对应行距         |
| 首行缩进   | 2 字符         | 即两个中文字符         |
| 小标题加粗 | 整句加粗       | 可选“整句/前缀/不加粗” |

### 页面布局默认值

|   参数   | 默认值 | 说明                   |
| :------: | :----: | ---------------------- |
|  上边距  |  37mm  | 纸张上边缘到正文上边缘 |
|  下边距  |  35mm  | 纸张下边缘到正文下边缘 |
|  左边距  |  28mm  | 纸张左边缘到正文左边缘 |
|  右边距  |  26mm  | 纸张右边缘到正文右边缘 |
| 页眉距离 |  15mm  | 纸张顶端到页眉下边缘   |
| 页脚距离 |  24mm  | 纸张底端到页脚下边缘   |

以上数值可在“排版设置”任务窗格中自定义。

## 🧩 自定义 Ribbon

JS 加载项通过 `ribbon.xml` 渲染功能区选项卡和按钮，配置在 `src/jsa/ribbon/xmlConfig.ts` 中定义。按钮的回调在 `src/jsa/ribbon/actions.ts` 中实现。

## ⚠️ 注意事项

1. **WPS API 环境**：代码中使用了 `Application`、`wps.Enum` 等全局对象，这些仅在 WPS 运行时（或按 F12 打开的调试浏览器中）可用，在普通浏览器中无法调试。
2. **跨平台兼容**：当前在 Windows、银河麒麟 V10 均已测试可用，Mac 版未测试。
3. **安全策略**：加载项需在受信任后才能运行，开发调试时不需要。

## 🧑‍💻 开发指南

请参考 [WPS JS 加载项官方文档](https://open.wps.cn/documents/app-integration-dev/wps365/client/wpsoffice/jsapi/addin-api/wps-addin-availability)

### 添加新的 Ribbon 按钮

1. 在 `src/jsa/ribbon/xmlConfig.ts` 中定义 CustomUI DSL。
2. 在 `src/jsa/ribbon/actions.ts` 中添加回调函数。
3. 在 `src/jsa/commands/` 下实现具体 WPS 命令。

### 添加新的任务窗格

1. 在 `src/views/` 下创建 Vue 组件，vue 路由会自动生成 typescript 类型提示到 `typed-router.d.ts`，例如 `my-pane.vue`，并注册路径 `/my-pane` 与之对应，参见 [基于文件的路由 - Vue Router](https://router.vuejs.org/zh/file-based-routing/)。
2. 在 `src/jsa/ribbon/taskPane.ts` 中通过函数注册并显示窗格：

```ts
function showTaskPane(storageKey: string, routePath: keyof RouteNamedMap);
```

### 添加新的命令

在 `src/jsa/commands/` 下新建文件，并导出函数。

## 🐞 已知问题

### WPS 类型定义不全的修复

项目早期遇到 WPS JS API 中部分类型缺失的问题：

1. `Application.Enum`、`Application.NewEnum` 等属性在官方类型声明中未定义，但实际可用
2. `msoTrue`、`wdAlignParagraphCenter` 等在 JS 宏编辑器中可直接使用的常量未定义。

已通过 `src/wps-env.d.ts` 对全局对象进行类型扩充，已完整解决。

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
