// Test setup file for Vitest
import '@testing-library/jest-dom'

// Mock window.matchMedia for testing prefers-reduced-motion
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  }),
})

// Mock IntersectionObserver for testing lazy loading
class IntersectionObserver {
  callback: IntersectionObserverCallback
  elements: Element[] = []
  root: Element | null = null
  rootMargin: string = '0px'
  thresholds: number[] = [0]

  constructor(callback: IntersectionObserverCallback) {
    this.callback = callback
  }

  observe(element: Element) {
    this.elements.push(element)
    // Simulate immediate intersection for testing
    this.callback([{ target: element, isIntersecting: true }] as any, this)
  }

  unobserve(element: Element) {
    this.elements = this.elements.filter(el => el !== element)
  }

  disconnect() {
    this.elements = []
  }

  takeRecords() {
    return []
  }
}

Object.defineProperty(window, 'IntersectionObserver', {
  writable: true,
  value: IntersectionObserver,
})

// Mock requestAnimationFrame
Object.defineProperty(window, 'requestAnimationFrame', {
  writable: true,
  value: (callback: FrameRequestCallback) => {
    return setTimeout(callback, 16) // ~60fps
  },
})

Object.defineProperty(window, 'cancelAnimationFrame', {
  writable: true,
  value: (id: number) => {
    clearTimeout(id)
  },
})

// Global test utilities
declare global {
  var mockIntersectionObserver: typeof IntersectionObserver
}

global.mockIntersectionObserver = IntersectionObserver

// Suppress console errors during tests unless explicitly testing error cases
const originalConsoleError = console.error
console.error = (...args: any[]) => {
  // Only show errors that aren't React warnings about act() etc.
  const message = args[0]?.toString() || ''
  if (
    !message.includes('Warning: ReactDOMTestUtils.act') &&
    !message.includes('Warning: An update to') &&
    !message.includes('act(...)')
  ) {
    originalConsoleError.apply(console, args)
  }
}