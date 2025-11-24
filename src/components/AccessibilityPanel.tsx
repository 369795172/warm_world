// Accessibility control panel component
// Provides user-friendly controls for accessibility features

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Eye, 
  Volume2, 
  Keyboard, 
  Zap, 
  Palette,
  Settings,
  X,
  Check,
  Info
} from 'lucide-react'
import { 
  accessibilityManager, 
  getAccessibilityPreferences,
  shouldReduceMotion,
  type AccessibilityPreferences
} from '../utils/accessibilityManager'
import { performanceMonitor } from '../utils/performanceMonitor'
import { COMPONENT_VARIANTS, REDUCED_MOTION_VARIANTS, ANIMATION_EASING } from '../config/animationConfig'

interface AccessibilityPanelProps {
  isOpen: boolean
  onClose: () => void
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left'
  onPreferenceChange?: (preferences: AccessibilityPreferences) => void
}

interface AccessibilityToggleProps {
  icon: React.ElementType
  label: string
  description: string
  checked: boolean
  onChange: () => void
  disabled?: boolean
  reducedMotion?: boolean
}

const AccessibilityToggle: React.FC<AccessibilityToggleProps> = ({ 
  icon: Icon, 
  label, 
  description, 
  checked, 
  onChange, 
  disabled = false,
  reducedMotion = false
}) => {
  const variants = reducedMotion ? REDUCED_MOTION_VARIANTS.uiElement : COMPONENT_VARIANTS.uiElement

  return (
    <motion.div 
      className={`flex items-center justify-between p-4 rounded-lg border-2 transition-all ${
        checked 
          ? 'border-blue-500 bg-blue-50' 
          : 'border-gray-200 bg-white hover:border-gray-300'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
      onClick={disabled ? undefined : onChange}
      variants={variants as any}
      initial="initial"
      animate="animate"
      exit="exit"
      whileHover={disabled ? undefined : { scale: 1.02 }}
      whileTap={disabled ? undefined : { scale: 0.98 }}
    >
      <div className="flex items-center space-x-3">
        <div className={`p-2 rounded-full ${
          checked ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600'
        }`}>
          <Icon className="w-5 h-5" />
        </div>
        <div className="flex-1">
          <h3 className="font-medium text-gray-900">{label}</h3>
          <p className="text-sm text-gray-600">{description}</p>
        </div>
      </div>
      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
        checked 
          ? 'border-blue-500 bg-blue-500' 
          : 'border-gray-300 bg-white'
      }`}>
        {checked && <Check className="w-4 h-4 text-white" />}
      </div>
    </motion.div>
  )
}

