'use client'

import { useState } from 'react'
import { motion, AnimatePresence, Reorder } from 'framer-motion'
import { 
  AlertTriangle, 
  Clock, 
  GripVertical,
  ChevronDown,
  ChevronUp,
  Target,
  TrendingUp
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { mockTasks, calculateTaskGravity, getTimeUntilDue, type Task } from '@/lib/mock-data'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'

const urgencyColors = {
  critical: { bg: 'bg-destructive/20', border: 'border-destructive/40', text: 'text-destructive', glow: 'glow-danger' },
  high: { bg: 'bg-warning/20', border: 'border-warning/40', text: 'text-warning' },
  medium: { bg: 'bg-primary/20', border: 'border-primary/40', text: 'text-primary' },
  low: { bg: 'bg-muted', border: 'border-border', text: 'text-muted-foreground' },
}

function MiniProgressRing({ progress, size = 40, strokeWidth = 4 }: { progress: number; size?: number; strokeWidth?: number }) {
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const offset = circumference - (progress / 100) * circumference

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg className="transform -rotate-90" width={size} height={size}>
        <circle
          className="text-muted"
          strokeWidth={strokeWidth}
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
        <circle
          className="text-primary transition-all duration-500"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-xs font-bold">
        {progress}%
      </span>
    </div>
  )
}

function ConfidenceMeter({ confidence }: { confidence: number }) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((level) => (
          <div
            key={level}
            className={cn(
              "w-1.5 h-4 rounded-full transition-colors",
              confidence >= level * 20 
                ? confidence >= 60 ? "bg-primary" : confidence >= 40 ? "bg-warning" : "bg-destructive"
                : "bg-muted"
            )}
            style={{ height: `${8 + level * 3}px` }}
          />
        ))}
      </div>
      <span className="text-xs text-muted-foreground">{confidence}%</span>
    </div>
  )
}

function TaskCard({ task, isTopRisk, isExpanded, onToggle }: { 
  task: Task; 
  isTopRisk?: boolean;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  const colors = urgencyColors[task.urgency]
  // Use only pre-calculated values, never call functions during render
  const gravity = task.gravity ?? 0
  const timeUntil = task.timeUntil ?? 'N/A'
  const isOverdue = timeUntil === 'Overdue'

  return (
    <Reorder.Item
      value={task}
      id={task.id}
      className="cursor-grab active:cursor-grabbing"
    >
      <motion.div
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className={cn(
          "rounded-2xl border p-4 transition-all duration-300",
          colors.bg,
          colors.border,
          isTopRisk && task.urgency === 'critical' && "animate-pulse-glow",
          isExpanded && "ring-2 ring-primary/30"
        )}
      >
        <div className="flex items-start gap-3">
          {/* Drag Handle */}
          <div className="pt-1 opacity-40 hover:opacity-100 transition-opacity">
            <GripVertical className="w-4 h-4" />
          </div>

          {/* Progress Ring */}
          <MiniProgressRing progress={task.progress} />

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h4 className="font-semibold text-card-foreground line-clamp-1">
                  {task.title}
                </h4>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="secondary" className="text-xs">
                    {task.subject}
                  </Badge>
                  <Badge className={cn("text-xs", colors.bg, colors.text, "border-0")}>
                    {task.urgency.toUpperCase()}
                  </Badge>
                </div>
              </div>

              {/* Gravity Score */}
              <div className="text-right shrink-0">
                <div className="flex items-center gap-1">
                  <Target className="w-3 h-3 text-muted-foreground" />
                  <span suppressHydrationWarning className="text-lg font-bold text-primary">{gravity}</span>
                </div>
                <span className="text-xs text-muted-foreground">Gravity</span>
              </div>
            </div>

            {/* Metrics Row */}
            <div className="flex items-center gap-4 mt-3 text-sm">
              {/* Due Time */}
              <div className={cn(
                "flex items-center gap-1",
                isOverdue ? "text-destructive" : "text-muted-foreground"
              )}>
                <Clock className="w-3.5 h-3.5" />
                <span suppressHydrationWarning className="font-medium">{timeUntil}</span>
              </div>

              {/* Grade Weight */}
              <div className="flex items-center gap-1 text-muted-foreground">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>{task.gradeWeight}% weight</span>
              </div>

              {/* Confidence */}
              <ConfidenceMeter confidence={task.confidence} />
            </div>

            {/* Expanded Details */}
            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-4 pt-4 border-t border-border/50"
                >
                  <p className="text-sm text-muted-foreground">
                    {task.description}
                  </p>
                  <div className="mt-3">
                    <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                      <span>Completion Progress</span>
                      <span>{task.progress}%</span>
                    </div>
                    <Progress value={task.progress} className="h-2" />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Expand Toggle */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onToggle}
            className="p-1 rounded-lg hover:bg-secondary transition-colors"
          >
            {isExpanded ? (
              <ChevronUp className="w-4 h-4 text-muted-foreground" />
            ) : (
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            )}
          </motion.button>
        </div>
      </motion.div>
    </Reorder.Item>
  )
}

export function TaskGravityEngine() {
  const [tasks, setTasks] = useState(
    [...mockTasks].sort((a, b) => calculateTaskGravity(b) - calculateTaskGravity(a))
  )
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const topRiskTask = tasks[0]

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-card-foreground flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-warning" />
            Task Gravity Engine
          </h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Auto-sorted by danger: Urgency × Grade Weight
          </p>
        </div>
        <Badge variant="outline" className="text-xs">
          {tasks.length} Active Tasks
        </Badge>
      </div>

      {/* Task List */}
      <Reorder.Group 
        axis="y" 
        values={tasks} 
        onReorder={setTasks}
        className="space-y-3"
      >
        <AnimatePresence>
          {tasks.map((task, index) => (
            <TaskCard
              key={task.id}
              task={task}
              isTopRisk={index === 0}
              isExpanded={expandedId === task.id}
              onToggle={() => setExpandedId(expandedId === task.id ? null : task.id)}
            />
          ))}
        </AnimatePresence>
      </Reorder.Group>
    </div>
  )
}
