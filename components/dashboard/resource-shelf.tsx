'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  FolderOpen,
  Search,
  FileText,
  Link2,
  Video,
  StickyNote,
  Star,
  StarOff,
  Upload,
  Clock,
  Bookmark,
  X,
  ChevronRight,
  Eye,
  Edit3,
  Highlighter
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useDashboardStore } from '@/lib/store'
import { mockResources, type Resource } from '@/lib/mock-data'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

const typeIcons = {
  pdf: FileText,
  link: Link2,
  video: Video,
  notes: StickyNote,
}

const typeColors = {
  pdf: 'text-destructive',
  link: 'text-primary',
  video: 'text-warning',
  notes: 'text-accent',
}

// Consistent date formatting to avoid hydration mismatch
function formatDate(dateString: string): string {
  const date = new Date(dateString)
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`
}

function ResourceCard({ resource, onPreview }: { resource: Resource; onPreview: (id: string) => void }) {
  const [isFavorite, setIsFavorite] = useState(resource.isFavorite)
  const TypeIcon = typeIcons[resource.type]

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.02 }}
      className="group relative bg-card border border-border rounded-xl p-4 hover:border-primary/30 transition-all cursor-pointer"
      onClick={() => onPreview(resource.id)}
    >
      {/* Favorite Toggle */}
      <motion.button
        whileHover={{ scale: 1.2 }}
        whileTap={{ scale: 0.9 }}
        onClick={(e) => {
          e.stopPropagation()
          setIsFavorite(!isFavorite)
        }}
        className="absolute top-3 right-3 p-1.5 rounded-lg bg-background/50 opacity-0 group-hover:opacity-100 transition-opacity"
      >
        {isFavorite ? (
          <Star className="w-4 h-4 text-warning fill-warning" />
        ) : (
          <StarOff className="w-4 h-4 text-muted-foreground" />
        )}
      </motion.button>

      {/* Type Icon */}
      <div className={cn(
        "w-10 h-10 rounded-xl flex items-center justify-center mb-3",
        resource.type === 'pdf' && "bg-destructive/10",
        resource.type === 'link' && "bg-primary/10",
        resource.type === 'video' && "bg-warning/10",
        resource.type === 'notes' && "bg-accent/10",
      )}>
        <TypeIcon className={cn("w-5 h-5", typeColors[resource.type])} />
      </div>

      {/* Title */}
      <h4 className="font-medium text-card-foreground line-clamp-2 text-sm">
        {resource.title}
      </h4>

      {/* Subject & Tags */}
      <div className="flex flex-wrap gap-1 mt-2">
        <Badge variant="secondary" className="text-xs">
          {resource.subject}
        </Badge>
        {resource.tags.slice(0, 2).map(tag => (
          <Badge key={tag} variant="outline" className="text-xs">
            {tag}
          </Badge>
        ))}
      </div>

      {/* Meta */}
      <div className="flex items-center justify-between mt-3 text-xs text-muted-foreground">
        <div className="flex items-center gap-1">
          <Clock className="w-3 h-3" />
          {formatDate(resource.dateAdded)}
        </div>
        {resource.usedInAssignments.length > 0 && (
          <Badge variant="outline" className="text-xs">
            Used in {resource.usedInAssignments.length}
          </Badge>
        )}
      </div>
    </motion.div>
  )
}

function ResourcePreviewDrawer({ 
  resource, 
  isOpen, 
  onClose 
}: { 
  resource: Resource | null; 
  isOpen: boolean; 
  onClose: () => void;
}) {
  if (!resource) return null

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50"
            onClick={onClose}
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 h-full w-full max-w-2xl bg-card border-l border-border z-50 flex flex-col shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border">
              <div className="flex items-center gap-3">
                <div className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center",
                  resource.type === 'pdf' && "bg-destructive/10",
                  resource.type === 'link' && "bg-primary/10",
                  resource.type === 'video' && "bg-warning/10",
                  resource.type === 'notes' && "bg-accent/10",
                )}>
                  {(() => {
                    const TypeIcon = typeIcons[resource.type]
                    return <TypeIcon className={cn("w-5 h-5", typeColors[resource.type])} />
                  })()}
                </div>
                <div>
                  <h3 className="font-semibold text-card-foreground">{resource.title}</h3>
                  <p className="text-sm text-muted-foreground">{resource.subject}</p>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={onClose} className="rounded-xl">
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Content Split View */}
            <div className="flex-1 flex overflow-hidden">
              {/* PDF Preview Mock */}
              <div className="flex-1 bg-muted/30 p-4 overflow-auto">
                <div className="space-y-4">
                  {[1, 2, 3].map((page) => (
                    <div
                      key={page}
                      className="bg-card rounded-xl p-6 border border-border aspect-[8.5/11] flex flex-col"
                    >
                      <div className="text-xs text-muted-foreground mb-4">Page {page}</div>
                      <div className="space-y-2 flex-1">
                        {Array.from({ length: 8 }).map((_, i) => (
                          <div
                            key={i}
                            className="h-3 bg-muted rounded"
                            style={{ width: `${60 + Math.random() * 40}%` }}
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Notes Panel */}
              <div className="w-80 border-l border-border flex flex-col">
                {/* Quick Actions */}
                <div className="p-4 border-b border-border">
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="flex-1 rounded-xl">
                      <Bookmark className="w-4 h-4 mr-1" />
                      Bookmark
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1 rounded-xl">
                      <Highlighter className="w-4 h-4 mr-1" />
                      Highlight
                    </Button>
                  </div>
                </div>

                {/* Quick Notes */}
                <div className="flex-1 p-4 overflow-auto">
                  <h4 className="font-medium text-sm mb-3 flex items-center gap-2">
                    <Edit3 className="w-4 h-4 text-primary" />
                    Quick Notes
                  </h4>
                  <textarea
                    className="w-full h-40 bg-muted/50 rounded-xl p-3 text-sm resize-none border border-border focus:border-primary focus:outline-none transition-colors"
                    placeholder="Add notes about this resource..."
                  />

                  {/* Highlight Snippets */}
                  <h4 className="font-medium text-sm mb-3 mt-6 flex items-center gap-2">
                    <Highlighter className="w-4 h-4 text-warning" />
                    Highlights
                  </h4>
                  <div className="space-y-2">
                    <div className="p-3 bg-warning/10 border-l-2 border-warning rounded-r-lg text-sm">
                      {"Important: Normalization rules must be applied in order..."}
                    </div>
                    <div className="p-3 bg-primary/10 border-l-2 border-primary rounded-r-lg text-sm">
                      {"Key concept: Functional dependencies determine..."}
                    </div>
                  </div>
                </div>

                {/* Used In */}
                <div className="p-4 border-t border-border">
                  <h4 className="font-medium text-sm mb-2">Used in Assignments</h4>
                  <div className="flex flex-wrap gap-2">
                    {resource.usedInAssignments.length > 0 ? (
                      resource.usedInAssignments.map((id) => (
                        <Badge key={id} variant="secondary" className="text-xs">
                          Assignment #{id}
                        </Badge>
                      ))
                    ) : (
                      <span className="text-sm text-muted-foreground">Not yet used</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

export function ResourceShelf() {
  const { resourceFilter, setResourceFilter } = useDashboardStore()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)

  // Filter resources based on search and resource type filter
  const filteredResources = useMemo(() => {
    return mockResources.filter(resource => {
      // Search filter
      const matchesSearch = 
        resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        resource.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
        resource.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))

      // Type filter
      if (resourceFilter === 'all') {
        return matchesSearch
      }
      
      const filterMap = {
        'pdf': 'pdf',
        'notes': 'notes',
        'links': 'link',
        'videos': 'video'
      }
      
      const typeToMatch = filterMap[resourceFilter as keyof typeof filterMap]
      return matchesSearch && resource.type === typeToMatch
    })
  }, [searchQuery, resourceFilter])

  const handlePreview = (id: string) => {
    const resource = mockResources.find(r => r.id === id)
    if (resource) {
      setSelectedResource(resource)
      setIsDrawerOpen(true)
    }
  }

  return (
    <>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-card-foreground flex items-center gap-2">
              <FolderOpen className="w-5 h-5 text-primary" />
              Resource Shelf
            </h2>
            <p className="text-sm text-muted-foreground mt-0.5">
              Your academic knowledge library
            </p>
          </div>
          <Button size="sm" variant="outline" className="rounded-xl">
            <Upload className="w-4 h-4 mr-1" />
            Upload
          </Button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search resources, tags, subjects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 rounded-xl bg-muted/50 border-border"
          />
        </div>

        {/* Quick Filters */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {(['all', 'notes', 'links', 'videos', 'pdf'] as const).map((filter) => (
            <motion.button
              key={filter}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setResourceFilter(filter)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-sm font-medium transition-all flex-shrink-0",
                resourceFilter === filter
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              )}
            >
              {filter === 'all' && 'All'}
              {filter === 'pdf' && 'PDFs'}
              {filter === 'notes' && 'Notes'}
              {filter === 'links' && 'Links'}
              {filter === 'videos' && 'Videos'}
            </motion.button>
          ))}
        </div>

        {/* Resource Count */}
        <div className="text-sm text-muted-foreground">
          Showing {filteredResources.length} of {mockResources.length} resources
        </div>

        {/* Resource Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
          <AnimatePresence mode="popLayout">
            {filteredResources.map((resource) => (
              <ResourceCard
                key={resource.id}
                resource={resource}
                onPreview={handlePreview}
              />
            ))}
          </AnimatePresence>
        </div>

        {/* Empty State */}
        {filteredResources.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <FolderOpen className="w-12 h-12 text-muted-foreground/40 mb-3" />
            <p className="text-muted-foreground font-medium">No resources found</p>
            <p className="text-sm text-muted-foreground mt-1">Try adjusting your filters or search query</p>
          </div>
        )}
      </div>

      {/* Preview Drawer */}
      <ResourcePreviewDrawer
        resource={selectedResource}
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
      />
    </>
  )
}
