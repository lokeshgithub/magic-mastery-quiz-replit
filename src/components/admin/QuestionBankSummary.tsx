import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Database, RefreshCw, BookOpen, Layers, Trash2, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { deleteTopicById, BLUEPRINT_TOPICS, getQuestionSummary } from '@/services/questionService';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from '@/components/ui/badge';

interface TopicSummary {
  subject: string;
  topic: string;
  topicId: string;
  questionCount: number;
  isBlueprint: boolean;
}

interface SubjectSummary {
  name: string;
  topicCount: number;
  questionCount: number;
  topics: TopicSummary[];
}

interface QuestionBankSummaryProps {
  onDataChange?: () => void;
}

export function QuestionBankSummary({ onDataChange }: QuestionBankSummaryProps) {
  const [subjects, setSubjects] = useState<SubjectSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedSubject, setExpandedSubject] = useState<string | null>(null);
  const [deletingTopicId, setDeletingTopicId] = useState<string | null>(null);

  const fetchSummary = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const apiSummary = await getQuestionSummary();
      
      // Build summary from API response
      const summaryMap = new Map<string, SubjectSummary>();

      for (const subjectData of apiSummary.subjects || []) {
        const subject: SubjectSummary = {
          name: subjectData.name,
          topicCount: subjectData.topics?.length || 0,
          questionCount: subjectData.topics?.reduce((sum, t) => sum + (t.count || 0), 0) || 0,
          topics: [],
        };

        for (const topicData of subjectData.topics || []) {
          const blueprintTopics = BLUEPRINT_TOPICS[subjectData.name] || [];
          const isBlueprint = blueprintTopics.some(
            bt => bt.toLowerCase() === topicData.name.toLowerCase()
          );

          subject.topics.push({
            subject: subjectData.name,
            topic: topicData.name,
            topicId: topicData.id,
            questionCount: topicData.count || 0,
            isBlueprint,
          });
        }

        // Sort topics within each subject (non-blueprint first, then alphabetically)
        subject.topics.sort((a, b) => {
          if (a.isBlueprint !== b.isBlueprint) {
            return a.isBlueprint ? 1 : -1;
          }
          return a.topic.localeCompare(b.topic);
        });

        summaryMap.set(subjectData.name, subject);
      }

      setSubjects(Array.from(summaryMap.values()).filter(s => s.topicCount > 0));
    } catch (err) {
      console.error('Error fetching summary:', err);
      setError('Failed to fetch question bank summary');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, []);

  const handleDeleteTopic = async (topicId: string, topicName: string) => {
    setDeletingTopicId(topicId);
    try {
      const result = await deleteTopicById(topicId);
      if (result.success) {
        toast.success(`Deleted "${topicName}" with ${result.deletedQuestions} questions`);
        fetchSummary();
        onDataChange?.();
      } else {
        toast.error(`Failed to delete: ${result.error}`);
      }
    } catch (err) {
      toast.error('Failed to delete topic');
    } finally {
      setDeletingTopicId(null);
    }
  };

  const totalQuestions = subjects.reduce((acc, s) => acc + s.questionCount, 0);
  const totalTopics = subjects.reduce((acc, s) => acc + s.topicCount, 0);
  const nonBlueprintTopics = subjects.reduce(
    (acc, s) => acc + s.topics.filter(t => !t.isBlueprint).length,
    0
  );

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="w-5 h-5" />
            Question Bank Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-destructive">{error}</p>
          <Button onClick={fetchSummary} className="mt-4" variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Database className="w-5 h-5" />
              Question Bank Summary
            </CardTitle>
            <CardDescription>
              Overview of all questions in the database. Non-blueprint topics are highlighted.
            </CardDescription>
          </div>
          <Button onClick={fetchSummary} variant="outline" size="icon" disabled={isLoading}>
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : (
          <div className="space-y-6">
            {/* Overall Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-primary/10 rounded-lg p-4 text-center">
                <div className="flex items-center justify-center gap-2 text-primary mb-1">
                  <Layers className="w-4 h-4" />
                  <span className="text-sm font-medium">Subjects</span>
                </div>
                <p className="text-2xl font-bold">{subjects.length}</p>
              </div>
              <div className="bg-primary/10 rounded-lg p-4 text-center">
                <div className="flex items-center justify-center gap-2 text-primary mb-1">
                  <BookOpen className="w-4 h-4" />
                  <span className="text-sm font-medium">Topics</span>
                </div>
                <p className="text-2xl font-bold">{totalTopics}</p>
              </div>
              <div className="bg-primary/10 rounded-lg p-4 text-center">
                <div className="flex items-center justify-center gap-2 text-primary mb-1">
                  <Database className="w-4 h-4" />
                  <span className="text-sm font-medium">Questions</span>
                </div>
                <p className="text-2xl font-bold">{totalQuestions.toLocaleString()}</p>
              </div>
              {nonBlueprintTopics > 0 && (
                <div className="bg-amber-500/10 rounded-lg p-4 text-center">
                  <div className="flex items-center justify-center gap-2 text-amber-600 mb-1">
                    <AlertTriangle className="w-4 h-4" />
                    <span className="text-sm font-medium">Non-Blueprint</span>
                  </div>
                  <p className="text-2xl font-bold text-amber-600">{nonBlueprintTopics}</p>
                </div>
              )}
            </div>

            {/* Subject Breakdown */}
            <div className="space-y-3">
              <h3 className="font-semibold">By Subject</h3>
              {subjects.map((subject) => (
                <div key={subject.name} className="border rounded-lg overflow-hidden">
                  <button
                    onClick={() => setExpandedSubject(
                      expandedSubject === subject.name ? null : subject.name
                    )}
                    className="w-full flex items-center justify-between p-3 bg-muted/50 hover:bg-muted transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{subject.name}</span>
                      <span className="text-sm text-muted-foreground">
                        ({subject.topicCount} topics)
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-primary">
                        {subject.questionCount.toLocaleString()} questions
                      </span>
                      <span className="text-muted-foreground">
                        {expandedSubject === subject.name ? '▼' : '▶'}
                      </span>
                    </div>
                  </button>
                  
                  {expandedSubject === subject.name && (
                    <div className="divide-y">
                      {subject.topics.map((topic) => (
                        <div
                          key={topic.topicId}
                          className={`flex items-center justify-between p-3 pl-6 text-sm ${
                            !topic.isBlueprint ? 'bg-amber-50 dark:bg-amber-950/20' : ''
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span>{topic.topic}</span>
                            {!topic.isBlueprint && (
                              <Badge variant="outline" className="text-amber-600 border-amber-300 text-xs">
                                Not in Blueprint
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-muted-foreground">
                              {topic.questionCount} questions
                            </span>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7 text-destructive hover:text-destructive hover:bg-destructive/10"
                                  disabled={deletingTopicId === topic.topicId}
                                >
                                  {deletingTopicId === topic.topicId ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  ) : (
                                    <Trash2 className="h-4 w-4" />
                                  )}
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete "{topic.topic}"?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    This will permanently delete all {topic.questionCount} questions in this topic.
                                    This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDeleteTopic(topic.topicId, topic.topic)}
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                  >
                                    Delete Topic
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              
              {subjects.length === 0 && (
                <p className="text-muted-foreground text-center py-4">
                  No questions in the database yet. Upload some questions to get started!
                </p>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}