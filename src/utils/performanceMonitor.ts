// Advanced performance monitoring system with automatic fallback
// Implements UI motion plan requirements for 55+ FPS target and automatic degradation

import { ANIMATION_TIMING, PERFORMANCE_THRESHOLDS } from '../config/animationConfig'

export interface PerformanceMetrics {
  fps: number
  frameTime: number
  memoryUsage: number
  renderTime: number
  animationCount: number
  droppedFrames: number
  totalFrames: number
  timestamp: number
}

export interface PerformanceThresholds {
  excellent: { fps: number; frameTime: number }
  good: { fps: number; frameTime: number }
  fair: { fps: number; frameTime: number }
  poor: { fps: number; frameTime: number }
}

export type PerformanceGrade = 'excellent' | 'good' | 'fair' | 'poor'

export interface AnimationOptimizationConfig {
  enabled: boolean
  durationMultiplier: number
  easing: string
  effectsEnabled: boolean
  particleEffects: boolean
  maxAnimations: number
}

export interface PerformanceMonitorConfig {
  targetFPS: number
  sampleInterval: number // milliseconds
  memoryThreshold: number // MB
  enableAutoDegradation: boolean
  enableLogging: boolean
  enableNotifications: boolean
}

class PerformanceMonitor {
  private metrics: PerformanceMetrics
  private config: PerformanceMonitorConfig
  private isMonitoring = false
  private frameCount = 0
  private lastFrameTime = 0
  private droppedFrames = 0
  private rafId: number | null = null
  private sampleIntervalId: number | null = null
  private callbacks: Set<(metrics: PerformanceMetrics) => void> = new Set()
  private degradationCallbacks: Set<(grade: PerformanceGrade) => void> = new Set()
  private currentGrade: PerformanceGrade = 'excellent'
  private lastGrade: PerformanceGrade = 'excellent'
  private optimizationConfig: AnimationOptimizationConfig
  private performanceHistory: PerformanceMetrics[] = []
  private maxHistoryLength = 60 // Keep last 60 samples

  constructor(config: Partial<PerformanceMonitorConfig> = {}) {
    this.config = {
      targetFPS: 55, // UI motion plan requirement
      sampleInterval: 1000, // 1 second samples
      memoryThreshold: 100, // 100MB threshold
      enableAutoDegradation: true,
      enableLogging: true,
      enableNotifications: true,
      ...config
    }

    this.metrics = {
      fps: 60,
      frameTime: 16.67,
      memoryUsage: 0,
      renderTime: 0,
      animationCount: 0,
      droppedFrames: 0,
      totalFrames: 0,
      timestamp: Date.now()
    }

    this.optimizationConfig = {
      enabled: true,
      durationMultiplier: 1,
      easing: 'cubic-bezier(0, 0, 0.2, 1)',
      effectsEnabled: true,
      particleEffects: true,
      maxAnimations: 10
    }
  }

  // Start performance monitoring
  startMonitoring(): void {
    if (this.isMonitoring) return

    this.isMonitoring = true
    this.lastFrameTime = performance.now()
    
    // Start frame monitoring
    this.startFrameMonitoring()
    
    // Start periodic sampling
    this.startPeriodicSampling()

    if (this.config.enableLogging) {
      console.log('🎯 Performance monitoring started - targeting 55+ FPS')
    }
  }

  // Stop performance monitoring
  stopMonitoring(): void {
    this.isMonitoring = false

    // Stop frame monitoring
    if (this.rafId) {
      cancelAnimationFrame(this.rafId)
      this.rafId = null
    }

    // Stop periodic sampling
    if (this.sampleIntervalId) {
      clearInterval(this.sampleIntervalId)
      this.sampleIntervalId = null
    }

    if (this.config.enableLogging) {
      console.log('⏹️ Performance monitoring stopped')
    }
  }

  // Start frame-by-frame monitoring
  private startFrameMonitoring(): void {
    const measureFrame = (currentTime: number) => {
      if (!this.isMonitoring) return

      const deltaTime = currentTime - this.lastFrameTime
      this.frameCount++
      this.metrics.totalFrames++

      // Check for dropped frames (frame time > 16.67ms for 60 FPS)
      if (deltaTime > 16.67) {
        this.droppedFrames++
        this.metrics.droppedFrames++
      }

      // Update metrics every 60 frames (approximately 1 second at 60 FPS)
      if (this.frameCount >= 60) {
        this.metrics.fps = Math.round(1000 / (deltaTime / this.frameCount))
        this.metrics.frameTime = deltaTime / this.frameCount
        this.frameCount = 0

        // Check for performance degradation
        this.checkPerformanceGrade()
      }

      this.lastFrameTime = currentTime
      this.rafId = requestAnimationFrame(measureFrame)
    }

    this.rafId = requestAnimationFrame(measureFrame)
  }

