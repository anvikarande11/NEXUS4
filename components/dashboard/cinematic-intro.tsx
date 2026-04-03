'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence, useSpring, useMotionValue, useTransform } from 'framer-motion'

interface CinematicIntroProps {
  onComplete: () => void
}

// Particle burst effect
function ParticleBurst({ x, y, delay }: { x: number; y: number; delay: number }) {
  const particles = Array.from({ length: 12 }, (_, i) => ({
    id: i,
    angle: (i / 12) * Math.PI * 2,
    distance: 40 + Math.random() * 30,
    size: 3 + Math.random() * 4,
    duration: 0.6 + Math.random() * 0.3,
  }))

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay }}
      className="absolute pointer-events-none"
      style={{ left: x, top: y }}
    >
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute rounded-full bg-white"
          style={{
            width: particle.size,
            height: particle.size,
            left: -particle.size / 2,
            top: -particle.size / 2,
          }}
          initial={{ 
            x: 0, 
            y: 0, 
            opacity: 1,
            scale: 1 
          }}
          animate={{ 
            x: Math.cos(particle.angle) * particle.distance,
            y: Math.sin(particle.angle) * particle.distance,
            opacity: 0,
            scale: 0
          }}
          transition={{ 
            delay,
            duration: particle.duration,
            ease: 'easeOut'
          }}
        />
      ))}
    </motion.div>
  )
}

// Expanding ring effect
function ExpandingRing({ delay }: { delay: number }) {
  return (
    <motion.div
      className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white/40"
      initial={{ width: 0, height: 0, opacity: 1 }}
      animate={{ width: 200, height: 200, opacity: 0 }}
      transition={{ delay, duration: 0.8, ease: 'easeOut' }}
    />
  )
}

// Starburst doodle
function Starburst({ delay }: { delay: number }) {
  const spokes = 8
  return (
    <motion.svg
      className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32"
      viewBox="0 0 100 100"
      initial={{ opacity: 0, scale: 0, rotate: 0 }}
      animate={{ opacity: [0, 1, 0], scale: [0.5, 1.2, 0], rotate: 180 }}
      transition={{ delay, duration: 0.7, ease: 'easeOut' }}
    >
      {Array.from({ length: spokes }, (_, i) => {
        const angle = (i / spokes) * Math.PI * 2
        const x1 = 50 + Math.cos(angle) * 10
        const y1 = 50 + Math.sin(angle) * 10
        const x2 = 50 + Math.cos(angle) * 45
        const y2 = 50 + Math.sin(angle) * 45
        return (
          <line
            key={i}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
          />
        )
      })}
    </motion.svg>
  )
}

// Letter component with pop effect
function PopLetter({ 
  letter, 
  index, 
  totalLetters,
  onAnimationComplete 
}: { 
  letter: string
  index: number
  totalLetters: number
  onAnimationComplete?: () => void
}) {
  const delay = 1.8 + index * 0.12
  const isSpace = letter === ' '

  if (isSpace) {
    return <span className="w-6" />
  }

  return (
    <motion.span
      className="relative inline-block font-serif text-white text-7xl md:text-8xl lg:text-9xl font-bold"
      style={{ 
        textShadow: '0 0 40px rgba(255,255,255,0.5), 0 0 80px rgba(255,255,255,0.3)',
        fontFamily: "'Playfair Display', Georgia, serif"
      }}
      initial={{ 
        opacity: 0, 
        scale: 0,
        y: 50,
        filter: 'blur(10px)'
      }}
      animate={{ 
        opacity: 1, 
        scale: [0, 1.3, 0.9, 1.05, 1],
        y: [50, -20, 5, -3, 0],
        filter: 'blur(0px)'
      }}
      transition={{ 
        delay,
        duration: 0.6,
        ease: [0.34, 1.56, 0.64, 1], // Spring-like bounce
        scale: {
          duration: 0.8,
          times: [0, 0.4, 0.6, 0.8, 1],
        },
        y: {
          duration: 0.8,
          times: [0, 0.4, 0.6, 0.8, 1],
        }
      }}
      onAnimationComplete={index === totalLetters - 1 ? onAnimationComplete : undefined}
    >
      {/* Particle burst for each letter */}
      <ParticleBurst x={0} y={0} delay={delay} />
      
      {/* Expanding ring */}
      {index % 3 === 0 && <ExpandingRing delay={delay} />}
      
      {/* Starburst for first and last letters */}
      {(index === 0 || index === totalLetters - 1) && <Starburst delay={delay} />}
      
      {letter}
    </motion.span>
  )
}

