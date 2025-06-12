import { useState, useEffect, useCallback, useRef } from 'react';
import { Player } from '../App';
import { Check, CircleX, Clock, ImageOff } from 'lucide-react';

interface OppositesGameProps {
  player: Player;
  timerDuration: number;
  difficulty: number;
  onComplete: (points: number, isCorrect: boolean) => void;
}

// Age-appropriate opposites for a 5-year-old
const oppositesPairs = [
  { word: 'big', opposite: 'small', prompt: 'A large elephant next to a tiny mouse, cartoon style' },
  { word: 'hot', opposite: 'cold', prompt: 'A steaming cup on one side and an ice cube on the other side, cartoon style' },
  { word: 'up', opposite: 'down', prompt: 'An arrow pointing up and an arrow pointing down, cartoon style' },
  { word: 'fast', opposite: 'slow', prompt: 'A racing car next to a slowly moving turtle, cartoon style' },
  { word: 'day', opposite: 'night', prompt: 'Sunny day sky next to starry night sky, cartoon style' },
  { word: 'happy', opposite: 'sad', prompt: 'Happy smiling face next to sad crying face, cartoon style for children' },
  { word: 'old', opposite: 'new', prompt: 'An old worn teddy bear next to a brand new teddy bear, cartoon style' },
  { word: 'clean', opposite: 'dirty', prompt: 'Clean sparkling plate next to dirty messy plate, cartoon style' },
  { word: 'open', opposite: 'closed', prompt: 'Open door next to closed door, cartoon style for children' },
  { word: 'on', opposite: 'off', prompt: 'Light switch on and off positions, cartoon style' },
  { word: 'high', opposite: 'low', prompt: 'Bird flying high in sky and rabbit low on ground, cartoon style' },
  { word: 'wet', opposite: 'dry', prompt: 'Wet dripping sponge and dry sponge, cartoon style' },
  { word: 'light', opposite: 'heavy', prompt: 'Light feather and heavy rock, cartoon style' },
  { word: 'empty', opposite: 'full', prompt: 'Empty glass and full glass of juice, cartoon style' },
  { word: 'awake', opposite: 'asleep', prompt: 'Child wide awake and child sleeping, cartoon style' }
];

// Get pairs based on difficulty
const getPairsForDifficulty = (difficulty: number) => {
  const startIndex = Math.min((difficulty - 1) * 3, oppositesPairs.length - 5);
  const endIndex = Math.min(startIndex + 10, oppositesPairs.length);
  return oppositesPairs.slice(0, endIndex);
};

