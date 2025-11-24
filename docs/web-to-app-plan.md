# 网页转 App 方案与迭代计划（参考原型）

## 版本记录
- 版本：v0.2（2025-11-22）
- 修改说明：
  - 按世界观与产品框架补充“背景/目标/现状”结构
  - 区分当前实现与未来规划，强调参考原型属性
  - 统一术语：兴趣驱动、长期主义、真实因果、生命五循环

## 背景（世界观与产品框架对齐）
- 世界观原则：
  - 兴趣驱动优先、恐惧为边界（温柔但不说谎，减少惩罚性语言）
  - 时间与复利：长期主义（让孩子体验“慢慢长大”与积累）
  - 真实因果而非说教（通过环境与反馈呈现后果）
- 产品框架映射：
  - 生命五循环在移动端的延展：
    - HomeScene（价值传递/交换）：触控与触觉反馈增强分享体验
    - GardenScene（价值创造/增长）：离线缓存与计时机制保持生长过程
    - TownView（兴趣驱动探索）：移动端导航与安全区适配提升探索流畅度
- 定位与价值：
  - 将现有 Web 交互 MVP 以最小改动打包为 iOS/Android，服务早期用户验证
  - 作为参考原型，探索移动端分发、权限合规与性能路径，不对整体产品方向形成约束

## 目标
- 短期（MVP）：
  - 基于 `Capacitor` 打包现有 React/Vite 前端为 iOS/Android 原生外壳
  - 完成安全区/方向锁定/深色模式适配，接入触觉反馈与离线缓存最小集
  - 性能与可用性达标：冷启动 < 2.5s、交互无明显卡顿、核心场景离线可用
- 长期（为未来 App 提供参考）：
  - 建立最小权限与隐私政策模板，形成审核问答知识库与回滚预案
  - 接入崩溃分析与监控，形成灰度发布机制与版本健康度指标
  - 为不同年龄段与环境维度提供差异化适配（命中面积、节奏、反馈强度）

## 现状（代码库客观描述）
- 技术栈与构建：React 18 + TypeScript + Vite + Tailwind；状态 `zustand`
- 关键组件：
  - Home 场景交互：`src/components/HomeScene.tsx`
  - 花园场景交互：`src/components/GardenScene.tsx`
  - 小镇导航入口：`src/components/TownView.tsx`
  - 家长模式：`src/components/ParentMode.tsx`
  - 时间与语音：`src/components/TimeManager.tsx`、`src/components/AudioManager.tsx`
  - 配置中心：`src/config/appConfig.ts`
- 已完成功能：
  - 场景切换、拖拽与点击交互、植物生长与浇水、语音提示、时间管理、行为记录与家长视角统计
- 待完善部分（与移动端相关）：
  - 打包：未配置 `Capacitor`、未生成 iOS/Android 平台工程
  - 缓存：未实现 Service Worker 与 `workbox` 的离线策略
  - 适配：未实现安全区/方向锁定/触觉反馈；深色模式仅 Web 级别（`src/hooks/useTheme.ts`）
  - 监控与合规：缺少崩溃分析、权限声明与隐私政策模板

## 架构与插件（建议）
- 外壳与插件：`@capacitor/app`、`@capacitor/haptics`、`@capacitor/preferences`、`@capacitor/filesystem`、`@capacitor/splash-screen`、`@capacitor/status-bar`、`@capacitor/share`、`@capacitor/browser`
- 媒体与缓存：优先 Web Audio；Service Worker + `workbox` 预缓存核心资产与场景包

## 适配与移动体验（建议）
- 安全区/刘海适配、横竖屏锁定（按场景）、深色模式一致性；触控命中面积与手势回退处理
- 触觉反馈：关键点击/拖拽使用 `Haptics.selection/impact`；提供关闭强反馈的开关
- 离线可用：核心场景在断网时可运行；行为记录延迟同步；故障降级可用

## 打包与发布流程（建议）
- 初始化：新增 `capacitor.config.ts`，设置 `server` 与平台列表
- 平台工程：`npx cap add ios android` 生成 Xcode/Android Studio 工程；自定义图标与启动屏
- 集成构建：`vite build` → `npx cap copy` → `npx cap sync`；设备调试与联机日志
- 权限与合规：最小权限（仅触感/文件访问等）；隐私用途声明、政策文档与使用说明
- 发布：TestFlight/内测通道 → 商店素材与审核问答准备；接入崩溃与分析

## App Store 2D 发布（新增）

### 项目背景补充
- 选择 2D 的核心原因：
  - 低成本与资产体量可控（像素/矢量素材管线成熟），小团队迭代快。
  - 开发周期短，利于快速验证核心循环与留存，缩短到商店验证时间。
  - 市场验证快：在移动端，下载量长期由休闲/益智/模拟驱动，2D 更易覆盖。（参考 Sensor Tower 2025）
- 市场表现数据（移动端总体，含 iOS）：
  - 2024 移动游戏收入约 920 亿美元，占游戏总收入 49%（Newzoo，2025；由 Udonis 汇总）。
  - 2024 下载占比：模拟与益智各约 20%；策略下载占比仅 ~4% 但收入占比 ~21.4%（Sensor Tower，2025；由 Udonis汇总）。
  - 2025 年 4 月全球移动游戏月度消费约 64.8 亿美元；下载榜以《Block Blast!》等益智类领跑（Sensor Tower，2025）。
