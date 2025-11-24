// Asset configuration and management system
// Based on UI motion plan requirements and universal assistant rules

export type AssetType = 'emoji' | 'svg' | 'lottie' | 'gltf'
export type AssetCategory = 'characters' | 'toys' | 'backgrounds' | 'animations' | 'icons'

export interface AssetMetadata {
  id: string
  name: string
  category: AssetCategory
  type: AssetType
  src: string
  alt: string
  dimensions?: { width: number; height: number }
  fileSize?: number
  version: string
  createdAt: string
  updatedAt: string
  tags: string[]
  fallback?: string // Fallback asset ID for graceful degradation
}

export interface AssetManifest {
  version: string
  assets: Record<string, AssetMetadata>
  categories: Record<AssetCategory, string[]>
}

export interface AssetLoadingConfig {
  lazyLoad: boolean
  preloadCritical: boolean
  maxConcurrentLoads: number
  timeout: number
  retryAttempts: number
  retryDelay: number
}

export interface AnimationAssetConfig {
  duration: number
  easing: string
  delay?: number
  iterations?: number | 'infinite'
  direction?: 'normal' | 'reverse' | 'alternate'
  fillMode?: 'none' | 'forwards' | 'backwards' | 'both'
}

export interface AssetThemeConfig {
  primary: string
  secondary: string
  accent: string
  background: string
  surface: string
  text: string
}

// Asset naming conventions based on universal assistant rules
export const ASSET_NAMING_RULES = {
  characters: {
    pattern: /^[a-z]+(_[a-z]+)*$/, // lowercase_with_underscores
    examples: ['bunny', 'bear', 'parent_mom', 'parent_dad']
  },
  toys: {
    pattern: /^[a-z]+(_[a-z]+)*$/, // lowercase_with_underscores
    examples: ['ball', 'music_box', 'gift', 'blocks']
  },
  backgrounds: {
    pattern: /^[a-z]+(_[a-z]+)*_bg$/, // lowercase_with_underscores + _bg suffix
    examples: ['home_room_bg', 'garden_sky_bg', 'town_view_bg']
  },
  animations: {
    pattern: /^[a-z]+(_[a-z]+)*_anim$/, // lowercase_with_underscores + _anim suffix
    examples: ['bounce_anim', 'grow_anim', 'sparkle_anim']
  },
  icons: {
    pattern: /^[a-z]+(_[a-z]+)*_icon$/, // lowercase_with_underscores + _icon suffix
    examples: ['water_icon', 'share_icon', 'home_icon']
  }
} as const

// Asset validation rules
export const ASSET_VALIDATION_RULES = {
  svg: {
    maxFileSize: 50 * 1024, // 50KB
    dimensions: { min: 16, max: 512 },
    requiredAttributes: ['viewBox', 'xmlns']
  },
  lottie: {
    maxFileSize: 200 * 1024, // 200KB
    requiredProperties: ['v', 'fr', 'ip', 'op', 'layers']
  },
  gltf: {
    maxFileSize: 500 * 1024, // 500KB
    requiredExtensions: ['.gltf', '.glb']
  }
} as const

// Performance and accessibility configurations
export const PERFORMANCE_CONFIG: AssetLoadingConfig = {
  lazyLoad: true,
  preloadCritical: true,
  maxConcurrentLoads: 3,
  timeout: 10000, // 10 seconds
  retryAttempts: 3,
  retryDelay: 1000 // 1 second
}

export const ACCESSIBILITY_CONFIG = {
  supportsReducedMotion: true,
  highContrastMode: true,
  screenReaderCompatible: true,
  keyboardNavigation: true
}