  // Start periodic sampling for memory and other metrics
  private startPeriodicSampling(): void {
    this.sampleIntervalId = window.setInterval(() => {
      this.sampleMetrics()
    }, this.config.sampleInterval)
  }

  // Sample current performance metrics
  private sampleMetrics(): void {
    // Measure memory usage
    if ('memory' in performance) {
      // @ts-ignore
      this.metrics.memoryUsage = performance.memory.usedJSHeapSize / 1024 / 1024 // MB
      
      // Check memory threshold
      if (this.metrics.memoryUsage > this.config.memoryThreshold) {
        this.handleMemoryWarning()
      }
    }

    // Measure render time (simplified)
    const startTime = performance.now()
    // This would be more sophisticated in a real implementation
    this.metrics.renderTime = performance.now() - startTime

    this.metrics.timestamp = Date.now()
    this.metrics.animationCount = this.getActiveAnimationCount()

    // Store in history
    this.performanceHistory.push({ ...this.metrics })
    if (this.performanceHistory.length > this.maxHistoryLength) {
      this.performanceHistory.shift()
    }

    // Notify callbacks
    this.notifyCallbacks()
  }

  // Check and update performance grade
  private checkPerformanceGrade(): void {
    const { fps, frameTime } = this.metrics
    let newGrade: PerformanceGrade

    if (fps >= PERFORMANCE_THRESHOLDS.excellent.fps && frameTime <= PERFORMANCE_THRESHOLDS.excellent.frameTime) {
      newGrade = 'excellent'
    } else if (fps >= PERFORMANCE_THRESHOLDS.good.fps && frameTime <= PERFORMANCE_THRESHOLDS.good.frameTime) {
      newGrade = 'good'
    } else if (fps >= PERFORMANCE_THRESHOLDS.fair.fps && frameTime <= PERFORMANCE_THRESHOLDS.fair.frameTime) {
      newGrade = 'fair'
    } else {
      newGrade = 'poor'
    }

    if (newGrade !== this.currentGrade) {
      this.lastGrade = this.currentGrade
      this.currentGrade = newGrade
      this.handlePerformanceGradeChange()
    }
  }

  // Handle performance grade changes
  private handlePerformanceGradeChange(): void {
    if (this.config.enableLogging) {
      console.log(`📊 Performance grade changed: ${this.lastGrade} → ${this.currentGrade}`)
    }

    // Apply automatic degradation if enabled
    if (this.config.enableAutoDegradation) {
      this.applyPerformanceOptimization()
    }

    // Notify degradation callbacks
    this.notifyDegradationCallbacks()
  }

  // Apply performance optimization based on current grade
  private applyPerformanceOptimization(): void {
    switch (this.currentGrade) {
      case 'excellent':
        this.optimizationConfig = {
          enabled: true,
          durationMultiplier: 1,
          easing: 'cubic-bezier(0, 0, 0.2, 1)',
          effectsEnabled: true,
          particleEffects: true,
          maxAnimations: 10
        }
        break

      case 'good':
        this.optimizationConfig = {
          enabled: true,
          durationMultiplier: 0.9,
          easing: 'cubic-bezier(0, 0, 0.2, 1)',
          effectsEnabled: true,
          particleEffects: true,
          maxAnimations: 8
        }
        break

      case 'fair':
        this.optimizationConfig = {
          enabled: true,
          durationMultiplier: 0.7,
          easing: 'ease-out',
          effectsEnabled: true,
          particleEffects: false,
          maxAnimations: 5
        }
        break

      case 'poor':
        this.optimizationConfig = {
          enabled: true,
          durationMultiplier: 0.5,
          easing: 'linear',
          effectsEnabled: false,
          particleEffects: false,
          maxAnimations: 3
        }
        break
    }

    if (this.config.enableLogging) {
      console.log(`⚙️ Applied optimization config for ${this.currentGrade} performance`)
    }
  }

  // Handle memory warnings
  private handleMemoryWarning(): void {
    if (this.config.enableLogging) {
      console.warn(`⚠️ Memory usage warning: ${this.metrics.memoryUsage.toFixed(2)} MB`)
    }

    // Reduce animation complexity when memory is high
    if (this.optimizationConfig.particleEffects) {
      this.optimizationConfig.particleEffects = false
      this.optimizationConfig.maxAnimations = Math.max(3, this.optimizationConfig.maxAnimations - 2)
    }
  }

  // Get active animation count (simplified implementation)
  private getActiveAnimationCount(): number {
    // This would be more sophisticated in a real implementation
    return document.querySelectorAll('[data-animating="true"]').length
  }

