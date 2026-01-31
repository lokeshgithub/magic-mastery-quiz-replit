import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Lock, Sparkles, Trophy, TrendingUp, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SignUpPromptProps {
  isOpen: boolean;
  onClose: () => void;
  topicsUsed: number;
}

export const SignUpPrompt = ({ isOpen, onClose, topicsUsed }: SignUpPromptProps) => {
  if (!isOpen) return null;

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Backdrop */}
      <motion.div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      />

      {/* Modal */}
      <motion.div
        className="relative w-full max-w-md bg-card rounded-2xl shadow-xl overflow-hidden"
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
      >
        {/* Header */}
        <div className="bg-gradient-magical p-6 text-white text-center">
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="inline-block mb-2"
          >
            <Lock className="w-12 h-12" />
          </motion.div>
          <h2 className="text-xl font-bold mb-1">You're on a Roll! 🎉</h2>
          <p className="text-white/80 text-sm">
            You've explored {topicsUsed} topics as a guest
          </p>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-center text-muted-foreground mb-6">
            Create a free account to unlock <span className="font-semibold text-foreground">unlimited topics</span> and more!
          </p>

          {/* Benefits */}
          <div className="space-y-3 mb-6">
            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-xl">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Sparkles className="w-5 h-5 text-primary" />
              </div>
              <div>
                <div className="font-medium text-sm">Unlimited Topics</div>
                <div className="text-xs text-muted-foreground">Access all subjects and topics</div>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-xl">
              <div className="p-2 bg-warning/10 rounded-lg">
                <Star className="w-5 h-5 text-warning" />
              </div>
              <div>
                <div className="font-medium text-sm">Save Your Progress</div>
                <div className="text-xs text-muted-foreground">Your stars and streaks are saved</div>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-xl">
              <div className="p-2 bg-success/10 rounded-lg">
                <Trophy className="w-5 h-5 text-success" />
              </div>
              <div>
                <div className="font-medium text-sm">Compete on Leaderboard</div>
                <div className="text-xs text-muted-foreground">Show off your skills!</div>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-xl">
              <div className="p-2 bg-secondary/10 rounded-lg">
                <TrendingUp className="w-5 h-5 text-secondary" />
              </div>
              <div>
                <div className="font-medium text-sm">Track Your Growth</div>
                <div className="text-xs text-muted-foreground">See detailed performance insights</div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            <Button asChild className="w-full bg-gradient-magical hover:opacity-90">
              <Link to="/auth">
                <Sparkles className="w-4 h-4 mr-2" />
                Create Free Account
              </Link>
            </Button>
            
            <Button variant="ghost" onClick={onClose} className="w-full">
              Maybe Later
            </Button>
          </div>

          <p className="text-center text-xs text-muted-foreground mt-4">
            Already have an account?{' '}
            <Link to="/auth" className="text-primary hover:underline">Sign in</Link>
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
};
