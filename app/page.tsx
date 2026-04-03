'use client'

import React, { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTheme } from 'next-themes'
import { cn } from '@/lib/utils'
import { useDashboardStore, ViewType } from '@/lib/store'

// Components
import { Sidebar } from '@/components/dashboard/sidebar'
import { CommandPalette } from '@/components/dashboard/command-palette'
import { DeepFocusMode } from '@/components/dashboard/deep-focus-mode'
import { TaskGravityEngine } from '@/components/dashboard/task-gravity-engine'
import { IssueTracker } from '@/components/dashboard/issue-tracker'
import { ResourceShelf } from '@/components/dashboard/resource-shelf'
import { KnowledgeGraph } from '@/components/dashboard/knowledge-graph'
import { SubjectHealth } from '@/components/dashboard/subject-health'
import { FunkyCalendar } from '@/components/dashboard/funky-calendar'
import { PuzzleGames } from '@/components/dashboard/puzzle-games'
import { SettingsView } from '@/components/dashboard/settings-view'
import { ClassPath } from '@/components/dashboard/class-path'
import { SplitScreenLectureModal } from '@/components/dashboard/split-screen-lecture-modal'
import { BlackoutMode } from '@/components/dashboard/blackout-mode'
import { NexusChat } from '@/components/dashboard/nexus-chat'
import { UploadResourceModal } from '@/components/dashboard/upload-resource-modal'
import { PeerStudyCircle } from '@/components/dashboard/peer-study-circle'
import { Search, Command, Flame, User, Moon, Sun, Upload, MessageCircle, Users } from 'lucide-react'
import { mockClassPaths } from '@/lib/mock-data'

// Animation variants
const viewVariants = {
  initial: { opacity: 0, scale: 0.98 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.98 }
}

// View Components
function DashboardView() {
  return (
    <div className="h-full grid grid-cols-1 xl:grid-cols-3 gap-4 overflow-hidden">
      {/* Left Column - Tasks & Issues */}
      <div className="xl:col-span-2 flex flex-col gap-4 overflow-hidden">
        <div className="flex-1 min-h-0 bg-card/50 rounded-2xl border border-border p-4 overflow-auto">
          <TaskGravityEngine />
        </div>
        <div className="flex-1 min-h-0 bg-card/50 rounded-2xl border border-border p-4 overflow-auto">
          <IssueTracker />
        </div>
      </div>

      {/* Right Column - Quick Stats */}
      <div className="flex flex-col gap-4 overflow-hidden">
        <div className="flex-1 min-h-0 bg-card/50 rounded-2xl border border-border p-4 overflow-auto">
          <KnowledgeGraph />
        </div>
        <div className="flex-1 min-h-0 bg-card/50 rounded-2xl border border-border p-4 overflow-auto">
          <SubjectHealth />
        </div>
      </div>
    </div>
  )
}

function TasksView() {
  return (
    <div className="h-full bg-card/50 rounded-2xl border border-border p-6 overflow-auto">
      <TaskGravityEngine />
    </div>
  )
}

function ResourcesView() {
  return (
    <div className="h-full bg-card/50 rounded-2xl border border-border p-6 overflow-auto">
      <ResourceShelf />
    </div>
  )
}

function KnowledgeGraphView() {
  return (
    <div className="h-full bg-card/50 rounded-2xl border border-border p-6 overflow-auto">
      <KnowledgeGraph />
    </div>
  )
}

function CalendarView() {
  return (
    <div className="h-full bg-card/50 rounded-2xl border border-border p-6 overflow-auto">
      <FunkyCalendar />
    </div>
  )
}

function SubjectHealthView() {
  return (
    <div className="h-full bg-card/50 rounded-2xl border border-border p-6 overflow-auto">
      <SubjectHealth />
    </div>
  )
}

function ClassPathView() {
  return (
    <div className="h-full bg-card/50 rounded-2xl border border-border p-6 overflow-auto">
      <ClassPath />
    </div>
  )
}

function GamesView() {
  return (
    <div className="h-full bg-card/50 rounded-2xl border border-border p-6 overflow-auto">
      <PuzzleGames />
    </div>
  )
}

function SettingsViewWrapper() {
  return (
    <div className="h-full bg-card/50 rounded-2xl border border-border p-6 overflow-auto">
      <SettingsView />
    </div>
  )
}

const viewComponents: Record<ViewType, React.ComponentType> = {
  'dashboard': DashboardView,
  'tasks': TasksView,
  'resources': ResourcesView,
  'knowledge-graph': KnowledgeGraphView,
  'calendar': CalendarView,
  'subject-health': SubjectHealthView,
  'class-path': ClassPathView,
  'games': GamesView,
  'settings': SettingsViewWrapper,
}

