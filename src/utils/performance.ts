// Performance monitoring and optimization utilities
// Based on UI motion plan requirements for 55+ FPS target

export interface PerformanceMetrics {
  fps: number
  frameTime: number
  memoryUsage: number
  renderTime: number
  animationCount: number
}

export interface AnimationConfig {
  duration: number
  easing: string
  delay?: number
  iterations?: number | 'infinite'
  direction?: 'normal' | 'reverse' | 'alternate'
  fillMode?: 'none' | 'forwards' | 'backwards' | 'both'
  reducedMotionDuration?: number
}

// Animation timing standards from UI motion plan
export const ANIMATION_TIMING = {
  // Entrance animations (200-300ms)
  entrance: {
    fast: 200,
    normal: 250,
    slow: 300
  },
  
  // Interaction feedback (100-150ms)
  interaction: {
    fast: 100,
    normal: 125,
    slow: 150
  },
  
  // Complex animations (500-1000ms)
  complex: {
    fast: 500,
    normal: 750,
    slow: 1000
  },
  
  // Easing functions optimized for 60 FPS
  easing: {
    easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
    easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
    easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    linear: 'linear',
    spring: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)'
  }
} as const

// Performance monitoring class
export class PerformanceMonitor {
  private metrics: PerformanceMetrics = {
    fps: 60,
    frameTime: 16.67,
    memoryUsage: 0,
    renderTime: 0,
    animationCount: 0
  }
  
  private frameCount = 0
  private lastFrameTime = performance.now()
  private rafId: number | null = null
  private isMonitoring = false
  private callbacks: ((metrics: PerformanceMetrics) => void)[] = []

  startMonitoring(): void {
    if (this.isMonitoring) return
    
    this.isMonitoring = true
    this.measurePerformance()
  }

  stopMonitoring(): void {
    this.isMonitoring = false
    if (this.rafId) {
      cancelAnimationFrame(this.rafId)
      this.rafId = null
    }
  }

  onPerformanceUpdate(callback: (metrics: PerformanceMetrics) => void): void {
    this.callbacks.push(callback)
  }

  private measurePerformance(): void {
    if (!this.isMonitoring) return

    const currentTime = performance.now()
    const deltaTime = currentTime - this.lastFrameTime
    
    // Calculate FPS
    this.frameCount++
    if (this.frameCount % 60 === 0) { // Update FPS every 60 frames
      this.metrics.fps = Math.round(1000 / deltaTime)
      this.frameCount = 0
    }
    
    this.metrics.frameTime = deltaTime
    this.lastFrameTime = currentTime

    // Measure memory usage (if available)
    if ('memory' in performance) {
      // @ts-ignore
      this.metrics.memoryUsage = performance.memory.usedJSHeapSize / 1024 / 1024 // MB
    }

    // Notify callbacks
    this.callbacks.forEach(callback => callback(this.metrics))

    this.rafId = requestAnimationFrame(() => this.measurePerformance())
  }

  getMetrics(): PerformanceMetrics {
    return { ...this.metrics }
  }

  // Check if performance is acceptable
  isPerformanceGood(): boolean {
    return this.metrics.fps >= 55 && this.metrics.frameTime <= 20
  }

  // Get performance grade
  getPerformanceGrade(): 'excellent' | 'good' | 'fair' | 'poor' {
    const { fps } = this.metrics
    
    if (fps >= 55) return 'excellent'
    if (fps >= 45) return 'good'
    if (fps >= 30) return 'fair'
    return 'poor'
  }
}

// Animation optimization utilities
export class AnimationOptimizer {
  private static instance: AnimationOptimizer
  private reducedMotion = false
  private performanceMonitor: PerformanceMonitor

  private constructor() {
    this.performanceMonitor = new PerformanceMonitor()
    this.checkReducedMotion()
  }

  static getInstance(): AnimationOptimizer {
    if (!AnimationOptimizer.instance) {
      AnimationOptimizer.instance = new AnimationOptimizer()
    }
    return AnimationOptimizer.instance
  }

