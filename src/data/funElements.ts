// Fun facts, jokes, riddles, and trivia for each theme level
// These are shown as surprise elements after answering questions

export interface FunElement {
  id: string;
  type: 'joke' | 'fact' | 'riddle' | 'trivia' | 'challenge' | 'motivation';
  content: string;
  emoji: string;
  animation?: 'bounce' | 'spin' | 'wiggle' | 'pulse' | 'confetti';
}

// Level 1: Doraemon themed fun elements
const doraemonFun: FunElement[] = [
  { id: 'dor1', type: 'joke', content: "Why did Doraemon bring a ladder? Because he wanted to reach new heights in learning! 🪜", emoji: '😄', animation: 'bounce' },
  { id: 'dor2', type: 'fact', content: "Did you know? Doraemon's 4D pocket can hold unlimited items! Just like your brain can hold unlimited knowledge! 🧠", emoji: '🎒', animation: 'wiggle' },
  { id: 'dor3', type: 'riddle', content: "Riddle: I have a head, a tail, but no body. What am I? (Answer: A coin!)", emoji: '🪙', animation: 'spin' },
  { id: 'dor4', type: 'trivia', content: "Fun fact: Doraemon's favorite food is dorayaki! What's your favorite snack while studying?", emoji: '🍩', animation: 'pulse' },
  { id: 'dor5', type: 'joke', content: "Nobita asked Doraemon for a gadget to do math. Doraemon said: 'That gadget is called a BRAIN!' 🧠", emoji: '🤖', animation: 'bounce' },
  { id: 'dor6', type: 'motivation', content: "Even Nobita improved with practice! You're already doing better than him! Keep it up! 💪", emoji: '⭐', animation: 'confetti' },
  { id: 'dor7', type: 'fact', content: "The Anywhere Door can take you anywhere! Math can take you everywhere too - from video games to space rockets! 🚀", emoji: '🚪', animation: 'wiggle' },
  { id: 'dor8', type: 'joke', content: "Why is Gian bad at math? Because he thinks 'dividing' means sharing his toys (which he never does!) 😂", emoji: '🎤', animation: 'bounce' },
  { id: 'dor9', type: 'challenge', content: "Quick challenge: Can you count backwards from 20 in 10 seconds? GO! ⏱️", emoji: '🏃', animation: 'pulse' },
  { id: 'dor10', type: 'trivia', content: "Doraemon weighs exactly 129.3 kg! That's a very specific decimal number! 🐱", emoji: '⚖️', animation: 'spin' },
  { id: 'dor11', type: 'joke', content: "What's Doraemon's favorite subject? HISTORY! Because he can actually travel back in time! ⏰", emoji: '📚', animation: 'bounce' },
  { id: 'dor12', type: 'motivation', content: "Shizuka always studies hard and you're doing the same! You're on the right track! 🌸", emoji: '🎀', animation: 'confetti' },
  { id: 'dor13', type: 'riddle', content: "Riddle: What has hands but can't clap? (Answer: A clock!)", emoji: '⏰', animation: 'wiggle' },
  { id: 'dor14', type: 'fact', content: "The Take-copter spins at super speed! Just like how fast your brain is working right now! 🚁", emoji: '🌀', animation: 'spin' },
  { id: 'dor15', type: 'joke', content: "Suneo brags about everything, but he can't brag about being smarter than YOU today! 😎", emoji: '💎', animation: 'bounce' },
];

