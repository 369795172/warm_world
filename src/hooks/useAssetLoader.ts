// Asset loading hook with performance optimization and accessibility support
import { useState, useEffect, useCallback, useRef } from 'react'
import { assetManager, AssetMetadata, AssetCategory } from '@/config/assetConfig'

export interface UseAssetLoaderOptions {
  lazy?: boolean
  preload?: boolean
  fallback?: boolean
  timeout?: number
  retryAttempts?: number
}

export interface AssetLoadingState {
  data: any
  loading: boolean
  error: Error | null
  retry: () => void
}

export interface UseAccessibilityOptions {
  respectPrefersReducedMotion?: boolean
  highContrastMode?: boolean
  screenReaderCompatible?: boolean
}

/**
 * Hook for loading assets with performance optimization and error handling
 */
export function useAssetLoader(
  assetId: string | string[],
  options: UseAssetLoaderOptions = {}
): AssetLoadingState | AssetLoadingState[] {
  const {
    lazy = true,
    preload = false,
    fallback = true,
    timeout = 10000,
    retryAttempts = 3
  } = options

  const [states, setStates] = useState<Record<string, AssetLoadingState>>({})
  const retryCounts = useRef<Record<string, number>>({})
  const mountedRef = useRef(true)

  const assetIds = Array.isArray(assetId) ? assetId : [assetId]

  const loadAsset = useCallback(async (id: string) => {
    if (!mountedRef.current) return

    setStates(prev => ({
      ...prev,
      [id]: { ...prev[id], loading: true, error: null }
    }))

    try {
      const data = await assetManager.loadAsset(id)
      if (mountedRef.current) {
        setStates(prev => ({
          ...prev,
          [id]: { data, loading: false, error: null, retry: () => loadAsset(id) }
        }))
      }
    } catch (error) {
      if (mountedRef.current) {
        const errorState = {
          data: null,
          loading: false,
          error: error instanceof Error ? error : new Error('Unknown error'),
          retry: () => loadAsset(id)
        }
        setStates(prev => ({
          ...prev,
          [id]: errorState
        }))
      }
    }
  }, [])

  const retry = useCallback((id: string) => {
    retryCounts.current[id] = (retryCounts.current[id] || 0) + 1
    if (retryCounts.current[id] <= retryAttempts) {
      loadAsset(id)
    }
  }, [loadAsset, retryAttempts])

  useEffect(() => {
    if (!lazy || preload) {
      assetIds.forEach(id => {
        if (!states[id] || (!states[id].data && !states[id].loading)) {
          loadAsset(id)
        }
      })
    }
  }, [assetIds.join(','), lazy, preload, loadAsset])

  useEffect(() => {
    return () => {
      mountedRef.current = false
    }
  }, [])

  if (Array.isArray(assetId)) {
    return assetIds.map(id => ({
      ...(states[id] || { data: null, loading: false, error: null }),
      retry: () => retry(id)
    }))
  }

  const singleState = states[assetId] || { data: null, loading: false, error: null }
  return {
    ...singleState,
    retry: () => retry(assetId)
  }
}

/**
 * Hook for detecting accessibility preferences
 */
export function useAccessibilityPreferences(): UseAccessibilityOptions & {
  prefersReducedMotion: boolean
  highContrastEnabled: boolean
  screenReaderDetected: boolean
} {
  const [preferences, setPreferences] = useState({
    prefersReducedMotion: false,
    highContrastEnabled: false,
    screenReaderDetected: false
  })

  useEffect(() => {
    const checkPreferences = () => {
      const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
      
      setPreferences({
        prefersReducedMotion: mediaQuery.matches,
        highContrastEnabled: document.documentElement.classList.contains('high-contrast') ||
                             window.matchMedia('(forced-colors: active)').matches,
        screenReaderDetected: document.documentElement.classList.contains('screen-reader') ||
                              navigator.userAgent.includes('Screen Reader')
      })
    }

    checkPreferences()

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    mediaQuery.addEventListener('change', checkPreferences)

    return () => {
      mediaQuery.removeEventListener('change', checkPreferences)
    }
  }, [])

  return {
    ...preferences,
    respectPrefersReducedMotion: true,
    highContrastMode: preferences.highContrastEnabled,
    screenReaderCompatible: preferences.screenReaderDetected
  }
}

/**
 * Hook for managing asset performance and loading optimization
 */
