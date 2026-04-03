'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, Plus, X, StickyNote, Image as ImageIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useDashboardStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

// Helper functions
function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate()
}

function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay()
}

function isHoliday(date: Date): boolean {
  const holidays = [
    '2026-01-01', '2026-01-20', '2026-02-17', '2026-04-03', 
    '2026-05-25', '2026-07-04', '2026-09-07', '2026-11-26', 
    '2026-11-27', '2026-12-25'
  ]
  const dateStr = date.toISOString().split('T')[0]
  return holidays.includes(dateStr)
}

function isWeekend(date: Date): boolean {
  const day = date.getDay()
  return day === 0 || day === 6
}

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 
                'July', 'August', 'September', 'October', 'November', 'December']
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export function FunkyCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDay, setSelectedDay] = useState<Date | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [noteContent, setNoteContent] = useState('')
  const { calendarNotes, addCalendarNote, removeCalendarNote } = useDashboardStore()

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()

  const calendarDays = useMemo(() => {
    const daysInMonth = getDaysInMonth(year, month)
    const firstDay = getFirstDayOfMonth(year, month)
    const days: (Date | null)[] = []

    // Add empty slots for days before the first day
    for (let i = 0; i < firstDay; i++) {
      days.push(null)
    }

    // Add all days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i))
    }

    return days
  }, [year, month])

  const navigateMonth = (direction: -1 | 1) => {
    setCurrentDate(new Date(year, month + direction, 1))
  }

  const handleDayClick = (date: Date) => {
    setSelectedDay(date)
    setIsDialogOpen(true)
    setNoteContent('')
  }

  const handleAddNote = () => {
    if (selectedDay && noteContent.trim()) {
      addCalendarNote({
        date: selectedDay.toISOString().split('T')[0],
        content: noteContent,
        type: 'sticky'
      })
      setNoteContent('')
    }
  }

  const getNotesForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0]
    return calendarNotes.filter(note => note.date === dateStr)
  }

  const isToday = (date: Date) => {
    const today = new Date()
    return date.toDateString() === today.toDateString()
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-foreground">Funky Calendar</h2>
          <p className="text-sm text-muted-foreground">Plan your academic journey</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigateMonth(-1)}
            className="h-8 w-8"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <span className="text-sm font-semibold min-w-[140px] text-center">
            {MONTHS[month]} {year}
          </span>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigateMonth(1)}
            className="h-8 w-8"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="flex-1 flex flex-col">
        {/* Day Headers */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {DAYS.map(day => (
            <div 
              key={day} 
              className="text-center text-xs font-medium text-muted-foreground py-2"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Days Grid */}
        <div className="grid grid-cols-7 gap-1 flex-1">
          {calendarDays.map((date, index) => {
            if (!date) {
              return <div key={`empty-${index}`} className="rounded-lg bg-muted/20" />
            }

            const holiday = isHoliday(date)
            const weekend = isWeekend(date)
            const today = isToday(date)
            const notes = getNotesForDate(date)

            return (
              <motion.button
                key={date.toISOString()}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleDayClick(date)}
                className={cn(
                  "relative rounded-lg border transition-all duration-200 flex flex-col items-center justify-start p-1.5 min-h-[80px]",
                  holiday || weekend
                    ? "bg-pink-500/10 border-pink-500/30 hover:bg-pink-500/20"
                    : "bg-card/50 border-border hover:bg-card hover:border-primary/30",
                  today && "ring-2 ring-primary ring-offset-2 ring-offset-background"
                )}
              >
                <span className={cn(
                  "text-sm font-medium",
                  holiday || weekend ? "text-pink-400" : "text-foreground",
                  today && "text-primary font-bold"
                )}>
                  {date.getDate()}
                </span>

                {/* Notes indicator */}
                {notes.length > 0 && (
                  <div className="flex gap-0.5 mt-1 flex-wrap justify-center">
                    {notes.slice(0, 3).map((note, i) => (
                      <div 
                        key={note.id}
                        className={cn(
                          "w-1.5 h-1.5 rounded-full",
                          note.type === 'sticky' ? "bg-warning" : "bg-primary"
                        )}
                      />
                    ))}
                    {notes.length > 3 && (
                      <span className="text-[8px] text-muted-foreground">+{notes.length - 3}</span>
                    )}
                  </div>
                )}

                {/* Holiday/Weekend indicator */}
                {(holiday || weekend) && (
                  <div className="absolute bottom-1 left-1/2 -translate-x-1/2">
                    <span className="text-[8px] text-pink-400 font-medium">
                      {holiday ? 'Holiday' : 'Weekend'}
                    </span>
                  </div>
                )}
              </motion.button>
            )
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 mt-4 pt-4 border-t border-border">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-pink-500/30" />
          <span className="text-xs text-muted-foreground">Holiday/Weekend</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-card border border-border" />
          <span className="text-xs text-muted-foreground">School Day</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-warning" />
          <span className="text-xs text-muted-foreground">Sticky Note</span>
        </div>
      </div>

      {/* Day Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle>
              {selectedDay && selectedDay.toLocaleDateString('en-US', { 
                weekday: 'long', 
                month: 'long', 
                day: 'numeric' 
              })}
            </DialogTitle>
            <DialogDescription>
              Add or view notes for this day
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Add Note */}
            <div className="flex gap-2">
              <Input
                placeholder="Add a sticky note..."
                value={noteContent}
                onChange={(e) => setNoteContent(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddNote()}
                className="bg-muted border-border"
              />
              <Button onClick={handleAddNote} size="icon" className="shrink-0">
                <Plus className="w-4 h-4" />
              </Button>
            </div>

            {/* Existing Notes */}
            <div className="space-y-2 max-h-[200px] overflow-y-auto">
              <AnimatePresence>
                {selectedDay && getNotesForDate(selectedDay).map(note => (
                  <motion.div
                    key={note.id}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    className="flex items-center gap-2 p-3 bg-warning/10 border border-warning/20 rounded-lg"
                  >
                    <StickyNote className="w-4 h-4 text-warning shrink-0" />
                    <span className="flex-1 text-sm text-foreground">{note.content}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-muted-foreground hover:text-destructive"
                      onClick={() => removeCalendarNote(note.id)}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </motion.div>
                ))}
              </AnimatePresence>
              {selectedDay && getNotesForDate(selectedDay).length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No notes for this day
                </p>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
