# Adoption Radar

个人知识、技能、工具与资源的最新采纳雷达。站点由 [Porsche Digital Technology Radar Generator](https://github.com/porscheofficial/porschedigital-technology-radar) 生成，并通过 GitHub Actions 发布到 GitHub Pages。

## 本地运行

需要 Node.js 22 或更高版本。

```powershell
npm ci
npm run validate
npm run dev
```

生产构建：

```powershell
npm run build
```

静态文件会生成到 `build/`。

项目的 `postinstall` 脚本会为当前生成器版本应用一个幂等的 Windows 路径兼容修正；上游实现修复后，脚本会自动跳过。

## 新增条目

在 `radar/<发布日期>/` 下创建 Markdown 文件。文件名是不随版本变化的条目 ID，例如：

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

可用分区 ID：

- `knowledge`：知识
- `skills`：技能
- `tools`：工具
- `resources`：资源

可用环 ID：

- `adopt`：采用
- `trial`：试用
- `assess`：评估
- `hold`：暂缓

## 发布新版本

1. 使用发布日期创建新目录，例如 `radar/2026-09-15/`。
2. 新条目直接新增 Markdown；已有条目发生变化时，使用相同文件名在新目录中添加修订版。
3. 运行 `npm run validate` 和 `npm run build`。
4. 提交并推送到 `main`。
5. GitHub Actions 自动构建并部署 GitHub Pages。

没有变化的条目不需要复制到新版本目录。

## 许可

本仓库使用 [MIT License](LICENSE)。Porsche Digital Technology Radar Generator 作为依赖使用，并遵循其自身许可证。
