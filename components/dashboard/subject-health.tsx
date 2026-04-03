'use client'

import { motion } from 'framer-motion'
import { Activity, Shield, Zap, AlertTriangle, TrendingUp, Users, BookOpen, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useDashboardStore } from '@/lib/store'
import { mockSubjects, type Subject } from '@/lib/mock-data'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'

function HealthBar({ value, maxValue = 100, color, label }: { 
  value: number; 
  maxValue?: number; 
  color: string;
  label: string;
}) {
  const percentage = (value / maxValue) * 100

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-medium">{value}%</span>
      </div>
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="h-full rounded-full"
          style={{ backgroundColor: color }}
        />
      </div>
    </div>
  )
}

function ShieldMeter({ value }: { value: number }) {
  return (
    <div className="relative w-12 h-12">
      <svg viewBox="0 0 48 48" className="w-full h-full">
        <defs>
          <linearGradient id="shield-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.8" />
            <stop offset="100%" stopColor="var(--primary)" stopOpacity="0.3" />
          </linearGradient>
        </defs>
        <path
          d="M24 4L6 12v12c0 11 8 18 18 22 10-4 18-11 18-22V12L24 4z"
          fill="none"
          stroke="var(--muted)"
          strokeWidth="2"
        />
        <motion.path
          d="M24 4L6 12v12c0 11 8 18 18 22 10-4 18-11 18-22V12L24 4z"
          fill="url(#shield-gradient)"
          fillOpacity={value / 100}
          initial={{ fillOpacity: 0 }}
          animate={{ fillOpacity: value / 100 }}
          transition={{ duration: 0.8 }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <Shield className="w-5 h-5 text-primary" />
      </div>
    </div>
  )
}

function XPBar({ value, level }: { value: number; level: number }) {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1">
          <Zap className="w-3 h-3 text-warning" />
          <span className="text-xs font-medium">Level {level}</span>
        </div>
        <span className="text-xs text-muted-foreground">{value}/100 XP</span>
      </div>
      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="h-full bg-gradient-to-r from-warning to-warning/50 rounded-full"
        />
      </div>
    </div>
  )
}

function SubjectCard({ subject }: { subject: Subject }) {
  const { setCurrentView, setActiveClass, classPaths } = useDashboardStore()
  
  const riskConfig = {
    safe: { icon: TrendingUp, color: 'text-primary', bg: 'bg-primary/10', border: 'border-primary/20' },
    warning: { icon: AlertTriangle, color: 'text-warning', bg: 'bg-warning/10', border: 'border-warning/20' },
    danger: { icon: AlertCircle, color: 'text-destructive', bg: 'bg-destructive/10', border: 'border-destructive/20' },
  }

  const risk = riskConfig[subject.riskLevel]
  const RiskIcon = risk.icon
  const xpLevel = Math.floor(subject.marks / 20) + 1
  const xpProgress = (subject.marks % 20) * 5

  // Calculate workflow health from ClassPath
  const classPath = classPaths.find(cp => cp.subjectId === subject.id)
  const workflowHealth = classPath 
    ? (classPath.nodes.filter(n => n.completed).length / classPath.nodes.length) * 100
    : 0
  
  const workflowStatus = workflowHealth >= 71 ? 'green' : workflowHealth >= 31 ? 'yellow' : 'red'
  const workflowColor = {
    green: '#22c55e',
    yellow: '#f59e0b',
    red: '#ef4444'
  }[workflowStatus]

  const handleViewClassPath = () => {
    if (classPath) {
      setActiveClass(classPath.id)
      setCurrentView('class-path')
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      className={cn(
        "bg-card border rounded-2xl p-4 transition-all duration-300",
        risk.border,
        subject.riskLevel === 'danger' && "animate-pulse-glow"
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          {/* Avatar/Icon with color */}
          <div 
            className="w-12 h-12 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: `${subject.color}20` }}
          >
            <span className="text-lg font-bold" style={{ color: subject.color }}>
              {subject.code.slice(0, 2)}
            </span>
          </div>
          <div>
            <h4 className="font-semibold text-card-foreground text-sm">
              {subject.name}
            </h4>
            <Badge 
              className={cn("text-xs mt-1", risk.bg, risk.color, "border-0")}
            >
              <RiskIcon className="w-3 h-3 mr-1" />
              {subject.riskLevel.toUpperCase()}
            </Badge>
          </div>
        </div>

        <ShieldMeter value={subject.revisionConfidence} />
      </div>

      {/* Health Bars */}
      <div className="space-y-3">
        <HealthBar 
          value={subject.attendance} 
          color={subject.attendance >= 75 ? '#22c55e' : subject.attendance >= 50 ? '#f59e0b' : '#ef4444'}
          label="Attendance"
        />
        <HealthBar 
          value={subject.marks} 
          color={subject.marks >= 70 ? '#22c55e' : subject.marks >= 50 ? '#f59e0b' : '#ef4444'}
          label="Marks"
        />
        <HealthBar 
          value={subject.revisionConfidence} 
          color="#8b5cf6"
          label="Revision Confidence"
        />

        {/* Workflow Health */}
        {classPath && (
          <HealthBar 
            value={Math.round(workflowHealth)} 
            color={workflowColor}
            label="Workflow Health"
          />
        )}
      </div>

      {/* XP Bar */}
      <div className="mt-4 pt-4 border-t border-border">
        <XPBar value={xpProgress} level={xpLevel} />
      </div>

      {/* Stats Row */}
      <div className="flex items-center justify-between mt-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-1">
          <BookOpen className="w-3 h-3" />
          <span>{subject.pendingTasks} tasks</span>
        </div>
        <div className="flex items-center gap-1">
          <AlertCircle className="w-3 h-3" />
          <span>{subject.issueBacklog} issues</span>
        </div>
      </div>

      {/* Class Path Button */}
      {classPath && (
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleViewClassPath}
          className="w-full mt-4 px-3 py-2 rounded-lg bg-primary/10 text-primary text-sm font-medium hover:bg-primary/20 transition-colors"
        >
          View Class Path
        </motion.button>
      )}
    </motion.div>
  )
}

export function SubjectHealth() {
  const dangerCount = mockSubjects.filter(s => s.riskLevel === 'danger').length
  const warningCount = mockSubjects.filter(s => s.riskLevel === 'warning').length

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-card-foreground flex items-center gap-2">
            <Activity className="w-5 h-5 text-primary" />
            Subject Health
          </h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Gamified academic status tracking
          </p>
        </div>
        <div className="flex items-center gap-2">
          {dangerCount > 0 && (
            <Badge variant="outline" className="text-xs text-destructive border-destructive/30">
              {dangerCount} At Risk
            </Badge>
          )}
          {warningCount > 0 && (
            <Badge variant="outline" className="text-xs text-warning border-warning/30">
              {warningCount} Warning
            </Badge>
          )}
        </div>
      </div>

      {/* Subject Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {mockSubjects.map((subject, index) => (
          <motion.div
            key={subject.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <SubjectCard subject={subject} />
          </motion.div>
        ))}
      </div>
    </div>
  )
}
