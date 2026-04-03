'use client'

import { motion } from 'framer-motion'
import { 
  LayoutDashboard, 
  Target, 
  FolderOpen, 
  Share2, 
  Calendar, 
  Activity, 
  Settings,
  Gamepad2,
  Focus,
  BookOpen,
  Music
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useDashboardStore, ViewType } from '@/lib/store'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

const navItems: { icon: typeof LayoutDashboard; label: string; view: ViewType; shortcut: string }[] = [
  { icon: LayoutDashboard, label: 'Dashboard', view: 'dashboard', shortcut: '1' },
  { icon: Target, label: 'Task Gravity', view: 'tasks', shortcut: '2' },
  { icon: FolderOpen, label: 'Resources', view: 'resources', shortcut: '3' },
  { icon: Share2, label: 'Knowledge Graph', view: 'knowledge-graph', shortcut: '4' },
  { icon: Calendar, label: 'Funky Calendar', view: 'calendar', shortcut: '5' },
  { icon: Activity, label: 'Subject Health', view: 'subject-health', shortcut: '6' },
  { icon: BookOpen, label: 'Class Path', view: 'class-path', shortcut: '8' },
  { icon: Gamepad2, label: 'Puzzle Games', view: 'games', shortcut: '7' },
  { icon: Settings, label: 'Settings', view: 'settings', shortcut: ',' },
]

export function Sidebar() {
  const { currentView, setCurrentView, toggleDeepFocusMode, isDeepFocusMode, toggleMusicPod, isMusicPodOpen } = useDashboardStore()

  return (
    <motion.aside
      initial={{ x: -72 }}
      animate={{ x: 0 }}
      className="fixed left-0 top-0 h-screen w-[72px] bg-sidebar border-r border-sidebar-border z-50 flex flex-col"
    >
      {/* Logo */}
      <div className="h-14 flex items-center justify-center border-b border-sidebar-border">
        <div className="w-9 h-9 rounded-xl bg-primary/20 flex items-center justify-center">
          <span className="text-primary font-bold text-lg">N</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-3 px-2 flex flex-col gap-1">
        <TooltipProvider delayDuration={0}>
          {navItems.map((item) => (
            <Tooltip key={item.view}>
              <TooltipTrigger asChild>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setCurrentView(item.view)}
                  className={cn(
                    "w-12 h-12 mx-auto flex items-center justify-center rounded-xl transition-all duration-200 relative",
                    currentView === item.view
                      ? "bg-primary/20 text-primary" 
                      : "text-sidebar-foreground/60 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                  )}
                >
                  {currentView === item.view && (
                    <motion.div
                      layoutId="navIndicator"
                      className="absolute inset-0 rounded-xl bg-primary/10 border border-primary/30"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.5 }}
                    />
                  )}
                  <item.icon className="w-5 h-5 relative z-10" />
                </motion.button>
              </TooltipTrigger>
              <TooltipContent side="right" sideOffset={8}>
                <div className="flex items-center gap-2">
                  <span>{item.label}</span>
                  <kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-muted rounded">{item.shortcut}</kbd>
                </div>
              </TooltipContent>
            </Tooltip>
          ))}
        </TooltipProvider>
      </nav>

      {/* Music & Focus Buttons */}
      <div className="p-2 border-t border-sidebar-border flex flex-col gap-2">
        {/* Music Button */}
        <TooltipProvider delayDuration={0}>
          <Tooltip>
            <TooltipTrigger asChild>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={toggleMusicPod}
                className={cn(
                  "w-12 h-12 mx-auto flex items-center justify-center rounded-xl transition-all duration-200",
                  isMusicPodOpen
                    ? "bg-primary/20 text-primary glow-primary"
                    : "bg-sidebar-accent/50 text-sidebar-foreground/70 hover:bg-sidebar-accent"
                )}
              >
                <Music className="w-5 h-5" />
              </motion.button>
            </TooltipTrigger>
            <TooltipContent side="right" sideOffset={8}>
              <span>Music Pod</span>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        {/* Focus Mode Button */}
        <TooltipProvider delayDuration={0}>
          <Tooltip>
            <TooltipTrigger asChild>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={toggleDeepFocusMode}
                className={cn(
                  "w-12 h-12 mx-auto flex items-center justify-center rounded-xl transition-all duration-200",
                  isDeepFocusMode
                    ? "bg-accent text-accent-foreground glow-accent"
                    : "bg-sidebar-accent/50 text-sidebar-foreground/70 hover:bg-sidebar-accent"
                )}
              >
                <Focus className="w-5 h-5" />
              </motion.button>
            </TooltipTrigger>
            <TooltipContent side="right" sideOffset={8}>
              <span>Start Focus Session</span>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </motion.aside>
  )
}
