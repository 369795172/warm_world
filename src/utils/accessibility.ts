/**
 * Accessibility Testing Utilities
 * WCAG 2.1 AA Compliance Helpers
 */

export interface AccessibilityTest {
  name: string
  test: () => boolean | Promise<boolean>
  severity: 'critical' | 'major' | 'minor'
  wcagReference: string
}

export interface AccessibilityReport {
  passed: number
  failed: number
  warnings: number
  tests: Array<{
    name: string
    passed: boolean
    severity: 'critical' | 'major' | 'minor'
    wcagReference: string
    message?: string
  }>
}

/**
 * Color contrast ratio calculator
 * Based on WCAG 2.1 guidelines
 */
export class ColorContrastChecker {
  /**
   * Calculate relative luminance of a color
   */
  private static getLuminance(color: string): number {
    const rgb = this.parseColor(color)
    if (!rgb) return 0

    const [r, g, b] = rgb.map(channel => {
      const sRGB = channel / 255
      return sRGB <= 0.03928 
        ? sRGB / 12.92 
        : Math.pow((sRGB + 0.055) / 1.055, 2.4)
    })

    return 0.2126 * r + 0.7152 * g + 0.0722 * b
  }

  /**
   * Parse color string to RGB array
   */
  private static parseColor(color: string): [number, number, number] | null {
    // Handle hex colors
    const hexMatch = color.match(/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i)
    if (hexMatch) {
      return [
        parseInt(hexMatch[1], 16),
        parseInt(hexMatch[2], 16),
        parseInt(hexMatch[3], 16)
      ]
    }

    // Handle rgb/rgba colors
    const rgbMatch = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/)
    if (rgbMatch) {
      return [
        parseInt(rgbMatch[1]),
        parseInt(rgbMatch[2]),
        parseInt(rgbMatch[3])
      ]
    }

    return null
  }

  /**
   * Calculate contrast ratio between two colors
   */
  static getContrastRatio(color1: string, color2: string): number {
    const lum1 = this.getLuminance(color1)
    const lum2 = this.getLuminance(color2)
    const lighter = Math.max(lum1, lum2)
    const darker = Math.min(lum1, lum2)
    
    return (lighter + 0.05) / (darker + 0.05)
  }

  /**
   * Check if contrast ratio meets WCAG AA standards
   */
  static meetsWCAGAA(ratio: number, fontSize: number = 16, isBold: boolean = false): boolean {
    const isLargeText = fontSize >= 18 || (fontSize >= 14 && isBold)
    return isLargeText ? ratio >= 3 : ratio >= 4.5
  }

  /**
   * Check if contrast ratio meets WCAG AAA standards
   */
  static meetsWCAGAAA(ratio: number, fontSize: number = 16, isBold: boolean = false): boolean {
    const isLargeText = fontSize >= 18 || (fontSize >= 14 && isBold)
    return isLargeText ? ratio >= 4.5 : ratio >= 7
  }
}

/**
 * Accessibility testing suite
 */
export class AccessibilityTester {
  private tests: AccessibilityTest[] = []

  /**
   * Add a new accessibility test
   */
  addTest(test: AccessibilityTest): void {
    this.tests.push(test)
  }

  /**
   * Run all accessibility tests
   */
  async runTests(): Promise<AccessibilityReport> {
    const results = await Promise.all(
      this.tests.map(async (test) => {
        try {
          const passed = await test.test()
          return {
            name: test.name,
            passed,
            severity: test.severity,
            wcagReference: test.wcagReference,
            message: passed ? undefined : `${test.name} failed`
          }
        } catch (error) {
          return {
            name: test.name,
            passed: false,
            severity: test.severity,
            wcagReference: test.wcagReference,
            message: `Test error: ${error instanceof Error ? error.message : 'Unknown error'}`
          }
        }
      })
    )

    return {
      passed: results.filter(r => r.passed).length,
      failed: results.filter(r => !r.passed).length,
      warnings: results.filter(r => !r.passed && r.severity === 'minor').length,
      tests: results
    }
  }

