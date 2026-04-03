'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  GitBranch, 
  CheckCircle2, 
  Circle, 
  Clock,
  RotateCcw,
  MessageSquare,
  Paperclip,
  ChevronDown,
  ChevronUp,
  Check
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { mockIssues, formatTimeAgo, type Issue, type IssueReply } from '@/lib/mock-data'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

const statusConfig = {
  'open': { icon: Circle, color: 'text-warning', bg: 'bg-warning/10', label: 'Open' },
  'in-review': { icon: Clock, color: 'text-primary', bg: 'bg-primary/10', label: 'In Review' },
  'resolved': { icon: CheckCircle2, color: 'text-primary', bg: 'bg-primary/10', label: 'Resolved' },
  'reopened': { icon: RotateCcw, color: 'text-destructive', bg: 'bg-destructive/10', label: 'Reopened' },
}

const severityConfig = {
  critical: { bg: 'bg-destructive/20', text: 'text-destructive', border: 'border-destructive/30' },
  major: { bg: 'bg-warning/20', text: 'text-warning', border: 'border-warning/30' },
  minor: { bg: 'bg-primary/20', text: 'text-primary', border: 'border-primary/30' },
  suggestion: { bg: 'bg-muted', text: 'text-muted-foreground', border: 'border-border' },
}

function ReplyThread({ replies }: { replies: IssueReply[] }) {
  return (
    <div className="mt-4 space-y-3">
      {replies.map((reply, index) => (
        <motion.div
          key={reply.id}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.1 }}
          className={cn(
            "flex gap-3 p-3 rounded-xl",
            reply.isResolution ? "bg-primary/10 border border-primary/20" : "bg-muted/50"
          )}
        >
          <Avatar className="w-8 h-8 shrink-0">
            <AvatarFallback className={cn(
              "text-xs font-semibold",
              reply.author === 'You' ? "bg-primary/20 text-primary" : "bg-secondary text-secondary-foreground"
            )}>
              {reply.avatar}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">{reply.author}</span>
              <span suppressHydrationWarning className="text-xs text-muted-foreground">{reply.timeAgo ?? 'recently'}</span>
              {reply.isResolution && (
                <Badge variant="outline" className="text-xs text-primary border-primary/30">
                  <Check className="w-3 h-3 mr-1" />
                  Resolution
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground mt-1 whitespace-pre-wrap">
              {reply.content}
            </p>
          </div>
        </motion.div>
      ))}
    </div>
  )
}

function StatusTimeline({ status }: { status: Issue['status'] }) {
  const steps = ['open', 'in-review', 'resolved']
  const currentIndex = steps.indexOf(status === 'reopened' ? 'open' : status)

  return (
    <div className="flex items-center gap-1 mt-3">
      {steps.map((step, index) => {
        const isCompleted = index <= currentIndex
        const isCurrent = index === currentIndex
        
        return (
          <div key={step} className="flex items-center">
            <motion.div
              initial={false}
              animate={{
                scale: isCurrent ? 1.2 : 1,
                backgroundColor: isCompleted ? 'var(--primary)' : 'var(--muted)'
              }}
              className={cn(
                "w-2 h-2 rounded-full",
                isCompleted ? "bg-primary" : "bg-muted"
              )}
            />
            {index < steps.length - 1 && (
              <div className={cn(
                "w-8 h-0.5 mx-1",
                index < currentIndex ? "bg-primary" : "bg-muted"
              )} />
            )}
          </div>
        )
      })}
    </div>
  )
}

function IssueCard({ issue }: { issue: Issue }) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [localStatus, setLocalStatus] = useState(issue.status)
  
  const StatusIcon = statusConfig[localStatus].icon
  const severity = severityConfig[issue.severity]

  const handleResolve = () => {
    setLocalStatus(localStatus === 'resolved' ? 'open' : 'resolved')
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "rounded-2xl border bg-card p-4 transition-all duration-300",
        isExpanded && "ring-2 ring-primary/20"
      )}
    >
      {/* Header */}
      <div className="flex items-start gap-3">
        <Avatar className="w-10 h-10 shrink-0">
          <AvatarFallback className="bg-secondary text-secondary-foreground font-semibold text-sm">
            {issue.professorAvatar}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h4 className="font-semibold text-card-foreground line-clamp-1">
                {issue.title}
              </h4>
              <p suppressHydrationWarning className="text-sm text-muted-foreground mt-0.5">
                {issue.professorName} · {issue.timeAgo ?? 'recently'}
              </p>
            </div>

            {/* Status Badge */}
            <motion.div
              layout
              className={cn(
                "flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium",
                statusConfig[localStatus].bg,
                statusConfig[localStatus].color
              )}
            >
              <StatusIcon className="w-3.5 h-3.5" />
              {statusConfig[localStatus].label}
            </motion.div>
          </div>

          {/* Tags */}
          <div className="flex items-center gap-2 mt-2">
            <Badge className={cn("text-xs", severity.bg, severity.text, severity.border)}>
              {issue.severity.toUpperCase()}
            </Badge>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <MessageSquare className="w-3 h-3" />
              {issue.replies.length}
            </div>
          </div>

          {/* Status Timeline */}
          <StatusTimeline status={localStatus} />
        </div>
      </div>

      {/* Expanded Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="pt-4 mt-4 border-t border-border">
              <ReplyThread replies={issue.replies} />

              {/* Actions */}
              <div className="flex items-center gap-2 mt-4">
                <Button
                  size="sm"
                  variant={localStatus === 'resolved' ? 'outline' : 'default'}
                  onClick={handleResolve}
                  className="rounded-xl"
                >
                  {localStatus === 'resolved' ? (
                    <>
                      <RotateCcw className="w-4 h-4 mr-1" />
                      Reopen
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4 mr-1" />
                      Mark Resolved
                    </>
                  )}
                </Button>
                <Button size="sm" variant="outline" className="rounded-xl">
                  <Paperclip className="w-4 h-4 mr-1" />
                  Attach
                </Button>
                <Button size="sm" variant="outline" className="rounded-xl">
                  <MessageSquare className="w-4 h-4 mr-1" />
                  Reply
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Expand Toggle */}
      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-center gap-1 pt-3 mt-3 border-t border-border/50 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        {isExpanded ? (
          <>
            <ChevronUp className="w-4 h-4" />
            Collapse
          </>
        ) : (
          <>
            <ChevronDown className="w-4 h-4" />
            View Thread
          </>
        )}
      </motion.button>
    </motion.div>
  )
}

export function IssueTracker() {
  const openCount = mockIssues.filter(i => i.status === 'open' || i.status === 'reopened').length

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-card-foreground flex items-center gap-2">
            <GitBranch className="w-5 h-5 text-primary" />
            Feedback Loop
          </h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            GitHub-style professor feedback tracking
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs text-warning border-warning/30">
            {openCount} Open
          </Badge>
          <Badge variant="outline" className="text-xs">
            {mockIssues.length} Total
          </Badge>
        </div>
      </div>

      {/* Issues List */}
      <div className="space-y-3">
        <AnimatePresence>
          {mockIssues.map((issue) => (
            <IssueCard key={issue.id} issue={issue} />
          ))}
        </AnimatePresence>
      </div>
    </div>
  )
}
