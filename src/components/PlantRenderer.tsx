import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { assetManager } from '../config/assetConfig'
import { ANIMATION_TIMING, ANIMATION_EASING } from '../config/animationConfig'
import { optimizeVariants, shouldEnableAnimations } from '../utils/performance'

export interface PlantRendererProps {
  plantStage: 'empty' | 'seed' | 'sprout' | 'small' | 'flowering'
  plantType: 'flower' | 'tree' | 'vegetable'
  size?: 'small' | 'medium' | 'large'
  isWatered?: boolean
  isGrowing?: boolean
  reducedMotion?: boolean
  className?: string
  'aria-label'?: string
  role?: string
}

export const PlantRenderer: React.FC<PlantRendererProps> = ({
  plantStage,
  plantType,
  size = 'medium',
  isWatered = false,
  isGrowing = false,
  reducedMotion = false,
  className = '',
  'aria-label': ariaLabel,
  role = 'img'
}) => {
  const [plantAsset, setPlantAsset] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Map plant stages to asset IDs
  const getPlantAssetId = (stage: string, type: string): string => {
    if (stage === 'empty') return 'seed_emoji'
    if (stage === 'seed') return 'plant_seed'
    if (stage === 'sprout') return 'plant_sprout'
    if (stage === 'small') return 'plant_small'
    if (stage === 'flowering') {
      if (type === 'flower') return 'plant_flower'
      if (type === 'tree') return 'plant_tree'
      if (type === 'vegetable') return 'plant_vegetable'
      return 'plant_flowering'
    }
    return 'seed_emoji'
  }

  // Load plant asset
  useEffect(() => {
    const loadPlantAsset = async () => {
      setIsLoading(true)
      try {
        const assetId = getPlantAssetId(plantStage, plantType)
        const asset = await assetManager.loadAsset(assetId)
        setPlantAsset(asset)
      } catch (error) {
        console.warn('Failed to load plant asset:', error)
        // Fallback to emoji
        const fallbackId = getPlantAssetId(plantStage, plantType) + '_emoji'
        const fallbackAsset = assetManager.getAsset(fallbackId)
        if (fallbackAsset && fallbackAsset.type === 'emoji') {
          setPlantAsset(fallbackAsset.src)
        }
      } finally {
        setIsLoading(false)
      }
    }

    loadPlantAsset()
  }, [plantStage, plantType])

  // Size configurations
  const sizeConfig = {
    small: { width: 32, height: 32, scale: 0.8 },
    medium: { width: 48, height: 48, scale: 1.0 },
    large: { width: 64, height: 64, scale: 1.2 }
  }

  const currentSize = sizeConfig[size]

  // Animation variants
  const containerVariants = optimizeVariants({
    initial: { 
      scale: 0,
      opacity: 0,
      rotate: -10
    },
    animate: { 
      scale: 1,
      opacity: 1,
      rotate: 0,
      transition: {
        duration: reducedMotion ? 0.1 : ANIMATION_TIMING.entrance.normal / 1000,
        ease: ANIMATION_EASING.easeOut,
        staggerChildren: 0.1
      }
    },
    exit: { 
      scale: 0,
      opacity: 0,
      rotate: 10,
      transition: {
        duration: reducedMotion ? 0.1 : ANIMATION_TIMING.entrance.fast / 1000,
        ease: ANIMATION_EASING.easeIn
      }
    }
  })

  const growthVariants = optimizeVariants({
    idle: {
      scale: 1,
      rotate: 0,
      transition: {
        duration: reducedMotion ? 0.1 : ANIMATION_TIMING.complex.fast / 1000,
        ease: ANIMATION_EASING.easeInOut,
      }
    },
    growing: {
      scale: [1, 1.1, 1.05, 1],
      rotate: [-2, 2, -1, 0],
      transition: {
        duration: reducedMotion ? 0.2 : ANIMATION_TIMING.complex.slow / 1000,
        ease: ANIMATION_EASING.easeInOut,
        times: [0, 0.3, 0.7, 1]
      }
    },
    watered: {
      scale: [1, 1.05, 0.95, 1],
      rotate: [0, -3, 3, 0],
      transition: {
        duration: reducedMotion ? 0.2 : ANIMATION_TIMING.complex.normal / 1000,
        ease: ANIMATION_EASING.easeOut
      }
    }
  })

  const sparkleVariants = optimizeVariants({
    initial: { 
      scale: 0,
      opacity: 0,
      rotate: 0
    },
    animate: {
      scale: [0, 1, 0],
      opacity: [0, 1, 0],
      rotate: 360,
      transition: {
        duration: reducedMotion ? 0.5 : ANIMATION_TIMING.complex.normal / 1000,
        ease: ANIMATION_EASING.easeInOut,
        repeat: isGrowing || isWatered ? 2 : 0,
        repeatType: "loop" as const
      }
    }
  })

  const getAnimationState = (): keyof typeof growthVariants => {
    if (isGrowing) return 'growing'
    if (isWatered) return 'watered'
    return 'idle'
  }

  if (isLoading) {
    return (
      <div 
        className={`flex items-center justify-center bg-green-100 rounded-full ${className}`}
        style={{ width: currentSize.width, height: currentSize.height }}
        role={role}
        aria-label={ariaLabel || '植物加载中'}
        aria-busy="true"
      >
        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
      </div>
    )
  }

  if (!plantAsset) {
    return (
      <div 
        className={`flex items-center justify-center bg-green-100 rounded-full ${className}`}
        style={{ width: currentSize.width, height: currentSize.height }}
        role={role}
        aria-label={ariaLabel || '植物'}
      >
        <span className="text-green-600" role="img" aria-label="植物">🌱</span>
      </div>
    )
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={`${plantStage}-${plantType}`}
        className={`relative flex items-center justify-center ${className}`}
        style={{ width: currentSize.width, height: currentSize.height }}
        variants={containerVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        role={role}
        aria-label={ariaLabel || `${plantType} - ${plantStage}`}
      >
        {/* Main plant */}
        <motion.div
          className="relative w-full h-full flex items-center justify-center"
          variants={growthVariants}
          animate={getAnimationState() as any}
        >
          {plantAsset.startsWith('<svg') ? (
            <div 
              dangerouslySetInnerHTML={{ __html: plantAsset }}
              className="w-full h-full"
              style={{ 
                transform: `scale(${currentSize.scale})`,
                filter: isWatered ? 'brightness(1.1) saturate(1.2)' : 'none'
              }}
            />
          ) : (
            <span 
              className="text-green-600"
              style={{ 
                fontSize: `${currentSize.width * 0.6}px`,
                filter: isWatered ? 'brightness(1.1) saturate(1.2)' : 'none'
              }}
            >
              {plantAsset}
            </span>
          )}
        </motion.div>

        {/* Growth sparkle effect */}
        {(isGrowing || isWatered) && (
          <motion.div
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
            variants={sparkleVariants}
            initial="initial"
            animate="animate"
          >
            <div className="w-4 h-4 bg-yellow-300 rounded-full opacity-60"></div>
          </motion.div>
        )}

        {/* Water droplets effect */}
        {isWatered && (
          <motion.div
            className="absolute -top-2 -right-2 pointer-events-none"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ 
              scale: [0, 1, 0.8],
              opacity: [0, 1, 0],
              y: [0, -5, -10]
            }}
            transition={{ 
              duration: reducedMotion ? 0.5 : ANIMATION_TIMING.complex.normal / 1000,
              ease: ANIMATION_EASING.easeOut as any
            }}
          >
            <div className="w-3 h-3 bg-blue-400 rounded-full opacity-80"></div>
          </motion.div>
        )}

        {/* Soil/plot base for empty stage */}
        {plantStage === 'empty' && (
          <motion.div 
            className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-3 bg-amber-200 rounded-full opacity-60"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          />
        )}
      </motion.div>
    </AnimatePresence>
  )
}

export default PlantRenderer