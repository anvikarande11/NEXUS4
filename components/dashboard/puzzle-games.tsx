'use client'

import { useState, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { RotateCcw, Trophy, Gamepad2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

// 2048 Game Logic
function initializeGrid(): number[][] {
  const grid = Array(4).fill(null).map(() => Array(4).fill(0))
  addRandomTile(grid)
  addRandomTile(grid)
  return grid
}

function addRandomTile(grid: number[][]) {
  const empty: [number, number][] = []
  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 4; j++) {
      if (grid[i][j] === 0) empty.push([i, j])
    }
  }
  if (empty.length > 0) {
    const [row, col] = empty[Math.floor(Math.random() * empty.length)]
    grid[row][col] = Math.random() < 0.9 ? 2 : 4
  }
}

function rotateGrid(grid: number[][]): number[][] {
  const n = grid.length
  const rotated = Array(n).fill(null).map(() => Array(n).fill(0))
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      rotated[j][n - 1 - i] = grid[i][j]
    }
  }
  return rotated
}

function slideLeft(grid: number[][]): { grid: number[][], score: number, moved: boolean } {
  let score = 0
  let moved = false
  const newGrid = grid.map(row => {
    const filtered = row.filter(x => x !== 0)
    const merged: number[] = []
    let i = 0
    while (i < filtered.length) {
      if (i + 1 < filtered.length && filtered[i] === filtered[i + 1]) {
        merged.push(filtered[i] * 2)
        score += filtered[i] * 2
        i += 2
      } else {
        merged.push(filtered[i])
        i++
      }
    }
    while (merged.length < 4) merged.push(0)
    if (JSON.stringify(merged) !== JSON.stringify(row)) moved = true
    return merged
  })
  return { grid: newGrid, score, moved }
}

function moveGrid(grid: number[][], direction: 'left' | 'right' | 'up' | 'down'): { grid: number[][], score: number, moved: boolean } {
  let rotations = { left: 0, up: 1, right: 2, down: 3 }[direction]
  let rotated = grid
  for (let i = 0; i < rotations; i++) rotated = rotateGrid(rotated)
  
  const result = slideLeft(rotated)
  
  for (let i = 0; i < (4 - rotations) % 4; i++) result.grid = rotateGrid(result.grid)
  
  return result
}

function checkGameOver(grid: number[][]): boolean {
  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 4; j++) {
      if (grid[i][j] === 0) return false
      if (i < 3 && grid[i][j] === grid[i + 1][j]) return false
      if (j < 3 && grid[i][j] === grid[i][j + 1]) return false
    }
  }
  return true
}

const tileColors: Record<number, string> = {
  0: 'bg-muted/30',
  2: 'bg-slate-700 text-slate-100',
  4: 'bg-slate-600 text-slate-100',
  8: 'bg-orange-600 text-white',
  16: 'bg-orange-500 text-white',
  32: 'bg-red-500 text-white',
  64: 'bg-red-600 text-white',
  128: 'bg-yellow-500 text-slate-900',
  256: 'bg-yellow-400 text-slate-900',
  512: 'bg-yellow-300 text-slate-900',
  1024: 'bg-primary text-primary-foreground',
  2048: 'bg-accent text-accent-foreground glow-accent',
}

function Game2048() {
  const [grid, setGrid] = useState<number[][]>(() => initializeGrid())
  const [score, setScore] = useState(0)
  const [highScore, setHighScore] = useState(0)
  const [gameOver, setGameOver] = useState(false)

  const handleMove = useCallback((direction: 'left' | 'right' | 'up' | 'down') => {
    if (gameOver) return
    
    setGrid(prev => {
      const result = moveGrid(prev, direction)
      if (result.moved) {
        addRandomTile(result.grid)
        setScore(s => {
          const newScore = s + result.score
          setHighScore(h => Math.max(h, newScore))
          return newScore
        })
        if (checkGameOver(result.grid)) {
          setGameOver(true)
        }
        return result.grid
      }
      return prev
    })
  }, [gameOver])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)) {
        e.preventDefault()
        const direction = e.key.replace('Arrow', '').toLowerCase() as 'left' | 'right' | 'up' | 'down'
        handleMove(direction)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleMove])

  const resetGame = () => {
    setGrid(initializeGrid())
    setScore(0)
    setGameOver(false)
  }

  return (
    <div className="flex flex-col items-center">
      {/* Score */}
      <div className="flex gap-4 mb-4">
        <div className="bg-muted/50 rounded-lg px-4 py-2 text-center">
          <div className="text-xs text-muted-foreground">Score</div>
          <div className="text-xl font-bold text-foreground">{score}</div>
        </div>
        <div className="bg-primary/20 rounded-lg px-4 py-2 text-center">
          <div className="text-xs text-muted-foreground">Best</div>
          <div className="text-xl font-bold text-primary">{highScore}</div>
        </div>
        <Button variant="outline" size="icon" onClick={resetGame} className="self-center">
          <RotateCcw className="w-4 h-4" />
        </Button>
      </div>

      {/* Grid */}
      <div className="relative bg-muted/20 rounded-xl p-3 border border-border">
        <div className="grid grid-cols-4 gap-2">
          {grid.flat().map((value, index) => (
            <motion.div
              key={`${index}-${value}`}
              initial={{ scale: value ? 0.8 : 1 }}
              animate={{ scale: 1 }}
              className={cn(
                "w-16 h-16 rounded-lg flex items-center justify-center font-bold text-lg transition-colors",
                tileColors[value] || 'bg-accent text-accent-foreground'
              )}
            >
              {value > 0 && value}
            </motion.div>
          ))}
        </div>

        {/* Game Over Overlay */}
        <AnimatePresence>
          {gameOver && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-background/80 backdrop-blur-sm rounded-xl flex flex-col items-center justify-center"
            >
              <Trophy className="w-12 h-12 text-warning mb-2" />
              <p className="text-xl font-bold text-foreground mb-1">Game Over!</p>
              <p className="text-sm text-muted-foreground mb-4">Score: {score}</p>
              <Button onClick={resetGame}>Play Again</Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <p className="text-xs text-muted-foreground mt-4">Use arrow keys to play</p>
    </div>
  )
}

