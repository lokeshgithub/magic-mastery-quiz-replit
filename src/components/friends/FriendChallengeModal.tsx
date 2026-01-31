import { useState } from 'react';
import { motion } from 'framer-motion';
import { FriendProfile } from '@/types/friends';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  X, Swords, Loader2, Check
} from 'lucide-react';
import { generateRoomCode } from '@/types/battle';

interface FriendChallengeModalProps {
  friend: FriendProfile;
  currentSubject: string;
  topics: string[];
  onSend: (subject: string, topic: string, roomCode: string) => Promise<void>;
  onClose: () => void;
}

const formatTopicName = (name: string) => {
  return name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
};

export const FriendChallengeModal = ({ 
  friend, 
  currentSubject, 
  topics, 
  onSend, 
  onClose 
}: FriendChallengeModalProps) => {
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  const handleSend = async () => {
    if (!selectedTopic) return;
    setSending(true);
    
    // Generate a room code for the battle
    const roomCode = generateRoomCode();
    await onSend(currentSubject, selectedTopic, roomCode);
    setSending(false);
  };

  return (
    <motion.div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="bg-card rounded-2xl shadow-2xl max-w-md w-full max-h-[85vh] overflow-hidden"
        initial={{ scale: 0.9, y: 50 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 50 }}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-500 to-red-500 p-6 text-white relative">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-full"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-3">
            <Swords className="w-8 h-8" />
            <div>
              <h2 className="text-xl font-bold">Challenge Friend</h2>
              <p className="text-white/80 text-sm">Send a battle invite</p>
            </div>
          </div>

          {/* Friend Info */}
          <div className="mt-4 flex items-center gap-3 bg-white/20 rounded-lg p-3">
            <Avatar>
              <AvatarImage src={friend.avatar_url || undefined} />
              <AvatarFallback>{friend.display_name[0]?.toUpperCase()}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">{friend.display_name}</p>
              <p className="text-xs text-white/80">Will receive your challenge</p>
            </div>
          </div>
        </div>

        {/* Topic Selection */}
        <div className="p-4">
          <h3 className="font-bold text-lg mb-3">Select Topic</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Subject: <span className="font-medium capitalize">{currentSubject}</span>
          </p>
          
          <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto">
            {topics.map((topic) => (
              <Button
                key={topic}
                variant={selectedTopic === topic ? 'default' : 'outline'}
                onClick={() => setSelectedTopic(topic)}
                className="h-auto py-3 text-left justify-start"
              >
                {selectedTopic === topic && <Check className="w-4 h-4 mr-2" />}
                {formatTopicName(topic)}
              </Button>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t flex gap-2">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button 
            onClick={handleSend} 
            disabled={!selectedTopic || sending}
            className="flex-1 bg-gradient-to-r from-orange-500 to-red-500"
          >
            {sending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <Swords className="w-4 h-4 mr-2" />
                Send Challenge
              </>
            )}
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
};
