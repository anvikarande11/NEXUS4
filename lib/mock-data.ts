// Mock Academic Data for Nexus-Uni Dashboard
// Version: 1.1 - Added helper functions

export interface Task {
  id: string
  title: string
  subject: string
  urgency: 'critical' | 'high' | 'medium' | 'low'
  gradeWeight: number
  dueDate: string
  progress: number
  confidence: number
  description: string
  gravity?: number
  timeUntil?: string
}

export interface Issue {
  id: string
  title: string
  professorName: string
  professorAvatar: string
  severity: 'critical' | 'major' | 'minor' | 'suggestion'
  status: 'open' | 'in-review' | 'resolved' | 'reopened'
  timestamp: string
  timeAgo?: string
  replies: IssueReply[]
  assignmentId?: string
}

export interface IssueReply {
  id: string
  author: string
  avatar: string
  content: string
  timestamp: string
  timeAgo?: string
  isResolution?: boolean
}

export interface Resource {
  id: string
  title: string
  type: 'pdf' | 'notes' | 'link' | 'video'
  subject: string
  tags: string[]
  dateAdded: string
  isFavorite: boolean
  usedInAssignments: string[]
  pages?: number
}

export interface Subject {
  id: string
  name: string
  code: string
  color: string
  attendance: number
  marks: number
  pendingTasks: number
  issueBacklog: number
  revisionConfidence: number
  riskLevel: 'safe' | 'warning' | 'danger'
}

export interface GraphNode {
  id: string
  label: string
  type: 'subject' | 'assignment' | 'resource' | 'concept'
  x: number
  y: number
}

export interface GraphEdge {
  source: string
  target: string
  type: 'shared-tag' | 'dependency' | 'prerequisite'
}

export interface Node {
  id: string
  label: string
  completed: boolean
  resourceIds: string[]
  x: number
  y: number
  order: number
}

export interface ClassPath {
  id: string
  subjectId: string
  nodes: Node[]
}

// Mock Tasks
export const mockTasks: Task[] = [
  {
    id: '1',
    title: 'Database Normalization Project',
    subject: 'DBMS',
    urgency: 'critical',
    gradeWeight: 25,
    dueDate: '2026-04-03T20:00:00',
    progress: 45,
    confidence: 35,
    description: 'Complete 3NF normalization with ER diagrams for university enrollment system',
    gravity: 100,
    timeUntil: '79 days left'
  },
  {
    id: '2',
    title: 'Binary Tree Implementation',
    subject: 'DSA',
    urgency: 'high',
    gradeWeight: 20,
    dueDate: '2026-04-04T12:00:00',
    progress: 70,
    confidence: 60,
    description: 'Implement AVL tree with all rotation operations',
    gravity: 85,
    timeUntil: '80 days left'
  },
  {
    id: '3',
    title: 'Process Scheduling Simulation',
    subject: 'Operating Systems',
    urgency: 'high',
    gradeWeight: 15,
    dueDate: '2026-04-05T00:00:00',
    progress: 20,
    confidence: 45,
    description: 'Simulate Round Robin and Priority scheduling algorithms',
    gravity: 92,
    timeUntil: '81 days left'
  },
  {
    id: '4',
    title: 'TCP/IP Protocol Analysis',
    subject: 'Computer Networks',
    urgency: 'medium',
    gradeWeight: 10,
    dueDate: '2026-04-06T12:00:00',
    progress: 85,
    confidence: 80,
    description: 'Wireshark packet capture and analysis report',
    gravity: 35,
    timeUntil: '82 days left'
  },
  {
    id: '5',
    title: 'Linear Regression Model',
    subject: 'Machine Learning',
    urgency: 'medium',
    gradeWeight: 18,
    dueDate: '2026-04-07T12:00:00',
    progress: 55,
    confidence: 50,
    description: 'Build and evaluate linear regression model on housing dataset',
    gravity: 58,
    timeUntil: '83 days left'
  },
  {
    id: '6',
    title: 'Calculus Integration Worksheet',
    subject: 'Mathematics',
    urgency: 'low',
    gradeWeight: 5,
    dueDate: '2026-04-10T12:00:00',
    progress: 30,
    confidence: 70,
    description: 'Practice problems on integration by parts',
    gravity: 18,
    timeUntil: '86 days left'
  }
]

