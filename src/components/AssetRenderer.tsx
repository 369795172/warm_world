// Universal asset renderer with accessibility and performance optimization
import React, { useMemo, useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAssetLoader, useAccessibilityPreferences } from '@/hooks/useAssetLoader'

export interface AssetRendererProps {
  assetId: string
  alt?: string
  className?: string
  width?: number
  height?: number
  style?: React.CSSProperties
  onLoad?: () => void
  onError?: (error: Error) => void
  loadingComponent?: React.ReactNode
  errorComponent?: React.ReactNode
  animation?: {
    type: 'fade' | 'slide' | 'bounce' | 'scale'
    duration?: number
    delay?: number
    disabled?: boolean
  }
  accessibility?: {
    ariaLabel?: string
    role?: string
    tabIndex?: number
  }
  fallback?: 'emoji' | 'placeholder' | 'none'
  lazy?: boolean
  priority?: 'low' | 'high'
  toyId?: string
}

/**
 * Universal asset renderer component with accessibility and performance features
 */
export const AssetRenderer: React.FC<AssetRendererProps> = ({
  assetId,
  alt,
  className = '',
  width,
  height,
  style = {},
  onLoad,
  onError,
  loadingComponent,
  errorComponent,
  animation = { type: 'fade', duration: 300 },
  accessibility = {},
  fallback = 'emoji',
  lazy = true,
  priority = 'low'
}) => {
  const assetLoaderResult = useAssetLoader(assetId, { lazy, preload: priority === 'high' })
  const assetState = Array.isArray(assetLoaderResult) ? assetLoaderResult[0] : assetLoaderResult
  const { data, loading, error } = assetState
  const accessibilityPrefs = useAccessibilityPreferences()
  const [imageLoaded, setImageLoaded] = useState(false)

  // Determine if animations should be disabled
  const shouldDisableAnimation = useMemo(() => {
    return accessibilityPrefs.prefersReducedMotion || animation.disabled
  }, [accessibilityPrefs.prefersReducedMotion, animation.disabled])

  // Handle asset loading completion
  useEffect(() => {
    if (!loading && data && !error) {
      setImageLoaded(true)
      onLoad?.()
    }
  }, [loading, data, error, onLoad])

  // Handle asset loading errors
  useEffect(() => {
    if (error) {
      onError?.(error)
    }
  }, [error, onError])

  // Render loading state
  if (loading) {
    return (
      <motion.div
        className={`asset-renderer-loading ${className}`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: shouldDisableAnimation ? 0 : 0.2 }}
        style={{ width, height, ...style }}
      >
        {loadingComponent || (
          <div className="flex items-center justify-center w-full h-full bg-gray-100 rounded animate-pulse">
            <span className="text-gray-400 text-sm">加载中...</span>
          </div>
        )}
      </motion.div>
    )
  }

  // Render error state with fallback
  if (error) {
    return (
      <motion.div
        className={`asset-renderer-error ${className}`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: shouldDisableAnimation ? 0 : 0.2 }}
        style={{ width, height, ...style }}
      >
        {errorComponent || renderFallback(fallback, assetId, { width, height, style })}
      </motion.div>
    )
  }

  // Render the actual asset
  const renderAsset = () => {
    if (!data) return null

    const assetProps = {
      className: `asset-renderer-content ${className}`,
      alt: alt || accessibility.ariaLabel || 'Asset',
      style: {
        width: width || 'auto',
        height: height || 'auto',
        ...style
      },
      'aria-label': accessibility.ariaLabel,
      role: accessibility.role || 'img',
      tabIndex: accessibility.tabIndex,
      onLoad: () => setImageLoaded(true)
    }

    // Handle different asset types
    if (typeof data === 'string') {
      if (data.startsWith('<svg')) {
        // SVG content
        return (
          <div
            {...assetProps}
            dangerouslySetInnerHTML={{ __html: data }}
            className={`${assetProps.className} svg-asset`}
          />
        )
      } else if (data.length <= 10) {
        // Emoji fallback
        return (
          <span
            {...assetProps}
            className={`${assetProps.className} emoji-asset text-4xl`}
            role="img"
            aria-label={assetProps.alt}
          >
            {data}
          </span>
        )
      }
    }

    // Lottie animation data
    if (typeof data === 'object' && data.v) {
      return (
        <div
          {...assetProps}
          className={`${assetProps.className} lottie-asset`}
          data-lottie-data={JSON.stringify(data)}
        >
          {/* Lottie animation will be handled by a separate component */}
          <span className="text-4xl">✨</span>
        </div>
      )
    }

    // Default placeholder
    return (
      <div
        {...assetProps}
        className={`${assetProps.className} asset-placeholder bg-gray-200 rounded flex items-center justify-center`}
      >
        <span className="text-gray-400 text-xs">Asset</span>
      </div>
    )
  }

  return (
    <AnimatePresence mode="wait">
      {imageLoaded && (
        <motion.div
          key={assetId}
          initial={getAnimationInitial(animation.type)}
          animate={getAnimationAnimate(animation.type)}
          exit={getAnimationExit(animation.type)}
          transition={{
            duration: shouldDisableAnimation ? 0 : (animation.duration || 300) / 1000,
            delay: shouldDisableAnimation ? 0 : (animation.delay || 0) / 1000
          }}
        >
          {renderAsset()}
        </motion.div>
      )}
    </AnimatePresence>
  )
}