const OppositesGame: React.FC<OppositesGameProps> = ({ player, timerDuration, difficulty, onComplete }) => {
  const timerRef = useRef<number | null>(null);
  const completionRef = useRef<number | null>(null);
  const mountedRef = useRef(true);

  // Get available pairs once based on difficulty
  const availablePairs = useRef(getPairsForDifficulty(difficulty)).current;

  const [gameInitialized, setGameInitialized] = useState(false);
  const [currentPair, setCurrentPair] = useState<typeof oppositesPairs[0] | null>(null);
  const [options, setOptions] = useState<string[]>([]);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [timeLeft, setTimeLeft] = useState(timerDuration);
  const [score, setScore] = useState(0);
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const isDarkMode = document.documentElement.classList.contains('dark');

  // Create a stable options array with useCallback to prevent repeated recreation
  const initializeGame = useCallback(() => {
    if (!mountedRef.current) return;

    try {
      // Pick a random pair from available pairs
      const randomIndex = Math.floor(Math.random() * availablePairs.length);
      const newPair = availablePairs[randomIndex];

      // Create options array with the correct answer and random others
      const correctAnswer = newPair.opposite;
      const otherOptions = availablePairs
        .filter(pair => pair.opposite !== correctAnswer)
        .map(pair => pair.opposite)
        .sort(() => 0.5 - Math.random())
        .slice(0, 3);

      const allOptions = [...otherOptions, correctAnswer].sort(() => 0.5 - Math.random());

      // Set all the state at once in a stable way
      setCurrentPair(newPair);
      setOptions(allOptions);
      setSelectedOption(null);
      setIsCorrect(null);
      setTimeLeft(timerDuration);
      setImageError(false);
      setImageLoaded(false);
      setIsTransitioning(false);
      setGameInitialized(true);
    } catch (error) {
      console.error("Error setting up opposites game:", error);
      // Provide fallback options if there's an error
      if (mountedRef.current) {
        setOptions(['small', 'cold', 'down', 'slow']);
        setImageError(true);
        setGameInitialized(true);
      }
    }
  }, [availablePairs, timerDuration]);

  // Component mount/unmount lifecycle
  useEffect(() => {
    mountedRef.current = true;
    initializeGame();

    return () => {
      mountedRef.current = false;
      if (timerRef.current) window.clearTimeout(timerRef.current);
      if (completionRef.current) window.clearTimeout(completionRef.current);
    };
  }, [initializeGame]);

  // Handle timer separately
  useEffect(() => {
    // Only start the timer when the game is properly initialized and no option is selected
    if (!gameInitialized || selectedOption !== null || isTransitioning || !currentPair) {
      return;
    }

    // Clear any existing timers
    if (timerRef.current) window.clearTimeout(timerRef.current);

    timerRef.current = window.setTimeout(() => {
      if (mountedRef.current && timeLeft > 0) {
        setTimeLeft(prevTime => prevTime - 1);
      }
    }, 1000);

    // Cleanup timer on unmount or dependency change
    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
    };
  }, [timeLeft, gameInitialized, selectedOption, isTransitioning, currentPair]);

  // Handle time out condition
  useEffect(() => {
    if (!mountedRef.current || !currentPair || timeLeft > 0 || selectedOption !== null || isTransitioning) {
      return;
    }

    // Time's up - trigger selection of correct answer if not already selected
    setSelectedOption(currentPair.opposite);
    setIsCorrect(false);
    setIsTransitioning(true);

    // Schedule completion after delay
    if (completionRef.current) window.clearTimeout(completionRef.current);

    completionRef.current = window.setTimeout(() => {
      if (mountedRef.current) {
        onComplete(score, false);
      }
    }, 3000);

    return () => {
      if (completionRef.current) window.clearTimeout(completionRef.current);
    };
  }, [timeLeft, currentPair, selectedOption, score, onComplete, isTransitioning]);

  const handleOptionSelect = (option: string) => {
    // Prevent multiple selections or clicks during transitions
    if (selectedOption !== null || !gameInitialized || isTransitioning || !currentPair) return;

    setIsTransitioning(true);
    setSelectedOption(option);

    const correct = option === currentPair.opposite;
    setIsCorrect(correct);

    // Calculate points once to avoid recalculation
    const pointsEarned = correct ? Math.max(1, Math.floor(timeLeft * (difficulty * 0.3))) : 0;
    const newScore = correct ? score + pointsEarned : score;

    if (correct) {
      setScore(newScore);
    }

    // Clear any existing completion timer
    if (completionRef.current) window.clearTimeout(completionRef.current);

    // Schedule the next question with a single timeout
    completionRef.current = window.setTimeout(() => {
      if (mountedRef.current) {
        onComplete(newScore, correct);
      }
    }, 3000);
  };

  const handleImageError = useCallback(() => {
    if (mountedRef.current) {
      setImageError(true);
    }
  }, []);

  const handleImageLoad = useCallback(() => {
    if (mountedRef.current) {
      setImageLoaded(true);
    }
  }, []);

  // Stable image URL reference
  const imageUrl = currentPair
    ? `https://image.pollinations.ai/prompt/${encodeURIComponent(currentPair.prompt)}?width=400&height=300&nologo=true&seed=${currentPair.word}`
    : '';

  if (!gameInitialized || !currentPair) {
    return (
      <div className="text-center p-6">
        <div className={`animate-pulse ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
          Loading game...
        </div>
      </div>
    );
  }

  return (
    <div className="text-center">
      <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-purple-300' : 'text-indigo-600'} mb-4`}>
        Opposites Game (Level {difficulty})
      </h2>

      <div className="mb-4">
        <p className="text-lg mb-2">
          <span className="font-bold">{player.name}</span>, what's the opposite of:
        </p>
        <div className={`text-3xl font-bold ${isDarkMode ? 'text-green-400' : 'text-green-600'} mb-2`}>
          {currentPair.word}
        </div>
        <div className="flex justify-center mb-4">
          {!imageError ? (
            <div className={`h-40 w-[400px] rounded-lg shadow-md ${!imageLoaded ? 'bg-gray-200 dark:bg-gray-700 animate-pulse' : ''}`}>
              <img
                src={imageUrl}
                alt={currentPair.word}
                className={`h-40 w-auto rounded-lg shadow-md ${!imageLoaded ? 'invisible' : ''}`}
                loading="eager"
                onError={handleImageError}
                onLoad={handleImageLoad}
              />
            </div>
          ) : (
            <div className={`h-40 w-[400px] rounded-lg shadow-md flex items-center justify-center ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <div className="text-center">
                <ImageOff className={`mx-auto mb-2 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`} size={32} />
                <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  Find the opposite of <strong>{currentPair.word}</strong>
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-center mb-4">
        <div className={`flex items-center ${timeLeft <= 5 ? 'text-red-500 animate-pulse' : isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
          <Clock className="mr-1 h-5 w-5" />
          <span className="font-mono text-lg">{timeLeft}s</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-6">
        {options.map((option, index) => (
          <button
            key={`${option}-${index}`}
            onClick={() => handleOptionSelect(option)}
            disabled={selectedOption !== null || isTransitioning}
            className={`
              p-4 rounded-xl text-lg font-semibold transition-all
              ${selectedOption === null
                ? isDarkMode
                  ? 'bg-purple-900 hover:bg-purple-800 text-white transform hover:scale-105'
                  : 'bg-indigo-100 hover:bg-indigo-200 text-indigo-700 transform hover:scale-105'
                : selectedOption === option
                  ? isCorrect
                    ? isDarkMode ? 'bg-green-800 text-white border-2 border-green-500' : 'bg-green-100 text-green-700 border-2 border-green-500'
                    : isDarkMode ? 'bg-red-800 text-white border-2 border-red-500' : 'bg-red-100 text-red-700 border-2 border-red-500'
                  : option === currentPair.opposite && selectedOption !== null
                    ? isDarkMode ? 'bg-green-800 text-white border-2 border-green-500' : 'bg-green-100 text-green-700 border-2 border-green-500'
                    : isDarkMode ? 'bg-gray-700 text-gray-400 opacity-70' : 'bg-gray-100 text-gray-500 opacity-70'
              }
            `}
          >
            {option}
          </button>
        ))}
      </div>

      {isCorrect !== null && (
        <div className={`text-xl font-bold animate-bounce ${isCorrect ? 'text-green-500' : 'text-red-500'}`}>
          {isCorrect ? (
            <div className="flex items-center justify-center">
              <Check className="mr-2 h-6 w-6" />
              Good job! That's correct!
            </div>
          ) : (
            <div className="flex items-center justify-center">
              <CircleX className="mr-2 h-6 w-6" />
              The opposite of {currentPair.word} is {currentPair.opposite}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default OppositesGame;
