import { useState, useEffect, useCallback, useRef } from 'react';
import { Player } from '../App';
import { Check, CircleHelp, CircleX, Clock, ImageOff } from 'lucide-react';

interface MultiplicationGameProps {
  player: Player;
  timerDuration: number;
  difficulty: number;
  onComplete: (points: number, isCorrect: boolean) => void;
}

// Generate a random multiplication problem based on difficulty
const generateProblem = (difficulty: number) => {
  // Scale difficulty: higher levels get larger numbers
  const maxNum = Math.min(10, 3 + difficulty);
  
  const num1 = Math.floor(Math.random() * maxNum) + 1;
  const num2 = Math.floor(Math.random() * maxNum) + 1;
  
  return {
    num1,
    num2,
    answer: num1 * num2,
    explanation: `${num1} × ${num2} means ${num1} groups of ${num2}. If you have ${num1} groups with ${num2} items in each group, you get a total of ${num1 * num2} items.`
  };
};

// Generate incorrect answers that are close to the correct one
const generateOptions = (correctAnswer: number, difficulty: number) => {
  let options = [correctAnswer];
  
  while (options.length < 4) {
    // Generate plausible wrong answers by adding or subtracting small values
    // Higher difficulty means more tricky options that are closer to the right answer
    const offset = Math.floor(Math.random() * (7 - Math.min(difficulty, 5))) + 1;
    const sign = Math.random() > 0.5 ? 1 : -1;
    const wrongAnswer = correctAnswer + (offset * sign);
    
    // Make sure we don't add negative numbers or duplicates
    if (wrongAnswer > 0 && !options.includes(wrongAnswer)) {
      options.push(wrongAnswer);
    }
  }
  
  // Shuffle the options
  return options.sort(() => Math.random() - 0.5);
};

