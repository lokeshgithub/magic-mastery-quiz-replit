import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shuffle, X, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';

interface MixTopicsModalProps {
  isOpen: boolean;
  topics: string[];
  onClose: () => void;
  onStartMix: (selectedTopics: string[]) => void;
}

const formatName = (name: string) => {
  return name
    .replace(/_/g, ' ')
    .replace(/\b\w/g, l => l.toUpperCase());
};

export const MixTopicsModal = ({ isOpen, topics, onClose, onStartMix }: MixTopicsModalProps) => {
  const [selectedTopics, setSelectedTopics] = useState<Set<string>>(new Set(topics));

  const toggleTopic = (topic: string) => {
    const newSelected = new Set(selectedTopics);
    if (newSelected.has(topic)) {
      newSelected.delete(topic);
    } else {
      newSelected.add(topic);
    }
    setSelectedTopics(newSelected);
  };

  const selectAll = () => setSelectedTopics(new Set(topics));
  const selectNone = () => setSelectedTopics(new Set());

  const handleStart = () => {
    if (selectedTopics.size > 0) {
      onStartMix(Array.from(selectedTopics));
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="bg-card rounded-2xl shadow-xl max-w-md w-full max-h-[80vh] overflow-hidden"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-6 border-b border-border bg-gradient-magical text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <motion.div
                    animate={{ rotate: [0, 360] }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                  >
                    <Shuffle className="w-6 h-6" />
                  </motion.div>
                  <h2 className="text-xl font-bold">Mix Topics</h2>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-white/20 rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <p className="text-white/80 text-sm mt-2">
                Select topics to practice together in a mixed quiz
              </p>
            </div>

            {/* Topic List */}
            <div className="p-4 max-h-[40vh] overflow-y-auto">
              <div className="flex gap-2 mb-4">
                <Button variant="outline" size="sm" onClick={selectAll}>
                  Select All
                </Button>
                <Button variant="outline" size="sm" onClick={selectNone}>
                  Clear All
                </Button>
              </div>

              <div className="space-y-2">
                {topics.map((topic, index) => (
                  <motion.label
                    key={topic}
                    className={`
                      flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all
                      ${selectedTopics.has(topic) 
                        ? 'bg-primary/10 border-2 border-primary' 
                        : 'bg-muted border-2 border-transparent hover:border-muted-foreground/20'
                      }
                    `}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Checkbox
                      checked={selectedTopics.has(topic)}
                      onCheckedChange={() => toggleTopic(topic)}
                    />
                    <span className="font-medium">{formatName(topic)}</span>
                    {selectedTopics.has(topic) && (
                      <Check className="w-4 h-4 text-primary ml-auto" />
                    )}
                  </motion.label>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-border bg-muted/50">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  {selectedTopics.size} of {topics.length} topics selected
                </span>
                <Button
                  onClick={handleStart}
                  disabled={selectedTopics.size === 0}
                  className="bg-gradient-magical hover:opacity-90"
                >
                  <Shuffle className="w-4 h-4 mr-2" />
                  Start Mixed Quiz
                </Button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};