// Asset manifest with metadata for all assets
export const ASSET_MANIFEST: AssetManifest = {
  version: '1.0.0',
  assets: {
    // Characters
    'bunny': {
      id: 'bunny',
      name: '小兔兔',
      category: 'characters',
      type: 'svg',
      src: '/assets/characters/bunny.svg',
      alt: '可爱的小兔兔角色',
      dimensions: { width: 64, height: 64 },
      version: '1.0.0',
      createdAt: '2025-11-22T00:00:00Z',
      updatedAt: '2025-11-22T00:00:00Z',
      tags: ['character', 'animal', 'cute', 'friendly'],
      fallback: 'bunny_emoji'
    },
    'bear': {
      id: 'bear',
      name: '小熊熊',
      category: 'characters',
      type: 'svg',
      src: '/assets/characters/bear.svg',
      alt: '友好的小熊熊角色',
      dimensions: { width: 64, height: 64 },
      version: '1.0.0',
      createdAt: '2025-11-22T00:00:00Z',
      updatedAt: '2025-11-22T00:00:00Z',
      tags: ['character', 'animal', 'cute', 'playful'],
      fallback: 'bear_emoji'
    },
    'parent_mom': {
      id: 'parent_mom',
      name: '妈妈',
      category: 'characters',
      type: 'svg',
      src: '/assets/characters/parent_mom.svg',
      alt: '温柔的妈妈角色',
      dimensions: { width: 64, height: 64 },
      version: '1.0.0',
      createdAt: '2025-11-22T00:00:00Z',
      updatedAt: '2025-11-22T00:00:00Z',
      tags: ['character', 'parent', 'caring', 'helpful'],
      fallback: 'parent_emoji'
    },
    'parent_dad': {
      id: 'parent_dad',
      name: '爸爸',
      category: 'characters',
      type: 'svg',
      src: '/assets/characters/parent_dad.svg',
      alt: '友善的爸爸角色',
      dimensions: { width: 64, height: 64 },
      version: '1.0.0',
      createdAt: '2025-11-22T00:00:00Z',
      updatedAt: '2025-11-22T00:00:00Z',
      tags: ['character', 'parent', 'supportive', 'helpful'],
      fallback: 'parent_emoji'
    },
    
    // Toys
    'ball': {
      id: 'ball',
      name: '小球',
      category: 'toys',
      type: 'svg',
      src: '/assets/toys/ball.svg',
      alt: '彩色玩具球',
      dimensions: { width: 32, height: 32 },
      version: '1.0.0',
      createdAt: '2025-11-22T00:00:00Z',
      updatedAt: '2025-11-22T00:00:00Z',
      tags: ['toy', 'play', 'colorful', 'bounce'],
      fallback: 'ball_emoji'
    },
    'music_box': {
      id: 'music_box',
      name: '音乐盒',
      category: 'toys',
      type: 'svg',
      src: '/assets/toys/music_box.svg',
      alt: '精美的音乐盒',
      dimensions: { width: 32, height: 32 },
      version: '1.0.0',
      createdAt: '2025-11-22T00:00:00Z',
      updatedAt: '2025-11-22T00:00:00Z',
      tags: ['toy', 'music', 'elegant', 'melody'],
      fallback: 'music_box_emoji'
    },
    'gift': {
      id: 'gift',
      name: '礼物',
      category: 'toys',
      type: 'svg',
      src: '/assets/toys/gift.svg',
      alt: '漂亮的礼物盒',
      dimensions: { width: 32, height: 32 },
      version: '1.0.0',
      createdAt: '2025-11-22T00:00:00Z',
      updatedAt: '2025-11-22T00:00:00Z',
      tags: ['toy', 'present', 'surprise', 'sharing'],
      fallback: 'gift_emoji'
    },
    
    // Backgrounds
    'home_room_bg': {
      id: 'home_room_bg',
      name: '房间背景',
      category: 'backgrounds',
      type: 'svg',
      src: '/assets/backgrounds/home_room_bg.svg',
      alt: '温馨的房间背景',
      dimensions: { width: 800, height: 600 },
      version: '1.0.0',
      createdAt: '2025-11-22T00:00:00Z',
      updatedAt: '2025-11-22T00:00:00Z',
      tags: ['background', 'room', 'home', 'cozy']
    },
    'garden_sky_bg': {
      id: 'garden_sky_bg',
      name: '花园天空背景',
      category: 'backgrounds',
      type: 'svg',
      src: '/assets/backgrounds/garden_sky_bg.svg',
      alt: '花园天空背景',
      dimensions: { width: 800, height: 600 },
      version: '1.0.0',
      createdAt: '2025-11-22T00:00:00Z',
      updatedAt: '2025-11-22T00:00:00Z',
      tags: ['background', 'garden', 'sky', 'nature']
    },
    'town_view_bg': {
      id: 'town_view_bg',
      name: '小镇背景',
      category: 'backgrounds',
      type: 'svg',
      src: '/assets/backgrounds/town_view_bg.svg',
      alt: '小镇全景背景',
      dimensions: { width: 1200, height: 800 },
      version: '1.0.0',
      createdAt: '2025-11-22T00:00:00Z',
      updatedAt: '2025-11-22T00:00:00Z',
      tags: ['background', 'town', 'panorama', 'exploration']
    },
    
    // Animations
    'bounce_anim': {
      id: 'bounce_anim',
      name: '弹跳动画',
      category: 'animations',
      type: 'lottie',
      src: '/assets/animations/bounce_anim.json',
      alt: '弹跳动画效果',
      version: '1.0.0',
      createdAt: '2025-11-22T00:00:00Z',
      updatedAt: '2025-11-22T00:00:00Z',
      tags: ['animation', 'bounce', 'playful', 'interaction']
    },
    'grow_anim': {
      id: 'grow_anim',
      name: '生长动画',
      category: 'animations',
      type: 'lottie',
      src: '/assets/animations/grow_anim.json',
      alt: '植物生长动画',
      version: '1.0.0',
      createdAt: '2025-11-22T00:00:00Z',
      updatedAt: '2025-11-22T00:00:00Z',
      tags: ['animation', 'grow', 'plant', 'nature']
    },
    'sparkle_anim': {
      id: 'sparkle_anim',
      name: '闪光动画',
      category: 'animations',
      type: 'lottie',
      src: '/assets/animations/sparkle_anim.json',
      alt: '闪光特效动画',
      version: '1.0.0',
      createdAt: '2025-11-22T00:00:00Z',
      updatedAt: '2025-11-22T00:00:00Z',
      tags: ['animation', 'sparkle', 'effect', 'magical']
    },
    
    // Icons
    'water_icon': {
      id: 'water_icon',
      name: '水滴图标',
      category: 'icons',
      type: 'svg',
      src: '/assets/icons/water_icon.svg',
      alt: '水滴图标',
      dimensions: { width: 24, height: 24 },
      version: '1.0.0',
      createdAt: '2025-11-22T00:00:00Z',
      updatedAt: '2025-11-22T00:00:00Z',
      tags: ['icon', 'water', 'garden', 'care']
    },
    'share_icon': {
      id: 'share_icon',
      name: '分享图标',
      category: 'icons',
      type: 'svg',
      src: '/assets/icons/share_icon.svg',
      alt: '分享图标',
      dimensions: { width: 24, height: 24 },
      version: '1.0.0',
      createdAt: '2025-11-22T00:00:00Z',
      updatedAt: '2025-11-22T00:00:00Z',
      tags: ['icon', 'share', 'social', 'interaction']
    },
    'home_icon': {
      id: 'home_icon',
      name: '主页图标',
      category: 'icons',
      type: 'svg',
      src: '/assets/icons/home_icon.svg',
      alt: '主页图标',
      dimensions: { width: 24, height: 24 },
      version: '1.0.0',
      createdAt: '2025-11-22T00:00:00Z',
      updatedAt: '2025-11-22T00:00:00Z',
      tags: ['icon', 'home', 'navigation', 'main']
    },
    
    // Plant growth stages
    'plant_seed': {
      id: 'plant_seed',
      name: '种子',
      category: 'animations',
      type: 'svg',
      src: '/assets/plants/seed.svg',
      alt: '植物种子',
      dimensions: { width: 16, height: 16 },
      version: '1.0.0',
      createdAt: '2025-11-22T00:00:00Z',
      updatedAt: '2025-11-22T00:00:00Z',
      tags: ['plant', 'seed', 'growth', 'garden'],
      fallback: 'seed_emoji'
    },
    'plant_sprout': {
      id: 'plant_sprout',
      name: '嫩芽',
      category: 'animations',
      type: 'svg',
      src: '/assets/plants/sprout.svg',
      alt: '植物嫩芽',
      dimensions: { width: 24, height: 32 },
      version: '1.0.0',
      createdAt: '2025-11-22T00:00:00Z',
      updatedAt: '2025-11-22T00:00:00Z',
      tags: ['plant', 'sprout', 'growth', 'garden'],
      fallback: 'sprout_emoji'
    },
    'plant_small': {
      id: 'plant_small',
      name: '小植物',
      category: 'animations',
      type: 'svg',
      src: '/assets/plants/small.svg',
      alt: '小植物',
      dimensions: { width: 32, height: 40 },
      version: '1.0.0',
      createdAt: '2025-11-22T00:00:00Z',
      updatedAt: '2025-11-22T00:00:00Z',
      tags: ['plant', 'small', 'growth', 'garden'],
      fallback: 'small_emoji'
    },
    'plant_flowering': {
      id: 'plant_flowering',
      name: '开花植物',
      category: 'animations',
      type: 'svg',
      src: '/assets/plants/flowering.svg',
      alt: '开花植物',
      dimensions: { width: 40, height: 48 },
      version: '1.0.0',
      createdAt: '2025-11-22T00:00:00Z',
      updatedAt: '2025-11-22T00:00:00Z',
      tags: ['plant', 'flower', 'growth', 'garden'],
      fallback: 'flowering_emoji'
    },
    'plant_flower': {
      id: 'plant_flower',
      name: '花朵',
      category: 'animations',
      type: 'svg',
      src: '/assets/plants/flower.svg',
      alt: '美丽花朵',
      dimensions: { width: 32, height: 32 },
      version: '1.0.0',
      createdAt: '2025-11-22T00:00:00Z',
      updatedAt: '2025-11-22T00:00:00Z',
      tags: ['plant', 'flower', 'beautiful', 'garden'],
      fallback: 'flower_emoji'
    },
    'plant_tree': {
      id: 'plant_tree',
      name: '小树',
      category: 'animations',
      type: 'svg',
      src: '/assets/plants/tree.svg',
      alt: '小树',
      dimensions: { width: 48, height: 64 },
      version: '1.0.0',
      createdAt: '2025-11-22T00:00:00Z',
      updatedAt: '2025-11-22T00:00:00Z',
      tags: ['plant', 'tree', 'nature', 'garden'],
      fallback: 'tree_emoji'
    },
    'plant_vegetable': {
      id: 'plant_vegetable',
      name: '蔬菜',
      category: 'animations',
      type: 'svg',
      src: '/assets/plants/vegetable.svg',
      alt: '新鲜蔬菜',
      dimensions: { width: 32, height: 32 },
      version: '1.0.0',
      createdAt: '2025-11-22T00:00:00Z',
      updatedAt: '2025-11-22T00:00:00Z',
      tags: ['plant', 'vegetable', 'food', 'garden'],
      fallback: 'vegetable_emoji'
    },
    
    // Weather effects
    'weather_sunny': {
      id: 'weather_sunny',
      name: '阳光',
      category: 'animations',
      type: 'svg',
      src: '/assets/weather/sunny.svg',
      alt: '阳光效果',
      dimensions: { width: 64, height: 64 },
      version: '1.0.0',
      createdAt: '2025-11-22T00:00:00Z',
      updatedAt: '2025-11-22T00:00:00Z',
      tags: ['weather', 'sun', 'light', 'effect'],
      fallback: 'sunny_emoji'
    },
    'weather_rain': {
      id: 'weather_rain',
      name: '雨滴',
      category: 'animations',
      type: 'svg',
      src: '/assets/weather/rain.svg',
      alt: '雨滴效果',
      dimensions: { width: 32, height: 32 },
      version: '1.0.0',
      createdAt: '2025-11-22T00:00:00Z',
      updatedAt: '2025-11-22T00:00:00Z',
      tags: ['weather', 'rain', 'water', 'effect'],
      fallback: 'rain_emoji'
    },
    'weather_cloud': {
      id: 'weather_cloud',
      name: '云朵',
      category: 'animations',
      type: 'svg',
      src: '/assets/weather/cloud.svg',
      alt: '云朵效果',
      dimensions: { width: 48, height: 32 },
      version: '1.0.0',
      createdAt: '2025-11-22T00:00:00Z',
      updatedAt: '2025-11-22T00:00:00Z',
      tags: ['weather', 'cloud', 'sky', 'effect'],
      fallback: 'cloud_emoji'
    },
    'light_spot': {
      id: 'light_spot',
      name: '光斑',
      category: 'animations',
      type: 'svg',
      src: '/assets/effects/light_spot.svg',
      alt: '光斑效果',
      dimensions: { width: 80, height: 80 },
      version: '1.0.0',
      createdAt: '2025-11-22T00:00:00Z',
      updatedAt: '2025-11-22T00:00:00Z',
      tags: ['effect', 'light', 'spot', 'atmosphere'],
      fallback: 'light_emoji'
    },
    
    // Fallback emoji assets (for graceful degradation)
    'bunny_emoji': {
      id: 'bunny_emoji',
      name: '小兔兔Emoji',
      category: 'characters',
      type: 'emoji',
      src: '🐰',
      alt: '小兔兔',
      version: '1.0.0',
      createdAt: '2025-11-22T00:00:00Z',
      updatedAt: '2025-11-22T00:00:00Z',
      tags: ['emoji', 'character', 'animal', 'fallback']
    },
    'bear_emoji': {
      id: 'bear_emoji',
      name: '小熊熊Emoji',
      category: 'characters',
      type: 'emoji',
      src: '🐻',
      alt: '小熊熊',
      version: '1.0.0',
      createdAt: '2025-11-22T00:00:00Z',
      updatedAt: '2025-11-22T00:00:00Z',
      tags: ['emoji', 'character', 'animal', 'fallback']
    },
    'parent_emoji': {
      id: 'parent_emoji',
      name: '父母Emoji',
      category: 'characters',
      type: 'emoji',
      src: '👨‍👩‍👧‍👦',
      alt: '爸爸妈妈',
      version: '1.0.0',
      createdAt: '2025-11-22T00:00:00Z',
      updatedAt: '2025-11-22T00:00:00Z',
      tags: ['emoji', 'character', 'parent', 'fallback']
    },
    'ball_emoji': {
      id: 'ball_emoji',
      name: '小球Emoji',
      category: 'toys',
      type: 'emoji',
      src: '⚽',
      alt: '小球',
      version: '1.0.0',
      createdAt: '2025-11-22T00:00:00Z',
      updatedAt: '2025-11-22T00:00:00Z',
      tags: ['emoji', 'toy', 'play', 'fallback']
    },
    'music_box_emoji': {
      id: 'music_box_emoji',
      name: '音乐盒Emoji',
      category: 'toys',
      type: 'emoji',
      src: '🎵',
      alt: '音乐盒',
      version: '1.0.0',
      createdAt: '2025-11-22T00:00:00Z',
      updatedAt: '2025-11-22T00:00:00Z',
      tags: ['emoji', 'toy', 'music', 'fallback']
    },
    'gift_emoji': {
      id: 'gift_emoji',
      name: '礼物Emoji',
      category: 'toys',
      type: 'emoji',
      src: '🎁',
      alt: '礼物',
      version: '1.0.0',
      createdAt: '2025-11-22T00:00:00Z',
      updatedAt: '2025-11-22T00:00:00Z',
      tags: ['emoji', 'toy', 'present', 'fallback']
    },
    
    // Plant emoji fallbacks
    'seed_emoji': {
      id: 'seed_emoji',
      name: '种子Emoji',
      category: 'animations',
      type: 'emoji',
      src: '🌱',
      alt: '种子',
      version: '1.0.0',
      createdAt: '2025-11-22T00:00:00Z',
      updatedAt: '2025-11-22T00:00:00Z',
      tags: ['emoji', 'plant', 'seed', 'fallback']
    },
    'sprout_emoji': {
      id: 'sprout_emoji',
      name: '嫩芽Emoji',
      category: 'animations',
      type: 'emoji',
      src: '🌱',
      alt: '嫩芽',
      version: '1.0.0',
      createdAt: '2025-11-22T00:00:00Z',
      updatedAt: '2025-11-22T00:00:00Z',
      tags: ['emoji', 'plant', 'sprout', 'fallback']
    },
    'small_emoji': {
      id: 'small_emoji',
      name: '小植物Emoji',
      category: 'animations',
      type: 'emoji',
      src: '🌿',
      alt: '小植物',
      version: '1.0.0',
      createdAt: '2025-11-22T00:00:00Z',
      updatedAt: '2025-11-22T00:00:00Z',
      tags: ['emoji', 'plant', 'small', 'fallback']
    },
    'flowering_emoji': {
      id: 'flowering_emoji',
      name: '开花Emoji',
      category: 'animations',
      type: 'emoji',
      src: '🌸',
      alt: '开花',
      version: '1.0.0',
      createdAt: '2025-11-22T00:00:00Z',
      updatedAt: '2025-11-22T00:00:00Z',
      tags: ['emoji', 'plant', 'flower', 'fallback']
    },
    'flower_emoji': {
      id: 'flower_emoji',
      name: '花朵Emoji',
      category: 'animations',
      type: 'emoji',
      src: '🌸',
      alt: '花朵',
      version: '1.0.0',
      createdAt: '2025-11-22T00:00:00Z',
      updatedAt: '2025-11-22T00:00:00Z',
      tags: ['emoji', 'plant', 'flower', 'fallback']
    },
    'tree_emoji': {
      id: 'tree_emoji',
      name: '树Emoji',
      category: 'animations',
      type: 'emoji',
      src: '🌳',
      alt: '树',
      version: '1.0.0',
      createdAt: '2025-11-22T00:00:00Z',
      updatedAt: '2025-11-22T00:00:00Z',
      tags: ['emoji', 'plant', 'tree', 'fallback']
    },
    'vegetable_emoji': {
      id: 'vegetable_emoji',
      name: '蔬菜Emoji',
      category: 'animations',
      type: 'emoji',
      src: '🥕',
      alt: '蔬菜',
      version: '1.0.0',
      createdAt: '2025-11-22T00:00:00Z',
      updatedAt: '2025-11-22T00:00:00Z',
      tags: ['emoji', 'plant', 'vegetable', 'fallback']
    },
    
    // Weather emoji fallbacks
    'sunny_emoji': {
      id: 'sunny_emoji',
      name: '阳光Emoji',
      category: 'animations',
      type: 'emoji',
      src: '☀️',
      alt: '阳光',
      version: '1.0.0',
      createdAt: '2025-11-22T00:00:00Z',
      updatedAt: '2025-11-22T00:00:00Z',
      tags: ['emoji', 'weather', 'sun', 'fallback']
    },
    'rain_emoji': {
      id: 'rain_emoji',
      name: '雨滴Emoji',
      category: 'animations',
      type: 'emoji',
      src: '💧',
      alt: '雨滴',
      version: '1.0.0',
      createdAt: '2025-11-22T00:00:00Z',
      updatedAt: '2025-11-22T00:00:00Z',
      tags: ['emoji', 'weather', 'rain', 'fallback']
    },
    'cloud_emoji': {
      id: 'cloud_emoji',
      name: '云朵Emoji',
      category: 'animations',
      type: 'emoji',
      src: '☁️',
      alt: '云朵',
      version: '1.0.0',
      createdAt: '2025-11-22T00:00:00Z',
      updatedAt: '2025-11-22T00:00:00Z',
      tags: ['emoji', 'weather', 'cloud', 'fallback']
    },
    'light_emoji': {
      id: 'light_emoji',
      name: '光Emoji',
      category: 'animations',
      type: 'emoji',
      src: '✨',
      alt: '光',
      version: '1.0.0',
      createdAt: '2025-11-22T00:00:00Z',
      updatedAt: '2025-11-22T00:00:00Z',
      tags: ['emoji', 'light', 'effect', 'fallback']
    }
  },
  categories: {
    characters: ['bunny', 'bear', 'parent_mom', 'parent_dad', 'bunny_emoji', 'bear_emoji', 'parent_emoji'],
    toys: ['ball', 'music_box', 'gift', 'ball_emoji', 'music_box_emoji', 'gift_emoji'],
    backgrounds: ['home_room_bg', 'garden_sky_bg', 'town_view_bg'],
    animations: [
      'bounce_anim', 'grow_anim', 'sparkle_anim',
      'plant_seed', 'plant_sprout', 'plant_small', 'plant_flowering', 'plant_flower', 'plant_tree', 'plant_vegetable',
      'weather_sunny', 'weather_rain', 'weather_cloud', 'light_spot',
      'seed_emoji', 'sprout_emoji', 'small_emoji', 'flowering_emoji', 'flower_emoji', 'tree_emoji', 'vegetable_emoji',
      'sunny_emoji', 'rain_emoji', 'cloud_emoji', 'light_emoji'
    ],
    icons: ['water_icon', 'share_icon', 'home_icon']
  }
}