export function useAssetPerformance() {
  const [performance, setPerformance] = useState({
    loading: false,
    loadedAssets: 0,
    totalAssets: 0,
    averageLoadTime: 0,
    errors: 0
  })

  const loadStartTime = useRef<number>(0)
  const loadTimes = useRef<number[]>([])

  const startLoading = useCallback(() => {
    loadStartTime.current = (window.performance as Performance).now()
    setPerformance(prev => ({ ...prev, loading: true }))
  }, [])

  const finishLoading = useCallback(() => {
    const loadTime = (window.performance as Performance).now() - loadStartTime.current
    loadTimes.current.push(loadTime)
    
    const averageLoadTime = loadTimes.current.reduce((a, b) => a + b, 0) / loadTimes.current.length
    
    setPerformance(prev => ({
      ...prev,
      loading: false,
      averageLoadTime
    }))
  }, [])

  const recordError = useCallback(() => {
    setPerformance(prev => ({
      ...prev,
      errors: prev.errors + 1
    }))
  }, [])

  const updateProgress = useCallback((loaded: number, total: number) => {
    setPerformance(prev => ({
      ...prev,
      loadedAssets: loaded,
      totalAssets: total
    }))
  }, [])

  return {
    performance,
    startLoading,
    finishLoading,
    recordError,
    updateProgress
  }
}

/**
 * Hook for batch asset loading with priority management
 */
export function useBatchAssetLoader(
  assetIds: string[],
  priority: 'critical' | 'important' | 'normal' = 'normal',
  options: UseAssetLoaderOptions = {}
) {
  const { performance, startLoading, finishLoading, recordError, updateProgress } = useAssetPerformance()
  const [assets, setAssets] = useState<Record<string, any>>({})
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({})
  const [errors, setErrors] = useState<Record<string, Error>>({})

  const priorityMultiplier = {
    critical: 1,
    important: 2,
    normal: 3
  }[priority]

  const loadBatch = useCallback(async () => {
    if (assetIds.length === 0) return

    startLoading()
    const startTime = (window.performance as Performance).now()

    try {
      // Load assets with concurrency control
      const concurrencyLimit = Math.max(1, Math.floor(3 / priorityMultiplier))
      const chunks = chunkArray(assetIds, concurrencyLimit)

      for (const chunk of chunks) {
        const chunkPromises = chunk.map(async (assetId) => {
          setLoadingStates(prev => ({ ...prev, [assetId]: true }))
          
          try {
            const data = await assetManager.loadAsset(assetId)
            setAssets(prev => ({ ...prev, [assetId]: data }))
            setErrors(prev => {
              const newErrors = { ...prev }
              delete newErrors[assetId]
              return newErrors
            })
          } catch (error) {
            const errorObj = error instanceof Error ? error : new Error('Unknown error')
            setErrors(prev => ({ ...prev, [assetId]: errorObj }))
            recordError()
          } finally {
            setLoadingStates(prev => ({ ...prev, [assetId]: false }))
          }
        })

        await Promise.all(chunkPromises)
        updateProgress(Object.keys(assets).length, assetIds.length)
      }

      const loadTime = (window.performance as Performance).now() - startTime
      console.log(`Batch loading completed in ${loadTime.toFixed(2)}ms`)
    } catch (error) {
      console.error('Batch loading failed:', error)
      recordError()
    } finally {
      finishLoading()
    }
  }, [assetIds, priority, startLoading, finishLoading, recordError, updateProgress, assets])

  useEffect(() => {
    loadBatch()
  }, [assetIds.join(',')])

  return {
    assets,
    loading: Object.values(loadingStates).some(Boolean),
    loadingStates,
    errors,
    performance,
    reload: loadBatch
  }
}

/**
 * Utility function to chunk array for concurrent loading
 */
function chunkArray<T>(array: T[], chunkSize: number): T[][] {
  const chunks: T[][] = []
  for (let i = 0; i < array.length; i += chunkSize) {
    chunks.push(array.slice(i, i + chunkSize))
  }
  return chunks
}

/**
 * Hook for asset caching and memory management
 */
export function useAssetCache() {
  const [cacheSize, setCacheSize] = useState(0)
  const [cachedAssets, setCachedAssets] = useState<string[]>([])

  const clearCache = useCallback(() => {
    assetManager.clearCache()
    setCacheSize(0)
    setCachedAssets([])
  }, [])

  const getCacheStatus = useCallback(() => {
    const status = assetManager.getLoadingStatus()
    setCacheSize(status.loaded)
    return status
  }, [])

  return {
    cacheSize,
    cachedAssets,
    clearCache,
    getCacheStatus
  }
}