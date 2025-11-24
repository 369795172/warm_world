import Phaser from 'phaser'

type PlantStage = 'empty' | 'seed' | 'sprout' | 'small' | 'flowering'

type PlantPlot = {
  id: string
  x: number
  y: number
  stage: PlantStage
  plantedTime: number
  lastWatered: number
  type: 'flower' | 'tree' | 'vegetable'
}

export default class FarmScene extends Phaser.Scene {
  private plots: PlantPlot[] = []
  private plotGraphics: Map<string, Phaser.GameObjects.Container> = new Map()
  private tool: 'seed' | 'water' | null = null

  constructor() {
    super('FarmScene')
  }

  create(): void {
    const w = this.scale.width
    const h = this.scale.height

    this.add.rectangle(w / 2, h / 2, w, h, 0xeefbf3).setDepth(-1)

    const toolbar = this.add.container(16, 16)
    const seedBtn = this.makeButton('种子', 0, 0, 0x93c5fd, () => {
      this.tool = 'seed'
      seedBtn.setAlpha(1)
      waterBtn.setAlpha(0.6)
    })
    const waterBtn = this.makeButton('浇水', 96, 0, 0x6ee7b7, () => {
      this.tool = 'water'
      waterBtn.setAlpha(1)
      seedBtn.setAlpha(0.6)
    })
    seedBtn.setAlpha(1)
    waterBtn.setAlpha(0.6)
    this.tool = 'seed'
    toolbar.add([seedBtn, waterBtn])

    const baseY = h - 140
    this.plots = [
      { id: 'plot1', x: w / 2 - 160, y: baseY, stage: 'empty', plantedTime: 0, lastWatered: 0, type: 'flower' },
      { id: 'plot2', x: w / 2, y: baseY, stage: 'empty', plantedTime: 0, lastWatered: 0, type: 'tree' },
      { id: 'plot3', x: w / 2 + 160, y: baseY, stage: 'empty', plantedTime: 0, lastWatered: 0, type: 'vegetable' }
    ]

    this.plots.forEach(plot => {
      const container = this.add.container(plot.x, plot.y)
      const soil = this.add.rectangle(0, 0, 80, 60, 0xfcd34d).setStrokeStyle(2, 0xf59e0b)
      soil.setInteractive({ useHandCursor: true })
      soil.on('pointerdown', (pointer: Phaser.Input.Pointer) => this.onPlotClick(plot, pointer))
      const plantIcon = this.add.text(0, -36, '', { fontFamily: 'system-ui, sans-serif', fontSize: '24px' }).setOrigin(0.5)
      const statusDot = this.add.circle(0, 40, 5, 0x9ca3af)
      const statusText = this.add.text(0, 56, '', { fontFamily: 'system-ui, sans-serif', fontSize: '12px', color: '#374151' }).setOrigin(0.5)
      container.add([soil, plantIcon, statusDot, statusText])
      this.plotGraphics.set(plot.id, container)
      this.renderPlot(plot)
    })

    this.time.addEvent({ delay: 1000, loop: true, callback: () => this.tickGrowth() })
  }

  private onPlotClick(plot: PlantPlot, pointer: Phaser.Input.Pointer): void {
    if (this.tool === 'seed' && plot.stage === 'empty') {
      plot.stage = 'seed'
      plot.plantedTime = this.time.now
      this.renderPlot(plot)
      this.showFeedback('种下了种子', pointer.worldX, pointer.worldY)
      return
    }
    if (this.tool === 'water' && plot.stage !== 'empty') {
      plot.lastWatered = this.time.now
      this.renderPlot(plot)
      this.showFeedback('给植物浇水了', pointer.worldX, pointer.worldY)
      return
    }
    if (plot.stage === 'empty') {
      this.showFeedback('这里需要种子', pointer.worldX, pointer.worldY)
    } else {
      this.showFeedback('植物看起来很开心', pointer.worldX, pointer.worldY)
    }
  }

  private tickGrowth(): void {
    this.plots = this.plots.map(p => {
      if (p.stage === 'empty') return p
      const elapsed = this.time.now - p.plantedTime
      if (p.stage === 'seed' && elapsed > 5000) return { ...p, stage: 'sprout' }
      if (p.stage === 'sprout' && elapsed > 15000) return { ...p, stage: 'small' }
      if (p.stage === 'small' && elapsed > 30000) return { ...p, stage: 'flowering' }
      return p
    })
    this.plots.forEach(plot => this.renderPlot(plot))
  }

  private renderPlot(plot: PlantPlot): void {
    const container = this.plotGraphics.get(plot.id)
    if (!container) return
    const plantIcon = container.getAt(1) as Phaser.GameObjects.Text
    const statusDot = container.getAt(2) as Phaser.GameObjects.Arc
    const statusText = container.getAt(3) as Phaser.GameObjects.Text

    let icon = ''
    if (plot.stage === 'seed') icon = '🌱'
    if (plot.stage === 'sprout') icon = '🌱'
    if (plot.stage === 'small') icon = plot.type === 'flower' ? '🌿' : plot.type === 'tree' ? '🌳' : '🥬'
    if (plot.stage === 'flowering') icon = plot.type === 'flower' ? '🌸' : plot.type === 'tree' ? '🌳' : '🥕'
    plantIcon.setText(icon)

    const wateredRecently = this.time.now - plot.lastWatered < 10000
    statusDot.setFillStyle(wateredRecently ? 0x60a5fa : 0x9ca3af)
    statusText.setText(wateredRecently ? '已浇水' : '需要水')
  }

  private makeButton(text: string, x: number, y: number, color: number, onClick: () => void): Phaser.GameObjects.Container {
    const c = this.add.container(x, y)
    const bg = this.add.rectangle(0, 0, 80, 32, color, 1).setStrokeStyle(2, 0x1f2937)
    bg.setInteractive({ useHandCursor: true })
    bg.on('pointerdown', onClick)
    const label = this.add.text(0, 0, text, { fontFamily: 'system-ui, sans-serif', fontSize: '14px', color: '#111827' }).setOrigin(0.5)
    c.add([bg, label])
    return c
  }

  private showFeedback(message: string, x: number, y: number): void {
    const b = this.add.container(x, y)
    const bg = this.add.rectangle(0, 0, message.length * 16 + 24, 32, 0xffffff, 0.95).setStrokeStyle(2, 0x86efac)
    const label = this.add.text(0, 0, message, { fontFamily: 'system-ui, sans-serif', fontSize: '14px', color: '#374151' }).setOrigin(0.5)
    b.add([bg, label])
    this.tweens.add({ targets: b, y: y - 40, duration: 1000, ease: 'Sine.easeOut' })
    this.time.delayedCall(1500, () => b.destroy())
  }
}

