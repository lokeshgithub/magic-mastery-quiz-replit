import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, ArrowRight } from 'lucide-react';
import type { Question } from '@/types/quiz';

interface OlympiadQuizCardProps {
  question: Question;
  questionNumber: number;
  totalQuestions: number;
  onAnswer: (selectedIndex: number) => Promise<{ isCorrect: boolean; correctIndex: number }>;
  onNext: () => void;
  showFeedback?: boolean; // Whether to show correct/incorrect feedback
}

export function OlympiadQuizCard({
  question,
  questionNumber,
  totalQuestions,
  onAnswer,
  onNext,
  showFeedback = true,
}: OlympiadQuizCardProps) {
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [correctIndex, setCorrectIndex] = useState<number>(-1);
  const [isAnswered, setIsAnswered] = useState(false);
  const [isValidating, setIsValidating] = useState(false);

  // Reset state when question changes
  useEffect(() => {
    setSelectedAnswer(null);
    setIsCorrect(null);
    setCorrectIndex(-1);
    setIsAnswered(false);
    setIsValidating(false);
  }, [question.id]);

  const handleAnswer = async (index: number) => {
    if (isAnswered || isValidating) return;

    setSelectedAnswer(index);
    setIsValidating(true);

    const result = await onAnswer(index);
    setIsCorrect(result.isCorrect);
    setCorrectIndex(result.correctIndex);
    setIsAnswered(true);
    setIsValidating(false);
  };

  const handleNext = () => {
    onNext();
  };

  return (
    <motion.div
      className="bg-card rounded-2xl shadow-card overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      layout
    >
      {/* Header - No difficulty hint, just question number */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-4">
        <div className="flex items-center justify-between text-white">
          <span className="font-medium">Olympiad Test</span>
          <span className="text-sm bg-white/20 px-3 py-1 rounded-full">
            Question {questionNumber} of {totalQuestions}
          </span>
        </div>
      </div>

      {/* Question */}
      <div className="p-6">
        <p className="text-lg font-medium text-foreground mb-6 leading-relaxed">
          {question.question}
        </p>

        {/* Options */}
        <div className="space-y-3">
          {question.options.map((option, index) => {
            const isSelected = selectedAnswer === index;
            const isCorrectAnswer = correctIndex === index;
            const showCorrect = showFeedback && isAnswered && isCorrectAnswer;
            const showWrong = showFeedback && isAnswered && isSelected && !isCorrect;
            // In strict mode, just highlight the selected answer without revealing correctness
            const showSelectedInStrictMode = !showFeedback && isAnswered && isSelected;

            return (
              <motion.button
                key={index}
                onClick={() => handleAnswer(index)}
                disabled={isAnswered || isValidating}
                className={`
                  w-full p-4 rounded-xl text-left transition-all
                  flex items-center gap-3
                  ${!isAnswered && !isValidating ? 'hover:bg-muted hover:scale-[1.01] cursor-pointer' : 'cursor-default'}
                  ${showCorrect ? 'bg-success/20 ring-2 ring-success' : ''}
                  ${showWrong ? 'bg-destructive/20 ring-2 ring-destructive' : ''}
                  ${showSelectedInStrictMode ? 'bg-primary/20 ring-2 ring-primary' : ''}
                  ${!isAnswered && isSelected ? 'bg-primary/20 ring-2 ring-primary' : ''}
                  ${isAnswered && !showCorrect && !showWrong && !showSelectedInStrictMode ? 'opacity-50' : ''}
                  ${isValidating && isSelected ? 'bg-primary/20 ring-2 ring-primary animate-pulse' : ''}
                  bg-muted/50
                `}
                whileHover={!isAnswered && !isValidating ? { scale: 1.01 } : {}}
                whileTap={!isAnswered && !isValidating ? { scale: 0.99 } : {}}
              >
                <span
                  className={`
                    w-8 h-8 rounded-full flex items-center justify-center font-semibold
                    ${showCorrect ? 'bg-success text-white' : ''}
                    ${showWrong ? 'bg-destructive text-white' : ''}
                    ${showSelectedInStrictMode ? 'bg-primary text-primary-foreground' : ''}
                    ${!isAnswered ? 'bg-muted-foreground/20 text-muted-foreground' : ''}
                    ${isAnswered && !showCorrect && !showWrong && !showSelectedInStrictMode ? 'bg-muted-foreground/20 text-muted-foreground' : ''}
                  `}
                >
                  {String.fromCharCode(65 + index)}
                </span>
                <span className="flex-1 text-foreground">{option}</span>
                {showCorrect && <CheckCircle className="w-5 h-5 text-success" />}
                {showWrong && <XCircle className="w-5 h-5 text-destructive" />}
              </motion.button>
            );
          })}
        </div>

        {/* Post-answer - minimal feedback for exam mode */}
        <AnimatePresence>
          {isAnswered && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-6"
            >
              {showFeedback ? (
                <div className={`p-3 rounded-lg mb-4 ${isCorrect ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'}`}>
                  <span className="font-medium">
                    {isCorrect ? '✓ Correct!' : '✗ Incorrect'}
                  </span>
                </div>
              ) : (
                <div className="p-3 rounded-lg mb-4 bg-muted text-muted-foreground">
                  <span className="font-medium">✓ Answer recorded</span>
                </div>
              )}

              <motion.button
                onClick={handleNext}
                className="w-full p-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold flex items-center justify-center gap-2"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {questionNumber === totalQuestions ? 'View Results' : 'Next Question'}
                <ArrowRight className="w-5 h-5" />
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
