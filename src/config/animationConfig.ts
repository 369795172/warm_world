// Animation configuration based on UI motion plan requirements
// Ensures consistent timing and performance across all components

export interface AnimationTiming {
  entrance: {
    fast: number
    normal: number
    slow: number
  }
  interaction: {
    fast: number
    normal: number
    slow: number
  }
  complex: {
    fast: number
    normal: number
    slow: number
  }
}

export interface AnimationEasing {
  easeOut: string
  easeIn: string
  easeInOut: string
  linear: string
  spring: string
  bounce: string
}

export interface AnimationVariants {
  initial: Record<string, unknown>
  animate: Record<string, unknown>
  exit?: Record<string, unknown>
  hover?: Record<string, unknown>
  tap?: Record<string, unknown>
  drag?: Record<string, unknown>
}

// Animation timing standards from UI motion plan (v0.2)
export const ANIMATION_TIMING: AnimationTiming = {
  // Entrance animations: 200-400ms
  entrance: {
    fast: 200,
    normal: 300,
    slow: 400
  },
  
  // Interaction feedback: 100-150ms  
  interaction: {
    fast: 100,
    normal: 125,
    slow: 150
  },
  
  // Complex animations: 500-1000ms
  complex: {
    fast: 500,
    normal: 750,
    slow: 1000
  }
} as const

// Easing functions optimized for 60+ FPS
export const ANIMATION_EASING: AnimationEasing = {
  easeOut: 'easeOut',      // Natural deceleration
  easeIn: 'easeIn',       // Natural acceleration
  easeInOut: 'easeInOut',  // Natural in and out
  linear: 'linear',                           // Constant speed
  spring: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)', // Spring effect
  bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)'     // Bounce effect
} as const

// Component-specific animation variants
export const COMPONENT_VARIANTS = {
  // Character animations
  character: {
    initial: { scale: 0, opacity: 0, y: 20 },
    animate: { 
      scale: 1, 
      opacity: 1, 
      y: 0,
      transition: {
        duration: ANIMATION_TIMING.entrance.normal / 1000,
        ease: ANIMATION_EASING.spring as any,
        delay: 0.1
      }
    },
    exit: { 
      scale: 0, 
      opacity: 0, 
      y: -20,
      transition: {
        duration: ANIMATION_TIMING.entrance.fast / 1000,
        ease: ANIMATION_EASING.easeIn as any as any
      }
    },
    hover: { 
      scale: 1.05,
      transition: {
        duration: ANIMATION_TIMING.interaction.fast / 1000,
        ease: ANIMATION_EASING.easeOut as any
      }
    },
    tap: { 
      scale: 0.95,
      transition: {
        duration: ANIMATION_TIMING.interaction.fast / 1000,
        ease: ANIMATION_EASING.easeOut
      }
    }
  },

  // Toy animations
  toy: {
    initial: { scale: 0, opacity: 0, rotate: -180 },
    animate: { 
      scale: 1, 
      opacity: 1, 
      rotate: 0,
      transition: {
        duration: ANIMATION_TIMING.entrance.slow / 1000,
        ease: ANIMATION_EASING.bounce as any,
        delay: 0.2
      }
    },
    exit: { 
      scale: 0, 
      opacity: 0, 
      rotate: 180,
      transition: {
        duration: ANIMATION_TIMING.entrance.fast / 1000,
        ease: ANIMATION_EASING.easeIn
      }
    },
    hover: { 
      scale: 1.1,
      y: -5,
      transition: {
        duration: ANIMATION_TIMING.interaction.normal / 1000,
        ease: ANIMATION_EASING.easeOut
      }
    },
    drag: { 
      scale: 1.15,
      rotate: 10,
      z: 20,
      transition: {
        duration: ANIMATION_TIMING.interaction.fast / 1000,
        ease: ANIMATION_EASING.linear
      }
    }
  },

  // UI element animations
  uiElement: {
    initial: { opacity: 0, y: 30 },
    animate: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: ANIMATION_TIMING.entrance.normal / 1000,
        ease: ANIMATION_EASING.easeOut as any,
        staggerChildren: 0.1
      }
    },
    exit: { 
      opacity: 0, 
      y: -30,
      transition: {
        duration: ANIMATION_TIMING.entrance.fast / 1000,
        ease: ANIMATION_EASING.easeIn
      }
    }
  },

  // Feedback message animations
  feedback: {
    initial: { scale: 0, opacity: 0, y: 20 },
    animate: { 
      scale: 1, 
      opacity: 1, 
      y: 0,
      transition: {
        duration: ANIMATION_TIMING.interaction.slow / 1000,
        ease: ANIMATION_EASING.spring,
        type: "spring",
        stiffness: 300,
        damping: 20
      }
    },
    exit: { 
      scale: 0, 
      opacity: 0, 
      y: -20,
      transition: {
        duration: ANIMATION_TIMING.interaction.fast / 1000,
        ease: ANIMATION_EASING.easeIn
      }
    }
  },

  // Background element animations
  background: {
    initial: { opacity: 0, scale: 0.8 },
    animate: { 
      opacity: 1, 
      scale: 1,
      transition: {
        duration: ANIMATION_TIMING.entrance.slow / 1000,
        ease: ANIMATION_EASING.easeOut,
        delay: 0.5
      }
    }
  },

  // Sharing effect animations
  sharing: {
    initial: { scale: 0, opacity: 0, rotate: 0 },
    animate: { 
      scale: [0, 1.5, 0],
      opacity: [0, 0.8, 0],
      rotate: 360,
      transition: {
        duration: ANIMATION_TIMING.complex.normal / 1000,
        ease: ANIMATION_EASING.easeOut,
        times: [0, 0.5, 1]
      }
    }
  },

  // Sparkle effect animations
  sparkle: {
    initial: { scale: 0, opacity: 0 },
    animate: (i: number) => ({
      scale: [0, 1, 0],
      opacity: [0, 1, 0],
      x: Math.cos(i * Math.PI / 4) * 100,
      y: Math.sin(i * Math.PI / 4) * 100,
      transition: {
        duration: ANIMATION_TIMING.complex.fast / 1000,
        delay: i * 0.1,
        ease: "easeOut"
      }
    })
  }
} as const

