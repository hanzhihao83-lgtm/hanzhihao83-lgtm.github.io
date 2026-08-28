# 作品集实施说明

## 当前状态

网站已完成首页、四个项目案例、视觉笔记、摄影、视频放映室、全局交互、响应式与静态部署配置。设计借鉴参考站的编辑部节奏、悬浮导航、超大标题和深浅区块对比，但未复制或热链其个人内容与媒体。

## 页面地图

| 路由 | 内容 | 数据来源 |
| --- | --- | --- |
| `/` | 首页、项目展示、三个内容入口 | `site.ts`、`projects.ts` |
| `/projects/i2v-evaluation/` | 视频评测控制台主题案例 | `projects.ts` |
| `/projects/project-02/` | 紫色多轮对话主题案例 | `projects.ts` |
| `/projects/project-03/` | 青色结构化 Caption 主题案例 | `projects.ts` |
| `/projects/project-04/` | 珊瑚红盲测矩阵主题案例 | `projects.ts` |
| `/visual-notes/` | 八维视觉研究档案 | `visual-notes.ts` |
| `/photography/` | Contact Sheet、筛选和 Lightbox | `photography.ts` |
| `/moving-image/` | 三部作品放映室 | `videos.ts` |
| `/aesthetic/` | 旧地址迁移提示 | — |
| `404` | 自定义未找到页面 | — |

## 核心组件

- `HomePage`：Hero、Featured 项目、三列项目和差异化内容入口。
- `ProjectCase`：案例二至四的通用首屏、章节、指标卡、流程、标签矩阵和下一案例 CTA。
- `VideoEvaluationProject`：案例一的专属视频评测档案，包含评测协议、维度矩阵、Score Lab、产品比较、标签体系和数据约束结论。
- `EvaluationVideo`：本地视频按需加载、静音、互斥播放、切换重置、离屏暂停和错误状态。
- `VisualNotesArchive`：维度索引和不对称研究条目。
- `PhotographyGallery`：筛选、键盘可访问 Lightbox、背景滚动锁定。
- `FilmPlayer`：按需加载、静音策略、离开视口暂停和媒体卸载。
- `SiteHeader`：胶囊导航和悬挂式/底部抽屉联系卡。
- `GlobalRuntime`：共享 IntersectionObserver、轻量页面转场、自定义光标和联系卡事件。
- `SiteFooter`：全局联系结尾与档案导航。

## 数据与本地媒体

- `src/data/profile.ts`：姓名、缩写、职业、邮箱、联系方式、年份和头像。
- `src/data/projects.ts`：四个项目的标题、主题、章节、指标、标签、流程与媒体。
- `src/data/visual-notes.ts`：视觉笔记维度和条目。
- `src/data/photography.ts`：摄影分类、尺寸、alt 和地点。
- `src/data/videos.ts`：视频 poster、source、时长、类型和呈现方式。
- `src/data/evaluation-config.ts`：五个评测维度、权重、强调色、1–5 分级和 93 个问题标签（其中 12 个为本次可灵案例的可观察问题标签）。
- `src/data/projects/i2v-evaluation.ts`：可灵 AI 3.0 Omni 的五条代表案例、评分、观察事实、问题标签和结论；新增视频只修改这个数据文件。
- `src/data/video-evaluation.ts`：兼容旧引用的转发入口，真实数据以 `src/data/projects/i2v-evaluation.ts` 为准。
- `src/types/evaluation.ts`：`Product`、`EvaluationDimension`、`ScoreLevel`、`VideoCase`、`IssueTag`、`EvaluationResult` 和 `ProjectSummary` 类型。
- `src/lib/evaluation.ts`：标签归属校验、低分标签约束、N/A 规则、产品维度聚合和权重归一化。
- `public/media/`：24 个本地原创占位 SVG，不含外部热链。
- `public/videos/i2v-evaluation/`：五条 1920×1080 可灵 AI 评测视频，保持源文件编码和分辨率。
- `public/images/i2v-evaluation/`：从每条视频第 1 秒生成的五张 1920×1080 WebP 封面。

