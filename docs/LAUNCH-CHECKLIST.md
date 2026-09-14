# 上线交接单

> 2026-09-14。站点功能已全部完成(M0–M6 + 精致标本模式 + 工坊动画增强),
> 生产构建已作收官验证(见文末记录)。剩余两件事都需要馆长本人完成。

## 一、上线(按 DEPLOY.md,三步)

1. 把整个项目推到 GitHub(`models-backup/`、`content-review/`、`docs/` 都建议一并入库——它们是可追溯性的一部分;`node_modules/`、`dist/`、`test-results/` 不入库,`.gitignore` 已配好)。
2. 选平台连仓库:Cloudflare Pages(推荐)或 Vercel / Netlify,构建命令 `npm run build:release`、输出 `dist`、Node 22。各平台的 SPA 回退与缓存头配置(`_redirects` / `_headers` / `vercel.json`)已就绪。
3. 部署完成后按下面的清单抽查一遍。

## 二、上线后 10 分钟抽查清单

| # | 打开 | 应看到 |
|---|---|---|
| 1 | `/` | 标本台三栏,西方蜜蜂工蜂加载,热点可点 |
| 2 | `/museum/bees/apis-cerana?hd=1` | 精致标本(毛发精模)+ 精简工具栏 |
| 3 | `/museum/flowers/flower-vaccinium-corymbosum?visit=bombus-terrestris` | 熊蜂飞向倒挂蓝莓花并落定,花粉筐渐显 |
| 4 | `/museum/honey-workshop?stage=handoff` | 两只蜂头对头交哺,指认小签 |
| 5 | `/museum/honey-workshop?stage=transform` | 蜂探格 + 右下角分子视角窗(蔗糖水解循环) |
| 6 | `/museum/life-cycle` | 时间轴可拖动 |
| 7 | `/sources` | 来源与审校页,182 条状态表齐全 |
| 8 | 任意乱路径(如 `/xyz`) | 404 页"没有展品"(验证 SPA 回退) |
| 9 | 手机打开 `/museum/flowers` | 花名条横滑、筛选抽屉、工具条图标齐全 |

## 三、唯一的人工核对项:Sun 2021 试验地点

- **是什么**:蓝莓 × 三种蜂的三条访花关系引用了 Sun 等 2021 的温室对照研究
  (HortScience,DOI: 10.21273/HORTSCI15714-21)。论文正文未注明试验地点,
  目前三条关系的说明里都如实写着"论文未注明试验地点";方法段线索:供蜂方为辽东学院(丹东)。
- **要核什么**:打开论文原文(图书馆/机构渠道),确认方法段是否能落实试验地点
  (例如辽宁丹东或其他)。
- **核完怎么办**:把结论告诉助手(Claude)。若地点可确认,三条关系的说明文字需要修订——
  **按馆规,文本改动必须进入对抗式审查子集复审**,由助手执行修文 + 复审 + 升级流程;
  若仍无法确认,维持现状即可(现有表述已如实)。

## 四、收官验证记录(2026-09-14,助手执行)

- `npm run build:release`:发布门禁(182 条无 draft)+ 34 项单测 + 构建,全过;
- 生产构建经 `vite preview` 实机抽查六项:标本台、精致标本(meshopt 生产解码)、
  花朵访花演示、工坊演示格、生命历程、来源页 SPA 直链——全部通过,零控制台错误;
- 全量 e2e 最近一轮:53 条全过(42 视觉基线 + 11 冒烟)。
