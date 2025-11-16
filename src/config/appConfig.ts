// Configuration management for the Little World app
export interface AppConfig {
  // App settings
  appName: string
  version: string
  
  // Scene configurations
  scenes: {
    town: TownConfig
    home: HomeConfig
    garden: GardenConfig
  }
  
  // Audio settings
  audio: {
    enabled: boolean
    volume: number
    speechRate: number
    speechPitch: number
    voices: VoiceConfig[]
  }
  
  // Interaction settings
  interactions: {
    dragThreshold: number
    clickDelay: number
    feedbackDuration: number
    animationSpeed: number
  }
  
  // Time management
  timeManagement: {
    defaultSessionLimit: number // minutes
    warningTime: number // minutes before end
    extendTime: number // minutes for extension
    autoExitDelay: number // milliseconds
  }
  
  // Behavior tracking
  behaviorTracking: {
    enabled: boolean
    maxBehaviorsStored: number
    interestCalculationWindow: number // number of behaviors to consider
    interestDecayRate: number
  }
  
  // Visual settings
  visual: {
    theme: 'light' | 'dark' | 'auto'
    colorScheme: ColorScheme
    animationEnabled: boolean
    particleEffects: boolean
  }
}

export interface TownConfig {
  welcomeMessage: string
  sceneDescriptions: {
    home: string
    garden: string
  }
  navigationHints: string[]
  backgroundElements: BackgroundElement[]
}

export interface HomeConfig {
  characters: CharacterConfig[]
  toys: ToyConfig[]
  sharingMessages: string[]
  interactionPrompts: string[]
  backgroundElements: BackgroundElement[]
}

export interface GardenConfig {
  plants: PlantConfig[]
  seeds: SeedConfig[]
  growthMessages: string[]
  careMessages: string[]
  backgroundElements: BackgroundElement[]
}

export interface CharacterConfig {
  id: string
  name: string
  emoji: string
  color: string
  personality: 'friendly' | 'shy' | 'playful' | 'helpful'
  responses: {
    share: string[]
    click: string[]
    ignore: string[]
  }
}

export interface ToyConfig {
  id: string
  name: string
  emoji: string
  color: string
  sound: string
  interactionType: 'drag' | 'click' | 'both'
}

export interface PlantConfig {
  id: string
  name: string
  type: 'flower' | 'tree' | 'vegetable'
  growthStages: GrowthStage[]
  careRequirements: {
    waterFrequency: number // milliseconds
    growthTime: number // milliseconds per stage
  }
}

export interface SeedConfig {
  id: string
  name: string
  emoji: string
  color: string
  plantType: 'flower' | 'tree' | 'vegetable'
  description: string
}

export interface GrowthStage {
  stage: 'seed' | 'sprout' | 'small' | 'flowering' | 'mature'
  emoji: string
  size: { width: number; height: number }
  color: string
}

export interface VoiceConfig {
  id: string
  name: string
  lang: string
  gender: 'male' | 'female' | 'neutral'
  ageGroup: 'child' | 'young' | 'adult' | 'senior'
  quality: 'high' | 'medium' | 'low'
}

export interface BackgroundElement {
  id: string
  type: 'shape' | 'emoji' | 'gradient'
  position: { x: string; y: string }
  size: { width: string; height: string }
  style: Record<string, string>
  animation?: AnimationConfig
}

export interface AnimationConfig {
  type: 'pulse' | 'bounce' | 'fade' | 'slide'
  duration: number
  delay?: number
  iteration?: number | 'infinite'
}

export interface ColorScheme {
  primary: string
  secondary: string
  accent: string
  background: string
  surface: string
  text: string
  success: string
  warning: string
  error: string
}