// Abstract blob shape
function AbstractBlob({ 
  color, 
  initialX, 
  initialY, 
  size,
  phase 
}: { 
  color: string
  initialX: number
  initialY: number
  size: number
  phase: 'intro' | 'merge' | 'dissipate'
}) {
  const blobPath1 = "M44.4,-76.4C57.4,-69.2,67.8,-56.4,75.6,-42.2C83.4,-28,88.6,-12.4,87.3,2.5C86,17.3,78.2,31.2,68.4,43.2C58.6,55.2,46.8,65.3,33.4,72.1C20,78.9,5,82.3,-10.4,81.5C-25.8,80.7,-41.6,75.7,-54.8,66.7C-68,57.7,-78.6,44.7,-83.8,29.7C-89,14.7,-88.8,-2.3,-84.2,-18C-79.6,-33.7,-70.6,-48.1,-58.1,-55.7C-45.6,-63.3,-29.6,-64.1,-14.8,-68.8C0,-73.5,13.8,-82.1,27.8,-83.6C41.8,-85.1,56,-83.5,65.6,-75.4"
  const blobPath2 = "M41.6,-71.2C53.6,-64.5,62.8,-52.6,70.1,-39.4C77.4,-26.2,82.8,-11.7,82.3,2.3C81.8,16.3,75.4,29.8,66.8,41.6C58.2,53.4,47.4,63.5,34.8,70.2C22.2,76.9,7.8,80.2,-6.4,79.5C-20.6,78.8,-34.6,74.1,-46.8,66.1C-59,58.1,-69.4,46.8,-76.2,33.2C-83,19.6,-86.2,3.7,-83.8,-11.2C-81.4,-26.1,-73.4,-40,-62.1,-48.1C-50.8,-56.2,-36.2,-58.5,-23.4,-64.6C-10.6,-70.7,0.4,-80.6,13.4,-83.6C26.4,-86.6,41.4,-82.7,53.1,-74.1"

  return (
    <motion.div
      className="absolute"
      initial={{ 
        x: initialX, 
        y: initialY, 
        scale: 1, 
        opacity: 0.8 
      }}
      animate={
        phase === 'intro' 
          ? { x: initialX, y: initialY, scale: [1, 1.1, 1], opacity: 0.8 }
          : phase === 'merge'
          ? { x: 0, y: 0, scale: 0.6, opacity: 0.9 }
          : { scale: 2, opacity: 0 }
      }
      transition={
        phase === 'intro'
          ? { duration: 2, repeat: Infinity, ease: 'easeInOut' }
          : phase === 'merge'
          ? { duration: 1.2, ease: 'easeInOut' }
          : { duration: 1.5, ease: 'easeOut' }
      }
      style={{ 
        left: '50%', 
        top: '50%',
        marginLeft: -size/2,
        marginTop: -size/2,
      }}
    >
      <motion.svg
        width={size}
        height={size}
        viewBox="0 0 200 200"
        animate={{ rotate: 360 }}
        transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
      >
        <motion.path
          d={blobPath1}
          fill={color}
          transform="translate(100 100)"
          animate={{ d: [blobPath1, blobPath2, blobPath1] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        />
      </motion.svg>
    </motion.div>
  )
}

// Mouse spotlight
function MouseSpotlight() {
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)
  const smoothX = useSpring(mouseX, { damping: 30, stiffness: 200 })
  const smoothY = useSpring(mouseY, { damping: 30, stiffness: 200 })

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX)
      mouseY.set(e.clientY)
    }
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [mouseX, mouseY])

  return (
    <motion.div
      className="fixed inset-0 pointer-events-none"
      style={{
        background: useTransform(
          [smoothX, smoothY],
          ([x, y]) => `radial-gradient(600px circle at ${x}px ${y}px, rgba(255,255,255,0.15), transparent 60%)`
        )
      }}
    />
  )
}