// Mock Issues (Professor Feedback)
export const mockIssues: Issue[] = [
  {
    id: '1',
    title: 'Missing edge case handling in BST deletion',
    professorName: 'Dr. Sarah Chen',
    professorAvatar: 'SC',
    severity: 'major',
    status: 'open',
    timestamp: '2026-04-03T10:00:00',
    timeAgo: '5h ago',
    assignmentId: '2',
    replies: [
      {
        id: 'r1',
        author: 'Dr. Sarah Chen',
        avatar: 'SC',
        content: 'Your BST implementation doesn\'t handle the case where the node to delete has two children. Please review the inorder successor approach.',
        timestamp: '2026-04-03T10:00:00',
        timeAgo: '5h ago'
      }
    ]
  },
  {
    id: '2',
    title: 'Excellent normalization analysis',
    professorName: 'Prof. Michael Torres',
    professorAvatar: 'MT',
    severity: 'suggestion',
    status: 'resolved',
    timestamp: '2026-04-02T12:00:00',
    timeAgo: '1d ago',
    assignmentId: '1',
    replies: [
      {
        id: 'r2',
        author: 'Prof. Michael Torres',
        avatar: 'MT',
        content: 'Great work on identifying functional dependencies. Consider adding a section on BCNF for extra credit.',
        timestamp: '2026-04-02T12:00:00',
        timeAgo: '1d ago'
      },
      {
        id: 'r3',
        author: 'You',
        avatar: 'ME',
        content: 'Thank you! I\'ve added the BCNF analysis section.',
        timestamp: '2026-04-02T16:00:00',
        timeAgo: '1d ago',
        isResolution: true
      }
    ]
  },
  {
    id: '3',
    title: 'Deadlock prevention section needs revision',
    professorName: 'Dr. Emily Watson',
    professorAvatar: 'EW',
    severity: 'critical',
    status: 'in-review',
    timestamp: '2026-04-03T07:00:00',
    timeAgo: '8h ago',
    assignmentId: '3',
    replies: [
      {
        id: 'r4',
        author: 'Dr. Emily Watson',
        avatar: 'EW',
        content: 'Your deadlock prevention algorithm has a fundamental flaw. Banker\'s algorithm requires knowing maximum resources upfront.',
        timestamp: '2026-04-03T07:00:00',
        timeAgo: '8h ago'
      },
      {
        id: 'r5',
        author: 'You',
        avatar: 'ME',
        content: 'I\'ve revised the section to include proper resource allocation matrices.',
        timestamp: '2026-04-03T09:00:00',
        timeAgo: '6h ago'
      }
    ]
  },
  {
    id: '4',
    title: 'Great packet analysis methodology',
    professorName: 'Dr. James Lee',
    professorAvatar: 'JL',
    severity: 'minor',
    status: 'resolved',
    timestamp: '2026-04-01T14:00:00',
    timeAgo: '2d ago',
    assignmentId: '4',
    replies: [
      {
        id: 'r6',
        author: 'Dr. James Lee',
        avatar: 'JL',
        content: 'Excellent use of Wireshark filters. Your TCP handshake analysis was particularly well documented.',
        timestamp: '2026-04-01T14:00:00',
        timeAgo: '2d ago',
        isResolution: true
      }
    ]
  }
]