// Level 2: Pokémon themed fun elements
const pokemonFun: FunElement[] = [
  { id: 'pok1', type: 'joke', content: "Why did Pikachu study math? To become a POWERFUL number cruncher! ⚡", emoji: '⚡', animation: 'bounce' },
  { id: 'pok2', type: 'fact', content: "There are over 900 Pokémon species! Imagine learning all their stats - that's a LOT of numbers! 📊", emoji: '📱', animation: 'pulse' },
  { id: 'pok3', type: 'riddle', content: "Riddle: I'm a number that can't be divided. What am I? (Answer: Zero!)", emoji: '🔢', animation: 'spin' },
  { id: 'pok4', type: 'trivia', content: "Mewtwo's base stat total is 680! Quick - is that more or less than 700? 🧬", emoji: '🎯', animation: 'wiggle' },
  { id: 'pok5', type: 'joke', content: "Why is Slowpoke bad at tests? Because by the time it understands the question, time's up! 🐌", emoji: '😴', animation: 'bounce' },
  { id: 'pok6', type: 'motivation', content: "You're leveling up faster than a Rare Candy evolution! Keep catching those correct answers! 🎮", emoji: '🌟', animation: 'confetti' },
  { id: 'pok7', type: 'fact', content: "Alakazam has an IQ of 5,000! But with practice, you might outsmart it! 🥄", emoji: '🧠', animation: 'pulse' },
  { id: 'pok8', type: 'joke', content: "What's a math teacher's favorite Pokémon? Calculon! (Okay, that's not real, but it should be!) 🧮", emoji: '🤣', animation: 'bounce' },
  { id: 'pok9', type: 'challenge', content: "Trainer challenge: If you have 6 Pokémon with 4 moves each, how many total moves? (Answer: 24!) 💪", emoji: '🏆', animation: 'wiggle' },
  { id: 'pok10', type: 'trivia', content: "Pikachu says 'Pika' in 26 different ways! That's the same as letters in the alphabet! 🔤", emoji: '💛', animation: 'spin' },
  { id: 'pok11', type: 'joke', content: "Why did Ash fail math? He kept trying to CATCH the answers instead of CALCULATING them! 🎾", emoji: '🧢', animation: 'bounce' },
  { id: 'pok12', type: 'motivation', content: "Every Pokémon Master started with just one Pokémon. Every math master starts with just one question! 🌈", emoji: '⭐', animation: 'confetti' },
  { id: 'pok13', type: 'riddle', content: "Riddle: I double when you add myself to myself. What number am I? (Any number works!)", emoji: '🔮', animation: 'pulse' },
  { id: 'pok14', type: 'fact', content: "Super Effective moves do 2x damage! That's the power of multiplication! ⚔️", emoji: '💥', animation: 'wiggle' },
  { id: 'pok15', type: 'joke', content: "Professor Oak can't remember his grandson's name, but YOU remembered the right answer! 🎉", emoji: '🥼', animation: 'bounce' },
];

// Level 3: Harry Potter (Years 1-2) themed fun elements
const hogwartsEarlyFun: FunElement[] = [
  { id: 'hp31', type: 'joke', content: "Why did Harry study math? Because even magic can't help with Arithmancy homework! 📐", emoji: '⚡', animation: 'bounce' },
  { id: 'hp32', type: 'fact', content: "The Hogwarts Express is Platform 9¾! That's a fraction AND a decimal! 🚂", emoji: '🧙', animation: 'wiggle' },
  { id: 'hp33', type: 'riddle', content: "Riddle: I speak without a mouth and hear without ears. I have no body, but I come alive with wind. What am I? (An echo!)", emoji: '🔮', animation: 'spin' },
  { id: 'hp34', type: 'trivia', content: "Hermione reads about 10 books per week! How many is that per month? (About 40!) 📚", emoji: '📖', animation: 'pulse' },
  { id: 'hp35', type: 'joke', content: "Why is Neville bad at Potions? Because he can't measure ingredients - he's always adding too much! 🧪", emoji: '😅', animation: 'bounce' },
  { id: 'hp36', type: 'motivation', content: "10 points to your house for that brilliant thinking! Hermione would be proud! ⭐", emoji: '🏆', animation: 'confetti' },
  { id: 'hp37', type: 'fact', content: "Gringotts vaults go deep underground! Vault 713 is quite a specific number, isn't it? 🏦", emoji: '💰', animation: 'wiggle' },
  { id: 'hp38', type: 'joke', content: "Ron's wand is broken but your brain isn't! Keep casting those answer spells! 🪄", emoji: '🧡', animation: 'bounce' },
  { id: 'hp39', type: 'challenge', content: "Quick spell: If 1 Galleon = 17 Sickles, how many Sickles in 3 Galleons? (51!)", emoji: '💎', animation: 'pulse' },
  { id: 'hp310', type: 'trivia', content: "Harry's birthday is July 31st - the 212th day of the year! 🎂", emoji: '🎈', animation: 'spin' },
  { id: 'hp311', type: 'joke', content: "Why did the Sorting Hat go to school? To get a-HEAD in life! 🎓", emoji: '🧙', animation: 'bounce' },
  { id: 'hp312', type: 'motivation', content: "It's not our abilities that show what we truly are, it's our CHOICES - like choosing to learn! 💫", emoji: '✨', animation: 'confetti' },
  { id: 'hp313', type: 'riddle', content: "Riddle: What can you catch but not throw? (A cold! Stay healthy and keep studying!)", emoji: '🤧', animation: 'wiggle' },
  { id: 'hp314', type: 'fact', content: "Hogwarts was founded over 1,000 years ago! That's more than 365,000 days! 🏰", emoji: '📜', animation: 'pulse' },
  { id: 'hp315', type: 'joke', content: "Hagrid said 'Yer a wizard!' to Harry. I say 'Yer a GENIUS!' to you! 🧔", emoji: '🗝️', animation: 'bounce' },
];