// Asset manager class
export class AssetManager {
  private manifest: AssetManifest
  private loadedAssets: Map<string, any> = new Map()
  private loadingPromises: Map<string, Promise<any>> = new Map()
  private config: AssetLoadingConfig

  constructor(manifest: AssetManifest = ASSET_MANIFEST, config: AssetLoadingConfig = PERFORMANCE_CONFIG) {
    this.manifest = manifest
    this.config = config
  }

  // Get asset metadata
  getAsset(assetId: string): AssetMetadata | undefined {
    return this.manifest.assets[assetId]
  }

  // Get assets by category
  getAssetsByCategory(category: AssetCategory): AssetMetadata[] {
    const assetIds = this.manifest.categories[category] || []
    return assetIds.map(id => this.manifest.assets[id]).filter(Boolean)
  }

  // Validate asset ID according to naming rules
  validateAssetId(assetId: string, category: AssetCategory): boolean {
    const rules = ASSET_NAMING_RULES[category]
    return rules.pattern.test(assetId)
  }

  // Load asset with lazy loading and error handling
  async loadAsset(assetId: string): Promise<any> {
    // Return cached asset if already loaded
    if (this.loadedAssets.has(assetId)) {
      return this.loadedAssets.get(assetId)
    }

    // Return existing loading promise if already loading
    if (this.loadingPromises.has(assetId)) {
      return this.loadingPromises.get(assetId)
    }

    const asset = this.getAsset(assetId)
    if (!asset) {
      throw new Error(`Asset not found: ${assetId}`)
    }

    // Create loading promise
    const loadingPromise = this.loadAssetData(asset)
      .then(data => {
        this.loadedAssets.set(assetId, data)
        this.loadingPromises.delete(assetId)
        return data
      })
      .catch(error => {
        this.loadingPromises.delete(assetId)
        
        // Try fallback asset if available
        if (asset.fallback) {
          console.warn(`Failed to load asset ${assetId}, trying fallback: ${asset.fallback}`)
          return this.loadAsset(asset.fallback)
        }
        
        throw error
      })

    this.loadingPromises.set(assetId, loadingPromise)
    return loadingPromise
  }