// Mock Resources
export const mockResources: Resource[] = [
  {
    id: '1',
    title: 'Database Normalization Guide',
    type: 'pdf',
    subject: 'DBMS',
    tags: ['#Normalization', '#3NF', '#BCNF'],
    dateAdded: '2026-03-15',
    isFavorite: true,
    usedInAssignments: ['1'],
    pages: 45
  },
  {
    id: '2',
    title: 'AVL Tree Visualizer',
    type: 'link',
    subject: 'DSA',
    tags: ['#Trees', '#AVL', '#Visualization'],
    dateAdded: '2026-03-20',
    isFavorite: true,
    usedInAssignments: ['2']
  },
  {
    id: '3',
    title: 'OS Scheduling Algorithms Lecture',
    type: 'video',
    subject: 'Operating Systems',
    tags: ['#Scheduling', '#RoundRobin', '#Priority'],
    dateAdded: '2026-03-22',
    isFavorite: false,
    usedInAssignments: ['3']
  },
  {
    id: '4',
    title: 'Wireshark Tutorial Notes',
    type: 'notes',
    subject: 'Computer Networks',
    tags: ['#Wireshark', '#TCP', '#PacketAnalysis'],
    dateAdded: '2026-03-25',
    isFavorite: false,
    usedInAssignments: ['4']
  },
  {
    id: '5',
    title: 'Linear Regression from Scratch',
    type: 'pdf',
    subject: 'Machine Learning',
    tags: ['#ML', '#Regression', '#Python'],
    dateAdded: '2026-03-28',
    isFavorite: true,
    usedInAssignments: ['5'],
    pages: 28
  },
  {
    id: '6',
    title: 'Integration Techniques Cheatsheet',
    type: 'pdf',
    subject: 'Mathematics',
    tags: ['#Calculus', '#Integration', '#ByParts'],
    dateAdded: '2026-03-30',
    isFavorite: false,
    usedInAssignments: ['6'],
    pages: 12
  },
  {
    id: '7',
    title: 'B-Tree Implementation Tutorial',
    type: 'link',
    subject: 'DSA',
    tags: ['#Trees', '#BTree', '#Database'],
    dateAdded: '2026-03-18',
    isFavorite: false,
    usedInAssignments: []
  },
  {
    id: '8',
    title: 'Memory Management Deep Dive',
    type: 'video',
    subject: 'Operating Systems',
    tags: ['#Memory', '#Paging', '#Virtual'],
    dateAdded: '2026-03-12',
    isFavorite: true,
    usedInAssignments: []
  }
]

// Mock Subjects
export const mockSubjects: Subject[] = [
  {
    id: '1',
    name: 'Database Management',
    code: 'DBMS',
    color: '#22c55e',
    attendance: 92,
    marks: 78,
    pendingTasks: 1,
    issueBacklog: 0,
    revisionConfidence: 75,
    riskLevel: 'safe'
  },
  {
    id: '2',
    name: 'Data Structures',
    code: 'DSA',
    color: '#3b82f6',
    attendance: 88,
    marks: 65,
    pendingTasks: 1,
    issueBacklog: 1,
    revisionConfidence: 55,
    riskLevel: 'warning'
  },
  {
    id: '3',
    name: 'Operating Systems',
    code: 'OS',
    color: '#f59e0b',
    attendance: 72,
    marks: 52,
    pendingTasks: 1,
    issueBacklog: 1,
    revisionConfidence: 40,
    riskLevel: 'danger'
  },
  {
    id: '4',
    name: 'Computer Networks',
    code: 'CN',
    color: '#8b5cf6',
    attendance: 95,
    marks: 82,
    pendingTasks: 1,
    issueBacklog: 0,
    revisionConfidence: 80,
    riskLevel: 'safe'
  },
  {
    id: '5',
    name: 'Machine Learning',
    code: 'ML',
    color: '#ec4899',
    attendance: 78,
    marks: 68,
    pendingTasks: 1,
    issueBacklog: 0,
    revisionConfidence: 50,
    riskLevel: 'warning'
  },
  {
    id: '6',
    name: 'Mathematics',
    code: 'MATH',
    color: '#06b6d4',
    attendance: 85,
    marks: 75,
    pendingTasks: 1,
    issueBacklog: 0,
    revisionConfidence: 70,
    riskLevel: 'safe'
  }
]