  // Subscribe to performance updates
  onPerformanceUpdate(callback: (metrics: PerformanceMetrics) => void): () => void {
    this.callbacks.add(callback)
    return () => this.callbacks.delete(callback)
  }

  // Subscribe to degradation updates
  onPerformanceDegradation(callback: (grade: PerformanceGrade) => void): () => void {
    this.degradationCallbacks.add(callback)
    return () => this.degradationCallbacks.delete(callback)
  }

  // Notify all callbacks
  private notifyCallbacks(): void {
    this.callbacks.forEach(callback => callback(this.metrics))
  }

  // Notify degradation callbacks
  private notifyDegradationCallbacks(): void {
    this.degradationCallbacks.forEach(callback => callback(this.currentGrade))
  }

  // Get current metrics
  getMetrics(): PerformanceMetrics {
    return { ...this.metrics }
  }

  // Get current FPS
  getCurrentFPS(): number {
    return this.metrics.fps
  }

  // Check if monitoring is active
  getMonitoringStatus(): boolean {
    return this.isMonitoring
  }

  // Get current performance grade
  getPerformanceGrade(): PerformanceGrade {
    return this.currentGrade
  }

  // Get optimization config
  getOptimizationConfig(): AnimationOptimizationConfig {
    return { ...this.optimizationConfig }
  }

  // Get performance history
  getPerformanceHistory(): PerformanceMetrics[] {
    return [...this.performanceHistory]
  }

  // Check if performance is good
  isPerformanceGood(): boolean {
    return this.currentGrade === 'excellent' || this.currentGrade === 'good'
  }

  // Check if animations should be enabled
  shouldEnableAnimations(): boolean {
    return this.optimizationConfig.enabled && this.optimizationConfig.effectsEnabled
  }

  // Get animation duration with optimization
  getOptimizedDuration(baseDuration: number): number {
    return baseDuration * this.optimizationConfig.durationMultiplier
  }

  // Get optimized easing
  getOptimizedEasing(): string {
    return this.optimizationConfig.easing
  }

  // Manually set performance grade (for testing)
  setPerformanceGrade(grade: PerformanceGrade): void {
    this.lastGrade = this.currentGrade
    this.currentGrade = grade
    this.handlePerformanceGradeChange()
  }

  // Update configuration
  updateConfig(config: Partial<PerformanceMonitorConfig>): void {
    this.config = { ...this.config, ...config }
  }

  // Set performance target
  setTarget(target: 'performance' | 'quality' | 'balanced'): void {
    switch (target) {
      case 'performance':
        this.updateConfig({
          targetFPS: 60,
          enableAutoDegradation: true,
          enableLogging: false
        })
        break
      case 'quality':
        this.updateConfig({
          targetFPS: 30,
          enableAutoDegradation: false,
          enableLogging: true
        })
        break
      case 'balanced':
        this.updateConfig({
          targetFPS: 45,
          enableAutoDegradation: true,
          enableLogging: true
        })
        break
    }
  }

  // Get performance report
  getPerformanceReport(): string {
    const history = this.getPerformanceHistory()
    const avgFPS = history.reduce((sum, m) => sum + m.fps, 0) / history.length
    const avgMemory = history.reduce((sum, m) => sum + m.memoryUsage, 0) / history.length
    const droppedFrameRate = this.metrics.totalFrames > 0 ? 
      (this.metrics.droppedFrames / this.metrics.totalFrames) * 100 : 0

    return `
📊 Performance Report
===================
Current Grade: ${this.currentGrade.toUpperCase()}
Current FPS: ${this.metrics.fps}
Average FPS: ${avgFPS.toFixed(1)}
Frame Time: ${this.metrics.frameTime.toFixed(2)}ms
Memory Usage: ${this.metrics.memoryUsage.toFixed(2)} MB
Dropped Frames: ${droppedFrameRate.toFixed(1)}%
Active Animations: ${this.metrics.animationCount}
Optimization: ${this.optimizationConfig.enabled ? 'ON' : 'OFF'}
Effects: ${this.optimizationConfig.effectsEnabled ? 'ON' : 'OFF'}
Particles: ${this.optimizationConfig.particleEffects ? 'ON' : 'OFF'}
    `.trim()
  }
}

// Create singleton instance with default config
export const performanceMonitor = new PerformanceMonitor()

// Performance optimization utilities
export const getOptimizedAnimationConfig = (baseDuration: number, baseEasing: string) => {
  return {
    duration: performanceMonitor.getOptimizedDuration(baseDuration),
    easing: performanceMonitor.getOptimizedEasing()
  }
}

export const shouldUseReducedMotion = (): boolean => {
  return !performanceMonitor.shouldEnableAnimations() || 
         (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches)
}

export const getPerformanceGrade = (): PerformanceGrade => {
  return performanceMonitor.getPerformanceGrade()
}

export default performanceMonitor