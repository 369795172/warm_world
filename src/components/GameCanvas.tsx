import React, { useEffect, useRef } from 'react'
import Phaser from 'phaser'
import FarmScene from '../game/FarmScene'

type Props = {
  width?: number
  height?: number
}

const GameCanvas: React.FC<Props> = ({ width, height }) => {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const gameRef = useRef<Phaser.Game | null>(null)

  useEffect(() => {
    if (!containerRef.current) return
    if (gameRef.current) return

    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      width: width || window.innerWidth,
      height: height || Math.max(window.innerHeight - 80, 400),
      parent: containerRef.current,
      backgroundColor: '#eefbf3',
      scene: [FarmScene],
      physics: { default: 'arcade' }
    }

    const game = new Phaser.Game(config)
    gameRef.current = game

    const handleResize = () => {
      const w = window.innerWidth
      const h = Math.max(window.innerHeight - 80, 400)
      game.scale.resize(w, h)
    }
    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      if (gameRef.current) {
        gameRef.current.destroy(true)
        gameRef.current = null
      }
    }
  }, [height, width])

  return (
    <div ref={containerRef} style={{ width: '100%', height: height ? `${height}px` : 'calc(100vh - 80px)' }} />
  )
}

export default GameCanvas
