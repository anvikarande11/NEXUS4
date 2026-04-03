'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Trash2, CheckCircle2, Circle, Filter, Download, Video, Check, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useDashboardStore, type Node } from '@/lib/store'
import { mockSubjects, mockResources, mockClassPaths } from '@/lib/mock-data'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'

function calculateNodePositions(nodeCount: number, canvasWidth: number, canvasHeight: number) {
  if (nodeCount === 0) return []
  
  const spacing = canvasWidth / (nodeCount + 1)
  const centerY = canvasHeight / 2
  
  return Array.from({ length: nodeCount }, (_, i) => ({
    x: (i + 1) * spacing,
    y: centerY
  }))
}

function SVGNodeCanvas({ 
  nodes, 
  onNodeClick,
  canvasWidth = 800,
  canvasHeight = 300,
  newNodeId = null
}: {
  nodes: Node[]
  onNodeClick: (nodeId: string) => void
  canvasWidth?: number
  canvasHeight?: number
  newNodeId?: string | null
}) {
  const positions = useMemo(
    () => calculateNodePositions(nodes.length, canvasWidth, canvasHeight),
    [nodes.length, canvasWidth, canvasHeight]
  )

  return (
    <svg
      width={canvasWidth}
      height={canvasHeight}
      className="bg-muted/30 rounded-lg border border-border w-full"
      viewBox={`0 0 ${canvasWidth} ${canvasHeight}`}
    >
      {/* Gradient definitions for visual effects */}
      <defs>
        <radialGradient id="nodeGlowGradient" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.3" />
          <stop offset="100%" stopColor="var(--primary)" stopOpacity="0" />
        </radialGradient>
        <filter id="nodeGlow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="2" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Bezier curves connecting nodes */}
      {positions.length > 1 && positions.map((pos, i) => {
        if (i === positions.length - 1) return null
        
        const nextPos = positions[i + 1]
        const controlX = (pos.x + nextPos.x) / 2
        const controlY = pos.y + 80
        
        return (
          <motion.path
            key={`curve-${i}`}
            d={`M ${pos.x} ${pos.y} Q ${controlX} ${controlY} ${nextPos.x} ${nextPos.y}`}
            stroke="currentColor"
            strokeWidth="2"
            fill="none"
            className="text-muted-foreground"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1, delay: i * 0.1 }}
            strokeDasharray="5,5"
            opacity={0.5}
          />
        )
      })}

      {/* Nodes */}
      {nodes.map((node, i) => {
        const pos = positions[i]
        if (!pos) return null
        const isNewNode = node.id === newNodeId

        return (
          <g key={node.id} onClick={() => onNodeClick(node.id)}>
            {/* Glow effect for completed or new nodes */}
            {(node.completed || isNewNode) && (
              <motion.circle
                cx={pos.x}
                cy={pos.y}
                r={28}
                fill="url(#nodeGlowGradient)"
                filter="url(#nodeGlow)"
                initial={{ r: 28, opacity: 1 }}
                animate={isNewNode ? { r: [28, 36, 28], opacity: [1, 0.6, 1] } : { opacity: 0.6 }}
                transition={isNewNode ? { duration: 1, repeat: Infinity } : { duration: 0 }}
              />
            )}

            {/* Node circle */}
            <motion.circle
              cx={pos.x}
              cy={pos.y}
              r={24}
              fill={node.completed ? 'var(--primary)' : 'var(--secondary)'}
              fillOpacity={node.completed ? 0.2 : 0.1}
              stroke={node.completed ? 'var(--primary)' : isNewNode ? 'var(--accent)' : 'var(--muted-foreground)'}
              strokeWidth={isNewNode ? 3 : 2}
              className="cursor-pointer hover:opacity-80 transition-opacity"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: i * 0.1, type: 'spring' }}
              whileHover={{ scale: 1.15 }}
              filter={isNewNode ? 'url(#nodeGlow)' : undefined}
            />

            {/* Checkmark or number */}
            <text
              x={pos.x}
              y={pos.y + 8}
              textAnchor="middle"
              fontSize="16"
              fontWeight="bold"
              fill={node.completed ? 'var(--primary)' : isNewNode ? 'var(--accent)' : 'var(--muted-foreground)'}
              className="pointer-events-none"
            >
              {node.completed ? '✓' : i + 1}
            </text>

            {/* Video indicator - small badge on node */}
            {node.resourceIds.length > 0 && (
              <circle
                cx={pos.x + 18}
                cy={pos.y - 18}
                r="6"
                fill="var(--primary)"
                className="text-primary"
              />
            )}

            {/* Sparkle for new node */}
            {isNewNode && (
              <motion.circle
                cx={pos.x - 20}
                cy={pos.y - 15}
                r="3"
                fill="var(--accent)"
                initial={{ opacity: 1, scale: 1 }}
                animate={{ opacity: 0, scale: 0 }}
                transition={{ duration: 0.8, repeat: Infinity, repeatDelay: 0.5 }}
              />
            )}

            {/* Label below node */}
            <text
              x={pos.x}
              y={pos.y + 50}
              textAnchor="middle"
              fontSize="12"
              fill="currentColor"
              className="text-muted-foreground pointer-events-none"
            >
              <tspan x={pos.x} dy="0">{node.label.split(' ').slice(0, 2).join(' ')}</tspan>
              {node.label.split(' ').length > 2 && (
                <tspan x={pos.x} dy="14">{node.label.split(' ').slice(2).join(' ')}</tspan>
              )}
            </text>
          </g>
        )
      })}
    </svg>
  )
}