  /**
   * Create standard accessibility tests for a component
   */
  createStandardTests(element: HTMLElement): void {
    // Test 1: Alt text for images
    this.addTest({
      name: 'Images have alt text',
      test: () => {
        const images = element.querySelectorAll('img')
        return Array.from(images).every(img => 
          img.hasAttribute('alt') && img.getAttribute('alt') !== ''
        )
      },
      severity: 'critical',
      wcagReference: '1.1.1 Non-text Content'
    })

    // Test 2: ARIA labels for interactive elements
    this.addTest({
      name: 'Interactive elements have accessible names',
      test: () => {
        const interactive = element.querySelectorAll(
          'button, a, input, select, textarea, [role="button"], [role="link"]'
        )
        return Array.from(interactive).every(el => {
          const hasLabel = el.hasAttribute('aria-label') || 
                          el.hasAttribute('aria-labelledby') ||
                          el.textContent?.trim() !== '' ||
                          (el as HTMLInputElement).placeholder !== ''
          return hasLabel
        })
      },
      severity: 'critical',
      wcagReference: '4.1.2 Name, Role, Value'
    })

    // Test 3: Color contrast
    this.addTest({
      name: 'Text has sufficient color contrast',
      test: () => {
        const textElements = element.querySelectorAll('p, h1, h2, h3, h4, h5, h6, span, a, button')
        return Array.from(textElements).every(el => {
          const computedStyle = window.getComputedStyle(el)
          const color = computedStyle.color
          const backgroundColor = computedStyle.backgroundColor
          const fontSize = parseFloat(computedStyle.fontSize)
          const fontWeight = computedStyle.fontWeight
          
          if (color && backgroundColor && color !== backgroundColor) {
            const ratio = ColorContrastChecker.getContrastRatio(color, backgroundColor)
            return ColorContrastChecker.meetsWCAGAA(ratio, fontSize, fontWeight === 'bold')
          }
          return true
        })
      },
      severity: 'major',
      wcagReference: '1.4.3 Contrast (Minimum)'
    })

    // Test 4: Focus indicators
    this.addTest({
      name: 'Interactive elements have focus indicators',
      test: () => {
        const interactive = element.querySelectorAll(
          'button, a, input, select, textarea, [tabindex]:not([tabindex="-1"])'
        )
        return Array.from(interactive).every(el => {
          const computedStyle = window.getComputedStyle(el, ':focus')
          const outline = computedStyle.outline
          const boxShadow = computedStyle.boxShadow
          return outline !== 'none' || boxShadow !== 'none'
        })
      },
      severity: 'major',
      wcagReference: '2.4.7 Focus Visible'
    })

    // Test 5: Keyboard navigation
    this.addTest({
      name: 'Interactive elements are keyboard accessible',
      test: () => {
        const interactive = element.querySelectorAll(
          'button, a, input, select, textarea'
        )
        return Array.from(interactive).every(el => {
          const tabIndex = el.getAttribute('tabindex')
          return tabIndex !== '-1'
        })
      },
      severity: 'critical',
      wcagReference: '2.1.1 Keyboard'
    })
  }
}

/**
 * Reduced motion utilities
 */
export class ReducedMotionManager {
  private listeners: Array<(prefersReduced: boolean) => void> = []
  private mediaQuery: MediaQueryList

  constructor() {
    this.mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    this.setupListener()
  }

  /**
   * Check if user prefers reduced motion
   */
  getPrefersReducedMotion(): boolean {
    return this.mediaQuery.matches
  }

  /**
   * Add listener for reduced motion preference changes
   */
  addListener(callback: (prefersReduced: boolean) => void): void {
    this.listeners.push(callback)
  }

  /**
   * Remove listener
   */
  removeListener(callback: (prefersReduced: boolean) => void): void {
    this.listeners = this.listeners.filter(listener => listener !== callback)
  }

  /**
   * Setup media query listener
   */
  private setupListener(): void {
    const handleChange = (event: MediaQueryListEvent) => {
      this.listeners.forEach(callback => callback(event.matches))
    }

    if (this.mediaQuery.addEventListener) {
      this.mediaQuery.addEventListener('change', handleChange)
    } else {
      // Fallback for older browsers
      this.mediaQuery.addListener(handleChange)
    }
  }

  /**
   * Get adjusted animation duration based on user preference
   */
  getAnimationDuration(preferredDuration: number): number {
    return this.getPrefersReducedMotion() ? 0 : preferredDuration
  }

