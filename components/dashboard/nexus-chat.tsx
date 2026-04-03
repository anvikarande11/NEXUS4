'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { X, Send, MessageCircle, Loader } from 'lucide-react'
import { useDashboardStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useState } from 'react'

const mockResponses = {
  default: [
    "AVL trees are self-balancing binary search trees where the heights of left and right subtrees differ by at most 1. When inserting nodes, rotations maintain this balance property. Left rotations help when the right subtree is heavier, and right rotations when the left subtree is heavier. This ensures O(log n) search, insert, and delete operations.",
    "For database normalization, First Normal Form (1NF) requires atomicity—no repeating groups. Second Normal Form (2NF) removes partial dependencies where non-key attributes depend only on part of a composite key. Third Normal Form (3NF) eliminates transitive dependencies. BCNF ensures every determinant is a candidate key. Higher normalization reduces redundancy but may impact performance.",
    "Process scheduling algorithms like Round Robin give each process equal CPU time slices, preventing starvation but causing high context switching. Priority-based scheduling favors critical processes. Shortest Job First minimizes average wait time but is hard to predict. Multilevel feedback queues combine multiple approaches. Choose based on system goals: fairness, throughput, or responsiveness.",
    "TCP/IP establishes connections via three-way handshake: SYN, SYN-ACK, ACK. Data flows in segments with sequence numbers for ordering and retransmission. ACKs confirm receipt. Connection closes with FIN flags. This guarantees reliable, ordered delivery. UDP skips handshakes and is connectionless, faster but unreliable—use for streaming or gaming.",
    "Linear regression minimizes squared prediction errors using the least-squares method. The line y = mx + b fits training data where m is slope and b is intercept. Gradient descent iteratively adjusts parameters. Correlation (R²) measures fit quality. Multiple regression extends this to multiple features. Watch for overfitting—use validation sets and regularization techniques.",
    "Integration techniques: substitution works when inner functions compose well. Integration by parts reverses the product rule—useful for polynomials times exponentials. Partial fractions decompose rational functions. Trigonometric integrals use identities. Numerical integration (Simpson's rule, trapezoidal rule) approximates when analytical solutions don't exist. Practice recognizing which technique applies.",
  ],
  short: [
    "BST deletion has three cases: no children (remove), one child (replace with child), two children (use inorder successor or predecessor). Your code might be missing the third case.",
    "Normalization prevents data anomalies. Apply 1NF (no repeats), 2NF (no partial deps), 3NF (no transitive deps). Your ER diagram looks solid—ensure each table represents one entity.",
    "Deadlock: mutual exclusion, hold and wait, no preemption, circular wait. Banker's algorithm prevents deadlock by only allowing safe resource allocations. Your simulator should check all conditions.",
    "TCP handshake is SYN→SYN-ACK→ACK. Your packet capture should show these flags. Wireshark filters: 'tcp.flags.syn==1' for SYN packets.",
    "Regularization (L1, L2) prevents overfitting. Cross-validation tests generalization. Your model's training vs test accuracy gap suggests overfitting.",
  ]
}

export function NexusChat() {
  const { isChatOpen, toggleChat, chatMessages, addChatMessage } = useDashboardStore()
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const getContextualResponse = (userMessage: string): string => {
    const keywords = userMessage.toLowerCase()
    
    if (keywords.includes('delete') || keywords.includes('bst')) {
      return mockResponses.default[0]
    } else if (keywords.includes('normal') || keywords.includes('3nf') || keywords.includes('bcnf')) {
      return mockResponses.default[1]
    } else if (keywords.includes('schedule') || keywords.includes('process')) {
      return mockResponses.default[2]
    } else if (keywords.includes('tcp') || keywords.includes('packet')) {
      return mockResponses.default[3]
    } else if (keywords.includes('regression') || keywords.includes('ml')) {
      return mockResponses.default[4]
    } else if (keywords.includes('integral') || keywords.includes('calculus')) {
      return mockResponses.default[5]
    }
    
    // Default random from comprehensive list
    return mockResponses.default[Math.floor(Math.random() * mockResponses.default.length)]
  }

  const handleSend = async () => {
    if (!input.trim()) return

    addChatMessage({
      role: 'user',
      content: input
    })
    
    const userQuery = input
    setInput('')

    // Quick response with full answer
    setIsLoading(true)
    setTimeout(() => {
      addChatMessage({
        role: 'assistant',
        content: getContextualResponse(userQuery)
      })
      setIsLoading(false)
    }, 300) // Fast response
  }

  return (
    <AnimatePresence>
      {isChatOpen && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="fixed bottom-6 right-6 z-40 w-96 bg-card border border-border rounded-2xl shadow-2xl flex flex-col h-[32rem]"
        >
          {/* Header */}
          <div className="border-b border-border p-4 flex items-center justify-between bg-gradient-to-r from-primary/10 to-transparent rounded-t-2xl">
            <div className="flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-primary" />
              <h3 className="font-semibold text-card-foreground">Nexus AI</h3>
            </div>
            <button
              onClick={toggleChat}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {chatMessages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <MessageCircle className="w-8 h-8 text-muted-foreground/40 mb-2" />
                <p className="text-sm text-muted-foreground">
                  Hi! I&apos;m your AI study companion. Ask me anything about your courses!
                </p>
              </div>
            ) : (
              chatMessages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg p-3 text-sm ${
                      msg.role === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {msg.content}
                  </div>
                </motion.div>
              ))
            )}
            {isLoading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center gap-2 text-muted-foreground"
              >
                <Loader className="w-4 h-4 animate-spin" />
                <span className="text-xs">Thinking...</span>
              </motion.div>
            )}
          </div>

          {/* Input */}
          <div className="border-t border-border p-3 flex gap-2 bg-muted/20 rounded-b-2xl">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask Nexus..."
              className="text-sm bg-background/50"
            />
            <Button
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              size="sm"
              className="rounded-lg"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
