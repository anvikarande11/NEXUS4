'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Settings, 
  Moon, 
  Bell, 
  User, 
  Palette, 
  Volume2,
  Shield,
  HelpCircle,
  ExternalLink
} from 'lucide-react'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface SettingItemProps {
  icon: typeof Settings
  title: string
  description: string
  children?: React.ReactNode
}

function SettingItem({ icon: Icon, title, description, children }: SettingItemProps) {
  return (
    <div className="flex items-center justify-between py-4 border-b border-border last:border-0">
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center shrink-0">
          <Icon className="w-4 h-4 text-muted-foreground" />
        </div>
        <div>
          <h4 className="text-sm font-medium text-foreground">{title}</h4>
          <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
        </div>
      </div>
      {children}
    </div>
  )
}

export function SettingsView() {
  const [notifications, setNotifications] = useState(true)
  const [sounds, setSounds] = useState(true)
  const [focusReminders, setFocusReminders] = useState(true)

  return (
    <div className="h-full flex flex-col overflow-auto">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
          <Settings className="w-5 h-5 text-primary" />
          Settings
        </h2>
        <p className="text-sm text-muted-foreground mt-0.5">
          Customize your Nexus-Uni experience
        </p>
      </div>

      {/* Settings Sections */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Appearance */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card/50 border border-border rounded-2xl p-5"
        >
          <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
            <Palette className="w-4 h-4 text-primary" />
            Appearance
          </h3>
          <div className="space-y-1">
            <SettingItem
              icon={Moon}
              title="Dark Mode"
              description="Always enabled for optimal focus"
            >
              <Switch checked disabled />
            </SettingItem>
          </div>
        </motion.div>

        {/* Notifications */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-card/50 border border-border rounded-2xl p-5"
        >
          <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
            <Bell className="w-4 h-4 text-primary" />
            Notifications
          </h3>
          <div className="space-y-1">
            <SettingItem
              icon={Bell}
              title="Push Notifications"
              description="Receive alerts for deadlines and updates"
            >
              <Switch checked={notifications} onCheckedChange={setNotifications} />
            </SettingItem>
            <SettingItem
              icon={Volume2}
              title="Sound Effects"
              description="Play sounds for task completion"
            >
              <Switch checked={sounds} onCheckedChange={setSounds} />
            </SettingItem>
          </div>
        </motion.div>

        {/* Focus */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-card/50 border border-border rounded-2xl p-5"
        >
          <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
            <Shield className="w-4 h-4 text-primary" />
            Focus & Privacy
          </h3>
          <div className="space-y-1">
            <SettingItem
              icon={Bell}
              title="Focus Reminders"
              description="Gentle nudges to stay on track"
            >
              <Switch checked={focusReminders} onCheckedChange={setFocusReminders} />
            </SettingItem>
          </div>
        </motion.div>

        {/* Account */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-card/50 border border-border rounded-2xl p-5"
        >
          <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
            <User className="w-4 h-4 text-primary" />
            Account
          </h3>
          <div className="flex items-center gap-4 py-3">
            <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
              <span className="text-lg font-bold text-primary">JS</span>
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">John Student</p>
              <p className="text-xs text-muted-foreground">john.student@university.edu</p>
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <Button variant="outline" size="sm" className="text-xs">
              Edit Profile
            </Button>
            <Button variant="outline" size="sm" className="text-xs text-destructive hover:text-destructive">
              Sign Out
            </Button>
          </div>
        </motion.div>
      </div>

      {/* Help Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="mt-6 bg-primary/5 border border-primary/20 rounded-2xl p-5"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <HelpCircle className="w-5 h-5 text-primary" />
            <div>
              <h4 className="text-sm font-medium text-foreground">Need Help?</h4>
              <p className="text-xs text-muted-foreground">Check out our documentation and guides</p>
            </div>
          </div>
          <Button variant="outline" size="sm" className="gap-2">
            <ExternalLink className="w-3 h-3" />
            View Docs
          </Button>
        </div>
      </motion.div>

      {/* Version Info */}
      <div className="mt-6 text-center text-xs text-muted-foreground">
        Nexus-Uni v1.0.0 — Made with dedication for students
      </div>
    </div>
  )
}
