import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  User, Award, Trophy, Star, GraduationCap, Download, 
  ArrowLeft, TrendingUp, Target, Clock, Sparkles, 
  Medal, Crown, BookOpen, Brain, ChevronRight, Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/hooks/useAuth';
import { fetchAdaptiveResults } from '@/lib/api';
import { LEVEL_REWARDS, getLevelReward, getHighestUnlockedReward, getTotalBonusStars } from '@/data/levelRewards';
import { exportCertificateToPdf } from '@/utils/exportCertificate';

interface AdaptiveResult {
  id: string;
  subject: string;
  skill_score: number;
  skill_tier: string;
  highest_level_reached: number;
  total_questions: number;
  correct_answers: number;
  created_at: string;
}

const Profile = () => {
  const navigate = useNavigate();
  const { user, profile, loading } = useAuth();
  const [adaptiveResults, setAdaptiveResults] = useState<AdaptiveResult[]>([]);
  const [isLoadingResults, setIsLoadingResults] = useState(true);
  const [downloadingCert, setDownloadingCert] = useState<number | null>(null);

  // Redirect to auth if not logged in
  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    const fetchResults = async () => {
      if (!user) return;
      
      try {
        const data = await fetchAdaptiveResults(user.id);
        setAdaptiveResults(data.map(r => ({
          id: r.id,
          subject: r.subject,
          skill_score: parseFloat(r.skillScore),
          skill_tier: r.skillTier,
          highest_level_reached: r.highestLevelReached,
          total_questions: r.totalQuestions,
          correct_answers: r.correctAnswers,
          created_at: r.createdAt,
        })));
      } catch (err) {
        console.error('Error fetching results:', err);
      } finally {
        setIsLoadingResults(false);
      }
    };

    fetchResults();
  }, [user]);

  // Calculate highest level reached across all subjects
  const highestLevelReached = adaptiveResults.length > 0
    ? Math.max(...adaptiveResults.map(r => r.highest_level_reached))
    : 0;

  // Get unlocked rewards (levels passed)
  const unlockedRewards = LEVEL_REWARDS.filter(r => r.level <= highestLevelReached);
  const highestReward = getHighestUnlockedReward(highestLevelReached);
  const totalBonusStars = getTotalBonusStars(highestLevelReached);

  // Calculate stats by subject
  const subjectStats = adaptiveResults.reduce((acc, result) => {
    if (!acc[result.subject]) {
      acc[result.subject] = {
        attempts: 0,
        bestScore: 0,
        highestLevel: 0,
        totalQuestions: 0,
        totalCorrect: 0,
      };
    }
    acc[result.subject].attempts++;
    acc[result.subject].bestScore = Math.max(acc[result.subject].bestScore, result.skill_score);
    acc[result.subject].highestLevel = Math.max(acc[result.subject].highestLevel, result.highest_level_reached);
    acc[result.subject].totalQuestions += result.total_questions;
    acc[result.subject].totalCorrect += result.correct_answers;
    return acc;
  }, {} as Record<string, { attempts: number; bestScore: number; highestLevel: number; totalQuestions: number; totalCorrect: number }>);

  const handleDownloadCertificate = async (level: number, subject: string = 'All Subjects') => {
    const reward = getLevelReward(level);
    if (!reward || !profile) return;

    setDownloadingCert(level);
    
    // Small delay for UX
    await new Promise(resolve => setTimeout(resolve, 300));

    exportCertificateToPdf({
      studentName: profile.displayName,
      level,
      reward,
      subject,
      date: new Date(),
      grade: profile.grade || undefined,
    });

    setDownloadingCert(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user || !profile) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <motion.header 
        className="bg-gradient-to-r from-violet-600 via-purple-600 to-pink-600 text-white py-6 px-4"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link to="/">
                <Button variant="ghost" size="sm" className="text-white hover:bg-white/20">
                  <ArrowLeft className="w-4 h-4 mr-1" />
                  Back
                </Button>
              </Link>
              <div className="flex items-center gap-2">
                <User className="w-6 h-6" />
                <h1 className="text-xl md:text-2xl font-bold">My Profile</h1>
              </div>
            </div>
            
            {/* Grade Badge */}
            <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-3 py-1.5">
              <GraduationCap className="w-5 h-5" />
              <span className="font-bold">Class {profile.grade || 7}</span>
            </div>
          </div>
        </div>
      </motion.header>

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Profile Overview Card */}
        <motion.div
          className="bg-card rounded-2xl shadow-card p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex flex-col sm:flex-row items-center gap-6">
            {/* Avatar */}
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-4xl">
                {highestReward?.badge.icon || '👤'}
              </div>
              {highestReward && (
                <motion.div
                  className="absolute -bottom-2 -right-2 bg-primary text-primary-foreground rounded-full px-2 py-0.5 text-xs font-bold"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                >
                  {highestReward.title}
                </motion.div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 text-center sm:text-left">
              <h2 className="text-2xl font-bold text-foreground">{profile.displayName}</h2>
              <p className="text-muted-foreground">Class {profile.grade || 7} Student</p>
              
              {/* Quick Stats */}
              <div className="flex flex-wrap justify-center sm:justify-start gap-4 mt-4">
                <div className="flex items-center gap-1.5">
                  <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                  <span className="font-semibold">{(profile.totalStars || 0) + totalBonusStars}</span>
                  <span className="text-sm text-muted-foreground">Stars</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Target className="w-5 h-5 text-success" />
                  <span className="font-semibold">{profile.questionsAnswered || 0}</span>
                  <span className="text-sm text-muted-foreground">Questions</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Trophy className="w-5 h-5 text-amber-500" />
                  <span className="font-semibold">{profile.topicsMastered || 0}</span>
                  <span className="text-sm text-muted-foreground">Mastered</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Badges & Titles */}
        <motion.div
          className="bg-card rounded-2xl shadow-card p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
            <Award className="w-5 h-5 text-primary" />
            Badges & Titles
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-3">
            {LEVEL_REWARDS.map((reward) => {
              const isUnlocked = reward.level <= highestLevelReached;
              
              return (
                <motion.div
                  key={reward.level}
                  className={`relative p-3 rounded-xl text-center transition-all ${
                    isUnlocked 
                      ? 'bg-gradient-to-br from-primary/10 to-secondary/10 border-2 border-primary/30' 
                      : 'bg-muted/50 opacity-50'
                  }`}
                  whileHover={isUnlocked ? { scale: 1.05 } : {}}
                >
                  <div className="text-3xl mb-1">{reward.badge.icon}</div>
                  <div className="text-xs font-medium text-foreground truncate">{reward.badge.name.replace(' Badge', '')}</div>
                  <div className="text-xs text-muted-foreground">L{reward.level}</div>
                  
                  {!isUnlocked && (
                    <div className="absolute inset-0 flex items-center justify-center bg-background/50 rounded-xl">
                      <span className="text-xl">🔒</span>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>

          {/* Current Title */}
          {highestReward && (
            <div className="mt-4 p-4 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-xl text-center">
              <p className="text-sm text-muted-foreground">Current Title</p>
              <p className="text-xl font-bold text-primary">{highestReward.badge.icon} {highestReward.title}</p>
              <p className="text-sm text-muted-foreground mt-1">{highestReward.percentileMessage}</p>
            </div>
          )}
        </motion.div>

        {/* Certificates */}
        <motion.div
          className="bg-card rounded-2xl shadow-card p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
            <Medal className="w-5 h-5 text-amber-500" />
            Certificates
          </h3>

          {unlockedRewards.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Trophy className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>Complete levels in Adaptive Assessment to earn certificates!</p>
              <Link to="/adaptive">
                <Button variant="outline" className="mt-3">
                  <Brain className="w-4 h-4 mr-2" />
                  Take Assessment
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {unlockedRewards.map((reward) => (
                <motion.div
                  key={reward.level}
                  className="flex items-center justify-between p-4 bg-muted rounded-xl"
                  whileHover={{ scale: 1.01 }}
                >
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">{reward.badge.icon}</div>
                    <div>
                      <p className="font-semibold text-foreground">{reward.certificate.name}</p>
                      <p className="text-sm text-muted-foreground">{reward.certificate.description}</p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDownloadCertificate(reward.level)}
                    disabled={downloadingCert === reward.level}
                  >
                    {downloadingCert === reward.level ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <Download className="w-4 h-4 mr-1" />
                        Download
                      </>
                    )}
                  </Button>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Subject Progress */}
        <motion.div
          className="bg-card rounded-2xl shadow-card p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-success" />
            Progress by Subject
          </h3>

          {isLoadingResults ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : Object.keys(subjectStats).length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <TrendingUp className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>No assessment data yet. Take your first assessment!</p>
              <Link to="/adaptive">
                <Button variant="outline" className="mt-3">
                  <Brain className="w-4 h-4 mr-2" />
                  Start Assessment
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {Object.entries(subjectStats).map(([subject, stats]) => {
                const accuracy = stats.totalQuestions > 0 
                  ? Math.round((stats.totalCorrect / stats.totalQuestions) * 100) 
                  : 0;
                
                return (
                  <div key={subject} className="p-4 bg-muted rounded-xl">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">
                          {subject === 'math' ? '🔢' : subject === 'science' ? '🔬' : '📚'}
                        </span>
                        <span className="font-semibold capitalize">{subject}</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm">
                        <span className="text-muted-foreground">{stats.attempts} attempts</span>
                        <span className="font-bold text-primary">Best: {stats.bestScore}/100</span>
                      </div>
                    </div>
                    
                    <Progress value={stats.bestScore} className="h-2 mb-2" />
                    
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>Highest Level: L{stats.highestLevel}</span>
                      <span>Accuracy: {accuracy}%</span>
                      <span>{stats.totalQuestions} questions answered</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          className="grid sm:grid-cols-3 gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Link to="/" className="block">
            <Button variant="outline" className="w-full py-6 flex-col h-auto">
              <BookOpen className="w-6 h-6 mb-2" />
              <span>Practice Mode</span>
            </Button>
          </Link>
          <Link to="/adaptive" className="block">
            <Button variant="outline" className="w-full py-6 flex-col h-auto">
              <Brain className="w-6 h-6 mb-2" />
              <span>Take Assessment</span>
            </Button>
          </Link>
          <Link to="/adaptive/history" className="block">
            <Button variant="outline" className="w-full py-6 flex-col h-auto">
              <Clock className="w-6 h-6 mb-2" />
              <span>View History</span>
            </Button>
          </Link>
        </motion.div>
      </main>
    </div>
  );
};

export default Profile;
