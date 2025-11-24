import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { assetManager } from '../config/assetConfig'
import { optimizeVariants, shouldEnableAnimations } from '../utils/performance'
import { ANIMATION_EASING, ANIMATION_TIMING } from '../config/animationConfig'

export type ToyInteraction = 'idle' | 'drag' | 'share' | 'bounce'
export type ToySize = 'small' | 'medium' | 'large'

export interface ToyAsset {
  id: string
  name: string
  url: string
  type: 'image' | 'model'
  category: string
  tags: string[]
  base?: string
  interactions?: {
    drag?: string
    share?: string
    bounce?: string | { type: 'lottie'; data: any }
  }
}

// 玩具资产配置 - 使用我们创建的SVG文件
const toyAssets: ToyAsset[] = [
  {
    id: 'ball',
    name: '小球',
    url: '/assets/toys/ball.svg',
    type: 'image',
    category: 'toys',
    tags: ['colorful', 'bounce', 'play']
  },
  {
    id: 'music_box',
    name: '音乐盒',
    url: '/assets/toys/music_box.svg',
    type: 'image',
    category: 'toys',
    tags: ['music', 'elegant', 'melody']
  },
  {
    id: 'gift',
    name: '礼物',
    url: '/assets/toys/gift.svg',
    type: 'image',
    category: 'toys',
    tags: ['present', 'surprise', 'sharing']
  }
]

export interface ToyRendererProps {
  toyId: string
  interaction?: ToyInteraction
  size?: ToySize
  className?: string
  onClick?: () => void
  onDragStart?: () => void
  onDragEnd?: () => void
  isDragging?: boolean
  enableAccessibility?: boolean
  reducedMotion?: boolean
  showEffects?: boolean
}

const sizeMap = {
  small: { width: 32, height: 32 },
  medium: { width: 48, height: 48 },
  large: { width: 64, height: 64 }
}

const interactionVariants = optimizeVariants({
  idle: {
    scale: 1,
    rotate: 0,
    y: 0,
    transition: {
      duration: ANIMATION_TIMING.interaction.fast / 1000,
      ease: 'easeOut'
    }
  },
  drag: {
    scale: 1.1,
    rotate: 5,
    y: -5,
    transition: {
      duration: ANIMATION_TIMING.interaction.fast / 1000,
      ease: 'easeOut',
      reducedMotionDuration: 0.05
    }
  },
  share: {
    scale: [1, 1.2, 1],
    rotate: [0, 10, -10, 0],
    transition: {
      duration: ANIMATION_TIMING.interaction.slow / 1000,
      ease: 'easeInOut',
      reducedMotionDuration: 0.25
    }
  },
  bounce: {
    y: [0, -15, 0],
    transition: {
      duration: ANIMATION_TIMING.interaction.slow / 1000,
      ease: 'easeOut',
      times: [0, 0.4, 1],
      reducedMotionDuration: 0.3
    }
  }
})

const interactionColors = {
  idle: 'border-gray-300',
  drag: 'border-blue-300',
  share: 'border-pink-300',
  bounce: 'border-yellow-300'
}

