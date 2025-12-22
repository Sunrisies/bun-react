# Sunrise React 工具库 🛠️

一个现代化的多功能在线工具箱，基于 **React 19 + TypeScript + Vite + Bun** 构建。为开发者和普通用户提供一站式解决方案，涵盖文件处理、编码转换、网络工具、地理坐标、开发辅助等多个领域的实用工具。

[![React](https://img.shields.io/badge/React-19-61dafb.svg)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue.svg)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6.2-646cff.svg)](https://vitejs.dev/)
[![Bun](https://img.shields.io/badge/Bun-1.0-000000.svg)](https://bun.sh/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## ✨ 项目特色

- 🚀 **最新技术栈**：React 19 + Vite 6 + TypeScript 5.7 + Bun
- 🎨 **现代化UI**：Tailwind CSS 4 + shadcn/ui 组件库
- 📦 **模块化架构**：清晰的工具分类，易于扩展
- 🔍 **完整类型支持**：全项目 TypeScript 覆盖
- ⚡ **极致性能**：Vite 快速构建 + Bun 高性能运行时
- 🌐 **响应式设计**：完美适配桌面端和移动端
- 🛡️ **代码质量**：ESLint + Biome + Commitlint 保证规范

## 📚 功能概览

### 文件处理工具 📄

- **PDF合并** - 合并多个PDF文件为一个
- **PDF转Word** - 将PDF文件转换为Word文档
- **图片转PDF** - 合并多张图片为PDF文件
- **图片压缩工具** - 压缩图片文件，减小文件大小
- **视频转GIF** - 转换视频片段为GIF动图
- **图片转base64** - 将图片转换为base64编码
- **图片水印工具** - 给图片添加文字水印，支持批量处理
- **音频MD5计算** - 计算音频文件的MD5哈希值
- **文件上传** - 支持文件上传和预览
- **图片信息查看器** - 查看图片的EXIF信息和元数据
- **PDF合并** - 多个PDF文件合并
- **PDF转Word** - PDF文档转换
- **PDF转Word** - PDF文档转换

### 编码转换工具 🔤

- **JSON转TypeScript** - 将JSON对象转换为TypeScript接口定义
- **十六进制与字符串互转** - 支持十六进制与字符串之间的相互转换
- **颜色转换器** - 十六进制颜色与RGB颜色之间的相互转换
- **时间戳转换** - 支持时间戳与日期时间的相互转换
- **YAML/JSON转换** - 支持YAML和JSON格式之间的相互转换

### 网络工具 🌐

- **WebSocket客户端** - 提供WebSocket连接测试工具
- **HTTP状态码** - 查看和了解各种HTTP状态码的含义
- **HTTP请求头** - 查看和了解各种HTTP请求头的含义
- **端口工具** - 查看常用端口的用途和说明

### 坐标/地理工具 🗺️

- **经纬度距离计算** - 计算两个经纬度坐标之间的距离
- **坐标系转换** - WGS84坐标系与GCJ02坐标系之间的相互转换

### 开发辅助工具 💻

- **JSON格式化** - 格式化和美化JSON数据
- **CSS格式化** - 格式化和美化CSS代码
- **SCSS转CSS** - 将SCSS代码转换为CSS代码
- **JavaScript格式化** - 格式化和美化JavaScript代码
- **HTML转JS** - 将HTML代码转换为JavaScript字符串
- **ASCII码表** - 查看ASCII字符与编码的对应关系
- **二维码生成器** - 根据文本或URL生成二维码
- **文本对比工具** - 对比两段文本的差异，支持高亮显示

### 其他工具 🎯

- **签名生成器** - 生成个性化电子签名
- **浏览器标签** - 导入和管理浏览器标签数据

## 🛠️ 技术栈详情

### 核心框架

- **React 19** - 最新的React框架，提供强大的UI能力
- **TypeScript 5.7.2** - 强类型JavaScript，提供更好的开发体验
- **Vite 6.2.0** - 下一代前端构建工具，极速开发体验
- **Bun 1.0.x** - 超快速的JavaScript运行时

### 路由与状态管理

- **TanStack Router v1.114.4** - 类型安全的React路由库

### UI 组件库

- **Tailwind CSS 4.0.11** - 实用优先的CSS框架
- **shadcn/ui** - 基于Radix UI的高质量组件集合
- **Lucide React** - 精美的图标库

### 文件处理库

- **pdf-lib** - PDF文档处理
- **@ffmpeg/ffmpeg** - 视频和音频处理
- **jszip** - ZIP文件打包
- **html2canvas** - 页面截图
- **docx** - Word文档生成

### 工具库

- **qrcode** - 二维码生成
- **sonner** - 优雅的Toast提示
- **react-dropzone** - 文件拖拽上传
- **diff** - 文本差异对比
- **js-beautify** - 代码格式化
- **js-yaml** - YAML解析与序列化

### 开发工具

- **ESLint 9.21.0** - JavaScript/TypeScript代码检查
- **Biome 1.9.4** - 高性能代码格式化和检查工具
- **Commitlint** - Git提交信息规范
- **TypeScript ESLint** - TypeScript专用的ESLint规则

## 🚀 快速开始

### 环境要求

- Node.js >= 18
- Bun >= 1.0 (推荐)
- Git

### 安装依赖

```bash
# 克隆项目
git clone https://github.com/Sunrisies/bun-react.git
cd bun-react

# 使用 Bun 安装依赖 (推荐)
bun install

# 或者使用 npm
npm install

# 或者使用 yarn
yarn install

# 或者使用 pnpm
pnpm install
```

### 开发模式

```bash
# 使用 Bun
bun dev

# 使用 npm
npm run dev

# 使用 yarn
yarn dev

# 使用 pnpm
pnpm dev
```

应用将在 http://localhost:5173 启动

### 生产构建

```bash
# 使用 Bun
bun run build

# 使用 npm
npm run build

# 构建并检查类型
bun run build:tsc
```

### 预览构建结果

```bash
bun preview
```

### 代码检查与格式化

```bash
# ESLint 检查
bun lint

# Biome 格式化
bun biome format .
bun biome check .

# Git 提交规范
bun commit
```

## 📁 项目结构

```
bun-react/
├── public/                    # 静态资源
│   ├── favicon.svg           # 网站图标
│   └── workers/              # Web Worker 文件
│       └── gif.worker.js     # GIF处理Worker
├── src/                      # 源代码
│   ├── assets/               # 项目资源 (图片、字体等)
│   ├── components/           # 公共组件
│   │   ├── ui/               # shadcn/ui 组件
│   │   ├── mode-toggle.tsx   # 主题切换组件
│   │   └── sortable-item.tsx # 可排序组件
│   ├── hooks/                # 自定义Hook
│   │   └── useDynamicGrid.ts # 动态网格Hook
│   ├── lib/                  # 工具库
│   │   ├── utils.ts          # 通用工具函数
│   │   └── gif.worker.js     # GIF处理Worker
│   ├── pages/                # 页面组件
│   │   ├── index.tsx         # 首页/工具列表
│   │   ├── __root.tsx        # 根路由
│   │   ├── about.tsx         # 关于页面
│   │   ├── audioMd5.tsx      # 音频MD5计算
│   │   ├── base64Converter.tsx # Base64转换
│   │   ├── browserTabs.tsx   # 浏览器标签管理
│   │   ├── calculateDistance.lazy.tsx # 经纬度距离计算 (懒加载)
│   │   ├── colorConverter.tsx # 颜色转换器
│   │   ├── coordinate.lazy.tsx # 坐标系转换 (懒加载)
│   │   ├── cssFormatter.tsx  # CSS格式化
│   │   ├── fileUploader.tsx  # 文件上传
│   │   ├── hexStringConverter.tsx # 十六进制字符串转换
│   │   ├── htmlJsConverter.tsx # HTML转JS
│   │   ├── httpHeaders.tsx   # HTTP请求头大全
│   │   ├── httpStatus.tsx    # HTTP状态码
│   │   ├── imageCompressor.tsx # 图片压缩
│   │   ├── imageMetadata.tsx # 图片信息查看
│   │   ├── imageToPdf.tsx    # 图片转PDF
│   │   ├── jsFormatter.tsx   # JavaScript格式化
│   │   ├── jsonFormatter.tsx # JSON格式化
│   │   ├── jsonToTs.lazy.tsx # JSON转TypeScript (懒加载)
│   │   ├── musicPlayer.tsx   # 音乐播放器
│   │   ├── pdfMerger.tsx     # PDF合并
│   │   ├── pdfToWord.tsx     # PDF转Word
│   │   ├── portTable.tsx     # 端口工具
│   │   ├── qrGenerator.tsx   # 二维码生成器
│   │   ├── scssConverter.tsx # SCSS转CSS
│   │   ├── signature.lazy.tsx # 签名生成器 (懒加载)
│   │   ├── SpeechToText.tsx  # 语音转文字
│   │   ├── textDiff.tsx      # 文本对比
│   │   ├── timestampConverter.tsx # 时间戳转换
│   │   ├── videoToGif.tsx    # 视频转GIF
│   │   ├── watermark.tsx     # 图片水印
│   │   ├── websocketClient.tsx # WebSocket客户端
│   │   └── yamlJsonConverter.tsx # YAML/JSON转换
│   ├── plugins/              # 插件配置
│   │   └── router.tsx        # TanStack Router 配置
│   ├── App.css               # 应用样式
│   ├── index.css             # 全局样式
│   ├── main.tsx              # 应用入口
│   ├── routeTree.gen.ts      # 路由自动生成文件
│   └── vite-env.d.ts         # Vite类型声明
├── .commitlintrc.cjs         # Commitlint配置
├── .gitignore                # Git忽略文件
├── biome.json                # Biome配置
├── bun.lock / bun.lockb      # Bun锁文件
├── components.json           # shadcn/ui配置
├── eslint.config.js          # ESLint配置
├── package.json              # 项目依赖和脚本
├── README.md                 # 项目说明 (本文件)
├── tsconfig.json             # TypeScript配置
├── tsconfig.app.json         # TypeScript应用配置
├── tsconfig.node.json        # TypeScript节点配置
├── tsr.config.json           # TanStack Router配置
├── vite.config.ts            # Vite配置
└── Dockerfile               # Docker部署配置
```

## 🌐 在线演示

访问 [https://sunrisies.github.io/bun-react](https://sunrisies.github.io/bun-react) 体验在线版本。

## 🤝 贡献指南

我们欢迎所有形式的贡献！无论是提交Bug报告、功能建议，还是直接提交代码。

### 贡献步骤

1. Fork 项目到您的 GitHub 账号
2. 创建您的特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交您的更改 (`git commit -m 'feat: Add some AmazingFeature'`)
4. 推送到您的分支 (`git push origin feature/AmazingFeature`)
5. 创建一个 Pull Request

**类型包括：**

- `feat`: 新功能
- `fix`: 修复bug
- `docs`: 文档更新
- `style`: 代码格式化
- `refactor`: 代码重构
- `test`: 测试相关
- `chore`: 构建过程或辅助工具的变动

### 开发流程

1. 从 `main` 分支创建新的功能分支
2. 开发新功能或修复bug
3. 确保代码符合规范 (`bun lint`)
4. 添加必要的测试
5. 提交代码并推送到远程仓库
6. 创建 Pull Request

## 🔧 配置说明

### Vite 配置

项目使用 Vite 作为构建工具，配置文件位于 `vite.config.ts`：

```typescript
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { TanStackRouterPlugin } from "@tanstack/router-plugin/vite";
import viteCompression from "vite-plugin-compression";

export default defineConfig({
  plugins: [react(), tailwindcss(), TanStackRouterPlugin(), viteCompression()],
  // ... 其他配置
});
```

### TypeScript 配置

项目使用严格的 TypeScript 配置，提供完整的类型安全：

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true
  }
}
```

## 📊 性能特点

- **快速启动**: 使用 Bun 运行时，启动时间比 Node.js 快 10 倍
- **极速构建**: Vite 的热重载几乎瞬时完成
- **优化打包**: 自动代码分割和资源压缩
- **内存效率**: Bun 的内存使用比 Node.js 更高效

## 🛡️ 安全性

- 使用最新依赖，定期更新
- 文件处理在客户端进行，保护用户隐私
- 无服务器端文件存储，数据安全
- 输入验证和错误处理

## 📄 许可证

本项目采用 [MIT 许可证](LICENSE)。

```
MIT License

Copyright (c) 2024 sunrise

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

## 📞 联系方式

- **作者**: sunrise
- **邮箱**: 3266420686@qq.com
- **GitHub**: [@Sunrisies](https://github.com/Sunrisies)
- **项目地址**: https://github.com/Sunrisies/bun-react

## 🙏 致谢

感谢以下开源项目和贡献者：

- [React](https://react.dev/) - UI框架
- [Vite](https://vitejs.dev/) - 构建工具
- [Bun](https://bun.sh/) - JavaScript运行时
- [Tailwind CSS](https://tailwindcss.com/) - CSS框架
- [shadcn/ui](https://ui.shadcn.com/) - UI组件库
- [TanStack](https://tanstack.com/) - 路由和状态管理
- [pdf-lib](https://pdf-lib.org/) - PDF处理
- [FFmpeg](https://ffmpeg.org/) - 多媒体处理

## 📝 备注

- 本项目完全在浏览器端运行，无需服务器支持
- 所有文件处理均在本地完成，保护用户隐私
- 项目持续更新中，更多功能敬请期待

---

**Star ⭐ 如果您觉得这个项目有帮助！**

Made with ❤️ by [sunrise](https://github.com/Sunrisies)