function NodePopover({ 
  onCreateNode 
}: { 
  onCreateNode: (label: string) => void 
}) {
  const [label, setLabel] = useState('')
  const [isOpen, setIsOpen] = useState(false)

  const handleCreate = () => {
    if (label.trim()) {
      onCreateNode(label)
      setLabel('')
      setIsOpen(false)
    }
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="rounded-lg">
          <Plus className="w-4 h-4 mr-1" />
          Add Node
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64">
        <div className="space-y-3">
          <h4 className="font-medium text-sm">Create New Node</h4>
          <Input
            placeholder="Node name (e.g., 'Advanced Integration')"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
            className="rounded-lg"
            autoFocus
          />
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsOpen(false)}
              className="flex-1 rounded-lg"
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleCreate}
              disabled={!label.trim()}
              className="flex-1 rounded-lg"
            >
              Create
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}

export function ClassPath() {
  const { classPaths, activeClassId, resourceFilter, selectedNodeId, setSelectedNode, addNode, deleteNode, openLectureModal } = useDashboardStore()
  const [newNodeName, setNewNodeName] = useState('')
  const [lastAddedNodeId, setLastAddedNodeId] = useState<string | null>(null)

  const classPath = classPaths.find(cp => cp.id === activeClassId)
  const subject = classPath ? mockSubjects.find(s => s.id === classPath.subjectId) : null

  if (!classPath || !subject) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <h3 className="text-lg font-semibold text-muted-foreground">No Class Path Selected</h3>
        <p className="text-sm text-muted-foreground mt-1">Select a subject to view its mastery path</p>
      </div>
    )
  }

  // Calculate health
  const completedCount = classPath.nodes.filter(n => n.completed).length
  const healthPercentage = (completedCount / classPath.nodes.length) * 100
  const healthStatus = healthPercentage >= 75 ? 'green' : healthPercentage >= 50 ? 'yellow' : 'red'
  const healthColor = {
    green: 'text-green-500',
    yellow: 'text-yellow-500',
    red: 'text-red-500'
  }[healthStatus]

  // Filter nodes by resource type if needed
  let displayNodes = classPath.nodes
  if (resourceFilter !== 'all') {
    displayNodes = classPath.nodes.filter(node => {
      if (node.resourceIds.length === 0) return false
      const resources = mockResources.filter(r => node.resourceIds.includes(r.id))
      return resources.some(r => r.type === resourceFilter)
    })
  }

  const handleAddNode = (label: string) => {
    const newNodeId = crypto.randomUUID()
    // Temporarily track the new node ID for animation
    setLastAddedNodeId(newNodeId)
    addNode(classPath.id, label)
    // Clear the highlight after animation completes
    setTimeout(() => setLastAddedNodeId(null), 2000)
  }

  const handleDeleteNode = (nodeId: string) => {
    deleteNode(classPath.id, nodeId)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-4">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: `${subject.color}20` }}
          >
            <span className="text-lg font-bold" style={{ color: subject.color }}>
              {subject.code.slice(0, 2)}
            </span>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-card-foreground">{subject.name}</h2>
            <p className="text-sm text-muted-foreground">{subject.code} Mastery Path</p>
          </div>
        </div>

        {/* Health Badge */}
        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-sm font-medium text-muted-foreground">Workflow Health</div>
            <div className={cn("text-2xl font-bold", healthColor)}>
              {Math.round(healthPercentage)}%
            </div>
          </div>
          <Badge className={cn(
            "text-xs",
            healthStatus === 'green' && 'bg-green-500/20 text-green-700 border-green-300',
            healthStatus === 'yellow' && 'bg-yellow-500/20 text-yellow-700 border-yellow-300',
            healthStatus === 'red' && 'bg-red-500/20 text-red-700 border-red-300'
          )}>
            {healthStatus.toUpperCase()}
          </Badge>
        </div>
      </div>

      {/* SVG Canvas */}
      <div className="overflow-x-auto">
        <SVGNodeCanvas
          nodes={displayNodes}
          onNodeClick={(nodeId) => {
            setSelectedNode(nodeId)
            openLectureModal(nodeId)
          }}
          canvasWidth={Math.max(800, displayNodes.length * 150)}
          canvasHeight={300}
          newNodeId={lastAddedNodeId}
        />
      </div>

      {/* Action Bar */}
      <div className="flex flex-wrap gap-2">
        <NodePopover onCreateNode={handleAddNode} />
        <Button variant="outline" size="sm" className="rounded-lg">
          <Filter className="w-4 h-4 mr-1" />
          Filter Resources
        </Button>
      </div>

      {/* Nodes List */}
      <div className="space-y-2">
        <h3 className="font-semibold text-sm text-muted-foreground">Learning Path ({displayNodes.length})</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          <AnimatePresence>
            {displayNodes.map((node, index) => (
              <motion.div
                key={node.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className={cn(
                  "flex items-start gap-3 p-4 rounded-lg border transition-all cursor-pointer",
                  node.completed
                    ? 'bg-primary/5 border-primary/20'
                    : 'bg-muted/30 border-border hover:border-primary/30',
                  selectedNodeId === node.id && 'ring-2 ring-primary'
                )}
                onClick={() => {
                  setSelectedNode(node.id)
                  openLectureModal(node.id)
                }}
              >
                {node.completed ? (
                  <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                ) : (
                  <Circle className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                )}

                <div className="flex-1 min-w-0">
                  <h4 className={cn(
                    "font-medium text-sm",
                    node.completed && 'line-through text-muted-foreground'
                  )}>
                    {node.label}
                  </h4>
                  {node.resourceIds.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {mockResources
                        .filter(r => node.resourceIds.includes(r.id))
                        .slice(0, 2)
                        .map(r => (
                          <Badge key={r.id} variant="secondary" className="text-xs">
                            {r.type}
                          </Badge>
                        ))}
                      {node.resourceIds.length > 2 && (
                        <Badge variant="secondary" className="text-xs">
                          +{node.resourceIds.length - 2}
                        </Badge>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      // Trigger video upload modal
                      alert(`Upload lecture video for: ${node.label}`)
                    }}
                    className="rounded-lg"
                    title="Add lecture video"
                  >
                    <Video className="w-4 h-4 text-primary" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDeleteNode(node.id)
                    }}
                    className="rounded-lg"
                  >
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