// Mock Knowledge Graph Data
export const mockGraphNodes: GraphNode[] = [
  // Subjects
  { id: 'sub-dbms', label: 'DBMS', type: 'subject', x: 300, y: 80 },
  { id: 'sub-dsa', label: 'DSA', type: 'subject', x: 150, y: 180 },
  { id: 'sub-os', label: 'OS', type: 'subject', x: 450, y: 180 },
  { id: 'sub-cn', label: 'Networks', type: 'subject', x: 300, y: 280 },
  
  // Concepts
  { id: 'con-trees', label: 'Trees', type: 'concept', x: 80, y: 100 },
  { id: 'con-indexing', label: 'Indexing', type: 'concept', x: 220, y: 50 },
  { id: 'con-memory', label: 'Memory', type: 'concept', x: 400, y: 100 },
  { id: 'con-process', label: 'Process', type: 'concept', x: 520, y: 120 },
  { id: 'con-tcp', label: 'TCP/IP', type: 'concept', x: 380, y: 320 },
  { id: 'con-ai', label: '#AI', type: 'concept', x: 180, y: 320 },
  { id: 'con-ethics', label: '#Ethics', type: 'concept', x: 100, y: 250 },
  
  // Resources
  { id: 'res-btree', label: 'B-Tree', type: 'resource', x: 120, y: 40 },
  { id: 'res-avl', label: 'AVL', type: 'resource', x: 60, y: 160 },
]

export const mockGraphEdges: GraphEdge[] = [
  // Subject to concept connections
  { source: 'sub-dsa', target: 'con-trees', type: 'shared-tag' },
  { source: 'sub-dbms', target: 'con-indexing', type: 'shared-tag' },
  { source: 'sub-dbms', target: 'con-trees', type: 'dependency' },
  { source: 'sub-os', target: 'con-memory', type: 'shared-tag' },
  { source: 'sub-os', target: 'con-process', type: 'shared-tag' },
  { source: 'sub-cn', target: 'con-tcp', type: 'shared-tag' },
  
  // Cross-subject connections
  { source: 'sub-dsa', target: 'sub-dbms', type: 'prerequisite' },
  { source: 'sub-os', target: 'sub-cn', type: 'dependency' },
  
  // Concept interconnections
  { source: 'con-trees', target: 'con-indexing', type: 'dependency' },
  { source: 'con-ai', target: 'con-ethics', type: 'shared-tag' },
  { source: 'con-ai', target: 'sub-cn', type: 'dependency' },
  
  // Resource connections
  { source: 'res-btree', target: 'con-trees', type: 'shared-tag' },
  { source: 'res-btree', target: 'sub-dbms', type: 'dependency' },
  { source: 'res-avl', target: 'con-trees', type: 'shared-tag' },
  { source: 'res-avl', target: 'sub-dsa', type: 'dependency' },
]