  // Load asset data based on type
  private async loadAssetData(asset: AssetMetadata): Promise<any> {
    switch (asset.type) {
      case 'emoji':
        return asset.src // Emoji is already loaded
      
      case 'svg':
        return this.loadSVG(asset.src)
      
      case 'lottie':
        return this.loadLottie(asset.src)
      
      case 'gltf':
        return this.loadGLTF(asset.src)
      
      default:
        throw new Error(`Unsupported asset type: ${asset.type}`)
    }
  }

  // Load SVG asset
  private async loadSVG(src: string): Promise<string> {
    const response = await fetch(src)
    if (!response.ok) {
      throw new Error(`Failed to load SVG: ${src}`)
    }
    return response.text()
  }

  // Load Lottie animation
  private async loadLottie(src: string): Promise<any> {
    const response = await fetch(src)
    if (!response.ok) {
      throw new Error(`Failed to load Lottie: ${src}`)
    }
    return response.json()
  }

  // Load GLTF model
  private async loadGLTF(src: string): Promise<any> {
    const response = await fetch(src)
    if (!response.ok) {
      throw new Error(`Failed to load GLTF: ${src}`)
    }
    return response.arrayBuffer()
  }

  // Preload critical assets
  async preloadCriticalAssets(assetIds: string[]): Promise<void> {
    if (!this.config.preloadCritical) return

    const loadPromises = assetIds.map(assetId => 
      this.loadAsset(assetId).catch(error => {
        console.warn(`Failed to preload critical asset: ${assetId}`, error)
      })
    )

    await Promise.all(loadPromises)
  }

  // Clear cached assets
  clearCache(): void {
    this.loadedAssets.clear()
    this.loadingPromises.clear()
  }

  // Get asset loading status
  getLoadingStatus(): { loaded: number; loading: number; total: number } {
    return {
      loaded: this.loadedAssets.size,
      loading: this.loadingPromises.size,
      total: Object.keys(this.manifest.assets).length
    }
  }
}

// Create singleton instance
export const assetManager = new AssetManager()

// Export for use in components
export default assetManager

// Export background assets for TownView
export const backgroundAssets = [
  'home_room_bg',
  'garden_sky_bg', 
  'town_view_bg'
]