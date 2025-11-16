import React, { useEffect, useState, useRef } from 'react'
import { useAppStore } from '../store/appStore'
import { handleAudioInteraction } from './AudioManager'

interface Position {
  x: number
  y: number
}

interface DragState {
  isDragging: boolean
  dragStart: Position
  elementStart: Position
}

const TimeManager: React.FC = () => {
  const { 
    settings, 
    gameState, 
    endSession, 
    updateSettings 
  } = useAppStore()
  
  const [timeRemaining, setTimeRemaining] = useState<number>(settings.dailyTimeLimit * 60 * 1000)
  const [showWarning, setShowWarning] = useState(false)
  const [showExitDialog, setShowExitDialog] = useState(false)
  const [sessionStartTime] = useState<number>(Date.now())
  const [position, setPosition] = useState<Position>({ x: 16, y: 16 }) // 默认右上角位置
  const [dragState, setDragState] = useState<DragState>({
    isDragging: false,
    dragStart: { x: 0, y: 0 },
    elementStart: { x: 0, y: 0 }
  })
  const [isTouchDevice, setIsTouchDevice] = useState(false)
  const timerRef = useRef<HTMLDivElement>(null)
  const longPressTimer = useRef<NodeJS.Timeout | null>(null)
  const [showDragHint, setShowDragHint] = useState(false)

  // Detect touch device
  useEffect(() => {
    setIsTouchDevice('ontouchstart' in window)
  }, [])

  // Load saved position from localStorage
  useEffect(() => {
    const savedPosition = localStorage.getItem('timerPosition')
    if (savedPosition) {
      try {
        const parsed = JSON.parse(savedPosition)
        setPosition(parsed)
      } catch (e) {
        console.warn('Failed to parse saved timer position')
      }
    }
  }, [])

  // Save position to localStorage
  const savePosition = (newPosition: Position) => {
    localStorage.setItem('timerPosition', JSON.stringify(newPosition))
  }

  // Get viewport constraints
  const getViewportConstraints = (): Position => {
    const viewportWidth = window.innerWidth
    const viewportHeight = window.innerHeight
    const elementWidth = 120 // Approximate width of timer
    const elementHeight = 48 // Approximate height of timer
    const navBarHeight = 64 // Height of navigation bar
    const margin = 16 // Margin from edges

    return {
      x: Math.max(margin, Math.min(viewportWidth - elementWidth - margin, position.x)),
      y: Math.max(navBarHeight + margin, Math.min(viewportHeight - elementHeight - margin, position.y))
    }
  }

  // Snap to nearest reasonable position
  const snapToPosition = (currentPos: Position): Position => {
    const viewportWidth = window.innerWidth
    const viewportHeight = window.innerHeight
    const elementWidth = 120
    const elementHeight = 48
    const navBarHeight = 64
    const margin = 16

    // Define snap zones
    const zones = [
      // Top-left
      { x: margin, y: navBarHeight + margin },
      // Top-right
      { x: viewportWidth - elementWidth - margin, y: navBarHeight + margin },
      // Bottom-left
      { x: margin, y: viewportHeight - elementHeight - margin },
      // Bottom-right
      { x: viewportWidth - elementWidth - margin, y: viewportHeight - elementHeight - margin }
    ]

    // Find nearest zone
    let nearestZone = zones[1] // Default to top-right
    let minDistance = Infinity

    zones.forEach(zone => {
      const distance = Math.sqrt(
        Math.pow(currentPos.x - zone.x, 2) + Math.pow(currentPos.y - zone.y, 2)
      )
      if (distance < minDistance) {
        minDistance = distance
        nearestZone = zone
      }
    })

    return nearestZone
  }

  // Mouse event handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (isTouchDevice) return
    
    e.preventDefault()
    startDrag(e.clientX, e.clientY)
  }

  const handleMouseMove = (e: MouseEvent) => {
    if (!dragState.isDragging) return
    
    e.preventDefault()
    updateDragPosition(e.clientX, e.clientY)
  }

  const handleMouseUp = () => {
    if (!dragState.isDragging) return
    endDrag()
  }

  // Touch event handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    e.preventDefault()
    const touch = e.touches[0]
    
    // Long press detection for touch devices
    longPressTimer.current = setTimeout(() => {
      startDrag(touch.clientX, touch.clientY)
      setShowDragHint(true)
    }, 300)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    e.preventDefault()
    
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current)
      longPressTimer.current = null
    }
    
    if (!dragState.isDragging) return
    
    const touch = e.touches[0]
    updateDragPosition(touch.clientX, touch.clientY)
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    e.preventDefault()
    
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current)
      longPressTimer.current = null
    }
    
    if (dragState.isDragging) {
      endDrag()
    }
  }

  // Common drag functions
  const startDrag = (clientX: number, clientY: number) => {
    setDragState({
      isDragging: true,
      dragStart: { x: clientX, y: clientY },
      elementStart: position
    })
    
    document.body.style.userSelect = 'none'
    document.body.style.touchAction = 'none'
  }

  const updateDragPosition = (clientX: number, clientY: number) => {
    const deltaX = clientX - dragState.dragStart.x
    const deltaY = clientY - dragState.dragStart.y
    
    const newPosition = {
      x: dragState.elementStart.x + deltaX,
      y: dragState.elementStart.y + deltaY
    }
    
    // Apply viewport constraints
    const constrainedPosition = getViewportConstraints()
    const clampedPosition = {
      x: Math.max(16, Math.min(newPosition.x, constrainedPosition.x)),
      y: Math.max(80, Math.min(newPosition.y, constrainedPosition.y))
    }
    
    setPosition(clampedPosition)
  }

  const endDrag = () => {
    setDragState(prev => ({ ...prev, isDragging: false }))
    
    // Snap to nearest position
    const snappedPosition = snapToPosition(position)
    setPosition(snappedPosition)
    savePosition(snappedPosition)
    
    document.body.style.userSelect = ''
    document.body.style.touchAction = ''
    setShowDragHint(false)
  }

  // Add global event listeners
  useEffect(() => {
    if (dragState.isDragging) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('mouseup', handleMouseUp)
      }
    }
  }, [dragState.isDragging])

  // Handle screen rotation
  useEffect(() => {
    const handleResize = () => {
      const constrainedPosition = getViewportConstraints()
      setPosition(constrainedPosition)
      savePosition(constrainedPosition)
    }

    window.addEventListener('resize', handleResize)
    window.addEventListener('orientationchange', handleResize)
    
    return () => {
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('orientationchange', handleResize)
    }
  }, [])

  // Original time management logic
  useEffect(() => {
    if (!gameState.isPlaying) return

    const interval = setInterval(() => {
      const elapsed = Date.now() - sessionStartTime
      const remaining = Math.max(0, settings.dailyTimeLimit * 60 * 1000 - elapsed)
      
      setTimeRemaining(remaining)

      // Show warning when 2 minutes remaining
      if (remaining <= 2 * 60 * 1000 && remaining > 1 * 60 * 1000 && !showWarning) {
        setShowWarning(true)
        handleAudioInteraction('time_warning')
      }

      // Show exit dialog when 1 minute remaining
      if (remaining <= 1 * 60 * 1000 && remaining > 0 && !showExitDialog) {
        setShowExitDialog(true)
      }

      // Auto exit when time is up
      if (remaining <= 0) {
        handleGracefulExit()
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [gameState.isPlaying, settings.dailyTimeLimit, sessionStartTime, showWarning, showExitDialog])

  const handleGracefulExit = () => {
    handleAudioInteraction('gentle_exit')
    
    // Give a moment for the audio to play
    setTimeout(() => {
      endSession()
      // Switch to parent mode after session ends
      setTimeout(() => {
        updateSettings({ parentMode: true })
      }, 1000)
    }, 2000)
  }

  const handleExtendTime = () => {
    // Extend by 5 minutes
    updateSettings({ dailyTimeLimit: settings.dailyTimeLimit + 5 })
    setShowExitDialog(false)
    setShowWarning(false)
  }

  const handleEndSession = () => {
    handleGracefulExit()
  }

  const formatTime = (milliseconds: number) => {
    const minutes = Math.floor(milliseconds / 60000)
    const seconds = Math.floor((milliseconds % 60000) / 1000)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  if (!gameState.isPlaying) return null

  return (
    <>
      {/* Draggable time indicator */}
      <div 
        ref={timerRef}
        className={`fixed z-50 select-none transition-all duration-200 ${
          dragState.isDragging ? 'cursor-grabbing scale-110' : isTouchDevice ? 'cursor-grab' : 'cursor-move'
        } ${showDragHint ? 'ring-2 ring-blue-400' : ''}`}
        style={{
          left: position.x,
          top: position.y,
          minWidth: '120px',
          minHeight: '48px' // WCAG minimum touch target
        }}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        title={isTouchDevice ? '长按300ms可拖动' : '点击拖动'}
        aria-label={`游戏时间剩余: ${formatTime(timeRemaining)}`}
      >
        <div className={`bg-white bg-opacity-95 rounded-full px-4 py-2 shadow-lg border-2 transition-all duration-300 ${
          timeRemaining <= 2 * 60 * 1000 
            ? 'border-yellow-400 bg-yellow-50' 
            : 'border-blue-200'
        }`}>
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full transition-colors ${
              timeRemaining <= 1 * 60 * 1000 
                ? 'bg-red-500 animate-pulse' 
                : timeRemaining <= 2 * 60 * 1000 
                ? 'bg-yellow-500' 
                : 'bg-green-500'
            }`}></div>
            <span className={`font-medium text-sm ${
              timeRemaining <= 1 * 60 * 1000 
                ? 'text-red-600' 
                : timeRemaining <= 2 * 60 * 1000 
                ? 'text-yellow-700' 
                : 'text-gray-700'
            }`}>
              {formatTime(timeRemaining)}
            </span>
            {dragState.isDragging && (
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
            )}
          </div>
        </div>
        
        {/* Drag hint for touch devices */}
        {showDragHint && (
          <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-blue-500 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
            拖动我到合适的位置
            <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-2 border-r-2 border-t-2 border-transparent border-t-blue-500"></div>
          </div>
        )}
      </div>

      {/* Warning dialog */}
      {showWarning && !showExitDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-3xl p-8 max-w-sm mx-4 text-center shadow-2xl">
            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">⏰</span>
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">时间提醒</h3>
            <p className="text-gray-600 mb-6">
              还有2分钟就要结束今天的游戏时间了，
              要不要再玩一个小游戏呢？
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowWarning(false)}
                className="flex-1 bg-gray-200 text-gray-700 font-medium py-3 px-4 rounded-xl hover:bg-gray-300 transition-colors touch-manipulation"
              >
                继续玩
              </button>
              <button
                onClick={handleEndSession}
                className="flex-1 bg-yellow-500 text-white font-medium py-3 px-4 rounded-xl hover:bg-yellow-600 transition-colors touch-manipulation"
              >
                结束游戏
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Exit dialog */}
      {showExitDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-3xl p-8 max-w-sm mx-4 text-center shadow-2xl">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🌙</span>
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">游戏时间结束</h3>
            <p className="text-gray-600 mb-6">
              今天的小冒险时间到了！
              宝宝玩得很开心，我们下次再来探索吧！
            </p>
            <div className="space-y-3">
              <button
                onClick={handleEndSession}
                className="w-full bg-green-500 text-white font-medium py-3 px-4 rounded-xl hover:bg-green-600 transition-colors touch-manipulation"
              >
                结束游戏
              </button>
              <button
                onClick={handleExtendTime}
                className="w-full bg-blue-500 text-white font-medium py-3 px-4 rounded-xl hover:bg-blue-600 transition-colors touch-manipulation"
              >
                延长5分钟
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default TimeManager