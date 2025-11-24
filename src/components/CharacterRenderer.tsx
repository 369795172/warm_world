import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { assetManager, ASSET_MANIFEST, type AssetMetadata } from '../config/assetConfig'
import { optimizeVariants, shouldEnableAnimations, ANIMATION_TIMING } from '../utils/performance'
import { ANIMATION_EASING } from '../config/animationConfig'

export type CharacterExpression = 'neutral' | 'happy' | 'excited' | 'sad' | 'surprised'
export type CharacterAnimation = 'idle' | 'wave' | 'jump'

export interface CharacterRendererProps {
  characterId: string
  expression?: CharacterExpression
  animation?: CharacterAnimation
  size?: 'small' | 'medium' | 'large'
  className?: string
  onClick?: () => void
  onAnimationComplete?: () => void
  enableAccessibility?: boolean
  reducedMotion?: boolean
}

const sizeMap = {
  small: { width: 48, height: 48 },
  medium: { width: 64, height: 64 },
  large: { width: 80, height: 80 }
}

const animationVariants = optimizeVariants({
  idle: {
    y: [0, -2, 0],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: ANIMATION_EASING.easeInOut,
      reducedMotionDuration: 4
    }
  },
  wave: {
    rotate: [0, -10, 10, -10, 0],
    transition: {
      duration: ANIMATION_TIMING.interaction.slow / 1000,
      ease: ANIMATION_EASING.easeInOut,
      reducedMotionDuration: 0.2
    }
  },
  jump: {
    y: [0, -20, 0],
    transition: {
      duration: ANIMATION_TIMING.interaction.fast / 1000,
      ease: ANIMATION_EASING.easeOut,
      reducedMotionDuration: 0.15,
      times: [0, 0.5, 1]
    }
  }
})

const expressionColors = {
  neutral: 'border-gray-300',
  happy: 'border-green-300',
  excited: 'border-pink-300',
  sad: 'border-blue-300',
  surprised: 'border-yellow-300'
}