// Mock ClassPaths for Dynamic Mastery
export const mockClassPaths: ClassPath[] = [
  {
    id: 'cp-1',
    subjectId: '1', // DBMS
    nodes: [
      {
        id: 'n1-1',
        label: 'ER Modeling Basics',
        completed: true,
        resourceIds: ['1'],
        x: 0,
        y: 0,
        order: 0,
      },
      {
        id: 'n1-2',
        label: 'Normalization Process',
        completed: true,
        resourceIds: ['1'],
        x: 0,
        y: 0,
        order: 1,
      },
      {
        id: 'n1-3',
        label: 'First Normal Form',
        completed: true,
        resourceIds: [],
        x: 0,
        y: 0,
        order: 2,
      },
      {
        id: 'n1-4',
        label: 'Second Normal Form',
        completed: false,
        resourceIds: [],
        x: 0,
        y: 0,
        order: 3,
      },
      {
        id: 'n1-5',
        label: 'Third Normal Form',
        completed: false,
        resourceIds: [],
        x: 0,
        y: 0,
        order: 4,
      },
      {
        id: 'n1-6',
        label: 'BCNF and Higher',
        completed: false,
        resourceIds: [],
        x: 0,
        y: 0,
        order: 5,
      },
    ],
  },
  {
    id: 'cp-2',
    subjectId: '2', // DSA
    nodes: [
      {
        id: 'n2-1',
        label: 'Arrays and Linked Lists',
        completed: true,
        resourceIds: [],
        x: 0,
        y: 0,
        order: 0,
      },
      {
        id: 'n2-2',
        label: 'Stacks and Queues',
        completed: true,
        resourceIds: [],
        x: 0,
        y: 0,
        order: 1,
      },
      {
        id: 'n2-3',
        label: 'Tree Basics',
        completed: true,
        resourceIds: ['2', '7'],
        x: 0,
        y: 0,
        order: 2,
      },
      {
        id: 'n2-4',
        label: 'Binary Search Trees',
        completed: true,
        resourceIds: [],
        x: 0,
        y: 0,
        order: 3,
      },
      {
        id: 'n2-5',
        label: 'AVL Trees',
        completed: false,
        resourceIds: ['2'],
        x: 0,
        y: 0,
        order: 4,
      },
      {
        id: 'n2-6',
        label: 'Balanced Trees',
        completed: false,
        resourceIds: [],
        x: 0,
        y: 0,
        order: 5,
      },
      {
        id: 'n2-7',
        label: 'Graph Algorithms',
        completed: false,
        resourceIds: [],
        x: 0,
        y: 0,
        order: 6,
      },
    ],
  },
  {
    id: 'cp-3',
    subjectId: '3', // Operating Systems
    nodes: [
      {
        id: 'n3-1',
        label: 'Process Management',
        completed: true,
        resourceIds: [],
        x: 0,
        y: 0,
        order: 0,
      },
      {
        id: 'n3-2',
        label: 'Process Scheduling',
        completed: false,
        resourceIds: ['3'],
        x: 0,
        y: 0,
        order: 1,
      },
      {
        id: 'n3-3',
        label: 'Synchronization',
        completed: false,
        resourceIds: [],
        x: 0,
        y: 0,
        order: 2,
      },
      {
        id: 'n3-4',
        label: 'Deadlock Prevention',
        completed: false,
        resourceIds: [],
        x: 0,
        y: 0,
        order: 3,
      },
      {
        id: 'n3-5',
        label: 'Memory Management',
        completed: false,
        resourceIds: ['8'],
        x: 0,
        y: 0,
        order: 4,
      },
    ],
  },
  {
    id: 'cp-4',
    subjectId: '4', // Computer Networks
    nodes: [
      {
        id: 'n4-1',
        label: 'Network Layers',
        completed: true,
        resourceIds: [],
        x: 0,
        y: 0,
        order: 0,
      },
      {
        id: 'n4-2',
        label: 'TCP/IP Protocol',
        completed: true,
        resourceIds: ['4'],
        x: 0,
        y: 0,
        order: 1,
      },
      {
        id: 'n4-3',
        label: 'Packet Analysis',
        completed: true,
        resourceIds: ['4'],
        x: 0,
        y: 0,
        order: 2,
      },
      {
        id: 'n4-4',
        label: 'Routing Protocols',
        completed: false,
        resourceIds: [],
        x: 0,
        y: 0,
        order: 3,
      },
      {
        id: 'n4-5',
        label: 'Network Security',
        completed: false,
        resourceIds: [],
        x: 0,
        y: 0,
        order: 4,
      },
    ],
  },
  {
    id: 'cp-5',
    subjectId: '5', // Machine Learning
    nodes: [
      {
        id: 'n5-1',
        label: 'ML Fundamentals',
        completed: true,
        resourceIds: [],
        x: 0,
        y: 0,
        order: 0,
      },
      {
        id: 'n5-2',
        label: 'Linear Regression',
        completed: true,
        resourceIds: ['5'],
        x: 0,
        y: 0,
        order: 1,
      },
      {
        id: 'n5-3',
        label: 'Classification',
        completed: false,
        resourceIds: [],
        x: 0,
        y: 0,
        order: 2,
      },
      {
        id: 'n5-4',
        label: 'Neural Networks',
        completed: false,
        resourceIds: [],
        x: 0,
        y: 0,
        order: 3,
      },
    ],
  },
  {
    id: 'cp-6',
    subjectId: '6', // Mathematics
    nodes: [
      {
        id: 'n6-1',
        label: 'Calculus Basics',
        completed: true,
        resourceIds: [],
        x: 0,
        y: 0,
        order: 0,
      },
      {
        id: 'n6-2',
        label: 'Differentiation',
        completed: true,
        resourceIds: [],
        x: 0,
        y: 0,
        order: 1,
      },
      {
        id: 'n6-3',
        label: 'Integration',
        completed: false,
        resourceIds: ['6'],
        x: 0,
        y: 0,
        order: 2,
      },
      {
        id: 'n6-4',
        label: 'Advanced Integration',
        completed: false,
        resourceIds: [],
        x: 0,
        y: 0,
        order: 3,
      },
    ],
  },
]

