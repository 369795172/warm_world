import { useState, useEffect, useCallback, useRef } from 'react'
import { performanceMonitor } from '../utils/performanceMonitor'
import { accessibilityManager } from '../utils/accessibilityManager'
import { assetManager } from '../utils/assetManager'
import { AnimationOptimizationConfig, PerformanceGrade } from '../utils/performanceMonitor'
import { AccessibilityPreferences } from '../utils/accessibilityManager'

export interface UseAnimationConfigReturn {
  // Animation configuration
  getAnimationVariants: (type: string, intensity?: 'subtle' | 'gentle' | 'normal' | 'bold') => any
  getTransitionConfig: (type: 'entrance' | 'interaction' | 'complex') => any
  getReducedMotionVariants: () => any
  
  // Performance monitoring
  performanceGrade: PerformanceGrade
  currentFps: number
  memoryUsage: number
  isOptimized: boolean
  
  // Accessibility
  accessibilityPreferences: AccessibilityPreferences
  isReducedMotion: boolean
  isHighContrast: boolean
  colorBlindMode: string
  
  // Asset management
  preloadAsset: (assetId: string) => Promise<void>
  loadAsset: (assetId: string) => Promise<any>
  getAssetUrl: (assetId: string) => string
  
  // Control functions
  setPerformanceTarget: (target: 'performance' | 'quality' | 'balanced') => void
  updateAccessibilityPreferences: (preferences: Partial<AccessibilityPreferences>) => void
  refreshPerformanceGrade: () => void
}

export function useAnimationConfig(): UseAnimationConfigReturn {
  const [performanceGrade, setPerformanceGrade] = useState<PerformanceGrade>(
    performanceMonitor.getPerformanceGrade()
  )
  const [currentFps, setCurrentFps] = useState(0)
  const [memoryUsage, setMemoryUsage] = useState(0)
  const [isOptimized, setIsOptimized] = useState(true)
  const [accessibilityPreferences, setAccessibilityPreferences] = useState<AccessibilityPreferences>(
    accessibilityManager.getPreferences()
  )

  const performanceIntervalRef = useRef<NodeJS.Timeout>()
  const accessibilityUnsubscribeRef = useRef<() => void>()

  // Initialize performance monitoring
  useEffect(() => {
    // Start performance monitoring
    performanceMonitor.startMonitoring()
    
    // Set up performance metrics interval
    performanceIntervalRef.current = setInterval(() => {
      setCurrentFps(performanceMonitor.getCurrentFPS())
      setPerformanceGrade(performanceMonitor.getPerformanceGrade())
      
      const perfWithMemory = performance as Performance & { memory?: { usedJSHeapSize: number } }
      if (perfWithMemory.memory) {
        setMemoryUsage(perfWithMemory.memory.usedJSHeapSize / 1024 / 1024)
      }
      
      // Check if performance is optimized
      const fps = performanceMonitor.getCurrentFPS()
      setIsOptimized(fps >= 55)
    }, 1000)

    // Set up accessibility preference listener
    const handleAccessibilityChange = () => {
      setAccessibilityPreferences(accessibilityManager.getPreferences())
    }
    
    accessibilityUnsubscribeRef.current = accessibilityManager.subscribe(handleAccessibilityChange)

    return () => {
      if (performanceIntervalRef.current) {
        clearInterval(performanceIntervalRef.current)
      }
      if (accessibilityUnsubscribeRef.current) {
        accessibilityUnsubscribeRef.current()
      }
      performanceMonitor.stopMonitoring()
    }
  }, [])

  // Animation variants based on performance and accessibility
  const getAnimationVariants = useCallback((
    type: string, 
    intensity: 'subtle' | 'gentle' | 'normal' | 'bold' = 'normal'
  ) => {
    const optimization = performanceMonitor.getOptimizationConfig()
    const isReducedMotion = accessibilityPreferences.reducedMotion
    
    // Return reduced motion variants if enabled
    if (isReducedMotion) {
      return getReducedMotionVariants()
    }

    // Adjust animation intensity based on performance grade
    let adjustedIntensity = intensity
    if (performanceGrade === 'poor') {
      adjustedIntensity = 'subtle'
    } else if (performanceGrade === 'fair') {
      adjustedIntensity = 'gentle'
    }

    // Base variants with performance-based adjustments
    const baseVariants = {
      container: {
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            staggerChildren: optimization.durationMultiplier * 0.1,
            delayChildren: optimization.durationMultiplier * 0.2
          }
        }
      },
      item: {
        hidden: { opacity: 0, y: 20 * (intensity === 'subtle' ? 0.5 : intensity === 'bold' ? 1.5 : 1) },
        visible: {
          opacity: 1,
          y: 0,
          transition: {
            duration: optimization.durationMultiplier * (intensity === 'subtle' ? 0.3 : intensity === 'bold' ? 0.8 : 0.5),
            ease: optimization.easing
          }
        }
      },
      scale: {
        hidden: { opacity: 0, scale: 0.8 },
        visible: {
          opacity: 1,
          scale: 1,
          transition: {
            duration: optimization.durationMultiplier * 0.4,
            ease: optimization.easing
          }
        }
      },
      slide: {
        hidden: { opacity: 0, x: -20 },
        visible: {
          opacity: 1,
          x: 0,
          transition: {
            duration: optimization.durationMultiplier * 0.5,
            ease: optimization.easing
          }
        }
      },
      fade: {
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            duration: optimization.durationMultiplier * 0.3,
            ease: 'easeInOut'
          }
        }
      }
    }

    return baseVariants[type] || baseVariants.item
  }, [performanceGrade, accessibilityPreferences.reducedMotion])

  const getReducedMotionVariants = useCallback(() => {
    return {
      hidden: { opacity: 0 },
      visible: {
        opacity: 1,
        transition: {
          duration: 0.2,
          ease: 'easeOut'
        }
      }
    }
  }, [])

  const getTransitionConfig = useCallback((type: 'entrance' | 'interaction' | 'complex') => {
    const optimization = performanceMonitor.getOptimizationConfig()
    const isReducedMotion = accessibilityPreferences.reducedMotion
    
    if (isReducedMotion) {
      return {
        duration: 0.2,
        ease: 'easeOut'
      }
    }

    const configs = {
      entrance: {
        duration: optimization.durationMultiplier * 0.5,
        ease: optimization.easing
      },
      interaction: {
        duration: optimization.durationMultiplier * 0.2,
        ease: 'easeOut'
      },
      complex: {
        duration: optimization.durationMultiplier * 0.8,
        ease: optimization.easing,
        staggerChildren: 0.1
      }
    }

    return configs[type]
  }, [performanceGrade, accessibilityPreferences.reducedMotion])

  // Asset management functions
  const preloadAsset = useCallback(async (assetId: string) => {
    return await assetManager.loadAsset(assetId)
  }, [])

  const loadAsset = useCallback(async (assetId: string) => {
    return await assetManager.loadAsset(assetId)
  }, [])

  const getAssetUrl = useCallback((assetId: string) => {
    return assetManager.getAssetUrl(assetId)
  }, [])

  // Control functions
  const setPerformanceTarget = useCallback((target: 'performance' | 'quality' | 'balanced') => {
    performanceMonitor.setTarget(target)
    setPerformanceGrade(performanceMonitor.getPerformanceGrade())
  }, [])

  const updateAccessibilityPreferences = useCallback((preferences: Partial<AccessibilityPreferences>) => {
    accessibilityManager.updatePreferences(preferences)
  }, [])

  const refreshPerformanceGrade = useCallback(() => {
    setPerformanceGrade(performanceMonitor.getPerformanceGrade())
  }, [])

  // Computed properties
  const isReducedMotion = accessibilityPreferences.reducedMotion
  const isHighContrast = accessibilityPreferences.highContrast
  const colorBlindMode = accessibilityPreferences.colorBlindMode

  return {
    // Animation configuration
    getAnimationVariants,
    getTransitionConfig,
    getReducedMotionVariants,
    
    // Performance monitoring
    performanceGrade,
    currentFps,
    memoryUsage,
    isOptimized,
    
    // Accessibility
    accessibilityPreferences,
    isReducedMotion,
    isHighContrast,
    colorBlindMode,
    
    // Asset management
    preloadAsset,
    loadAsset,
    getAssetUrl,
    
    // Control functions
    setPerformanceTarget,
    updateAccessibilityPreferences,
    refreshPerformanceGrade
  }
}

