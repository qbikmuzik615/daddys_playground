import { useState, useEffect, useCallback, useRef } from 'react';
import { Player } from '../App';
import { Check, CircleHelp, CircleX, Clock, ImageOff } from 'lucide-react';

interface WordMathGameProps {
  player: Player;
  timerDuration: number;
  difficulty: number;
  onComplete: (points: number, isCorrect: boolean) => void;
}

// Word problems appropriate for 1st grade with multiplication focus
const generateWordProblem = (difficulty: number) => {
  // Scale difficulty for word problems
  const maxNum = Math.min(10, 3 + difficulty);

  const num1 = Math.floor(Math.random() * maxNum) + 1;
  const num2 = Math.floor(Math.random() * maxNum) + 1;
  const answer = num1 * num2;

  // Different story templates for variety
  const templates = [
    {
      story: `${player} has ${num1} baskets. Each basket has ${num2} apples. How many apples does ${player} have in total?`,
      image: `${num1} baskets with ${num2} apples in each, cartoon style for children, educational, colorful`
    },
    {
      story: `There are ${num1} children at a party. If each child gets ${num2} balloons, how many balloons are needed in total?`,
      image: `${num1} cartoon children at a party with ${num2} balloons each, colorful, educational, simple drawing`
    },
    {
      story: `A farmer has ${num1} trees. Each tree has ${num2} birds sitting in it. How many birds are there in total?`,
      image: `${num1} cartoon trees with ${num2} birds in each tree, farm scene, educational, simple style`
    },
    {
      story: `${player} baked ${num1} trays of cookies. Each tray has ${num2} cookies. How many cookies did ${player} bake in total?`,
      image: `${num1} trays of ${num2} cookies each, cartoon style baking scene, educational, colorful`
    },
    {
      story: `There are ${num1} toy boxes. Each box has ${num2} toy cars. How many toy cars are there altogether?`,
      image: `${num1} colorful toy boxes with ${num2} toy cars in each, cartoon style, educational`
    }
  ];

  // Select a random template
  const template = templates[Math.floor(Math.random() * templates.length)];

  return {
    story: template.story.replace(/\${player}/g, 'You'),
    imagePrompt: template.image,
    answer: answer,
    explanation: `This is multiplication: ${num1} × ${num2} = ${answer}. When we have ${num1} groups with ${num2} items in each group, we multiply to find the total.`
  };
};

// Generate incorrect answers that are close to the correct one
const generateOptions = (correctAnswer: number, difficulty: number) => {
  let options = [correctAnswer];

  while (options.length < 4) {
    // Generate plausible wrong answers
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

const WordMathGame: React.FC<WordMathGameProps> = ({ player, timerDuration, difficulty, onComplete }) => {
  const timerRef = useRef<number | null>(null);
  const completionRef = useRef<number | null>(null);
  const mountedRef = useRef(true);

  const [gameInitialized, setGameInitialized] = useState(false);
  const [problem, setProblem] = useState<ReturnType<typeof generateWordProblem> | null>(null);
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

  // Initialize game with stable state
  const initializeGame = useCallback(() => {
    if (!mountedRef.current) return;

    try {
      const newProblem = generateWordProblem(difficulty);
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
      console.error("Error initializing word math game:", error);
      // Set fallback options if needed
      if (mountedRef.current) {
        setOptions([6, 8, 10, 12]);
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
  const imageUrl = problem
    ? `https://image.pollinations.ai/prompt/${encodeURIComponent(problem.imagePrompt)}?width=400&height=300&nologo=true&seed=${problem.answer}`
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
        Word Math Challenge (Level {difficulty})
      </h2>

      <div className="mb-6">
        <div className={`text-lg ${isDarkMode ? 'text-gray-100' : 'text-gray-800'} mb-4 p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-blue-50'}`}>
          {problem.story}
        </div>

        {/* Visual aid using pollination.ai with fallback */}
        <div className="flex justify-center mt-4">
          {!imageError ? (
            <div className={`h-40 w-auto rounded-lg shadow-md ${!imageLoaded ? 'bg-gray-200 dark:bg-gray-700 animate-pulse min-w-[300px]' : ''}`}>
              <img
                src={imageUrl}
                alt="Word problem illustration"
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
                  {problem.explanation.split('.')[0]}.
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="mt-3">
          <button
            onClick={toggleExplanation}
            className={`px-3 py-1 rounded-full text-sm ${isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-600'} flex items-center mx-auto`}
            aria-label="Show explanation"
          >
            <CircleHelp size={16} className="mr-1" />
            Hint
          </button>
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
              Great thinking! That's correct!
            </div>
          ) : (
            <div className="flex items-center justify-center">
              <CircleX className="mr-2 h-6 w-6" />
              The answer is {problem.answer}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default WordMathGame;
