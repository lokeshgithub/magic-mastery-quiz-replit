import type { ThemeLevel, Character } from '@/types/quiz';

export type { Character };

// Level 1: Doraemon characters
const doraemonCharacters: Character[] = [
  {
    name: 'Doraemon',
    emoji: '🐱',
    correctMessages: [
      "Amazing! You're as smart as my gadgets! 🎒",
      "Excellent work! Here's a virtual dorayaki for you! 🍩",
      "Nobita would be so proud of you! Keep going! ⭐",
      "Your brain is better than my 4D pocket! 🌟",
    ],
    incorrectMessages: [
      "Don't worry! Even Nobita gets things wrong sometimes! Let's learn together! 💪",
      "Oops! But that's okay - I have a gadget for learning! 🔧",
      "No problem! Let me explain this with my Teaching Robot! 🤖",
    ],
    encouragementMessages: [
      "You can do this! I believe in you! 🌈",
      "Take your time and think carefully! 🧠",
    ],
    levelUpMessages: [
      "HOORAY! You've mastered this level! Time to pull out a new gadget! 🎉",
    ],
  },
  {
    name: 'Nobita',
    emoji: '👦',
    correctMessages: [
      "Wow! You're way smarter than me! That's incredible! 🌟",
      "Even I couldn't solve that! You're amazing! ✨",
    ],
    incorrectMessages: [
      "It's okay! I get things wrong all the time! Let's try again! 😊",
      "Don't give up! Doraemon will help us understand! 💪",
    ],
    encouragementMessages: [
      "You got this! Unlike my homework, you'll definitely finish! 📚",
    ],
    levelUpMessages: [
      "You're going to the next level! I wish I could do that with my tests! 🎊",
    ],
  },
  {
    name: 'Shizuka',
    emoji: '👧',
    correctMessages: [
      "Wonderful! You're such a good student! 🎀",
      "That was beautifully solved! I'm impressed! 💖",
    ],
    incorrectMessages: [
      "It's alright! Everyone makes mistakes. Let's review together! 📖",
    ],
    encouragementMessages: [
      "Stay calm and think it through! You're doing great! 🌸",
    ],
    levelUpMessages: [
      "Congratulations! You've earned your way to the next level! 🌺",
    ],
  },
];

// Level 2: Pokémon characters
const pokemonCharacters: Character[] = [
  {
    name: 'Pikachu',
    emoji: '⚡',
    correctMessages: [
      "Pika Pika! That answer was electrifying! ⚡",
      "You're super effective! Amazing work! 🌟",
      "Thunderbolt of brilliance! Keep it up! 💛",
    ],
    incorrectMessages: [
      "Pika... It's okay! Even the best trainers miss sometimes! 💪",
      "Don't worry! Let's charge up and try again! 🔋",
    ],
    encouragementMessages: [
      "Pika Pi! You can do this! I believe in you! ⭐",
    ],
    levelUpMessages: [
      "PIKA-CHU! Level Up! You're evolving into a master! 🎉⚡",
    ],
  },
  {
    name: 'Ash',
    emoji: '🧢',
    correctMessages: [
      "Awesome! You're gonna be the very best! 🏆",
      "That's the spirit of a true Pokémon Master! 🌟",
    ],
    incorrectMessages: [
      "Hey, don't give up! I've lost battles too, but we keep trying! 💪",
      "No worries! Every loss is a lesson. Let's learn this! 📚",
    ],
    encouragementMessages: [
      "You can do it! I choose YOU to solve this! 🎯",
    ],
    levelUpMessages: [
      "You earned this badge of knowledge! On to the next gym! 🏅",
    ],
  },
  {
    name: 'Professor Oak',
    emoji: '🥼',
    correctMessages: [
      "Excellent research skills! Your knowledge is growing! 📊",
      "Fascinating! You have the mind of a true researcher! 🔬",
    ],
    incorrectMessages: [
      "Hmm, interesting attempt! Let me help you understand this better! 📖",
    ],
    encouragementMessages: [
      "Remember, every great trainer started as a beginner! 🌱",
    ],
    levelUpMessages: [
      "Your Pokédex of knowledge is expanding! Remarkable progress! 📱",
    ],
  },
];

