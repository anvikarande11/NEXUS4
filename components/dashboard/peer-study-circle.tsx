'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { X, Users, Plus, Clock, Zap, MessageCircle, DoorOpen } from 'lucide-react'
import { useDashboardStore, type StudyRoom, type StudyPeer } from '@/lib/store'
import { Button } from '@/components/ui/button'

const statusColors = {
  studying: 'bg-green-500',
  available: 'bg-yellow-500',
  away: 'bg-gray-500'
}

const statusLabels = {
  studying: 'Studying',
  available: 'Available',
  away: 'Away'
}

function StatusBadge({ status }: { status: StudyPeer['status'] }) {
  return (
    <div className={`${statusColors[status]} w-3 h-3 rounded-full`} />
  )
}

function PeerAvatar({ peer }: { peer: StudyPeer }) {
  return (
    <motion.div
      whileHover={{ scale: 1.1 }}
      className="relative"
      title={`${peer.name} - ${statusLabels[peer.status]} (${peer.timeOnline}min)`}
    >
      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-xs font-bold text-white">
        {peer.avatar}
      </div>
      <div className={`absolute bottom-0 right-0 ${statusColors[peer.status]} w-3 h-3 rounded-full border border-card`} />
    </motion.div>
  )
}

function StudyRoomCard({ room, isActive, onJoin, onLeave }: {
  room: StudyRoom
  isActive: boolean
  onJoin: () => void
  onLeave: () => void
}) {
  return (
    <motion.div
      layout
      className={`p-4 rounded-xl border transition-all ${
        isActive
          ? 'border-primary bg-primary/10 ring-2 ring-primary/30'
          : 'border-border hover:border-primary/50'
      }`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="font-semibold text-sm text-card-foreground">{room.name}</h3>
          <p className="text-xs text-muted-foreground mt-0.5">{room.topic}</p>
        </div>
        {room.pomodoroActive && (
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
            className="flex items-center gap-1 px-2 py-1 rounded-lg bg-destructive/20 text-destructive text-xs font-medium"
          >
            <Zap className="w-3 h-3" />
            {room.focusTime}min
          </motion.div>
        )}
      </div>

      {/* Peer Avatars */}
      <div className="flex gap-2 mb-3">
        {room.peers.map(peer => (
          <PeerAvatar key={peer.id} peer={peer} />
        ))}
        <div className="text-xs text-muted-foreground flex items-center mt-0.5">
          {room.peers.length} online
        </div>
      </div>

      {/* Action */}
      {isActive ? (
        <Button
          variant="outline"
          size="sm"
          onClick={onLeave}
          className="w-full"
        >
          <DoorOpen className="w-3 h-3 mr-1" />
          Leave Room
        </Button>
      ) : (
        <Button
          size="sm"
          onClick={onJoin}
          className="w-full"
        >
          <Users className="w-3 h-3 mr-1" />
          Join Study Room
        </Button>
      )}
    </motion.div>
  )
}

export function PeerStudyCircle() {
  const {
    isPeerStudyOpen,
    togglePeerStudy,
    studyRooms,
    activeStudyRoomId,
    joinStudyRoom,
    leaveStudyRoom,
    onlinePeers
  } = useDashboardStore()

  const activeRoom = studyRooms.find(r => r.id === activeStudyRoomId)

  return (
    <AnimatePresence>
      {isPeerStudyOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            className="bg-card border border-border rounded-2xl shadow-xl w-full max-w-2xl max-h-[80vh] overflow-y-auto"
          >
            {/* Header */}
            <div className="border-b border-border p-6 flex items-center justify-between sticky top-0 bg-card">
              <div>
                <h2 className="text-lg font-bold text-card-foreground flex items-center gap-2">
                  <Users className="w-5 h-5 text-primary" />
                  Peer Study Circle
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Join study rooms and collaborate with classmates
                </p>
              </div>
              <button
                onClick={togglePeerStudy}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Online Peers */}
              <div>
                <h3 className="text-sm font-semibold text-card-foreground mb-3 flex items-center gap-2">
                  <Users className="w-4 h-4 text-primary" />
                  Online Right Now ({onlinePeers.length})
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {onlinePeers.map(peer => (
                    <motion.div
                      key={peer.id}
                      whileHover={{ scale: 1.05 }}
                      className="p-3 rounded-lg bg-muted/50 border border-border hover:border-primary/50 transition-all cursor-pointer text-center group"
                    >
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-xs font-bold text-white mx-auto mb-2 group-hover:scale-110 transition-transform">
                        {peer.avatar}
                      </div>
                      <p className="text-xs font-medium text-card-foreground">{peer.name}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{peer.topic}</p>
                      <div className="flex items-center gap-1 justify-center mt-2">
                        <StatusBadge status={peer.status} />
                        <span className="text-xs text-muted-foreground">{statusLabels[peer.status]}</span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Study Rooms */}
              <div>
                <h3 className="text-sm font-semibold text-card-foreground mb-3 flex items-center gap-2">
                  <MessageCircle className="w-4 h-4 text-primary" />
                  Active Study Rooms
                </h3>
                <div className="grid gap-4">
                  {studyRooms.map(room => (
                    <StudyRoomCard
                      key={room.id}
                      room={room}
                      isActive={activeStudyRoomId === room.id}
                      onJoin={() => joinStudyRoom(room.id)}
                      onLeave={leaveStudyRoom}
                    />
                  ))}
                </div>
              </div>

              {/* Active Room Details */}
              {activeRoom && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 rounded-lg bg-primary/10 border border-primary/30 space-y-3"
                >
                  <p className="text-sm font-medium text-primary">
                    ✓ You&apos;re now in {activeRoom.name}
                  </p>
                  
                  {/* Pomodoro Timer */}
                  {activeRoom.pomodoroActive && (
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-primary" />
                      <div className="flex-1">
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-muted-foreground">Focus Time</span>
                          <span className="font-semibold text-card-foreground">{activeRoom.focusTime}:00</span>
                        </div>
                        <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: '100%' }}
                            animate={{ width: '30%' }}
                            transition={{ duration: 60, ease: 'linear' }}
                            className="h-full bg-primary rounded-full"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Room Peers */}
                  <div>
                    <p className="text-xs font-medium text-card-foreground mb-2">Room Participants</p>
                    <div className="flex gap-2 flex-wrap">
                      {activeRoom.peers.map(peer => (
                        <div
                          key={peer.id}
                          className="flex items-center gap-1 px-2 py-1 rounded-lg bg-card border border-border text-xs"
                        >
                          <PeerAvatar peer={peer} />
                          <span className="text-card-foreground">{peer.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Recommended Actions */}
              <div className="p-4 rounded-lg bg-muted/30 border border-border space-y-2">
                <p className="text-sm font-medium text-card-foreground mb-3">Quick Actions</p>
                <div className="grid grid-cols-2 gap-2">
                  <Button variant="outline" size="sm">
                    <Plus className="w-3 h-3 mr-1" />
                    Create Room
                  </Button>
                  <Button variant="outline" size="sm">
                    <Zap className="w-3 h-3 mr-1" />
                    Start Pomodoro
                  </Button>
                  <Button variant="outline" size="sm">
                    <MessageCircle className="w-3 h-3 mr-1" />
                    Room Chat
                  </Button>
                  <Button variant="outline" size="sm">
                    <Users className="w-3 h-3 mr-1" />
                    Ask for Help
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
