'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Play, Pause, SkipForward, SkipBack, Volume2, VolumeX, Music, Link, X, Minimize2, Maximize2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useDashboardStore } from '@/lib/store'

interface Track {
  id: string
  title: string
  youtubeId: string
}

// Extract YouTube video ID from URL
function extractYouTubeId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /^([a-zA-Z0-9_-]{11})$/
  ]
  
  for (const pattern of patterns) {
    const match = url.match(pattern)
    if (match) return match[1]
  }
  return null
}

// Default lo-fi/study playlists
const DEFAULT_TRACKS: Track[] = [
  { id: '1', title: 'Lofi Girl - beats to relax/study to', youtubeId: 'jfKfPfyJRdk' },
  { id: '2', title: 'Chillhop Radio - jazzy & lofi', youtubeId: '5yx6BWlEVcY' },
  { id: '3', title: 'Coffee Shop Ambience', youtubeId: 'h2zkV-l_TbY' },
]

export function MusicPod() {
  const { isMusicPodOpen, toggleMusicPod } = useDashboardStore()
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [inputUrl, setInputUrl] = useState('')
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0)
  const [playlist, setPlaylist] = useState<Track[]>(DEFAULT_TRACKS)
  const iframeRef = useRef<HTMLIFrameElement>(null)

  const currentTrack = playlist[currentTrackIndex]

  // Control the YouTube player via postMessage API
  const sendCommand = (command: string, args?: any) => {
    if (iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.postMessage(
        JSON.stringify({ event: 'command', func: command, args: args || [] }),
        '*'
      )
    }
  }

  useEffect(() => {
    if (isPlaying) {
      sendCommand('playVideo')
    } else {
      sendCommand('pauseVideo')
    }
  }, [isPlaying, currentTrackIndex])

  useEffect(() => {
    sendCommand(isMuted ? 'mute' : 'unMute')
  }, [isMuted])

  const addTrack = () => {
    if (!inputUrl.trim()) return
    
    const youtubeId = extractYouTubeId(inputUrl.trim())
    if (!youtubeId) {
      alert('Invalid YouTube URL. Please enter a valid YouTube link.')
      return
    }
    
    const newTrack: Track = {
      id: crypto.randomUUID(),
      title: 'Custom Track',
      youtubeId
    }
    
    setPlaylist([...playlist, newTrack])
    setInputUrl('')
  }

  const removeTrack = (id: string) => {
    if (playlist.length <= 1) return
    const newPlaylist = playlist.filter(t => t.id !== id)
    setPlaylist(newPlaylist)
    if (currentTrack?.id === id) {
      setCurrentTrackIndex(0)
    }
  }

  const playTrack = (index: number) => {
    setCurrentTrackIndex(index)
    setIsPlaying(true)
  }

  const skipNext = () => {
    if (playlist.length === 0) return
    const nextIndex = (currentTrackIndex + 1) % playlist.length
    setCurrentTrackIndex(nextIndex)
    setIsPlaying(true)
  }

  const skipPrev = () => {
    if (playlist.length === 0) return
    const prevIndex = currentTrackIndex === 0 ? playlist.length - 1 : currentTrackIndex - 1
    setCurrentTrackIndex(prevIndex)
    setIsPlaying(true)
  }

  if (!isMusicPodOpen) return null

  return (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 100, opacity: 0 }}
      transition={{ type: 'spring', damping: 20 }}
      className="fixed bottom-4 left-20 z-40"
    >
      <motion.div
        layout
        className={cn(
          "relative overflow-hidden rounded-2xl border-2 transition-all duration-300",
          "bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900",
          "border-primary/40 shadow-lg",
          isMinimized ? "w-64" : "w-80"
        )}
        style={{
          boxShadow: `0 0 20px rgba(34, 197, 94, 0.2), 0 0 40px rgba(34, 197, 94, 0.1)`
        }}
      >
        {/* Neon border effect */}
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-primary/20 via-accent/10 to-primary/20 opacity-50" />
        
        {/* Inner glow line */}
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-primary/60 to-transparent" />

        <div className="relative p-3">
          {/* Header with close button */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span className="text-xs font-medium text-primary">Music Pod</span>
            </div>
            <div className="flex items-center gap-1">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsMinimized(!isMinimized)}
                className="p-1 rounded hover:bg-muted/30 transition-colors"
              >
                {isMinimized ? (
                  <Maximize2 className="w-3 h-3 text-muted-foreground" />
                ) : (
                  <Minimize2 className="w-3 h-3 text-muted-foreground" />
                )}
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={toggleMusicPod}
                className="p-1 rounded hover:bg-destructive/20 transition-colors"
              >
                <X className="w-3 h-3 text-muted-foreground hover:text-destructive" />
              </motion.button>
            </div>
          </div>

          {/* Hidden YouTube Player */}
          <div className="hidden">
            <iframe
              ref={iframeRef}
              src={`https://www.youtube.com/embed/${currentTrack?.youtubeId}?enablejsapi=1&autoplay=${isPlaying ? 1 : 0}&mute=${isMuted ? 1 : 0}&loop=1&playlist=${currentTrack?.youtubeId}`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              className="w-1 h-1"
            />
          </div>

          {/* Main display area */}
          <div className="flex items-center gap-3 mb-3">
            {/* Album art / visualizer */}
            <motion.div
              animate={{ rotate: isPlaying ? 360 : 0 }}
              transition={{ duration: 3, repeat: isPlaying ? Infinity : 0, ease: 'linear' }}
              className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/30 to-accent/30 flex items-center justify-center border border-primary/30 relative"
            >
              <Music className="w-5 h-5 text-primary" />
              {isPlaying && (
                <div className="absolute inset-0 rounded-full border-2 border-primary/50 animate-ping" />
              )}
            </motion.div>

            {/* Track info */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">
                {currentTrack?.title || 'No track selected'}
              </p>
              <p className="text-xs text-muted-foreground">
                {isPlaying ? 'Now Playing' : 'Paused'}
              </p>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center gap-2">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={skipPrev}
              className="p-2 rounded-full bg-muted/30 hover:bg-muted/50 transition-colors text-muted-foreground hover:text-foreground"
            >
              <SkipBack className="w-4 h-4" />
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsPlaying(!isPlaying)}
              className={cn(
                "p-3 rounded-full transition-all",
                isPlaying 
                  ? "bg-primary text-primary-foreground shadow-lg" 
                  : "bg-primary/20 text-primary hover:bg-primary/30"
              )}
              style={isPlaying ? { boxShadow: '0 0 20px rgba(34, 197, 94, 0.5)' } : {}}
            >
              {isPlaying ? (
                <Pause className="w-5 h-5" />
              ) : (
                <Play className="w-5 h-5 ml-0.5" />
              )}
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={skipNext}
              className="p-2 rounded-full bg-muted/30 hover:bg-muted/50 transition-colors text-muted-foreground hover:text-foreground"
            >
              <SkipForward className="w-4 h-4" />
            </motion.button>

            <div className="w-px h-6 bg-border/50 mx-1" />

            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setIsMuted(!isMuted)}
              className="p-2 rounded-full bg-muted/30 hover:bg-muted/50 transition-colors text-muted-foreground hover:text-foreground"
            >
              {isMuted ? (
                <VolumeX className="w-4 h-4" />
              ) : (
                <Volume2 className="w-4 h-4" />
              )}
            </motion.button>
          </div>

          {/* Expanded content */}
          <AnimatePresence>
            {!isMinimized && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="pt-3 mt-3 border-t border-border/30">
                  {/* Add track input */}
                  <div className="flex gap-2 mb-3">
                    <div className="flex-1 relative">
                      <Link className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                      <input
                        type="text"
                        value={inputUrl}
                        onChange={(e) => setInputUrl(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && addTrack()}
                        placeholder="Paste YouTube URL..."
                        className="w-full pl-8 pr-3 py-1.5 bg-muted/30 border border-border/50 rounded-lg text-xs placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/50"
                      />
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={addTrack}
                      disabled={!inputUrl.trim()}
                      className="px-3 py-1.5 rounded-lg bg-primary/20 text-primary text-xs font-medium hover:bg-primary/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                      Add
                    </motion.button>
                  </div>

                  {/* Playlist */}
                  <div className="max-h-32 overflow-y-auto space-y-1.5 scrollbar-thin scrollbar-thumb-primary/20">
                    {playlist.map((track, index) => (
                      <motion.div
                        key={track.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className={cn(
                          "flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-all group",
                          currentTrackIndex === index
                            ? "bg-primary/20 border border-primary/30" 
                            : "bg-muted/20 hover:bg-muted/30"
                        )}
                        onClick={() => playTrack(index)}
                      >
                        <div className="w-6 h-6 rounded-full bg-muted/50 flex items-center justify-center">
                          {currentTrackIndex === index && isPlaying ? (
                            <motion.div
                              animate={{ scale: [1, 1.2, 1] }}
                              transition={{ duration: 0.5, repeat: Infinity }}
                              className="w-2 h-2 rounded-full bg-primary"
                            />
                          ) : (
                            <Music className="w-3 h-3 text-muted-foreground" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-foreground truncate">{track.title}</p>
                        </div>
                        {playlist.length > 1 && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              removeTrack(track.id)
                            }}
                            className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-destructive/20 transition-all"
                          >
                            <X className="w-3 h-3 text-destructive" />
                          </button>
                        )}
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Bottom glow line */}
        <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-accent/40 to-transparent" />
      </motion.div>
    </motion.div>
  )
}