// Level 3: Harry Potter (Years 1-2)
const harryPotterEarlyCharacters: Character[] = [
  {
    name: 'Harry Potter',
    emoji: '⚡',
    correctMessages: [
      "Brilliant! Even Hermione would be impressed! 🌟",
      "That was magical! You're a natural wizard! ✨",
      "Wicked! You solved that faster than catching a Snitch! 🏆",
    ],
    incorrectMessages: [
      "Don't worry! I got loads of things wrong in my first year too! 💪",
      "It's okay! Even I needed help from my friends. Let's figure this out! 🤝",
    ],
    encouragementMessages: [
      "You've got this! Remember, it's not our abilities that show who we are, but our choices! 🌟",
    ],
    levelUpMessages: [
      "You've earned 50 points for your house! Level complete! 🏰",
    ],
  },
  {
    name: 'Hermione',
    emoji: '📚',
    correctMessages: [
      "Excellent! That's exactly right! 10 points to your house! ⭐",
      "Splendid work! You've been studying well! 📖",
      "Perfect! Now THAT'S what I call using your brain! 🧠",
    ],
    incorrectMessages: [
      "It's LeviOsa, not... oh wait, wrong lesson! Let me explain this properly! 📚",
      "Don't feel bad! Even I had to learn everything from books first! 💫",
    ],
    encouragementMessages: [
      "Now, concentrate! The answer is right there if you think about it! 🤔",
    ],
    levelUpMessages: [
      "Congratulations! You've passed your O.W.L.s for this level! Outstanding! 🎓",
    ],
  },
  {
    name: 'Ron',
    emoji: '🧡',
    correctMessages: [
      "Blimey! You're brilliant! Better than me at wizard's chess! ♟️",
      "Wicked! You really know your stuff! 🌟",
    ],
    incorrectMessages: [
      "No worries mate! I mess up all the time! Let's have another go! 😅",
    ],
    encouragementMessages: [
      "Come on, you can do this! Even Scabbers believes in you! 🐀",
    ],
    levelUpMessages: [
      "Brilliant! Mum would be so proud of you! 🎉",
    ],
  },
  {
    name: 'Hagrid',
    emoji: '🧔',
    correctMessages: [
      "Well done! Yer a smart one, you are! 🌟",
      "Brilliant! That's better than any magical creature I've seen! 🐉",
    ],
    incorrectMessages: [
      "Shouldn' have done that... but don' worry! We all make mistakes! 💪",
    ],
    encouragementMessages: [
      "You can do this! I've got faith in yeh! 🫖",
    ],
    levelUpMessages: [
      "Yer ready for bigger and better things now! Off yeh go! 🎊",
    ],
  },
];

// Level 4: Harry Potter (Years 3-4)
const harryPotterMidCharacters: Character[] = [
  {
    name: 'Sirius Black',
    emoji: '🐕',
    correctMessages: [
      "Magnificent! James would be proud of you! 🌟",
      "Brilliant! You've got the makings of a true Marauder! 🗺️",
    ],
    incorrectMessages: [
      "Don't let it get you down! Even I spent 12 years getting things wrong! 💪",
    ],
    encouragementMessages: [
      "The ones who love us never really leave us. Keep going! ⭐",
    ],
    levelUpMessages: [
      "You're ready for greater adventures now! Mischief managed! 🎉",
    ],
  },
  {
    name: 'Remus Lupin',
    emoji: '🐺',
    correctMessages: [
      "Excellent work! That deserves some chocolate! 🍫",
      "Impressive! You'd get top marks in Defense Against the Dark Arts! 🛡️",
    ],
    incorrectMessages: [
      "No worries! The important thing is that we learn. Let me explain! 📚",
    ],
    encouragementMessages: [
      "You're capable of more than you know! Have confidence! 🌙",
    ],
    levelUpMessages: [
      "You've truly mastered this level! Expect great things from yourself! 🎓",
    ],
  },
  {
    name: 'Dumbledore',
    emoji: '🧙',
    correctMessages: [
      "Ah, excellent! It is our choices that show what we truly are! ⭐",
      "Wonderful! Knowledge is power, and you have plenty of both! 🌟",
    ],
    incorrectMessages: [
      "It does not do to dwell on mistakes. Let us learn and move forward! 💫",
    ],
    encouragementMessages: [
      "Happiness can be found even in the darkest times, if one only remembers to think! 💡",
    ],
    levelUpMessages: [
      "You have shown real wisdom beyond your years! Onward to greater challenges! 🏰",
    ],
  },
  {
    name: 'Mad-Eye Moody',
    emoji: '👁️',
    correctMessages: [
      "CONSTANT VIGILANCE! And you've shown it! Well done! 👁️",
      "Sharp mind you've got there! Keep your wits about you! 🎯",
    ],
    incorrectMessages: [
      "Don't let your guard down! Learn from this and stay alert! 🛡️",
    ],
    encouragementMessages: [
      "CONSTANT VIGILANCE! Think carefully before answering! 👁️",
    ],
    levelUpMessages: [
      "You're ready for advanced defense! Stay sharp! ⚔️",
    ],
  },
];