const MultiplicationGame: React.FC<MultiplicationGameProps> = ({ player, timerDuration, difficulty, onComplete }) => {
  const timerRef = useRef<number | null>(null);
  const completionRef = useRef<number | null>(null);
  const mountedRef = useRef(true);
  
  const [gameInitialized, setGameInitialized] = useState(false);
  const [problem, setProblem] = useState<ReturnType<typeof generateProblem> | null>(null);
  const [options, setOptions] = useState<number[]>([]);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [timeLeft, setTimeLeft] = useState(timerDuration);
  const [score, setScore] = useState(0);
  const [showExplanation, setShowExplanation] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  
  const isDarkMode = document.documentElement.classList.contains('dark');

  // Initialize game state once
  const initializeGame = useCallback(() => {
    if (!mountedRef.current) return;
    
    try {
      const newProblem = generateProblem(difficulty);
      setProblem(newProblem);
      setOptions(generateOptions(newProblem.answer, difficulty));
      setSelectedOption(null);
      setIsCorrect(null);
      setTimeLeft(timerDuration);
      setShowExplanation(false);
      setImageLoaded(false);
      setImageError(false);
      setIsTransitioning(false);
      setGameInitialized(true);
    } catch (error) {
      console.error("Error initializing multiplication game:", error);
      // Set fallback options if needed
      if (mountedRef.current) {
        setOptions([4, 6, 8, 10]);
        setImageError(true);
        setGameInitialized(true);
      }
    }
  }, [difficulty, timerDuration]);

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

  // Timer countdown - separate effect to prevent loops
  useEffect(() => {
    if (!gameInitialized || timeLeft <= 0 || selectedOption !== null || isTransitioning || !problem) {
      return;
    }
    
    // Clear any existing timer
    if (timerRef.current) window.clearTimeout(timerRef.current);
    
    timerRef.current = window.setTimeout(() => {
      if (mountedRef.current) {
        setTimeLeft(prev => prev - 1);
      }
    }, 1000);
    
    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
    };
  }, [timeLeft, selectedOption, gameInitialized, isTransitioning, problem]);

  // Handle timeout completion separately
  useEffect(() => {
    if (!mountedRef.current || !problem || timeLeft > 0 || selectedOption !== null || isTransitioning) {
      return;
    }
    
    // Time's up - show correct answer
    setSelectedOption(problem.answer);
    setIsCorrect(false);
    setIsTransitioning(true);
    
    // Clear any existing completion timer
    if (completionRef.current) window.clearTimeout(completionRef.current);
    
    // Move to next question after delay
    completionRef.current = window.setTimeout(() => {
      if (mountedRef.current) {
        onComplete(score, false);
      }
    }, 3000);
    
    return () => {
      if (completionRef.current) window.clearTimeout(completionRef.current);
    };
  }, [timeLeft, selectedOption, problem, onComplete, score, isTransitioning]);

  const handleOptionSelect = (option: number) => {
    if (selectedOption !== null || !gameInitialized || isTransitioning || !problem) return; // Prevent multiple selections
    
    setIsTransitioning(true);
    setSelectedOption(option);
    
    const correct = option === problem.answer;
    setIsCorrect(correct);
    
    // Calculate points once
    const pointsEarned = correct ? Math.max(1, Math.floor(timeLeft * (difficulty * 0.5))) : 0;
    const newScore = correct ? score + pointsEarned : score;
    
    if (correct) {
      setScore(newScore);
    }
    
    // Clear any existing completion timer
    if (completionRef.current) window.clearTimeout(completionRef.current);
    
    // Move to next question after delay
    completionRef.current = window.setTimeout(() => {
      if (mountedRef.current) {
        onComplete(newScore, correct);
      }
    }, 3000);
  };

  const toggleExplanation = useCallback(() => {
    setShowExplanation(prev => !prev);
  }, []);

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
  const visualAidUrl = problem 
    ? `https://image.pollinations.ai/prompt/visual%20representation%20of%20${problem.num1}%20times%20${problem.num2}%20multiplication,%20${problem.num1}%20rows%20of%20${problem.num2}%20items,%20cartoon%20style%20for%20children,%20educational,%20colorful,%20cute?width=400&height=300&nologo=true&seed=${problem.num1}-${problem.num2}`
    : '';

  if (!gameInitialized || !problem) {
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
        Multiplication Challenge (Level {difficulty})
      </h2>
      
      <div className="mb-6">
        <p className="text-lg mb-2">
          <span className="font-bold">{player.name}</span>, solve this problem:
        </p>
        <div className="flex justify-center items-center space-x-4">
          <div className={`text-4xl font-bold ${isDarkMode ? 'text-purple-400' : 'text-blue-500'}`}>{problem.num1}</div>
          <div className="text-4xl">×</div>
          <div className={`text-4xl font-bold ${isDarkMode ? 'text-purple-400' : 'text-blue-500'}`}>{problem.num2}</div>
          <div className="text-4xl">=</div>
          <div className={`text-4xl font-bold ${isDarkMode ? 'text-purple-300' : 'text-indigo-500'}`}>?</div>
          
          <button 
            onClick={toggleExplanation}
            className={`ml-2 p-1 rounded-full ${isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-600'}`}
            aria-label="Show explanation"
          >
            <CircleHelp size={20} />
          </button>
        </div>
        
        {/* Visual aid using pollination.ai */}
        <div className="flex justify-center mt-4">
          {!imageError ? (
            <div className={`h-40 w-auto rounded-lg shadow-md ${!imageLoaded ? 'bg-gray-200 dark:bg-gray-700 animate-pulse min-w-[300px]' : ''}`}>
              <img 
                src={visualAidUrl}
                alt={`${problem.num1} × ${problem.num2} visual`}
                className={`h-40 w-auto rounded-lg shadow-md ${!imageLoaded ? 'invisible' : ''}`}
                loading="eager"
                onError={handleImageError}
                onLoad={handleImageLoad}
              />
            </div>
          ) : (
            <div className={`h-40 w-[300px] rounded-lg shadow-md flex items-center justify-center ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <div className="text-center p-4">
                <ImageOff className={`mx-auto mb-2 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`} size={24} />
                <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'} text-sm`}>
                  {problem.num1} groups with {problem.num2} in each group
                </p>
              </div>
            </div>
          )}
        </div>
        
        {showExplanation && (
          <div className={`mt-2 p-3 rounded-lg text-sm ${isDarkMode ? 'bg-gray-700' : 'bg-indigo-50'}`}>
            {problem.explanation}
          </div>
        )}
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
            key={`option-${index}`}
            onClick={() => handleOptionSelect(option)}
            disabled={selectedOption !== null || isTransitioning}
            className={`
              p-4 rounded-xl text-xl font-semibold transition-all
              ${selectedOption === null
                ? isDarkMode 
                  ? 'bg-purple-900 hover:bg-purple-800 text-white transform hover:scale-105'
                  : 'bg-blue-100 hover:bg-blue-200 text-blue-700 transform hover:scale-105'
                : selectedOption === option
                  ? isCorrect
                    ? isDarkMode ? 'bg-green-800 text-white border-2 border-green-500' : 'bg-green-100 text-green-700 border-2 border-green-500'
                    : isDarkMode ? 'bg-red-800 text-white border-2 border-red-500' : 'bg-red-100 text-red-700 border-2 border-red-500'
                  : option === problem.answer && selectedOption !== null
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
              Excellent! That's correct!
            </div>
          ) : (
            <div className="flex items-center justify-center">
              <CircleX className="mr-2 h-6 w-6" />
              {problem.num1} × {problem.num2} = {problem.answer}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MultiplicationGame;
