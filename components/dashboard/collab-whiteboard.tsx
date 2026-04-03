'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Pen, Highlighter, Eraser, Trash2, RotateCcw, RotateCw, MessageSquare, Hand, Grid3x3 } from 'lucide-react'
import { useDashboardStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface CanvasDrawState {
  isDrawing: boolean
  lastX: number
  lastY: number
  tool: 'pen' | 'highlighter' | 'eraser' | 'text'
  color: string
  lineWidth: number
  opacity: number
}

export function CollabWhiteboard() {
  const {
    isWhiteboardOpen,
    toggleWhiteboard,
    currentSession,
    startSession,
    endSession,
    addDrawing,
    undoDrawing,
    redoDrawing,
    clearDrawings,
    addParticipant,
    addWhiteboardMessage,
    drawingUndoStack,
    drawingRedoStack,
    isCVModeActive,
    setCVModeActive,
  } = useDashboardStore()

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const contextRef = useRef<CanvasRenderingContext2D | null>(null)
  
  const [drawState, setDrawState] = useState<CanvasDrawState>({
    isDrawing: false,
    lastX: 0,
    lastY: 0,
    tool: 'pen',
    color: '#22c55e',
    lineWidth: 2,
    opacity: 1,
  })

  const [isChatOpen, setIsChatOpen] = useState(false)
  const [chatInput, setChatInput] = useState('')
  const [showGridBg, setShowGridBg] = useState(true)
  const [detectedHands, setDetectedHands] = useState<Array<{ x: number; y: number; isOpen: boolean; isPinched: boolean }>>([])
  const [showCVInstructions, setShowCVInstructions] = useState(false)

  // Initialize session on open
  useEffect(() => {
    if (isWhiteboardOpen && !currentSession) {
      startSession('DSA', 'Study Session')
    }
  }, [isWhiteboardOpen, currentSession, startSession])

  // Initialize canvas
  useEffect(() => {
    if (!canvasRef.current) return

    canvasRef.current.width = window.innerWidth - 320
    canvasRef.current.height = window.innerHeight - 120

    const context = canvasRef.current.getContext('2d', { willReadFrequently: true })
    if (!context) return

    contextRef.current = context
    drawGridBackground(context, canvasRef.current.width, canvasRef.current.height)
  }, [isWhiteboardOpen])

  const drawGridBackground = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    if (!showGridBg) return
    
    const gridSize = 20
    ctx.strokeStyle = 'rgba(100, 116, 139, 0.1)'
    ctx.lineWidth = 0.5

    for (let x = 0; x < width; x += gridSize) {
      ctx.beginPath()
      ctx.moveTo(x, 0)
      ctx.lineTo(x, height)
      ctx.stroke()
    }

    for (let y = 0; y < height; y += gridSize) {
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(width, y)
      ctx.stroke()
    }
  }

  // Simulate hand gesture detection
  useEffect(() => {
    if (!isCVModeActive) {
      if (!showCVInstructions) return
      return
    }

    if (!showCVInstructions) {
      setShowCVInstructions(true)
      const timer = setTimeout(() => setShowCVInstructions(false), 3000)
      return () => clearTimeout(timer)
    }

    const interval = setInterval(() => {
      if (canvasRef.current) {
        const hands: typeof detectedHands = []
        const numHands = Math.random() > 0.7 ? 1 : 0
        
        for (let i = 0; i < numHands; i++) {
          hands.push({
            x: Math.random() * (canvasRef.current.width - 100) + 50,
            y: Math.random() * (canvasRef.current.height - 100) + 50,
            isOpen: Math.random() > 0.4,
            isPinched: Math.random() > 0.8
          })
        }
        
        setDetectedHands(hands)
      }
    }, 300)

    return () => clearInterval(interval)
  }, [isCVModeActive, showCVInstructions])

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const { offsetX, offsetY } = e.nativeEvent
    setDrawState(prev => ({
      ...prev,
      isDrawing: true,
      lastX: offsetX,
      lastY: offsetY,
    }))
  }

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!drawState.isDrawing || !contextRef.current) return

    const { offsetX, offsetY } = e.nativeEvent
    const ctx = contextRef.current

    if (drawState.tool === 'pen') {
      ctx.strokeStyle = drawState.color
      ctx.lineWidth = drawState.lineWidth
      ctx.globalAlpha = drawState.opacity
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'
    } else if (drawState.tool === 'highlighter') {
      ctx.strokeStyle = drawState.color
      ctx.lineWidth = drawState.lineWidth * 3
      ctx.globalAlpha = 0.4
      ctx.lineCap = 'square'
    } else if (drawState.tool === 'eraser') {
      ctx.clearRect(offsetX - drawState.lineWidth, offsetY - drawState.lineWidth, drawState.lineWidth * 2, drawState.lineWidth * 2)
      ctx.globalAlpha = 1
      return
    }

    ctx.beginPath()
    ctx.moveTo(drawState.lastX, drawState.lastY)
    ctx.lineTo(offsetX, offsetY)
    ctx.stroke()
    ctx.globalAlpha = 1

    setDrawState(prev => ({
      ...prev,
      lastX: offsetX,
      lastY: offsetY,
    }))

    addDrawing({
      type: 'stroke',
      participantId: 'user-1',
      data: {
        tool: drawState.tool,
        fromX: drawState.lastX,
        fromY: drawState.lastY,
        toX: offsetX,
        toY: offsetY,
        color: drawState.color,
        lineWidth: drawState.lineWidth,
      }
    })
  }

  const endDrawing = () => {
    setDrawState(prev => ({
      ...prev,
      isDrawing: false,
    }))
  }

  const handleClear = useCallback(() => {
    if (!canvasRef.current || !contextRef.current) return
    
    contextRef.current.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height)
    drawGridBackground(contextRef.current, canvasRef.current.width, canvasRef.current.height)
    clearDrawings()
    
    addDrawing({
      type: 'clear',
      participantId: 'user-1',
      data: {}
    })
  }, [clearDrawings, addDrawing, showGridBg])

  const handleSendMessage = () => {
    if (!chatInput.trim()) return
    addWhiteboardMessage({
      participantId: 'user-1',
      participantName: 'You',
      content: chatInput,
    })
    setChatInput('')
  }

  const handleClose = () => {
    endSession()
    toggleWhiteboard()
  }

  if (!isWhiteboardOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-background flex"
      >
        {/* Main Canvas Area */}
        <div className="flex-1 flex flex-col bg-slate-950 relative overflow-hidden">
          {/* Header */}
          <motion.div
            initial={{ y: -60 }}
            animate={{ y: 0 }}
            className="h-14 border-b border-border bg-card/95 backdrop-blur px-6 py-3 flex items-center justify-between"
          >
            <div>
              <h2 className="text-lg font-bold text-card-foreground">
                {currentSession?.title || 'Whiteboard'}
              </h2>
              <p className="text-xs text-muted-foreground">
                {currentSession?.participants.length || 1} participant(s)
              </p>
            </div>
            <div className="flex items-center gap-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowGridBg(!showGridBg)}
                className={`p-2 rounded-lg transition-all ${
                  showGridBg
                    ? 'bg-primary/20 text-primary'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
                title="Toggle grid background"
              >
                <Grid3x3 className="w-4 h-4" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setCVModeActive(!isCVModeActive)}
                className={`p-2 rounded-lg transition-all ${
                  isCVModeActive
                    ? 'bg-accent/20 text-accent'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
                title="Toggle CV Mode (Hand Gestures)"
              >
                <Hand className="w-4 h-4" />
              </motion.button>
              <button
                onClick={handleClose}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </motion.div>

          {/* Canvas */}
          <div className="flex-1 relative overflow-hidden">
            <canvas
              ref={canvasRef}
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={endDrawing}
              onMouseLeave={endDrawing}
              className="absolute inset-0 w-full h-full cursor-crosshair"
            />

            {/* CV Mode Overlay */}
            <CVModeOverlay 
              isActive={isCVModeActive}
              hands={detectedHands}
              showInstructions={showCVInstructions}
            />
          </div>

          {/* Toolbar */}
          <WhiteboardToolbar
            drawState={drawState}
            setDrawState={setDrawState}
            onUndo={undoDrawing}
            onRedo={redoDrawing}
            onClear={handleClear}
            canUndo={drawingUndoStack.length > 0}
            canRedo={drawingRedoStack.length > 0}
            onToggleChat={() => setIsChatOpen(!isChatOpen)}
          />
        </div>

        {/* Chat Panel */}
        {isChatOpen && (
          <WhiteboardChatPanel
            messages={currentSession?.messages || []}
            participants={currentSession?.participants || []}
            onSendMessage={handleSendMessage}
            chatInput={chatInput}
            onChatInputChange={setChatInput}
          />
        )}

        {/* Participant Avatars */}
        <ParticipantAvatars participants={currentSession?.participants || []} />
      </motion.div>
    </AnimatePresence>
  )
}

function WhiteboardToolbar({
  drawState,
  setDrawState,
  onUndo,
  onRedo,
  onClear,
  canUndo,
  canRedo,
  onToggleChat,
}: {
  drawState: CanvasDrawState
  setDrawState: (state: CanvasDrawState) => void
  onUndo: () => void
  onRedo: () => void
  onClear: () => void
  canUndo: boolean
  canRedo: boolean
  onToggleChat: () => void
}) {
  return (
    <motion.div
      initial={{ y: 60 }}
      animate={{ y: 0 }}
      className="h-16 border-t border-border bg-card/95 backdrop-blur px-4 py-3 flex items-center gap-2 overflow-x-auto"
    >
      {/* Tool Selection */}
      <div className="flex items-center gap-1 border-r border-border pr-3">
        {[
          { id: 'pen', icon: Pen, label: 'Pen' },
          { id: 'highlighter', icon: Highlighter, label: 'Highlighter' },
          { id: 'eraser', icon: Eraser, label: 'Eraser' },
        ].map((tool) => (
          <motion.button
            key={tool.id}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setDrawState({ ...drawState, tool: tool.id as any })}
            className={`p-2 rounded-lg transition-all ${
              drawState.tool === tool.id
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
            title={tool.label}
          >
            <tool.icon className="w-4 h-4" />
          </motion.button>
        ))}
      </div>

      {/* Color Picker */}
      <div className="flex items-center gap-2 border-r border-border pr-3">
        <input
          type="color"
          value={drawState.color}
          onChange={(e) => setDrawState({ ...drawState, color: e.target.value })}
          className="w-8 h-8 rounded cursor-pointer border border-border"
        />
        <span className="text-xs text-muted-foreground">Color</span>
      </div>

      {/* Line Width */}
      <div className="flex items-center gap-2 border-r border-border pr-3">
        <input
          type="range"
          min="1"
          max="20"
          value={drawState.lineWidth}
          onChange={(e) => setDrawState({ ...drawState, lineWidth: parseInt(e.target.value) })}
          className="w-24 h-2 rounded-lg bg-muted cursor-pointer"
        />
        <span className="text-xs text-muted-foreground">{drawState.lineWidth}px</span>
      </div>

      {/* Opacity */}
      <div className="flex items-center gap-2 border-r border-border pr-3">
        <input
          type="range"
          min="0.1"
          max="1"
          step="0.1"
          value={drawState.opacity}
          onChange={(e) => setDrawState({ ...drawState, opacity: parseFloat(e.target.value) })}
          className="w-24 h-2 rounded-lg bg-muted cursor-pointer"
        />
        <span className="text-xs text-muted-foreground">{Math.round(drawState.opacity * 100)}%</span>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 border-r border-border pr-3 ml-auto">
        <Button
          size="sm"
          variant={canUndo ? 'default' : 'ghost'}
          onClick={onUndo}
          disabled={!canUndo}
          className="text-xs"
        >
          <RotateCcw className="w-4 h-4" />
        </Button>
        <Button
          size="sm"
          variant={canRedo ? 'default' : 'ghost'}
          onClick={onRedo}
          disabled={!canRedo}
          className="text-xs"
        >
          <RotateCw className="w-4 h-4" />
        </Button>
        <Button
          size="sm"
          variant="destructive"
          onClick={onClear}
          className="text-xs"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>

      {/* Chat Toggle */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onToggleChat}
        className="p-2 rounded-lg bg-primary/20 text-primary hover:bg-primary/30 transition-all ml-auto"
        title="Toggle chat panel"
      >
        <MessageSquare className="w-4 h-4" />
      </motion.button>
    </motion.div>
  )
}

function WhiteboardChatPanel({
  messages,
  participants,
  onSendMessage,
  chatInput,
  onChatInputChange,
}: {
  messages: any[]
  participants: any[]
  onSendMessage: () => void
  chatInput: string
  onChatInputChange: (input: string) => void
}) {
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  return (
    <motion.div
      initial={{ x: 320 }}
      animate={{ x: 0 }}
      exit={{ x: 320 }}
      className="w-80 border-l border-border bg-card/95 backdrop-blur flex flex-col"
    >
      <div className="p-4 border-b border-border">
        <h3 className="font-semibold text-card-foreground flex items-center gap-2">
          <MessageSquare className="w-4 h-4" />
          Whiteboard Chat
        </h3>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((msg) => (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-1"
          >
            <p className="text-xs font-semibold text-primary">{msg.participantName}</p>
            <p className="text-sm text-card-foreground bg-muted/50 p-2 rounded">
              {msg.content}
            </p>
          </motion.div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-3 border-t border-border flex gap-2">
        <Input
          value={chatInput}
          onChange={(e) => onChatInputChange(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && onSendMessage()}
          placeholder="Type message..."
          className="text-sm"
        />
        <Button
          size="sm"
          onClick={onSendMessage}
          disabled={!chatInput.trim()}
        >
          Send
        </Button>
      </div>
    </motion.div>
  )
}

function ParticipantAvatars({ participants }: { participants: any[] }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="absolute top-20 right-6 flex flex-col gap-2"
    >
      {participants.map((participant) => (
        <motion.div
          key={participant.id}
          whileHover={{ scale: 1.1 }}
          className="w-10 h-10 rounded-full bg-gradient-to-br flex items-center justify-center text-white text-xs font-bold border-2 border-border shadow-lg"
          style={{
            backgroundImage: `linear-gradient(135deg, ${participant.color}, ${participant.color}dd)`,
          }}
          title={participant.name}
        >
          {participant.avatar}
        </motion.div>
      ))}
    </motion.div>
  )
}

function CVModeOverlay({
  isActive,
  hands,
  showInstructions,
}: {
  isActive: boolean
  hands: Array<{ x: number; y: number; isOpen: boolean; isPinched: boolean }>
  showInstructions: boolean
}) {
  return (
    <AnimatePresence>
      {isActive && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 pointer-events-none"
        >
          {/* Camera indicator */}
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            className="absolute top-4 left-4 w-12 h-12 rounded-lg border-2 border-accent/50 bg-black/30 flex items-center justify-center backdrop-blur-sm"
          >
            <span className="text-accent text-lg">📹</span>
          </motion.div>

          {/* Hand detection visualization */}
          {hands.map((hand, i) => (
            <motion.div
              key={i}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              className="absolute pointer-events-none"
              style={{ left: hand.x - 20, top: hand.y - 20 }}
            >
              {/* Hand circle */}
              <motion.svg
                width="40"
                height="40"
                viewBox="0 0 40 40"
                className="absolute inset-0"
              >
                <circle
                  cx="20"
                  cy="20"
                  r="16"
                  fill="none"
                  stroke="var(--accent)"
                  strokeWidth="2"
                  opacity="0.6"
                />
                {hand.isOpen && (
                  <circle
                    cx="20"
                    cy="20"
                    r="12"
                    fill="var(--accent)"
                    opacity="0.2"
                  />
                )}
              </motion.svg>

              {/* Hand state indicator */}
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 0.6, repeat: Infinity }}
                className="absolute inset-0 flex items-center justify-center text-lg font-bold"
              >
                {hand.isPinched ? '🤏' : hand.isOpen ? '✋' : '✊'}
              </motion.div>

              {/* Action label */}
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute top-12 left-1/2 -translate-x-1/2 text-xs font-semibold text-accent whitespace-nowrap"
              >
                {hand.isPinched ? 'Clear' : hand.isOpen ? 'Draw' : 'Erase'}
              </motion.div>
            </motion.div>
          ))}

          {/* Instructions overlay */}
          <AnimatePresence>
            {showInstructions && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="absolute inset-x-0 bottom-8 flex justify-center"
              >
                <div className="bg-gradient-to-r from-accent/20 to-primary/20 border border-accent/40 backdrop-blur-md rounded-lg p-4 max-w-md text-center">
                  <p className="text-sm font-semibold text-accent mb-2">Hand Gesture Mode Active</p>
                  <div className="text-xs text-foreground/80 space-y-1">
                    <p>✋ Open Hand = Draw</p>
                    <p>✊ Closed Fist = Erase</p>
                    <p>🤏 Pinch = Clear Canvas</p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
