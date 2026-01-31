import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  ArrowLeft, TrendingUp, TrendingDown, Minus, Trophy, 
  Target, Clock, Calendar, Loader2, BarChart3, Zap,
  BookOpen, ChevronDown, ChevronUp
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getUserAdaptiveResults } from '@/services/adaptiveResultsService';
import { SKILL_TIERS, type TopicPerformance } from '@/types/adaptiveChallenge';
import { useAuth } from '@/hooks/useAuth';
import { format, formatDistanceToNow, parseISO } from 'date-fns';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, AreaChart, Area, BarChart, Bar, Cell
} from 'recharts';

interface HistoryEntry {
  id: string;
  created_at: string;
  subject: string;
  topics: string[];
  total_questions: number;
  correct_answers: number;
  skill_score: number;
  skill_tier: string;
  highest_level_reached: number;
  average_time_per_question: number;
  duration_seconds: number;
  topic_performance: TopicPerformance[];
}

const formatSubjectName = (subject: string) => {
  const names: Record<string, string> = {
    math: 'Mathematics',
    physics: 'Physics',
    chemistry: 'Chemistry',
  };
  return names[subject] || subject.charAt(0).toUpperCase() + subject.slice(1);
};

export default function AdaptiveHistory() {
  const { user, loading: authLoading } = useAuth();
  const [results, setResults] = useState<HistoryEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [showTopicCharts, setShowTopicCharts] = useState(true);
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);

  useEffect(() => {
    const fetchHistory = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }
      
      setIsLoading(true);
      const { data, error } = await getUserAdaptiveResults(50);
      
      if (error) {
        setError(error);
      } else {
        setResults((data || []) as HistoryEntry[]);
      }
      setIsLoading(false);
    };

    if (!authLoading) {
      fetchHistory();
    }
  }, [user, authLoading]);

  const filteredResults = useMemo(() => {
    if (selectedSubject === 'all') return results;
    return results.filter(r => r.subject === selectedSubject);
  }, [results, selectedSubject]);

  const subjects = useMemo(() => {
    const unique = [...new Set(results.map(r => r.subject))];
    return unique;
  }, [results]);

  // Prepare chart data (reverse chronological for chart)
  const chartData = useMemo(() => {
    return filteredResults
      .slice(0, 20)
      .reverse()
      .map((r, idx) => ({
        index: idx + 1,
        date: format(parseISO(r.created_at), 'MMM d'),
        score: r.skill_score,
        accuracy: Math.round((r.correct_answers / r.total_questions) * 100),
        level: r.highest_level_reached,
      }));
  }, [filteredResults]);

  // Calculate trends
  const trends = useMemo(() => {
    if (filteredResults.length < 2) return null;
    
    const recent = filteredResults.slice(0, 5);
    const older = filteredResults.slice(5, 10);
    
    if (older.length === 0) return null;
    
    const avgRecent = recent.reduce((sum, r) => sum + r.skill_score, 0) / recent.length;
    const avgOlder = older.reduce((sum, r) => sum + r.skill_score, 0) / older.length;
    const scoreDiff = avgRecent - avgOlder;
    
    const accRecent = recent.reduce((sum, r) => sum + (r.correct_answers / r.total_questions), 0) / recent.length;
    const accOlder = older.reduce((sum, r) => sum + (r.correct_answers / r.total_questions), 0) / older.length;
    const accDiff = (accRecent - accOlder) * 100;
    
    return { scoreDiff, accDiff };
  }, [filteredResults]);

  // Stats summary
  const stats = useMemo(() => {
    if (filteredResults.length === 0) return null;
    
    const bestScore = Math.max(...filteredResults.map(r => r.skill_score));
    const avgScore = filteredResults.reduce((sum, r) => sum + r.skill_score, 0) / filteredResults.length;
    const avgAccuracy = filteredResults.reduce((sum, r) => sum + (r.correct_answers / r.total_questions), 0) / filteredResults.length * 100;
    const highestLevel = Math.max(...filteredResults.map(r => r.highest_level_reached));
    const totalChallenges = filteredResults.length;
    
    return { bestScore, avgScore: Math.round(avgScore), avgAccuracy: Math.round(avgAccuracy), highestLevel, totalChallenges };
  }, [filteredResults]);

  // Aggregate topic performance data
  const topicStats = useMemo(() => {
    const topicMap = new Map<string, {
      accuracyHistory: { date: string; accuracy: number; attempts: number }[];
      totalAttempts: number;
      totalCorrect: number;
      latestAccuracy: number;
      trend: number;
    }>();

    // Process results in reverse order (oldest first) for chart data
    const sortedResults = [...filteredResults].reverse();
    
    for (const result of sortedResults) {
      const performances = (result.topic_performance || []) as TopicPerformance[];
      const dateStr = format(parseISO(result.created_at), 'MMM d');
      
      for (const perf of performances) {
        const existing = topicMap.get(perf.topicName) || {
          accuracyHistory: [],
          totalAttempts: 0,
          totalCorrect: 0,
          latestAccuracy: 0,
          trend: 0,
        };
        
        existing.accuracyHistory.push({
          date: dateStr,
          accuracy: perf.accuracy,
          attempts: perf.questionsAttempted,
        });
        existing.totalAttempts += perf.questionsAttempted;
        existing.totalCorrect += perf.correctAnswers;
        existing.latestAccuracy = perf.accuracy;
        
        topicMap.set(perf.topicName, existing);
      }
    }

    // Calculate trends for each topic
    for (const [, data] of topicMap) {
      if (data.accuracyHistory.length >= 2) {
        const recent = data.accuracyHistory.slice(-3);
        const older = data.accuracyHistory.slice(0, Math.max(1, data.accuracyHistory.length - 3));
        const avgRecent = recent.reduce((sum, r) => sum + r.accuracy, 0) / recent.length;
        const avgOlder = older.reduce((sum, r) => sum + r.accuracy, 0) / older.length;
        data.trend = avgRecent - avgOlder;
      }
    }

    // Convert to array and sort by total attempts
    const topicsArray = Array.from(topicMap.entries())
      .map(([name, data]) => ({
        name,
        ...data,
        avgAccuracy: data.totalAttempts > 0 
          ? Math.round((data.totalCorrect / data.totalAttempts) * 100)
          : 0,
      }))
      .sort((a, b) => b.totalAttempts - a.totalAttempts);

    return topicsArray;
  }, [filteredResults]);

  // Get data for selected topic's chart
  const selectedTopicData = useMemo(() => {
    if (!selectedTopic) return null;
    return topicStats.find(t => t.name === selectedTopic);
  }, [selectedTopic, topicStats]);

  // Bar chart data for topic overview
  const topicBarData = useMemo(() => {
    return topicStats.slice(0, 10).map(t => ({
      name: t.name.length > 12 ? t.name.slice(0, 12) + '...' : t.name,
      fullName: t.name,
      accuracy: t.avgAccuracy,
      attempts: t.totalAttempts,
    }));
  }, [topicStats]);

  const getTierInfo = (tierId: string) => {
    return SKILL_TIERS.find(t => t.id === tierId) || SKILL_TIERS[0];
  };

  const getTrendIcon = (diff: number) => {
    if (diff > 2) return <TrendingUp className="w-4 h-4 text-success" />;
    if (diff < -2) return <TrendingDown className="w-4 h-4 text-destructive" />;
    return <Minus className="w-4 h-4 text-muted-foreground" />;
  };

  const getAccuracyColor = (accuracy: number) => {
    if (accuracy >= 70) return 'hsl(var(--success))';
    if (accuracy >= 50) return 'hsl(var(--warning))';
    return 'hsl(var(--destructive))';
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <Trophy className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-foreground mb-2">Sign In to View History</h2>
          <p className="text-muted-foreground mb-6">
            Your challenge history is saved when you're signed in.
          </p>
          <Link to="/auth">
            <Button>Sign In</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground p-4">
        <div className="max-w-4xl mx-auto flex items-center gap-4">
          <Link to="/adaptive">
            <Button variant="ghost" size="icon" className="text-primary-foreground hover:bg-white/20">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-xl font-bold">Challenge History</h1>
            <p className="text-sm opacity-80">Track your progress over time</p>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-4 space-y-6">
        {/* Subject Filter */}
        {subjects.length > 1 && (
          <div className="flex gap-2 flex-wrap">
            <Button
              variant={selectedSubject === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedSubject('all')}
            >
              All Subjects
            </Button>
            {subjects.map(s => (
              <Button
                key={s}
                variant={selectedSubject === s ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedSubject(s)}
              >
                {formatSubjectName(s)}
              </Button>
            ))}
          </div>
        )}

        {error && (
          <div className="bg-destructive/10 text-destructive p-4 rounded-xl">
            {error}
          </div>
        )}

        {filteredResults.length === 0 ? (
          <div className="text-center py-16">
            <BarChart3 className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-bold text-foreground mb-2">No Challenges Yet</h2>
            <p className="text-muted-foreground mb-6">
              Complete an adaptive challenge to see your history here.
            </p>
            <Link to="/adaptive">
              <Button>Start a Challenge</Button>
            </Link>
          </div>
        ) : (
          <>
            {/* Stats Summary */}
            {stats && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="grid grid-cols-2 md:grid-cols-5 gap-3"
              >
                <div className="bg-card rounded-xl p-4 shadow-card">
                  <div className="text-xs text-muted-foreground mb-1">Best Score</div>
                  <div className="text-2xl font-bold text-primary">{stats.bestScore}</div>
                </div>
                <div className="bg-card rounded-xl p-4 shadow-card">
                  <div className="text-xs text-muted-foreground mb-1">Avg Score</div>
                  <div className="text-2xl font-bold text-foreground">{stats.avgScore}</div>
                </div>
                <div className="bg-card rounded-xl p-4 shadow-card">
                  <div className="text-xs text-muted-foreground mb-1">Avg Accuracy</div>
                  <div className="text-2xl font-bold text-foreground">{stats.avgAccuracy}%</div>
                </div>
                <div className="bg-card rounded-xl p-4 shadow-card">
                  <div className="text-xs text-muted-foreground mb-1">Highest Level</div>
                  <div className="text-2xl font-bold text-foreground">L{stats.highestLevel}</div>
                </div>
                <div className="bg-card rounded-xl p-4 shadow-card col-span-2 md:col-span-1">
                  <div className="text-xs text-muted-foreground mb-1">Challenges</div>
                  <div className="text-2xl font-bold text-foreground">{stats.totalChallenges}</div>
                </div>
              </motion.div>
            )}

            {/* Trends */}
            {trends && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-card rounded-xl p-4 shadow-card"
              >
                <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                  <Zap className="w-4 h-4 text-primary" />
                  Recent Trends
                </h3>
                <div className="flex gap-6">
                  <div className="flex items-center gap-2">
                    {getTrendIcon(trends.scoreDiff)}
                    <span className="text-sm text-muted-foreground">Score:</span>
                    <span className={`font-semibold ${trends.scoreDiff > 0 ? 'text-success' : trends.scoreDiff < 0 ? 'text-destructive' : 'text-muted-foreground'}`}>
                      {trends.scoreDiff > 0 ? '+' : ''}{Math.round(trends.scoreDiff)} pts
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {getTrendIcon(trends.accDiff)}
                    <span className="text-sm text-muted-foreground">Accuracy:</span>
                    <span className={`font-semibold ${trends.accDiff > 0 ? 'text-success' : trends.accDiff < 0 ? 'text-destructive' : 'text-muted-foreground'}`}>
                      {trends.accDiff > 0 ? '+' : ''}{Math.round(trends.accDiff)}%
                    </span>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Score Chart */}
            {chartData.length > 1 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-card rounded-xl p-4 shadow-card"
              >
                <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-primary" />
                  Score Progress
                </h3>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                      <defs>
                        <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis 
                        dataKey="date" 
                        tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                        axisLine={{ stroke: 'hsl(var(--border))' }}
                      />
                      <YAxis 
                        domain={[0, 100]}
                        tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                        axisLine={{ stroke: 'hsl(var(--border))' }}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px',
                        }}
                        labelStyle={{ color: 'hsl(var(--foreground))' }}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="score" 
                        stroke="hsl(var(--primary))"
                        fill="url(#scoreGradient)"
                        strokeWidth={2}
                        name="Score"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </motion.div>
            )}

            {/* Topic Performance Section */}
            {topicStats.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
                className="bg-card rounded-xl shadow-card overflow-hidden"
              >
                <button
                  onClick={() => setShowTopicCharts(!showTopicCharts)}
                  className="w-full p-4 flex items-center justify-between hover:bg-muted/50 transition-colors"
                >
                  <h3 className="font-semibold text-foreground flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-primary" />
                    Topic Performance
                  </h3>
                  {showTopicCharts ? (
                    <ChevronUp className="w-5 h-5 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-muted-foreground" />
                  )}
                </button>

                <AnimatePresence>
                  {showTopicCharts && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="p-4 pt-0 space-y-4">
                        {/* Topic Overview Bar Chart */}
                        {topicBarData.length > 0 && (
                          <div>
                            <p className="text-sm text-muted-foreground mb-3">
                              Average accuracy by topic (click a bar to see trends)
                            </p>
                            <div className="h-48">
                              <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={topicBarData} layout="vertical">
                                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                                  <XAxis 
                                    type="number" 
                                    domain={[0, 100]}
                                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
                                    axisLine={{ stroke: 'hsl(var(--border))' }}
                                  />
                                  <YAxis 
                                    type="category" 
                                    dataKey="name" 
                                    width={100}
                                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
                                    axisLine={{ stroke: 'hsl(var(--border))' }}
                                  />
                                  <Tooltip
                                    contentStyle={{
                                      backgroundColor: 'hsl(var(--card))',
                                      border: '1px solid hsl(var(--border))',
                                      borderRadius: '8px',
                                    }}
                                    labelStyle={{ color: 'hsl(var(--foreground))' }}
                                    formatter={(value: number, name: string, props: any) => [
                                      `${value}% (${props.payload.attempts} questions)`,
                                      'Accuracy'
                                    ]}
                                    labelFormatter={(label, payload) => payload?.[0]?.payload?.fullName || label}
                                  />
                                  <Bar 
                                    dataKey="accuracy" 
                                    radius={[0, 4, 4, 0]}
                                    onClick={(data) => setSelectedTopic(data.fullName)}
                                    style={{ cursor: 'pointer' }}
                                  >
                                    {topicBarData.map((entry, index) => (
                                      <Cell 
                                        key={`cell-${index}`} 
                                        fill={getAccuracyColor(entry.accuracy)}
                                        opacity={selectedTopic === entry.fullName ? 1 : 0.7}
                                      />
                                    ))}
                                  </Bar>
                                </BarChart>
                              </ResponsiveContainer>
                            </div>
                          </div>
                        )}

                        {/* Selected Topic Trend Chart */}
                        {selectedTopicData && selectedTopicData.accuracyHistory.length > 1 && (
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="border-t border-border pt-4"
                          >
                            <div className="flex items-center justify-between mb-3">
                              <div>
                                <h4 className="font-medium text-foreground">{selectedTopic}</h4>
                                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                                  <span>{selectedTopicData.totalAttempts} questions</span>
                                  <span className="flex items-center gap-1">
                                    {getTrendIcon(selectedTopicData.trend)}
                                    {selectedTopicData.trend > 0 ? '+' : ''}{Math.round(selectedTopicData.trend)}%
                                  </span>
                                </div>
                              </div>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => setSelectedTopic(null)}
                              >
                                Clear
                              </Button>
                            </div>
                            <div className="h-40">
                              <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={selectedTopicData.accuracyHistory}>
                                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                                  <XAxis 
                                    dataKey="date"
                                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
                                    axisLine={{ stroke: 'hsl(var(--border))' }}
                                  />
                                  <YAxis 
                                    domain={[0, 100]}
                                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
                                    axisLine={{ stroke: 'hsl(var(--border))' }}
                                  />
                                  <Tooltip
                                    contentStyle={{
                                      backgroundColor: 'hsl(var(--card))',
                                      border: '1px solid hsl(var(--border))',
                                      borderRadius: '8px',
                                    }}
                                    labelStyle={{ color: 'hsl(var(--foreground))' }}
                                    formatter={(value: number, name: string, props: any) => [
                                      `${value}% (${props.payload.attempts} questions)`,
                                      'Accuracy'
                                    ]}
                                  />
                                  <Line 
                                    type="monotone" 
                                    dataKey="accuracy" 
                                    stroke="hsl(var(--primary))"
                                    strokeWidth={2}
                                    dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2 }}
                                    activeDot={{ r: 6, fill: 'hsl(var(--primary))' }}
                                  />
                                </LineChart>
                              </ResponsiveContainer>
                            </div>
                          </motion.div>
                        )}

                        {/* Topic List with Trends */}
                        <div className="border-t border-border pt-4">
                          <p className="text-sm text-muted-foreground mb-3">All topics</p>
                          <div className="grid gap-2 max-h-60 overflow-y-auto">
                            {topicStats.map((topic, idx) => (
                              <motion.button
                                key={topic.name}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: idx * 0.02 }}
                                onClick={() => setSelectedTopic(topic.name)}
                                className={`flex items-center justify-between p-3 rounded-lg text-left transition-colors ${
                                  selectedTopic === topic.name 
                                    ? 'bg-primary/10 border border-primary/30' 
                                    : 'bg-muted/50 hover:bg-muted'
                                }`}
                              >
                                <div className="flex items-center gap-3">
                                  <div 
                                    className="w-2 h-8 rounded-full"
                                    style={{ backgroundColor: getAccuracyColor(topic.avgAccuracy) }}
                                  />
                                  <div>
                                    <span className="font-medium text-foreground text-sm">
                                      {topic.name}
                                    </span>
                                    <div className="text-xs text-muted-foreground">
                                      {topic.totalAttempts} questions
                                    </div>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <div className={`font-semibold ${
                                    topic.avgAccuracy >= 70 ? 'text-success' :
                                    topic.avgAccuracy >= 50 ? 'text-warning' : 'text-destructive'
                                  }`}>
                                    {topic.avgAccuracy}%
                                  </div>
                                  {topic.accuracyHistory.length >= 2 && (
                                    <div className={`text-xs flex items-center gap-1 justify-end ${
                                      topic.trend > 0 ? 'text-success' : 
                                      topic.trend < 0 ? 'text-destructive' : 'text-muted-foreground'
                                    }`}>
                                      {topic.trend > 2 && <TrendingUp className="w-3 h-3" />}
                                      {topic.trend < -2 && <TrendingDown className="w-3 h-3" />}
                                      {topic.trend > 0 ? '+' : ''}{Math.round(topic.trend)}%
                                    </div>
                                  )}
                                </div>
                              </motion.button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}

            {/* History List */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="space-y-3"
            >
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <Calendar className="w-4 h-4 text-primary" />
                All Attempts
              </h3>
              
              {filteredResults.map((result, index) => {
                const tier = getTierInfo(result.skill_tier);
                const accuracy = Math.round((result.correct_answers / result.total_questions) * 100);
                const prevResult = filteredResults[index + 1];
                const scoreDiff = prevResult ? result.skill_score - prevResult.skill_score : 0;
                
                return (
                  <motion.div
                    key={result.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.05 * Math.min(index, 10) }}
                    className="bg-card rounded-xl p-4 shadow-card border border-border"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-lg">{tier.emoji}</span>
                          <span className={`font-semibold bg-gradient-to-r ${tier.colorClass} bg-clip-text text-transparent`}>
                            {tier.title}
                          </span>
                          <span className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded">
                            {formatSubjectName(result.subject)}
                          </span>
                        </div>
                        
                        <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Target className="w-3 h-3" />
                            {accuracy}% accuracy
                          </span>
                          <span className="flex items-center gap-1">
                            <TrendingUp className="w-3 h-3" />
                            Level {result.highest_level_reached}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {Math.round(result.average_time_per_question)}s avg
                          </span>
                        </div>
                        
                        <div className="text-xs text-muted-foreground mt-2">
                          {formatDistanceToNow(parseISO(result.created_at), { addSuffix: true })}
                          {' • '}
                          {result.correct_answers}/{result.total_questions} correct
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className={`text-2xl font-bold bg-gradient-to-r ${tier.colorClass} bg-clip-text text-transparent`}>
                          {result.skill_score}
                        </div>
                        {scoreDiff !== 0 && (
                          <div className={`text-xs flex items-center justify-end gap-1 ${scoreDiff > 0 ? 'text-success' : 'text-destructive'}`}>
                            {scoreDiff > 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                            {scoreDiff > 0 ? '+' : ''}{scoreDiff}
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          </>
        )}
      </main>
    </div>
  );
}