/**
 * Fallback renderer for error states
 */
function renderFallback(
  fallback: 'emoji' | 'placeholder' | 'none',
  assetId: string,
  props: { width?: number; height?: number; style?: React.CSSProperties }
) {
  if (fallback === 'none') {
    return null
  }

  if (fallback === 'emoji') {
    const emojiMap: Record<string, string> = {
      bunny: '🐰',
      bear: '🐻',
      parent_mom: '👩',
      parent_dad: '👨',
      ball: '⚽',
      music_box: '🎵',
      gift: '🎁',
      water_icon: '💧',
      share_icon: '🤝',
      home_icon: '🏠'
    }

    const emoji = emojiMap[assetId] || '❓'

    return (
      <span
        className="fallback-emoji text-4xl flex items-center justify-center w-full h-full"
        role="img"
        aria-label="Fallback asset"
        style={{ ...props.style, width: props.width, height: props.height }}
      >
        {emoji}
      </span>
    )
  }

  // Placeholder fallback
  return (
    <div
      className="fallback-placeholder bg-gray-200 rounded flex items-center justify-center w-full h-full"
      style={{ ...props.style, width: props.width, height: props.height }}
    >
      <span className="text-gray-400 text-xs">❓</span>
    </div>
  )
}

/**
 * Animation helpers
 */
function getAnimationInitial(type: string) {
  switch (type) {
    case 'fade':
      return { opacity: 0 }
    case 'slide':
      return { opacity: 0, y: 20 }
    case 'bounce':
      return { opacity: 0, scale: 0.8 }
    case 'scale':
      return { opacity: 0, scale: 0.5 }
    default:
      return { opacity: 0 }
  }
}

function getAnimationAnimate(type: string) {
  switch (type) {
    case 'fade':
      return { opacity: 1 }
    case 'slide':
      return { opacity: 1, y: 0 }
    case 'bounce':
      return { opacity: 1, scale: 1 }
    case 'scale':
      return { opacity: 1, scale: 1 }
    default:
      return { opacity: 1 }
  }
}

function getAnimationExit(type: string) {
  switch (type) {
    case 'fade':
      return { opacity: 0 }
    case 'slide':
      return { opacity: 0, y: -20 }
    case 'bounce':
      return { opacity: 0, scale: 0.8 }
    case 'scale':
      return { opacity: 0, scale: 0.5 }
    default:
      return { opacity: 0 }
  }
}

/**
 * Character renderer component
 */
export interface CharacterRendererProps extends Omit<AssetRendererProps, 'assetId'> {
  characterId: string
  emotion?: 'happy' | 'sad' | 'excited' | 'neutral'
  size?: 'small' | 'medium' | 'large'
}

export const CharacterRenderer: React.FC<CharacterRendererProps> = ({
  characterId,
  emotion = 'neutral',
  size = 'medium',
  ...props
}) => {
  const sizeMap = {
    small: { width: 32, height: 32 },
    medium: { width: 64, height: 64 },
    large: { width: 128, height: 128 }
  }

  const dimensions = sizeMap[size]

  return (
    <AssetRenderer
      assetId={characterId}
      {...dimensions}
      {...props}
      accessibility={{
        ariaLabel: `Character: ${characterId}`,
        role: 'img',
        ...props.accessibility
      }}
      animation={{
        type: emotion === 'excited' ? 'bounce' : 'fade',
        duration: emotion === 'excited' ? 500 : 300,
        ...props.animation
      }}
    />
  )
}

/**
 * Toy renderer component
 */
export interface ToyRendererProps extends Omit<AssetRendererProps, 'assetId'> {
  toyId: string
  interactionState?: 'idle' | 'hover' | 'dragging' | 'sharing'
}

export const ToyRenderer: React.FC<ToyRendererProps> = ({
  toyId,
  interactionState = 'idle',
  ...props
}) => {
  const getAnimationType = () => {
    switch (interactionState) {
      case 'hover':
        return 'scale'
      case 'dragging':
        return 'bounce'
      case 'sharing':
        return 'slide'
      default:
        return 'fade'
    }
  }

  const getAnimationDuration = () => {
    switch (interactionState) {
      case 'hover':
        return 200
      case 'dragging':
        return 300
      case 'sharing':
        return 400
      default:
        return 300
    }
  }

  return (
    <AssetRenderer
      assetId={toyId}
      {...props}
      animation={{
        type: getAnimationType(),
        duration: getAnimationDuration(),
        ...props.animation
      }}
      accessibility={{
        ariaLabel: `Interactive toy: ${toyId}`,
        role: 'img',
        tabIndex: 0
      }}
      alt={`Interactive toy: ${toyId}`}
    />
  )
}
