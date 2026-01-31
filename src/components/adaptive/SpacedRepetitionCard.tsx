import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  Bell, Calendar, Target, ChevronRight, Loader2, 
  Clock, AlertTriangle, CheckCircle, RefreshCw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getDueTopics, type DueTopic } from '@/services/spacedRepetitionService';
import { formatDistanceToNow, parseISO } from 'date-fns';

interface SpacedRepetitionCardProps {
  onPracticeTopic?: (topic: string, subject: string) => void;
}

const formatTopicName = (name: string) => {
  return name
    .replace(/_/g, ' ')
    .replace(/\b\w/g, l => l.toUpperCase());
};

export function SpacedRepetitionCard({ onPracticeTopic }: SpacedRepetitionCardProps) {
  const [dueTopics, setDueTopics] = useState<DueTopic[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);

  const fetchDueTopics = async () => {
    setIsLoading(true);
    const { data } = await getDueTopics();
    setDueTopics(data || []);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchDueTopics();
  }, []);

  const getUrgencyColor = (urgency: 'high' | 'medium' | 'low') => {
    switch (urgency) {
      case 'high': return 'text-destructive bg-destructive/10';
      case 'medium': return 'text-warning bg-warning/10';
      case 'low': return 'text-success bg-success/10';
    }
  };

  const getUrgencyIcon = (urgency: 'high' | 'medium' | 'low') => {
    switch (urgency) {
      case 'high': return <AlertTriangle className="w-4 h-4" />;
      case 'medium': return <Clock className="w-4 h-4" />;
      case 'low': return <CheckCircle className="w-4 h-4" />;
    }
  };

  if (isLoading) {
    return (
      <div className="bg-card rounded-xl p-4 shadow-card flex items-center justify-center">
        <Loader2 className="w-5 h-5 text-primary animate-spin" />
      </div>
    );
  }

  if (dueTopics.length === 0) {
    return null; // Don't show card if no topics are due
  }

  const highPriorityCount = dueTopics.filter(t => t.urgency === 'high').length;
  const displayTopics = isExpanded ? dueTopics : dueTopics.slice(0, 3);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/20 rounded-xl overflow-hidden"
    >
      {/* Header */}
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center">
            <Bell className="w-5 h-5 text-amber-500" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground flex items-center gap-2">
              Review Due
              {highPriorityCount > 0 && (
                <span className="px-2 py-0.5 text-xs font-medium bg-destructive/20 text-destructive rounded-full">
                  {highPriorityCount} urgent
                </span>
              )}
            </h3>
            <p className="text-sm text-muted-foreground">
              {dueTopics.length} topic{dueTopics.length !== 1 ? 's' : ''} ready for spaced practice
            </p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={fetchDueTopics}
          className="text-muted-foreground hover:text-foreground"
        >
          <RefreshCw className="w-4 h-4" />
        </Button>
      </div>

      {/* Topic List */}
      <div className="px-4 pb-4 space-y-2">
        <AnimatePresence>
          {displayTopics.map((topic, idx) => (
            <motion.div
              key={`${topic.subject}-${topic.topic_name}`}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              transition={{ delay: idx * 0.05 }}
              className="flex items-center justify-between p-3 bg-card rounded-lg"
            >
              <div className="flex items-center gap-3">
                <div className={`p-1.5 rounded ${getUrgencyColor(topic.urgency)}`}>
                  {getUrgencyIcon(topic.urgency)}
                </div>
                <div>
                  <span className="font-medium text-foreground text-sm">
                    {formatTopicName(topic.topic_name)}
                  </span>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span className="capitalize">{topic.subject}</span>
                    {topic.is_overdue && (
                      <span className="text-destructive">
                        {topic.days_overdue}d overdue
                      </span>
                    )}
                  </div>
                </div>
              </div>
              
              <Link to="/adaptive/focus">
                <Button size="sm" variant="ghost" className="text-primary">
                  Practice
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            </motion.div>
          ))}
        </AnimatePresence>

        {dueTopics.length > 3 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-full text-muted-foreground"
          >
            {isExpanded ? 'Show less' : `Show ${dueTopics.length - 3} more`}
          </Button>
        )}
      </div>

      {/* Footer */}
      <div className="px-4 pb-4">
        <Link to="/adaptive/focus">
          <Button className="w-full" variant="outline">
            <Target className="w-4 h-4 mr-2" />
            Start Focused Practice
          </Button>
        </Link>
      </div>
    </motion.div>
  );
}
