import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Trophy, Medal, Crown, User, TrendingUp, Target, 
  Loader2, RefreshCw, ChevronDown, Star
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getAdaptiveLeaderboard, getUserRank, type LeaderboardEntry, type UserRankInfo } from '@/services/adaptiveResultsService';
import { SKILL_TIERS } from '@/types/adaptiveChallenge';
import type { Subject } from '@/types/quiz';

interface AdaptiveLeaderboardProps {
  initialSubject?: Subject;
  onClose?: () => void;
}

const SUBJECT_OPTIONS = [
  { value: '', label: 'All Subjects' },
  { value: 'math', label: 'Mathematics' },
  { value: 'physics', label: 'Physics' },
  { value: 'chemistry', label: 'Chemistry' },
];

export const AdaptiveLeaderboard = ({ 
  initialSubject,
  onClose 
}: AdaptiveLeaderboardProps) => {
  const [subject, setSubject] = useState<string>(initialSubject || '');
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [userRank, setUserRank] = useState<UserRankInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showSubjectDropdown, setShowSubjectDropdown] = useState(false);

  const fetchLeaderboard = async () => {
    setIsLoading(true);
    setError(null);
    
    // Fetch both leaderboard and user rank in parallel
    const [leaderboardResult, rankResult] = await Promise.all([
      getAdaptiveLeaderboard(subject || undefined),
      getUserRank(subject || undefined),
    ]);
    
    if (leaderboardResult.error) {
      setError(leaderboardResult.error);
    } else {
      setEntries(leaderboardResult.data || []);
    }
    
    setUserRank(rankResult.data);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchLeaderboard();
  }, [subject]);

  const getTierInfo = (tierId: string) => {
    return SKILL_TIERS.find(t => t.id === tierId) || SKILL_TIERS[0];
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="w-5 h-5 text-yellow-500" />;
      case 2:
        return <Medal className="w-5 h-5 text-slate-400" />;
      case 3:
        return <Medal className="w-5 h-5 text-amber-600" />;
      default:
        return <span className="w-5 h-5 flex items-center justify-center text-sm font-bold text-muted-foreground">{rank}</span>;
    }
  };

  const getRankBgClass = (rank: number) => {
    switch (rank) {
      case 1:
        return 'bg-gradient-to-r from-yellow-500/20 to-amber-500/10 border-yellow-500/30';
      case 2:
        return 'bg-gradient-to-r from-slate-400/20 to-slate-300/10 border-slate-400/30';
      case 3:
        return 'bg-gradient-to-r from-amber-600/20 to-orange-500/10 border-amber-600/30';
      default:
        return 'bg-card border-border';
    }
  };

  return (
    <div className="bg-card rounded-2xl shadow-card overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-primary/80 p-4 text-primary-foreground">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Trophy className="w-6 h-6" />
            <h2 className="text-xl font-bold">Leaderboard</h2>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={fetchLeaderboard}
            disabled={isLoading}
            className="text-primary-foreground hover:bg-white/20"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
        
        {/* Subject Filter */}
        <div className="mt-3 relative">
          <button
            onClick={() => setShowSubjectDropdown(!showSubjectDropdown)}
            className="w-full flex items-center justify-between bg-white/10 hover:bg-white/20 rounded-lg px-3 py-2 text-sm transition-colors"
          >
            <span>{SUBJECT_OPTIONS.find(s => s.value === subject)?.label || 'All Subjects'}</span>
            <ChevronDown className={`w-4 h-4 transition-transform ${showSubjectDropdown ? 'rotate-180' : ''}`} />
          </button>
          
          <AnimatePresence>
            {showSubjectDropdown && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute top-full left-0 right-0 mt-1 bg-card rounded-lg shadow-lg border border-border overflow-hidden z-10"
              >
                {SUBJECT_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => {
                      setSubject(option.value);
                      setShowSubjectDropdown(false);
                    }}
                    className={`w-full px-3 py-2 text-left text-sm hover:bg-muted transition-colors ${
                      subject === option.value ? 'bg-primary/10 text-primary font-medium' : 'text-foreground'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* My Rank Card */}
      {userRank && (
        <div className="px-4 pt-4">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-primary/20 to-accent/20 border-2 border-primary/30 rounded-xl p-3"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                <Star className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1">
                <div className="text-xs text-muted-foreground font-medium">Your Rank</div>
                <div className="flex items-center gap-2">
                  <span className="text-xl font-bold text-foreground">#{userRank.rank}</span>
                  <span className="text-sm text-muted-foreground">
                    of {userRank.totalParticipants}
                  </span>
                  <span className="text-lg">{getTierInfo(userRank.skill_tier).emoji}</span>
                </div>
              </div>
              <div className="text-right">
                <div className={`text-lg font-bold bg-gradient-to-r ${getTierInfo(userRank.skill_tier).colorClass} bg-clip-text text-transparent`}>
                  {userRank.skill_score}
                </div>
                <div className="text-xs text-muted-foreground">
                  {userRank.accuracy}% • L{userRank.highest_level}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Content */}
      <div className="p-4 max-h-[500px] overflow-y-auto">
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
          </div>
        )}

        {error && (
          <div className="text-center py-8 text-destructive">
            <p>{error}</p>
            <Button variant="outline" size="sm" onClick={fetchLeaderboard} className="mt-2">
              Try Again
            </Button>
          </div>
        )}

        {!isLoading && !error && entries.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <Trophy className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="font-medium">No entries yet!</p>
            <p className="text-sm mt-1">Be the first to complete an adaptive challenge.</p>
          </div>
        )}

        {!isLoading && !error && entries.length > 0 && (
          <div className="space-y-2">
            {entries.map((entry, index) => {
              const tier = getTierInfo(entry.skill_tier);
              
              return (
                <motion.div
                  key={`${entry.display_name}-${index}`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`flex items-center gap-3 p-3 rounded-xl border ${getRankBgClass(entry.rank)}`}
                >
                  {/* Rank */}
                  <div className="w-8 flex items-center justify-center">
                    {getRankIcon(entry.rank)}
                  </div>

                  {/* Avatar */}
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={entry.avatar_url || undefined} />
                    <AvatarFallback className="bg-muted">
                      <User className="w-5 h-5 text-muted-foreground" />
                    </AvatarFallback>
                  </Avatar>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-foreground truncate">
                        {entry.display_name}
                      </span>
                      <span className="text-lg" title={tier.title}>
                        {tier.emoji}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Target className="w-3 h-3" />
                        {entry.accuracy}%
                      </span>
                      <span className="flex items-center gap-1">
                        <TrendingUp className="w-3 h-3" />
                        L{entry.highest_level}
                      </span>
                      <span>{entry.challenges_completed} challenge{entry.challenges_completed !== 1 ? 's' : ''}</span>
                    </div>
                  </div>

                  {/* Score */}
                  <div className="text-right">
                    <div className={`text-lg font-bold bg-gradient-to-r ${tier.colorClass} bg-clip-text text-transparent`}>
                      {entry.skill_score}
                    </div>
                    <div className="text-xs text-muted-foreground">points</div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer */}
      {onClose && (
        <div className="p-4 border-t border-border">
          <Button variant="outline" onClick={onClose} className="w-full">
            Close
          </Button>
        </div>
      )}
    </div>
  );
};