export function CinematicIntro({ onComplete }: CinematicIntroProps) {
  const [phase, setPhase] = useState<'intro' | 'merge' | 'reveal' | 'dissipate' | 'lockup' | 'transition'>('intro')
  const [lettersRevealed, setLettersRevealed] = useState(false)
  const title = 'NEXUS UNI'
  const letters = title.split('')

  // Phase timeline
  useEffect(() => {
    const timers: NodeJS.Timeout[] = []

    // Start merge after intro blobs animate
    timers.push(setTimeout(() => setPhase('merge'), 1200))
    
    // Start letter reveal
    timers.push(setTimeout(() => setPhase('reveal'), 1800))
    
    // Dissipate blobs after letters revealed
    timers.push(setTimeout(() => setPhase('dissipate'), 3800))
    
    // Lockup letters
    timers.push(setTimeout(() => setPhase('lockup'), 4500))
    
    // Transition to dashboard
    timers.push(setTimeout(() => setPhase('transition'), 5500))
    
    // Complete
    timers.push(setTimeout(() => onComplete(), 6500))

    return () => timers.forEach(clearTimeout)
  }, [onComplete])

  return (
    <AnimatePresence>
      {phase !== 'transition' ? (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden"
          style={{ backgroundColor: '#E3F2FD' }}
          exit={{ 
            scale: 1.5, 
            opacity: 0,
            filter: 'blur(20px)'
          }}
          transition={{ duration: 1, ease: 'easeInOut' }}
        >
          {/* Mouse-following spotlight */}
          <MouseSpotlight />

          {/* Abstract morphing blobs */}
          <div className="absolute inset-0 flex items-center justify-center">
            <AbstractBlob 
              color="#A0D3E8" 
              initialX={-120} 
              initialY={-80} 
              size={250}
              phase={phase === 'dissipate' || phase === 'lockup' ? 'dissipate' : phase === 'merge' || phase === 'reveal' ? 'merge' : 'intro'}
            />
            <AbstractBlob 
              color="#7EBBD0" 
              initialX={100} 
              initialY={-60} 
              size={300}
              phase={phase === 'dissipate' || phase === 'lockup' ? 'dissipate' : phase === 'merge' || phase === 'reveal' ? 'merge' : 'intro'}
            />
            <AbstractBlob 
              color="#C0E6F0" 
              initialX={0} 
              initialY={100} 
              size={220}
              phase={phase === 'dissipate' || phase === 'lockup' ? 'dissipate' : phase === 'merge' || phase === 'reveal' ? 'merge' : 'intro'}
            />
          </div>

          {/* Central pulsing glow */}
          <motion.div
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
            style={{ 
              background: 'radial-gradient(circle, rgba(126,187,208,0.6) 0%, transparent 70%)',
              width: 400,
              height: 400,
            }}
            animate={{ 
              scale: [1, 1.2, 1],
              opacity: phase === 'dissipate' || phase === 'lockup' ? 0 : [0.5, 0.8, 0.5]
            }}
            transition={{ 
              duration: 2, 
              repeat: phase === 'dissipate' || phase === 'lockup' ? 0 : Infinity, 
              ease: 'easeInOut' 
            }}
          />

          {/* Letter reveal container */}
          {(phase === 'reveal' || phase === 'dissipate' || phase === 'lockup') && (
            <motion.div 
              className="relative z-10 flex items-center justify-center"
              animate={phase === 'lockup' ? {
                scale: [1, 0.85],
                y: [0, -20]
              } : {}}
              transition={{ duration: 0.8, ease: [0.34, 1.56, 0.64, 1] }}
            >
              <div className="flex items-center gap-1">
                {letters.map((letter, index) => (
                  <PopLetter
                    key={index}
                    letter={letter}
                    index={index}
                    totalLetters={letters.filter(l => l !== ' ').length}
                    onAnimationComplete={() => setLettersRevealed(true)}
                  />
                ))}
              </div>
            </motion.div>
          )}

          {/* Skip button */}
          <motion.button
            className="absolute bottom-8 right-8 px-4 py-2 text-sm text-[#7EBBD0] hover:text-[#5A9AB0] transition-colors"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.7 }}
            whileHover={{ opacity: 1 }}
            onClick={onComplete}
          >
            Skip Intro
          </motion.button>
        </motion.div>
      ) : (
        /* Frosted glass transition overlay */
        <motion.div
          className="fixed inset-0 z-50 backdrop-blur-xl bg-background/50"
          initial={{ opacity: 1 }}
          animate={{ opacity: 0 }}
          transition={{ duration: 1 }}
        />
      )}
    </AnimatePresence>
  )
}
