import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { assetManager } from '../config/assetConfig'
import { optimizeVariants, shouldEnableAnimations, ANIMATION_TIMING } from '../utils/performance'

export interface WeatherEffectProps {
  type: 'sunny' | 'cloudy' | 'rainy' | 'light-spots'
  intensity?: 'light' | 'medium' | 'heavy'
  reducedMotion?: boolean
  className?: string
  'aria-label'?: string
}

export const WeatherEffect: React.FC<WeatherEffectProps> = ({
  type,
  intensity = 'light',
  reducedMotion = false,
  className = '',
  'aria-label': ariaLabel
}) => {
  const [weatherAssets, setWeatherAssets] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Weather configurations
  const weatherConfig = {
    sunny: {
      assetIds: ['weather_sunny', 'light_spot'],
      particleCount: intensity === 'light' ? 2 : intensity === 'medium' ? 4 : 6,
      animationDuration: reducedMotion ? 8 : 20
    },
    cloudy: {
      assetIds: ['weather_cloud'],
      particleCount: intensity === 'light' ? 1 : intensity === 'medium' ? 2 : 3,
      animationDuration: reducedMotion ? 15 : 30
    },
    rainy: {
      assetIds: ['weather_rain', 'weather_cloud'],
      particleCount: intensity === 'light' ? 3 : intensity === 'medium' ? 6 : 10,
      animationDuration: reducedMotion ? 5 : 15
    },
    'light-spots': {
      assetIds: ['light_spot'],
      particleCount: intensity === 'light' ? 3 : intensity === 'medium' ? 5 : 8,
      animationDuration: reducedMotion ? 6 : 12
    }
  }

  const config = weatherConfig[type]

  // Load weather assets
  useEffect(() => {
    const loadWeatherAssets = async () => {
      setIsLoading(true)
      try {
        const assets = await Promise.all(
          config.assetIds.map(async (assetId) => {
            try {
              const asset = await assetManager.loadAsset(assetId)
              return asset
            } catch (error) {
              console.warn(`Failed to load weather asset: ${assetId}`, error)
              // Fallback to emoji
              const fallbackId = assetId + '_emoji'
              const fallbackAsset = assetManager.getAsset(fallbackId)
              return fallbackAsset && fallbackAsset.type === 'emoji' ? fallbackAsset.src : '✨'
            }
          })
        )
        setWeatherAssets(assets)
      } catch (error) {
        console.warn('Failed to load weather assets:', error)
        setWeatherAssets(['✨', '☀️', '☁️', '💧'])
      } finally {
        setIsLoading(false)
      }
    }

    loadWeatherAssets()
  }, [type, intensity])

  // Generate random positions for particles
  const generateParticles = () => {
    return Array.from({ length: config.particleCount }, (_, i) => ({
      id: `particle-${i}`,
      x: Math.random() * 100,
      y: Math.random() * 100,
      delay: Math.random() * 2,
      duration: config.animationDuration + Math.random() * 10,
      size: 0.5 + Math.random() * 0.5,
      rotation: Math.random() * 360
    }))
  }

  const particles = generateParticles()

  // Animation variants for different weather types
  const sunnyVariants = optimizeVariants({
    initial: { opacity: 0, scale: 0, rotate: 0 },
    animate: {
      opacity: [0, 0.6, 0.3, 0.6, 0],
      scale: [0.5, 1.2, 1, 1.2, 0.5],
      rotate: [0, 180, 360, 540, 720],
      transition: {
        duration: config.animationDuration,
        ease: ANIMATION_TIMING.easing.easeInOut,
        repeat: Infinity,
        repeatType: "loop" as const,
        reducedMotionDuration: config.animationDuration * 2
      }
    }
  })

  const cloudVariants = optimizeVariants({
    initial: { x: -20, opacity: 0 },
    animate: {
      x: [0, 20, 0, -20, 0],
      opacity: [0, 0.8, 0.6, 0.8, 0],
      transition: {
        duration: config.animationDuration,
        ease: ANIMATION_TIMING.easing.easeInOut,
        repeat: Infinity,
        repeatType: "loop" as const,
        reducedMotionDuration: config.animationDuration * 1.5
      }
    }
  })

  const rainVariants = optimizeVariants({
    initial: { y: -10, opacity: 0 },
    animate: {
      y: [0, 100],
      opacity: [0, 1, 1, 0],
      transition: {
        duration: config.animationDuration / 2,
        ease: ANIMATION_TIMING.easing.linear,
        repeat: Infinity,
        repeatType: "loop" as const,
        reducedMotionDuration: config.animationDuration
      }
    }
  })

  const lightSpotVariants = optimizeVariants({
    initial: { opacity: 0, scale: 0 },
    animate: {
      opacity: [0, 0.4, 0.2, 0.4, 0],
      scale: [0, 1.5, 1, 1.5, 0],
      transition: {
        duration: config.animationDuration,
        ease: ANIMATION_TIMING.easing.easeInOut,
        repeat: Infinity,
        repeatType: "loop" as const,
        reducedMotionDuration: config.animationDuration * 1.5
      }
    }
  })

  const getVariants = () => {
    switch (type) {
      case 'sunny': return sunnyVariants
      case 'cloudy': return cloudVariants
      case 'rainy': return rainVariants
      case 'light-spots': return lightSpotVariants
      default: return sunnyVariants
    }
  }

  if (isLoading) {
    return (
      <div 
        className={`absolute inset-0 ${className}`}
        role="presentation"
        aria-label={ariaLabel || '天气效果加载中'}
        aria-busy="true"
      >
        <div className="absolute top-4 right-4 w-8 h-8 bg-yellow-200 rounded-full opacity-40 animate-pulse"></div>
      </div>
    )
  }

  return (
    <div 
      className={`absolute inset-0 pointer-events-none ${className}`}
      role="presentation"
      aria-label={ariaLabel || `${type === 'sunny' ? '阳光' : type === 'cloudy' ? '云朵' : type === 'rainy' ? '雨滴' : '光斑'}天气效果`}
    >
      <AnimatePresence>
        {particles.map((particle) => {
          const assetIndex = particle.id.charCodeAt(particle.id.length - 1) % weatherAssets.length
          const asset = weatherAssets[assetIndex]
          
          return (
            <motion.div
              key={particle.id}
              className="absolute"
              style={{
                left: `${particle.x}%`,
                top: `${particle.y}%`,
                transform: `scale(${particle.size}) rotate(${particle.rotation}deg)`
              }}
              variants={getVariants()}
              initial="initial"
              animate="animate"
              transition={{ delay: particle.delay }}
            >
              {asset && asset.startsWith('<svg') ? (
                <div 
                  dangerouslySetInnerHTML={{ __html: asset }}
                  className="w-8 h-8"
                />
              ) : (
                <span className="text-2xl text-yellow-400 opacity-80">
                  {asset || '✨'}
                </span>
              )}
            </motion.div>
          )
        })}
      </AnimatePresence>

      {/* Additional atmospheric effects */}
      {type === 'sunny' && (
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-yellow-100 to-transparent opacity-20"
          animate={{
            opacity: [0.1, 0.3, 0.1]
          }}
          transition={{
            duration: reducedMotion ? 10 : 20,
            ease: "easeInOut",
            repeat: Infinity,
            repeatType: "reverse"
          }}
        />
      )}

      {type === 'rainy' && (
        <motion.div
          className="absolute inset-0 bg-gradient-to-b from-gray-200 to-transparent opacity-30"
          animate={{
            opacity: [0.2, 0.4, 0.2]
          }}
          transition={{
            duration: reducedMotion ? 8 : 15,
            ease: "easeInOut",
            repeat: Infinity,
            repeatType: "reverse"
          }}
        />
      )}

      {type === 'light-spots' && (
        <motion.div
          className="absolute inset-0"
          animate={{
            background: [
              'radial-gradient(circle at 20% 30%, rgba(255,255,255,0.1) 0%, transparent 50%)',
              'radial-gradient(circle at 80% 70%, rgba(255,255,255,0.15) 0%, transparent 50%)',
              'radial-gradient(circle at 20% 30%, rgba(255,255,255,0.1) 0%, transparent 50%)'
            ]
          }}
          transition={{
            duration: reducedMotion ? 8 : 16,
            ease: "easeInOut",
            repeat: Infinity,
            repeatType: "loop"
          }}
        />
      )}
    </div>
  )
}

export default WeatherEffect