'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Search, 
  FileText, 
  CheckSquare, 
  FolderOpen, 
  Calendar,
  Settings,
  Plus,
  ArrowRight,
  Command,
  Hash,
  Clock,
  LayoutDashboard,
  Target,
  Share2,
  Activity,
  Gamepad2,
  Focus
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useDashboardStore, ViewType } from '@/lib/store'
import { mockTasks, mockResources } from '@/lib/mock-data'

type CommandItem = {
  icon: typeof LayoutDashboard
  label: string
  shortcut?: string
  meta?: string
  action?: () => void
}

export function CommandPalette() {
  const { 
    isCommandPaletteOpen, 
    toggleCommandPalette, 
    setCurrentView,
    toggleDeepFocusMode
  } = useDashboardStore()
  const [query, setQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)

  const commandGroups: { label: string; commands: CommandItem[] }[] = [
    {
      label: 'Quick Actions',
      commands: [
        { 
          icon: Focus, 
          label: 'Start Focus Session', 
          shortcut: '⌘⇧F',
          action: () => { toggleDeepFocusMode(); toggleCommandPalette(); }
        },
        { icon: Plus, label: 'Add New Task', shortcut: '⌘N' },
        { icon: FileText, label: 'New Note', shortcut: '⌘⇧N' },
      ]
    },
    {
      label: 'Switch View',
      commands: [
        { 
          icon: LayoutDashboard, 
          label: 'Switch to Dashboard', 
          shortcut: '1',
          action: () => { setCurrentView('dashboard'); toggleCommandPalette(); }
        },
        { 
          icon: Target, 
          label: 'Switch to Task Gravity', 
          shortcut: '2',
          action: () => { setCurrentView('tasks'); toggleCommandPalette(); }
        },
        { 
          icon: FolderOpen, 
          label: 'Switch to Resources', 
          shortcut: '3',
          action: () => { setCurrentView('resources'); toggleCommandPalette(); }
        },
        { 
          icon: Share2, 
          label: 'Switch to Knowledge Graph', 
          shortcut: '4',
          action: () => { setCurrentView('knowledge-graph'); toggleCommandPalette(); }
        },
        { 
          icon: Calendar, 
          label: 'Switch to Calendar', 
          shortcut: '5',
          action: () => { setCurrentView('calendar'); toggleCommandPalette(); }
        },
        { 
          icon: Activity, 
          label: 'Switch to Subject Health', 
          shortcut: '6',
          action: () => { setCurrentView('subject-health'); toggleCommandPalette(); }
        },
        { 
          icon: Gamepad2, 
          label: 'Switch to Puzzle Games', 
          shortcut: '7',
          action: () => { setCurrentView('games'); toggleCommandPalette(); }
        },
        { 
          icon: Settings, 
          label: 'Switch to Settings', 
          shortcut: ',',
          action: () => { setCurrentView('settings'); toggleCommandPalette(); }
        },
      ]
    },
    {
      label: 'Recent Tasks',
      commands: mockTasks.slice(0, 3).map(task => ({
        icon: Hash,
        label: task.title,
        meta: task.subject
      }))
    },
    {
      label: 'Recent Resources',
      commands: mockResources.slice(0, 3).map(resource => ({
        icon: FileText,
        label: resource.title,
        meta: resource.subject
      }))
    }
  ]

  // Filter commands based on query
  const filteredGroups = commandGroups.map(group => ({
    ...group,
    commands: group.commands.filter(cmd => 
      cmd.label.toLowerCase().includes(query.toLowerCase())
    )
  })).filter(group => group.commands.length > 0)

  // Get flat list for keyboard navigation
  const flatCommands = filteredGroups.flatMap(g => g.commands)

  const executeCommand = (command: CommandItem) => {
    if (command.action) {
      command.action()
    } else {
      toggleCommandPalette()
    }
  }

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        toggleCommandPalette()
      }

      if (!isCommandPaletteOpen) return

      if (e.key === 'Escape') {
        toggleCommandPalette()
      }

      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setSelectedIndex(prev => Math.min(prev + 1, flatCommands.length - 1))
      }

      if (e.key === 'ArrowUp') {
        e.preventDefault()
        setSelectedIndex(prev => Math.max(prev - 1, 0))
      }

      if (e.key === 'Enter' && flatCommands[selectedIndex]) {
        e.preventDefault()
        executeCommand(flatCommands[selectedIndex])
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isCommandPaletteOpen, toggleCommandPalette, flatCommands, selectedIndex])

  // Reset selection when query changes
  useEffect(() => {
    setSelectedIndex(0)
  }, [query])

  // Reset when opening
  useEffect(() => {
    if (isCommandPaletteOpen) {
      setQuery('')
      setSelectedIndex(0)
    }
  }, [isCommandPaletteOpen])

  return (
    <AnimatePresence>
      {isCommandPaletteOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-[60]"
            onClick={toggleCommandPalette}
          />

          {/* Palette */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed left-1/2 top-[15%] -translate-x-1/2 w-full max-w-xl z-[60]"
          >
            <div className="bg-card border border-border rounded-2xl shadow-2xl overflow-hidden">
              {/* Search Input */}
              <div className="flex items-center gap-3 p-4 border-b border-border">
                <Search className="w-5 h-5 text-muted-foreground shrink-0" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Type a command or search..."
                  className="flex-1 bg-transparent text-card-foreground placeholder:text-muted-foreground focus:outline-none"
                  autoFocus
                />
                <div className="flex items-center gap-1 px-2 py-1 bg-muted rounded-lg">
                  <Command className="w-3 h-3 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground font-mono">K</span>
                </div>
              </div>

              {/* Command List */}
              <div className="max-h-[400px] overflow-auto p-2">
                {filteredGroups.map((group, groupIndex) => {
                  const groupStartIndex = filteredGroups
                    .slice(0, groupIndex)
                    .reduce((acc, g) => acc + g.commands.length, 0)

                  return (
                    <div key={group.label} className="mb-4 last:mb-0">
                      <div className="px-3 py-2 text-xs font-medium text-muted-foreground">
                        {group.label}
                      </div>
                      <div className="space-y-1">
                        {group.commands.map((command, cmdIndex) => {
                          const flatIndex = groupStartIndex + cmdIndex
                          const isSelected = flatIndex === selectedIndex

                          return (
                            <motion.button
                              key={command.label}
                              whileHover={{ x: 4 }}
                              onClick={() => executeCommand(command)}
                              onMouseEnter={() => setSelectedIndex(flatIndex)}
                              className={cn(
                                "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors",
                                isSelected ? "bg-primary/10 text-primary" : "hover:bg-muted"
                              )}
                            >
                              <command.icon className={cn(
                                "w-4 h-4 shrink-0",
                                isSelected ? "text-primary" : "text-muted-foreground"
                              )} />
                              <span className="flex-1 text-left text-sm">
                                {command.label}
                              </span>
                              {command.meta && (
                                <span className="text-xs text-muted-foreground">
                                  {command.meta}
                                </span>
                              )}
                              {command.shortcut && (
                                <span className="text-xs text-muted-foreground font-mono px-1.5 py-0.5 bg-muted rounded">
                                  {command.shortcut}
                                </span>
                              )}
                              {isSelected && (
                                <ArrowRight className="w-4 h-4 text-primary" />
                              )}
                            </motion.button>
                          )
                        })}
                      </div>
                    </div>
                  )
                })}

                {filteredGroups.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <Search className="w-10 h-10 text-muted-foreground/50 mb-3" />
                    <p className="text-sm text-muted-foreground">No results found</p>
                    <p className="text-xs text-muted-foreground mt-1">Try a different search term</p>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between p-3 border-t border-border bg-muted/30">
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <kbd className="px-1.5 py-0.5 bg-background rounded text-[10px]">↑↓</kbd>
                    Navigate
                  </span>
                  <span className="flex items-center gap-1">
                    <kbd className="px-1.5 py-0.5 bg-background rounded text-[10px]">↵</kbd>
                    Select
                  </span>
                  <span className="flex items-center gap-1">
                    <kbd className="px-1.5 py-0.5 bg-background rounded text-[10px]">esc</kbd>
                    Close
                  </span>
                </div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="w-3 h-3" />
                  <span>Recently used</span>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
