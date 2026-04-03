'use client'

import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Share2, ZoomIn, ZoomOut, Maximize2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { mockGraphNodes, mockGraphEdges, mockSubjects } from '@/lib/mock-data'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

const nodeColors = {
  subject: '#22c55e',
  assignment: '#3b82f6',
  resource: '#f59e0b',
  concept: '#8b5cf6',
}

const edgeColors = {
  'shared-tag': '#22c55e',
  'dependency': '#3b82f6',
  'prerequisite': '#f59e0b',
}

export function KnowledgeGraph() {
  const [hoveredNode, setHoveredNode] = useState<string | null>(null)
  const [zoom, setZoom] = useState(1)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const containerRef = useRef<HTMLDivElement>(null)

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.2, 2))
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.2, 0.5))
  const handleReset = () => {
    setZoom(1)
    setPan({ x: 0, y: 0 })
  }

  // Get connected nodes
  const getConnectedNodes = (nodeId: string) => {
    const connected = new Set<string>()
    mockGraphEdges.forEach(edge => {
      if (edge.source === nodeId) connected.add(edge.target)
      if (edge.target === nodeId) connected.add(edge.source)
    })
    return connected
  }

  const connectedNodes = hoveredNode ? getConnectedNodes(hoveredNode) : new Set()

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-card-foreground flex items-center gap-2">
            <Share2 className="w-5 h-5 text-primary" />
            Knowledge Graph
          </h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Visualize academic connections
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button size="icon" variant="outline" className="rounded-xl h-8 w-8" onClick={handleZoomOut}>
            <ZoomOut className="w-4 h-4" />
          </Button>
          <Button size="icon" variant="outline" className="rounded-xl h-8 w-8" onClick={handleZoomIn}>
            <ZoomIn className="w-4 h-4" />
          </Button>
          <Button size="icon" variant="outline" className="rounded-xl h-8 w-8" onClick={handleReset}>
            <Maximize2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3">
        {Object.entries(nodeColors).map(([type, color]) => (
          <div key={type} className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
            <span className="text-xs text-muted-foreground capitalize">{type}</span>
          </div>
        ))}
      </div>

      {/* Graph Container */}
      <div 
        ref={containerRef}
        className="relative bg-muted/30 rounded-2xl border border-border overflow-hidden h-[300px]"
      >
        <svg
          width="100%"
          height="100%"
          viewBox="0 0 600 350"
          className="overflow-visible"
          style={{ 
            transform: `scale(${zoom}) translate(${pan.x}px, ${pan.y}px)`,
            transformOrigin: 'center'
          }}
        >
          {/* Animated Edges */}
          <defs>
            <linearGradient id="edge-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.3" />
              <stop offset="50%" stopColor="var(--primary)" stopOpacity="0.8" />
              <stop offset="100%" stopColor="var(--primary)" stopOpacity="0.3" />
            </linearGradient>
          </defs>

          {mockGraphEdges.map((edge, index) => {
            const sourceNode = mockGraphNodes.find(n => n.id === edge.source)
            const targetNode = mockGraphNodes.find(n => n.id === edge.target)
            if (!sourceNode || !targetNode) return null

            const isHighlighted = hoveredNode && 
              (edge.source === hoveredNode || edge.target === hoveredNode)

            return (
              <motion.line
                key={`${edge.source}-${edge.target}`}
                x1={sourceNode.x}
                y1={sourceNode.y}
                x2={targetNode.x}
                y2={targetNode.y}
                stroke={edgeColors[edge.type]}
                strokeWidth={isHighlighted ? 3 : 1.5}
                strokeOpacity={hoveredNode ? (isHighlighted ? 1 : 0.2) : 0.5}
                strokeDasharray={edge.type === 'dependency' ? '5,5' : edge.type === 'prerequisite' ? '10,5' : 'none'}
                initial={{ pathLength: 0 }}
                animate={{ 
                  pathLength: 1,
                  strokeOpacity: hoveredNode ? (isHighlighted ? 1 : 0.2) : 0.5
                }}
                transition={{ 
                  pathLength: { duration: 0.8, delay: index * 0.1 },
                  strokeOpacity: { duration: 0.2 }
                }}
              />
            )
          })}

          {/* Nodes */}
          {mockGraphNodes.map((node, index) => {
            const isHovered = hoveredNode === node.id
            const isConnected = connectedNodes.has(node.id)
            const shouldDim = hoveredNode && !isHovered && !isConnected

            return (
              <motion.g
                key={node.id}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ 
                  scale: 1, 
                  opacity: shouldDim ? 0.3 : 1 
                }}
                transition={{ 
                  delay: index * 0.05,
                  type: 'spring',
                  stiffness: 300
                }}
                onMouseEnter={() => setHoveredNode(node.id)}
                onMouseLeave={() => setHoveredNode(null)}
                className="cursor-pointer"
              >
                {/* Glow effect */}
                {isHovered && (
                  <motion.circle
                    cx={node.x}
                    cy={node.y}
                    r={node.type === 'subject' ? 35 : 25}
                    fill={nodeColors[node.type]}
                    fillOpacity={0.2}
                    initial={{ scale: 0.8 }}
                    animate={{ scale: 1.2 }}
                    transition={{ repeat: Infinity, repeatType: 'reverse', duration: 0.8 }}
                  />
                )}

                {/* Node circle */}
                <motion.circle
                  cx={node.x}
                  cy={node.y}
                  r={node.type === 'subject' ? 25 : 18}
                  fill="var(--card)"
                  stroke={nodeColors[node.type]}
                  strokeWidth={isHovered ? 3 : 2}
                  whileHover={{ scale: 1.2 }}
                />

                {/* Node label */}
                <text
                  x={node.x}
                  y={node.y}
                  textAnchor="middle"
                  dominantBaseline="central"
                  className="text-xs font-medium fill-card-foreground pointer-events-none"
                  style={{ fontSize: node.type === 'subject' ? '11px' : '9px' }}
                >
                  {node.label}
                </text>
              </motion.g>
            )
          })}
        </svg>

        {/* Hover Card */}
        {hoveredNode && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute bottom-4 left-4 bg-card border border-border rounded-xl p-3 shadow-lg"
          >
            <h4 className="font-medium text-sm">
              {mockGraphNodes.find(n => n.id === hoveredNode)?.label}
            </h4>
            <p className="text-xs text-muted-foreground mt-1">
              {connectedNodes.size} connections
            </p>
          </motion.div>
        )}
      </div>
    </div>
  )
}