// Default configuration
export const defaultConfig: AppConfig = {
  appName: '价值之旅 · 小小世界',
  version: '0.1.0',
  
  scenes: {
    town: {
      welcomeMessage: '欢迎来到小小世界！想去哪里玩呢？',
      sceneDescriptions: {
        home: '温暖的小家，可以分享玩具',
        garden: '美丽的花园，可以种植照顾植物'
      },
      navigationHints: [
        '点击想去的地方',
        '想去哪里玩呢？',
        '试试看点击小房子或花园'
      ],
      backgroundElements: [
        {
          id: 'cloud1',
          type: 'shape',
          position: { x: '10%', y: '20%' },
          size: { width: '80px', height: '80px' },
          style: {
            backgroundColor: 'rgba(255, 255, 255, 0.6)',
            borderRadius: '50%',
            animation: 'pulse 3s infinite'
          }
        },
        {
          id: 'sparkle1',
          type: 'emoji',
          position: { x: '80%', y: '30%' },
          size: { width: '20px', height: '20px' },
          style: {
            fontSize: '20px'
          },
          animation: {
            type: 'bounce',
            duration: 2,
            delay: 0.5
          }
        }
      ]
    },
    
    home: {
      characters: [
        {
          id: 'bunny',
          name: '小兔兔',
          emoji: '🐰',
          color: 'bg-pink-200',
          personality: 'friendly',
          responses: {
            share: ['谢谢你！我好开心！', '我们一起玩吧！', '你真好！'],
            click: ['你好呀！', '我是小兔兔！', '要一起玩吗？'],
            ignore: ['我在这里等你...', '我有点孤单...', '来找我玩吧！']
          }
        },
        {
          id: 'bear',
          name: '小熊熊',
          emoji: '🐻',
          color: 'bg-amber-200',
          personality: 'playful',
          responses: {
            share: ['哇！太棒了！', '我最喜欢玩具了！', '我们一起分享！'],
            click: ['嗨！', '我是小熊熊！', '我喜欢玩！'],
            ignore: ['我有点无聊...', '玩具在哪里？', '我想玩！']
          }
        },
        {
          id: 'parent',
          name: '爸爸妈妈',
          emoji: '👨‍👩‍👧‍👦',
          color: 'bg-blue-200',
          personality: 'helpful',
          responses: {
            share: ['你真棒！', '分享是很好的行为！', '我为你骄傲！'],
            click: ['我在这里支持你', '需要帮忙吗？', '你真聪明！'],
            ignore: ['我在这里等你', '随时来找我', '我爱你！']
          }
        }
      ],
      toys: [
        {
          id: 'ball',
          name: '小球',
          emoji: '⚽',
          color: 'bg-yellow-300',
          sound: 'bounce',
          interactionType: 'drag'
        },
        {
          id: 'music_box',
          name: '音乐盒',
          emoji: '🎵',
          color: 'bg-purple-300',
          sound: 'music',
          interactionType: 'click'
        },
        {
          id: 'gift',
          name: '礼物',
          emoji: '🎁',
          color: 'bg-red-300',
          sound: 'surprise',
          interactionType: 'both'
        }
      ],
      sharingMessages: [
        '太棒了！分享带来了快乐！',
        '我们一起玩吧！',
        '分享真好！',
        '你真好，谢谢你！',
        '分享让世界更美好！'
      ],
      interactionPrompts: [
        '试试拖动玩具给小伙伴',
        '分享会带来快乐哦！',
        '把玩具给朋友看看吧！',
        '我们一起分享玩具吧！'
      ],
      backgroundElements: [
        {
          id: 'room_wall',
          type: 'shape',
          position: { x: '0', y: '0' },
          size: { width: '100%', height: '100%' },
          style: {
            background: 'linear-gradient(to bottom, #fef3c7, #fde68a)',
            zIndex: '-1'
          }
        }
      ]
    },
    
    garden: {
      plants: [
        {
          id: 'flower',
          name: '花朵',
          type: 'flower',
          growthStages: [
            { stage: 'seed', emoji: '🌱', size: { width: 16, height: 16 }, color: 'bg-green-600' },
            { stage: 'sprout', emoji: '🌱', size: { width: 16, height: 24 }, color: 'bg-green-500' },
            { stage: 'small', emoji: '🌿', size: { width: 24, height: 32 }, color: 'bg-green-400' },
            { stage: 'flowering', emoji: '🌸', size: { width: 32, height: 40 }, color: 'bg-pink-400' }
          ],
          careRequirements: {
            waterFrequency: 10000, // 10 seconds for demo
            growthTime: 5000 // 5 seconds per stage
          }
        },
        {
          id: 'tree',
          name: '小树',
          type: 'tree',
          growthStages: [
            { stage: 'seed', emoji: '🌰', size: { width: 16, height: 16 }, color: 'bg-amber-600' },
            { stage: 'sprout', emoji: '🌱', size: { width: 16, height: 24 }, color: 'bg-green-500' },
            { stage: 'small', emoji: '🌳', size: { width: 24, height: 32 }, color: 'bg-green-600' },
            { stage: 'flowering', emoji: '🌳', size: { width: 32, height: 48 }, color: 'bg-green-700' }
          ],
          careRequirements: {
            waterFrequency: 15000,
            growthTime: 8000
          }
        },
        {
          id: 'vegetable',
          name: '蔬菜',
          type: 'vegetable',
          growthStages: [
            { stage: 'seed', emoji: '🌱', size: { width: 16, height: 16 }, color: 'bg-green-600' },
            { stage: 'sprout', emoji: '🌱', size: { width: 16, height: 24 }, color: 'bg-green-500' },
            { stage: 'small', emoji: '🥬', size: { width: 24, height: 32 }, color: 'bg-green-400' },
            { stage: 'flowering', emoji: '🥕', size: { width: 32, height: 40 }, color: 'bg-orange-400' }
          ],
          careRequirements: {
            waterFrequency: 12000,
            growthTime: 6000
          }
        }
      ],
      seeds: [
        {
          id: 'flower_seed',
          name: '花种子',
          emoji: '🌱',
          color: 'bg-pink-200',
          plantType: 'flower',
          description: '美丽的花朵，需要细心照顾'
        },
        {
          id: 'tree_seed',
          name: '树种子',
          emoji: '🌰',
          color: 'bg-amber-200',
          plantType: 'tree',
          description: '坚强的小树，会慢慢长大'
        },
        {
          id: 'vegetable_seed',
          name: '蔬菜种子',
          emoji: '🥕',
          color: 'bg-orange-200',
          plantType: 'vegetable',
          description: '营养丰富的蔬菜'
        }
      ],
      growthMessages: [
        '种子种好了！需要浇水才能长大哦！',
        '植物在慢慢长大，需要耐心等待哦！',
        '看！植物长高了！',
        '太棒了！植物开花了！',
        '植物需要持续的照顾才能茁壮成长！'
      ],
      careMessages: [
        '给植物浇水了！植物会很开心的！',
        '植物喝饱水了，会快快长大的！',
        '植物说谢谢你！',
        '浇水让植物更健康！',
        '定期浇水很重要哦！'
      ],
      backgroundElements: [
        {
          id: 'garden_sky',
          type: 'gradient',
          position: { x: '0', y: '0' },
          size: { width: '100%', height: '70%' },
          style: {
            background: 'linear-gradient(to bottom, #dbeafe, #bfdbfe)',
            zIndex: '-1'
          }
        },
        {
          id: 'garden_ground',
          type: 'shape',
          position: { x: '0', y: '70%' },
          size: { width: '100%', height: '30%' },
          style: {
            backgroundColor: '#86efac',
            zIndex: '-1'
          }
        }
      ]
    }
  },
  
  audio: {
    enabled: true,
    volume: 0.7,
    speechRate: 0.8,
    speechPitch: 1.1,
    voices: [
      {
        id: 'gentle_female',
        name: '温柔女声',
        lang: 'zh-CN',
        gender: 'female',
        ageGroup: 'young',
        quality: 'high'
      },
      {
        id: 'friendly_male',
        name: '友好男声',
        lang: 'zh-CN',
        gender: 'male',
        ageGroup: 'young',
        quality: 'high'
      }
    ]
  },
  
  interactions: {
    dragThreshold: 10, // pixels
    clickDelay: 300, // milliseconds
    feedbackDuration: 2000, // milliseconds
    animationSpeed: 300 // milliseconds
  },
  
  timeManagement: {
    defaultSessionLimit: 15, // minutes
    warningTime: 2, // minutes before end
    extendTime: 5, // minutes for extension
    autoExitDelay: 2000 // milliseconds
  },
  
  behaviorTracking: {
    enabled: true,
    maxBehaviorsStored: 100,
    interestCalculationWindow: 20,
    interestDecayRate: 0.9
  },
  
  visual: {
    theme: 'light',
    colorScheme: {
      primary: '#3b82f6',
      secondary: '#8b5cf6',
      accent: '#f59e0b',
      background: '#ffffff',
      surface: '#f8fafc',
      text: '#1f2937',
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444'
    },
    animationEnabled: true,
    particleEffects: true
  }
}