export const CharacterRenderer: React.FC<CharacterRendererProps> = ({
  characterId,
  expression = 'neutral',
  animation = 'idle',
  size = 'medium',
  className = '',
  onClick,
  onAnimationComplete,
  enableAccessibility = true,
  reducedMotion = false
}) => {
  const [characterAsset, setCharacterAsset] = useState<AssetMetadata | null>(null)
  const [currentAsset, setCurrentAsset] = useState<string>('')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Find character asset configuration
  useEffect(() => {
    const asset = Object.values(ASSET_MANIFEST.assets).find(char => char.id === characterId && char.category === 'characters')
    if (asset) {
      setCharacterAsset(asset)
    } else {
      setError(`Character asset not found: ${characterId}`)
      setIsLoading(false)
    }
  }, [characterId])

  // Load the appropriate asset based on expression
  useEffect(() => {
    if (!characterAsset) return

    const loadAsset = async () => {
      setIsLoading(true)
      setError(null)

      try {
        // Use emoji as fallback if SVG loading fails
        const emojiFallback = getEmojiFallback(characterId, expression)
        
        // Load the main character asset
        try {
          const svgContent = await assetManager.loadAsset(characterAsset.id)
          setCurrentAsset(svgContent)
        } catch (svgError) {
          console.warn(`Failed to load SVG for ${characterId}, using emoji fallback:`, svgError)
          setCurrentAsset(emojiFallback)
        }
      } catch (error) {
        console.error('Error loading character asset:', error)
        setError('Failed to load character')
        setCurrentAsset(getEmojiFallback(characterId, expression))
      } finally {
        setIsLoading(false)
      }
    }

    loadAsset()
  }, [characterAsset, expression])

  const getEmojiFallback = (id: string, expr: CharacterExpression): string => {
    const emojiMap: Record<string, Record<CharacterExpression, string>> = {
      bunny: {
        neutral: '🐰',
        happy: '🐰',
        excited: '🐰',
        sad: '🐰',
        surprised: '🐰'
      },
      bear: {
        neutral: '🐻',
        happy: '🐻',
        excited: '🐻',
        sad: '🐻',
        surprised: '🐻'
      },
      parent: {
        neutral: '👨‍👩‍👧‍👦',
        happy: '👨‍👩‍👧‍👦',
        excited: '👨‍👩‍👧‍👦',
        sad: '👨‍👩‍👧‍👦',
        surprised: '👨‍👩‍👧‍👦'
      }
    }
    return emojiMap[id]?.[expr] || '😊'
  }

  const handleAnimationComplete = () => {
    if (onAnimationComplete) {
      onAnimationComplete()
    }
  }

  const containerSize = sizeMap[size]
  const borderColor = expressionColors[expression]

  if (isLoading) {
    return (
      <div
        className={`inline-flex items-center justify-center bg-gray-100 rounded-full border-2 ${borderColor} ${className}`}
        style={{ width: containerSize.width, height: containerSize.height }}
      >
        <div className="animate-pulse text-gray-400">
          <div className="w-6 h-6 bg-gray-300 rounded-full"></div>
        </div>
      </div>
    )
  }

  const shouldAnimate = !reducedMotion && animation !== 'idle' && shouldEnableAnimations()
  const animationDuration = reducedMotion ? 0 : ANIMATION_TIMING.entrance.normal / 1000

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={`${characterId}-${expression}`}
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ 
          scale: 1, 
          opacity: 1,
          ...(shouldAnimate ? animationVariants[animation] : {})
        }}
        exit={{ scale: 0.8, opacity: 0 }}
        transition={{ 
          duration: animationDuration,
          ease: ANIMATION_EASING.easeOut as any
        }}
        onAnimationComplete={handleAnimationComplete}
        className={`asset-container ${className}`}
        style={{ width: containerSize.width, height: containerSize.height }}
        onClick={onClick}
        role={enableAccessibility ? 'img' : undefined}
        aria-label={enableAccessibility ? `${characterAsset?.name} - ${expression}` : undefined}
        whileHover={onClick && shouldEnableAnimations() ? { 
          scale: 1.05,
          transition: { 
            duration: ANIMATION_TIMING.interaction.fast / 1000,
            ease: ANIMATION_EASING.easeOut as any
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
          className={`w-full h-full rounded-full border-2 ${borderColor} bg-white shadow-md flex items-center justify-center overflow-hidden`}
        >
          {currentAsset.startsWith('<svg') ? (
            <div
              dangerouslySetInnerHTML={{ __html: currentAsset }}
              className="w-full h-full"
              style={{ 
                filter: expression === 'excited' ? 'brightness(1.1) saturate(1.2)' : 'none'
              }}
            />
          ) : (
            <span className="text-2xl">{currentAsset}</span>
          )}
        </div>
        
        {/* Expression indicator */}
        {expression !== 'neutral' && (
          <motion.div
            className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-white border-2 border-current flex items-center justify-center text-xs"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ 
              delay: ANIMATION_TIMING.interaction.fast / 1000,
              duration: ANIMATION_TIMING.entrance.fast / 1000,
              ease: ANIMATION_EASING.easeOut as any
            }}
          >
            {expression === 'happy' && '😊'}
            {expression === 'excited' && '🎉'}
            {expression === 'sad' && '😢'}
            {expression === 'surprised' && '😲'}
          </motion.div>
        )}
      </motion.div>
    </AnimatePresence>
  )
}

// Utility hook for character state management
export const useCharacterState = (initialExpression: CharacterExpression = 'neutral') => {
  const [expression, setExpression] = useState<CharacterExpression>(initialExpression)
  const [isAnimating, setIsAnimating] = useState(false)

  const changeExpression = (newExpression: CharacterExpression, duration: number = 2000) => {
    setExpression(newExpression)
    setIsAnimating(true)
    
    setTimeout(() => {
      setExpression('neutral')
      setIsAnimating(false)
    }, duration)
  }

  const triggerAnimation = (animation: CharacterAnimation, duration: number = 1000) => {
    setIsAnimating(true)
    
    setTimeout(() => {
      setIsAnimating(false)
    }, duration)
  }

  return {
    expression,
    isAnimating,
    changeExpression,
    triggerAnimation
  }
}

// Batch character renderer for performance
export const CharacterGroup: React.FC<{
  characters: Array<{
    id: string
    expression?: CharacterExpression
    animation?: CharacterAnimation
    position: { x: number; y: number }
    size?: 'small' | 'medium' | 'large'
  }>
  onCharacterClick?: (characterId: string) => void
  reducedMotion?: boolean
}> = ({ characters, onCharacterClick, reducedMotion = false }) => {
  return (
    <>
      {characters.map((character, index) => (
        <motion.div
          key={character.id}
          className="absolute"
          style={{ left: character.position.x, top: character.position.y }}
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: index * 0.1 }}
        >
          <CharacterRenderer
            characterId={character.id}
            expression={character.expression}
            animation={character.animation}
            size={character.size || 'medium'}
            onClick={() => onCharacterClick?.(character.id)}
            reducedMotion={reducedMotion}
          />
        </motion.div>
      ))}
    </>
  )
}

export default CharacterRenderer