// Advanced asset management system with lazy loading and bundle optimization
// Implements UI motion plan requirements for resource management and performance

export interface AssetConfig {
  id: string
  type: 'image' | 'svg' | 'lottie' | 'gltf' | 'audio'
  src: string
  url?: string
  preload?: boolean
  priority?: 'high' | 'medium' | 'low'
  fallback?: string
  size?: number // in KB
  format?: string
}

export interface AssetBundle {
  id: string
  name: string
  assets: AssetConfig[]
  preload?: boolean
  priority?: 'high' | 'medium' | 'low'
  size?: number // total size in KB
}

export interface LoadingStrategy {
  immediate: AssetConfig[]    // Load immediately
  lazy: AssetConfig[]          // Load when needed
  prefetch: AssetConfig[]      // Load after immediate
  idle: AssetConfig[]          // Load during idle time
}

export interface AssetCache {
  images: Map<string, HTMLImageElement>
  svgs: Map<string, string>
  lotties: Map<string, unknown>
  gltfs: Map<string, unknown>
  audios: Map<string, HTMLAudioElement>
}

export interface MemoryUsage {
  total: number
  images: number
  svgs: number
  lotties: number
  gltfs: number
  audios: number
}

export interface AssetManagerConfig {
  maxMemoryMB: number
  enableCompression: boolean
  enableWebP: boolean
  enableLazyLoading: boolean
  enableCache: boolean
  enablePreload: boolean
  chunkSize: number // KB per chunk
}

class AssetManager {
  private cache: AssetCache
  private bundles: Map<string, AssetBundle>
  private loadingPromises: Map<string, Promise<unknown>>
  private config: AssetManagerConfig
  private memoryUsage: MemoryUsage
  private isInitialized = false
  private intersectionObserver?: IntersectionObserver
  private idleCallbackId?: number

  constructor(config: Partial<AssetManagerConfig> = {}) {
    this.config = {
      maxMemoryMB: 50, // 50MB max memory usage
      enableCompression: true,
      enableWebP: true,
      enableLazyLoading: true,
      enableCache: true,
      enablePreload: true,
      chunkSize: 100, // 100KB chunks
      ...config
    }

    this.cache = {
      images: new Map(),
      svgs: new Map(),
      lotties: new Map(),
      gltfs: new Map(),
      audios: new Map()
    }

    this.bundles = new Map()
    this.loadingPromises = new Map()
    this.memoryUsage = {
      total: 0,
      images: 0,
      svgs: 0,
      lotties: 0,
      gltfs: 0,
      audios: 0
    }
  }

  // Initialize asset manager
  initialize(): void {
    if (this.isInitialized) return

    // Setup intersection observer for lazy loading
    if (this.config.enableLazyLoading && typeof IntersectionObserver !== 'undefined') {
      this.setupIntersectionObserver()
    }

    // Setup idle callback for background loading
    if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
      this.setupIdleCallback()
    }

    // Setup WebP detection
    if (this.config.enableWebP) {
      this.detectWebPSupport()
    }