// Top Bar Component
function TopBar() {
  const { toggleCommandPalette, toggleBlackoutMode, toggleChat, openUpload, togglePeerStudy } = useDashboardStore()
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <div className="h-14 flex items-center justify-between px-4 border-b border-border glass-panel">
      {/* Search / Command Bar */}
      <button
        onClick={toggleCommandPalette}
        className="flex items-center gap-3 px-4 py-2 bg-muted/50 rounded-xl border border-border hover:border-primary/30 transition-colors min-w-[280px] light:bg-muted/70 light:border-muted light:hover:bg-muted light:text-foreground"
      >
        <Search className="w-4 h-4 text-muted-foreground light:text-muted-foreground" />
        <span className="text-sm text-muted-foreground light:text-foreground">Search or type command...</span>
        <div className="ml-auto flex items-center gap-1 px-1.5 py-0.5 bg-muted rounded text-xs text-muted-foreground light:bg-primary/10 light:text-primary">
          <Command className="w-3 h-3" />
          <span>K</span>
        </div>
      </button>

      {/* Right Side */}
      <div className="flex items-center gap-2">
        {/* Streak */}
        <div className="flex items-center gap-2 px-3 py-1.5 bg-warning/10 border border-warning/20 rounded-xl light:bg-warning/15 light:border-warning/30">
          <Flame className="w-4 h-4 text-warning" />
          <span className="text-sm font-medium text-warning">7 day streak</span>
        </div>

        {/* Divider */}
        <div className="w-px h-6 bg-border light:bg-border/50" />

        {/* Upload Button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={openUpload}
          className="px-3 py-2 rounded-lg hover:bg-muted transition-all text-muted-foreground hover:text-foreground light:hover:bg-primary/10 light:hover:text-primary light:text-muted-foreground flex items-center gap-2 text-sm font-medium"
          title="Upload resource"
        >
          <Upload className="w-4 h-4" />
          <span className="hidden sm:inline text-xs">Upload</span>
        </motion.button>

        {/* Chat Button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={toggleChat}
          className="px-3 py-2 rounded-lg hover:bg-muted transition-all text-muted-foreground hover:text-foreground light:hover:bg-primary/10 light:hover:text-primary light:text-muted-foreground flex items-center gap-2 text-sm font-medium"
          title="Nexus AI Chat"
        >
          <MessageCircle className="w-4 h-4" />
          <span className="hidden sm:inline text-xs">Nexus AI</span>
        </motion.button>

        {/* Peer Study Button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={togglePeerStudy}
          className="px-3 py-2 rounded-lg hover:bg-muted transition-all text-muted-foreground hover:text-foreground light:hover:bg-primary/10 light:hover:text-primary light:text-muted-foreground flex items-center gap-2 text-sm font-medium"
          title="Peer Study Circle"
        >
          <Users className="w-4 h-4" />
          <span className="hidden sm:inline text-xs">Peers</span>
        </motion.button>

        {/* Divider */}
        <div className="w-px h-6 bg-border light:bg-border/50" />

        {/* Theme Toggle */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="p-2 rounded-lg hover:bg-muted transition-all text-muted-foreground hover:text-foreground light:hover:bg-muted/50 relative"
          title="Toggle theme"
          suppressHydrationWarning
        >
          <Sun 
            className={`w-4 h-4 ${
              mounted && theme === 'light' ? 'opacity-100' : 'opacity-0 pointer-events-none'
            } transition-opacity duration-300`}
            suppressHydrationWarning
          />
          <Moon 
            className={`w-4 h-4 absolute top-2 left-2 ${
              mounted && theme === 'dark' ? 'opacity-100' : 'opacity-0 pointer-events-none'
            } transition-opacity duration-300`}
            suppressHydrationWarning
          />
        </motion.button>

        {/* Profile */}
        <button
          onClick={toggleBlackoutMode}
          className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center hover:bg-primary/30 transition-all light:bg-primary/15 light:hover:bg-primary/25"
          title="Focus mode"
        >
          <User className="w-4 h-4 text-primary" />
        </button>
      </div>
    </div>
  )
}

export default function Dashboard() {
  const { currentView, isDeepFocusMode, setCurrentView } = useDashboardStore()

  // Initialize classPaths from mock data on mount
  useEffect(() => {
    const store = useDashboardStore.getState()
    if (store.classPaths.length === 0) {
      // Manually initialize classPaths by updating store state
      useDashboardStore.setState({ classPaths: mockClassPaths })
    }
  }, [])

  // Keyboard shortcuts for view navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isDeepFocusMode) return
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return
      
      const viewMap: Record<string, ViewType> = {
        '1': 'dashboard',
        '2': 'tasks',
        '3': 'resources',
        '4': 'knowledge-graph',
        '5': 'calendar',
        '6': 'subject-health',
        '7': 'games',
        ',': 'settings',
      }

      if (viewMap[e.key]) {
        e.preventDefault()
        setCurrentView(viewMap[e.key])
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isDeepFocusMode, setCurrentView])

  const ViewComponent = viewComponents[currentView]

  return (
    <>
      {/* Deep Focus Mode Overlay */}
      <AnimatePresence>
        {isDeepFocusMode && <DeepFocusMode />}
      </AnimatePresence>

      {/* Main Cockpit */}
      <div className={cn(
        "h-screen flex overflow-hidden bg-background",
        isDeepFocusMode && "invisible"
      )}>
        {/* Sidebar */}
        <Sidebar />

        {/* Main Content */}
        <div className="flex-1 ml-[72px] flex flex-col overflow-hidden">
          {/* Top Bar */}
          <TopBar />

          {/* View Container */}
          <main className="flex-1 p-4 overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentView}
                variants={viewVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={{ duration: 0.2, ease: 'easeOut' }}
                className="h-full"
              >
                <ViewComponent />
              </motion.div>
            </AnimatePresence>
          </main>
        </div>
      </div>

      {/* Command Palette */}
      <CommandPalette />

      {/* Split Screen Lecture Modal */}
      <SplitScreenLectureModal />

      {/* Blackout Mode */}
      <BlackoutMode />

      {/* Nexus AI Chat */}
      <NexusChat />

      {/* Upload Resource Modal */}
      <UploadResourceModal />

      {/* Peer Study Circle */}
      <PeerStudyCircle />

      {/* Decorative Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-accent/5 rounded-full blur-3xl" />
      </div>
    </>
  )
}
