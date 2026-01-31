import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useBattleRoom } from '@/hooks/useBattleRoom';
import { QuestionBank } from '@/types/quiz';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { 
  Swords, Users, Copy, Check, X, Loader2, Trophy, 
  Crown, Zap, Clock, ArrowRight, Share2
} from 'lucide-react';

interface BattleModeProps {
  banks: QuestionBank;
  currentSubject: string;
}

const formatName = (name: string) => {
  return name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
};

export const BattleMode = ({ banks, currentSubject }: BattleModeProps) => {
  const battle = useBattleRoom(banks);
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<'menu' | 'create' | 'join' | 'waiting' | 'playing' | 'finished'>('menu');
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [joinCode, setJoinCode] = useState('');
  const [copied, setCopied] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [tempName, setTempName] = useState(battle.playerName);

  const topics = Object.keys(banks[currentSubject] || {});

  const handleCreateRoom = async () => {
    if (!selectedTopic) return;
    const room = await battle.createRoom(currentSubject, selectedTopic);
    if (room) {
      setMode('waiting');
    }
  };

  const handleJoinRoom = async () => {
    if (joinCode.length < 4) return;
    const room = await battle.joinRoom(joinCode);
    if (room) {
      setMode('waiting');
    }
  };

  const handleCopyCode = async () => {
    if (battle.room?.roomCode) {
      await navigator.clipboard.writeText(battle.room.roomCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleStartBattle = () => {
    battle.startBattle();
    setMode('playing');
  };

  const handleClose = () => {
    battle.leaveBattle();
    setMode('menu');
    setSelectedTopic(null);
    setJoinCode('');
    setIsOpen(false);
  };

  const handleSaveName = () => {
    battle.setPlayerName(tempName);
    setEditingName(false);
  };

  // Update mode based on battle state
  if (battle.room?.status === 'playing' && mode !== 'playing') {
    setMode('playing');
  }
  if (battle.room?.status === 'finished' && mode !== 'finished') {
    setMode('finished');
  }

  return (
    <>
      {/* Battle Button */}
      <motion.button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 left-4 z-40 bg-gradient-to-r from-red-500 to-orange-500 text-white p-4 rounded-full shadow-lg"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        <Swords className="w-6 h-6" />
      </motion.button>

      {/* Battle Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-card rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
              initial={{ scale: 0.9, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 50 }}
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-red-500 to-orange-500 p-6 text-white relative">
                <button 
                  onClick={handleClose}
                  className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-full"
                >
                  <X className="w-5 h-5" />
                </button>
                
                <div className="flex items-center gap-3">
                  <Swords className="w-8 h-8" />
                  <div>
                    <h2 className="text-xl font-bold">Quiz Battle</h2>
                    <p className="text-white/80 text-sm">Challenge your friends!</p>
                  </div>
                </div>

                {/* Player Name */}
                <div className="mt-4 flex items-center gap-2">
                  <span className="text-sm text-white/70">Playing as:</span>
                  {editingName ? (
                    <div className="flex items-center gap-2">
                      <Input
                        value={tempName}
                        onChange={(e) => setTempName(e.target.value.slice(0, 20))}
                        className="h-8 w-32 bg-white/20 border-white/30 text-white placeholder:text-white/50"
                        maxLength={20}
                      />
                      <Button size="sm" variant="ghost" onClick={handleSaveName} className="h-8 text-white hover:bg-white/20">
                        <Check className="w-4 h-4" />
                      </Button>
                    </div>
                  ) : (
                    <button 
                      onClick={() => { setTempName(battle.playerName); setEditingName(true); }}
                      className="font-medium hover:underline"
                    >
                      {battle.playerName} ✏️
                    </button>
                  )}
                </div>
              </div>

              <div className="p-6">
                {/* Menu Mode */}
                {mode === 'menu' && (
                  <div className="space-y-4">
                    <Button
                      onClick={() => setMode('create')}
                      className="w-full h-16 text-lg bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
                    >
                      <Crown className="w-6 h-6 mr-3" />
                      Create Battle
                    </Button>
                    
                    <Button
                      onClick={() => setMode('join')}
                      variant="outline"
                      className="w-full h-16 text-lg"
                    >
                      <Users className="w-6 h-6 mr-3" />
                      Join Battle
                    </Button>

                    <p className="text-center text-sm text-muted-foreground mt-4">
                      Battle against a friend in real-time! First to answer correctly wins each round.
                    </p>
                  </div>
                )}

                {/* Create Mode */}
                {mode === 'create' && (
                  <div className="space-y-4">
                    <h3 className="font-bold text-lg">Select a Topic</h3>
                    <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto">
                      {topics.map((topic) => (
                        <Button
                          key={topic}
                          variant={selectedTopic === topic ? 'default' : 'outline'}
                          onClick={() => setSelectedTopic(topic)}
                          className="h-auto py-3 text-left justify-start"
                        >
                          {formatName(topic)}
                        </Button>
                      ))}
                    </div>

                    {battle.error && (
                      <p className="text-destructive text-sm">{battle.error}</p>
                    )}

                    <div className="flex gap-2 mt-4">
                      <Button variant="outline" onClick={() => setMode('menu')} className="flex-1">
                        Back
                      </Button>
                      <Button 
                        onClick={handleCreateRoom} 
                        disabled={!selectedTopic || battle.isLoading}
                        className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500"
                      >
                        {battle.isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Create Room'}
                      </Button>
                    </div>
                  </div>
                )}

                {/* Join Mode */}
                {mode === 'join' && (
                  <div className="space-y-4">
                    <h3 className="font-bold text-lg">Enter Room Code</h3>
                    <Input
                      value={joinCode}
                      onChange={(e) => setJoinCode(e.target.value.toUpperCase().slice(0, 6))}
                      placeholder="ABCD12"
                      className="text-center text-2xl tracking-widest font-mono h-14"
                      maxLength={6}
                    />

                    {battle.error && (
                      <p className="text-destructive text-sm">{battle.error}</p>
                    )}

                    <div className="flex gap-2 mt-4">
                      <Button variant="outline" onClick={() => setMode('menu')} className="flex-1">
                        Back
                      </Button>
                      <Button 
                        onClick={handleJoinRoom} 
                        disabled={joinCode.length < 4 || battle.isLoading}
                        className="flex-1"
                      >
                        {battle.isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Join Room'}
                      </Button>
                    </div>
                  </div>
                )}

                {/* Waiting Mode */}
                {mode === 'waiting' && battle.room && (
                  <div className="text-center space-y-6">
                    <div className="bg-muted rounded-xl p-6">
                      <p className="text-sm text-muted-foreground mb-2">Room Code</p>
                      <div className="flex items-center justify-center gap-2">
                        <span className="text-3xl font-mono font-bold tracking-widest">
                          {battle.room.roomCode}
                        </span>
                        <Button size="sm" variant="ghost" onClick={handleCopyCode}>
                          {copied ? <Check className="w-4 h-4 text-success" /> : <Copy className="w-4 h-4" />}
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">
                        Share this code with your friend!
                      </p>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-primary/10 rounded-lg">
                        <div className="flex items-center gap-2">
                          <Crown className="w-5 h-5 text-primary" />
                          <span className="font-medium">{battle.playerName}</span>
                        </div>
                        <span className="text-sm text-success">Ready</span>
                      </div>

                      <div className={`flex items-center justify-between p-3 rounded-lg ${
                        battle.opponentPresent ? 'bg-success/10' : 'bg-muted'
                      }`}>
                        <div className="flex items-center gap-2">
                          <Users className="w-5 h-5" />
                          <span className="font-medium">
                            {battle.opponentPresent ? battle.opponentName : 'Waiting for opponent...'}
                          </span>
                        </div>
                        {battle.opponentPresent ? (
                          <span className="text-sm text-success">Ready</span>
                        ) : (
                          <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                        )}
                      </div>
                    </div>

                    <div className="text-sm text-muted-foreground">
                      <p>Topic: <span className="font-medium">{formatName(battle.room.topic)}</span></p>
                      <p>Questions: <span className="font-medium">{battle.room.totalQuestions}</span></p>
                    </div>

                    {battle.isHost && battle.opponentPresent && (
                      <Button 
                        onClick={handleStartBattle}
                        className="w-full bg-gradient-to-r from-green-500 to-emerald-500"
                        size="lg"
                      >
                        <Zap className="w-5 h-5 mr-2" />
                        Start Battle!
                      </Button>
                    )}

                    {!battle.isHost && battle.opponentPresent && (
                      <p className="text-muted-foreground">Waiting for host to start...</p>
                    )}
                  </div>
                )}

                {/* Playing Mode */}
                {mode === 'playing' && battle.currentQuestion && (
                  <div className="space-y-4">
                    {/* Score Bar */}
                    <div className="flex items-center justify-between bg-muted rounded-lg p-3">
                      <div className="text-center">
                        <p className="text-xs text-muted-foreground">You</p>
                        <p className="text-2xl font-bold text-primary">{battle.myScore}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-muted-foreground">Q{(battle.room?.currentQuestion || 0) + 1}/{battle.room?.totalQuestions}</p>
                        <Swords className="w-6 h-6 mx-auto text-muted-foreground" />
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-muted-foreground">{battle.opponentName}</p>
                        <p className="text-2xl font-bold text-orange-500">{battle.opponentScore}</p>
                      </div>
                    </div>

                    {/* Question */}
                    <Card className="p-4 bg-muted">
                      <p className="font-medium">{battle.currentQuestion.question}</p>
                    </Card>

                    {/* Options */}
                    <div className="space-y-2">
                      {battle.currentQuestion.options.map((option, index) => {
                        const isMyAnswer = battle.myAnswer === index;
                        const isCorrect = battle.roundResult !== null && index === battle.currentQuestion?.correct;
                        
                        let buttonClass = 'w-full p-3 text-left rounded-lg border-2 transition-all ';
                        if (battle.roundResult !== null) {
                          if (isCorrect) {
                            buttonClass += 'border-success bg-success/10';
                          } else if (isMyAnswer && !isCorrect) {
                            buttonClass += 'border-destructive bg-destructive/10';
                          } else {
                            buttonClass += 'border-border bg-muted/50 opacity-50';
                          }
                        } else if (isMyAnswer) {
                          buttonClass += 'border-primary bg-primary/10';
                        } else {
                          buttonClass += 'border-border hover:border-primary/50';
                        }

                        return (
                          <motion.button
                            key={index}
                            className={buttonClass}
                            onClick={() => battle.submitAnswer(index)}
                            disabled={battle.myAnswer !== null}
                            whileHover={battle.myAnswer === null ? { scale: 1.01 } : {}}
                          >
                            <span className="font-medium mr-2">{String.fromCharCode(65 + index)}.</span>
                            {option}
                          </motion.button>
                        );
                      })}
                    </div>

                    {/* Round Result */}
                    {battle.roundResult && (
                      <motion.div
                        className={`text-center p-4 rounded-xl ${
                          battle.roundResult === 'correct' ? 'bg-success/20 text-success' :
                          battle.roundResult === 'wrong' ? 'bg-destructive/20 text-destructive' :
                          'bg-muted text-muted-foreground'
                        }`}
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                      >
                        <p className="text-lg font-bold">
                          {battle.roundResult === 'correct' && '🎉 You got it!'}
                          {battle.roundResult === 'wrong' && '😅 Opponent got it!'}
                          {battle.roundResult === 'tie' && '🤝 It\'s a tie!'}
                        </p>
                      </motion.div>
                    )}

                    {battle.myAnswer !== null && battle.opponentAnswer === null && (
                      <p className="text-center text-sm text-muted-foreground">
                        <Loader2 className="w-4 h-4 inline animate-spin mr-2" />
                        Waiting for opponent...
                      </p>
                    )}
                  </div>
                )}

                {/* Finished Mode */}
                {mode === 'finished' && battle.room && (
                  <div className="text-center space-y-6">
                    <motion.div
                      className="text-6xl"
                      animate={{ scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] }}
                      transition={{ duration: 0.5 }}
                    >
                      {battle.myScore > battle.opponentScore ? '🏆' : 
                       battle.myScore < battle.opponentScore ? '😢' : '🤝'}
                    </motion.div>

                    <h3 className="text-2xl font-bold">
                      {battle.myScore > battle.opponentScore ? 'You Win!' : 
                       battle.myScore < battle.opponentScore ? 'You Lost!' : 'It\'s a Tie!'}
                    </h3>

                    <div className="flex justify-center gap-8">
                      <div className="text-center">
                        <p className="text-3xl font-bold text-primary">{battle.myScore}</p>
                        <p className="text-sm text-muted-foreground">You</p>
                      </div>
                      <div className="text-center">
                        <p className="text-3xl font-bold text-orange-500">{battle.opponentScore}</p>
                        <p className="text-sm text-muted-foreground">{battle.opponentName}</p>
                      </div>
                    </div>

                    <Button onClick={handleClose} className="w-full" size="lg">
                      Play Again
                    </Button>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
