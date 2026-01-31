import { motion } from 'framer-motion';
import { Subject } from '@/types/quiz';
import { Calculator, Atom, FlaskConical } from 'lucide-react';

interface SubjectTabsProps {
  currentSubject: Subject;
  onSelectSubject: (subject: Subject) => void;
}

const subjects: { id: Subject; label: string; icon: typeof Calculator; emoji: string }[] = [
  { id: 'math', label: 'Mathematics', icon: Calculator, emoji: '📐' },
  { id: 'physics', label: 'Physics', icon: Atom, emoji: '⚡' },
  { id: 'chemistry', label: 'Chemistry', icon: FlaskConical, emoji: '🧪' },
];

export const SubjectTabs = ({ currentSubject, onSelectSubject }: SubjectTabsProps) => {
  return (
    <div className="flex gap-3 mb-6">
      {subjects.map((subject) => {
        const isActive = currentSubject === subject.id;
        
        return (
          <motion.button
            key={subject.id}
            onClick={() => onSelectSubject(subject.id)}
            className={`
              flex-1 px-4 py-3 rounded-xl font-semibold transition-all
              flex items-center justify-center gap-2
              ${isActive 
                ? 'bg-gradient-magical text-white shadow-magical' 
                : 'bg-card text-muted-foreground hover:bg-muted shadow-card'
              }
            `}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <span className="text-xl">{subject.emoji}</span>
            <span className="hidden sm:inline">{subject.label}</span>
          </motion.button>
        );
      })}
    </div>
  );
};