所有无法确认的项目周期、数据量、结果和业务成绩均明确显示为“待填写”。

## 交互与可访问性

- 全站只使用一个 IntersectionObserver 处理内容入场。
- 精细指针且非 reduced-motion 设备启用自定义光标。
- 联系卡支持关闭按钮、Escape、点击外部、焦点循环与复制反馈。
- 页面转场仅延迟 110ms；reduced-motion 下直接导航。
- 摄影 Lightbox 支持方向键、Escape、焦点回归和滚动锁定。
- 视频默认静音，不自动播放；离开视口暂停，卸载时释放媒体。
- 全局焦点样式、跳转链接、唯一 title/description、图片 alt 和纯装饰空 alt 已配置。

## 静态部署

- `next.config.ts` 使用 `output: "export"`、`trailingSlash: true` 和静态图片配置。
- `npm run build` 输出至 `out/`。
- `robots.txt`、`sitemap.xml`、SVG favicon 和 404 已生成。
- 发布前必须将 `layout.tsx`、`sitemap.ts` 中的 `https://example.com` 替换为正式域名。

## 发布前必须替换

1. `profile.ts` 中全部 `{{...}}` 个人信息。
2. `projects.ts` 中四个 slug、项目标题、周期、指标与业务内容。
3. `public/media/` 中摄影、视觉笔记、项目封面、头像和视频 poster。
4. `videos.ts` 中三个本地视频 source、真实时长、标题和年份。
5. `photography.ts` 中摄影标题、地点、年份和 alt。
6. 根元数据、正式域名、OG 图片与隐私/版权说明。

## 新增视频评测案例

1. 将视频放入 `public/videos/i2v-evaluation/`，封面放入 `public/images/i2v-evaluation/`。
2. 在 `src/data/projects/i2v-evaluation.ts` 的 `cases` 中调用 `defineVideoCase`，填写 `video`、`poster`、`product`、`promptSummary`、`dimension`、`score`、`observableFacts` 和 `issueTags` 等必填字段。
3. `dimension` 和 `issueTags` 必须使用 `src/data/evaluation-config.ts` 中同一维度的 ID。低于 5 分必须至少填写一个当前维度标签。
4. 无音轨且提示词未要求声音时，音画同步填写 `score: "NA"`、`audioRequired: false`、`audioStatus: "not-required"`；未知成绩使用 `null`，不要用 N/A 代替缺失数据。
5. 运行 `npm test`。测试会检查本地路径、产品引用、标签归属、分制和归一化计算。

## 验证命令

```bash
npm run lint
npm run typecheck
npm run build
npm test
```

静态导出测试会检查主路由、title/description 和远程媒体热链。

## 最终视觉审查（2026-08-22）

- 首页保留超大标题与轨道视觉，收紧入场动画；三张次级项目卡统一高度、圆角和媒体比例，差异集中在主题色与信息图。
- 摄影页标题从互相压字改为可辨读的错位两行；移动端 Contact Sheet 修复了 `content-visibility` 固有尺寸造成的潜在横向溢出。
- 四个案例统一页面骨架与组件边角，控制台、节点、Caption 和矩阵首屏通过主题色与视觉隐喻区分；视觉笔记、摄影和放映室页尾延续各自强调色。
- 放映室结尾由居中模板改为非对称编辑排版；全局联系按钮增加稳定尺寸与独立合成层。
- 1440×900、1024×768、390×844、360×800 共 40 组路由/视口组合检查无横向溢出，主标题未越界，title/description 完整。
- 联系卡、摄影筛选、Lightbox 方向键与 Escape、滚动锁定、内部页面转场均完成浏览器回归。
- Lighthouse：桌面四项 100；移动端 Accessibility、Best Practices、SEO 为 100，Performance 为 86（本地 Python 静态服务器无压缩/缓存，线上 CDN 需复测）。