const AccessibilityPanel: React.FC<AccessibilityPanelProps> = ({ 
  isOpen, 
  onClose, 
  position = 'top-right' 
}) => {
  const [preferences, setPreferences] = useState(getAccessibilityPreferences())
  const [performanceGrade, setPerformanceGrade] = useState(performanceMonitor.getPerformanceGrade())
  const reducedMotion = shouldReduceMotion()

  useEffect(() => {
    // Subscribe to preference changes
    const unsubscribe = accessibilityManager.onPreferencesChange((prefs) => {
      setPreferences(prefs)
    })

    // Subscribe to performance changes
    const unsubscribePerformance = performanceMonitor.onPerformanceDegradation((grade) => {
      setPerformanceGrade(grade)
    })

    return () => {
      unsubscribe()
      unsubscribePerformance()
    }
  }, [])

  const positionClasses = {
    'top-right': 'top-4 right-4',
    'top-left': 'top-4 left-4',
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4'
  }

  const handleToggleReducedMotion = () => {
    accessibilityManager.toggleReducedMotion()
  }

  const handleToggleHighContrast = () => {
    accessibilityManager.toggleHighContrast()
  }

  const handleToggleLargeText = () => {
    const newLargeText = !preferences.largeText
    accessibilityManager.updatePreferences({ largeText: newLargeText })
  }

  const handleColorBlindModeChange = (mode: 'none' | 'protanopia' | 'deuteranopia' | 'tritanopia') => {
    accessibilityManager.setColorBlindMode(mode)
  }

  const getPerformanceColor = () => {
    switch (performanceGrade) {
      case 'excellent': return 'text-green-600'
      case 'good': return 'text-blue-600'
      case 'fair': return 'text-yellow-600'
      case 'poor': return 'text-red-600'
    }
  }

  const getPerformanceIcon = () => {
    switch (performanceGrade) {
      case 'excellent': return '🚀'
      case 'good': return '✅'
      case 'fair': return '⚠️'
      case 'poor': return '❌'
    }
  }

  const panelVariants = reducedMotion ? REDUCED_MOTION_VARIANTS.uiElement : {
    initial: { opacity: 0, scale: 0.9, y: -20 },
    animate: { 
      opacity: 1, 
      scale: 1, 
      y: 0,
      transition: {
        duration: 0.3,
        ease: ANIMATION_EASING.easeOut
      }
    },
    exit: { 
      opacity: 0, 
      scale: 0.9,
      y: -20,
      transition: {
        duration: 0.2,
        ease: ANIMATION_EASING.easeIn
      }
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            className={`fixed z-50 w-96 max-w-full bg-white rounded-xl shadow-2xl border border-gray-200 ${positionClasses[position]}`}
            variants={panelVariants as any}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Eye className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">辅助功能设置</h2>
                  <p className="text-sm text-gray-600">个性化您的体验</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
              {/* Performance Status */}
              <div className={`p-4 rounded-lg border-2 ${getPerformanceColor().replace('text-', 'border-')} bg-opacity-10`}>
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{getPerformanceIcon()}</span>
                  <div>
                    <h3 className="font-medium text-gray-900">性能状态</h3>
                    <p className={`text-sm ${getPerformanceColor()}`}>
                      当前性能: {performanceGrade === 'excellent' ? '优秀' : 
                                performanceGrade === 'good' ? '良好' : 
                                performanceGrade === 'fair' ? '一般' : '需要优化'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Motion & Animation */}
              <div className="space-y-4">
                <h3 className="font-medium text-gray-900 flex items-center space-x-2">
                  <Zap className="w-5 h-5" />
                  <span>动画与动效</span>
                </h3>
                
                <AccessibilityToggle
                  icon={Zap}
                  label="简化动画"
                  description="减少动画效果，适合对运动敏感的用户"
                  checked={preferences.reducedAnimationEnabled || preferences.reducedMotion}
                  onChange={handleToggleReducedMotion}
                  reducedMotion={reducedMotion}
                />

                <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-start space-x-2">
                    <Info className="w-4 h-4 text-blue-600 mt-0.5" />
                    <p className="text-sm text-blue-800">
                      系统检测到{preferences.reducedMotion ? '已开启' : '未开启'}减少运动设置
                    </p>
                  </div>
                </div>
              </div>

              {/* Visual & Display */}
              <div className="space-y-4">
                <h3 className="font-medium text-gray-900 flex items-center space-x-2">
                  <Eye className="w-5 h-5" />
                  <span>视觉显示</span>
                </h3>

                <AccessibilityToggle
                  icon={Eye}
                  label="高对比度"
                  description="增强颜色对比度，提高可读性"
                  checked={preferences.highContrast}
                  onChange={handleToggleHighContrast}
                  reducedMotion={reducedMotion}
                />

                <AccessibilityToggle
                  icon={Settings}
                  label="大字体"
                  description="放大文字大小，便于阅读"
                  checked={preferences.largeText}
                  onChange={handleToggleLargeText}
                  reducedMotion={reducedMotion}
                />
              </div>

              {/* Color Blind Support */}
              <div className="space-y-4">
                <h3 className="font-medium text-gray-900 flex items-center space-x-2">
                  <Palette className="w-5 h-5" />
                  <span>色盲支持</span>
                </h3>

                <div className="grid grid-cols-2 gap-2">
                  {[
                    { value: 'none', label: '无' },
                    { value: 'protanopia', label: '红色盲' },
                    { value: 'deuteranopia', label: '绿色盲' },
                    { value: 'tritanopia', label: '蓝色盲' }
                  ].map((option) => (
                    <button
                      key={option.value}
                      onClick={() => handleColorBlindModeChange(option.value as 'none' | 'protanopia' | 'deuteranopia' | 'tritanopia')}
                      className={`p-3 rounded-lg border-2 text-sm font-medium transition-all ${
                        preferences.colorBlindMode === option.value
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Audio & Navigation */}
              <div className="space-y-4">
                <h3 className="font-medium text-gray-900 flex items-center space-x-2">
                  <Volume2 className="w-5 h-5" />
                  <span>音频与导航</span>
                </h3>

                <AccessibilityToggle
                  icon={Keyboard}
                  label="键盘导航"
                  description="优化键盘操作体验"
                  checked={preferences.keyboardNavigation}
                  onChange={() => {}}
                  disabled={true}
                  reducedMotion={reducedMotion}
                />

                <AccessibilityToggle
                  icon={Volume2}
                  label="语音反馈"
                  description="提供语音操作提示"
                  checked={preferences.voiceOverEnabled}
                  onChange={() => {}}
                  disabled={true}
                  reducedMotion={reducedMotion}
                />
              </div>

              {/* Keyboard Shortcuts */}
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <h4 className="font-medium text-gray-900 mb-2">键盘快捷键</h4>
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex justify-between">
                    <span>放大文字</span>
                    <kbd className="px-2 py-1 bg-white border border-gray-300 rounded text-xs">Ctrl + +</kbd>
                  </div>
                  <div className="flex justify-between">
                    <span>缩小文字</span>
                    <kbd className="px-2 py-1 bg-white border border-gray-300 rounded text-xs">Ctrl + -</kbd>
                  </div>
                  <div className="flex justify-between">
                    <span>重置文字</span>
                    <kbd className="px-2 py-1 bg-white border border-gray-300 rounded text-xs">Ctrl + 0</kbd>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-gray-200 bg-gray-50 rounded-b-xl">
              <div className="flex items-center justify-between">
                <button
                  onClick={() => {
                    accessibilityManager.updatePreferences({
                      reducedMotion: false,
                      highContrast: false,
                      reducedAnimationEnabled: false,
                      largeText: false,
                      colorBlindMode: 'none'
                    })
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 transition-colors"
                >
                  重置设置
                </button>
                <button
                  onClick={onClose}
                  className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
                >
                  完成
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

export default AccessibilityPanel