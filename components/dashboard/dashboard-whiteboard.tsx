'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Pen, Highlighter, Eraser, Trash2, RotateCcw, RotateCw, Hand, Grid3x3, Palette, Camera, CameraOff, AlertCircle, Video } from 'lucide-react'
import { useDashboardStore } from '@/lib/store'
import { cn } from '@/lib/utils'

interface CanvasDrawState {
  isDrawing: boolean
  lastX: number
  lastY: number
  tool: 'pen' | 'highlighter' | 'eraser'
  color: string
  lineWidth: number
}

const NEON_COLORS = [
  '#22c55e', // primary green
  '#a855f7', // accent purple
  '#f97316', // orange
  '#ef4444', // red
  '#3b82f6', // blue
  '#eab308', // yellow
  '#ec4899', // pink
  '#06b6d4', // cyan
]

// Singleton for MediaPipe to prevent multiple instances
let handsInstance: any = null
let isMediaPipeInitializing = false

export function DashboardWhiteboard() {
  const { isCVModeActive, setCVModeActive } = useDashboardStore()

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const contextRef = useRef<CanvasRenderingContext2D | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const animationFrameRef = useRef<number | null>(null)
  const isActiveRef = useRef(false)
  
  const [drawState, setDrawState] = useState<CanvasDrawState>({
    isDrawing: false,
    lastX: 0,
    lastY: 0,
    tool: 'pen',
    color: '#22c55e',
    lineWidth: 3,
  })

  const [showGrid, setShowGrid] = useState(true)
  const [history, setHistory] = useState<ImageData[]>([])
  const [historyIndex, setHistoryIndex] = useState(-1)
  const [showColorPicker, setShowColorPicker] = useState(false)
  const [cvStatus, setCVStatus] = useState<'idle' | 'loading' | 'active' | 'error'>('idle')
  const [cvError, setCVError] = useState<string>('')
  const [fingerPosition, setFingerPosition] = useState<{ x: number; y: number } | null>(null)
  const [isFingerDown, setIsFingerDown] = useState(false)
  const lastFingerPos = useRef<{ x: number; y: number } | null>(null)
  const drawStateRef = useRef(drawState)

  // Keep drawState ref in sync
  useEffect(() => {
    drawStateRef.current = drawState
  }, [drawState])

  // Initialize canvas
  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return

    const container = containerRef.current
    const canvas = canvasRef.current
    
    const resizeCanvas = () => {
      const rect = container.getBoundingClientRect()
      canvas.width = rect.width
      canvas.height = rect.height

      const context = canvas.getContext('2d', { willReadFrequently: true })
      if (!context) return

      contextRef.current = context
      
      // Restore drawing after resize
      if (history.length > 0 && historyIndex >= 0) {
        context.putImageData(history[historyIndex], 0, 0)
      }
      
      if (showGrid) {
        drawGridBackground(context, canvas.width, canvas.height)
      }
    }

    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)
    return () => window.removeEventListener('resize', resizeCanvas)
  }, [showGrid])

  const drawGridBackground = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    const gridSize = 25
    ctx.strokeStyle = 'rgba(100, 116, 139, 0.08)'
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

  const saveToHistory = useCallback(() => {
    if (!canvasRef.current || !contextRef.current) return
    
    const imageData = contextRef.current.getImageData(
      0, 0, 
      canvasRef.current.width, 
      canvasRef.current.height
    )
    
    const newHistory = history.slice(0, historyIndex + 1)
    newHistory.push(imageData)
    
    // Keep only last 20 states
    if (newHistory.length > 20) newHistory.shift()
    
    setHistory(newHistory)
    setHistoryIndex(newHistory.length - 1)
  }, [history, historyIndex])

  const undo = useCallback(() => {
    if (historyIndex <= 0 || !contextRef.current || !canvasRef.current) return
    
    const newIndex = historyIndex - 1
    contextRef.current.putImageData(history[newIndex], 0, 0)
    setHistoryIndex(newIndex)
  }, [history, historyIndex])

  const redo = useCallback(() => {
    if (historyIndex >= history.length - 1 || !contextRef.current) return
    
    const newIndex = historyIndex + 1
    contextRef.current.putImageData(history[newIndex], 0, 0)
    setHistoryIndex(newIndex)
  }, [history, historyIndex])

  const clearCanvas = useCallback(() => {
    if (!canvasRef.current || !contextRef.current) return
    
    contextRef.current.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height)
    if (showGrid) {
      drawGridBackground(contextRef.current, canvasRef.current.width, canvasRef.current.height)
    }
    saveToHistory()
  }, [showGrid, saveToHistory])

  // Draw function used by both mouse and CV
  const drawLine = useCallback((fromX: number, fromY: number, toX: number, toY: number) => {
    if (!contextRef.current) return
    const ctx = contextRef.current
    const currentDrawState = drawStateRef.current

    if (currentDrawState.tool === 'pen') {
      ctx.strokeStyle = currentDrawState.color
      ctx.lineWidth = currentDrawState.lineWidth
      ctx.globalAlpha = 1
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'
      ctx.shadowBlur = 8
      ctx.shadowColor = currentDrawState.color
    } else if (currentDrawState.tool === 'highlighter') {
      ctx.strokeStyle = currentDrawState.color
      ctx.lineWidth = currentDrawState.lineWidth * 4
      ctx.globalAlpha = 0.3
      ctx.lineCap = 'square'
      ctx.shadowBlur = 0
    } else if (currentDrawState.tool === 'eraser') {
      ctx.clearRect(toX - currentDrawState.lineWidth * 2, toY - currentDrawState.lineWidth * 2, currentDrawState.lineWidth * 4, currentDrawState.lineWidth * 4)
      ctx.globalAlpha = 1
      return
    }

    ctx.beginPath()
    ctx.moveTo(fromX, fromY)
    ctx.lineTo(toX, toY)
    ctx.stroke()
    ctx.globalAlpha = 1
    ctx.shadowBlur = 0
  }, [])

  // Cleanup function
  const cleanupCV = useCallback(() => {
    isActiveRef.current = false
    
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current)
      animationFrameRef.current = null
    }
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
    
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
    
    setFingerPosition(null)
    setIsFingerDown(false)
    lastFingerPos.current = null
  }, [])

  // Initialize CV Mode with proper hand tracking
  useEffect(() => {
    if (!isCVModeActive) {
      cleanupCV()
      setCVStatus('idle')
      return
    }

    // Prevent multiple initialization
    if (isMediaPipeInitializing) {
      return
    }

    const initCV = async () => {
      isMediaPipeInitializing = true
      isActiveRef.current = true
      setCVStatus('loading')
      setCVError('')

      try {
        // Request camera access
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { 
            width: { ideal: 640 },
            height: { ideal: 480 },
            facingMode: 'user'
          }
        })
        
        if (!isActiveRef.current) {
          stream.getTracks().forEach(track => track.stop())
          isMediaPipeInitializing = false
          return
        }

        streamRef.current = stream
        
        const video = videoRef.current
        if (!video) {
          throw new Error('Video element not found')
        }

        video.srcObject = stream
        await video.play()

        // Initialize MediaPipe Hands only once (singleton)
        if (!handsInstance) {
          const { Hands } = await import('@mediapipe/hands')
          
          handsInstance = new Hands({
            locateFile: (file: string) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands@0.4.1675469240/${file}`
          })

          handsInstance.setOptions({
            maxNumHands: 1,
            modelComplexity: 0, // Use lighter model for better performance
            minDetectionConfidence: 0.6,
            minTrackingConfidence: 0.5
          })
        }

        // Set up results handler
        handsInstance.onResults((results: any) => {
          if (!isActiveRef.current) return
          
          if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
            const landmarks = results.multiHandLandmarks[0]
            
            // Get index finger tip (landmark 8)
            const indexTip = landmarks[8]
            // Get thumb tip (landmark 4) for pinch detection
            const thumbTip = landmarks[4]
            
            const canvas = canvasRef.current
            if (!canvas) return
            
            // Convert normalized coords to canvas coords (mirror for natural feel)
            const x = (1 - indexTip.x) * canvas.width
            const y = indexTip.y * canvas.height
            
            setFingerPosition({ x, y })
            
            // Calculate distance between thumb and index finger for pinch gesture
            const distance = Math.sqrt(
              Math.pow(indexTip.x - thumbTip.x, 2) + 
              Math.pow(indexTip.y - thumbTip.y, 2)
            )
            
            // Pinch threshold - when fingers are close, we're "drawing"
            const isPinching = distance < 0.06
            
            if (isPinching && lastFingerPos.current) {
              drawLine(lastFingerPos.current.x, lastFingerPos.current.y, x, y)
            }
            
            setIsFingerDown(isPinching)
            lastFingerPos.current = { x, y }
          } else {
            setFingerPosition(null)
            setIsFingerDown(false)
            lastFingerPos.current = null
          }
        })

        // Start processing frames
        const processFrame = async () => {
          if (!isActiveRef.current || !video || video.readyState !== 4) {
            if (isActiveRef.current) {
              animationFrameRef.current = requestAnimationFrame(processFrame)
            }
            return
          }

          try {
            await handsInstance.send({ image: video })
          } catch (e) {
            // Ignore send errors during cleanup
          }

          if (isActiveRef.current) {
            animationFrameRef.current = requestAnimationFrame(processFrame)
          }
        }

        animationFrameRef.current = requestAnimationFrame(processFrame)
        setCVStatus('active')
        isMediaPipeInitializing = false

      } catch (err: any) {
        console.error('CV Mode error:', err)
        setCVError(err.message || 'Failed to initialize hand tracking')
        setCVStatus('error')
        cleanupCV()
        isMediaPipeInitializing = false
      }
    }

    initCV()

    return () => {
      cleanupCV()
      isMediaPipeInitializing = false
    }
  }, [isCVModeActive, cleanupCV, drawLine])

  // Mouse drawing handlers
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isCVModeActive) return
    const rect = canvasRef.current?.getBoundingClientRect()
    if (!rect) return
    
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    
    setDrawState(prev => ({
      ...prev,
      isDrawing: true,
      lastX: x,
      lastY: y,
    }))
  }

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isCVModeActive) return
    if (!drawState.isDrawing || !canvasRef.current) return

    const rect = canvasRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    drawLine(drawState.lastX, drawState.lastY, x, y)

    setDrawState(prev => ({
      ...prev,
      lastX: x,
      lastY: y,
    }))
  }

  const endDrawing = () => {
    if (drawState.isDrawing) {
      saveToHistory()
    }
    setDrawState(prev => ({
      ...prev,
      isDrawing: false,
    }))
  }

  return (
    <div className="h-full flex flex-col bg-slate-950/50 rounded-2xl border border-border overflow-hidden">
      {/* Header */}
      <div className="h-12 border-b border-border/50 bg-card/50 backdrop-blur px-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          <span className="text-sm font-medium text-foreground">Live Whiteboard</span>
          {isCVModeActive && cvStatus === 'active' && (
            <span className="text-xs text-accent ml-2 px-2 py-0.5 bg-accent/10 rounded-full border border-accent/20">
              Hand Tracking Active
            </span>
          )}
        </div>
        
        <div className="flex items-center gap-1">
          {/* CV Mode Toggle */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setCVModeActive(!isCVModeActive)}
            className={cn(
              "p-1.5 rounded-lg transition-all flex items-center gap-1.5",
              isCVModeActive
                ? "bg-accent/20 text-accent"
                : "bg-muted/50 text-muted-foreground hover:bg-muted"
            )}
            title="Toggle CV Mode (Hand Tracking)"
          >
            {cvStatus === 'loading' ? (
              <div className="w-4 h-4 border-2 border-accent border-t-transparent rounded-full animate-spin" />
            ) : isCVModeActive ? (
              <Camera className="w-4 h-4" />
            ) : (
              <CameraOff className="w-4 h-4" />
            )}
            <span className="text-xs hidden sm:inline">CV Mode</span>
          </motion.button>

          {/* Grid Toggle */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowGrid(!showGrid)}
            className={cn(
              "p-1.5 rounded-lg transition-all",
              showGrid
                ? "bg-primary/20 text-primary"
                : "bg-muted/50 text-muted-foreground hover:bg-muted"
            )}
            title="Toggle grid"
          >
            <Grid3x3 className="w-4 h-4" />
          </motion.button>
        </div>
      </div>

      {/* Canvas */}
      <div ref={containerRef} className="flex-1 relative overflow-hidden">
        {/* Video element for CV - show small preview when active */}
        <video
          ref={videoRef}
          playsInline
          muted
          className={cn(
            "absolute z-20 rounded-lg border-2 border-accent/50 shadow-lg transition-all",
            isCVModeActive && cvStatus === 'active'
              ? "bottom-4 right-4 w-32 h-24 opacity-80"
              : "hidden"
          )}
          style={{ transform: 'scaleX(-1)' }}
        />

        <canvas
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={endDrawing}
          onMouseLeave={endDrawing}
          className={cn(
            "absolute inset-0 w-full h-full",
            isCVModeActive ? "cursor-none" : "cursor-crosshair"
          )}
        />

        {/* CV Mode Finger Cursor */}
        <AnimatePresence>
          {isCVModeActive && fingerPosition && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              className="absolute pointer-events-none z-10"
              style={{
                left: fingerPosition.x - 12,
                top: fingerPosition.y - 12,
              }}
            >
              <div 
                className={cn(
                  "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all",
                  isFingerDown 
                    ? "bg-accent/50 border-accent scale-125" 
                    : "bg-primary/30 border-primary"
                )}
                style={{
                  boxShadow: isFingerDown 
                    ? `0 0 20px ${drawState.color}, 0 0 40px ${drawState.color}40` 
                    : `0 0 10px ${drawState.color}40`
                }}
              >
                <div 
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: drawState.color }}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* CV Mode Instructions Overlay */}
        <AnimatePresence>
          {isCVModeActive && cvStatus === 'active' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-2 px-4 py-2 rounded-full bg-card/90 border border-border/50 backdrop-blur shadow-lg z-10"
            >
              <Hand className="w-4 h-4 text-accent" />
              <span className="text-xs text-muted-foreground">
                Pinch thumb + index finger to draw
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* CV Error Display */}
        <AnimatePresence>
          {cvStatus === 'error' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur z-30"
            >
              <div className="text-center p-6 bg-card rounded-xl border border-destructive/30 max-w-sm">
                <AlertCircle className="w-10 h-10 text-destructive mx-auto mb-3" />
                <h3 className="text-sm font-medium text-foreground mb-2">Hand Tracking Error</h3>
                <p className="text-xs text-muted-foreground mb-4">{cvError}</p>
                <p className="text-xs text-muted-foreground">
                  Make sure your camera is connected and you have granted permission.
                </p>
                <button
                  onClick={() => {
                    setCVStatus('idle')
                    setCVModeActive(false)
                  }}
                  className="mt-4 px-4 py-2 text-xs bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
                >
                  Dismiss
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* CV Loading Overlay */}
        <AnimatePresence>
          {cvStatus === 'loading' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur z-30"
            >
              <div className="text-center">
                <div className="w-12 h-12 border-3 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-sm text-muted-foreground">Initializing hand tracking...</p>
                <p className="text-xs text-muted-foreground mt-2">Please allow camera access</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Toolbar */}
      <div className="h-14 border-t border-border/50 bg-card/50 backdrop-blur px-3 flex items-center gap-2">
        {/* Tools */}
        <div className="flex items-center gap-1 border-r border-border/50 pr-2">
          {[
            { id: 'pen' as const, icon: Pen, label: 'Pen' },
            { id: 'highlighter' as const, icon: Highlighter, label: 'Highlighter' },
            { id: 'eraser' as const, icon: Eraser, label: 'Eraser' },
          ].map((tool) => (
            <motion.button
              key={tool.id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setDrawState(prev => ({ ...prev, tool: tool.id }))}
              className={cn(
                "p-2 rounded-lg transition-all",
                drawState.tool === tool.id
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted/50 text-muted-foreground hover:bg-muted"
              )}
              title={tool.label}
            >
              <tool.icon className="w-4 h-4" />
            </motion.button>
          ))}
        </div>

        {/* Color Picker */}
        <div className="relative border-r border-border/50 pr-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowColorPicker(!showColorPicker)}
            className="p-2 rounded-lg bg-muted/50 hover:bg-muted transition-all flex items-center gap-1.5"
          >
            <div 
              className="w-4 h-4 rounded-full border border-white/20"
              style={{ backgroundColor: drawState.color, boxShadow: `0 0 8px ${drawState.color}` }}
            />
            <Palette className="w-3 h-3 text-muted-foreground" />
          </motion.button>

          {/* Color Popup */}
          <AnimatePresence>
            {showColorPicker && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute bottom-full left-0 mb-2 p-2 rounded-lg bg-card border border-border shadow-lg"
              >
                <div className="grid grid-cols-4 gap-1.5">
                  {NEON_COLORS.map((color) => (
                    <motion.button
                      key={color}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => {
                        setDrawState(prev => ({ ...prev, color }))
                        setShowColorPicker(false)
                      }}
                      className={cn(
                        "w-6 h-6 rounded-full border-2 transition-all",
                        drawState.color === color
                          ? "border-white scale-110"
                          : "border-transparent hover:border-white/50"
                      )}
                      style={{ backgroundColor: color, boxShadow: `0 0 8px ${color}50` }}
                    />
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Line Width */}
        <div className="flex items-center gap-1 border-r border-border/50 pr-2">
          {[2, 4, 8].map((width) => (
            <motion.button
              key={width}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setDrawState(prev => ({ ...prev, lineWidth: width }))}
              className={cn(
                "w-8 h-8 rounded-lg flex items-center justify-center transition-all",
                drawState.lineWidth === width
                  ? "bg-primary/20 text-primary"
                  : "bg-muted/50 text-muted-foreground hover:bg-muted"
              )}
              title={`Line width ${width}`}
            >
              <div 
                className="rounded-full bg-current"
                style={{ width: width + 2, height: width + 2 }}
              />
            </motion.button>
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 border-r border-border/50 pr-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={undo}
            disabled={historyIndex <= 0}
            className="p-2 rounded-lg bg-muted/50 text-muted-foreground hover:bg-muted transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            title="Undo"
          >
            <RotateCcw className="w-4 h-4" />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={redo}
            disabled={historyIndex >= history.length - 1}
            className="p-2 rounded-lg bg-muted/50 text-muted-foreground hover:bg-muted transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            title="Redo"
          >
            <RotateCw className="w-4 h-4" />
          </motion.button>
        </div>

        {/* Clear */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={clearCanvas}
          className="p-2 rounded-lg bg-destructive/10 text-destructive hover:bg-destructive/20 transition-all"
          title="Clear canvas"
        >
          <Trash2 className="w-4 h-4" />
        </motion.button>

        {/* Spacer */}
        <div className="flex-1" />

        {/* CV Mode Indicator */}
        {isCVModeActive && cvStatus === 'active' && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent/10 border border-accent/20">
            <Video className="w-3 h-3 text-accent animate-pulse" />
            <span className="text-xs text-accent">Camera Active</span>
          </div>
        )}
      </div>
    </div>
  )
}
