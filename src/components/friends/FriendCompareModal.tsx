import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { fetchAdaptiveResults } from '@/lib/api';
import { FriendProfile } from '@/types/friends';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  X, Star, Trophy, Flame, BookOpen, Target, 
  TrendingUp, Award, Zap
} from 'lucide-react';

interface FriendCompareModalProps {
  friend: FriendProfile;
  onClose: () => void;
}

interface CompareStats {
  total_stars: number;
  topics_mastered: number;
  current_streak: number;
  questions_answered: number;
  highest_level: number;
  avg_accuracy: number;
}

export const FriendCompareModal = ({ friend, onClose }: FriendCompareModalProps) => {
  const { profile, user } = useAuth();
  const [myStats, setMyStats] = useState<CompareStats | null>(null);
  const [friendStats, setFriendStats] = useState<CompareStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      if (!user?.id) return;
      
      try {
        const myResults = await fetchAdaptiveResults(user.id);
        const friendResults = await fetchAdaptiveResults(friend.user_id);

        const myHighestLevel = Math.max(0, ...myResults.map(r => r.highestLevelReached || 0));
        const myTotalCorrect = myResults.reduce((sum, r) => sum + (r.correctAnswers || 0), 0);
        const myTotalQuestions = myResults.reduce((sum, r) => sum + (r.totalQuestions || 0), 0);
        const myAccuracy = myTotalQuestions > 0 ? Math.round((myTotalCorrect / myTotalQuestions) * 100) : 0;

        const friendHighestLevel = Math.max(0, ...friendResults.map(r => r.highestLevelReached || 0));
        const friendTotalCorrect = friendResults.reduce((sum, r) => sum + (r.correctAnswers || 0), 0);
        const friendTotalQuestions = friendResults.reduce((sum, r) => sum + (r.totalQuestions || 0), 0);
        const friendAccuracy = friendTotalQuestions > 0 ? Math.round((friendTotalCorrect / friendTotalQuestions) * 100) : 0;

        setMyStats({
          total_stars: profile?.totalStars || 0,
          topics_mastered: profile?.topicsMastered || 0,
          current_streak: profile?.currentStreak || 0,
          questions_answered: profile?.questionsAnswered || 0,
          highest_level: myHighestLevel,
          avg_accuracy: myAccuracy,
        });

        setFriendStats({
          total_stars: friend.total_stars,
          topics_mastered: friend.topics_mastered,
          current_streak: friend.current_streak,
          questions_answered: friendTotalQuestions,
          highest_level: friendHighestLevel,
          avg_accuracy: friendAccuracy,
        });
      } catch (err) {
        console.error('Error fetching stats:', err);
      }

      setLoading(false);
    };

    fetchStats();
  }, [user?.id, friend, profile]);

  const comparisons = myStats && friendStats ? [
    { 
      label: 'Total Stars', 
      icon: Star, 
      iconColor: 'text-yellow-500',
      myValue: myStats.total_stars, 
      friendValue: friendStats.total_stars 
    },
    { 
      label: 'Topics Mastered', 
      icon: BookOpen, 
      iconColor: 'text-blue-500',
      myValue: myStats.topics_mastered, 
      friendValue: friendStats.topics_mastered 
    },
    { 
      label: 'Current Streak', 
      icon: Flame, 
      iconColor: 'text-orange-500',
      myValue: myStats.current_streak, 
      friendValue: friendStats.current_streak 
    },
    { 
      label: 'Highest Level', 
      icon: Trophy, 
      iconColor: 'text-purple-500',
      myValue: myStats.highest_level, 
      friendValue: friendStats.highest_level 
    },
    { 
      label: 'Accuracy', 
      icon: Target, 
      iconColor: 'text-green-500',
      myValue: myStats.avg_accuracy, 
      friendValue: friendStats.avg_accuracy,
      suffix: '%'
    },
    { 
      label: 'Questions Answered', 
      icon: Zap, 
      iconColor: 'text-cyan-500',
      myValue: myStats.questions_answered, 
      friendValue: friendStats.questions_answered 
    },
  ] : [];

  const myWins = comparisons.filter(c => c.myValue > c.friendValue).length;
  const friendWins = comparisons.filter(c => c.friendValue > c.myValue).length;

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
        <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-6 text-white relative">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-full"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-3">
            <Trophy className="w-8 h-8" />
            <div>
              <h2 className="text-xl font-bold">Compare Progress</h2>
              <p className="text-white/80 text-sm">You vs {friend.display_name}</p>
            </div>
          </div>

          {/* Score Summary */}
          {!loading && (
            <div className="mt-4 flex items-center justify-between bg-white/20 rounded-lg p-3">
              <div className="text-center">
                <p className="text-2xl font-bold">{myWins}</p>
                <p className="text-xs text-white/80">You Win</p>
              </div>
              <div className="text-center">
                <Award className="w-8 h-8 mx-auto" />
                <p className="text-xs text-white/80">Stats</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold">{friendWins}</p>
                <p className="text-xs text-white/80">{friend.display_name.split(' ')[0]} Wins</p>
              </div>
            </div>
          )}
        </div>

        {/* Comparisons */}
        <div className="p-4 space-y-4 max-h-96 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
            </div>
          ) : (
            comparisons.map((comp, index) => {
              const total = comp.myValue + comp.friendValue;
              const myPercent = total > 0 ? (comp.myValue / total) * 100 : 50;
              const iWin = comp.myValue > comp.friendValue;
              const tie = comp.myValue === comp.friendValue;

              return (
                <motion.div
                  key={comp.label}
                  className="space-y-2"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <comp.icon className={`w-4 h-4 ${comp.iconColor}`} />
                      <span className="text-muted-foreground">{comp.label}</span>
                    </div>
                    {!tie && (
                      <TrendingUp className={`w-4 h-4 ${iWin ? 'text-success' : 'text-destructive rotate-180'}`} />
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className={`font-bold min-w-[60px] text-right ${iWin && !tie ? 'text-success' : ''}`}>
                      {comp.myValue}{comp.suffix || ''}
                    </span>
                    <div className="flex-1 h-3 bg-muted rounded-full overflow-hidden flex">
                      <div 
                        className={`h-full transition-all ${iWin ? 'bg-success' : tie ? 'bg-primary' : 'bg-primary/50'}`}
                        style={{ width: `${myPercent}%` }}
                      />
                      <div 
                        className={`h-full transition-all ${!iWin ? 'bg-pink-500' : tie ? 'bg-pink-500' : 'bg-pink-500/50'}`}
                        style={{ width: `${100 - myPercent}%` }}
                      />
                    </div>
                    <span className={`font-bold min-w-[60px] ${!iWin && !tie ? 'text-pink-500' : ''}`}>
                      {comp.friendValue}{comp.suffix || ''}
                    </span>
                  </div>
                </motion.div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t">
          <Button onClick={onClose} className="w-full">
            Close
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
};
