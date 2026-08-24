# Adoption Radar 品牌使用说明

Adoption Radar 的标识表达“持续判断，并选择当前值得采用的事物”。它属于本项目，不代表 Porsche 或其他上游项目。

## 核心符号

“采纳轨道”由两条朝右上方开放的同心轨道和一个略向内推进的节点组成：

- 开放轨道表示采纳判断会持续演进；
- 两层结构抽象表达阶段，不复制雷达图的四个真实状态；
- 节点表示某个候选事物经过判断后走向采用；
- 几何线条与圆形端点兼顾秩序感和开放感。

不要添加扫描扇面、箭头、十字准星、额外节点或分类四色，也不要旋转标志。

## 资产

| 场景 | 文件 |
| --- | --- |
| 钴蓝主符号 | [`adoption-radar-mark.svg`](../../public/brand/adoption-radar-mark.svg) |
| 墨黑主符号 | [`adoption-radar-mark-ink.svg`](../../public/brand/adoption-radar-mark-ink.svg) |
| 白色主符号 | [`adoption-radar-mark-white.svg`](../../public/brand/adoption-radar-mark-white.svg) |
| 方形应用图标 | [`adoption-radar-icon.svg`](../../public/brand/adoption-radar-icon.svg) |
| 浅色横向锁版 | [`adoption-radar-lockup-light.svg`](../../public/brand/adoption-radar-lockup-light.svg) |
| 深色横向锁版 | [`adoption-radar-lockup-dark.svg`](../../public/brand/adoption-radar-lockup-dark.svg) |
| 192px 应用图标 | [`adoption-radar-icon-192.png`](../../public/brand/adoption-radar-icon-192.png) |
| 512px 应用图标 | [`adoption-radar-icon-512.png`](../../public/brand/adoption-radar-icon-512.png) |
| 社交分享图 | [`adoption-radar-og.png`](../../public/brand/adoption-radar-og.png) |

浏览器 favicon 位于 `public/favicon.svg` 和 `public/favicon.ico`；PWA 元数据位于 `public/site.webmanifest`。

## 颜色

| 名称 | 色值 | 用途 |
| --- | --- | --- |
| Cobalt 600 | `#315CF5` | 主符号、应用图标底色、关键品牌识别 |
| Cobalt 300 | `#7C9BFF` | 深色界面的交互强调 |
| Ink | `#141820` | 浅色背景上的文字标识 |
| Cloud | `#F7F8FA` | 品牌展示背景 |
| White | `#FFFFFF` | 深色背景和钴蓝底板上的反白标识 |

知识、技能、工具、资源的四色只属于数据可视化，不进入 Logo。

## 文字标识

主标固定写作 `Adoption Radar`，使用 Manrope SemiBold 的句首大写形式。中文“采纳雷达”可以作为解释文字，但不要锁入 Logo；不要使用全大写、等宽字体、用户名或姓名首字母替代主标。

项目自托管 Manrope 拉丁字形文件，授权说明见 [`manrope-LICENSE.txt`](../../public/fonts/manrope-LICENSE.txt)。横向 SVG 已将文字转为路径，不依赖访问者安装字体。

## 尺寸与留白

- 独立符号在界面中的建议最小尺寸为 `20px`；favicon 可使用经过验证的 `16px` 版本。
- 横向锁版建议宽度不低于 `140px`。
- 标识四周至少保留一个节点直径的净空。
- 核心符号不带底板；只有 favicon、应用图标与头像使用圆角方形底板。

## 明暗主题

- 浅色界面使用钴蓝符号和 Ink 文字；
- 深色界面使用白色符号与文字；
- 不使用阴影、渐变、发光或描边补偿对比度。

## 维护

品牌源文件由 [`scripts/generate-brand-assets.mjs`](../../scripts/generate-brand-assets.mjs) 生成。调整几何、色值或字体后运行：

```powershell
npm run brand:generate
```

提交前应至少检查 SVG、16px/32px 图标、浅色与深色横向锁版，以及站点页头、favicon、PWA 图标和社交分享图。
