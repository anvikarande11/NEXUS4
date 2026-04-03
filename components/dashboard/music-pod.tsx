'use client'

import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Play, Pause, SkipForward, SkipBack, Volume2, VolumeX, Music, Link, X, ChevronUp, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Track {
  id: string
  title: string
  artist: string
  youtubeUrl: string
}

export function MusicPod() {
  const [isExpanded, setIsExpanded] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [inputUrl, setInputUrl] = useState('')
  const [currentTrack, setCurrentTrack] = useState<Track | null>({
    id: '1',
    title: 'Lo-Fi Study Beats',
    artist: 'ChilledCow',
    youtubeUrl: 'https://youtube.com/watch?v=example'
  })
  const [playlist, setPlaylist] = useState<Track[]>([
    { id: '1', title: 'Lo-Fi Study Beats', artist: 'ChilledCow', youtubeUrl: 'https://youtube.com/watch?v=example' },
    { id: '2', title: 'Calm Focus', artist: 'Study Music', youtubeUrl: 'https://youtube.com/watch?v=example2' },
  ])

  const addTrack = () => {
    if (!inputUrl.trim()) return
    
    // Extract video info from YouTube URL (simplified)
    const newTrack: Track = {
      id: crypto.randomUUID(),
      title: 'New Track',
      artist: 'YouTube Music',
      youtubeUrl: inputUrl.trim()
    }
    
    setPlaylist([...playlist, newTrack])
    setInputUrl('')
  }

  const removeTrack = (id: string) => {
    setPlaylist(playlist.filter(t => t.id !== id))
    if (currentTrack?.id === id) {
      setCurrentTrack(playlist[0] || null)
    }
  }

  const playTrack = (track: Track) => {
    setCurrentTrack(track)
    setIsPlaying(true)
  }

  const skipNext = () => {
    if (!currentTrack || playlist.length === 0) return
    const currentIndex = playlist.findIndex(t => t.id === currentTrack.id)
    const nextIndex = (currentIndex + 1) % playlist.length
    setCurrentTrack(playlist[nextIndex])
  }

  const skipPrev = () => {
    if (!currentTrack || playlist.length === 0) return
    const currentIndex = playlist.findIndex(t => t.id === currentTrack.id)
    const prevIndex = currentIndex === 0 ? playlist.length - 1 : currentIndex - 1
    setCurrentTrack(playlist[prevIndex])
  }

  return (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.5 }}
      className="fixed bottom-4 left-20 z-40"
    >
      {/* Retro Music Pod */}
      <motion.div
        layout
        className={cn(
          "relative overflow-hidden rounded-2xl border-2 transition-all duration-300",
          "bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900",
          "border-primary/40 shadow-lg",
          isExpanded ? "w-80" : "w-64"
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
          {/* Main display area */}
          <div className="flex items-center gap-3 mb-3">
            {/* Album art placeholder */}
            <motion.div
              animate={{ rotate: isPlaying ? 360 : 0 }}
              transition={{ duration: 3, repeat: isPlaying ? Infinity : 0, ease: 'linear' }}
              className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/30 to-accent/30 flex items-center justify-center border border-primary/30"
            >
              <Music className="w-5 h-5 text-primary" />
            </motion.div>

            {/* Track info */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">
                {currentTrack?.title || 'No track selected'}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {currentTrack?.artist || 'Add a YouTube Music link'}
              </p>
            </div>

            {/* Expand toggle */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1.5 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
            >
              {isExpanded ? (
                <ChevronDown className="w-4 h-4 text-muted-foreground" />
              ) : (
                <ChevronUp className="w-4 h-4 text-muted-foreground" />
              )}
            </motion.button>
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
            {isExpanded && (
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
                        placeholder="YouTube Music link..."
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
                  <div className="max-h-32 overflow-y-auto space-y-1.5">
                    {playlist.map((track) => (
                      <motion.div
                        key={track.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className={cn(
                          "flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-all group",
                          currentTrack?.id === track.id 
                            ? "bg-primary/20 border border-primary/30" 
                            : "bg-muted/20 hover:bg-muted/30"
                        )}
                        onClick={() => playTrack(track)}
                      >
                        <div className="w-6 h-6 rounded-full bg-muted/50 flex items-center justify-center">
                          {currentTrack?.id === track.id && isPlaying ? (
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
                          <p className="text-[10px] text-muted-foreground truncate">{track.artist}</p>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            removeTrack(track.id)
                          }}
                          className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-destructive/20 transition-all"
                        >
                          <X className="w-3 h-3 text-destructive" />
                        </button>
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
