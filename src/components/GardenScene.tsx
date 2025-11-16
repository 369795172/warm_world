import React, { useState, useEffect } from 'react'
import { useAppStore } from '../store/appStore'
import { Droplets, Heart } from 'lucide-react'
import NavigationBar from './NavigationBar'

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
  icon: string
  color: string
  plantType: 'flower' | 'tree' | 'vegetable'
}

const GardenScene: React.FC = () => {
  const { recordBehavior, updateSettings } = useAppStore()
  
  const [plants, setPlants] = useState<Plant[]>([
    { id: 'plot1', x: 150, y: 300, stage: 'empty', lastWatered: 0, plantedTime: 0, plantType: 'flower' },
    { id: 'plot2', x: 300, y: 300, stage: 'empty', lastWatered: 0, plantedTime: 0, plantType: 'tree' },
    { id: 'plot3', x: 450, y: 300, stage: 'empty', lastWatered: 0, plantedTime: 0, plantType: 'vegetable' }
  ])

  const [seeds, setSeeds] = useState<Seed[]>([
    { id: 'flower_seed', name: '花种子', icon: '🌱', color: 'bg-pink-200', plantType: 'flower' },
    { id: 'tree_seed', name: '树种子', icon: '🌰', color: 'bg-amber-200', plantType: 'tree' },
    { id: 'vegetable_seed', name: '蔬菜种子', icon: '🥕', color: 'bg-orange-200', plantType: 'vegetable' }
  ])

  const [draggedSeed, setDraggedSeed] = useState<Seed | null>(null)
  const [selectedTool, setSelectedTool] = useState<'seed' | 'water' | null>(null)
  const [feedback, setFeedback] = useState<{message: string, x: number, y: number} | null>(null)
  const [waterCanPosition, setWaterCanPosition] = useState({ x: 100, y: 200 })

  // Plant growth logic
  useEffect(() => {
    const interval = setInterval(() => {
      setPlants(prev => prev.map(plant => {
        if (plant.stage === 'empty') return plant
        
        const timeSinceWatered = Date.now() - plant.lastWatered
        const timeSincePlanted = Date.now() - plant.plantedTime
        
        // Growth stages based on time and watering
        if (plant.stage === 'seed' && timeSincePlanted > 5000) { // 5 seconds
          return { ...plant, stage: 'sprout' }
        }
        if (plant.stage === 'sprout' && timeSincePlanted > 15000) { // 15 seconds
          return { ...plant, stage: 'small' }
        }
        if (plant.stage === 'small' && timeSincePlanted > 30000) { // 30 seconds
          return { ...plant, stage: 'flowering' }
        }
        
        return plant
      }))
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  const handleSeedClick = (seed: Seed) => {
    setSelectedTool('seed')
    setDraggedSeed(seed)
    showFeedback(`拿起了${seed.name}！`, 200, 150)
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
    setSelectedTool(null)
    setDraggedSeed(null)
  }

  const waterPlant = (plant: Plant, e: React.MouseEvent) => {
    if (plant.stage === 'empty') {
      showFeedback('这里还没有植物哦！', e.clientX, e.clientY)
      return
    }

    setPlants(prev => prev.map(p => 
      p.id === plant.id 
        ? { ...p, lastWatered: Date.now() }
        : p
    ))

    recordBehavior({
      action: 'care',
      scene: 'garden',
      object: `watered_${plant.plantType}`
    })

    showFeedback('给植物浇水了！💧', e.clientX, e.clientY)
    
    // Animate water can
    setWaterCanPosition({ x: e.clientX - 50, y: e.clientY - 100 })
  }

  const showFeedback = (message: string, x: number, y: number) => {
    setFeedback({ message, x, y })
    setTimeout(() => setFeedback(null), 2000)
  }

  const handleSettingsClick = () => {
    updateSettings({ parentMode: true })
  }

  const getPlantDisplay = (plant: Plant) => {
    const baseY = plant.y
    
    switch (plant.stage) {
      case 'empty':
        return (
          <div className="w-16 h-16 bg-amber-100 rounded-full border-2 border-amber-200 flex items-center justify-center">
            <div className="w-8 h-8 bg-amber-200 rounded-full"></div>
          </div>
        )
      case 'seed':
        return (
          <div className="relative">
            <div className="w-16 h-16 bg-amber-100 rounded-full border-2 border-amber-200 flex items-center justify-center">
              <div className="w-4 h-4 bg-green-600 rounded-full animate-pulse"></div>
            </div>
            <div className="absolute -top-2 left-1/2 -translate-x-1/2 text-xs text-gray-600">
              🌱
            </div>
          </div>
        )
      case 'sprout':
        return (
          <div className="relative">
            <div className="w-16 h-16 bg-green-100 rounded-full border-2 border-green-200 flex items-center justify-center">
              <div className="w-2 h-6 bg-green-500 rounded-full"></div>
            </div>
            <div className="absolute -top-1 left-1/2 -translate-x-1/2 text-lg">
              🌱
            </div>
          </div>
        )
      case 'small':
        return (
          <div className="relative">
            <div className="w-16 h-20 bg-green-200 rounded-lg border-2 border-green-300 flex items-end justify-center pb-2">
              <div className="w-3 h-8 bg-green-600 rounded-full"></div>
            </div>
            <div className="absolute -top-2 left-1/2 -translate-x-1/2 text-xl">
              {plant.plantType === 'flower' ? '🌿' : plant.plantType === 'tree' ? '🌳' : '🥬'}
            </div>
          </div>
        )
      case 'flowering':
        return (
          <div className="relative">
            <div className="w-16 h-24 bg-green-200 rounded-lg border-2 border-green-300 flex items-end justify-center pb-2">
              <div className="w-4 h-10 bg-green-600 rounded-full"></div>
            </div>
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 text-2xl animate-pulse">
              {plant.plantType === 'flower' ? '🌸' : plant.plantType === 'tree' ? '🌳' : '🥕'}
            </div>
          </div>
        )
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 relative overflow-hidden">
      {/* Navigation Bar */}
      <NavigationBar 
        title="美丽花园"
        showHomeButton={true}
        showSettingsButton={true}
      />
      
      {/* Garden background */}
      <div className="absolute inset-0">
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-green-100"></div>
        <div className="absolute bottom-32 left-0 right-0 h-4 bg-amber-200"></div>
        
        {/* Decorative elements */}
        <div className="absolute top-20 left-10 w-8 h-8 bg-yellow-200 rounded-full opacity-60 animate-pulse"></div>
        <div className="absolute top-32 right-20 w-6 h-6 bg-blue-200 rounded-full opacity-50 animate-pulse delay-1000"></div>
        <div className="absolute bottom-40 left-1/3 w-10 h-10 bg-pink-200 rounded-full opacity-40 animate-pulse delay-2000"></div>
      </div>

      {/* Tool selection */}
      <div className="absolute top-8 left-8 bg-white bg-opacity-90 rounded-2xl p-4 shadow-lg">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">选择工具</h3>
        <div className="flex gap-3">
          {seeds.map(seed => (
            <button
              key={seed.id}
              onClick={() => handleSeedClick(seed)}
              className={`flex flex-col items-center p-3 rounded-xl transition-all duration-200 ${
                draggedSeed?.id === seed.id 
                  ? 'bg-green-200 border-2 border-green-400 scale-105' 
                  : 'bg-gray-50 hover:bg-gray-100 border-2 border-transparent hover:scale-105'
              }`}
            >
              <div className={`w-12 h-12 ${seed.color} rounded-lg flex items-center justify-center mb-2`}>
                <span className="text-xl">{seed.icon}</span>
              </div>
              <span className="text-xs font-medium text-gray-700">{seed.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Watering can */}
      <div 
        className="absolute bg-blue-100 rounded-full p-3 shadow-lg cursor-pointer hover:bg-blue-200 transition-colors"
        style={{ left: waterCanPosition.x, top: waterCanPosition.y }}
        onClick={() => setSelectedTool('water')}
      >
        <Droplets className="w-8 h-8 text-blue-600" />
      </div>

      {/* Plant plots */}
      <div className="absolute bottom-20 left-1/2 -translate-x-1/2 flex gap-16">
        {plants.map(plant => (
          <div
            key={plant.id}
            className="cursor-pointer hover:scale-105 transition-transform duration-200"
            onClick={(e) => handlePlotClick(plant, e)}
            style={{ marginTop: plant.stage === 'flowering' ? '-20px' : '0' }}
          >
            {getPlantDisplay(plant)}
            
            {/* Plant status indicator */}
            {plant.stage !== 'empty' && (
              <div className="mt-2 text-center">
                <div className={`w-3 h-3 rounded-full mx-auto ${
                  Date.now() - plant.lastWatered < 10000 ? 'bg-blue-400' : 'bg-gray-300'
                }`}></div>
                <span className="text-xs text-gray-600">
                  {Date.now() - plant.lastWatered < 10000 ? '已浇水' : '需要水'}
                </span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Feedback */}
      {feedback && (
        <div
          className="absolute z-30 bg-white bg-opacity-95 rounded-full px-4 py-2 shadow-lg border-2 border-green-200 animate-bounce"
          style={{ left: feedback.x - 60, top: feedback.y - 40 }}
        >
          <div className="flex items-center gap-2">
            <Heart className="w-4 h-4 text-green-500" />
            <span className="text-sm font-medium text-gray-700">{feedback.message}</span>
            <Heart className="w-4 h-4 text-green-500" />
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="fixed top-8 right-8 bg-white bg-opacity-90 rounded-2xl p-4 shadow-lg max-w-xs">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">🌱 花园小贴士</h3>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>• 点击种子，然后点击土地种植</li>
          <li>• 点击水壶，然后点击植物浇水</li>
          <li>• 植物需要时间慢慢长大</li>
          <li>• 记得经常照顾它们哦！</li>
        </ul>
      </div>

      {/* Gentle encouragement */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-green-50 bg-opacity-90 rounded-full px-6 py-3 shadow-sm">
        <p className="text-sm text-gray-700 font-medium">
          🌱 耐心和照顾会让植物茁壮成长！
        </p>
      </div>
    </div>
  )
}

export default GardenScene