import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { SessionAnalysis } from '@/types/quiz';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { BarChart3, Clock, Target, TrendingUp, Gauge, BookOpen, X, Loader2, Download, Timer, AlertCircle, CheckCircle2 } from 'lucide-react';
import { generateSessionAnalysis } from '@/lib/api';
import { exportSessionToPdf } from '@/utils/exportPdf';

interface SessionSummaryProps {
  analysis: SessionAnalysis;
  subject: string;
  onClose: () => void;
}

const formatTime = (seconds: number) => {
  if (seconds < 60) return `${Math.round(seconds)}s`;
  const mins = Math.floor(seconds / 60);
  const secs = Math.round(seconds % 60);
  return `${mins}m ${secs}s`;
};

const formatName = (name: string) => {
  return name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
};

export const SessionSummary = ({ analysis, subject, onClose }: SessionSummaryProps) => {
  const [recommendations, setRecommendations] = useState<string>('');
  const [isLoadingAI, setIsLoadingAI] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [studentName, setStudentName] = useState('');
  const [showNameInput, setShowNameInput] = useState(false);

  // Calculate efficiency metrics
  const efficiencyMetrics = useMemo(() => {
    const BENCHMARK_TIME = 45; // seconds average expected
    const avgTime = analysis.averageTimePerQuestion;
    
    const speedScore = avgTime > 0 ? Math.min(100, Math.round((BENCHMARK_TIME / avgTime) * 100)) : 0;
    const accuracyScore = Math.round(analysis.overallAccuracy * 100);
    const efficiencyScore = Math.round((accuracyScore * 0.7) + (speedScore * 0.3));
    
    // Categorize topics
    const topicMetrics = analysis.topicAnalyses.map(t => {
      const topicSpeedScore = t.averageTimeSeconds > 0 ? Math.min(1, BENCHMARK_TIME / t.averageTimeSeconds) : 0;
      const topicEffScore = (t.accuracy * 0.7) + (topicSpeedScore * 0.3);
      return {
        ...t,
        efficiencyScore: Math.round(topicEffScore * 100),
        isEfficient: topicEffScore >= 0.75,
        needsSpeedWork: t.accuracy >= 0.7 && t.averageTimeSeconds > 45,
        needsAccuracyWork: t.accuracy < 0.7,
      };
    });

    return {
      speedScore,
      accuracyScore,
      efficiencyScore,
      topicMetrics,
      fastAccurateCount: topicMetrics.filter(t => t.isEfficient).length,
      slowAccurateCount: topicMetrics.filter(t => t.needsSpeedWork).length,
      needsPracticeCount: topicMetrics.filter(t => t.needsAccuracyWork).length,
    };
  }, [analysis]);

  const handleExportClick = () => {
    setShowNameInput(true);
  };

  const handleExportPdf = async () => {
    setIsExporting(true);
    try {
      const trimmedName = studentName.trim().slice(0, 100); // Validate: max 100 chars
      exportSessionToPdf(analysis, subject, recommendations, trimmedName || undefined);
      setShowNameInput(false);
      setStudentName('');
    } catch (error) {
      console.error('Error exporting PDF:', error);
    } finally {
      setIsExporting(false);
    }
  };

  useEffect(() => {
    const fetchRecommendations = async () => {
      if (analysis.totalQuestions === 0) {
        setIsLoadingAI(false);
        return;
      }

      try {
        const data = await generateSessionAnalysis({
          subject,
          topicAnalyses: analysis.topicAnalyses,
          strengths: analysis.strengths,
          weaknesses: analysis.weaknesses,
          slowTopics: analysis.slowTopics,
          fastTopics: analysis.fastTopics,
          overallAccuracy: analysis.overallAccuracy,
          totalQuestions: analysis.totalQuestions,
          averageTimePerQuestion: analysis.averageTimePerQuestion,
        });

        setRecommendations(data.recommendations || '');
      } catch (error) {
        console.error('Error fetching AI recommendations:', error);
        setRecommendations('Keep practicing! Focus on topics where you scored below 80% and review explanations for questions you missed.');
      } finally {
        setIsLoadingAI(false);
      }
    };

    fetchRecommendations();
  }, [analysis, subject]);

  if (analysis.totalQuestions === 0) {
    return (
      <motion.div
        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <Card className="max-w-lg w-full p-6 text-center">
          <p className="text-muted-foreground mb-4">No questions answered in this session.</p>
          <Button onClick={onClose}>Close</Button>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <motion.div
        className="bg-card rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
      >
        {/* Header */}
        <div className="bg-gradient-magical p-6 text-white relative">
          <button onClick={onClose} className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-full">
            <X className="w-5 h-5" />
          </button>
          <h2 className="text-2xl font-bold mb-2">📊 Session Summary</h2>
          <p className="text-white/80">Here's how you performed!</p>
        </div>

        <div className="p-6 space-y-6">
          {/* Overview Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-muted rounded-xl p-4 text-center">
              <Target className="w-6 h-6 mx-auto mb-2 text-primary" />
              <div className="text-2xl font-bold">{analysis.totalQuestions}</div>
              <div className="text-xs text-muted-foreground">Questions</div>
            </div>
            <div className="bg-muted rounded-xl p-4 text-center">
              <TrendingUp className="w-6 h-6 mx-auto mb-2 text-success" />
              <div className="text-2xl font-bold">{Math.round(analysis.overallAccuracy * 100)}%</div>
              <div className="text-xs text-muted-foreground">Accuracy</div>
            </div>
            <div className="bg-muted rounded-xl p-4 text-center">
              <Clock className="w-6 h-6 mx-auto mb-2 text-amber-500" />
              <div className="text-2xl font-bold">{formatTime(analysis.averageTimePerQuestion)}</div>
              <div className="text-xs text-muted-foreground">Avg Time</div>
            </div>
            <div className="bg-muted rounded-xl p-4 text-center">
              <Gauge className="w-6 h-6 mx-auto mb-2 text-primary" />
              <div className="text-2xl font-bold">{efficiencyMetrics.efficiencyScore}</div>
              <div className="text-xs text-muted-foreground">Efficiency</div>
            </div>
          </div>

          {/* Efficiency Breakdown */}
          <div className="bg-primary/10 rounded-xl p-4 border border-primary/20">
            <h3 className="font-bold text-foreground mb-3 flex items-center gap-2">
              <Gauge className="w-5 h-5 text-primary" /> Efficiency Analysis
            </h3>
            <div className="grid grid-cols-3 gap-3 mb-3">
              <div className="text-center p-2 bg-background/50 rounded-lg">
                <div className="text-lg font-bold text-success">{efficiencyMetrics.fastAccurateCount}</div>
                <div className="text-xs text-muted-foreground">Efficient</div>
              </div>
              <div className="text-center p-2 bg-background/50 rounded-lg">
                <div className="text-lg font-bold text-amber-500">{efficiencyMetrics.slowAccurateCount}</div>
                <div className="text-xs text-muted-foreground">Need Speed</div>
              </div>
              <div className="text-center p-2 bg-background/50 rounded-lg">
                <div className="text-lg font-bold text-destructive">{efficiencyMetrics.needsPracticeCount}</div>
                <div className="text-xs text-muted-foreground">Need Practice</div>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">Speed Score:</span>
              <Progress value={efficiencyMetrics.speedScore} className="flex-1 h-2" />
              <span className="font-medium">{efficiencyMetrics.speedScore}%</span>
            </div>
          </div>
          {/* Topic Breakdown with Efficiency */}
          <div>
            <h3 className="font-bold text-foreground mb-3 flex items-center gap-2">
              <BarChart3 className="w-5 h-5" /> Topic Performance
            </h3>
            <div className="space-y-3">
              {efficiencyMetrics.topicMetrics.map((topic) => (
                <div key={topic.topic} className="bg-muted rounded-lg p-3">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium">{formatName(topic.topic)}</span>
                    <div className="flex items-center gap-2 text-sm">
                      <span className={topic.accuracy >= 0.8 ? 'text-success' : topic.accuracy >= 0.6 ? 'text-amber-500' : 'text-destructive'}>
                        {Math.round(topic.accuracy * 100)}%
                      </span>
                      <span className="text-muted-foreground flex items-center gap-1">
                        <Timer className="w-3 h-3" />
                        {formatTime(topic.averageTimeSeconds)}
                      </span>
                    </div>
                  </div>
                  <Progress value={topic.accuracy * 100} className="h-2" />
                  <div className="flex gap-2 mt-2 flex-wrap">
                    {topic.isEfficient && (
                      <span className="text-xs bg-success/20 text-success px-2 py-0.5 rounded flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Efficient
                      </span>
                    )}
                    {topic.needsSpeedWork && (
                      <span className="text-xs bg-amber-500/20 text-amber-600 px-2 py-0.5 rounded flex items-center gap-1">
                        <Timer className="w-3 h-3" /> Speed Drill Needed
                      </span>
                    )}
                    {topic.needsAccuracyWork && (
                      <span className="text-xs bg-destructive/20 text-destructive px-2 py-0.5 rounded flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" /> Review Concepts
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* AI Recommendations */}
          <div className="bg-primary/5 rounded-xl p-4 border border-primary/20">
            <h3 className="font-bold text-foreground mb-3 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-primary" /> AI Coach Recommendations
            </h3>
            {isLoadingAI ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
                <span className="ml-2 text-muted-foreground">Analyzing your performance...</span>
              </div>
            ) : (
              <div className="text-sm text-foreground space-y-1">
                {recommendations.split('\n').map((line, i) => {
                  // Format headers
                  if (line.startsWith('## ')) {
                    return <h4 key={i} className="font-bold text-primary mt-3 mb-1 text-base">{line.replace('## ', '')}</h4>;
                  }
                  // Format bullet points
                  if (line.startsWith('- ') || line.startsWith('• ')) {
                    return <p key={i} className="ml-4 mb-1">{line}</p>;
                  }
                  // Regular paragraphs
                  if (line.trim()) {
                    return <p key={i} className="mb-1">{line}</p>;
                  }
                  return null;
                })}
              </div>
            )}
          </div>

          {/* Export Name Input */}
          {showNameInput && (
            <motion.div 
              className="bg-muted rounded-xl p-4 border border-border"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
            >
              <label className="block text-sm font-medium text-foreground mb-2">
                Student Name (optional)
              </label>
              <input
                type="text"
                value={studentName}
                onChange={(e) => setStudentName(e.target.value.slice(0, 100))}
                placeholder="Enter your name for the report..."
                className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                maxLength={100}
              />
              <div className="flex gap-2 mt-3">
                <Button 
                  onClick={() => setShowNameInput(false)} 
                  variant="ghost" 
                  size="sm"
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleExportPdf} 
                  size="sm"
                  className="flex-1"
                  disabled={isExporting}
                >
                  {isExporting ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Download className="w-4 h-4 mr-2" />
                  )}
                  Download PDF
                </Button>
              </div>
            </motion.div>
          )}

          <div className="flex gap-3">
            <Button 
              onClick={handleExportClick} 
              variant="outline" 
              size="lg"
              className="flex-1"
              disabled={isExporting || isLoadingAI || showNameInput}
            >
              <Download className="w-4 h-4 mr-2" />
              Export PDF
            </Button>
            <Button onClick={onClose} className="flex-1" size="lg">
              Continue Practicing
            </Button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};