// Helper function to calculate danger score
export function calculateDangerScore(task: Task): number {
  const urgencyMultiplier = {
    critical: 4,
    high: 3,
    medium: 2,
    low: 1
  }
  
  // Use a fixed reference time (Unix epoch) to avoid hydration mismatch
  // Calculate hours until due relative to the task's dueDate properties
  const taskDue = new Date(task.dueDate).getTime()
  const baseTime = new Date('2024-01-15').getTime() // Fixed reference point
  const hoursUntilDue = Math.max(0, (taskDue - baseTime) / (1000 * 60 * 60))
  const timeUrgency = Math.max(0, 100 - hoursUntilDue * 2)
  const progressPenalty = 100 - task.progress
  const confidencePenalty = 100 - task.confidence
  
  return (
    (timeUrgency * urgencyMultiplier[task.urgency] * task.gradeWeight) +
    (progressPenalty * 0.5) +
    (confidencePenalty * 0.3)
  ) / 100
}

// Alias for backward compatibility
export function calculateTaskGravity(task: Task): number {
  return Math.round(calculateDangerScore(task))
}

// Get time until due
export function getTimeUntilDue(dueDate: string): string {
  const due = new Date(dueDate)
  const baseTime = new Date('2024-01-15') // Fixed reference point matching calculateDangerScore
  const diffMs = due.getTime() - baseTime.getTime()
  
  if (diffMs < 0) return 'Overdue'
  
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  
  if (diffHours < 1) return 'Less than 1h'
  if (diffHours < 24) return `${diffHours}h left`
  if (diffDays === 1) return 'Tomorrow'
  return `${diffDays} days left`
}

// Helper to format time ago (for issues/replies)
export function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMinutes = Math.floor(diffMs / (1000 * 60))
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  
  if (diffMinutes < 1) return 'Just now'
  if (diffMinutes < 60) return `${diffMinutes}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return `${diffDays}d ago`
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

// Helper to format relative time
export function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = date.getTime() - now.getTime()
  const diffHours = Math.round(diffMs / (1000 * 60 * 60))
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24))
  
  if (diffMs < 0) {
    const pastHours = Math.abs(diffHours)
    if (pastHours < 24) return `${pastHours}h ago`
    return `${Math.abs(diffDays)}d ago`
  }
  
  if (diffHours < 1) return 'Less than 1h'
  if (diffHours < 24) return `${diffHours}h left`
  if (diffDays === 1) return 'Tomorrow'
  return `${diffDays} days left`
}
