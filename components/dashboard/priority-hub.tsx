'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, X, GripVertical } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Priority {
  id: string
  text: string
  completed: boolean
}

export function PriorityHub() {
  const [priorities, setPriorities] = useState<Priority[]>([
    { id: '1', text: 'Complete DSA assignment', completed: false },
    { id: '2', text: 'Review lecture notes', completed: false },
    { id: '3', text: 'Prepare for quiz', completed: false },
  ])
  const [newPriority, setNewPriority] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editText, setEditText] = useState('')

  const addPriority = () => {
    if (newPriority.trim() && priorities.length < 3) {
      setPriorities([
        ...priorities,
        { id: crypto.randomUUID(), text: newPriority.trim(), completed: false }
      ])
      setNewPriority('')
    }
  }

  const toggleComplete = (id: string) => {
    setPriorities(priorities.map(p =>
      p.id === id ? { ...p, completed: !p.completed } : p
    ))
  }

  const removePriority = (id: string) => {
    setPriorities(priorities.filter(p => p.id !== id))
  }

  const startEditing = (priority: Priority) => {
    setEditingId(priority.id)
    setEditText(priority.text)
  }

  const saveEdit = () => {
    if (editingId && editText.trim()) {
      setPriorities(priorities.map(p =>
        p.id === editingId ? { ...p, text: editText.trim() } : p
      ))
    }
    setEditingId(null)
    setEditText('')
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="w-72 h-full flex flex-col"
    >
      {/* Glassmorphism sticky note container */}
      <div className="relative flex-1 rounded-2xl overflow-hidden">
        {/* Neon glow border */}
        <div className="absolute inset-0 rounded-2xl p-[2px] bg-gradient-to-br from-primary/60 via-accent/40 to-primary/60 animate-pulse-glow">
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/20 via-transparent to-accent/20 blur-xl" />
        </div>
        
        {/* Glass panel content */}
        <div className="relative h-full rounded-2xl bg-card/80 backdrop-blur-xl border border-primary/30 p-4 flex flex-col">
          {/* Header */}
          <div className="mb-4">
            <h3 className="text-lg font-bold text-foreground tracking-tight" style={{ fontFamily: 'var(--font-mono)' }}>
              TOP 3 PRIORITIES
            </h3>
            <p className="text-xs text-muted-foreground mt-1">Focus on what matters most</p>
          </div>

          {/* Priority List */}
          <div className="flex-1 space-y-3 overflow-y-auto">
            <AnimatePresence mode="popLayout">
              {priorities.map((priority, index) => (
                <motion.div
                  key={priority.id}
                  layout
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className={cn(
                    "group relative p-3 rounded-xl border transition-all duration-300",
                    priority.completed
                      ? "bg-primary/10 border-primary/30"
                      : "bg-muted/30 border-border hover:border-primary/40"
                  )}
                >
                  <div className="flex items-start gap-2">
                    {/* Drag handle */}
                    <div className="pt-1 opacity-30 group-hover:opacity-60 cursor-grab">
                      <GripVertical className="w-3 h-3" />
                    </div>

                    {/* Number badge */}
                    <div className={cn(
                      "flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold",
                      priority.completed
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    )}>
                      {index + 1}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      {editingId === priority.id ? (
                        <input
                          type="text"
                          value={editText}
                          onChange={(e) => setEditText(e.target.value)}
                          onBlur={saveEdit}
                          onKeyDown={(e) => e.key === 'Enter' && saveEdit()}
                          autoFocus
                          className="w-full bg-transparent border-none outline-none text-sm font-medium"
                          style={{ fontFamily: "var(--font-handwritten, 'Caveat'), cursive" }}
                        />
                      ) : (
                        <p
                          onClick={() => toggleComplete(priority.id)}
                          onDoubleClick={() => startEditing(priority)}
                          className={cn(
                            "text-sm cursor-pointer select-none transition-all",
                            priority.completed
                              ? "line-through text-muted-foreground decoration-primary decoration-2"
                              : "text-foreground hover:text-primary"
                          )}
                          style={{ fontFamily: "'Caveat', cursive", fontSize: '1.1rem', lineHeight: '1.3' }}
                        >
                          {priority.text}
                        </p>
                      )}
                    </div>

                    {/* Remove button */}
                    <button
                      onClick={() => removePriority(priority.id)}
                      className="opacity-0 group-hover:opacity-100 p-1 rounded-lg hover:bg-destructive/20 transition-all"
                    >
                      <X className="w-3 h-3 text-destructive" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Add new priority */}
          {priorities.length < 3 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-4 pt-3 border-t border-border/50"
            >
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newPriority}
                  onChange={(e) => setNewPriority(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addPriority()}
                  placeholder="Add priority..."
                  className="flex-1 bg-muted/50 border border-border rounded-lg px-3 py-2 text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/50"
                  style={{ fontFamily: "var(--font-handwritten, 'Caveat'), cursive" }}
                />
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={addPriority}
                  disabled={!newPriority.trim()}
                  className="p-2 rounded-lg bg-primary/20 text-primary hover:bg-primary/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  <Plus className="w-4 h-4" />
                </motion.button>
              </div>
            </motion.div>
          )}

          {/* Tips */}
          <div className="mt-3 text-[10px] text-muted-foreground/60 text-center">
            Click to complete | Double-click to edit
          </div>
        </div>
      </div>
    </motion.div>
  )
}
