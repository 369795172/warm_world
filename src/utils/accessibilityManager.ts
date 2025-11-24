// Accessibility manager for enhanced user experience
// Manages prefers-reduced-motion, high contrast mode, and accessibility features

import { performanceMonitor } from './performanceMonitor'

export interface AccessibilityPreferences {
  reducedMotion: boolean
  highContrast: boolean
  reducedAnimationEnabled: boolean
  voiceOverEnabled: boolean
  keyboardNavigation: boolean
  largeText: boolean
  colorBlindMode: 'none' | 'protanopia' | 'deuteranopia' | 'tritanopia'
  focusIndicators: boolean
  touchTargets: boolean
  screenReaderSupport: boolean
  captions: boolean
  audioDescriptions: boolean
}

export interface AccessibilityConfig {
  enableAutoDetection: boolean
  enableUserControls: boolean
  enableNotifications: boolean
  enableLogging: boolean
  defaultPreferences: Partial<AccessibilityPreferences>
}

export interface ColorContrastConfig {
  normalText: string
  largeText: string
  interactiveElements: string
  background: string
  minimumRatio: number
  enhancedRatio: number
}

class AccessibilityManager {
  private preferences: AccessibilityPreferences
  private config: AccessibilityConfig
  private mediaQueryListeners: Map<string, MediaQueryList> = new Map()
  private callbacks: Set<(preferences: AccessibilityPreferences) => void> = new Set()
  private isInitialized = false
  private storageKey = 'accessibility_preferences'

  constructor(config: Partial<AccessibilityConfig> = {}) {
    this.config = {
      enableAutoDetection: true,
      enableUserControls: true,
      enableNotifications: true,
      enableLogging: true,
      defaultPreferences: {
        reducedMotion: false,
        highContrast: false,
        reducedAnimationEnabled: false,
        voiceOverEnabled: false,
        keyboardNavigation: false,
        largeText: false,
        colorBlindMode: 'none'
      },
      ...config
    }

    this.preferences = {
      reducedMotion: false,
      highContrast: false,
      reducedAnimationEnabled: false,
      voiceOverEnabled: false,
      keyboardNavigation: false,
      largeText: false,
      colorBlindMode: 'none',
      focusIndicators: true,
      touchTargets: true,
      screenReaderSupport: false,
      captions: false,
      audioDescriptions: false,
      ...this.config.defaultPreferences
    }
  }

  // Initialize accessibility manager
  initialize(): void {
    if (this.isInitialized) return

    // Load saved preferences
    this.loadPreferences()

    // Setup media query listeners
    if (this.config.enableAutoDetection && typeof window !== 'undefined') {
      this.setupMediaQueryListeners()
    }

    // Setup keyboard navigation
    this.setupKeyboardNavigation()

    // Apply initial preferences
    this.applyPreferences()

    this.isInitialized = true

    if (this.config.enableLogging) {
      console.log('♿ Accessibility manager initialized')
    }
  }

  // Setup media query listeners for automatic detection
  private setupMediaQueryListeners(): void {
    // Reduced motion detection
    const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    this.handleReducedMotionChange(reducedMotionQuery)
    reducedMotionQuery.addEventListener('change', (e: MediaQueryListEvent) => this.handleReducedMotionChange(e as unknown as MediaQueryList))
    this.mediaQueryListeners.set('reducedMotion', reducedMotionQuery)

    // High contrast detection
    const highContrastQuery = window.matchMedia('(prefers-contrast: high)')
    this.handleHighContrastChange(highContrastQuery)
    highContrastQuery.addEventListener('change', (e: MediaQueryListEvent) => this.handleHighContrastChange(e as unknown as MediaQueryList))
    this.mediaQueryListeners.set('highContrast', highContrastQuery)

    // Color scheme detection
    const colorSchemeQuery = window.matchMedia('(prefers-color-scheme: dark)')
    this.handleColorSchemeChange(colorSchemeQuery)
    colorSchemeQuery.addEventListener('change', (e: MediaQueryListEvent) => this.handleColorSchemeChange(e as unknown as MediaQueryList))
    this.mediaQueryListeners.set('colorScheme', colorSchemeQuery)
  }

  // Handle reduced motion media query changes
  private handleReducedMotionChange(query: MediaQueryList): void {
    const prefersReducedMotion = query.matches
    if (prefersReducedMotion !== this.preferences.reducedMotion) {
      this.preferences.reducedMotion = prefersReducedMotion
      this.preferences.reducedAnimationEnabled = prefersReducedMotion
      this.applyPreferences()
      this.notifyCallbacks()

      if (this.config.enableLogging) {
        console.log(`🎬 Reduced motion preference detected: ${prefersReducedMotion ? 'enabled' : 'disabled'}`)
      }
    }
  }

