'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { X, Play, Volume2, Settings, BookOpen, Lightbulb, Loader2 } from 'lucide-react'
import { useDashboardStore } from '@/lib/store'
import { mockResources, mockClassPaths, mockSubjects } from '@/lib/mock-data'
import { Button } from '@/components/ui/button'
import { useState, useEffect } from 'react'

function mockLectureSummary(nodeLabel: string) {
  return {
    title: `${nodeLabel} - Lecture Summary`,
    tip: `Master this topic by focusing on the key patterns and real-world applications.`,
    bullets: [
      `Understand the fundamental principles behind ${nodeLabel}`,
      `Work through practice problems step by step`,
      `Connect this concept to previous lessons`,
      `Test your knowledge with challenging examples`,
      `Review edge cases and exceptions`
    ]
  }
}

function TypingBulletPoint({ text, delay }: { text: string; delay: number }) {
  const [displayedText, setDisplayedText] = useState('')
  const [isComplete, setIsComplete] = useState(false)

  useEffect(() => {
    if (!text) return

    let index = 0
    const timer = setTimeout(() => {
      const interval = setInterval(() => {
        if (index < text.length) {
          setDisplayedText(text.slice(0, index + 1))
          index++
        } else {
          clearInterval(interval)
          setIsComplete(true)
        }
      }, 30)

      return () => clearInterval(interval)
    }, delay)

    return () => clearTimeout(timer)
  }, [text, delay])

  return (
    <motion.li
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: delay / 1000 }}
      className="flex gap-2 text-xs text-muted-foreground"
    >
      <span className="text-primary font-bold flex-shrink-0">•</span>
      <span>
        {displayedText}
        {!isComplete && <motion.span animate={{ opacity: [1, 0] }} transition={{ duration: 0.5, repeat: Infinity }} className="text-primary">_</motion.span>}
      </span>
    </motion.li>
  )
}

export function SplitScreenLectureModal() {
  const { isLectureModalOpen, lectureModalNodeId, closeLectureModal, classPaths } = useDashboardStore()
  const [isSummaryLoading, setIsSummaryLoading] = useState(true)

  // Find the node
  let node = null
  let classPath = null
  let subject = null

  for (const cp of classPaths) {
    const foundNode = cp.nodes.find(n => n.id === lectureModalNodeId)
    if (foundNode) {
      node = foundNode
      classPath = cp
      subject = mockSubjects.find(s => s.id === cp.subjectId)
      break
    }
  }

  useEffect(() => {
    // Simulate summary generation delay
    setIsSummaryLoading(true)
    const timer = setTimeout(() => setIsSummaryLoading(false), 800)
    return () => clearTimeout(timer)
  }, [lectureModalNodeId])

  if (!isLectureModalOpen || !node || !subject) {
    return null
  }

  const summary = mockLectureSummary(node.label)
  const nodeResources = mockResources.filter(r => node.resourceIds.includes(r.id))

  return (
    <AnimatePresence>
      {isLectureModalOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeLectureModal}
            className="fixed inset-0 bg-background/80 backdrop-blur-lg z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="w-full max-w-6xl h-[90vh] bg-card rounded-2xl border border-border overflow-hidden flex flex-col shadow-2xl">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-border bg-muted/30">
                <div>
                  <h2 className="font-bold text-lg text-card-foreground">{node.label}</h2>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {subject.name} • {subject.code}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={closeLectureModal}
                  className="rounded-lg"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>

              {/* Content Split */}
              <div className="flex-1 flex overflow-hidden">
                {/* Left Panel - Video/PDF Viewer (60%) */}
                <div className="flex-[60%] flex flex-col bg-muted/50 border-r border-border">
                  {/* Video Mock */}
                  <div className="flex-1 flex items-center justify-center bg-black/20">
                    <motion.div
                      initial={{ scale: 0.9 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.2 }}
                      className="w-full h-full flex items-center justify-center"
                    >
                      <div className="text-center space-y-4">
                        <div className="w-24 h-24 rounded-full bg-primary/20 flex items-center justify-center mx-auto">
                          <Play className="w-12 h-12 text-primary fill-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-white text-sm">
                            {nodeResources.length > 0
                              ? `${nodeResources[0].title} (${nodeResources[0].type})`
                              : 'Lecture Video'
                            }
                          </h3>
                          <p className="text-xs text-white/60 mt-1">
                            {nodeResources.length > 0 ? 'Resource available' : 'No resources attached yet'}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  </div>

                  {/* Controls */}
                  <div className="p-4 border-t border-border bg-card space-y-3">
                    {/* Progress bar */}
                    <div className="space-y-1">
                      <div className="h-1 bg-muted rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: '45%' }}
                          transition={{ duration: 2 }}
                          className="h-full bg-primary"
                        />
                      </div>
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>12:45</span>
                        <span>28:30</span>
                      </div>
                    </div>

                    {/* Control buttons */}
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="rounded-lg"
                      >
                        <Play className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="rounded-lg"
                      >
                        <Volume2 className="w-4 h-4" />
                      </Button>
                      <div className="flex-1" />
                      <Button
                        variant="outline"
                        size="sm"
                        className="rounded-lg"
                      >
                        <Settings className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Right Panel - AI Summary (40%) */}
                <div className="flex-[40%] flex flex-col bg-card overflow-hidden">
                  {/* Summary content */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {/* Live Summary */}
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      className="space-y-3"
                    >
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-sm text-card-foreground flex items-center gap-2">
                          <BookOpen className="w-4 h-4 text-primary" />
                          Live Summary
                        </h3>
                        {isSummaryLoading && (
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                          >
                            <Loader2 className="w-3 h-3 text-primary" />
                          </motion.div>
                        )}
                      </div>
                      <ul className="space-y-2">
                        {isSummaryLoading ? (
                          // Loading skeleton
                          Array.from({ length: 5 }).map((_, i) => (
                            <motion.li
                              key={i}
                              initial={{ opacity: 0.5 }}
                              animate={{ opacity: 1 }}
                              transition={{ duration: 1, repeat: Infinity, repeatType: 'reverse' }}
                              className="h-4 bg-muted/50 rounded flex gap-2"
                            >
                              <span className="text-primary font-bold flex-shrink-0">•</span>
                              <div className="h-3 bg-muted rounded flex-1" />
                            </motion.li>
                          ))
                        ) : (
                          summary.bullets.map((bullet, i) => (
                            <TypingBulletPoint
                              key={i}
                              text={bullet}
                              delay={200 + i * 100}
                            />
                          ))
                        )}
                      </ul>
                    </motion.div>

                    {/* Professor's Exam Tip */}
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.6 }}
                      className="p-3 rounded-lg bg-gradient-to-br from-primary/10 to-accent/5 border border-primary/20 space-y-2"
                    >
                      <h4 className="font-semibold text-xs text-primary flex items-center gap-2">
                        <Lightbulb className="w-4 h-4" />
                        Professor&apos;s Exam Tip
                      </h4>
                      <p className="text-xs text-foreground">
                        {summary.tip}
                      </p>
                    </motion.div>
                  </div>

                  {/* Action buttons */}
                  <div className="p-4 border-t border-border space-y-2">
                    <Button className="w-full rounded-lg" size="sm">
                      Mark as Complete
                    </Button>
                    <Button variant="outline" className="w-full rounded-lg" size="sm">
                      Save for Later
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
