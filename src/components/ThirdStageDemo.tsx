import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAnimationConfig } from '../hooks/useAnimationConfig'
import PerformanceTestRunner from './PerformanceTestRunner'
import AccessibilityPanel from './AccessibilityPanel'
import { performanceMonitor } from '../utils/performanceMonitor'
import { accessibilityManager } from '../utils/accessibilityManager'
import { assetManager } from '../utils/assetManager'
import { 
  Settings, 
  BarChart3, 
  Accessibility, 
  Zap, 
  MemoryStick,
  Palette,
  Eye,
  EyeOff,
  Play,
  Pause,
  RotateCcw,
  ArrowLeft
} from 'lucide-react'

interface ThirdStageDemoProps {
  className?: string
  onBack?: () => void
}

const ThirdStageDemo: React.FC<ThirdStageDemoProps> = ({ className = '', onBack }) => {
  const [showAccessibilityPanel, setShowAccessibilityPanel] = useState(false)
  const [performanceGrade, setPerformanceGrade] = useState(performanceMonitor.getPerformanceGrade())
  const [fps, setFps] = useState(0)
  const [memoryUsage, setMemoryUsage] = useState(0)
  const [animationsEnabled, setAnimationsEnabled] = useState(true)
  const [demoElements, setDemoElements] = useState<number[]>([1, 2, 3, 4, 5])
  const [isAnimating, setIsAnimating] = useState(false)

  const { getAnimationVariants, getTransitionConfig } = useAnimationConfig()

  // Monitor real-time performance
  useEffect(() => {
    const updateMetrics = () => {
      setPerformanceGrade(performanceMonitor.getPerformanceGrade())
      setFps(performanceMonitor.getCurrentFPS())
      
      if ('memory' in performance) {
        setMemoryUsage((performance as any).memory.usedJSHeapSize / 1024 / 1024)
      }
    }

    const interval = setInterval(updateMetrics, 1000)
    return () => clearInterval(interval)
  }, [])

  // Handle accessibility preferences
  useEffect(() => {
    const preferences = accessibilityManager.getPreferences()
    setAnimationsEnabled(!preferences.reducedMotion)
  }, [])

  const handleAccessibilityChange = () => {
    const preferences = accessibilityManager.getPreferences()
    setAnimationsEnabled(!preferences.reducedMotion)
  }

  // Demo animation functions
  const startComplexAnimation = () => {
    setIsAnimating(true)
    
    // Simulate complex animation sequence
    setTimeout(() => {
      setIsAnimating(false)
    }, 3000)
  }

  const addDemoElements = () => {
    setDemoElements(prev => [...prev, prev.length + 1])
  }

  const removeDemoElements = () => {
    setDemoElements(prev => prev.slice(0, Math.max(1, prev.length - 1)))
  }

  const resetDemo = () => {
    setDemoElements([1, 2, 3, 4, 5])
    setIsAnimating(false)
  }

  // Performance grade styling
  const getPerformanceStyle = () => {
    switch (performanceGrade) {
      case 'excellent':
        return 'text-green-600 bg-green-50 border-green-200'
      case 'good':
        return 'text-blue-600 bg-blue-50 border-blue-200'
      case 'fair':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      case 'poor':
        return 'text-red-600 bg-red-50 border-red-200'
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  const getFpsColor = () => {
    if (fps >= 55) return 'text-green-600'
    if (fps >= 30) return 'text-yellow-600'
    return 'text-red-600'
  }

  const containerVariants = getAnimationVariants('container', 'gentle')
  const itemVariants = getAnimationVariants('item', 'gentle')

  return (
    <div className={`min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-6 ${className}`}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-between mb-4">
            {onBack && (
              <button
                onClick={onBack}
                className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>返回</span>
              </button>
            )}
            <div className="flex-1" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            第三阶段：性能优化与可访问性
          </h1>
          <p className="text-lg text-gray-600">
            实时性能监控、自动降级、可访问性支持与资源优化演示
          </p>
        </motion.div>

        {/* Control Panel */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 mb-8"
        >
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center space-x-2">
            <Settings className="w-5 h-5" />
            <span>控制面板</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {/* Performance Grade */}
            <div className={`rounded-lg border p-4 ${getPerformanceStyle()}`}>
              <div className="flex items-center space-x-2 mb-2">
                <Zap className="w-4 h-4" />
                <span className="font-medium">性能等级</span>
              </div>
              <div className="text-2xl font-bold">
                {performanceGrade.toUpperCase()}
              </div>
            </div>

            {/* FPS Monitor */}
            <div className="bg-gray-50 rounded-lg border border-gray-200 p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Play className="w-4 h-4" />
                <span className="font-medium">实时 FPS</span>
              </div>
              <div className={`text-2xl font-bold ${getFpsColor()}`}>
                {fps.toFixed(1)}
              </div>
            </div>

            {/* Memory Usage */}
            <div className="bg-purple-50 rounded-lg border border-purple-200 p-4">
              <div className="flex items-center space-x-2 mb-2">
                <MemoryStick className="w-4 h-4 text-purple-600" />
                <span className="font-medium text-purple-900">内存使用</span>
              </div>
              <div className="text-2xl font-bold text-purple-600">
                {memoryUsage.toFixed(1)} MB
              </div>
            </div>

            {/* Animation Status */}
            <div className={`rounded-lg border p-4 ${
              animationsEnabled ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
            }`}>
              <div className="flex items-center space-x-2 mb-2">
                {animationsEnabled ? 
                  <Play className="w-4 h-4 text-green-600" /> : 
                  <Pause className="w-4 h-4 text-red-600" />
                }
                <span className="font-medium">动画状态</span>
              </div>
              <div className={`text-sm font-medium ${
                animationsEnabled ? 'text-green-600' : 'text-red-600'
              }`}>
                {animationsEnabled ? '已启用' : '已禁用'}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3">
            <button
              onClick={startComplexAnimation}
              disabled={!animationsEnabled || isAnimating}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              <Play className="w-4 h-4" />
              <span>开始复杂动画</span>
            </button>

            <button
              onClick={addDemoElements}
              className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <span>添加元素</span>
            </button>

            <button
              onClick={removeDemoElements}
              className="flex items-center space-x-2 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
            >
              <span>移除元素</span>
            </button>

            <button
              onClick={resetDemo}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              <span>重置演示</span>
            </button>

            <button
              onClick={() => setShowAccessibilityPanel(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              <Accessibility className="w-4 h-4" />
              <span>可访问性设置</span>
            </button>
          </div>
        </motion.div>

        {/* Demo Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Animated Elements Demo */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl shadow-lg border border-gray-200 p-6"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
              <Palette className="w-5 h-5" />
              <span>动画元素演示</span>
            </h3>

            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-2 gap-4"
            >
              {demoElements.map((item, index) => (
                <motion.div
                  key={item}
                  variants={itemVariants}
                  custom={index}
                  animate={isAnimating ? {
                    scale: [1, 1.2, 0.8, 1],
                    rotate: [0, 180, 360],
                    borderRadius: ['8px', '50%', '8px']
                  } : {}}
                  transition={getTransitionConfig('interaction')}
                  className="h-24 bg-gradient-to-br from-blue-400 to-purple-500 rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-lg"
                >
                  {item}
                </motion.div>
              ))}
            </motion.div>

            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">当前配置</h4>
              <div className="space-y-1 text-sm text-gray-600">
                <div>性能等级: {performanceGrade}</div>
                <div>动画启用: {animationsEnabled ? '是' : '否'}</div>
                <div>元素数量: {demoElements.length}</div>
              </div>
            </div>
          </motion.div>

          {/* Performance Test Runner */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden"
          >
            <PerformanceTestRunner 
              onTestComplete={(results) => {
                console.log('Performance tests completed:', results)
              }}
            />
          </motion.div>
        </div>

        {/* Feature Showcase */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-8 bg-white rounded-xl shadow-lg border border-gray-200 p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center space-x-2">
            <BarChart3 className="w-5 h-5" />
            <span>第三阶段核心功能</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Performance Monitoring */}
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center space-x-2 mb-3">
                <Zap className="w-5 h-5 text-blue-600" />
                <h4 className="font-medium text-blue-900">性能监控</h4>
              </div>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• 实时FPS监控</li>
                <li>• 自动性能分级</li>
                <li>• 智能降级策略</li>
                <li>• 55+ FPS目标</li>
              </ul>
            </div>

            {/* Accessibility */}
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center space-x-2 mb-3">
                <Accessibility className="w-5 h-5 text-green-600" />
                <h4 className="font-medium text-green-900">可访问性</h4>
              </div>
              <ul className="text-sm text-green-800 space-y-1">
                <li>• prefers-reduced-motion</li>
                <li>• 高对比度模式</li>
                <li>• 色盲友好设计</li>
                <li>• WCAG 2.1 AA标准</li>
              </ul>
            </div>

            {/* Resource Optimization */}
            <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
              <div className="flex items-center space-x-2 mb-3">
                <MemoryStick className="w-5 h-5 text-purple-600" />
                <h4 className="font-medium text-purple-900">资源优化</h4>
              </div>
              <ul className="text-sm text-purple-800 space-y-1">
                <li>• 懒加载策略</li>
                <li>• WebP格式支持</li>
                <li>• 内存管理</li>
                <li>• 缓存优化</li>
              </ul>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Accessibility Panel */}
      <AnimatePresence>
        {showAccessibilityPanel && (
          <AccessibilityPanel
            isOpen={showAccessibilityPanel}
            onClose={() => setShowAccessibilityPanel(false)}
            onPreferenceChange={handleAccessibilityChange}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

export default ThirdStageDemo