import React, { useState, useRef, useEffect } from 'react'
import { useAppStore } from '../store/appStore'
import { Heart, Star, Gift, Music } from 'lucide-react'
import NavigationBar from './NavigationBar'
import { motion, AnimatePresence } from 'framer-motion'
import CharacterRenderer, { useCharacterState } from './CharacterRenderer'
import ToyRenderer, { useToyInteraction, type ToyInteraction } from './ToyRenderer'
import '../styles/design-system.css'

interface Character {
  id: string
  name: string
  x: number
  y: number
  mood: 'happy' | 'neutral' | 'excited'
  color: string
}

interface Toy {
  id: string
  name: string
  x: number
  y: number
  icon: React.ElementType
  color: string
  sound?: string
}

const HomeScene: React.FC = () => {
  const { 
    recordBehavior, 
    setDraggedItem, 
    recordInteraction,
    updateSettings 
  } = useAppStore()
  
  const [characters, setCharacters] = useState<Character[]>([
    { id: 'bunny', name: '小兔兔', x: 200, y: 300, mood: 'neutral', color: 'bg-pink-200' },
    { id: 'bear', name: '小熊熊', x: 400, y: 250, mood: 'neutral', color: 'bg-amber-200' },
    { id: 'parent_mom', name: '妈妈', x: 100, y: 200, mood: 'happy', color: 'bg-blue-200' }
  ])

  const [toys, setToys] = useState<Toy[]>([
    { id: 'ball', name: '小球', x: 150, y: 400, icon: Star, color: 'bg-yellow-300', sound: 'bounce' },
    { id: 'music_box', name: '音乐盒', x: 300, y: 450, icon: Music, color: 'bg-purple-300', sound: 'music' },
    { id: 'gift', name: '礼物', x: 450, y: 380, icon: Gift, color: 'bg-red-300', sound: 'surprise' }
  ])

  const [draggedToy, setDraggedToy] = useState<Toy | null>(null)
  const [feedback, setFeedback] = useState<{type: string, message: string, x: number, y: number} | null>(null)
  const [sharingAnimation, setSharingAnimation] = useState<{toyId: string, characterId: string} | null>(null)
  const [reducedMotion, setReducedMotion] = useState(false)
  const sceneRef = useRef<HTMLDivElement>(null)

  // Character state management
  const bunnyState = useCharacterState('neutral')
  const bearState = useCharacterState('neutral')
  const parentMomState = useCharacterState('happy')

  // Toy interaction management
  const ballInteraction = useToyInteraction()
  const musicBoxInteraction = useToyInteraction()
  const giftInteraction = useToyInteraction()

  // Check for reduced motion preference
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReducedMotion(mediaQuery.matches)
    
    const handleChange = (e: MediaQueryListEvent) => {
      setReducedMotion(e.matches)
    }
    
    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  const handleToyMouseDown = (toy: Toy, e: React.MouseEvent) => {
    e.preventDefault()
    setDraggedToy(toy)
    setDraggedItem(toy.id)
    recordInteraction(`pickup_${toy.id}`)
    
    // Trigger toy interaction
    if (toy.id === 'ball') ballInteraction.startDrag()
    else if (toy.id === 'music_box') musicBoxInteraction.startDrag()
    else if (toy.id === 'gift') giftInteraction.startDrag()
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (draggedToy && sceneRef.current) {
      const rect = sceneRef.current.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top
      
      setToys(prev => prev.map(toy => 
        toy.id === draggedToy.id 
          ? { ...toy, x: x - 25, y: y - 25 }
          : toy
      ))
    }
  }

  const handleMouseUp = (e: React.MouseEvent) => {
    if (draggedToy && sceneRef.current) {
      const rect = sceneRef.current.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top

      // Reset toy interactions
      ballInteraction.endDrag()
      musicBoxInteraction.endDrag()
      giftInteraction.endDrag()

      // Check if toy was dropped on a character
      const droppedOnCharacter = characters.find(char => {
        const distance = Math.sqrt(
          Math.pow(x - char.x, 2) + Math.pow(y - char.y, 2)
        )
        return distance < 80
      })

      if (droppedOnCharacter) {
        // Sharing behavior detected!
        handleSharing(draggedToy, droppedOnCharacter, x, y)
      } else {
        // Toy was just moved, not shared
        showFeedback('moved', '玩具移动了！', x, y)
      }
    }

    setDraggedToy(null)
    setDraggedItem(null)
  }

  const handleSharing = (toy: Toy, character: Character, x: number, y: number) => {
    // Record the sharing behavior
    recordBehavior({
      action: 'share',
      scene: 'home',
      object: `${toy.id}_to_${character.id}`
    })

    // Trigger sharing animation
    setSharingAnimation({ toyId: toy.id, characterId: character.id })

    // Update character mood with expressions
    setCharacters(prev => prev.map(char => 
      char.id === character.id 
        ? { ...char, mood: 'excited' }
        : char
    ))

    // Trigger character expressions
    if (character.id === 'bunny') bunnyState.changeExpression('excited')
    else if (character.id === 'bear') bearState.changeExpression('excited')
    else if (character.id === 'parent_mom') parentMomState.changeExpression('excited')

    // Trigger toy sharing animation
    if (toy.id === 'ball') ballInteraction.shareToy()
    else if (toy.id === 'music_box') musicBoxInteraction.shareToy()
    else if (toy.id === 'gift') giftInteraction.shareToy()

    // Show positive feedback with animation
    showFeedback('shared', `${character.name} 很开心！`, x, y)

    // Reset character mood and expressions after a delay
    setTimeout(() => {
      setCharacters(prev => prev.map(char => 
        char.id === character.id 
          ? { ...char, mood: 'happy' }
          : char
      ))
      
      // Reset expressions
      if (character.id === 'bunny') bunnyState.changeExpression('happy')
      else if (character.id === 'bear') bearState.changeExpression('happy')
      else if (character.id === 'parent_mom') parentMomState.changeExpression('happy')
      
      setSharingAnimation(null)
    }, 3000)
  }

  const showFeedback = (type: string, message: string, x: number, y: number) => {
    setFeedback({ type, message, x, y })
    setTimeout(() => setFeedback(null), 2000)
  }

  const handleCharacterClick = (character: Character) => {
    recordInteraction(`click_${character.id}`)
    
    // Trigger character wave animation
    if (character.id === 'bunny') bunnyState.triggerAnimation('wave', 1000)
    else if (character.id === 'bear') bearState.triggerAnimation('wave', 1000)
    else if (character.id === 'parent_mom') parentMomState.triggerAnimation('wave', 1000)
    
    showFeedback('interaction', `${character.name} 说你好！`, character.x, character.y + 60)
  }

  const handleSettingsClick = () => {
    updateSettings({ parentMode: true })
  }

  // Get toy interaction state
  const getToyInteraction = (toyId: string): ToyInteraction => {
    if (toyId === 'ball') return ballInteraction.interaction
    if (toyId === 'music_box') return musicBoxInteraction.interaction
    if (toyId === 'gift') return giftInteraction.interaction
    return 'idle'
  }

  return (
    <div 
      ref={sceneRef}
      className="min-h-screen bg-gradient-to-br from-pink-50 to-orange-50 relative overflow-hidden cursor-pointer"
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >
      {/* Navigation Bar */}
      <NavigationBar 
        title="温馨小家"
        showHomeButton={true}
        showSettingsButton={true}
      />
      
      {/* Enhanced Room background elements with animations */}
      <motion.div 
        className="absolute inset-0"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: reducedMotion ? 0 : 1 }}
      >
        <motion.div 
          className="absolute top-10 left-10 w-32 h-48 bg-amber-100 rounded-lg shadow-sm border-2 border-amber-200"
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: reducedMotion ? 0 : 0.8, delay: 0.2 }}
          whileHover={{ scale: 1.02 }}
        />
        <motion.div 
          className="absolute top-8 right-12 w-24 h-32 bg-blue-100 rounded-lg shadow-sm border-2 border-blue-200"
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: reducedMotion ? 0 : 0.8, delay: 0.4 }}
          whileHover={{ scale: 1.02 }}
        />
        <motion.div 
          className="absolute bottom-20 left-1/2 -translate-x-1/2 w-64 h-4 bg-green-100 rounded-full shadow-sm border-2 border-green-200"
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: reducedMotion ? 0 : 0.8, delay: 0.6 }}
        />
      </motion.div>

      {/* Enhanced Characters with 2D assets and expressions */}
      <AnimatePresence>
        {characters.map((character, index) => (
          <motion.div
            key={character.id}
            className="absolute"
            style={{ left: character.x - 30, top: character.y - 30 }}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ 
              duration: reducedMotion ? 0 : 0.5, 
              delay: index * 0.2,
              type: "spring",
              stiffness: 200
            }}
          >
            <motion.div
              onClick={() => handleCharacterClick(character)}
              className="cursor-pointer"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <CharacterRenderer
                characterId={character.id}
                expression={
                  character.id === 'bunny' ? bunnyState.expression :
                  character.id === 'bear' ? bearState.expression :
                  parentMomState.expression
                }
                animation={
                  character.id === 'bunny' && bunnyState.isAnimating ? 'wave' :
                  character.id === 'bear' && bearState.isAnimating ? 'wave' :
                  character.id === 'parent_mom' && parentMomState.isAnimating ? 'wave' :
                  'idle'
                }
                size="medium"
                reducedMotion={reducedMotion}
                enableAccessibility={true}
              />
            </motion.div>
            
            {/* Character name with enhanced styling */}
            <motion.div 
              className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-xs font-medium text-gray-700 whitespace-nowrap bg-white bg-opacity-80 px-2 py-1 rounded-full shadow-sm"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.2 + 0.5 }}
            >
              {character.name}
            </motion.div>
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Enhanced Toys with 2D assets and interactions */}
      <AnimatePresence>
        {toys.map((toy, index) => {
          const isDraggingCurrent = draggedToy?.id === toy.id
          const interaction = getToyInteraction(toy.id)
          
          return (
            <motion.div
              key={toy.id}
              className="absolute"
              style={{ left: toy.x, top: toy.y }}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ 
                duration: reducedMotion ? 0 : 0.5, 
                delay: index * 0.1 + 0.8,
                type: "spring",
                stiffness: 200
              }}
            >
              <motion.div
                onMouseDown={(e) => handleToyMouseDown(toy, e)}
                className="cursor-grab"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                animate={isDraggingCurrent ? { scale: 1.1, z: 20 } : {}}
              >
                <ToyRenderer
                  toyId={toy.id}
                  interaction={interaction}
                  size="medium"
                  isDragging={isDraggingCurrent}
                  reducedMotion={reducedMotion}
                  showEffects={true}
                  enableAccessibility={true}
                />
              </motion.div>
              
              {/* Toy name with enhanced styling */}
              <motion.div 
                className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs font-medium text-gray-600 whitespace-nowrap bg-white bg-opacity-80 px-2 py-1 rounded-full shadow-sm"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 + 1 }}
              >
                {toy.name}
              </motion.div>
            </motion.div>
          )
        })}
      </AnimatePresence>

      {/* Enhanced Feedback messages with animations */}
      <AnimatePresence>
        {feedback && (
          <motion.div
            key={feedback.type}
            className="absolute z-30 bg-white bg-opacity-95 rounded-full px-4 py-2 shadow-xl border-2 border-pink-200"
            style={{ left: feedback.x - 50, top: feedback.y - 40 }}
            initial={{ scale: 0, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0, opacity: 0, y: -20 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <div className="flex items-center gap-2">
              <Heart className="w-4 h-4 text-pink-500 animate-pulse" />
              <span className="text-sm font-medium text-gray-700">{feedback.message}</span>
              <Heart className="w-4 h-4 text-pink-500 animate-pulse" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Enhanced Instructions with animation */}
      <motion.div 
        className="fixed top-8 left-1/2 -translate-x-1/2 bg-white bg-opacity-90 rounded-full px-6 py-3 shadow-lg"
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: reducedMotion ? 0 : 0.8, delay: 1.2 }}
      >
        <motion.p 
          className="text-sm font-medium text-gray-700 text-center flex items-center gap-2"
          animate={{ opacity: [0.8, 1, 0.8] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <motion.span
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            🎁
          </motion.span>
          拖动玩具给小伙伴，看看会发生什么？
          <motion.span
            animate={{ rotate: [0, -10, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            🎁
          </motion.span>
        </motion.p>
      </motion.div>

      {/* Enhanced Gentle hint for sharing with animation */}
      <motion.div 
        className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-pink-50 bg-opacity-90 rounded-full px-4 py-2 shadow-sm"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: reducedMotion ? 0 : 0.8, delay: 1.5 }}
      >
        <motion.p 
          className="text-xs text-gray-600 flex items-center gap-1"
          animate={{ opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 3, repeat: Infinity }}
        >
          <motion.span
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            💝
          </motion.span>
          分享会带来快乐哦！
          <motion.span
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            💝
          </motion.span>
        </motion.p>
      </motion.div>

      {/* Sharing animation overlay */}
      <AnimatePresence>
        {sharingAnimation && (
          <motion.div
            className="fixed inset-0 z-40 pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
              initial={{ scale: 0, rotate: 0 }}
              animate={{ 
                scale: [0, 1.5, 0],
                rotate: [0, 360]
              }}
              transition={{ duration: reducedMotion ? 0 : 1.5 }}
            >
              <div className="w-32 h-32 bg-gradient-to-r from-pink-300 to-purple-300 rounded-full opacity-60" />
            </motion.div>
            
            {/* Sparkle effects */}
            {[...Array(8)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute top-1/2 left-1/2 w-2 h-2 bg-yellow-300 rounded-full"
                initial={{ 
                  x: 0,
                  y: 0,
                  scale: 0
                }}
                animate={{ 
                  x: Math.cos(i * Math.PI / 4) * 100,
                  y: Math.sin(i * Math.PI / 4) * 100,
                  scale: [0, 1, 0]
                }}
                transition={{ 
                  duration: reducedMotion ? 0 : 1,
                  delay: i * 0.1,
                  ease: "easeOut"
                }}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default HomeScene