// Level 4: Harry Potter (Years 3-4) themed fun elements
const hogwartsMidFun: FunElement[] = [
  { id: 'hp41', type: 'joke', content: "Why did Sirius study math in Azkaban? He had 12 years to count the days! 🐕", emoji: '🌙', animation: 'bounce' },
  { id: 'hp42', type: 'fact', content: "The Marauder's Map shows everyone in Hogwarts! Imagine counting all those footprints! 👣", emoji: '🗺️', animation: 'wiggle' },
  { id: 'hp43', type: 'riddle', content: "Riddle: I can be cracked, made, told, and played. What am I? (A joke! Like this one!)", emoji: '🎭', animation: 'spin' },
  { id: 'hp44', type: 'trivia', content: "A Time-Turner lets you go back 1 hour. If you used it 24 times, you'd go back a whole day! ⏳", emoji: '⌛', animation: 'pulse' },
  { id: 'hp45', type: 'joke', content: "Why doesn't Voldemort use Twitter? Because his followers keep disappearing! 🐍", emoji: '💀', animation: 'bounce' },
  { id: 'hp46', type: 'motivation', content: "Mischief Managed! You've completed another question. The Marauders would be proud! 🎉", emoji: '🦌', animation: 'confetti' },
  { id: 'hp47', type: 'fact', content: "Buckbeak can fly at 60 mph! At that speed, how far would he go in 2 hours? (120 miles!) 🦅", emoji: '🪶', animation: 'wiggle' },
  { id: 'hp48', type: 'joke', content: "Lupin gives chocolate for everything. If I could, I'd give you chocolate for that answer! 🍫", emoji: '🐺', animation: 'bounce' },
  { id: 'hp49', type: 'challenge', content: "If 3 dementors guard each tower and there are 7 towers, how many dementors? (21! Scary!)", emoji: '👻', animation: 'pulse' },
  { id: 'hp410', type: 'trivia', content: "The Triwizard Tournament has 3 tasks and 3 champions from 3 schools! That's a lot of 3s! 🏆", emoji: '🔥', animation: 'spin' },
  { id: 'hp411', type: 'joke', content: "Why did Mad-Eye Moody become a teacher? For CONSTANT VIGILANCE over homework! 👁️", emoji: '🔍', animation: 'bounce' },
  { id: 'hp412', type: 'motivation', content: "Cedric would say 'Take the win when you can!' - and you just won another answer! 💛", emoji: '🏅', animation: 'confetti' },
  { id: 'hp413', type: 'riddle', content: "Riddle: What gets wetter the more it dries? (A towel!)", emoji: '🧣', animation: 'wiggle' },
  { id: 'hp414', type: 'fact', content: "The Goblet of Fire chooses champions randomly - but YOUR answers aren't random, they're smart! 🔥", emoji: '🏆', animation: 'pulse' },
  { id: 'hp415', type: 'joke', content: "Wormtail can't do math - he can't even COUNT his friends! 🐀", emoji: '😏', animation: 'bounce' },
];