export const ToyRenderer: React.FC<ToyRendererProps> = ({
  toyId,
  interaction = 'idle',
  size = 'medium',
  className = '',
  onClick,
  onDragStart,
  onDragEnd,
  isDragging = false,
  enableAccessibility = true,
  reducedMotion = false,
  showEffects = true
}) => {
  const [toyAsset, setToyAsset] = useState<ToyAsset | null>(null)
  const [currentAsset, setCurrentAsset] = useState<string>('')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isInteracting, setIsInteracting] = useState(false)

  // Find toy asset configuration
  useEffect(() => {
    const asset = toyAssets.find(toy => toy.id === toyId)
    if (asset) {
      setToyAsset(asset)
    } else {
      setError(`Toy asset not found: ${toyId}`)
      setIsLoading(false)
    }
  }, [toyId])

  // Load the appropriate asset based on interaction
  useEffect(() => {
    if (!toyAsset) return

    const loadAsset = async () => {
      setIsLoading(true)
      setError(null)

      try {
        // Use emoji as fallback if SVG loading fails
        const emojiFallback = getEmojiFallback(toyId)
        
        // Determine which asset to load based on interaction
        let assetToLoad = toyAsset.base || toyAsset.url
        
        if (interaction === 'drag' && toyAsset.interactions?.drag) {
          assetToLoad = toyAsset.interactions.drag
        } else if (interaction === 'share' && toyAsset.interactions?.share) {
          assetToLoad = toyAsset.interactions.share
        } else if (interaction === 'bounce' && toyAsset.interactions?.bounce) {
          // For bounce, we'll use Lottie animation if available
          if (typeof toyAsset.interactions.bounce === 'object' && toyAsset.interactions.bounce.type === 'lottie') {
            try {
              const lottieData = await assetManager.loadAsset(toyAsset.interactions.bounce.data)
              setCurrentAsset(JSON.stringify(lottieData))
              setIsLoading(false)
              return
            } catch (lottieError) {
              console.warn(`Failed to load Lottie animation for ${toyId}, using base asset:`, lottieError)
            }
          } else if (typeof toyAsset.interactions.bounce === 'string') {
            assetToLoad = toyAsset.interactions.bounce
          }
        }

        // Load SVG asset
        if (typeof assetToLoad === 'string' && assetToLoad.endsWith('.svg')) {
          try {
            const svgContent = await assetManager.loadAsset(assetToLoad)
            setCurrentAsset(svgContent)
          } catch (svgError) {
            console.warn(`Failed to load SVG for ${toyId}, using emoji fallback:`, svgError)
            setCurrentAsset(emojiFallback)
          }
        } else {
          setCurrentAsset(emojiFallback)
        }
      } catch (error) {
        console.error('Error loading toy asset:', error)
        setError('Failed to load toy')
        setCurrentAsset(getEmojiFallback(toyId))
      } finally {
        setIsLoading(false)
      }
    }

    loadAsset()
  }, [toyAsset, interaction])

  // Handle interaction effects
  useEffect(() => {
    if (interaction !== 'idle') {
      setIsInteracting(true)
      const timer = setTimeout(() => {
        setIsInteracting(false)
      }, reducedMotion ? ANIMATION_TIMING.interaction.fast : ANIMATION_TIMING.interaction.slow)

      return () => clearTimeout(timer)
    }
  }, [interaction, reducedMotion])

  const getEmojiFallback = (id: string): string => {
    const emojiMap: Record<string, string> = {
      ball: '⚽',
      music_box: '🎵',
      gift: '🎁'
    }
    return emojiMap[id] || '🎮'
  }

  const handleDragStart = (event: any, info: any) => {
    setIsInteracting(true)
    onDragStart?.()
  }

  const handleDragEnd = () => {
    setIsInteracting(false)
    onDragEnd?.()
  }

  const containerSize = sizeMap[size]
  const borderColor = interactionColors[interaction]
  const shouldReduceMotion = reducedMotion || isInteracting

  if (isLoading) {
    return (
      <div
        className={`inline-flex items-center justify-center bg-gray-100 rounded-lg border-2 ${borderColor} ${className}`}
        style={{ width: containerSize.width, height: containerSize.height }}
      >
        <div className="animate-pulse text-gray-400">
          <div className="w-6 h-6 bg-gray-300 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={`${toyId}-${interaction}`}
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ 
          scale: 1, 
          opacity: 1,
          ...(!shouldReduceMotion ? interactionVariants[interaction] : {})
        }}
        exit={{ scale: 0.8, opacity: 0 }}
        transition={{ 
          duration: shouldReduceMotion ? 0 : ANIMATION_TIMING.entrance.fast / 1000,
          ease: 'easeOut'
        }}
        className={`asset-container ${className}`}
        style={{ width: containerSize.width, height: containerSize.height }}
        onClick={onClick}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        draggable={!!onDragStart}
        role={enableAccessibility ? 'img' : undefined}
        aria-label={enableAccessibility ? `${toyAsset?.name} - ${interaction}` : undefined}
        whileHover={onClick && shouldEnableAnimations() ? { 
          scale: 1.05,
          transition: { 
            duration: ANIMATION_TIMING.interaction.fast / 1000,
            ease: 'easeOut'
          }
        } : {}}
        whileTap={onClick && shouldEnableAnimations() ? { 
          scale: 0.95,
          transition: { 
            duration: ANIMATION_TIMING.interaction.fast / 1000,
            ease: 'easeIn'
          }
        } : {}}
      >
        <div
          className={`w-full h-full rounded-lg border-2 ${borderColor} bg-white shadow-md flex items-center justify-center overflow-hidden relative`}
        >
          {currentAsset.startsWith('<svg') ? (
            <div
              dangerouslySetInnerHTML={{ __html: currentAsset }}
              className="w-full h-full"
              style={{ 
                filter: isDragging ? 'brightness(1.1) drop-shadow(0 0 8px rgba(59, 130, 246, 0.5))' : 'none'
              }}
            />
          ) : (
            <span className="text-xl">{currentAsset}</span>
          )}
          
          {/* Interaction effects */}
          {showEffects && isInteracting && (
            <>
              {interaction === 'share' && (
                <motion.div
                  className="absolute inset-0 bg-pink-200 opacity-30 rounded-lg"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1.5 }}
                  exit={{ scale: 0, opacity: 0 }}
                  transition={{ duration: 0.5 }}
                />
              )}
              
              {interaction === 'bounce' && (
                <motion.div
                  className="absolute -inset-2 bg-yellow-200 opacity-20 rounded-full"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1.2 }}
                  exit={{ scale: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                />
              )}
              
              {interaction === 'drag' && (
                <motion.div
                  className="absolute -inset-1 bg-blue-200 opacity-20 rounded-lg"
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 0.5, repeat: Infinity }}
                />
              )}
            </>
          )}
        </div>
        
        {/* Sparkle effects for special interactions */}
        {showEffects && interaction === 'share' && isInteracting && (
          <>
            {[...Array(3)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 bg-pink-400 rounded-full"
                initial={{ 
                  x: containerSize.width / 2,
                  y: containerSize.height / 2,
                  scale: 0
                }}
                animate={{ 
                  x: containerSize.width / 2 + (i - 1) * 20,
                  y: containerSize.height / 2 - 20,
                  scale: [0, 1, 0]
                }}
                transition={{ 
                  duration: 0.8,
                  delay: i * 0.1,
                  ease: "easeOut"
                }}
              />
            ))}
          </>
        )}
      </motion.div>
    </AnimatePresence>
  )
}

