import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAppStore } from '../store/appStore'
import { Droplets, Heart, Sprout, TreePine, Carrot } from 'lucide-react'
import NavigationBar from './NavigationBar'
import GameCanvas from './GameCanvas'
import PlantRenderer from './PlantRenderer'
import WeatherEffect from './WeatherEffect'
import { KeyboardNavigator, ScreenReaderManager, reducedMotionManager } from '../utils/accessibility'

interface Plant {
  id: string
  x: number
  y: number
  stage: 'empty' | 'seed' | 'sprout' | 'small' | 'flowering'
  lastWatered: number
  plantedTime: number
  plantType: 'flower' | 'tree' | 'vegetable'
}

interface Seed {
  id: string
  name: string
  icon: React.ElementType
  color: string
  plantType: 'flower' | 'tree' | 'vegetable'
}

const GardenScene: React.FC = () => {
  const { recordBehavior } = useAppStore()
  const usePhaser = false  // 使用修复后的界面而不是GameCanvas
  const keyboardNavigator = useRef<KeyboardNavigator>(new KeyboardNavigator())
  const gardenContainerRef = useRef<HTMLDivElement>(null)
  
  const [plants, setPlants] = useState<Plant[]>([
    { id: 'plot1', x: 150, y: 300, stage: 'empty', lastWatered: 0, plantedTime: 0, plantType: 'flower' },
    { id: 'plot2', x: 300, y: 300, stage: 'empty', lastWatered: 0, plantedTime: 0, plantType: 'tree' },
    { id: 'plot3', x: 450, y: 300, stage: 'empty', lastWatered: 0, plantedTime: 0, plantType: 'vegetable' }
  ])

  const [seeds] = useState<Seed[]>([
    { id: 'flower_seed', name: '花种子', icon: Sprout, color: 'bg-pink-200', plantType: 'flower' },
    { id: 'tree_seed', name: '树种子', icon: TreePine, color: 'bg-amber-200', plantType: 'tree' },
    { id: 'vegetable_seed', name: '蔬菜种子', icon: Carrot, color: 'bg-orange-200', plantType: 'vegetable' }
  ])

  const [draggedSeed, setDraggedSeed] = useState<Seed | null>(null)
  const [selectedTool, setSelectedTool] = useState<'seed' | 'water' | null>(null)
  const [feedback, setFeedback] = useState<{message: string, x: number, y: number} | null>(null)
  const [waterCanPosition, setWaterCanPosition] = useState({ x: 100, y: 200 })
  const [weatherType, setWeatherType] = useState<'sunny' | 'cloudy' | 'rainy' | 'light-spots'>('sunny')
  const [reducedMotion, setReducedMotion] = useState(false)
  const [justWateredPlants, setJustWateredPlants] = useState<Set<string>>(new Set())
  const [growingPlants, setGrowingPlants] = useState<Set<string>>(new Set())
  const [draggedTool, setDraggedTool] = useState<'seed' | 'water' | null>(null)
  const [waterDrops, setWaterDrops] = useState<Array<{id: string, x: number, y: number}>>([])
  const gardenRef = useRef<HTMLDivElement>(null)

  // Plant growth logic
  useEffect(() => {
    const interval = setInterval(() => {
      setPlants(prev => prev.map(plant => {
        if (plant.stage === 'empty') return plant
        
        const timeSincePlanted = Date.now() - plant.plantedTime
        
        // Growth stages based on time and watering
        if (plant.stage === 'seed' && timeSincePlanted > 5000) { // 5 seconds
          setGrowingPlants(prev => new Set(prev).add(plant.id))
          setTimeout(() => setGrowingPlants(prev => {
            const next = new Set(prev)
            next.delete(plant.id)
            return next
          }), 1500)
          return { ...plant, stage: 'sprout' }
        }
        if (plant.stage === 'sprout' && timeSincePlanted > 15000) { // 15 seconds
          setGrowingPlants(prev => new Set(prev).add(plant.id))
          setTimeout(() => setGrowingPlants(prev => {
            const next = new Set(prev)
            next.delete(plant.id)
            return next
          }), 1500)
          return { ...plant, stage: 'small' }
        }
        if (plant.stage === 'small' && timeSincePlanted > 30000) { // 30 seconds
          setGrowingPlants(prev => new Set(prev).add(plant.id))
          setTimeout(() => setGrowingPlants(prev => {
            const next = new Set(prev)
            next.delete(plant.id)
            return next
          }), 1500)
          return { ...plant, stage: 'flowering' }
        }
        
        return plant
      }))
    }, 1000)

    return () => clearInterval(interval)
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

  // Setup keyboard navigation
  useEffect(() => {
    if (gardenContainerRef.current) {
      keyboardNavigator.current.setupNavigation(gardenContainerRef.current)
    }
    
    return () => {
      keyboardNavigator.current.cleanup()
    }
  }, [])

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSelectedTool(null)
        setDraggedSeed(null)
        ScreenReaderManager.announce('工具已取消', 'polite')
      }
      
      if (e.key >= '1' && e.key <= '3') {
        const seedIndex = parseInt(e.key) - 1
        if (seeds[seedIndex]) {
          // Simulate mouse down event for keyboard users
          const mockEvent = { preventDefault: () => {}, clientX: 200, clientY: 150 } as React.MouseEvent
          handleSeedMouseDown(seeds[seedIndex], mockEvent)
          ScreenReaderManager.announce(`选择了${seeds[seedIndex].name}`, 'polite')
        }
      }
      
      if (e.key === 'w' || e.key === 'W') {
        setSelectedTool('water')
        ScreenReaderManager.announce('选择了浇水工具', 'polite')
      }
    }
    
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [seeds])

  // Weather cycle
  useEffect(() => {
    const weatherCycle = () => {
      const weathers: Array<'sunny' | 'cloudy' | 'rainy' | 'light-spots'> = ['sunny', 'cloudy', 'light-spots', 'sunny']
      let currentIndex = 0
      
      const cycle = () => {
        setWeatherType(weathers[currentIndex])
        currentIndex = (currentIndex + 1) % weathers.length
      }
      
      cycle() // Set initial weather
      const interval = setInterval(cycle, reducedMotion ? 20000 : 15000) // Change every 15-20 seconds
      
      return () => clearInterval(interval)
    }
    
    weatherCycle()
  }, [reducedMotion])

  const handleSeedMouseDown = (seed: Seed, e: React.MouseEvent) => {
    e.preventDefault()
    setDraggedTool('seed')
    setDraggedSeed(seed)
    setSelectedTool('seed')
    showFeedback(`拿起了${seed.name}！`, e.clientX, e.clientY)
    ScreenReaderManager.announce(`拿起了${seed.name}，请拖拽到土地种植`, 'polite')
  }

  const handleWaterMouseDown = (e: React.MouseEvent) => {
    e.preventDefault()
    setDraggedTool('water')
    setSelectedTool('water')
    showFeedback('拿起了水壶！', e.clientX, e.clientY)
    ScreenReaderManager.announce('拿起了水壶，请拖拽到植物浇水', 'polite')
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (draggedTool && gardenRef.current) {
      const rect = gardenRef.current.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top
      
      if (draggedTool === 'water') {
        setWaterCanPosition({ x: x - 25, y: y - 25 })
      }
    }
  }

  const handleMouseUp = (e: React.MouseEvent) => {
    if (draggedTool && gardenRef.current) {
      const rect = gardenRef.current.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top

      if (draggedTool === 'seed' && draggedSeed) {
        // Check if dropped on a plant plot
        const droppedOnPlot = plants.find(plant => {
          const plotX = plant.x
          const plotY = plant.y
          const distance = Math.sqrt(
            Math.pow(x - plotX, 2) + Math.pow(y - plotY, 2)
          )
          return distance < 80 && plant.stage === 'empty'
        })
        
        if (droppedOnPlot) {
          plantSeed(droppedOnPlot, draggedSeed, e)
        } else {
          showFeedback('请拖拽到空地上种植！', x, y)
        }
      } else if (draggedTool === 'water') {
        // Check if dropped on a plant
        const droppedOnPlant = plants.find(plant => {
          const plantX = plant.x
          const plantY = plant.y
          const distance = Math.sqrt(
            Math.pow(x - plantX, 2) + Math.pow(y - plantY, 2)
          )
          return distance < 80 && plant.stage !== 'empty'
        })
        
        if (droppedOnPlant) {
          waterPlant(droppedOnPlant, e)
        } else {
          showFeedback('请拖拽到植物上浇水！', x, y)
        }
      }
    }
    
    setDraggedTool(null)
    setDraggedSeed(null)
    setSelectedTool(null)
  }

  const handlePlotClick = (plot: Plant, e: React.MouseEvent) => {
    if (selectedTool === 'seed' && draggedSeed && plot.stage === 'empty') {
      plantSeed(plot, draggedSeed, e)
    } else if (selectedTool === 'water' && plot.stage !== 'empty') {
      waterPlant(plot, e)
    } else if (plot.stage === 'empty') {
      showFeedback('这里需要种子哦！', e.clientX, e.clientY)
    } else {
      showFeedback('植物看起来很开心！', e.clientX, e.clientY)
    }
  }

  const plantSeed = (plot: Plant, seed: Seed, e: React.MouseEvent) => {
    setPlants(prev => prev.map(plant => 
      plant.id === plot.id 
        ? { 
            ...plant, 
            stage: 'seed', 
            plantedTime: Date.now(),
            plantType: seed.plantType
          }
        : plant
    ))

    recordBehavior({
      action: 'create',
      scene: 'garden',
      object: `planted_${seed.plantType}`
    })

    showFeedback(`种下了${seed.name}！`, e.clientX, e.clientY)
    ScreenReaderManager.announce(`成功种下了${seed.name}，请等待它发芽`, 'polite')
    setSelectedTool(null)
    setDraggedSeed(null)
  }

  const waterPlant = (plant: Plant, e: React.MouseEvent) => {
    if (plant.stage === 'empty') {
      showFeedback('这里还没有植物哦！', e.clientX, e.clientY)
      ScreenReaderManager.announce('这里还没有植物，请先种植', 'polite')
      return
    }

    setPlants(prev => prev.map(p => 
      p.id === plant.id 
        ? { ...p, lastWatered: Date.now() }
        : p
    ))

    // Add to just watered set for animation
    setJustWateredPlants(prev => new Set(prev).add(plant.id))
    setTimeout(() => setJustWateredPlants(prev => {
      const next = new Set(prev)
      next.delete(plant.id)
      return next
    }), 2000)

    // Create water drop animation
    const drops = Array.from({ length: 8 }, (_, i) => ({
      id: `drop-${plant.id}-${Date.now()}-${i}`,
      x: plant.x + (Math.random() - 0.5) * 60,
      y: plant.y - 20
    }))
    setWaterDrops(prev => [...prev, ...drops])
    
    // Remove drops after animation
    setTimeout(() => {
      setWaterDrops(prev => prev.filter(drop => !drops.some(d => d.id === drop.id)))
    }, 1500)

    recordBehavior({
      action: 'care',
      scene: 'garden',
      object: `watered_${plant.plantType}`
    })

    showFeedback('给植物浇水了！', e.clientX, e.clientY)
    ScreenReaderManager.announce('给植物浇水了，植物很开心！', 'polite')
    
    // Animate water can
    setWaterCanPosition({ x: e.clientX - 50, y: e.clientY - 100 })
  }

  const showFeedback = (message: string, x: number, y: number) => {
    setFeedback({ message, x, y })
    setTimeout(() => setFeedback(null), 2000)
  }

  

  // Remove the old getPlantDisplay function as we're using PlantRenderer now

  if (usePhaser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 relative overflow-hidden">
        <NavigationBar 
          title="美丽花园"
          showHomeButton={true}
          showSettingsButton={true}
        />
        <div className="pt-16">
          <GameCanvas />
        </div>
      </div>
    )
  }
  return (
    <div 
      ref={gardenContainerRef}
      className="min-h-screen bg-gradient-to-br from-pink-50 to-orange-50 relative overflow-hidden cursor-pointer"
      role="main"
      aria-label="美丽花园 - 种植和照料植物的游戏场景"
      tabIndex={0}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >
      <NavigationBar 
        title="美丽花园"
        showHomeButton={true}
        showSettingsButton={true}
      />
      
      {/* Weather effects */}
      <WeatherEffect 
        type={weatherType}
        intensity="light"
        reducedMotion={reducedMotion}
        aria-label={`当前天气：${weatherType === 'sunny' ? '阳光明媚' : weatherType === 'cloudy' ? '多云' : weatherType === 'rainy' ? '下雨' : '光斑点点'}`}
      />
      
      {/* Enhanced background layers with garden decorations */}
      <div className="absolute inset-0" role="presentation" aria-hidden="true">
        {/* Ground and soil layers */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-green-100 to-transparent"></div>
        <div className="absolute bottom-32 left-0 right-0 h-4 bg-gradient-to-r from-amber-200 via-yellow-200 to-amber-200"></div>
        
        {/* Garden decorations - similar to home scene */}
        <motion.div 
          className="absolute top-16 left-12 w-24 h-16 bg-yellow-100 rounded-lg shadow-sm border-2 border-yellow-200"
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: reducedMotion ? 0 : 0.8, delay: 0.2 }}
          whileHover={{ scale: 1.02 }}
        />
        <motion.div 
          className="absolute top-12 right-16 w-20 h-24 bg-blue-100 rounded-lg shadow-sm border-2 border-blue-200"
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: reducedMotion ? 0 : 0.8, delay: 0.4 }}
          whileHover={{ scale: 1.02 }}
        />
        <motion.div 
          className="absolute bottom-24 left-1/2 -translate-x-1/2 w-72 h-6 bg-amber-100 rounded-full shadow-sm border-2 border-amber-200"
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: reducedMotion ? 0 : 0.8, delay: 0.6 }}
        />
        
        {/* Garden path */}
        <motion.div 
          className="absolute bottom-16 right-1/4 w-32 h-3 bg-gray-200 rounded-full shadow-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: reducedMotion ? 0 : 1, delay: 0.8 }}
        />
        <motion.div 
          className="absolute bottom-12 left-1/4 w-28 h-3 bg-gray-200 rounded-full shadow-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: reducedMotion ? 0 : 1, delay: 1 }}
        />
        
        {/* Floating particles with more variety */}
        <div className="absolute top-20 left-10 w-6 h-6 bg-yellow-200 rounded-full opacity-40 animate-pulse" style={{ animationDelay: '0s' }}></div>
        <div className="absolute top-32 right-20 w-4 h-4 bg-blue-200 rounded-full opacity-30 animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute bottom-40 left-1/3 w-8 h-8 bg-pink-200 rounded-full opacity-25 animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-40 right-1/4 w-5 h-5 bg-green-200 rounded-full opacity-35 animate-pulse" style={{ animationDelay: '3s' }}></div>
        <div className="absolute top-24 left-1/2 w-3 h-3 bg-purple-200 rounded-full opacity-30 animate-pulse" style={{ animationDelay: '1.5s' }}></div>
        <div className="absolute bottom-48 right-1/3 w-7 h-7 bg-orange-200 rounded-full opacity-20 animate-pulse" style={{ animationDelay: '2.5s' }}></div>
        
        {/* Cloud decorations */}
        <motion.div 
          className="absolute top-16 right-1/3 w-16 h-8 bg-white rounded-full opacity-60 shadow-sm"
          animate={{ x: [0, 20, 0] }}
          transition={{ duration: reducedMotion ? 0 : 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div 
          className="absolute top-28 left-1/4 w-12 h-6 bg-white rounded-full opacity-50 shadow-sm"
          animate={{ x: [0, -15, 0] }}
          transition={{ duration: reducedMotion ? 0 : 6, repeat: Infinity, ease: "easeInOut" }}
        />
        
        {/* Sun decoration */}
        <motion.div 
          className="absolute top-20 right-12 w-12 h-12 bg-yellow-300 rounded-full opacity-70 shadow-lg"
          animate={{ 
            rotate: [0, 360],
            scale: [1, 1.1, 1]
          }}
          transition={{ 
            duration: reducedMotion ? 0 : 10, 
            repeat: Infinity, 
            ease: "linear" 
          }}
        >
          <div className="absolute inset-2 bg-yellow-200 rounded-full opacity-80" />
        </motion.div>
        
        {/* Sun rays */}
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={`ray-${i}`}
            className="absolute w-1 h-4 bg-yellow-300 opacity-60"
            style={{
              top: '84px',
              right: '52px',
              transformOrigin: 'center bottom',
              transform: `rotate(${i * 45}deg) translateY(-20px)`
            }}
            animate={{ 
              opacity: [0.4, 0.8, 0.4],
              scaleY: [0.8, 1.2, 0.8]
            }}
            transition={{ 
              duration: reducedMotion ? 0 : 2, 
              repeat: Infinity, 
              delay: i * 0.2,
              ease: "easeInOut" 
            }}
          />
        ))}
      </div>
      
      <motion.div 
        className="absolute top-8 left-8 bg-white bg-opacity-95 rounded-2xl p-5 shadow-xl backdrop-blur-sm border-2 border-green-100"
        role="region"
        aria-label="工具选择区域"
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: reducedMotion ? 0 : 0.8, delay: 0.2 }}
      >
        <motion.h3 
          className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2"
          animate={{ opacity: [0.8, 1, 0.8] }}
          transition={{ duration: 3, repeat: Infinity }}
        >
          <motion.span
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Sprout className="w-6 h-6 text-green-600" />
          </motion.span>
          选择工具
          <motion.span
            animate={{ rotate: [0, -10, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Sprout className="w-6 h-6 text-green-600" />
          </motion.span>
        </motion.h3>
        <div className="flex gap-4" role="group" aria-label="种子工具">
          {seeds.map((seed, index) => (
            <motion.div
              key={seed.id}
              onMouseDown={(e) => handleSeedMouseDown(seed, e)}
              className={`flex flex-col items-center p-4 rounded-xl transition-all duration-300 hover:shadow-lg cursor-grab ${
                draggedSeed?.id === seed.id 
                  ? 'bg-green-200 border-2 border-green-400 scale-110 shadow-xl cursor-grabbing' 
                  : 'bg-gradient-to-br from-gray-50 to-white hover:from-green-50 hover:to-green-100 border-2 border-transparent hover:border-green-200 hover:scale-105'
              }`}
              whileHover={{ scale: 1.08, y: -2 }}
              whileTap={{ scale: 0.95 }}
              aria-label={`${seed.name} - 拖拽到土地种植`}
              aria-pressed={draggedSeed?.id === seed.id}
              title={`拖拽${seed.name}到土地种植`}
            >
              <motion.div 
                className={`w-14 h-14 ${seed.color} rounded-lg flex items-center justify-center mb-3 shadow-md`}
                animate={draggedSeed?.id === seed.id ? { scale: [1, 1.1, 1] } : {}}
                transition={{ duration: 0.5, repeat: draggedSeed?.id === seed.id ? Infinity : 0 }}
              >
                <seed.icon className="w-8 h-8 text-green-700" aria-hidden="true" />
              </motion.div>
              <span className="text-sm font-medium text-gray-700">{seed.name}</span>
              <div className="text-xs text-gray-500 mt-1">按 {index + 1}</div>
            </motion.div>
          ))}
        </div>
      </motion.div>
      
      <motion.div 
        className={`absolute bg-blue-100 rounded-full p-3 shadow-lg cursor-pointer hover:bg-blue-200 transition-all duration-300 hover:scale-110 ${
          draggedTool === 'water' ? 'cursor-grabbing scale-110 shadow-xl' : 'cursor-grab'
        }`}
        style={{ left: waterCanPosition.x, top: waterCanPosition.y }}
        onMouseDown={handleWaterMouseDown}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        role="button"
        aria-label="浇水工具 - 拖拽到植物浇水"
        aria-pressed={draggedTool === 'water'}
        title="拖拽水壶到植物浇水"
        tabIndex={0}
      >
        <Droplets className="w-8 h-8 text-blue-600" aria-hidden="true" />
      </motion.div>
      
      <div 
        className="absolute bottom-20 left-1/2 -translate-x-1/2 flex gap-16"
        role="region"
        aria-label="种植区域"
      >
        {plants.map((plant, index) => (
          <motion.div
            key={plant.id}
            className="cursor-pointer hover:scale-105 transition-transform duration-300"
            onClick={(e) => handlePlotClick(plant, e)}
            style={{ marginTop: plant.stage === 'flowering' ? '-20px' : '0' }}
            role="button"
            aria-label={`种植槽 ${index + 1} - ${plant.stage === 'empty' ? '空地' : `${plant.plantType === 'flower' ? '花朵' : plant.plantType === 'tree' ? '树木' : '蔬菜'}，${Date.now() - plant.lastWatered < 10000 ? '已浇水' : '需要浇水'}`}`}
            tabIndex={0}
            title={plant.stage === 'empty' ? '点击种植' : '点击照料植物'}
            initial={{ scale: plant.stage === 'empty' ? 0.8 : 1, opacity: plant.stage === 'empty' ? 0.6 : 1 }}
            animate={{ 
              scale: growingPlants.has(plant.id) ? [1, 1.1, 1] : 1,
              opacity: 1
            }}
            transition={{ 
              duration: reducedMotion ? 0 : growingPlants.has(plant.id) ? 1.5 : 0.5,
              type: "spring",
              stiffness: 200
            }}
            whileHover={{ scale: 1.05 }}
          >
            <motion.div
              animate={growingPlants.has(plant.id) ? { rotate: [0, 5, -5, 0] } : {}}
              transition={{ duration: reducedMotion ? 0 : 1, repeat: growingPlants.has(plant.id) ? 2 : 0 }}
            >
              <PlantRenderer
                plantStage={plant.stage}
                plantType={plant.plantType}
                size="medium"
                isWatered={justWateredPlants.has(plant.id)}
                isGrowing={growingPlants.has(plant.id)}
                reducedMotion={reducedMotion}
                className="mb-2"
                aria-label={`${plant.plantType === 'flower' ? '花朵' : plant.plantType === 'tree' ? '树木' : '蔬菜'} - ${plant.stage === 'seed' ? '种子' : plant.stage === 'sprout' ? '发芽' : plant.stage === 'small' ? '小苗' : plant.stage === 'flowering' ? '开花' : '空地'}`}
              />
            </motion.div>
            {plant.stage !== 'empty' && (
              <motion.div 
                className="text-center"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <motion.div 
                  className={`w-3 h-3 rounded-full mx-auto transition-all duration-500 ${
                    Date.now() - plant.lastWatered < 10000 ? 'bg-blue-400 shadow-md' : 'bg-gray-300'
                  }`} 
                  aria-hidden="true"
                  animate={justWateredPlants.has(plant.id) ? { scale: [1, 1.3, 1] } : {}}
                  transition={{ duration: 0.5 }}
                />
                <span className="text-xs text-gray-600 font-medium">
                  {Date.now() - plant.lastWatered < 10000 ? '已浇水' : '需要水'}
                </span>
              </motion.div>
            )}
          </motion.div>
        ))}
      </div>
      
      <AnimatePresence>
        {feedback && (
          <motion.div
            className="absolute z-30 bg-white bg-opacity-95 rounded-full px-4 py-2 shadow-lg border-2 border-green-200"
            style={{ left: feedback.x - 60, top: feedback.y - 40 }}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ duration: reducedMotion ? 0.1 : 0.3, type: "spring" }}
            role="status"
            aria-live="polite"
            aria-atomic="true"
          >
            <div className="flex items-center gap-2">
              <Heart className="w-4 h-4 text-green-500" aria-hidden="true" />
              <span className="text-sm font-medium text-gray-700">{feedback.message}</span>
              <Heart className="w-4 h-4 text-green-500" aria-hidden="true" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Water drop animations */}
      <AnimatePresence>
        {waterDrops.map((drop) => (
          <motion.div
            key={drop.id}
            className="absolute w-2 h-2 bg-blue-400 rounded-full opacity-80"
            style={{ left: drop.x, top: drop.y }}
            initial={{ y: 0, opacity: 1, scale: 0 }}
            animate={{ 
              y: 40, 
              opacity: 0, 
              scale: [0, 1, 0.5]
            }}
            exit={{ opacity: 0 }}
            transition={{ 
              duration: reducedMotion ? 0 : 1,
              ease: "easeOut"
            }}
          />
        ))}
      </AnimatePresence>
      
      <div 
        className="fixed top-8 right-8 bg-white bg-opacity-95 rounded-2xl p-4 shadow-xl backdrop-blur-sm max-w-xs"
        role="complementary"
        aria-label="花园操作提示"
      >
        <h3 className="text-lg font-semibold text-gray-800 mb-2 flex items-center gap-2">
          <Sprout className="w-5 h-5 text-green-600" />
          花园小贴士
        </h3>
        <ul className="text-sm text-gray-600 space-y-2">
          <li className="flex items-center gap-2">
            <Sprout className="w-4 h-4 text-green-600" />
            <span>点击种子，然后点击土地种植</span>
          </li>
          <li className="flex items-center gap-2">
            <Droplets className="w-4 h-4 text-blue-600" />
            <span>点击水壶，然后点击植物浇水</span>
          </li>
          <li className="flex items-center gap-2">
            <Heart className="w-4 h-4 text-red-500" />
            <span>健康的成长需要时间</span>
          </li>
          <li className="flex items-center gap-2">
            <TreePine className="w-4 h-4 text-green-700" />
            <span>耐心等待美丽的花朵绽放</span>
          </li>
        </ul>
      </div>
      
      {/* Enhanced Instructions with animation */}
      <motion.div 
        className="fixed top-8 left-1/2 -translate-x-1/2 bg-white bg-opacity-90 rounded-full px-6 py-3 shadow-lg"
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: reducedMotion ? 0 : 0.8, delay: 1.2 }}
      >
        <motion.p 
          className="text-sm font-medium text-gray-700 text-center flex items-center gap-2"
          animate={{ opacity: [0.8, 1, 0.8] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <motion.span
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            🌱
          </motion.span>
          拖拽种子到空地种植，拖拽水壶给植物浇水
          <motion.span
            animate={{ rotate: [0, -10, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            💧
          </motion.span>
        </motion.p>
      </motion.div>

      {/* Gentle hint for garden care with animation */}
      <motion.div 
        className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-green-50 bg-opacity-90 rounded-full px-4 py-2 shadow-sm"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: reducedMotion ? 0 : 0.8, delay: 1.5 }}
      >
        <motion.p 
          className="text-xs text-gray-600 flex items-center gap-1"
          animate={{ opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 3, repeat: Infinity }}
        >
          <motion.span
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            🌸
          </motion.span>
          耐心等待植物成长，它们会给你带来惊喜哦！
          <motion.span
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            🌸
          </motion.span>
        </motion.p>
      </motion.div>

      {/* Weather status with enhanced styling */}
      <motion.div 
        className="fixed bottom-20 left-1/2 -translate-x-1/2 bg-white bg-opacity-95 rounded-full px-6 py-3 shadow-lg backdrop-blur-sm"
        role="status"
        aria-live="polite"
        aria-atomic="true"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: reducedMotion ? 0 : 0.8, delay: 1.8 }}
      >
        <motion.p 
          className="text-sm text-gray-700 font-medium flex items-center gap-2"
          animate={{ opacity: [0.8, 1, 0.8] }}
          transition={{ duration: 4, repeat: Infinity }}
        >
          {weatherType === 'sunny' && <motion.span animate={{ rotate: [0, 360] }} transition={{ duration: 8, repeat: Infinity }}>☀️</motion.span>}
          {weatherType === 'cloudy' && <motion.span animate={{ y: [0, -2, 0] }} transition={{ duration: 3, repeat: Infinity }}>☁️</motion.span>}
          {weatherType === 'rainy' && <motion.span animate={{ rotate: [0, 10, -10, 0] }} transition={{ duration: 1, repeat: Infinity }}>🌧️</motion.span>}
          {weatherType === 'light-spots' && <motion.span animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 2, repeat: Infinity }}>✨</motion.span>}
          {weatherType === 'sunny' && '阳光明媚，植物们很开心！'}
          {weatherType === 'cloudy' && '多云天气，适合植物生长～'}
          {weatherType === 'rainy' && '下雨了，植物们得到了自然的滋润！'}
          {weatherType === 'light-spots' && '光斑点点，花园充满了魔法～'}
        </motion.p>
      </motion.div>
    </div>
  )
}

export default GardenScene
