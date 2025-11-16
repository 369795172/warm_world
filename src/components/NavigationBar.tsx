import React from 'react'
import { useAppStore } from '../store/appStore'
import { Home, Settings, ArrowLeft } from 'lucide-react'

interface NavigationBarProps {
  showHomeButton?: boolean
  showSettingsButton?: boolean
  showBackButton?: boolean
  onBack?: () => void
  title?: string
}

const NavigationBar: React.FC<NavigationBarProps> = ({
  showHomeButton = true,
  showSettingsButton = true,
  showBackButton = false,
  onBack,
  title
}) => {
  const { updateSettings, setCurrentScene } = useAppStore()

  const handleHomeClick = () => {
    setCurrentScene('town')
  }

  const handleSettingsClick = () => {
    updateSettings({ parentMode: true })
  }

  const handleBackClick = () => {
    if (onBack) {
      onBack()
    } else {
      setCurrentScene('town')
    }
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white bg-opacity-95 backdrop-blur-sm shadow-sm">
      <div className="flex items-center justify-between px-4 py-3">
        {/* Left side - Home and Back buttons */}
        <div className="flex items-center gap-2">
          {showHomeButton && (
            <button
              onClick={handleHomeClick}
              className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded-lg transition-colors duration-200 text-sm font-medium touch-manipulation"
              aria-label="返回主页"
              title="返回主页"
            >
              <Home className="w-4 h-4" />
              <span className="hidden sm:inline">主页</span>
            </button>
          )}
          
          {showBackButton && (
            <button
              onClick={handleBackClick}
              className="flex items-center gap-2 bg-gray-500 hover:bg-gray-600 text-white px-3 py-2 rounded-lg transition-colors duration-200 text-sm font-medium touch-manipulation"
              aria-label="返回"
              title="返回"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">返回</span>
            </button>
          )}
        </div>

        {/* Center - Title */}
        {title && (
          <div className="flex-1 text-center">
            <h1 className="text-lg font-bold text-gray-800 truncate">{title}</h1>
          </div>
        )}

        {/* Right side - Settings button */}
        {showSettingsButton && (
          <button
            onClick={handleSettingsClick}
            className="flex items-center gap-2 bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 px-3 py-2 rounded-lg transition-all duration-200 hover:scale-105 text-sm font-medium touch-manipulation"
            aria-label="进入家长模式"
            title="进入家长模式"
          >
            <Settings className="w-4 h-4" />
            <span className="hidden sm:inline">家长模式</span>
          </button>
        )}
      </div>
    </nav>
  )
}

export default NavigationBar