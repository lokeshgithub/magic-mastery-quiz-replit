export interface BattlePlayer {
  odId: string;
  odName: string;
  score: number;
  answered: boolean;
  lastAnswerCorrect: boolean | null;
}

export interface BattleRoom {
  id: string;
  roomCode: string;
  hostId: string;
  guestId: string | null;
  subject: string;
  topic: string;
  status: 'waiting' | 'playing' | 'finished';
  hostScore: number;
  guestScore: number;
  currentQuestion: number;
  totalQuestions: number;
  winner: string | null;
  createdAt: string;
}

export interface BattlePresence {
odId: string;
odName: string;
  isHost: boolean;
  score: number;
  currentAnswer: number | null;
  answeredAt: number | null;
}

// Generate a random 6-character room code
export const generateRoomCode = (): string => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Removed confusing chars like 0, O, 1, I
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

// Generate a random player ID (for anonymous play)
export const generatePlayerId = (): string => {
  return `player_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// Fun random names for anonymous players
export const PLAYER_NAMES = [
  'Speedy Panda', 'Math Wizard', 'Quiz Ninja', 'Brainy Fox',
  'Smart Cookie', 'Quick Thinker', 'Clever Cat', 'Wise Owl',
  'Bright Star', 'Sharp Mind', 'Fast Learner', 'Super Scholar',
  'Genius Kid', 'Brain Power', 'Quiz Master', 'Knowledge King',
];

export const getRandomPlayerName = (): string => {
  return PLAYER_NAMES[Math.floor(Math.random() * PLAYER_NAMES.length)];
};