- 目标用户与核心类型：
  - 目标用户：轻度玩家与家庭用户（8–18 岁+家长）；碎片化时间、低学习成本。
  - 类型定位：休闲+益智关卡（闯关）+模拟/养成（农场/镇区），以“兴趣驱动+长期主义”融合叙事与成长。

### iOS 技术实现路径
- 引擎选项（iOS 生态）：
  - Unity 2D（URP）：跨平台、生态完善；需适配 Metal（默认），导出 arm64，体积较大。
  - SpriteKit：Apple 原生 2D；Metal/arm64 原生支持；体积小、上手快，跨平台弱。
  - Cocos2d-x（或 Cocos Creator 原生导出）：成熟 2D；Metal 支持取决于版本与桥接，需验证管线。
  - Godot 4（2D）：可导出 iOS，Metal 支持在 4.x 逐步完善；需验证性能与提交流程。
  - Web 2D（Phaser/Pixi + Capacitor）：最小改动保留现有栈；需关注大型地图/复杂 AI 的性能与工具链。
- 苹果生态适配要求：
  - 图形：OpenGL ES 已弃用，使用 Metal；渲染与着色器路径需适配。
  - 架构：64 位 `arm64` 必须；Xcode 15+ 构建，Apple Silicon 支持。
  - 隐私与合规：隐私标签（App Store Connect）+ 隐私清单 `PrivacyInfo.xcprivacy`（声明数据收集与必需原因 API）；ATT/跟踪声明按需。（Apple 官方 App Privacy）
- 必须/建议的 iOS 特性：
  - Game Center（成就/排行榜/玩家档案）：`GameKit` 集成与沙盒可测。
  - 应用内购买（IAP）：优先 `StoreKit 2`（iOS 15+），旧机型保留 `StoreKit 1` 兼容层；服务器校验与通知。
  - TestFlight：外测与反馈收集；App Store Connect 预审。
  - MetricKit/崩溃收集：`MetricKit` 指标 + Crashlytics/Sentry；联机日志与灰度发布。

### 核心开发里程碑
- 阶段 1｜原型验证期（4–6 周）
  - 可玩核心玩法 Demo（休闲关卡+基础农场/镇区交互）。
  - TestFlight 小规模测试（≥50 外部测试者），收集留存与反馈。
  - 性能基线：冷启动、帧率、内存占用（Xcode Instruments/MetricKit）。
- 阶段 2｜内容完善期（8–10 周）
  - 关卡体系与成长曲线（表驱动），NPC/事件与简易节庆。
  - 集成苹果服务：IAP（StoreKit 2）、Game Center（成就/排行榜）。
  - App Store Connect 预审检查与素材准备（多语言文案/截图/预览）。
- 阶段 3｜发布准备期（2–3 周）
  - 多设备分辨率与安全区适配；弱机降级与触控体验检查。
  - 元数据完整：多语言描述、关键字、隐私标签、政策与支持页面。
  - 提交审核与发布策略（分阶段地区、节庆活动与广告投放节奏）。

### 质量保证要求
- 构建验证：通过 Xcode `Archive` 验证与签名检查；`arm64`、Metal、最低版本 iOS 15+。
- 兼容性：iOS 15–当前稳定版本；主要机型覆盖（A13–A17 以及 iPad）。
- 崩溃与性能：接入 Crashlytics/Sentry + `MetricKit`；崩溃率 < 0.5%、冷启动 < 2.5s。
- 审核清单：隐私清单/标签完成、权限用途说明、账号删除入口（如有登录/注册）、中国大陆区版号与材料（如投放大陆区）。

> 参考来源：
> - Udonis《Mobile Gaming Market Statistics 2025》（汇总 Newzoo/Sensor Tower）：https://www.blog.udonis.co/mobile-marketing/mobile-games/mobile-gaming-statistics
> - Udonis《Mobile Gaming Market Trends 2025》：https://www.blog.udonis.co/mobile-marketing/mobile-games/mobile-game-market-trends
> - Sensor Tower《Top 10 Worldwide Mobile Games – April 2025》：https://sensortower.com/blog/top-10-worldwide-mobile-games-by-revenue-and-downloads-in-april-2025
> - Apple 官方《App 隐私说明》：https://developer.apple.com/cn/app-store/app-privacy-details/

## 最佳实践与度量
- 60fps：减少重排/重绘，动画合成层；避免频繁更新大图与多重阴影
- 首屏优化：预加载关键路由/场景包；懒加载重型资产；压缩与 Tree-shaking
- 指标：冷启动 < 2.5s、离线命中 ≥ 90%、崩溃率 < 0.5%、JS 错误收敛
- 明确声明：本文档与实现均为参考原型，不影响整体产品方向决策

## 风险与缓解
- 审核合规：权限用途最小化与明确说明；隐私政策与数据处理透明
- 设备碎片化：广覆盖设备测试、方向与分辨率适配、降级策略
- 资源体积：分包与懒加载、压缩与裁剪；移除未使用依赖与资产
