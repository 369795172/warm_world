import React, { useState, useRef } from 'react'
import { useAppStore } from '../store/appStore'
import { Heart, Smile, Star, Gift, Music } from 'lucide-react'
import NavigationBar from './NavigationBar'

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
    { id: 'parent', name: '爸爸妈妈', x: 100, y: 200, mood: 'happy', color: 'bg-blue-200' }
  ])

  const [toys, setToys] = useState<Toy[]>([
    { id: 'ball', name: '小球', x: 150, y: 400, icon: Star, color: 'bg-yellow-300', sound: 'bounce' },
    { id: 'music_box', name: '音乐盒', x: 300, y: 450, icon: Music, color: 'bg-purple-300', sound: 'music' },
    { id: 'gift', name: '礼物', x: 450, y: 380, icon: Gift, color: 'bg-red-300', sound: 'surprise' }
  ])

  const [draggedToy, setDraggedToy] = useState<Toy | null>(null)
  const [feedback, setFeedback] = useState<{type: string, message: string, x: number, y: number} | null>(null)
  const sceneRef = useRef<HTMLDivElement>(null)

  const handleToyMouseDown = (toy: Toy, e: React.MouseEvent) => {
    e.preventDefault()
    setDraggedToy(toy)
    setDraggedItem(toy.id)
    recordInteraction(`pickup_${toy.id}`)
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

      // Check if toy was dropped on a character
      const droppedOnCharacter = characters.find(char => {
        const distance = Math.sqrt(
          Math.pow(x - char.x, 2) + Math.pow(y - char.y, 2)
        )
        return distance < 60
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

    // Update character mood
    setCharacters(prev => prev.map(char => 
      char.id === character.id 
        ? { ...char, mood: 'excited' }
        : char
    ))

    // Show positive feedback
    showFeedback('shared', `${character.name} 很开心！`, x, y)

    // Reset character mood after a delay
    setTimeout(() => {
      setCharacters(prev => prev.map(char => 
        char.id === character.id 
          ? { ...char, mood: 'happy' }
          : char
      ))
    }, 2000)
  }

  const showFeedback = (type: string, message: string, x: number, y: number) => {
    setFeedback({ type, message, x, y })
    setTimeout(() => setFeedback(null), 2000)
  }

  const handleCharacterClick = (character: Character) => {
    recordInteraction(`click_${character.id}`)
    showFeedback('interaction', `${character.name} 说你好！`, character.x, character.y + 60)
  }

  const getMoodIcon = (mood: string) => {
    switch (mood) {
      case 'happy':
        return <Smile className="w-6 h-6 text-green-500" />
      case 'excited':
        return <Heart className="w-6 h-6 text-pink-500 animate-pulse" />
      default:
        return <div className="w-6 h-6 bg-gray-300 rounded-full" />
    }
  }

  const handleSettingsClick = () => {
    updateSettings({ parentMode: true })
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
      
      {/* Room background elements */}
      <div className="absolute inset-0">
        <div className="absolute top-10 left-10 w-32 h-48 bg-amber-100 rounded-lg shadow-sm border-2 border-amber-200"></div>
        <div className="absolute top-8 right-12 w-24 h-32 bg-blue-100 rounded-lg shadow-sm border-2 border-blue-200"></div>
        <div className="absolute bottom-20 left-1/2 -translate-x-1/2 w-64 h-4 bg-green-100 rounded-full shadow-sm border-2 border-green-200"></div>
      </div>

      {/* Characters */}
      {characters.map(character => (
        <div
          key={character.id}
          className={`absolute transition-all duration-300 cursor-pointer hover:scale-110`}
          style={{ left: character.x - 30, top: character.y - 30 }}
          onClick={() => handleCharacterClick(character)}
        >
          <div className={`w-16 h-16 ${character.color} rounded-full flex items-center justify-center shadow-lg border-2 border-white`}>
            <span className="text-2xl">
              {character.id === 'bunny' ? '🐰' : character.id === 'bear' ? '🐻' : '👨‍👩‍👧‍👦'}
            </span>
          </div>
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2">
            {getMoodIcon(character.mood)}
          </div>
          <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-xs font-medium text-gray-700 whitespace-nowrap">
            {character.name}
          </div>
        </div>
      ))}

      {/* Toys */}
      {toys.map(toy => {
        const IconComponent = toy.icon
        const isDragging = draggedToy?.id === toy.id
        
        return (
          <div
            key={toy.id}
            className={`absolute transition-all duration-200 cursor-grab ${
              isDragging ? 'cursor-grabbing scale-110 z-20' : 'hover:scale-105 z-10'
            }`}
            style={{ left: toy.x, top: toy.y }}
            onMouseDown={(e) => handleToyMouseDown(toy, e)}
          >
            <div className={`w-12 h-12 ${toy.color} rounded-lg flex items-center justify-center shadow-md border-2 border-white hover:shadow-lg`}>
              <IconComponent className="w-6 h-6 text-gray-700" />
            </div>
            <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs font-medium text-gray-600 whitespace-nowrap">
              {toy.name}
            </div>
          </div>
        )
      })}

      {/* Feedback messages */}
      {feedback && (
        <div
          className="absolute z-30 bg-white bg-opacity-95 rounded-full px-4 py-2 shadow-lg border-2 border-pink-200 animate-bounce"
          style={{ left: feedback.x - 50, top: feedback.y - 40 }}
        >
          <div className="flex items-center gap-2">
            <Heart className="w-4 h-4 text-pink-500" />
            <span className="text-sm font-medium text-gray-700">{feedback.message}</span>
            <Heart className="w-4 h-4 text-pink-500" />
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="fixed top-8 left-1/2 -translate-x-1/2 bg-white bg-opacity-90 rounded-full px-6 py-3 shadow-lg">
        <p className="text-sm font-medium text-gray-700 text-center">
          🎁 拖动玩具给小伙伴，看看会发生什么？
        </p>
      </div>

      {/* Gentle hint for sharing */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-pink-50 bg-opacity-90 rounded-full px-4 py-2 shadow-sm">
        <p className="text-xs text-gray-600">
          💝 分享会带来快乐哦！
        </p>
      </div>
    </div>
  )
}

export default HomeScene