  // Handle high contrast media query changes
  private handleHighContrastChange(query: MediaQueryList): void {
    const highContrast = query.matches
    if (highContrast !== this.preferences.highContrast) {
      this.preferences.highContrast = highContrast
      this.applyPreferences()
      this.notifyCallbacks()

      if (this.config.enableLogging) {
        console.log(`🎨 High contrast preference detected: ${highContrast ? 'enabled' : 'disabled'}`)
      }
    }
  }

  // Handle color scheme changes
  private handleColorSchemeChange(query: MediaQueryList): void {
    const isDarkMode = query.matches
    if (this.config.enableLogging) {
      console.log(`🌙 Color scheme preference detected: ${isDarkMode ? 'dark' : 'light'}`)
    }
  }

  // Setup keyboard navigation
  private setupKeyboardNavigation(): void {
    if (typeof document === 'undefined') return

    document.addEventListener('keydown', (event) => {
      // Tab navigation detection
      if (event.key === 'Tab') {
        this.preferences.keyboardNavigation = true
        this.applyPreferences()
      }

      // Common keyboard shortcuts for accessibility
      if (event.ctrlKey || event.metaKey) {
        switch (event.key) {
          case '=':
          case '+':
            this.increaseTextSize()
            event.preventDefault()
            break
          case '-':
            this.decreaseTextSize()
            event.preventDefault()
            break
          case '0':
            this.resetTextSize()
            event.preventDefault()
            break
        }
      }
    })
  }

  // Apply current preferences to the DOM
  private applyPreferences(): void {
    if (typeof document === 'undefined') return

    const root = document.documentElement

    // Apply reduced motion
    if (this.preferences.reducedMotion || this.preferences.reducedAnimationEnabled) {
      root.classList.add('reduced-motion')
      root.style.setProperty('--animation-duration', '0.1s')
      root.style.setProperty('--animation-easing', 'linear')
      
      // Notify performance monitor
      performanceMonitor.updateConfig({
        enableAutoDegradation: true,
        enableLogging: this.config.enableLogging
      })
    } else {
      root.classList.remove('reduced-motion')
      root.style.removeProperty('--animation-duration')
      root.style.removeProperty('--animation-easing')
    }

    // Apply high contrast mode
    if (this.preferences.highContrast) {
      root.classList.add('high-contrast')
    } else {
      root.classList.remove('high-contrast')
    }

    // Apply large text
    if (this.preferences.largeText) {
      root.classList.add('large-text')
      root.style.setProperty('--font-size-scale', '1.25')
    } else {
      root.classList.remove('large-text')
      root.style.removeProperty('--font-size-scale')
    }

    // Apply color blind mode
    if (this.preferences.colorBlindMode !== 'none') {
      root.classList.add(`color-blind-${this.preferences.colorBlindMode}`)
    } else {
      ['protanopia', 'deuteranopia', 'tritanopia'].forEach(mode => {
        root.classList.remove(`color-blind-${mode}`)
      })
    }

    // Save preferences
    this.savePreferences()
  }

  // Notify all callbacks
  private notifyCallbacks(): void {
    this.callbacks.forEach(callback => callback(this.preferences))
  }

