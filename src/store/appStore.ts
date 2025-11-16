import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface ChildBehavior {
  timestamp: number
  action: 'share' | 'help' | 'care' | 'explore' | 'create'
  scene: 'home' | 'garden' | 'town'
  object?: string
  duration?: number
}

export interface InterestTag {
  category: 'music' | 'hands_on' | 'care' | 'social' | 'exploration'
  score: number
  lastActive: number
}

export interface ChildProfile {
  name: string
  age: number // 2, 3, or 4
  interests: InterestTag[]
  behaviors: ChildBehavior[]
  totalPlayTime: number
  sessionCount: number
  lastSessionEnd: number
}

export interface AppSettings {
  dailyTimeLimit: number // minutes
  soundEnabled: boolean
  vibrationEnabled: boolean
  parentMode: boolean
}

export interface GameState {
  currentScene: 'town' | 'home' | 'garden'
  sessionStartTime: number
  sessionPlayTime: number
  isPlaying: boolean
  draggedItem: string | null
  interactions: Record<string, number>
}

interface AppStore {
  childProfile: ChildProfile
  settings: AppSettings
  gameState: GameState
  
  // Actions
  initializeChild: (name: string, age: number) => void
  recordBehavior: (behavior: Omit<ChildBehavior, 'timestamp'>) => void
  updateInterests: () => void
  setCurrentScene: (scene: 'town' | 'home' | 'garden') => void
  startSession: () => void
  endSession: () => void
  setDraggedItem: (item: string | null) => void
  recordInteraction: (item: string) => void
  updateSettings: (settings: Partial<AppSettings>) => void
  resetDailyTime: () => void
}

export const useAppStore = create<AppStore>()(
  persist(
    (set, get) => ({
      childProfile: {
        name: '',
        age: 3,
        interests: [],
        behaviors: [],
        totalPlayTime: 0,
        sessionCount: 0,
        lastSessionEnd: 0
      },
      settings: {
        dailyTimeLimit: 15, // 15 minutes default
        soundEnabled: true,
        vibrationEnabled: false,
        parentMode: false
      },
      gameState: {
        currentScene: 'town',
        sessionStartTime: 0,
        sessionPlayTime: 0,
        isPlaying: false,
        draggedItem: null,
        interactions: {}
      },

      initializeChild: (name: string, age: number) => {
        set(state => ({
          childProfile: {
            ...state.childProfile,
            name,
            age,
            interests: [
              { category: 'music', score: 0, lastActive: 0 },
              { category: 'hands_on', score: 0, lastActive: 0 },
              { category: 'care', score: 0, lastActive: 0 },
              { category: 'social', score: 0, lastActive: 0 },
              { category: 'exploration', score: 0, lastActive: 0 }
            ]
          }
        }))
      },

      recordBehavior: (behavior: Omit<ChildBehavior, 'timestamp'>) => {
        const timestamp = Date.now()
        set(state => ({
          childProfile: {
            ...state.childProfile,
            behaviors: [...state.childProfile.behaviors, { ...behavior, timestamp }].slice(-100) // Keep last 100 behaviors
          }
        }))
        
        // Update interests based on behavior
        get().updateInterests()
      },

      updateInterests: () => {
        const state = get()
        const recentBehaviors = state.childProfile.behaviors.slice(-20) // Last 20 behaviors
        
        const interestScores: Record<string, number> = {
          music: 0,
          hands_on: 0,
          care: 0,
          social: 0,
          exploration: 0
        }

        recentBehaviors.forEach(behavior => {
          switch (behavior.action) {
            case 'share':
            case 'help':
              interestScores.social += 1
              interestScores.care += 0.5
              break
            case 'care':
              interestScores.care += 1
              break
            case 'explore':
              interestScores.exploration += 1
              break
            case 'create':
              interestScores.hands_on += 1
              break
          }

          // Scene-based scoring
          if (behavior.scene === 'home' && (behavior.action === 'share' || behavior.action === 'help')) {
            interestScores.social += 0.5
          }
          if (behavior.scene === 'garden' && behavior.action === 'care') {
            interestScores.care += 0.5
            interestScores.hands_on += 0.3
          }
        })

        const updatedInterests = state.childProfile.interests.map(interest => ({
          ...interest,
          score: interestScores[interest.category] || 0,
          lastActive: interestScores[interest.category] > 0 ? Date.now() : interest.lastActive
        }))

        set(state => ({
          childProfile: {
            ...state.childProfile,
            interests: updatedInterests
          }
        }))
      },

      setCurrentScene: (scene: 'town' | 'home' | 'garden') => {
        set(state => ({
          gameState: {
            ...state.gameState,
            currentScene: scene
          }
        }))
        
        // Record exploration behavior
        get().recordBehavior({
          action: 'explore',
          scene: scene === 'town' ? 'town' : scene
        })
      },

      startSession: () => {
        const startTime = Date.now()
        set(state => ({
          gameState: {
            ...state.gameState,
            sessionStartTime: startTime,
            sessionPlayTime: 0,
            isPlaying: true,
            interactions: {}
          }
        }))
      },

      endSession: () => {
        const state = get()
        const sessionDuration = Date.now() - state.gameState.sessionStartTime
        
        set(state => ({
          childProfile: {
            ...state.childProfile,
            totalPlayTime: state.childProfile.totalPlayTime + sessionDuration,
            sessionCount: state.childProfile.sessionCount + 1,
            lastSessionEnd: Date.now()
          },
          gameState: {
            ...state.gameState,
            isPlaying: false,
            sessionPlayTime: 0
          }
        }))
      },

      setDraggedItem: (item: string | null) => {
        set(state => ({
          gameState: {
            ...state.gameState,
            draggedItem: item
          }
        }))
      },

      recordInteraction: (item: string) => {
        set(state => ({
          gameState: {
            ...state.gameState,
            interactions: {
              ...state.gameState.interactions,
              [item]: (state.gameState.interactions[item] || 0) + 1
            }
          }
        }))
      },

      updateSettings: (settings: Partial<AppSettings>) => {
        set(state => ({
          settings: {
            ...state.settings,
            ...settings
          }
        }))
      },

      resetDailyTime: () => {
        // This would be called daily to reset play time tracking
        set(state => ({
          childProfile: {
            ...state.childProfile,
            totalPlayTime: 0
          }
        }))
      }
    }),
    {
      name: 'little-world-store',
      partialize: (state) => ({
        childProfile: state.childProfile,
        settings: state.settings
        // Don't persist gameState as it's session-specific
      })
    }
  )
)

// Utility functions
export const getDominantInterests = (interests: InterestTag[]) => {
  return interests
    .filter(interest => interest.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 2)
}

export const getInterestLabel = (category: string) => {
  const labels: Record<string, string> = {
    music: '🎵 音乐 & 节奏',
    hands_on: '🧩 动手 & 搭建',
    care: '🤗 照顾小伙伴',
    social: '👥 社交互动',
    exploration: '🔍 探索发现'
  }
  return labels[category] || category
}

export const formatPlayTime = (milliseconds: number) => {
  const minutes = Math.floor(milliseconds / 60000)
  const seconds = Math.floor((milliseconds % 60000) / 1000)
  return `${minutes}分${seconds}秒`
}