// Utility hook for toy interaction management
export const useToyInteraction = () => {
  const [interaction, setInteraction] = useState<ToyInteraction>('idle')
  const [isDragging, setIsDragging] = useState(false)

  const startDrag = () => {
    setIsDragging(true)
    setInteraction('drag')
  }

  const endDrag = () => {
    setIsDragging(false)
    setInteraction('idle')
  }

  const shareToy = () => {
    setInteraction('share')
    setTimeout(() => setInteraction('idle'), 300)
  }

  const bounceToy = () => {
    setInteraction('bounce')
    setTimeout(() => setInteraction('idle'), 400)
  }

  return {
    interaction,
    isDragging,
    startDrag,
    endDrag,
    shareToy,
    bounceToy
  }
}

// Batch toy renderer for performance
export const ToyGroup: React.FC<{
  toys: Array<{
    id: string
    toyId: string
    interaction?: ToyInteraction
    position: { x: number; y: number }
    size?: ToySize
    onDragStart?: (toyId: string) => void
    onDragEnd?: (toyId: string) => void
    onClick?: (toyId: string) => void
  }>
  reducedMotion?: boolean
  showEffects?: boolean
}> = ({ toys, reducedMotion = false, showEffects = true }) => {
  return (
    <>
      {toys.map((toy, index) => (
        <motion.div
          key={toy.id}
          className="absolute"
          style={{ left: toy.position.x, top: toy.position.y }}
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: index * 0.1 }}
        >
          <ToyRenderer
            toyId={toy.toyId}
            interaction={toy.interaction}
            size={toy.size || 'medium'}
            onDragStart={() => toy.onDragStart?.(toy.toyId)}
            onDragEnd={() => toy.onDragEnd?.(toy.toyId)}
            onClick={() => toy.onClick?.(toy.toyId)}
            reducedMotion={reducedMotion}
            showEffects={showEffects}
          />
        </motion.div>
      ))}
    </>
  )
}

export default ToyRenderer