  // Save preferences to localStorage
  private savePreferences(): void {
    if (typeof localStorage === 'undefined') return

    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.preferences))
    } catch (error) {
      if (this.config.enableLogging) {
        console.warn('Failed to save accessibility preferences:', error)
      }
    }
  }

  // Load preferences from localStorage
  private loadPreferences(): void {
    if (typeof localStorage === 'undefined') return

    try {
      const saved = localStorage.getItem(this.storageKey)
      if (saved) {
        const parsed = JSON.parse(saved)
        this.preferences = { ...this.preferences, ...parsed }
      }
    } catch (error) {
      if (this.config.enableLogging) {
        console.warn('Failed to load accessibility preferences:', error)
      }
    }
  }

  // Get current preferences
  getPreferences(): AccessibilityPreferences {
    return { ...this.preferences }
  }

  // Subscribe to preference changes
  subscribe(callback: (preferences: AccessibilityPreferences) => void): () => void {
    this.callbacks.add(callback)
    return () => this.callbacks.delete(callback)
  }

  // Update preferences
  updatePreferences(preferences: Partial<AccessibilityPreferences>): void {
    this.preferences = { ...this.preferences, ...preferences }
    this.applyPreferences()
    this.notifyCallbacks()

    if (this.config.enableLogging) {
      console.log('♿ Accessibility preferences updated:', this.preferences)
    }
  }

  // Toggle reduced motion
  toggleReducedMotion(): boolean {
    this.preferences.reducedAnimationEnabled = !this.preferences.reducedAnimationEnabled
    this.applyPreferences()
    this.notifyCallbacks()

    if (this.config.enableNotifications) {
      this.showNotification(
        this.preferences.reducedAnimationEnabled ? 
        '动画已简化 - 适合敏感用户' : 
        '动画已恢复 - 完整体验'
      )
    }

    return this.preferences.reducedAnimationEnabled
  }

  // Toggle high contrast mode
  toggleHighContrast(): boolean {
    this.preferences.highContrast = !this.preferences.highContrast
    this.applyPreferences()
    this.notifyCallbacks()

    if (this.config.enableNotifications) {
      this.showNotification(
        this.preferences.highContrast ? 
        '高对比度模式已开启' : 
        '高对比度模式已关闭'
      )
    }

    return this.preferences.highContrast
  }

  // Text size controls
  increaseTextSize(): void {
    this.preferences.largeText = true
    this.applyPreferences()
    this.notifyCallbacks()
  }

  decreaseTextSize(): void {
    this.preferences.largeText = false
    this.applyPreferences()
    this.notifyCallbacks()
  }

  resetTextSize(): void {
    this.preferences.largeText = false
    this.applyPreferences()
    this.notifyCallbacks()
  }

  // Color blind mode
  setColorBlindMode(mode: AccessibilityPreferences['colorBlindMode']): void {
    this.preferences.colorBlindMode = mode
    this.applyPreferences()
    this.notifyCallbacks()
  }

  // Subscribe to preference changes
  onPreferencesChange(callback: (preferences: AccessibilityPreferences) => void): () => void {
    this.callbacks.add(callback)
    return () => this.callbacks.delete(callback)
  }

  // Show notification (simplified)
  private showNotification(message: string): void {
    if (typeof document === 'undefined') return

    // Create notification element
    const notification = document.createElement('div')
    notification.className = 'accessibility-notification'
    notification.textContent = message
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #333;
      color: white;
      padding: 12px 16px;
      border-radius: 8px;
      font-size: 14px;
      z-index: 10000;
      opacity: 0;
      transform: translateY(-20px);
      transition: all 0.3s ease;
    `

    document.body.appendChild(notification)

    // Animate in
    requestAnimationFrame(() => {
      notification.style.opacity = '1'
      notification.style.transform = 'translateY(0)'
    })

    // Remove after delay
    setTimeout(() => {
      notification.style.opacity = '0'
      notification.style.transform = 'translateY(-20px)'
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification)
        }
      }, 300)
    }, 3000)
  }

  // Get color contrast configuration
  getColorContrastConfig(): ColorContrastConfig {
    return {
      normalText: this.preferences.highContrast ? '#000000' : '#374151',
      largeText: this.preferences.highContrast ? '#000000' : '#1f2937',
      interactiveElements: this.preferences.highContrast ? '#1d4ed8' : '#3b82f6',
      background: this.preferences.highContrast ? '#ffffff' : '#f9fafb',
      minimumRatio: this.preferences.highContrast ? 7 : 4.5,
      enhancedRatio: this.preferences.highContrast ? 10 : 7
    }
  }

  // Check if animations should be reduced
  shouldReduceMotion(): boolean {
    return this.preferences.reducedMotion || 
           this.preferences.reducedAnimationEnabled ||
           !performanceMonitor.shouldEnableAnimations()
  }

  // Get accessibility report
  getAccessibilityReport(): string {
    const prefs = this.getPreferences()
    return `
♿ Accessibility Report
====================
Reduced Motion: ${prefs.reducedMotion ? 'System' : 'User'} ${prefs.reducedAnimationEnabled ? 'ON' : 'OFF'}
High Contrast: ${prefs.highContrast ? 'ON' : 'OFF'}
Large Text: ${prefs.largeText ? 'ON' : 'OFF'}
Color Blind Mode: ${prefs.colorBlindMode.toUpperCase()}
Keyboard Navigation: ${prefs.keyboardNavigation ? 'ACTIVE' : 'INACTIVE'}
VoiceOver: ${prefs.voiceOverEnabled ? 'ENABLED' : 'DISABLED'}
    `.trim()
  }

  // Destroy and cleanup
  destroy(): void {
    // Remove media query listeners
    this.mediaQueryListeners.forEach((query, key) => {
      query.removeEventListener('change', this.handleReducedMotionChange as any)
    })
    this.mediaQueryListeners.clear()

    // Remove CSS classes
    if (typeof document !== 'undefined') {
      const root = document.documentElement
      root.classList.remove('reduced-motion', 'high-contrast', 'large-text')
      ;['protanopia', 'deuteranopia', 'tritanopia'].forEach(mode => {
        root.classList.remove(`color-blind-${mode}`)
      })
    }

    this.isInitialized = false
  }
}

// Create singleton instance
export const accessibilityManager = new AccessibilityManager()

// Export utilities
export const getAccessibilityPreferences = (): AccessibilityPreferences => {
  return accessibilityManager.getPreferences()
}

export const shouldReduceMotion = (): boolean => {
  return accessibilityManager.shouldReduceMotion()
}

export const getColorContrastConfig = (): ColorContrastConfig => {
  return accessibilityManager.getColorContrastConfig()
}

export default accessibilityManager