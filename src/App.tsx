import React, { useEffect, useState } from 'react'
import { useAppStore } from './store/appStore'
import { configManager } from './config/appConfig'
import TownView from './components/TownView'
import HomeScene from './components/HomeScene'
import GardenScene from './components/GardenScene'
import ParentMode from './components/ParentMode'
import InitialSetup from './components/InitialSetup'
import AudioManager from './components/AudioManager'
import TimeManagerBackground from './components/TimeManagerBackground'
import ThirdStageDemo from './components/ThirdStageDemo'

function App() {
  const { 
    childProfile, 
    settings, 
    gameState, 
    setCurrentScene,
    startSession,
    endSession 
  } = useAppStore()

  // Add state for third stage demo mode
  const [showThirdStageDemo, setShowThirdStageDemo] = useState(false)

  // Initialize session on app start
  useEffect(() => {
    if (childProfile.name && !gameState.isPlaying) {
      startSession()
    }
  }, [childProfile.name])

  // Handle app cleanup
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (gameState.isPlaying) {
        endSession()
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [gameState.isPlaying])

  // Render third stage demo if enabled
  if (showThirdStageDemo) {
    return <ThirdStageDemo onBack={() => setShowThirdStageDemo(false)} />
  }

  // Render initial setup if no child profile
  if (!childProfile.name) {
    return <InitialSetup />
  }

  // Render parent mode if enabled
  if (settings.parentMode) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-100 to-purple-100">
        <ParentMode />
      </div>
    )
  }

  // Render main game based on current scene
  const renderScene = () => {
    switch (gameState.currentScene) {
      case 'home':
        return <HomeScene />
      case 'garden':
        return <GardenScene />
      case 'town':
      default:
        return <TownView />
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-purple-100 relative overflow-hidden">
      <AudioManager />
      <TimeManagerBackground />
      
      {/* Background elements for visual appeal */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 w-20 h-20 bg-yellow-200 rounded-full opacity-30 animate-pulse"></div>
        <div className="absolute top-32 right-20 w-16 h-16 bg-pink-200 rounded-full opacity-40 animate-pulse delay-1000"></div>
        <div className="absolute bottom-20 left-20 w-24 h-24 bg-green-200 rounded-full opacity-25 animate-pulse delay-2000"></div>
      </div>

      {/* Main content */}
      <div className="relative z-10">
        {renderScene()}
      </div>

      {/* Scene navigation for testing - will be hidden in production */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed bottom-4 left-4 z-50 flex flex-wrap gap-2">
          <button
            onClick={() => setCurrentScene('town')}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              gameState.currentScene === 'town' 
                ? 'bg-blue-500 text-white' 
                : 'bg-white text-blue-500 hover:bg-blue-50'
            }`}
          >
            小镇
          </button>
          <button
            onClick={() => setCurrentScene('home')}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              gameState.currentScene === 'home' 
                ? 'bg-blue-500 text-white' 
                : 'bg-white text-blue-500 hover:bg-blue-50'
            }`}
          >
            家
          </button>
          <button
            onClick={() => setCurrentScene('garden')}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              gameState.currentScene === 'garden' 
                ? 'bg-blue-500 text-white' 
                : 'bg-white text-blue-500 hover:bg-blue-50'
            }`}
          >
            花园
          </button>
          <button
            onClick={() => setShowThirdStageDemo(true)}
            className="px-3 py-2 rounded-lg text-sm font-medium bg-purple-500 text-white hover:bg-purple-600 transition-colors"
          >
            第三阶段演示
          </button>
        </div>
      )}
    </div>
  )
}

export default App