// Configuration manager
class ConfigManager {
  private config: AppConfig
  private listeners: Set<(config: AppConfig) => void> = new Set()

  constructor(initialConfig: AppConfig) {
    this.config = { ...initialConfig }
  }

  getConfig(): AppConfig {
    return { ...this.config }
  }

  updateConfig(updates: Partial<AppConfig>) {
    this.config = { ...this.config, ...updates }
    this.notifyListeners()
  }

  updateSceneConfig(scene: keyof AppConfig['scenes'], config: Partial<AppConfig['scenes'][typeof scene]>) {
    this.config.scenes[scene] = { ...this.config.scenes[scene], ...config } as any
    this.notifyListeners()
  }

  updateAudioConfig(config: Partial<AppConfig['audio']>) {
    this.config.audio = { ...this.config.audio, ...config }
    this.notifyListeners()
  }

  subscribe(listener: (config: AppConfig) => void) {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener(this.config))
  }

  // Utility methods
  getVoiceById(id: string): VoiceConfig | undefined {
    return this.config.audio.voices.find(voice => voice.id === id)
  }

  getCharacterById(id: string): CharacterConfig | undefined {
    const characters = [
      ...this.config.scenes.home.characters,
      // Add characters from other scenes if needed
    ]
    return characters.find(char => char.id === id)
  }

  getPlantById(id: string): PlantConfig | undefined {
    return this.config.scenes.garden.plants.find(plant => plant.id === id)
  }

  getToyById(id: string): ToyConfig | undefined {
    return this.config.scenes.home.toys.find(toy => toy.id === id)
  }
}

// Create singleton instance
export const configManager = new ConfigManager(defaultConfig)

// Export for use in components
export default configManager