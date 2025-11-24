# 无障碍访问指南

本指南详细介绍了项目中实现的无障碍功能，确保符合 WCAG 2.1 AA 标准。

## 🎯 概述

本项目致力于提供完全无障碍的用户体验，支持以下功能：

- **键盘导航**：完整的键盘操作支持
- **屏幕阅读器**：兼容主流屏幕阅读器
- **颜色对比度**：符合 WCAG 2.1 AA 标准的颜色对比
- **运动偏好**：尊重用户的运动偏好设置
- **高对比度模式**：支持高对比度显示
- **响应式设计**：适配各种设备和屏幕尺寸

## 🧪 无障碍测试工具

### 内置测试组件

我们提供了 `AccessibilityTester` 组件，可以运行全面的无障碍测试：

```tsx
import { AccessibilityTester } from '@/components/AccessibilityTester'

function MyComponent() {
  return (
    <div>
      {/* 你的内容 */}
      <AccessibilityTester />
    </div>
  )
}
```

### 测试覆盖范围

1. **图像替代文本**：检查所有图片是否有 alt 属性
2. **交互元素标签**：确保按钮、链接等有可访问名称
3. **颜色对比度**：验证文本与背景的对比度
4. **焦点指示器**：检查交互元素是否有可见的焦点指示
5. **键盘导航**：验证元素是否可通过键盘访问
6. **标题结构**：检查标题层级是否正确
7. **语言属性**：验证页面语言设置
8. **跳转链接**：检查是否有跳转链接
9. **运动偏好**：验证是否尊重用户的运动偏好
10. **表单标签**：确保表单元素有正确的标签

## ⌨️ 键盘导航

### 快捷键支持

#### 花园场景 (GardenScene)
- `数字键 1-3`：选择种子工具
- `W 键`：选择浇水工具
- `ESC 键`：取消当前工具选择
- `方向键`：在种植区域导航
- `Tab 键`：在交互元素间切换
- `Enter/Space`：激活当前焦点元素

#### 通用导航
- `Tab`：向前导航到下一个可交互元素
- `Shift + Tab`：向后导航到上一个可交互元素
- `Enter` 或 `Space`：激活按钮或链接
- `Escape`：关闭模态框或取消操作
- `箭头键`：在列表或菜单中导航

### 焦点管理

所有交互元素都有清晰的焦点指示器：

```css
button:focus-visible {
  outline: 2px solid #2563eb;
  outline-offset: 2px;
  box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.1);
}
```

## 🎨 颜色对比度

### 对比度标准

- **普通文本**：对比度 ≥ 4.5:1
- **大文本**（18px+ 或 14px+ 粗体）：对比度 ≥ 3:1
- **交互元素**：对比度 ≥ 3:1
- **图形和用户界面组件**：对比度 ≥ 3:1

### 颜色工具

使用 `ColorContrastChecker` 工具验证对比度：

```typescript
import { ColorContrastChecker } from '@/utils/accessibility'

const ratio = ColorContrastChecker.getContrastRatio('#000000', '#ffffff')
const meetsAA = ColorContrastChecker.meetsWCAGAA(ratio, 16) // 16px font size
```

## 🏃‍♂️ 运动偏好支持

### 自动检测

系统自动检测用户的运动偏好设置：

```typescript
import { reducedMotionManager } from '@/utils/accessibility'

const prefersReduced = reducedMotionManager.getPrefersReducedMotion()
const duration = reducedMotionManager.getAnimationDuration(300) // 返回 0 如果用户偏好减少运动
```

### CSS 适配

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

## 🔊 屏幕阅读器支持

### ARIA 标签

所有组件都包含适当的 ARIA 标签：

```tsx
<button
  aria-label="选择花种子"
  aria-pressed={isSelected}
  title="选择花种子工具"
>
  🌱
</button>
```

### 实时区域

使用 `aria-live` 区域宣布状态变化：

```tsx
<div 
  role="status"
  aria-live="polite"
  aria-atomic="true"
>
  {statusMessage}
</div>
```

### 屏幕阅读器工具

```typescript
import { ScreenReaderManager } from '@/utils/accessibility'

// 宣布重要信息
ScreenReaderManager.announce('植物已浇水', 'polite')

// 创建仅屏幕阅读器可见的内容
const srOnlyContent = ScreenReaderManager.createScreenReaderOnly('重要提示')
```

## 📱 响应式设计

### 触摸目标大小

确保移动设备上的触摸目标至少为 44×44 像素：

```css
@media (pointer: coarse) {
  button, a, input, select, textarea {
    min-height: 44px;
    min-width: 44px;
  }
}
```

### 可读性

- 基础字体大小：16px
- 行高：1.5 或更高
- 最大行长：80 个字符
- 适当的段落间距

## 🌙 高对比度和暗色模式

### 高对比度支持

