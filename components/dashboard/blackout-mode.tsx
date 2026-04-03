'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { X, ChevronLeft } from 'lucide-react'
import { useDashboardStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'

export function BlackoutMode() {
  const { isBlackoutMode, toggleBlackoutMode, blackoutNotes, setBlackoutNotes } = useDashboardStore()

  return (
    <AnimatePresence>
      {isBlackoutMode && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black flex flex-col"
        >
          {/* Header */}
          <div className="border-b border-white/10 p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={toggleBlackoutMode}
                className="text-white/60 hover:text-white transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <h1 className="text-white/80 text-sm font-medium">FOCUS MODE</h1>
            </div>
            <button
              onClick={toggleBlackoutMode}
              className="text-white/60 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Centered Notepad */}
          <div className="flex-1 flex items-center justify-center p-8">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="w-full max-w-3xl"
            >
              <Textarea
                value={blackoutNotes}
                onChange={(e) => setBlackoutNotes(e.target.value)}
                placeholder="Your thoughts here... (auto-saved)"
                className="w-full h-96 bg-white/5 border-white/10 text-white placeholder:text-white/30 text-lg font-mono focus:bg-white/10 focus:border-white/20"
              />
            </motion.div>
          </div>

          {/* Footer */}
          <div className="border-t border-white/10 p-4 flex items-center justify-center gap-2 text-white/40 text-xs">
            <div className="flex-1" />
            <p>Press Escape or click exit to leave focus mode</p>
            <div className="flex-1" />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
