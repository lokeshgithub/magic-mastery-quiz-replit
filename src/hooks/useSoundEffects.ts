import { useCallback, useRef, useState, useEffect } from 'react';

// Sound URLs - using freesound.org and other reliable CDN sources
// These are direct download links that don't block hotlinking
const SOUNDS = {
  correct: 'https://assets.mixkit.co/active_storage/sfx/2000/2000-preview.mp3', // Success ding
  incorrect: 'https://assets.mixkit.co/active_storage/sfx/2001/2001-preview.mp3', // Soft decline
  streak3: 'https://assets.mixkit.co/active_storage/sfx/2019/2019-preview.mp3', // Achievement
  streak5: 'https://assets.mixkit.co/active_storage/sfx/2020/2020-preview.mp3', // Level up
  levelUp: 'https://assets.mixkit.co/active_storage/sfx/2018/2018-preview.mp3', // Game bonus
  achievement: 'https://assets.mixkit.co/active_storage/sfx/2019/2019-preview.mp3', // Achievement unlock
  click: 'https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3', // UI click
} as const;

type SoundType = keyof typeof SOUNDS;

const STORAGE_KEY = 'quiz-sound-enabled';

export const useSoundEffects = () => {
  const [enabled, setEnabled] = useState(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored === null ? true : stored === 'true';
  });
  
  const audioCache = useRef<Map<SoundType, HTMLAudioElement>>(new Map());
  const lastPlayTime = useRef<Map<SoundType, number>>(new Map());

  // Preload sounds
  useEffect(() => {
    if (!enabled) return;
    
    Object.entries(SOUNDS).forEach(([key, url]) => {
      if (!audioCache.current.has(key as SoundType)) {
        const audio = new Audio(url);
        audio.preload = 'auto';
        audio.volume = 0.5;
        audioCache.current.set(key as SoundType, audio);
      }
    });
  }, [enabled]);

  const play = useCallback((sound: SoundType) => {
    if (!enabled) return;

    // Debounce - prevent same sound playing too quickly (increased to 500ms to prevent double plays)
    const now = Date.now();
    const lastTime = lastPlayTime.current.get(sound) || 0;
    if (now - lastTime < 500) return;
    lastPlayTime.current.set(sound, now);

    try {
      let audio = audioCache.current.get(sound);
      
      if (!audio) {
        audio = new Audio(SOUNDS[sound]);
        audio.volume = 0.5;
        audioCache.current.set(sound, audio);
      }

      // Clone for overlapping plays
      const clone = audio.cloneNode() as HTMLAudioElement;
      clone.volume = sound === 'levelUp' || sound === 'achievement' ? 0.6 : 0.4;
      
      clone.play().catch(() => {
        // Silently fail if autoplay is blocked
      });
    } catch (e) {
      // Silently fail
    }
  }, [enabled]);

  const toggleSound = useCallback(() => {
    setEnabled(prev => {
      const newValue = !prev;
      localStorage.setItem(STORAGE_KEY, String(newValue));
      return newValue;
    });
  }, []);

  return {
    enabled,
    toggleSound,
    playCorrect: useCallback(() => play('correct'), [play]),
    playIncorrect: useCallback(() => play('incorrect'), [play]),
    playStreak: useCallback((count: number) => {
      if (count >= 5) play('streak5');
      else if (count >= 3) play('streak3');
    }, [play]),
    playLevelUp: useCallback(() => play('levelUp'), [play]),
    playAchievement: useCallback(() => play('achievement'), [play]),
    playClick: useCallback(() => play('click'), [play]),
  };
};