// Level 5: Harry Potter (Years 5-7) themed fun elements
const hogwartsLateFun: FunElement[] = [
  { id: 'hp51', type: 'joke', content: "Why did Dumbledore's Army meet in secret? Because their math skills were TOO POWERFUL! 💪", emoji: '⚔️', animation: 'bounce' },
  { id: 'hp52', type: 'fact', content: "There are 7 Horcruxes! Harry had to find and destroy each one - like solving 7 hard problems! 🗡️", emoji: '💍', animation: 'wiggle' },
  { id: 'hp53', type: 'riddle', content: "Sphinx riddle: What walks on 4 legs in morning, 2 at noon, 3 at evening? (A human!)", emoji: '🦁', animation: 'spin' },
  { id: 'hp54', type: 'trivia', content: "The Battle of Hogwarts lasted one night but changed everything. One moment can make a difference! ⚡", emoji: '🏰', animation: 'pulse' },
  { id: 'hp55', type: 'joke', content: "Why did Snape stand in the middle of the road? So no one could tell which side he was on! 🧪", emoji: '🖤', animation: 'bounce' },
  { id: 'hp56', type: 'motivation', content: "You're braver than Neville facing Nagini! Keep conquering these questions! 🐍", emoji: '🦁', animation: 'confetti' },
  { id: 'hp57', type: 'fact', content: "Luna can see Thestrals because she understands loss. You understand MATH because you practice! 🌙", emoji: '🦄', animation: 'wiggle' },
  { id: 'hp58', type: 'joke', content: "McGonagall's animagus is a cat with 9 lives. That's 9 chances to learn! You've got this! 🐱", emoji: '🎓', animation: 'bounce' },
  { id: 'hp59', type: 'challenge', content: "If 12 Death Eaters face 5 DA members, and each DA member stuns 2... how many left? (2!)", emoji: '⚡', animation: 'pulse' },
  { id: 'hp510', type: 'trivia', content: "The Elder Wand is one of 3 Deathly Hallows. Master of Death = Master of Math? 🎯", emoji: '🪄', animation: 'spin' },
  { id: 'hp511', type: 'joke', content: "Umbridge banned everything fun except math. Even SHE knew learning is important! 🐸", emoji: '💗', animation: 'bounce' },
  { id: 'hp512', type: 'motivation', content: "After all this time? ALWAYS keep learning! - Snape (probably about math) 💚", emoji: '🦌', animation: 'confetti' },
  { id: 'hp513', type: 'riddle', content: "Riddle: I have cities, but no houses. Forests, but no trees. Water, but no fish. What am I? (A map!)", emoji: '🗺️', animation: 'wiggle' },
  { id: 'hp514', type: 'fact', content: "Hogwarts has 142 staircases! Some move, making navigation tricky - like complex equations! 🪜", emoji: '🏰', animation: 'pulse' },
  { id: 'hp515', type: 'joke', content: "Fred and George could've aced any test - they just chose chaos instead! You're choosing success! 🎆", emoji: '🎇', animation: 'bounce' },
];

// Map levels to their fun elements
const levelFunElements: Record<number, FunElement[]> = {
  1: doraemonFun,
  2: pokemonFun,
  3: hogwartsEarlyFun,
  4: hogwartsMidFun,
  5: hogwartsLateFun,
};

import { 
  getSeenElements, 
  markElementSeen, 
  resetSeenElements 
} from '@/services/funElementTrackingService';

// In-memory seen set for synchronous initial check (populated async)
let localSeenCache: Set<string> = new Set();

// Initialize cache from tracking service (call on app load)
export const initFunElementCache = async (): Promise<void> => {
  try {
    localSeenCache = await getSeenElements();
  } catch {
    localSeenCache = new Set();
  }
};

// Get all element IDs for a level (useful for reset)
export const getLevelElementIds = (level: number): string[] => {
  const elements = levelFunElements[level] || levelFunElements[1];
  return elements.map(e => e.id);
};

