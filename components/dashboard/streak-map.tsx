'use client'

import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Flame, TrendingUp } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

interface ContributionDay {
  date: Date
  count: number
}

// Generate 52 weeks of mock contribution data
function generateContributionData(): ContributionDay[] {
  const days: ContributionDay[] = []
  const today = new Date()
  const startDate = new Date(today)
  startDate.setDate(startDate.getDate() - 364) // 52 weeks ago

  for (let i = 0; i < 365; i++) {
    const date = new Date(startDate)
    date.setDate(date.getDate() + i)
    
    // Random contribution count with some patterns
    let count = 0
    const dayOfWeek = date.getDay()
    const random = Math.random()
    
    // More likely to have contributions on weekdays
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      if (random > 0.3) count = Math.floor(Math.random() * 5) + 1
      if (random > 0.7) count = Math.floor(Math.random() * 8) + 3
      if (random > 0.9) count = Math.floor(Math.random() * 10) + 7
    } else {
      if (random > 0.6) count = Math.floor(Math.random() * 3) + 1
    }

    days.push({ date, count })
  }

  return days
}

function getContributionLevel(count: number): number {
  if (count === 0) return 0
  if (count <= 2) return 1
  if (count <= 5) return 2
  if (count <= 8) return 3
  return 4
}

const levelColors = {
  0: 'bg-muted/30',
  1: 'bg-primary/30',
  2: 'bg-primary/50',
  3: 'bg-primary/70',
  4: 'bg-primary glow-primary',
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export function StreakMap() {
  const [contributionData] = useState(() => generateContributionData())
  
  // Organize data into weeks
  const weeks = useMemo(() => {
    const result: ContributionDay[][] = []
    let currentWeek: ContributionDay[] = []
    
    contributionData.forEach((day, index) => {
      currentWeek.push(day)
      if ((index + 1) % 7 === 0) {
        result.push(currentWeek)
        currentWeek = []
      }
    })
    
    if (currentWeek.length > 0) {
      result.push(currentWeek)
    }
    
    return result
  }, [contributionData])

  // Calculate stats
  const totalContributions = useMemo(() => 
    contributionData.reduce((sum, day) => sum + day.count, 0),
    [contributionData]
  )

  const currentStreak = useMemo(() => {
    let streak = 0
    for (let i = contributionData.length - 1; i >= 0; i--) {
      if (contributionData[i].count > 0) {
        streak++
      } else {
        break
      }
    }
    return streak
  }, [contributionData])

  const longestStreak = useMemo(() => {
    let maxStreak = 0
    let currentStreak = 0
    for (const day of contributionData) {
      if (day.count > 0) {
        currentStreak++
        maxStreak = Math.max(maxStreak, currentStreak)
      } else {
        currentStreak = 0
      }
    }
    return maxStreak
  }, [contributionData])

  // Get month labels with positions
  const monthLabels = useMemo(() => {
    const labels: { month: string; position: number }[] = []
    let lastMonth = -1
    
    weeks.forEach((week, weekIndex) => {
      const firstDay = week[0]
      if (firstDay) {
        const month = firstDay.date.getMonth()
        if (month !== lastMonth) {
          labels.push({ month: MONTHS[month], position: weekIndex })
          lastMonth = month
        }
      }
    })
    
    return labels
  }, [weeks])

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    })
  }

  return (
    <div className="space-y-4">
      {/* Header with stats */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Flame className="w-5 h-5 text-warning" />
            <span className="text-sm font-medium text-foreground">{currentStreak} day streak</span>
          </div>
          <div className="w-px h-4 bg-border" />
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-primary" />
            <span className="text-xs text-muted-foreground">{totalContributions} contributions this year</span>
          </div>
        </div>
        <div className="text-xs text-muted-foreground">
          Longest streak: <span className="font-medium text-primary">{longestStreak} days</span>
        </div>
      </div>

      {/* Streak Map Grid */}
      <div className="overflow-x-auto pb-2">
        <div className="min-w-max">
          {/* Month labels */}
          <div className="flex mb-1 pl-8">
            {monthLabels.map((label, i) => (
              <div 
                key={`${label.month}-${i}`}
                className="text-[10px] text-muted-foreground"
                style={{ 
                  position: 'relative',
                  left: `${label.position * 12}px`,
                  marginRight: i < monthLabels.length - 1 
                    ? `${(monthLabels[i + 1]?.position - label.position - 1) * 12}px` 
                    : 0 
                }}
              >
                {label.month}
              </div>
            ))}
          </div>

          <div className="flex">
            {/* Day labels */}
            <div className="flex flex-col gap-[3px] mr-2 pt-0">
              {[0, 1, 2, 3, 4, 5, 6].map((dayIndex) => (
                <div 
                  key={dayIndex} 
                  className="h-[10px] text-[9px] text-muted-foreground/70 leading-[10px]"
                >
                  {dayIndex % 2 === 1 ? DAYS[dayIndex].slice(0, 1) : ''}
                </div>
              ))}
            </div>

            {/* Grid */}
            <TooltipProvider delayDuration={0}>
              <div className="flex gap-[3px]">
                {weeks.map((week, weekIndex) => (
                  <div key={weekIndex} className="flex flex-col gap-[3px]">
                    {week.map((day, dayIndex) => {
                      const level = getContributionLevel(day.count)
                      return (
                        <Tooltip key={dayIndex}>
                          <TooltipTrigger asChild>
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ delay: (weekIndex * 7 + dayIndex) * 0.001 }}
                              className={cn(
                                "w-[10px] h-[10px] rounded-[2px] cursor-pointer transition-all hover:ring-1 hover:ring-primary/50",
                                levelColors[level as keyof typeof levelColors]
                              )}
                            />
                          </TooltipTrigger>
                          <TooltipContent 
                            side="top" 
                            className="bg-card border-border text-xs"
                          >
                            <div className="font-medium">{day.count} contributions</div>
                            <div className="text-muted-foreground">{formatDate(day.date)}</div>
                          </TooltipContent>
                        </Tooltip>
                      )
                    })}
                  </div>
                ))}
              </div>
            </TooltipProvider>
          </div>

          {/* Legend */}
          <div className="flex items-center justify-end gap-2 mt-3">
            <span className="text-[10px] text-muted-foreground">Less</span>
            <div className="flex gap-[3px]">
              {[0, 1, 2, 3, 4].map((level) => (
                <div
                  key={level}
                  className={cn(
                    "w-[10px] h-[10px] rounded-[2px]",
                    levelColors[level as keyof typeof levelColors]
                  )}
                />
              ))}
            </div>
            <span className="text-[10px] text-muted-foreground">More</span>
          </div>
        </div>
      </div>
    </div>
  )
}
