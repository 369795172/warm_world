# 资产管理体系文档

## 概述

本文档描述了价值之旅·小小世界项目的资产管理体系，该系统基于UI升级计划和通用助手行为规则构建，提供完整的2D资产管理解决方案。

## 目录结构

```
public/assets/
├── characters/          # 角色资产
├── toys/               # 玩具资产
├── backgrounds/        # 背景资产
├── animations/         # 动画资产
├── icons/              # 图标资产
├── asset-manifest.json # 资产清单文件
└── README.md          # 本文档
```

## 资产分类

### 1. 角色资产 (characters/)
- **用途**: 游戏中的互动角色
- **命名规范**: 小写字母+下划线，如 `bunny`, `parent_mom`
- **文件格式**: SVG (优先), Emoji (降级)
- **尺寸标准**: 64x64px (标准), 32x32px (小尺寸), 128x128px (大尺寸)

### 2. 玩具资产 (toys/)
- **用途**: 可互动的游戏道具
- **命名规范**: 小写字母+下划线，如 `ball`, `music_box`
- **文件格式**: SVG (优先), Emoji (降级)
- **尺寸标准**: 32x32px (标准)

### 3. 背景资产 (backgrounds/)
- **用途**: 场景环境背景
- **命名规范**: 小写字母+下划线+`_bg`后缀，如 `home_room_bg`
- **文件格式**: SVG
- **尺寸标准**: 800x600px (标准场景), 1200x800px (全景)

### 4. 动画资产 (animations/)
- **用途**: 交互动画效果
- **命名规范**: 小写字母+下划线+`_anim`后缀，如 `bounce_anim`
- **文件格式**: Lottie JSON
- **文件大小限制**: ≤200KB

### 5. 图标资产 (icons/)
- **用途**: UI界面图标
- **命名规范**: 小写字母+下划线+`_icon`后缀，如 `water_icon`
- **文件格式**: SVG
- **尺寸标准**: 24x24px

## 命名规则

根据通用助手行为规则，所有资产必须遵循以下命名约定：

| 分类 | 正则表达式 | 示例 |
|------|-----------|------|
| characters | `^[a-z]+(_[a-z]+)*$` | `bunny`, `parent_mom` |
| toys | `^[a-z]+(_[a-z]+)*$` | `ball`, `music_box` |
| backgrounds | `^[a-z]+(_[a-z]+)*_bg$` | `home_room_bg` |
| animations | `^[a-z]+(_[a-z]+)*_anim$` | `bounce_anim` |
| icons | `^[a-z]+(_[a-z]+)*_icon$` | `water_icon` |

## 元数据标准

每个资产包含完整的元数据信息：

```typescript
interface AssetMetadata {
  id: string                    // 唯一标识符
  name: string                  // 显示名称
  category: AssetCategory       // 资产分类
  type: AssetType              // 文件类型 (svg/lottie/emoji)
  src: string                  // 文件路径
  alt: string                  // 替代文本
  dimensions?: { width: number; height: number }  // 尺寸
  fileSize?: number            // 文件大小 (字节)
  version: string              // 版本号
  createdAt: string            // 创建时间 (ISO 8601)
  updatedAt: string            // 更新时间 (ISO 8601)
  tags: string[]               // 标签数组
  fallback?: string            // 降级资产ID
  validation: {                // 验证信息
    status: 'pending' | 'valid' | 'invalid'
    checkedAt: string | null
    errors: string[]
  }
}
```

## 性能配置

### 加载优化
- **懒加载**: 默认启用，减少初始加载时间
- **预加载**: 关键资产支持预加载机制
- **并发限制**: 最多3个并发加载请求
- **超时设置**: 10秒加载超时
- **重试机制**: 失败后最多重试3次，间隔1秒

### 文件大小限制
- **SVG**: ≤50KB
- **Lottie**: ≤200KB  
- **GLTF**: ≤500KB

## 可访问性支持

### 降级策略
1. **网络降级**: 弱网环境下自动使用Emoji替代
2. **性能降级**: 低端设备自动降低动画复杂度
3. **偏好降级**: 尊重用户`prefers-reduced-motion`设置

### 无障碍功能
- **屏幕阅读器**: 完整的ARIA标签支持
- **键盘导航**: 支持Tab键导航
- **高对比度**: 支持高对比度模式
- **替代文本**: 所有资产提供alt文本

## 验证机制

### 自动化校验
- **命名规范**: 正则表达式验证资产ID
- **文件格式**: 验证文件扩展名和内容格式
- **尺寸检查**: 验证图片尺寸是否符合标准
- **文件大小**: 检查是否超出大小限制

### 质量检查
- **SVG验证**: 检查必需的属性(viewBox, xmlns)
- **Lottie验证**: 验证JSON结构和必需字段
- **可访问性**: 检查alt文本和ARIA标签

## 使用示例

### 基础使用
```tsx
import { AssetRenderer } from '@/components/AssetRenderer'

// 渲染角色
<AssetRenderer assetId="bunny" width={64} height={64} />

// 渲染玩具
<AssetRenderer assetId="ball" width={32} height={32} />

// 渲染背景
<AssetRenderer assetId="home_room_bg" width={800} height={600} />
```

### 高级配置
```tsx
<AssetRenderer
  assetId="bunny"
  width={64}
  height={64}
  animation={{ type: 'bounce', duration: 500 }}
  accessibility={{ ariaLabel: '可爱的小兔兔' }}
  fallback="emoji"
  priority="high"
  onLoad={() => console.log('Asset loaded')}
  onError={(error) => console.error('Load failed:', error)}
/>
```

### 批量加载
```tsx
import { useBatchAssetLoader } from '@/hooks/useAssetLoader'

const { assets, loading, errors } = useBatchAssetLoader(
  ['bunny', 'bear', 'ball'],
  'critical'
)
```

## 维护指南

### 添加新资产
1. 将文件放入对应的分类目录
2. 更新`asset-manifest.json`文件
3. 运行验证脚本检查合规性
4. 测试降级和可访问性功能

### 版本管理
- 使用语义化版本号 (如 `1.0.0`)
- 更新`updatedAt`时间戳
- 维护变更日志

### 性能监控
- 监控资产加载时间
- 跟踪缓存命中率
- 记录错误和降级情况

## 合规性检查

✅ **已完成**:
- 目录结构建立
- 命名规则定义
- 元数据标准制定
- 加载机制实现
- 降级策略设计
- 可访问性支持

🔄 **待完成**:
- 实际资产文件创建
- 自动化验证脚本
- 性能基准测试
- 文档完善更新

## 参考文档

- [UI动效升级计划](../../docs/ui-motion-plan.md)
- [通用助手行为规则](../../universal_assistant_rules.md)
- [资产配置](../../src/config/assetConfig.ts)
- [资产加载Hook](../../src/hooks/useAssetLoader.ts)
- [资产渲染器](../../src/components/AssetRenderer.tsx)

---

*最后更新: 2025-11-22*
*版本: 1.0.0*