import React, { useState, useEffect } from 'react'
import { useAppStore } from '../store/appStore'
import { Heart, Home, TreePine, Sparkles } from 'lucide-react'
import NavigationBar from './NavigationBar'

const TownView: React.FC = () => {
  const { setCurrentScene, recordBehavior, updateSettings } = useAppStore()
  const [hoveredArea, setHoveredArea] = useState<string | null>(null)
  const [animationClass, setAnimationClass] = useState('')

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
      name: '小家',
      icon: Home,
      color: 'bg-pink-200 hover:bg-pink-300',
      position: 'left-20 top-1/2 -translate-y-1/2',
      description: '温暖的家，可以分享玩具'
    },
    {
      id: 'garden',
      name: '花园',
      icon: TreePine,
      color: 'bg-green-200 hover:bg-green-300',
      position: 'right-20 top-1/2 -translate-y-1/2',
      description: '美丽的花园，可以种植照顾'
    }
  ]

  const handleSettingsClick = () => {
    updateSettings({ parentMode: true })
  }

  return (
    <div className={`min-h-screen flex items-center justify-center p-8 transition-all duration-500 ${animationClass}`}>
      {/* Navigation Bar */}
      <NavigationBar 
        title="小小世界"
        showHomeButton={false} // 当前已经在主页，不需要显示主页按钮
        showSettingsButton={true}
      />
      
      <div className="relative w-full max-w-4xl pt-20">
        {/* Central plaza */}
        <div className="bg-yellow-100 rounded-full w-80 h-80 mx-auto flex items-center justify-center shadow-lg border-4 border-yellow-200">
          <div className="text-center">
            <Sparkles className="w-16 h-16 text-yellow-500 mx-auto mb-4 animate-pulse" />
            <h1 className="text-2xl font-bold text-yellow-800 mb-2">小小世界</h1>
            <p className="text-yellow-700 text-sm">点击想去的地方</p>
          </div>
        </div>

        {/* Scene areas */}
        {areas.map((area) => {
          const IconComponent = area.icon
          const isHovered = hoveredArea === area.id
          
          return (
            <div
              key={area.id}
              className={`absolute ${area.position} ${area.color} rounded-2xl p-6 cursor-pointer transition-all duration-300 transform ${
                isHovered ? 'scale-110 shadow-xl' : 'scale-100 shadow-md'
              } hover:shadow-lg border-2 border-white`}
              onMouseEnter={() => setHoveredArea(area.id)}
              onMouseLeave={() => setHoveredArea(null)}
              onClick={() => handleAreaClick(area.id as 'home' | 'garden')}
            >
              <div className="text-center">
                <IconComponent 
                  className={`w-12 h-12 mx-auto mb-3 text-gray-700 transition-transform ${
                    isHovered ? 'animate-bounce' : ''
                  }`} 
                />
                <h3 className="text-lg font-semibold text-gray-800 mb-2">{area.name}</h3>
                <p className="text-sm text-gray-600 max-w-32">{area.description}</p>
                
                {/* Gentle hint animation */}
                {isHovered && (
                  <div className="mt-3">
                    <Heart className="w-6 h-6 text-pink-400 mx-auto animate-pulse" />
                  </div>
                )}
              </div>
            </div>
          )
        })}

        {/* Floating elements for visual appeal */}
        <div className="absolute top-10 left-1/2 -translate-x-1/2">
          <div className="w-8 h-8 bg-blue-200 rounded-full opacity-60 animate-bounce delay-300"></div>
        </div>
        
        <div className="absolute bottom-10 left-1/4">
          <div className="w-6 h-6 bg-purple-200 rounded-full opacity-50 animate-pulse delay-1000"></div>
        </div>
        
        <div className="absolute bottom-20 right-1/4">
          <div className="w-10 h-10 bg-green-200 rounded-full opacity-40 animate-bounce delay-700"></div>
        </div>
      </div>

      {/* Gentle instruction */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-white bg-opacity-90 rounded-full px-6 py-3 shadow-lg">
        <p className="text-sm text-gray-700 font-medium">
          💖 想去哪里玩呢？点击看看吧！
        </p>
      </div>
    </div>
  )
}

export default TownView