  /**
   * Get adjusted animation configuration
   */
  getAnimationConfig(config: {
    duration?: number
    delay?: number
    reducedMotionDuration?: number
    reducedMotionDelay?: number
  }): {
    duration: number
    delay: number
  } {
    const prefersReduced = this.getPrefersReducedMotion()
    
    return {
      duration: prefersReduced 
        ? (config.reducedMotionDuration ?? 0)
        : (config.duration ?? 0),
      delay: prefersReduced
        ? (config.reducedMotionDelay ?? 0)
        : (config.delay ?? 0)
    }
  }
}

/**
 * Screen reader utilities
 */
export class ScreenReaderManager {
  /**
   * Announce content to screen readers
   */
  static announce(content: string, priority: 'polite' | 'assertive' = 'polite'): void {
    const announcement = document.createElement('div')
    announcement.setAttribute('aria-live', priority)
    announcement.setAttribute('aria-atomic', 'true')
    announcement.style.position = 'absolute'
    announcement.style.left = '-10000px'
    announcement.style.width = '1px'
    announcement.style.height = '1px'
    announcement.style.overflow = 'hidden'
    
    document.body.appendChild(announcement)
    
    // Trigger screen reader announcement
    setTimeout(() => {
      announcement.textContent = content
    }, 100)
    
    // Clean up after announcement
    setTimeout(() => {
      document.body.removeChild(announcement)
    }, 1000)
  }

  /**
   * Create visually hidden but screen reader accessible content
   */
  static createScreenReaderOnly(content: string): string {
    return `<span class="sr-only">${content}</span>`
  }
}

/**
 * Keyboard navigation utilities
 */
export class KeyboardNavigator {
  private focusableElements: NodeListOf<Element> | null = null
  private currentIndex = -1

  /**
   * Get all focusable elements within a container
   */
  static getFocusableElements(container: HTMLElement): NodeListOf<Element> {
    const focusableSelectors = [
      'a[href]',
      'button:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      '[tabindex]:not([tabindex="-1"])',
      '[contenteditable="true"]'
    ].join(', ')

    return container.querySelectorAll(focusableSelectors)
  }

  /**
   * Setup keyboard navigation for a container
   */
  setupNavigation(container: HTMLElement): void {
    this.focusableElements = KeyboardNavigator.getFocusableElements(container)
    
    container.addEventListener('keydown', this.handleKeyDown)
    
    // Set initial focus
    if (this.focusableElements.length > 0) {
      this.currentIndex = 0
      ;(this.focusableElements[0] as HTMLElement).focus()
    }
  }

  /**
   * Cleanup keyboard navigation
   */
  cleanup(): void {
    this.focusableElements = null
    this.currentIndex = -1
  }

  /**
   * Handle keyboard navigation
   */
  private handleKeyDown = (event: KeyboardEvent): void => {
    if (!this.focusableElements || this.focusableElements.length === 0) return

    switch (event.key) {
      case 'ArrowRight':
      case 'ArrowDown':
        event.preventDefault()
        this.focusNext()
        break
      case 'ArrowLeft':
      case 'ArrowUp':
        event.preventDefault()
        this.focusPrevious()
        break
      case 'Home':
        event.preventDefault()
        this.focusFirst()
        break
      case 'End':
        event.preventDefault()
        this.focusLast()
        break
    }
  }

  /**
   * Focus next element
   */
  private focusNext(): void {
    if (this.currentIndex < this.focusableElements!.length - 1) {
      this.currentIndex++
      ;(this.focusableElements![this.currentIndex] as HTMLElement).focus()
    }
  }

  /**
   * Focus previous element
   */
  private focusPrevious(): void {
    if (this.currentIndex > 0) {
      this.currentIndex--
      ;(this.focusableElements![this.currentIndex] as HTMLElement).focus()
    }
  }

  /**
   * Focus first element
   */
  private focusFirst(): void {
    this.currentIndex = 0
    ;(this.focusableElements![this.currentIndex] as HTMLElement).focus()
  }

  /**
   * Focus last element
   */
  private focusLast(): void {
    this.currentIndex = this.focusableElements!.length - 1
    ;(this.focusableElements![this.currentIndex] as HTMLElement).focus()
  }
}

// Export singleton instances
export const reducedMotionManager = new ReducedMotionManager()
export const accessibilityTester = new AccessibilityTester()

// CSS for screen reader only content
export const screenReaderStyles = `
  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }

  .sr-only:focus {
    position: static;
    width: auto;
    height: auto;
    padding: inherit;
    margin: inherit;
    overflow: visible;
    clip: auto;
    white-space: inherit;
  }
`