  private checkReducedMotion(): void {
    if (typeof window !== 'undefined') {
      const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
      this.reducedMotion = mediaQuery.matches
      
      mediaQuery.addEventListener('change', (e) => {
        this.reducedMotion = e.matches
      })
    }
  }

  // Get optimized animation config
  getAnimationConfig(config: AnimationConfig): AnimationConfig {
    const optimized = { ...config }
    
    // Apply reduced motion if needed
    if (this.reducedMotion) {
      optimized.duration = config.reducedMotionDuration || Math.max(config.duration * 0.5, 100)
      
      // Simplify easing for reduced motion
      if (config.easing.includes('spring') || config.easing.includes('bounce')) {
        optimized.easing = ANIMATION_TIMING.easing.easeOut
      }
    }

    // Adjust based on performance
    const grade = this.performanceMonitor.getPerformanceGrade()
    if (grade === 'poor') {
      optimized.duration = Math.max(config.duration * 0.7, 150)
      // Use simpler easing for poor performance
      if (config.easing.includes('spring') || config.easing.includes('bounce')) {
        optimized.easing = ANIMATION_TIMING.easing.easeOut
      }
    } else if (grade === 'fair') {
      optimized.duration = Math.max(config.duration * 0.85, 200)
    }

    return optimized
  }

  // Optimize Framer Motion variants
  optimizeVariants(variants: any): any {
    const optimized: any = {}
    
    Object.keys(variants).forEach(key => {
      const variant = variants[key]
      
      if (typeof variant === 'object' && variant.transition) {
        optimized[key] = {
          ...variant,
          transition: this.getAnimationConfig(variant.transition)
        }
      } else {
        optimized[key] = variant
      }
    })

    return optimized
  }

  // Batch DOM operations for better performance
  batchDOMOperations(operations: () => void): void {
    if (typeof document !== 'undefined') {
      document.body.style.willChange = 'transform'
      
      requestAnimationFrame(() => {
        operations()
        document.body.style.willChange = 'auto'
      })
    } else {
      operations()
    }
  }

  // Throttle animation frames
  throttleAnimation<T extends (...args: any[]) => void>(
    func: T,
    fps = 30
  ): T {
    let lastCall = 0
    const interval = 1000 / fps

    return ((...args: any[]) => {
      const now = Date.now()
      if (now - lastCall >= interval) {
        lastCall = now
        return func(...args)
      }
    }) as T
  }

  // Optimize image loading
  optimizeImageLoading(images: HTMLImageElement[]): void {
    images.forEach(img => {
      img.loading = 'lazy'
      img.decoding = 'async'
      
      // Use appropriate format
      if (img.src.includes('.jpg') || img.src.includes('.jpeg')) {
        img.srcset = img.src.replace('.jpg', '.webp') + ' 1x, ' + img.src + ' 1x'
      }
    })
  }

  // Check if animations should be enabled
  shouldEnableAnimations(): boolean {
    return !this.reducedMotion && this.performanceMonitor.isPerformanceGood()
  }
}

// Utility functions for common optimizations
export const optimizeAnimation = (config: AnimationConfig): AnimationConfig => {
  return AnimationOptimizer.getInstance().getAnimationConfig(config)
}

export const optimizeVariants = (variants: any): any => {
  return AnimationOptimizer.getInstance().optimizeVariants(variants)
}

export const batchDOMOperations = (operations: () => void): void => {
  AnimationOptimizer.getInstance().batchDOMOperations(operations)
}

export const throttleAnimation = <T extends (...args: any[]) => void>(
  func: T,
  fps = 30
): T => {
  return AnimationOptimizer.getInstance().throttleAnimation(func, fps)
}

export const shouldEnableAnimations = (): boolean => {
  return AnimationOptimizer.getInstance().shouldEnableAnimations()
}

// Create singleton instances
export const performanceMonitor = new PerformanceMonitor()
export const animationOptimizer = AnimationOptimizer.getInstance()

export default {
  performanceMonitor,
  animationOptimizer,
  ANIMATION_TIMING,
  optimizeAnimation,
  optimizeVariants,
  batchDOMOperations,
  throttleAnimation,
  shouldEnableAnimations
}