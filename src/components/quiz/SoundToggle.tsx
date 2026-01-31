import { motion } from 'framer-motion';
import { Volume2, VolumeX } from 'lucide-react';

interface SoundToggleProps {
  enabled: boolean;
  onToggle: () => void;
}

export const SoundToggle = ({ enabled, onToggle }: SoundToggleProps) => {
  return (
    <motion.button
      onClick={onToggle}
      className={`
        p-2 rounded-full transition-all
        ${enabled 
          ? 'bg-primary/10 text-primary hover:bg-primary/20' 
          : 'bg-muted text-muted-foreground hover:bg-muted/80'
        }
      `}
      whileTap={{ scale: 0.9 }}
      title={enabled ? 'Mute sounds' : 'Enable sounds'}
    >
      {enabled ? (
        <Volume2 className="w-5 h-5" />
      ) : (
        <VolumeX className="w-5 h-5" />
      )}
    </motion.button>
  );
};
