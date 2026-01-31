import { useState, useCallback } from 'react';
import { BattleRoom, generateRoomCode, generatePlayerId, getRandomPlayerName } from '@/types/battle';
import { Question, QuestionBank } from '@/types/quiz';
import { toast } from 'sonner';

const PLAYER_ID_KEY = 'battle-player-id';
const PLAYER_NAME_KEY = 'battle-player-name';

const getOrCreatePlayerId = (): string => {
  let id = localStorage.getItem(PLAYER_ID_KEY);
  if (!id) {
    id = generatePlayerId();
    localStorage.setItem(PLAYER_ID_KEY, id);
  }
  return id;
};

const getOrCreatePlayerName = (): string => {
  let name = localStorage.getItem(PLAYER_NAME_KEY);
  if (!name) {
    name = getRandomPlayerName();
    localStorage.setItem(PLAYER_NAME_KEY, name);
  }
  return name;
};

interface BattleState {
  room: BattleRoom | null;
  isHost: boolean;
  playerId: string;
  playerName: string;
  opponentName: string | null;
  opponentPresent: boolean;
  currentQuestion: Question | null;
  myAnswer: number | null;
  myAnswerCorrect: boolean | null;
  opponentAnswer: number | null;
  opponentAnswerCorrect: boolean | null;
  roundResult: 'waiting' | 'correct' | 'wrong' | 'tie' | null;
  battleQuestions: Question[];
  isLoading: boolean;
  error: string | null;
}

export const useBattleRoom = (_banks: QuestionBank) => {
  const [state, setState] = useState<BattleState>({
    room: null,
    isHost: false,
    playerId: getOrCreatePlayerId(),
    playerName: getOrCreatePlayerName(),
    opponentName: null,
    opponentPresent: false,
    currentQuestion: null,
    myAnswer: null,
    myAnswerCorrect: null,
    opponentAnswer: null,
    opponentAnswerCorrect: null,
    roundResult: null,
    battleQuestions: [],
    isLoading: false,
    error: null,
  });

  const createRoom = useCallback(async (_subject: string, _topic: string) => {
    toast.info('Quiz battles feature is coming soon!');
    setState(prev => ({
      ...prev,
      error: 'Quiz battles are being migrated. Coming soon!',
    }));
  }, []);

  const joinRoom = useCallback(async (_roomCode: string) => {
    toast.info('Quiz battles feature is coming soon!');
    setState(prev => ({
      ...prev,
      error: 'Quiz battles are being migrated. Coming soon!',
    }));
  }, []);

  const leaveRoom = useCallback(async () => {
    setState(prev => ({
      ...prev,
      room: null,
      isHost: false,
      opponentName: null,
      opponentPresent: false,
      currentQuestion: null,
      myAnswer: null,
      opponentAnswer: null,
      roundResult: null,
      battleQuestions: [],
      error: null,
    }));
  }, []);

  const startBattle = useCallback(async () => {
    toast.info('Quiz battles feature is coming soon!');
  }, []);

  const submitAnswer = useCallback(async (_answerIndex: number) => {
    toast.info('Quiz battles feature is coming soon!');
  }, []);

  const updatePlayerName = useCallback((name: string) => {
    localStorage.setItem(PLAYER_NAME_KEY, name);
    setState(prev => ({ ...prev, playerName: name }));
  }, []);

  return {
    ...state,
    createRoom,
    joinRoom,
    leaveRoom,
    startBattle,
    submitAnswer,
    updatePlayerName,
  };
};