// Convenience hook for component-specific animation optimization
export function useOptimizedAnimation(elementType: string = 'item') {
  const animationConfig = useAnimationConfig()
  
  const getOptimizedVariants = useCallback((customVariants?: any) => {
    const baseVariants = animationConfig.getAnimationVariants(elementType)
    
    if (customVariants) {
      return {
        ...baseVariants,
        ...customVariants,
        visible: {
          ...baseVariants.visible,
          ...customVariants.visible
        }
      }
    }
    
    return baseVariants
  }, [animationConfig, elementType])

  const getOptimizedTransition = useCallback((customTransition?: any) => {
    const baseTransition = animationConfig.getTransitionConfig('interaction')
    
    if (customTransition) {
      return { ...baseTransition, ...customTransition }
    }
    
    return baseTransition
  }, [animationConfig])

  return {
    variants: getOptimizedVariants(),
    transition: getOptimizedTransition(),
    getOptimizedVariants,
    getOptimizedTransition,
    ...animationConfig
  }
}

// Hook for performance-critical animations
export function usePerformanceAnimation() {
  const animationConfig = useAnimationConfig()
  
  const shouldAnimate = useCallback(() => {
    return !animationConfig.isReducedMotion && animationConfig.performanceGrade !== 'poor'
  }, [animationConfig.isReducedMotion, animationConfig.performanceGrade])

  const getPerformanceVariants = useCallback(() => {
    if (!shouldAnimate()) {
      return {
        hidden: { opacity: 0 },
        visible: { opacity: 1 }
      }
    }
    
    return animationConfig.getAnimationVariants('item', 'gentle')
  }, [shouldAnimate, animationConfig])

  return {
    shouldAnimate: shouldAnimate(),
    variants: getPerformanceVariants(),
    transition: animationConfig.getTransitionConfig('interaction'),
    performanceGrade: animationConfig.performanceGrade,
    currentFps: animationConfig.currentFps
  }
}