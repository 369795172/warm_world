import React, { useEffect, useRef, useState } from 'react'
import { useAppStore } from '../store/appStore'

interface AudioCue {
  id: string
  text: string
  type: 'instruction' | 'feedback' | 'encouragement'
  scene?: 'town' | 'home' | 'garden'
}

const audioCues: AudioCue[] = [
  // Town scene
  { id: 'town_welcome', text: '欢迎来到小小世界！想去哪里玩呢？', type: 'instruction', scene: 'town' },
  { id: 'town_home_hint', text: '温暖的小家，可以分享玩具哦！', type: 'instruction', scene: 'town' },
  { id: 'town_garden_hint', text: '美丽的花园，可以种植照顾植物！', type: 'instruction', scene: 'town' },
  
  // Home scene
  { id: 'home_welcome', text: '欢迎来到温暖的小家！试试拖动玩具给小伙伴吧！', type: 'instruction', scene: 'home' },
  { id: 'home_share_success', text: '太棒了！分享带来了快乐！', type: 'feedback', scene: 'home' },
  { id: 'home_share_encouragement', text: '分享会让大家都很开心哦！', type: 'encouragement', scene: 'home' },
  
  // Garden scene
  { id: 'garden_welcome', text: '欢迎来到美丽的花园！让我们一起照顾植物吧！', type: 'instruction', scene: 'garden' },
  { id: 'garden_plant_success', text: '种子种好了！需要浇水才能长大哦！', type: 'feedback', scene: 'garden' },
  { id: 'garden_water_success', text: '浇水成功！植物会很开心的！', type: 'feedback', scene: 'garden' },
  { id: 'garden_growth_encouragement', text: '植物在慢慢长大，需要耐心等待哦！', type: 'encouragement', scene: 'garden' },
  
  // General
  { id: 'general_gentle_exit', text: '今天的小冒险结束啦！我们下次再来玩吧！', type: 'instruction' },
  { id: 'general_time_warning', text: '还有一点点时间就要结束啦，要不要再玩一个小游戏？', type: 'instruction' },
  { id: 'general_praise', text: '你做得很棒！继续加油！', type: 'encouragement' }
]

const AudioManager: React.FC = () => {
  const { settings, gameState } = useAppStore()
  const [currentCue, setCurrentCue] = useState<AudioCue | null>(null)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const speechRef = useRef<SpeechSynthesisUtterance | null>(null)

  // Text-to-speech function
  const speakText = (text: string, priority: 'high' | 'normal' = 'normal') => {
    if (!settings.soundEnabled || !('speechSynthesis' in window)) {
      return
    }

    // Cancel current speech if high priority
    if (priority === 'high' && speechRef.current) {
      window.speechSynthesis.cancel()
    }

    // Don't interrupt if already speaking
    if (window.speechSynthesis.speaking && priority === 'normal') {
      return
    }

    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = 'zh-CN'
    utterance.rate = 0.8 // Slower rate for children
    utterance.pitch = 1.1 // Slightly higher pitch, more friendly
    utterance.volume = 0.7 // Moderate volume

    utterance.onstart = () => {
      setIsSpeaking(true)
    }

    utterance.onend = () => {
      setIsSpeaking(false)
      speechRef.current = null
    }

    utterance.onerror = () => {
      setIsSpeaking(false)
      speechRef.current = null
    }

    speechRef.current = utterance
    window.speechSynthesis.speak(utterance)
  }

  // Play audio cue
  const playCue = (cueId: string, priority: 'high' | 'normal' = 'normal') => {
    const cue = audioCues.find(c => c.id === cueId)
    if (cue) {
      setCurrentCue(cue)
      speakText(cue.text, priority)
    }
  }

  // Handle scene changes
  useEffect(() => {
    if (gameState.currentScene) {
      const welcomeCue = audioCues.find(cue => 
        cue.scene === gameState.currentScene && cue.type === 'instruction'
      )
      if (welcomeCue) {
        // Delay welcome message slightly for better UX
        setTimeout(() => {
          playCue(welcomeCue.id, 'high')
        }, 500)
      }
    }
  }, [gameState.currentScene])

  // Handle specific interactions (this would be called from other components)
  const handleInteraction = (interactionType: string, data?: any) => {
    switch (interactionType) {
      case 'share_success':
        playCue('home_share_success', 'high')
        break
      case 'plant_success':
        playCue('garden_plant_success', 'high')
        break
      case 'water_success':
        playCue('garden_water_success', 'high')
        break
      case 'time_warning':
        playCue('general_time_warning', 'high')
        break
      case 'gentle_exit':
        playCue('general_gentle_exit', 'high')
        break
      default:
        // Generic praise for other positive interactions
        if (Math.random() > 0.7) { // 30% chance to avoid over-speaking
          playCue('general_praise', 'normal')
        }
        break
    }
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (speechRef.current) {
        window.speechSynthesis.cancel()
      }
    }
  }, [])

  // Expose audio manager to window for other components to use
  useEffect(() => {
    ;(window as any).audioManager = {
      playCue,
      handleInteraction,
      speakText,
      isSpeaking: () => isSpeaking
    }
  }, [isSpeaking])

  return null // This component doesn't render anything visible
}

export default AudioManager

// Helper functions for other components to use
export const playAudioCue = (cueId: string, priority?: 'high' | 'normal') => {
  if ((window as any).audioManager) {
    ;(window as any).audioManager.playCue(cueId, priority)
  }
}

export const handleAudioInteraction = (interactionType: string, data?: any) => {
  if ((window as any).audioManager) {
    ;(window as any).audioManager.handleInteraction(interactionType, data)
  }
}

export const speakTextDirectly = (text: string, priority?: 'high' | 'normal') => {
  if ((window as any).audioManager) {
    ;(window as any).audioManager.speakText(text, priority)
  }
}