// Legacy reset function (now async-aware)
export const resetUsedElements = async (level?: number): Promise<void> => {
  if (level !== undefined) {
    const levelIds = getLevelElementIds(level);
    await resetSeenElements(levelIds);
    levelIds.forEach(id => localSeenCache.delete(id));
  } else {
    await resetSeenElements();
    localSeenCache = new Set();
  }
};

/**
 * Get a random fun element that hasn't been seen before
 * Uses local cache for immediate return, then marks as seen async
 */
export const getRandomFunElement = (level: number): FunElement | null => {
  const elements = levelFunElements[level] || levelFunElements[1];
  
  // Filter out already seen elements using local cache
  const available = elements.filter(e => !localSeenCache.has(e.id));
  
  // If all elements seen for this level, reset this level and use all
  if (available.length === 0) {
    // Async reset for this level (fire and forget)
    const levelIds = elements.map(e => e.id);
    resetSeenElements(levelIds).then(() => {
      levelIds.forEach(id => localSeenCache.delete(id));
    });
    // For this call, use all elements
    const element = elements[Math.floor(Math.random() * elements.length)];
    localSeenCache.add(element.id);
    markElementSeen(element.id); // Async persist
    return element;
  }
  
  // Pick random from available
  const element = available[Math.floor(Math.random() * available.length)];
  
  // Update local cache immediately
  localSeenCache.add(element.id);
  
  // Persist async (fire and forget)
  markElementSeen(element.id);
  
  return element;
};

// Special celebration animations for milestones
export const getMilestoneAnimation = (streak: number, totalCorrect: number): { emoji: string; message: string; animation: string } | null => {
  // Streak milestones take priority
  const streakMilestones: Record<number, { emoji: string; message: string; animation: string }> = {
    5: { emoji: '🔥', message: "ON FIRE! 5 in a row! +50 bonus stars! ⭐", animation: 'fire' },
    7: { emoji: '💎', message: "BRILLIANT! 7 streak! +75 bonus stars! 💫", animation: 'diamond' },
    10: { emoji: '🎆', message: "UNSTOPPABLE! 10 streak! +100 bonus stars! 🌟", animation: 'fireworks' },
    15: { emoji: '👑', message: "LEGENDARY! 15 streak! +150 bonus stars! ✨", animation: 'crown' },
    20: { emoji: '🏆', message: "GODLIKE! 20 streak! +200 bonus stars! 🎉", animation: 'trophy' },
  };

  if (streakMilestones[streak]) {
    return streakMilestones[streak];
  }

  // Total correct milestones
  const totalMilestones: Record<number, { emoji: string; message: string; animation: string }> = {
    10: { emoji: '🎯', message: "10 total correct! You're getting started! 🌟", animation: 'stars' },
    25: { emoji: '📚', message: "25 questions mastered! Knowledge is power! 💪", animation: 'books' },
    50: { emoji: '🚀', message: "50 correct! You're a learning rocket! 🌙", animation: 'rocket' },
    75: { emoji: '🧠', message: "75 correct! Big brain energy! ⚡", animation: 'brain' },
    100: { emoji: '💯', message: "100 CORRECT! You're a CHAMPION! 🏆", animation: 'century' },
    150: { emoji: '🌈', message: "150 correct! Absolutely AMAZING! ✨", animation: 'rainbow' },
    200: { emoji: '👑', message: "200 correct! You're a TRUE MASTER! 🎓", animation: 'master' },
  };

  if (totalMilestones[totalCorrect]) {
    return totalMilestones[totalCorrect];
  }

  return null;
};

// Get bonus stars for milestones
export const getMilestoneBonus = (streak: number, totalCorrect: number): number => {
  const streakBonuses: Record<number, number> = {
    5: 50,
    7: 75,
    10: 100,
    15: 150,
    20: 200,
  };

  const totalBonuses: Record<number, number> = {
    10: 25,
    25: 50,
    50: 100,
    75: 150,
    100: 250,
    150: 350,
    200: 500,
  };

  return (streakBonuses[streak] || 0) + (totalBonuses[totalCorrect] || 0);
};
