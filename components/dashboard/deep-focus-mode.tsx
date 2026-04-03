'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { X, Save, Clock, FileText } from 'lucide-react'
import { useDashboardStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export function DeepFocusMode() {
  const { toggleDeepFocusMode } = useDashboardStore()
  const [content, setContent] = useState('')
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [sessionTime, setSessionTime] = useState(0)
  const [wordCount, setWordCount] = useState(0)

  // Auto-save every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (content.trim()) {
        setIsSaving(true)
        // Simulate save
        setTimeout(() => {
          setLastSaved(new Date())
          setIsSaving(false)
        }, 500)
      }
    }, 30000)

    return () => clearInterval(interval)
  }, [content])

  // Session timer
  useEffect(() => {
    const interval = setInterval(() => {
      setSessionTime(prev => prev + 1)
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  // Word count
  useEffect(() => {
    const words = content.trim().split(/\s+/).filter(w => w.length > 0)
    setWordCount(words.length)
  }, [content])

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600)
    const mins = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const handleSave = useCallback(() => {
    setIsSaving(true)
    setTimeout(() => {
      setLastSaved(new Date())
      setIsSaving(false)
    }, 500)
  }, [])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black z-[100] flex flex-col"
    >
      {/* Minimal Header */}
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-6">
          {/* Session Timer */}
          <div className="flex items-center gap-2 text-zinc-500">
            <Clock className="w-4 h-4" />
            <span className="text-sm font-mono">{formatTime(sessionTime)}</span>
          </div>

          {/* Word Count */}
          <div className="flex items-center gap-2 text-zinc-500">
            <FileText className="w-4 h-4" />
            <span className="text-sm">{wordCount} words</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Save Status */}
          <div className="flex items-center gap-2">
            {isSaving ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              >
                <Save className="w-4 h-4 text-zinc-500" />
              </motion.div>
            ) : lastSaved ? (
              <span className="text-xs text-zinc-600">
                Saved {lastSaved.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
              </span>
            ) : null}
          </div>

          {/* Manual Save */}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSave}
            className="text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900"
          >
            <Save className="w-4 h-4 mr-2" />
            Save
          </Button>

          {/* Exit */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleDeepFocusMode}
            className="text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Editor Area */}
      <div className="flex-1 flex items-start justify-center overflow-hidden px-6 py-8">
        <div className="w-full max-w-2xl h-full">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Start writing..."
            autoFocus
            className={cn(
              "w-full h-full resize-none bg-transparent border-none outline-none",
              "text-zinc-200 text-lg leading-relaxed placeholder:text-zinc-700",
              "font-mono"
            )}
            style={{
              caretColor: '#10b981'
            }}
          />
        </div>
      </div>

      {/* Bottom hint */}
      <div className="px-6 py-4 flex justify-center">
        <p className="text-xs text-zinc-700">
          Press <kbd className="px-1.5 py-0.5 bg-zinc-900 rounded text-zinc-500 mx-1">Esc</kbd> or click X to exit focus mode
        </p>
      </div>

      {/* Escape key handler */}
      <EscapeHandler onEscape={toggleDeepFocusMode} />
    </motion.div>
  )
}

function EscapeHandler({ onEscape }: { onEscape: () => void }) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onEscape()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onEscape])

  return null
}