// Sudoku Component
function Sudoku() {
  const [grid, setGrid] = useState<(number | null)[][]>(() => {
    // Simple pre-filled Sudoku puzzle
    return [
      [5, 3, null, null, 7, null, null, null, null],
      [6, null, null, 1, 9, 5, null, null, null],
      [null, 9, 8, null, null, null, null, 6, null],
      [8, null, null, null, 6, null, null, null, 3],
      [4, null, null, 8, null, 3, null, null, 1],
      [7, null, null, null, 2, null, null, null, 6],
      [null, 6, null, null, null, null, 2, 8, null],
      [null, null, null, 4, 1, 9, null, null, 5],
      [null, null, null, null, 8, null, null, 7, 9],
    ]
  })
  const [selected, setSelected] = useState<[number, number] | null>(null)

  const handleCellClick = (row: number, col: number) => {
    // Only allow selecting empty cells
    const original = [
      [5, 3, null, null, 7, null, null, null, null],
      [6, null, null, 1, 9, 5, null, null, null],
      [null, 9, 8, null, null, null, null, 6, null],
      [8, null, null, null, 6, null, null, null, 3],
      [4, null, null, 8, null, 3, null, null, 1],
      [7, null, null, null, 2, null, null, null, 6],
      [null, 6, null, null, null, null, 2, 8, null],
      [null, null, null, 4, 1, 9, null, null, 5],
      [null, null, null, null, 8, null, null, 7, 9],
    ]
    if (original[row][col] === null) {
      setSelected([row, col])
    }
  }

  const handleNumberInput = (num: number) => {
    if (selected) {
      const [row, col] = selected
      setGrid(prev => {
        const newGrid = prev.map(r => [...r])
        newGrid[row][col] = num
        return newGrid
      })
    }
  }

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (selected && e.key >= '1' && e.key <= '9') {
        handleNumberInput(parseInt(e.key))
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [selected])

  return (
    <div className="flex flex-col items-center">
      {/* Grid */}
      <div className="bg-muted/20 rounded-xl p-2 border border-border">
        <div className="grid grid-cols-9 gap-px bg-border">
          {grid.flat().map((value, index) => {
            const row = Math.floor(index / 9)
            const col = index % 9
            const isSelected = selected && selected[0] === row && selected[1] === col
            const boxRow = Math.floor(row / 3)
            const boxCol = Math.floor(col / 3)
            const isAltBox = (boxRow + boxCol) % 2 === 0

            return (
              <motion.button
                key={index}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleCellClick(row, col)}
                className={cn(
                  "w-8 h-8 flex items-center justify-center text-sm font-mono transition-colors",
                  isAltBox ? "bg-card" : "bg-muted/50",
                  isSelected && "ring-2 ring-primary bg-primary/20",
                  value && "font-bold"
                )}
              >
                {value}
              </motion.button>
            )
          })}
        </div>
      </div>

      {/* Number Pad */}
      <div className="flex gap-1 mt-4">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
          <Button
            key={num}
            variant="outline"
            size="sm"
            onClick={() => handleNumberInput(num)}
            className="w-8 h-8 p-0 font-mono"
          >
            {num}
          </Button>
        ))}
      </div>

      <p className="text-xs text-muted-foreground mt-4">Click a cell and type a number</p>
    </div>
  )
}

export function PuzzleGames() {
  const [activeGame, setActiveGame] = useState<'2048' | 'sudoku'>('2048')

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
            <Gamepad2 className="w-5 h-5 text-primary" />
            Study Break Zone
          </h2>
          <p className="text-sm text-muted-foreground">Take a break and recharge</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={activeGame === '2048' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveGame('2048')}
          >
            2048
          </Button>
          <Button
            variant={activeGame === 'sudoku' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveGame('sudoku')}
          >
            Sudoku
          </Button>
        </div>
      </div>

      {/* Game Area */}
      <div className="flex-1 flex items-center justify-center">
        <AnimatePresence mode="wait">
          {activeGame === '2048' ? (
            <motion.div
              key="2048"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
            >
              <Game2048 />
            </motion.div>
          ) : (
            <motion.div
              key="sudoku"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
            >
              <Sudoku />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