```css
@media (prefers-contrast: high) {
  .focus-visible {
    outline: 3px solid #000 !important;
    outline-offset: 3px !important;
  }
}
```

### 暗色模式

```css
@media (prefers-color-scheme: dark) {
  .text-contrast-primary {
    color: #f9fafb; /* 亮色文本 */
  }
  
  .bg-contrast-primary {
    background-color: #1f2937; /* 暗色背景 */
  }
}
```

## 🧩 组件无障碍特性

### GardenScene (花园场景)

- **键盘导航**：完整的键盘操作支持
- **屏幕阅读器**：详细的植物状态描述
- **焦点管理**：清晰的种植区域焦点指示
- **运动偏好**：自动适配用户的运动偏好
- **颜色对比**：确保所有文本有足够的对比度

### PlantRenderer (植物渲染器)

- **ARIA 标签**：描述植物类型和生长阶段
- **加载状态**：提供加载状态的屏幕阅读器反馈
- **动画适配**：根据运动偏好调整动画

### WeatherEffect (天气效果)

- **描述性标签**：提供天气类型的文本描述
- **非干扰性**：天气效果不会干扰主要内容
- **运动优化**：根据运动偏好调整动画强度

### CharacterRenderer & ToyRenderer

- **角色描述**：提供角色和玩具的文本描述
- **交互反馈**：屏幕阅读器可访问的交互反馈
- **动画适配**：支持减少运动模式

## 🛠️ 开发最佳实践

### 1. 使用语义化 HTML

```tsx
<!-- ✅ 好的做法 -->
<nav role="navigation" aria-label="主导航">
  <ul>
    <li><a href="/home">首页</a></li>
    <li><a href="/garden">花园</a></li>
  </ul>
</nav>

<!-- ❌ 避免 -->
<div class="nav">
  <div class="nav-item" onclick="goTo('/home')">首页</div>
</div>
```

### 2. 提供替代文本

```tsx
<!-- ✅ 好的做法 -->
<img src="plant.png" alt="开花的玫瑰植物" />
<span role="img" aria-label="花朵">🌸</span>

<!-- ❌ 避免 -->
<img src="plant.png" />
<span>🌸</span>
```

### 3. 确保键盘可访问性

```tsx
// ✅ 好的做法
<button 
  onClick={handleClick}
  onKeyDown={handleKeyDown}
  tabIndex={0}
>
  点击我
</button>

// ❌ 避免
div onClick={handleClick}>点击我</div>
```

### 4. 管理焦点

```tsx
import { useRef, useEffect } from 'react'

function MyComponent() {
  const buttonRef = useRef<HTMLButtonElement>(null)
  
  useEffect(() => {
    buttonRef.current?.focus()
  }, [])
  
  return <button ref={buttonRef}>重要按钮</button>
}
```

### 5. 测试无障碍功能

```bash
# 使用自动化测试
npm run test:accessibility

# 手动测试检查清单
# - 仅使用键盘能否完成所有操作？
# - 屏幕阅读器能否正确读取内容？
# - 颜色对比度是否足够？
# - 动画是否可以禁用？
# - 表单是否有正确的标签？
```

## 🔍 测试工具和资源

### 自动化测试
- **axe-core**：无障碍测试引擎
- **jest-axe**：Jest 的无障碍测试匹配器
- **react-testing-library**：组件无障碍测试

### 浏览器扩展
- **axe DevTools**：Chrome/Firefox 扩展
- **WAVE**：Web 无障碍评估工具
- **Lighthouse**：Chrome 内置的无障碍审计

### 屏幕阅读器测试
- **NVDA**（Windows，免费）
- **JAWS**（Windows，商业）
- **VoiceOver**（macOS/iOS，内置）
- **TalkBack**（Android，内置）

### 颜色对比度工具
- **WebAIM 对比度检查器**
- **Colour Contrast Analyser**
- **Stark**（Figma/Sketch 插件）

## 📚 参考标准

### WCAG 2.1 指南
- **1.1.1** 非文本内容
- **1.3.1** 信息和关系
- **1.4.3** 对比度（最小）
- **2.1.1** 键盘
- **2.1.2** 无键盘陷阱
- **2.4.7** 焦点可见
- **3.1.1** 页面语言
- **3.3.2** 标签或说明
- **4.1.2** 名称、角色、值

### 相关法规
- **ADA**（美国残疾人法案）
- **Section 508**（美国联邦法规）
- **EN 301 549**（欧洲标准）
- **AODA**（安大略省无障碍法案）

## 🚀 持续改进

无障碍是一个持续的过程，我们定期：

1. **用户测试**：与使用辅助技术的用户进行测试
2. **自动化监控**：持续运行无障碍测试
3. **团队培训**：保持团队的无障碍意识
4. **标准更新**：跟进最新的无障碍标准
5. **反馈收集**：收集用户关于无障碍的反馈

---

如需无障碍支持或有任何建议，请联系我们的无障碍团队。