// Reduced motion variants for accessibility
export const REDUCED_MOTION_VARIANTS = {
  character: {
    initial: { opacity: 0 },
    animate: { 
      opacity: 1,
      transition: { duration: 0.1 }
    },
    exit: { 
      opacity: 0,
      transition: { duration: 0.1 }
    }
  },

  toy: {
    initial: { opacity: 0 },
    animate: { 
      opacity: 1,
      transition: { duration: 0.1 }
    },
    exit: { 
      opacity: 0,
      transition: { duration: 0.1 }
    }
  },

  uiElement: {
    initial: { opacity: 0 },
    animate: { 
      opacity: 1,
      transition: { duration: 0.1 }
    },
    exit: { 
      opacity: 0,
      transition: { duration: 0.1 }
    }
  },

  feedback: {
    initial: { opacity: 0 },
    animate: { 
      opacity: 1,
      transition: { duration: 0.1 }
    },
    exit: { 
      opacity: 0,
      transition: { duration: 0.1 }
    }
  }
} as const

// Performance optimization settings
export const PERFORMANCE_THRESHOLDS = {
  excellent: { fps: 55, frameTime: 18 },    // 55+ FPS, <18ms frame time
  good: { fps: 45, frameTime: 22 },         // 45+ FPS, <22ms frame time
  fair: { fps: 30, frameTime: 33 },         // 30+ FPS, <33ms frame time
  poor: { fps: 0, frameTime: Infinity }   // Below 30 FPS
} as const

// Animation performance optimization
export const optimizeAnimationConfig = (config: Record<string, unknown>, reducedMotion: boolean = false, performanceGrade: string = 'excellent'): Record<string, unknown> => {
  if (reducedMotion) {
    return {
      ...config,
      transition: {
        duration: 0.1,
        ease: "linear"
      }
    }
  }

  const multiplier = performanceGrade === 'poor' ? 0.5 : 
                    performanceGrade === 'fair' ? 0.7 :
                    performanceGrade === 'good' ? 0.85 : 1

  return {
    ...config,
    transition: {
      duration: 0.3 * multiplier,
      ease: performanceGrade === 'poor' ? "linear" : "easeOut"
    }
  }
}

// Export for use in components
export default {
  ANIMATION_TIMING,
  ANIMATION_EASING,
  COMPONENT_VARIANTS,
  REDUCED_MOTION_VARIANTS,
  PERFORMANCE_THRESHOLDS,
  optimizeAnimationConfig
}