// Level 5: Harry Potter (Years 5-7)
const harryPotterLateCharacters: Character[] = [
  {
    name: 'Neville Longbottom',
    emoji: '🌱',
    correctMessages: [
      "That was amazing! You're braver than you know! 🌟",
      "Brilliant! You've grown so much! 💪",
    ],
    incorrectMessages: [
      "It's alright! I used to mess up everything, but look at me now! Keep trying! 🌱",
    ],
    encouragementMessages: [
      "It doesn't matter that you got it wrong - what matters is you keep trying! 💚",
    ],
    levelUpMessages: [
      "You're a true hero of learning! Just like the DA! ⚔️",
    ],
  },
  {
    name: 'Luna Lovegood',
    emoji: '🌙',
    correctMessages: [
      "Oh wonderful! The Nargles must have helped you! 🌙",
      "How lovely! Your mind works in magical ways! ✨",
    ],
    incorrectMessages: [
      "Don't worry! The Wrackspurts might have confused you. Let's try again! 🦋",
    ],
    encouragementMessages: [
      "Things we lose have a way of coming back to us. Like this knowledge! 💫",
    ],
    levelUpMessages: [
      "You're as wise as a Ravenclaw now! The creatures approve! 🦅",
    ],
  },
  {
    name: 'Minerva McGonagall',
    emoji: '🐱',
    correctMessages: [
      "Five points to your house! That was exemplary work! ⭐",
      "Excellent! I expect great things from you! 🏆",
    ],
    incorrectMessages: [
      "Hmm, not quite. But I have faith you can master this. Pay attention! 📚",
    ],
    encouragementMessages: [
      "Focus, concentrate! You have the ability within you! 🎯",
    ],
    levelUpMessages: [
      "You have proven yourself worthy! Prepare for your N.E.W.T.s! 🎓",
    ],
  },
  {
    name: 'Severus Snape',
    emoji: '🧪',
    correctMessages: [
      "...Acceptable. Perhaps there is hope for you yet. ⚗️",
      "Surprisingly adequate. Continue this performance. 📜",
    ],
    incorrectMessages: [
      "Clearly, fame isn't everything... but knowledge is. Learn this. 📖",
    ],
    encouragementMessages: [
      "Turn to page 394... I mean, think harder. 📚",
    ],
    levelUpMessages: [
      "You have... exceeded expectations. Don't let it go to your head. 🏆",
    ],
  },
];

export const themeLevels: ThemeLevel[] = [
  {
    level: 1,
    theme: 'Doraemon\'s Gadget Academy',
    characters: doraemonCharacters,
    bgClass: 'from-blue-400 to-cyan-400',
    accentColor: 'hsl(var(--level-1))',
  },
  {
    level: 2,
    theme: 'Pokémon Training Center',
    characters: pokemonCharacters,
    bgClass: 'from-yellow-400 to-orange-400',
    accentColor: 'hsl(var(--level-2))',
  },
  {
    level: 3,
    theme: 'Hogwarts Year 1-2',
    characters: harryPotterEarlyCharacters,
    bgClass: 'from-purple-500 to-indigo-500',
    accentColor: 'hsl(var(--level-3))',
  },
  {
    level: 4,
    theme: 'Hogwarts Year 3-4',
    characters: harryPotterMidCharacters,
    bgClass: 'from-pink-500 to-rose-500',
    accentColor: 'hsl(var(--level-4))',
  },
  {
    level: 5,
    theme: 'Hogwarts Year 5-7',
    characters: harryPotterLateCharacters,
    bgClass: 'from-amber-400 to-yellow-500',
    accentColor: 'hsl(var(--level-5))',
  },
  {
    level: 6,
    theme: 'Olympiad Champions',
    characters: harryPotterLateCharacters, // Reuse advanced Harry Potter characters
    bgClass: 'from-purple-600 to-pink-500',
    accentColor: 'hsl(var(--level-6))',
  },
  {
    level: 7,
    theme: 'Grand Masters',
    characters: harryPotterLateCharacters, // Reuse advanced Harry Potter characters
    bgClass: 'from-rose-500 to-orange-500',
    accentColor: 'hsl(var(--level-7))',
  },
];

export const getRandomCharacter = (level: number): Character => {
  const themeLevel = themeLevels.find(t => t.level === level) || themeLevels[0];
  const characters = themeLevel.characters;
  return characters[Math.floor(Math.random() * characters.length)];
};

export const getRandomMessage = (character: Character, type: 'correct' | 'incorrect' | 'encouragement' | 'levelUp'): string => {
  const messages = {
    correct: character.correctMessages,
    incorrect: character.incorrectMessages,
    encouragement: character.encouragementMessages,
    levelUp: character.levelUpMessages,
  }[type];
  return messages[Math.floor(Math.random() * messages.length)];
};
