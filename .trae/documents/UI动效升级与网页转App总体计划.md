## 文档清单
- 目标路径：`/Users/marvi/Documents/trae_projects/business_life/docs`
- 文档 1：`ui-motion-plan.md`（UI 展示效果升级计划）
- 文档 2：`web-to-app-plan.md`（网页转 App 方案与迭代计划）

## 文档 1：UI 展示效果升级计划（ui-motion-plan.md）
### 背景与目标
- 在不改动核心交互与行为记录的前提下，为 `HomeScene/GardenScene/TownView` 增加主题背景与轻量动效。
- 将人物（爸爸妈妈、小兔兔、小熊熊）与物品（小球、礼物、音乐盒）从 Emoji/图标替换为可维护的 2D（优先）或 3D（可选）资产。
- 成功标准：FPS ≥ 55；首屏 < 2s；交互响应 < 100ms；错误率不升高。

### 项目现状（用于落地）
- 技术栈：React 18 + TypeScript + Vite + Tailwind；状态 `zustand`；图标 `lucide-react`。
- 关键组件：
  - `src/components/HomeScene.tsx`（角色与玩具交互、拖拽与分享）
  - `src/components/GardenScene.tsx`（种植与浇水，阶段成长）
  - `src/components/TownView.tsx`（导航与场景入口）
  - 配置 `src/config/appConfig.ts`；状态 `src/store/appStore.ts`

### 技术选型
- 背景与轻动效：CSS + Tailwind（渐变、噪声纹理、Parallax）；`framer-motion`（入场与交互反馈）。
- 2D 资产：
  - 静态/少态：SVG（主题化与着色友好）
  - 中度动画：Lottie（AE 导出 Bodymovin JSON）
- 3D 资产（可选）：`react-three-fiber` + `three.js` 加载低面 `glTF`；用于展示型交互（旋转/轻摆），低端设备自动降级为 2D。

### 资产管线与目录
- 目录：`public/assets/{characters|toys|backgrounds}`
- 命名：`bunny.svg|.json`、`bear.svg|.json`、`parent.svg|.json`、`ball.svg|.json`、`gift.svg|.json`、`music_box.svg|.json`
- 配置拓展：在 `src/config/appConfig.ts` 中为角色/玩具新增 `assetType: 'emoji'|'svg'|'lottie'|'gltf'`、`assetSrc`、`themeColor` 字段。

### 组件改造策略
- 引入通用渲染器：`CharacterRenderer`、`ToyRenderer`（纯展示组件），按配置选择 SVG/Lottie/3D。
- `HomeScene.tsx`：保留拖拽/分享与 `recordBehavior('share')`；仅替换渲染层。
- `GardenScene.tsx`：替换种子与阶段视觉为 SVG/Lottie；加入天气/光斑背景动效；计时/浇水逻辑不变。
- `TownView.tsx`：分层背景（远山/云层/前景植被），入口按钮加轻动效与触觉反馈提示。

### 动效规范与性能守护
- 动效节奏：入场 200–400ms、交互反馈 100–150ms；使用 `transform/opacity`，避免布局抖动。
- 资源加载：按需分包与懒加载；Lottie/GLTF 仅在需要时加载。
- 降级策略：检测 `prefers-reduced-motion` 与 FPS 探针，卡顿时关闭高强度动效与 3D。

### 迭代里程碑
- M1：主题背景与轻动效（Town/Home/Garden），配置字段打通，基础渲染器落地。
- M2：2D 角色与物品替换（父母/兔子/熊；球/礼物/音乐盒），交互与埋点稳定。
- M3（可选）：3D 展示卡片或小场景（1–2 个对象），完成降级与性能守护。
- M4：兼容性与可访问性（A11y/TTS）、QA 与回归、资产压缩与首屏优化。

### 验收与度量
- Lighthouse 性能 ≥ 85；内存稳定；低端设备降级有效；关键交互路径通过。

### 风险与缓解
- 资产体积增长：矢量优先、动效压缩、分包与懒加载。
- 设备差异：自动降级与关闭复杂动效；提供用户开关。
- 人力与风格统一：优先 2D，3D 仅用于展示型亮点。

## 文档 2：网页转 App 方案与迭代计划（web-to-app-plan.md）
### 路线选择
- 主方案：`Capacitor` 打包现有 Web 应用为 iOS/Android 原生外壳，成熟度高、保留 React/Vite 代码。
- 备选：`React Native`/`Flutter` 需重写界面；`Unity` 更适合纯游戏，不匹配现有场景交互。

### 架构与插件
- 前端保持 Web 渲染；原生提供外壳与能力：
  - 插件：`@capacitor/app`（生命周期/方向）、`haptics`（触感）、`preferences`（本地存储）、`filesystem`（资产缓存）、`splash-screen`、`status-bar`、`share`、`browser`
  - 媒体：优先 Web Audio；必要时桥接原生音频控制
  - 缓存：Service Worker + `workbox` 预缓存核心资产与场景包

### 适配与移动体验
- 安全区/刘海适配、横竖屏锁定（按场景）、深色模式一致性；触控命中面积与手势回退处理。
- 触觉反馈：关键点击/拖拽使用 `Haptics.selection/impact`；可关闭强反馈。
- 离线可用：核心场景在断网时可运行；行为记录延迟同步。

### 打包与发布流程
- 初始化：新增 `capacitor.config.ts`，设置 `server` 与平台列表。
- 平台工程：`npx cap add ios android` 生成 Xcode/Android Studio 工程；自定义图标与启动屏。
- 集成：`vite build` → `npx cap copy` → `npx cap sync`；设备调试。
- 权限与合规：最小权限（振动/文件访问等），隐私用途声明与政策文档。
- 发布：TestFlight/内测 → 商店素材与审核问答准备；崩溃与分析接入（Sentry/原生日志）。

### 最佳实践
- 60fps：减少重排/重绘，动画合成层；避免频繁更新大图。
- 首屏优化：预加载关键路由/场景包；懒加载重型资产。
- 监控：首屏时间、交互延迟、崩溃率、JS error；灰度发布控制风险。

### 迭代里程碑
- A1：App 外壳跑通（iOS/Android）、核心场景可交互、离线缓存最小集。
- A2：原生体验增强（触感/状态栏/启动屏）、权限与隐私合规。
- A3：性能与稳定性（FPS 与内存、资产分包、降级策略）。
- A4：发布与回归（商店素材、审核问题库、崩溃分析闭环）。

### 验收与度量
- 冷启动 < 2.5s；交互无明显卡顿；离线命中 ≥ 90%；崩溃率 < 0.5%。

### 风险与缓解
- 审核合规：权限用途最小化与明确说明；隐私政策与数据处理透明。
- 设备碎片化：广覆盖设备测试、方向与分辨率适配、降级策略。

## 执行与产出
- 获批后将创建 `docs` 目录并生成两份 Markdown 文档，内容按以上章节落地，并补充项目内路径引用与后续执行清单。

## 需要确认
- 资产风格比例（2D/3D）与优先级、依赖白名单（如 `framer-motion`、`lottie-react`、`@capacitor/*`）。

## 下一步
- 确认后开始 M1/A1 实施，并在文档中维护迭代日志与验收结果。