    this.isInitialized = true
    console.log('📦 Asset manager initialized')
  }

  // Setup intersection observer for lazy loading
  private setupIntersectionObserver(): void {
    this.intersectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const element = entry.target as HTMLElement
            const assetId = element.dataset.assetId
            if (assetId) {
              this.loadAsset(assetId)
              this.intersectionObserver?.unobserve(element)
            }
          }
        })
      },
      {
        rootMargin: '50px', // Start loading 50px before entering viewport
        threshold: 0.01
      }
    )
  }

  // Setup idle callback for background loading
  private setupIdleCallback(): void {
    const loadIdleAssets = () => {
      const idleAssets = this.getIdleAssets()
      if (idleAssets.length > 0) {
        this.loadAssetBundle(idleAssets.slice(0, 5).map(asset => asset.id)) // Load max 5 assets per idle cycle
      }
    }

    this.idleCallbackId = (window as any).requestIdleCallback(loadIdleAssets, { timeout: 1000 })
  }

  // Detect WebP support
  private detectWebPSupport(): Promise<boolean> {
    return new Promise((resolve) => {
      const webP = new Image()
      webP.onload = webP.onerror = () => {
        this.config.enableWebP = webP.height === 2
        resolve(this.config.enableWebP)
      }
      webP.src = 'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA'
    })
  }

  // Register asset bundle
  registerBundle(bundle: AssetBundle): void {
    this.bundles.set(bundle.id, bundle)
    
    // Preload high priority assets
    if (this.config.enablePreload && bundle.priority === 'high') {
      this.preloadBundle(bundle.id)
    }
  }

  // Get asset by ID
  getAsset(id: string): AssetConfig | undefined {
    for (const bundle of this.bundles.values()) {
      const asset = bundle.assets.find(a => a.id === id)
      if (asset) return asset
    }
    return undefined
  }

  // Get asset URL
  getAssetUrl(id: string): string {
    const asset = this.getAsset(id)
    return asset ? asset.url : ''
  }

  // Load asset by ID
  async preloadAsset(id: string): Promise<any> {
    return this.loadAsset(id)
  }

  async loadAsset(id: string): Promise<any> {
    const asset = this.getAsset(id)
    if (!asset) {
      throw new Error(`Asset not found: ${id}`)
    }

    // Check if already cached
    const cached = this.getCachedAsset(asset)
    if (cached) return cached

    // Check if already loading
    const existingPromise = this.loadingPromises.get(id)
    if (existingPromise) return existingPromise

    // Create loading promise
    const loadingPromise = this.loadAssetByType(asset)
    this.loadingPromises.set(id, loadingPromise)

    try {
      const result = await loadingPromise
      this.cacheAsset(asset, result)
      return result
    } catch (error) {
      console.error(`Failed to load asset ${id}:`, error)
      
      // Try fallback
      if (asset.fallback) {
        return this.loadAsset(asset.fallback)
      }
      
      throw error
    } finally {
      this.loadingPromises.delete(id)
    }
  }

  // Load asset by type
  private async loadAssetByType(asset: AssetConfig): Promise<any> {
    switch (asset.type) {
      case 'image':
        return this.loadImage(asset)
      case 'svg':
        return this.loadSVG(asset)
      case 'lottie':
        return this.loadLottie(asset)
      case 'gltf':
        return this.loadGLTF(asset)
      case 'audio':
        return this.loadAudio(asset)
      default:
        throw new Error(`Unsupported asset type: ${asset.type}`)
    }
  }

  // Load image asset
  private loadImage(asset: AssetConfig): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image()
      
      // Enable compression and WebP
      let src = asset.src
      if (this.config.enableWebP && this.supportsWebP()) {
        src = src.replace(/\.(png|jpg|jpeg)$/, '.webp')
      }
      
      img.onload = () => {
        resolve(img)
      }
      
      img.onerror = () => {
        // Fallback to original format
        if (src !== asset.src) {
          img.src = asset.src
        } else {
          reject(new Error(`Failed to load image: ${asset.src}`))
        }
      }
      
      // Set loading attributes
      img.loading = 'lazy'
      img.decoding = 'async'
      
      img.src = src
    })
  }

  // Load SVG asset
  private async loadSVG(asset: AssetConfig): Promise<string> {
    const response = await fetch(asset.src)
    if (!response.ok) {
      throw new Error(`Failed to load SVG: ${asset.src}`)
    }
    return response.text()
  }

  // Load Lottie animation
  private async loadLottie(asset: AssetConfig): Promise<any> {
    // Dynamic import for Lottie
    const { default: lottie } = await import('lottie-web')
    const animationData = await fetch(asset.src).then(r => r.json())
    return { lottie, animationData }
  }

  // Load GLTF model (placeholder implementation - requires 3D library)
  private async loadGLTF(asset: AssetConfig): Promise<any> {
    // Note: 3D model loading requires a 3D library like Three.js or Phaser 3D support
    // For now, return a placeholder object
    console.warn(`GLTF loading not implemented for ${asset.id}. Consider adding Three.js dependency.`)
    return { 
      scene: null, 
      meshes: [], 
      materials: [], 
      animations: [],
      placeholder: true 
    }
  }

  // Load audio asset
  private loadAudio(asset: AssetConfig): Promise<HTMLAudioElement> {
    return new Promise((resolve, reject) => {
      const audio = new Audio()
      
      audio.oncanplaythrough = () => {
        resolve(audio)
      }
      
      audio.onerror = () => {
        reject(new Error(`Failed to load audio: ${asset.src}`))
      }
      
      audio.preload = 'auto'
      audio.src = asset.src
    })
  }

  // Get cached asset
  private getCachedAsset(asset: AssetConfig): any {
    if (!this.config.enableCache) return null

    switch (asset.type) {
      case 'image':
        return this.cache.images.get(asset.id)
      case 'svg':
        return this.cache.svgs.get(asset.id)
      case 'lottie':
        return this.cache.lotties.get(asset.id)
      case 'gltf':
        return this.cache.gltfs.get(asset.id)
      case 'audio':
        return this.cache.audios.get(asset.id)
      default:
        return null
    }
  }

  // Cache asset
  private cacheAsset(asset: AssetConfig, data: any): void {
    if (!this.config.enableCache) return

    // Check memory usage
    const estimatedSize = this.estimateAssetSize(asset, data)
    if (this.memoryUsage.total + estimatedSize > this.config.maxMemoryMB * 1024) {
      this.evictLeastRecentlyUsed()
    }

    switch (asset.type) {
      case 'image':
        this.cache.images.set(asset.id, data)
        this.memoryUsage.images += estimatedSize
        break
      case 'svg':
        this.cache.svgs.set(asset.id, data)
        this.memoryUsage.svgs += estimatedSize
        break
      case 'lottie':
        this.cache.lotties.set(asset.id, data)
        this.memoryUsage.lotties += estimatedSize
        break
      case 'gltf':
        this.cache.gltfs.set(asset.id, data)
        this.memoryUsage.gltfs += estimatedSize
        break
      case 'audio':
        this.cache.audios.set(asset.id, data)
        this.memoryUsage.audios += estimatedSize
        break
    }

    this.memoryUsage.total += estimatedSize
  }

  // Estimate asset size in KB
  private estimateAssetSize(asset: AssetConfig, data: any): number {
    if (asset.size) return asset.size

    switch (asset.type) {
      case 'image':
        return 100 // Estimate 100KB per image
      case 'svg':
        return (data as string).length / 1024 // KB based on string length
      case 'lottie':
        return 50 // Estimate 50KB per Lottie animation
      case 'gltf':
        return 500 // Estimate 500KB per GLTF model
      case 'audio':
        return 200 // Estimate 200KB per audio file
      default:
        return 50
    }
  }

  // Evict least recently used assets
  private evictLeastRecentlyUsed(): void {
    // Simple eviction strategy - remove 25% of cached assets
    const allAssets = [
      ...this.cache.images.entries(),
      ...this.cache.svgs.entries(),
      ...this.cache.lotties.entries(),
      ...this.cache.gltfs.entries(),
      ...this.cache.audios.entries()
    ]

    const toRemove = Math.ceil(allAssets.length * 0.25)
    for (let i = 0; i < toRemove; i++) {
      const [id, type] = allAssets[i][0].split(':')
      this.removeFromCache(id, type as any)
    }
  }

  // Remove asset from cache
  private removeFromCache(id: string, type: keyof AssetCache): void {
    switch (type) {
      case 'images':
        this.cache.images.delete(id)
        break
      case 'svgs':
        this.cache.svgs.delete(id)
        break
      case 'lotties':
        this.cache.lotties.delete(id)
        break
      case 'gltfs':
        this.cache.gltfs.delete(id)
        break
      case 'audios':
        this.cache.audios.delete(id)
        break
    }
  }

  // Preload asset bundle
  async preloadBundle(bundleId: string): Promise<void> {
    const bundle = this.bundles.get(bundleId)
    if (!bundle) {
      throw new Error(`Bundle not found: ${bundleId}`)
    }

    const promises = bundle.assets.map(asset => this.loadAsset(asset.id))
    await Promise.all(promises)
  }

  // Load multiple assets
  async loadAssetBundle(assetIds: string[]): Promise<any[]> {
    const promises = assetIds.map(id => this.loadAsset(id))
    return Promise.all(promises)
  }

  // Get loading strategy
  getLoadingStrategy(): LoadingStrategy {
    const immediate: AssetConfig[] = []
    const lazy: AssetConfig[] = []
    const prefetch: AssetConfig[] = []
    const idle: AssetConfig[] = []

    for (const bundle of this.bundles.values()) {
      for (const asset of bundle.assets) {
        if (asset.preload || asset.priority === 'high') {
          immediate.push(asset)
        } else if (asset.priority === 'medium') {
          prefetch.push(asset)
        } else if (asset.priority === 'low') {
          idle.push(asset)
        } else {
          lazy.push(asset)
        }
      }
    }

    return { immediate, lazy, prefetch, idle }
  }

  // Get idle assets
  private getIdleAssets(): AssetConfig[] {
    const strategy = this.getLoadingStrategy()
    return strategy.idle
  }

  // Check if WebP is supported
  private supportsWebP(): boolean {
    return this.config.enableWebP || false
  }

  // Get memory usage
  getMemoryUsage(): MemoryUsage {
    return { ...this.memoryUsage }
  }

  // Clear cache
  clearCache(): void {
    this.cache.images.clear()
    this.cache.svgs.clear()
    this.cache.lotties.clear()
    this.cache.gltfs.clear()
    this.cache.audios.clear()
    
    this.memoryUsage = {
      total: 0,
      images: 0,
      svgs: 0,
      lotties: 0,
      gltfs: 0,
      audios: 0
    }
  }

  // Get loading progress
  getLoadingProgress(): { loaded: number; total: number; percentage: number } {
    const totalAssets = Array.from(this.bundles.values())
      .reduce((sum, bundle) => sum + bundle.assets.length, 0)
    
    const loadedAssets = [
      ...this.cache.images.keys(),
      ...this.cache.svgs.keys(),
      ...this.cache.lotties.keys(),
      ...this.cache.gltfs.keys(),
      ...this.cache.audios.keys()
    ].length

    return {
      loaded: loadedAssets,
      total: totalAssets,
      percentage: totalAssets > 0 ? Math.round((loadedAssets / totalAssets) * 100) : 0
    }
  }

  // Destroy and cleanup
  destroy(): void {
    if (this.intersectionObserver) {
      this.intersectionObserver.disconnect()
    }
    
    if (this.idleCallbackId && typeof window !== 'undefined') {
      (window as any).cancelIdleCallback(this.idleCallbackId)
    }
    
    this.clearCache()
    this.loadingPromises.clear()
    this.bundles.clear()
  }
}

// Create singleton instance
export const assetManager = new AssetManager()

// Export utilities
export const preloadAsset = (id: string): Promise<any> => {
  return assetManager.loadAsset(id)
}

export const preloadBundle = (bundleId: string): Promise<void> => {
  return assetManager.preloadBundle(bundleId)
}

export const getAsset = (id: string): AssetConfig | undefined => {
  return assetManager.getAsset(id)
}

export const getLoadingProgress = () => {
  return assetManager.getLoadingProgress()
}

export const getMemoryUsage = () => {
  return assetManager.getMemoryUsage()
}

export default assetManager