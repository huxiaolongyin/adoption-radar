# Adoption Radar 开发与维护

## 环境要求

- Node.js 22 或更高版本。
- npm；依赖版本由 `package-lock.json` 固定。
- Linux、macOS 或 WSL 用于可靠执行当前生产构建。

安装依赖并检查当前内容：

```powershell
npm ci
npm run validate
```

## 常用命令

| 命令 | 用途 |
| --- | --- |
| `npm run dev` | 启动上游生成器的本地开发服务 |
| `npm run validate` | 检查品牌资产和雷达内容 |
| `npm run build` | 生成 `build/` 并将页面依赖的远程设计资源改为同源资源 |
| `npm run brand:generate` | 从受版本控制的规则重新生成品牌资产 |
| `npm run brand:check` | 检查必需资产、Logo 几何、主题清单和图标结构 |

## 新增雷达条目

在 `radar/<发布日期>/` 下创建 Markdown 文件。文件名是条目跨发布版本保持不变的 ID，例如：

```text
radar/2026-08-24/powertoys.md
```

最小格式：

```markdown
---
title: "PowerToys"
ring: adopt
segment: tools
---

在这里说明用途和采纳理由。
```

当前可用分区 ID：

- `knowledge`：知识
- `skills`：技能
- `tools`：工具
- `resources`：资源

当前可用采纳环 ID：

- `adopt`：采用
- `trial`：试用
- `assess`：评估
- `hold`：暂缓

现有条目还使用 `summary`、`tags` 和 `links` 等字段；新增内容前应参考同目录中的有效条目，并以 `npm run validate` 的结果为准。

### 采纳说明

正文应简明回答三个问题：条目是什么并解决什么问题、为何处于当前采纳环、在哪些边界下不适用或需要重新评估。

- `summary` 使用一句话概括当前定位，建议为 30–60 个中文字。
- 正文建议为 300–500 个中文字，默认使用三个紧凑自然段，不要求固定小标题。
- 优先记录第一人称的实际使用证据；通用产品介绍最多一两句，避免功能宣传和完整评测。
- 只有多个独立能力共同支撑采纳判断时才使用精简项目符号，不逐项解释常识性功能。
- 图片必须表达文字难以替代的工作流、关键配置或实际结果；普通设置页、官网界面和装饰图不进入正文。
- 标签只用于跨条目筛选，不重复标题、分区或正文概念；每篇建议保留 2–3 个。
- 字数与标签数量是写作指导，不作为构建阻断条件；复杂条目可以在有明确依据时超出建议范围。

## 发布雷达版本

1. 使用发布日期创建新目录，例如 `radar/2026-09-15/`。
2. 新条目直接新增 Markdown。
3. 已有条目的判断或说明发生变化时，使用相同文件名在新目录中添加修订版。
4. 不复制没有变化的条目。
5. 运行 `npm run validate`；在 Linux、macOS 或 WSL 中再运行 `npm run build`。
6. 将变更提交并推送到 `main`，由 GitHub Actions 构建并发布 GitHub Pages。

## 修改站点配置

- 分区、采纳环、界面开关、站点地址和界面文案位于 `config.json`。
- 站内阅读帮助位于 `about.md`；该文件是上游生成器的必需输入，不得删除或移动。
- 项目级样式覆盖位于 `custom.scss`。
- 默认主题位于 `themes/neutral/`。
- 公开图片、字体、favicon 和 Web App Manifest 位于 `public/`。

这些路径由上游 CLI 从项目根目录读取。不要将其移动到 `src/` 或其他目录，除非同时明确改变整个构建输入契约。

## 品牌资产

品牌含义、颜色和使用边界以 [`docs/brand/README.md`](docs/brand/README.md) 为准。修改 `scripts/generate-brand-assets.mjs` 中的几何、颜色或字体来源后运行：

```powershell
npm run brand:generate
npm run brand:check
```

生成结果包括 `public/brand/`、favicon、应用图标、分享图、字体文件及主题 Logo。不要只手工修改某个生成结果，否则下次生成会覆盖该变化。

## Windows 限制

项目的 `postinstall` 脚本会为当前生成器版本应用幂等的 Windows 路径兼容修正；上游实现已兼容时会自动跳过。

Porsche Digital Technology Radar Generator `2.3.1` 在当前 Windows 与 Next.js 编译器组合下仍可能无法完成本地开发或生产构建。Windows 上应至少运行 `npm run validate`；生产构建交给 GitHub Actions 的 Ubuntu 环境，或在 WSL、Linux、macOS 中执行。

## 生成状态

以下目录不应直接修改或提交：

- `node_modules/`：npm 安装的依赖。
- `.techradar/`：上游 CLI 创建的影子构建工作区。
- `build/`：最终静态站点产物。

需要改变生成结果时，应修改项目根目录中的声明性输入或 `scripts/` 下的受版本控制脚本，再重新运行对应命令。
