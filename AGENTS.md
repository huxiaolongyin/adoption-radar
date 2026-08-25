# Agent 协作约定

项目用途、在线入口和文档导航以 [`README.md`](README.md) 为准；修改与验证流程以 [`DEVELOPMENT.md`](DEVELOPMENT.md) 为准。本文件只保留 Agent 执行任务时必须遵守的增量约束和知识路由。

## 文档路由

- 修改产品术语或采纳判断的语义前，完整读取 [`CONTEXT.md`](CONTEXT.md)；该文件只保存领域语言，不保存实现、流程或品牌规则。
- 修改内容输入、构建边界、生成流程或发布拓扑前，完整读取 [`ARCHITECTURE.md`](ARCHITECTURE.md)。
- 修改本地命令、条目维护、版本发布或验证流程前，完整读取 [`DEVELOPMENT.md`](DEVELOPMENT.md)。
- 修改 Logo、颜色、字体或品牌资产前，完整读取 [`docs/brand/README.md`](docs/brand/README.md)。
- `about.md` 是站内帮助页内容，不是项目事实文档；修改时应保持面向站点访问者的阅读说明。

## 文件与目录边界

- `radar/` 保存雷达条目及其按发布日期组织的修订。
- `config.json`、`about.md`、`custom.scss`、`themes/` 和 `public/` 是上游生成器从项目根目录读取的站点输入，不得擅自移动。
- `scripts/` 保存本项目拥有的构建修正、品牌生成和静态产物后处理脚本。
- `.github/workflows/` 保存 GitHub Pages 的构建与发布流程。
- `.techradar/`、`build/` 和 `node_modules/` 是生成状态或依赖，不得直接修改或提交。

## 当前事实与变更范围

- 项目事实文档只描述当前代码、配置或已验证流程，不记录未实现的规划。
- 不为保持目录对称而创建空的文档分类；主题复杂到需要独立维护时再拆分。
- 雷达条目和公开资源不得包含公司项目、内部地址、账号、成本、凭据或其他敏感信息。
- 只修改声明性来源；可以由脚本重新生成的资产应通过对应脚本更新。

## 验证

- 雷达内容、配置或品牌输入发生变化时运行 `npm run validate`。
- 修改品牌生成规则后运行 `npm run brand:generate`，再运行 `npm run brand:check`。
- 生产构建在 Linux 环境运行 `npm run build`；Windows 上先按 [`DEVELOPMENT.md`](DEVELOPMENT.md) 中的已知限制判断失败是否来自上游组合。
- 修改 GitHub Actions 后核对 Node.js 版本、校验步骤、构建输出目录和 Pages 权限没有偏离 [`ARCHITECTURE.md`](ARCHITECTURE.md)。
