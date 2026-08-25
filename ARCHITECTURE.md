# Adoption Radar 架构

## 目标与边界

Adoption Radar 将版本化 Markdown 条目和站点配置转换为可公开访问的静态采纳雷达。仓库拥有内容、配置、品牌输入、构建修正和发布工作流；不拥有 Porsche Digital Technology Radar Generator 的上游应用实现。

当前系统没有运行时后端、数据库、登录或在线编辑能力。浏览器只读取 GitHub Pages 发布的静态资源。

## 系统结构

```mermaid
flowchart LR
    I[站点输入] --> G[Porsche 雷达生成器]
    G --> B[静态构建目录]
    B --> P[同源资产后处理]
    P --> A[GitHub Pages 构件]
    A --> W[公开站点]
```

| 组件 | 拥有的职责 | 不拥有的职责 |
| --- | --- | --- |
| 站点输入 | 雷达条目、分类、文案、主题和公开资源 | 页面路由与渲染实现 |
| 上游生成器 | 校验输入并生成雷达、详情、变更记录和静态页面 | 本项目的采纳判断与品牌定义 |
| 本项目脚本 | Windows 路径兼容修正、品牌资产生成与检查、远程设计资源同源化 | 通用雷达生成器功能 |
| GitHub Actions | 在 Linux 中校验、构建并上传 Pages 构件 | 内容编辑和运行时数据处理 |
| GitHub Pages | 只读提供构建后的静态站点 | 身份认证、服务端写入和动态计算 |

## 站点输入

上游 CLI 从项目根目录读取以下声明性输入：

- `radar/<发布日期>/<条目 ID>.md`：雷达条目及其修订。
- `config.json`：基础路径、公开地址、分区、采纳环、界面开关和文案。
- `about.md`：站内“帮助与关于”页面正文。
- `custom.scss`：项目级样式覆盖。
- `themes/neutral/`：当前默认主题的清单与页头、页尾标识。
- `public/`：图片、字体、favicon、Web App Manifest 和品牌资源。

同一条目在不同发布日期目录中保持相同文件名。新目录只保存新增或发生变化的条目；生成器据此形成最新状态和修订历史，没有变化的条目不需要复制。

## 构建流程

`package.json` 暴露四类项目命令：

1. `postinstall` 执行 `scripts/patch-techradar-paths.mjs`，为当前上游版本幂等修正 Windows 路径处理。
2. `validate` 先检查品牌资产，再调用上游内容校验。
3. `build` 调用上游静态构建，然后运行 `scripts/self-host-pds-assets.mjs`。
4. `brand:generate` 与 `brand:check` 分别生成和验证项目品牌资产。

静态构建首先写入 `build/`。后处理脚本扫描页面实际引用的 Porsche Design System 资源，将其复制到 `build/_vendor/` 并改写为站点同源 URL；favicon、应用图标和分享图使用本项目资源替代对应的远程元资源。

`.techradar/` 是上游 CLI 创建的影子构建工作区，`build/` 是最终静态产物。二者均为可再生状态，不进入版本控制。

## 发布流程

`.github/workflows/deploy-pages.yml` 在以下场景运行：

- `main` 分支收到推送；
- 维护者手动触发工作流。

构建任务在 Ubuntu 和 Node.js 22 环境中依次执行依赖安装、内容校验和生产构建，再上传 `build/`。部署任务只在构建成功后将构件发布到 GitHub Pages。工作流使用 `contents: read`、`pages: write` 和 `id-token: write` 权限，并串行处理 Pages 发布。

## 数据与安全边界

- Git 仓库中的 Markdown 和站点配置是内容事实来源，Git 历史保存采纳判断的变更轨迹。
- 发布站点完全公开，构建产物不得包含凭据、内部地址或其他敏感信息。
- 浏览器不访问 GitHub API，不修改仓库，也不向服务端持久化状态。
- 上游依赖源码和生成目录不是本项目的声明性来源；兼容修正必须由受版本控制的脚本重复应用。
