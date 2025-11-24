import React, { useState, useEffect } from 'react'
import { useAppStore } from '../store/appStore'
import { Heart, Home, TreePine, Sparkles, Cloud, Mountain } from 'lucide-react'
import NavigationBar from './NavigationBar'
import { motion, AnimatePresence } from 'framer-motion'
import { ANIMATION_EASING } from '../config/animationConfig'
import { backgroundAssets, assetManager } from '../config/assetConfig'
import '../styles/design-system.css'

const TownView: React.FC = () => {
  const { setCurrentScene, recordBehavior, updateSettings } = useAppStore()
  const [hoveredArea, setHoveredArea] = useState<string | null>(null)
  const [animationClass, setAnimationClass] = useState('')
  const [backgroundLayers, setBackgroundLayers] = useState<{
    sky: string
    mountains: string
    clouds: string
    foreground: string
  } | null>(null)
  const [isLoadingBackground, setIsLoadingBackground] = useState(true)
  const [reducedMotion, setReducedMotion] = useState(false)

  // Load layered background assets
  useEffect(() => {
    const loadBackgroundAssets = async () => {
      setIsLoadingBackground(true)
      try {
        // Load individual background assets instead of layered ones
        const [sky, mountains, clouds, foreground] = await Promise.all([
          assetManager.loadAsset('garden_sky_bg'),
          assetManager.loadAsset('home_room_bg'), // Using room bg as mountains substitute
          assetManager.loadAsset('garden_sky_bg'), // Using same sky for clouds
          assetManager.loadAsset('town_view_bg')
        ])
        
        setBackgroundLayers({ sky, mountains, clouds, foreground })
      } catch (error) {
        console.warn('Failed to load background assets, using CSS gradients:', error)
      } finally {
        setIsLoadingBackground(false)
      }
    }

    loadBackgroundAssets()
  }, [])

  // Check for reduced motion preference
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReducedMotion(mediaQuery.matches)
    
    const handleChange = (e: MediaQueryListEvent) => {
      setReducedMotion(e.matches)
    }
    
    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  useEffect(() => {
    setAnimationClass('animate-fade-in')
  }, [])

  const handleAreaClick = (area: 'home' | 'garden') => {
    // Add a gentle bounce animation
    setAnimationClass('animate-bounce')
    setTimeout(() => setAnimationClass(''), 500)
    
    // Record exploration behavior
    recordBehavior({
      action: 'explore',
      scene: area
    })
    
    // Navigate to scene after short delay
    setTimeout(() => {
      setCurrentScene(area)
    }, 300)
  }

  const areas = [
    {
      id: 'home',
      name: '温馨小家',
      icon: Home,
      color: 'from-pink-200 to-pink-300',
      hoverColor: 'from-pink-300 to-pink-400',
      position: 'left-20 top-1/2 -translate-y-1/2',
      description: '温暖的家，可以分享玩具和互动'
    },
    {
      id: 'garden',
      name: '美丽花园',
      icon: TreePine,
      color: 'from-green-200 to-green-300',
      hoverColor: 'from-green-300 to-green-400',
      position: 'right-20 top-1/2 -translate-y-1/2',
      description: '美丽的花园，可以种植和照顾植物'
    }
  ]

  const handleSettingsClick = () => {
    updateSettings({ parentMode: true })
  }

  // Layered background animation variants
  const backgroundVariants = {
    sky: {
      initial: { opacity: 0 },
      animate: { 
        opacity: 1,
        transition: { duration: reducedMotion ? 0 : 1, ease: 'easeOut' as any }
      }
    },
    mountains: {
      initial: { opacity: 0, y: 50 },
      animate: { 
        opacity: 1, 
        y: 0,
        transition: { duration: reducedMotion ? 0 : 1.2, ease: ANIMATION_EASING.easeOut as any, delay: 0.2 }
      }
    },
    clouds: {
      initial: { opacity: 0, x: -100 },
      animate: { 
        opacity: 1, 
        x: 0,
        transition: { duration: reducedMotion ? 0 : 1.5, ease: ANIMATION_EASING.easeOut as any, delay: 0.4 }
      }
    },
    foreground: {
      initial: { opacity: 0, y: 100 },
      animate: { 
        opacity: 1, 
        y: 0,
        transition: { duration: reducedMotion ? 0 : 1.8, ease: ANIMATION_EASING.easeOut as any, delay: 0.6 }
      }
    }
  }

  // Floating animation for decorative elements
  const floatingAnimation = {
    initial: { y: 0 },
    animate: {
      y: [0, -10, 0],
      transition: {
        duration: reducedMotion ? 0 : 3,
        repeat: Infinity,
        ease: ANIMATION_EASING.easeInOut as any
      }
    }
  }

  return (
    <div className={`min-h-screen flex items-center justify-center p-8 transition-all duration-500 ${animationClass} relative overflow-hidden`}>
      {/* Layered Background */}
      <AnimatePresence>
        {!isLoadingBackground && (
          <>
            {/* Sky Layer */}
            <motion.div
              className="absolute inset-0 z-0"
              variants={backgroundVariants.sky}
              initial="initial"
              animate="animate"
            >
              {backgroundLayers?.sky ? (
                <div 
                  dangerouslySetInnerHTML={{ __html: backgroundLayers.sky }}
                  className="w-full h-full"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-b from-blue-200 via-blue-100 to-blue-50" />
              )}
            </motion.div>

            {/* Mountains Layer */}
            <motion.div
              className="absolute inset-0 z-10"
              variants={backgroundVariants.mountains}
              initial="initial"
              animate="animate"
            >
              {backgroundLayers?.mountains ? (
                <div 
                  dangerouslySetInnerHTML={{ __html: backgroundLayers.mountains }}
                  className="w-full h-full"
                />
              ) : (
                <div className="absolute bottom-0 left-0 right-0 h-64">
                  <Mountain className="w-full h-full text-blue-300 opacity-60" />
                </div>
              )}
            </motion.div>

            {/* Clouds Layer */}
            <motion.div
              className="absolute inset-0 z-20"
              variants={backgroundVariants.clouds}
              initial="initial"
              animate="animate"
            >
              {backgroundLayers?.clouds ? (
                <div 
                  dangerouslySetInnerHTML={{ __html: backgroundLayers.clouds }}
                  className="w-full h-full"
                />
              ) : (
                <>
                  <div className="absolute top-20 left-10 w-16 h-8 bg-white rounded-full opacity-70" />
                  <div className="absolute top-32 right-20 w-20 h-10 bg-white rounded-full opacity-60" />
                  <div className="absolute top-16 left-1/3 w-12 h-6 bg-white rounded-full opacity-50" />
                </>
              )}
            </motion.div>

            {/* Foreground Layer */}
            <motion.div
              className="absolute inset-0 z-30"
              variants={backgroundVariants.foreground}
              initial="initial"
              animate="animate"
            >
              {backgroundLayers?.foreground ? (
                <div 
                  dangerouslySetInnerHTML={{ __html: backgroundLayers.foreground }}
                  className="w-full h-full"
                />
              ) : (
                <div className="absolute bottom-0 left-0 right-0 h-32">
                  <div className="w-full h-full bg-gradient-to-t from-green-200 to-transparent opacity-40" />
                  <div className="absolute bottom-0 left-0 right-0 h-16 bg-green-300 opacity-60" />
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Loading state */}
      {isLoadingBackground && (
        <div className="absolute inset-0 z-0 bg-gradient-to-b from-blue-200 via-blue-100 to-blue-50" />
      )}

      {/* Navigation Bar */}
      <NavigationBar 
        title="小小世界"
        showHomeButton={false}
        showSettingsButton={true}
      />
      
      {/* Central Content */}
      <motion.div 
        className="relative w-full max-w-4xl pt-20 z-40"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: reducedMotion ? 0 : 0.8, delay: 0.8 }}
      >
        {/* Central plaza with enhanced animation */}
        <motion.div 
          className="bg-white bg-opacity-90 rounded-full w-80 h-80 mx-auto flex items-center justify-center shadow-xl border-4 border-yellow-200 relative overflow-hidden"
          whileHover={{ scale: 1.05 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          {/* Animated background pattern */}
          <motion.div
            className="absolute inset-0 opacity-20"
            animate={{
              background: [
                'radial-gradient(circle at 20% 80%, var(--color-primary-300) 0%, transparent 50%)',
                'radial-gradient(circle at 80% 20%, var(--color-secondary-300) 0%, transparent 50%)',
                'radial-gradient(circle at 20% 80%, var(--color-primary-300) 0%, transparent 50%)'
              ]
            }}
            transition={{ duration: reducedMotion ? 0 : 4, repeat: Infinity }}
          />
          
          <div className="text-center relative z-10">
            <motion.div
              variants={floatingAnimation}
              animate="animate"
            >
              <Sparkles className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
            </motion.div>
            <h1 className="text-2xl font-bold text-yellow-800 mb-2">小小世界</h1>
            <p className="text-yellow-700 text-sm">点击想去的地方开始探险</p>
          </div>
        </motion.div>

        {/* Scene areas with enhanced animations */}
        {areas.map((area, index) => {
          const IconComponent = area.icon
          const isHovered = hoveredArea === area.id
          
          return (
            <motion.div
              key={area.id}
              className={`absolute ${area.position}`}
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ 
                duration: reducedMotion ? 0 : 0.6, 
                delay: 1 + index * 0.2,
                type: "spring",
                stiffness: 200
              }}
            >
              <motion.div
                className={`bg-gradient-to-br ${isHovered ? area.hoverColor : area.color} rounded-2xl p-6 cursor-pointer transition-all duration-300 border-2 border-white shadow-lg relative overflow-hidden`}
                onMouseEnter={() => setHoveredArea(area.id)}
                onMouseLeave={() => setHoveredArea(null)}
                onClick={() => handleAreaClick(area.id as 'home' | 'garden')}
                whileHover={{ 
                  scale: 1.08,
                  boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)"
                }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 400 }}
              >
                {/* Animated background glow */}
                <motion.div
                  className="absolute inset-0 opacity-0"
                  animate={{
                    opacity: isHovered ? 0.3 : 0,
                    background: `radial-gradient(circle at center, white 0%, transparent 70%)`
                  }}
                  transition={{ duration: 0.3 }}
                />
                
                <div className="text-center relative z-10">
                  <motion.div
                    animate={isHovered ? { rotate: [0, 10, -10, 0] } : {}}
                    transition={{ duration: 0.5, repeat: isHovered ? Infinity : 0 }}
                  >
                    <IconComponent className="w-12 h-12 mx-auto mb-3 text-gray-700" />
                  </motion.div>
                  
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">{area.name}</h3>
                  <p className="text-sm text-gray-600 max-w-32">{area.description}</p>
                  
                  {/* Enhanced hint animation */}
                  <AnimatePresence>
                    {isHovered && (
                      <motion.div
                        className="mt-3"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        transition={{ duration: 0.3 }}
                      >
                        <Heart className="w-6 h-6 text-pink-400 mx-auto" />
                        <motion.p
                          className="text-xs text-pink-500 mt-1"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.2 }}
                        >
                          点击进入
                        </motion.p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            </motion.div>
          )
        })}

        {/* Enhanced floating elements */}
        <motion.div
          className="absolute top-10 left-1/2 -translate-x-1/2"
          variants={floatingAnimation}
          animate="animate"
          transition={{ delay: 0.5 }}
        >
          <Cloud className="w-8 h-8 text-blue-200 opacity-60" />
        </motion.div>
        
        <motion.div
          className="absolute bottom-10 left-1/4"
          variants={floatingAnimation}
          animate="animate"
          transition={{ delay: 1 }}
        >
          <div className="w-6 h-6 bg-purple-200 rounded-full opacity-50" />
        </motion.div>
        
        <motion.div
          className="absolute bottom-20 right-1/4"
          variants={floatingAnimation}
          animate="animate"
          transition={{ delay: 1.5 }}
        >
          <div className="w-10 h-10 bg-green-200 rounded-full opacity-40" />
        </motion.div>
      </motion.div>

      {/* Enhanced instruction with animation */}
      <motion.div 
        className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-white bg-opacity-95 rounded-full px-6 py-3 shadow-xl"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: reducedMotion ? 0 : 1, delay: 1.5 }}
      >
        <motion.p 
          className="text-sm text-gray-700 font-medium flex items-center gap-2"
          animate={{ opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <Heart className="w-4 h-4 text-pink-500" />
          想去哪里玩呢？点击看看吧！
          <Heart className="w-4 h-4 text-pink-500" />
        </motion.p>
      </motion.div>
    </div>
  )
}

export default TownView