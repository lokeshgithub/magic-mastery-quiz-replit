import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useFriends } from '@/hooks/useFriends';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { 
  Users, Search, UserPlus, X, Check, Loader2, 
  Star, Trophy, Flame, Swords, MessageCircle, 
  UserMinus, Send, Clock
} from 'lucide-react';
import { FriendWithProfile, SearchResult } from '@/types/friends';
import { FriendCompareModal } from './FriendCompareModal';
import { FriendChallengeModal } from './FriendChallengeModal';

interface FriendsPanelProps {
  currentSubject: string;
  topics: string[];
  onJoinBattle: (roomCode: string) => void;
}

export const FriendsPanel = ({ currentSubject, topics, onJoinBattle }: FriendsPanelProps) => {
  const { user } = useAuth();
  const friends = useFriends();
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [selectedFriend, setSelectedFriend] = useState<FriendWithProfile | null>(null);
  const [showCompare, setShowCompare] = useState(false);
  const [showChallenge, setShowChallenge] = useState(false);

  const handleSearch = async () => {
    if (searchQuery.length < 2) return;
    setSearching(true);
    const results = await friends.searchUsers(searchQuery);
    setSearchResults(results);
    setSearching(false);
  };

  const handleSendRequest = async (userId: string) => {
    await friends.sendFriendRequest(userId);
    setSearchResults(prev => 
      prev.map(r => r.user_id === userId ? { ...r, friendship_status: 'pending' as const } : r)
    );
  };

  const handleCompare = (friend: FriendWithProfile) => {
    setSelectedFriend(friend);
    setShowCompare(true);
  };

  const handleChallenge = (friend: FriendWithProfile) => {
    setSelectedFriend(friend);
    setShowChallenge(true);
  };

  const handleAcceptChallenge = async (challengeId: string, roomCode: string | null) => {
    const challenge = await friends.acceptChallenge(challengeId);
    if (challenge && roomCode) {
      setIsOpen(false);
      onJoinBattle(roomCode);
    }
  };

  if (!user) return null;

  const totalPending = friends.pendingRequests.length + friends.incomingChallenges.length;

  return (
    <>
      {/* Floating Button */}
      <motion.button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-20 z-40 bg-gradient-to-r from-blue-500 to-cyan-500 text-white p-4 rounded-full shadow-lg"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        <Users className="w-6 h-6" />
        {totalPending > 0 && (
          <span className="absolute -top-1 -right-1 bg-destructive text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
            {totalPending}
          </span>
        )}
      </motion.button>

      {/* Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-card rounded-2xl shadow-2xl max-w-lg w-full max-h-[85vh] overflow-hidden"
              initial={{ scale: 0.9, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 50 }}
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-blue-500 to-cyan-500 p-6 text-white relative">
                <button 
                  onClick={() => setIsOpen(false)}
                  className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-full"
                >
                  <X className="w-5 h-5" />
                </button>
                
                <div className="flex items-center gap-3">
                  <Users className="w-8 h-8" />
                  <div>
                    <h2 className="text-xl font-bold">Friends</h2>
                    <p className="text-white/80 text-sm">{friends.friends.length} friends</p>
                  </div>
                </div>
              </div>

              <Tabs defaultValue="friends" className="w-full">
                <TabsList className="w-full rounded-none border-b">
                  <TabsTrigger value="friends" className="flex-1">
                    Friends
                  </TabsTrigger>
                  <TabsTrigger value="requests" className="flex-1 relative">
                    Requests
                    {friends.pendingRequests.length > 0 && (
                      <Badge variant="destructive" className="ml-1 h-5 w-5 p-0 text-xs">
                        {friends.pendingRequests.length}
                      </Badge>
                    )}
                  </TabsTrigger>
                  <TabsTrigger value="challenges" className="flex-1 relative">
                    Challenges
                    {friends.incomingChallenges.length > 0 && (
                      <Badge variant="destructive" className="ml-1 h-5 w-5 p-0 text-xs">
                        {friends.incomingChallenges.length}
                      </Badge>
                    )}
                  </TabsTrigger>
                  <TabsTrigger value="search" className="flex-1">
                    <Search className="w-4 h-4" />
                  </TabsTrigger>
                </TabsList>

                {/* Friends List */}
                <TabsContent value="friends" className="p-4 max-h-96 overflow-y-auto">
                  {friends.loading ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="w-6 h-6 animate-spin text-primary" />
                    </div>
                  ) : friends.friends.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p>No friends yet</p>
                      <p className="text-sm">Search for classmates to add!</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {friends.friends.map((friendship) => (
                        <FriendCard 
                          key={friendship.id}
                          friendship={friendship}
                          onCompare={() => handleCompare(friendship)}
                          onChallenge={() => handleChallenge(friendship)}
                          onRemove={() => friends.removeFriend(friendship.id)}
                        />
                      ))}
                    </div>
                  )}
                </TabsContent>

                {/* Pending Requests */}
                <TabsContent value="requests" className="p-4 max-h-96 overflow-y-auto">
                  {friends.pendingRequests.length === 0 && friends.sentRequests.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <MessageCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p>No pending requests</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {friends.pendingRequests.length > 0 && (
                        <div>
                          <h4 className="text-sm font-medium text-muted-foreground mb-2">Incoming</h4>
                          <div className="space-y-2">
                            {friends.pendingRequests.map((req) => (
                              <RequestCard 
                                key={req.id}
                                friendship={req}
                                type="incoming"
                                onAccept={() => friends.acceptRequest(req.id)}
                                onDecline={() => friends.declineRequest(req.id)}
                              />
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {friends.sentRequests.length > 0 && (
                        <div>
                          <h4 className="text-sm font-medium text-muted-foreground mb-2">Sent</h4>
                          <div className="space-y-2">
                            {friends.sentRequests.map((req) => (
                              <RequestCard 
                                key={req.id}
                                friendship={req}
                                type="sent"
                                onDecline={() => friends.declineRequest(req.id)}
                              />
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </TabsContent>

                {/* Challenges */}
                <TabsContent value="challenges" className="p-4 max-h-96 overflow-y-auto">
                  {friends.incomingChallenges.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Swords className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p>No pending challenges</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {friends.incomingChallenges.map((challenge) => (
                        <ChallengeCard 
                          key={challenge.id}
                          challenge={challenge}
                          onAccept={() => handleAcceptChallenge(challenge.id, challenge.room_code)}
                          onDecline={() => friends.declineChallenge(challenge.id)}
                        />
                      ))}
                    </div>
                  )}
                </TabsContent>

                {/* Search */}
                <TabsContent value="search" className="p-4">
                  <div className="flex gap-2 mb-4">
                    <Input
                      placeholder="Search by name..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    />
                    <Button onClick={handleSearch} disabled={searching || searchQuery.length < 2}>
                      {searching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                    </Button>
                  </div>

                  <div className="space-y-2 max-h-72 overflow-y-auto">
                    {searchResults.map((result) => (
                      <SearchResultCard 
                        key={result.user_id}
                        result={result}
                        onAddFriend={() => handleSendRequest(result.user_id)}
                      />
                    ))}
                    {searchResults.length === 0 && searchQuery.length >= 2 && !searching && (
                      <p className="text-center text-muted-foreground py-4">No users found</p>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Compare Modal */}
      {selectedFriend && showCompare && (
        <FriendCompareModal 
          friend={selectedFriend.friend}
          onClose={() => setShowCompare(false)}
        />
      )}

      {/* Challenge Modal */}
      {selectedFriend && showChallenge && (
        <FriendChallengeModal 
          friend={selectedFriend.friend}
          currentSubject={currentSubject}
          topics={topics}
          onSend={async (subject, topic, roomCode) => {
            await friends.sendChallenge(selectedFriend.friend.user_id, subject, topic, roomCode);
            setShowChallenge(false);
          }}
          onClose={() => setShowChallenge(false)}
        />
      )}
    </>
  );
};

// Friend Card Component
const FriendCard = ({ 
  friendship, 
  onCompare, 
  onChallenge, 
  onRemove 
}: { 
  friendship: FriendWithProfile;
  onCompare: () => void;
  onChallenge: () => void;
  onRemove: () => void;
}) => {
  const [showActions, setShowActions] = useState(false);

  return (
    <motion.div 
      className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors"
      onHoverStart={() => setShowActions(true)}
      onHoverEnd={() => setShowActions(false)}
    >
      <Avatar>
        <AvatarImage src={friendship.friend.avatar_url || undefined} />
        <AvatarFallback>{friendship.friend.display_name[0]?.toUpperCase()}</AvatarFallback>
      </Avatar>
      
      <div className="flex-1 min-w-0">
        <p className="font-medium truncate">{friendship.friend.display_name}</p>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Star className="w-3 h-3 text-yellow-500" />
            {friendship.friend.total_stars}
          </span>
          <span className="flex items-center gap-1">
            <Flame className="w-3 h-3 text-orange-500" />
            {friendship.friend.current_streak}
          </span>
        </div>
      </div>

      <AnimatePresence>
        {showActions && (
          <motion.div 
            className="flex gap-1"
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
          >
            <Button size="sm" variant="ghost" onClick={onCompare} className="h-8 w-8 p-0">
              <Trophy className="w-4 h-4" />
            </Button>
            <Button size="sm" variant="ghost" onClick={onChallenge} className="h-8 w-8 p-0">
              <Swords className="w-4 h-4" />
            </Button>
            <Button size="sm" variant="ghost" onClick={onRemove} className="h-8 w-8 p-0 text-destructive hover:text-destructive">
              <UserMinus className="w-4 h-4" />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// Request Card Component
const RequestCard = ({ 
  friendship, 
  type,
  onAccept,
  onDecline 
}: { 
  friendship: FriendWithProfile;
  type: 'incoming' | 'sent';
  onAccept?: () => void;
  onDecline: () => void;
}) => (
  <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
    <Avatar>
      <AvatarImage src={friendship.friend.avatar_url || undefined} />
      <AvatarFallback>{friendship.friend.display_name[0]?.toUpperCase()}</AvatarFallback>
    </Avatar>
    
    <div className="flex-1 min-w-0">
      <p className="font-medium truncate">{friendship.friend.display_name}</p>
      <p className="text-xs text-muted-foreground">
        {type === 'incoming' ? 'Wants to be friends' : 'Request pending'}
      </p>
    </div>

    <div className="flex gap-1">
      {type === 'incoming' && onAccept && (
        <Button size="sm" variant="ghost" onClick={onAccept} className="h-8 w-8 p-0 text-success hover:text-success">
          <Check className="w-4 h-4" />
        </Button>
      )}
      <Button size="sm" variant="ghost" onClick={onDecline} className="h-8 w-8 p-0 text-destructive hover:text-destructive">
        <X className="w-4 h-4" />
      </Button>
    </div>
  </div>
);

// Challenge Card Component
const ChallengeCard = ({ 
  challenge, 
  onAccept,
  onDecline 
}: { 
  challenge: any;
  onAccept: () => void;
  onDecline: () => void;
}) => (
  <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-orange-500/10 to-red-500/10 rounded-lg border border-orange-500/20">
    <Avatar>
      <AvatarImage src={challenge.challenger?.avatar_url || undefined} />
      <AvatarFallback>{challenge.challenger?.display_name?.[0]?.toUpperCase() || '?'}</AvatarFallback>
    </Avatar>
    
    <div className="flex-1 min-w-0">
      <p className="font-medium truncate">{challenge.challenger?.display_name || 'Someone'}</p>
      <p className="text-xs text-muted-foreground flex items-center gap-1">
        <Swords className="w-3 h-3" />
        {challenge.topic} • {challenge.subject}
      </p>
      <p className="text-xs text-muted-foreground flex items-center gap-1">
        <Clock className="w-3 h-3" />
        Expires in {Math.round((new Date(challenge.expires_at).getTime() - Date.now()) / 60000)}m
      </p>
    </div>

    <div className="flex gap-1">
      <Button size="sm" onClick={onAccept} className="bg-gradient-to-r from-orange-500 to-red-500 text-white">
        Accept
      </Button>
      <Button size="sm" variant="ghost" onClick={onDecline} className="text-destructive">
        <X className="w-4 h-4" />
      </Button>
    </div>
  </div>
);

// Search Result Card Component
const SearchResultCard = ({ 
  result, 
  onAddFriend 
}: { 
  result: SearchResult;
  onAddFriend: () => void;
}) => (
  <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
    <Avatar>
      <AvatarImage src={result.avatar_url || undefined} />
      <AvatarFallback>{result.display_name[0]?.toUpperCase()}</AvatarFallback>
    </Avatar>
    
    <div className="flex-1 min-w-0">
      <p className="font-medium truncate">{result.display_name}</p>
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <Star className="w-3 h-3 text-yellow-500" />
          {result.total_stars}
        </span>
        {result.grade && <span>Grade {result.grade}</span>}
      </div>
    </div>

    {result.friendship_status === 'none' && (
      <Button size="sm" variant="outline" onClick={onAddFriend}>
        <UserPlus className="w-4 h-4 mr-1" />
        Add
      </Button>
    )}
    {result.friendship_status === 'pending' && (
      <Badge variant="secondary">
        <Send className="w-3 h-3 mr-1" />
        Sent
      </Badge>
    )}
    {result.friendship_status === 'incoming' && (
      <Badge variant="outline">Pending</Badge>
    )}
    {result.friendship_status === 'accepted' && (
      <Badge variant="default">
        <Check className="w-3 h-3 mr-1" />
        Friends
      </Badge>
    )}
  </div>
);
