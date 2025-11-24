import React, { useEffect } from 'react'
import { useAppStore } from '../store/appStore'
import { handleAudioInteraction } from './AudioManager'

const TimeManagerBackground: React.FC = () => {
  const { 
    settings, 
    gameState, 
    endSession, 
    updateSettings 
  } = useAppStore()
  
  const sessionStartTime = React.useRef<number>(Date.now())
  const showWarningRef = React.useRef(false)
  const showExitDialogRef = React.useRef(false)

  // Background time management logic
  useEffect(() => {
    if (!gameState.isPlaying) return

    const interval = setInterval(() => {
      const elapsed = Date.now() - sessionStartTime.current
      const remaining = Math.max(0, settings.dailyTimeLimit * 60 * 1000 - elapsed)
      
      // Show warning when 2 minutes remaining
      if (remaining <= 2 * 60 * 1000 && remaining > 1 * 60 * 1000 && !showWarningRef.current) {
        showWarningRef.current = true
        handleAudioInteraction('time_warning')
        
        // 显示系统通知（如果支持）
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification('游戏时间提醒', {
            body: '还有2分钟就要结束今天的游戏时间了，要不要再玩一个小游戏呢？',
            icon: '/favicon.ico'
          })
        }
      }

      // Show exit dialog when 1 minute remaining
      if (remaining <= 1 * 60 * 1000 && remaining > 0 && !showExitDialogRef.current) {
        showExitDialogRef.current = true
        
        // 显示系统通知（如果支持）
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification('游戏时间即将结束', {
            body: '今天的小冒险时间到了！宝宝玩得很开心，我们下次再来探索吧！',
            icon: '/favicon.ico'
          })
        }
      }

      // Auto exit when time is up
      if (remaining <= 0) {
        handleGracefulExit()
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [gameState.isPlaying, settings.dailyTimeLimit])

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

  // 请求通知权限
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission()
    }
  }, [])

  // 重置状态当游戏重新开始
  useEffect(() => {
    if (gameState.isPlaying) {
      sessionStartTime.current = Date.now()
      showWarningRef.current = false
      showExitDialogRef.current = false
    }
  }, [gameState.isPlaying])

  return null // 不渲染任何UI
}

export default TimeManagerBackground