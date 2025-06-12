import { useState, useEffect, useCallback, useRef } from 'react';
import { Player } from '../App';
import { Check, CircleX, Clock, ImageOff } from 'lucide-react';

interface AnimalGameProps {
  player: Player;
  timerDuration: number;
  difficulty: number;
  onComplete: (points: number, isCorrect: boolean) => void;
}

// Age-appropriate animals for a 5-year-old
const animals = [
  { name: 'dog', prompt: 'cute cartoon dog, friendly, simple, pre-k educational' },
  { name: 'cat', prompt: 'cute cartoon cat, friendly, simple, pre-k educational' },
  { name: 'elephant', prompt: 'cute cartoon elephant, friendly, simple, pre-k educational' },
  { name: 'lion', prompt: 'cute cartoon lion, friendly, simple, pre-k educational' },
  { name: 'giraffe', prompt: 'cute cartoon giraffe, friendly, simple, pre-k educational' },
  { name: 'monkey', prompt: 'cute cartoon monkey, friendly, simple, pre-k educational' },
  { name: 'zebra', prompt: 'cute cartoon zebra, friendly, simple, pre-k educational' },
  { name: 'bear', prompt: 'cute cartoon bear, friendly, simple, pre-k educational' },
  { name: 'tiger', prompt: 'cute cartoon tiger, friendly, simple, pre-k educational' },
  { name: 'panda', prompt: 'cute cartoon panda, friendly, simple, pre-k educational' },
  { name: 'penguin', prompt: 'cute cartoon penguin, friendly, simple, pre-k educational' },
  { name: 'fox', prompt: 'cute cartoon fox, friendly, simple, pre-k educational' },
  { name: 'koala', prompt: 'cute cartoon koala, friendly, simple, pre-k educational' },
  { name: 'kangaroo', prompt: 'cute cartoon kangaroo, friendly, simple, pre-k educational' },
  { name: 'hippo', prompt: 'cute cartoon hippo, friendly, simple, pre-k educational' }
];

// Scale up the challenge based on difficulty
const getAnimalsForDifficulty = (difficulty: number) => {
  // Start with easy animals, add more as difficulty increases
  const baseCount = Math.min(5 + difficulty * 2, animals.length);
  return animals.slice(0, baseCount);
};

// Generate image URL from animal prompt
const getImageUrl = (animal: typeof animals[0]) => {
  return `https://image.pollinations.ai/prompt/${encodeURIComponent(animal.prompt)}?width=400&height=300&nologo=true&seed=${animal.name}`;
};

// Create a simple image cache to store preloaded images
const imageCache: Record<string, HTMLImageElement> = {};

// Preload an image and add it to cache
const preloadImage = (url: string): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    // If already in cache, return it
    if (imageCache[url]) {
      resolve(imageCache[url]);
      return;
    }

    const img = new Image();
    img.src = url;
    img.onload = () => {
      imageCache[url] = img;
      resolve(img);
    };
    img.onerror = () => reject(new Error('Image failed to load'));

    // Set a timeout to reject if it takes too long
    setTimeout(() => {
      if (!imageCache[url]) {
        reject(new Error('Image load timeout'));
      }
    }, 10000);
  });
};

const AnimalGame: React.FC<AnimalGameProps> = ({ player, timerDuration, difficulty, onComplete }) => {
  const timerRef = useRef<number | null>(null);
  const completionRef = useRef<number | null>(null);
  const mountedRef = useRef(true);
  const loadingImageRef = useRef<string | null>(null);

  const availableAnimals = useRef(getAnimalsForDifficulty(difficulty)).current;
  const [preloadQueue, setPreloadQueue] = useState<typeof animals[0][]>([]);

  const [gameInitialized, setGameInitialized] = useState(false);
  const [currentAnimal, setCurrentAnimal] = useState<typeof animals[0] | null>(null);
  const [options, setOptions] = useState<string[]>([]);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [timeLeft, setTimeLeft] = useState(timerDuration);
  const [score, setScore] = useState(0);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const isDarkMode = document.documentElement.classList.contains('dark');

  // Select next animal to display
  const getRandomAnimal = useCallback(() => {
    const randomIndex = Math.floor(Math.random() * availableAnimals.length);
    return availableAnimals[randomIndex];
  }, [availableAnimals]);

  // Create a list of animals to preload
  const generatePreloadQueue = useCallback(() => {
    // Create a list of up to 3 animals to preload
    const queue: typeof animals[0][] = [];
    for (let i = 0; i < 3; i++) {
      queue.push(getRandomAnimal());
    }
    setPreloadQueue(queue);
  }, [getRandomAnimal]);

  // Setup the game with a new question - only once on mount
  const initializeGame = useCallback(() => {
    if (!mountedRef.current) return;

    try {
      // Pick a random animal from available animals
      const newAnimal = getRandomAnimal();

      // Create options array with the correct answer and random others
      const correctAnswer = newAnimal.name;
      const otherAnimals = availableAnimals
        .filter(animal => animal.name !== correctAnswer)
        .map(animal => animal.name)
        .sort(() => 0.5 - Math.random())
        .slice(0, 3);

      const allOptions = [...otherAnimals, correctAnswer].sort(() => 0.5 - Math.random());

      setCurrentAnimal(newAnimal);
      setOptions(allOptions);
      setSelectedOption(null);
      setIsCorrect(null);
      setTimeLeft(timerDuration);
      setImageLoaded(false);
      setImageError(false);
      setIsTransitioning(false);
      setGameInitialized(true);

      // Generate animals to preload for future questions
      generatePreloadQueue();
    } catch (error) {
      console.error("Error setting up animal game:", error);
      // Provide fallback options if needed
      if (mountedRef.current) {
        setOptions(['dog', 'cat', 'elephant', 'lion']);
        setImageError(true);
        setGameInitialized(true);
      }
    }
  }, [availableAnimals, timerDuration, getRandomAnimal, generatePreloadQueue]);

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

  // Handle preloading of images
  useEffect(() => {
    if (!mountedRef.current || preloadQueue.length === 0) return;

    const preloadNextImages = async () => {
      // Process queue one by one to avoid network congestion
      for (const animal of preloadQueue) {
        if (!mountedRef.current) return;

        try {
          const url = getImageUrl(animal);
          // Skip if already loading or loaded
          if (loadingImageRef.current === url || imageCache[url]) continue;

          loadingImageRef.current = url;
          await preloadImage(url);
          loadingImageRef.current = null;

          // Break after loading one image to avoid blocking
          break;
        } catch (err) {
          console.error("Failed to preload image:", err);
          loadingImageRef.current = null;
        }
      }
    };

    preloadNextImages();
  }, [preloadQueue]);

  // Preload current animal image when it changes
  useEffect(() => {
    if (!currentAnimal || !mountedRef.current) return;

    const loadCurrentImage = async () => {
      try {
        const url = getImageUrl(currentAnimal);
        if (imageCache[url]) {
          setImageLoaded(true);
          return;
        }

        await preloadImage(url);
        if (mountedRef.current) {
          setImageLoaded(true);
        }
      } catch (err) {
        console.error("Failed to load current image:", err);
        if (mountedRef.current) {
          setImageError(true);
        }
      }
    };

    loadCurrentImage();
  }, [currentAnimal]);

  // Timer countdown - separate from other state changes
  useEffect(() => {
    if (!gameInitialized || timeLeft <= 0 || selectedOption !== null || isTransitioning || !currentAnimal) {
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
  }, [timeLeft, selectedOption, gameInitialized, isTransitioning, currentAnimal]);

  // Handle timeout completion separately
  useEffect(() => {
    if (!mountedRef.current || !currentAnimal || timeLeft > 0 || selectedOption !== null || isTransitioning) {
      return;
    }

    // Time's up - show correct answer
    setSelectedOption(currentAnimal.name);
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
  }, [timeLeft, selectedOption, currentAnimal, onComplete, score, isTransitioning]);

  const handleOptionSelect = (option: string) => {
    if (selectedOption !== null || !gameInitialized || isTransitioning || !currentAnimal) return; // Prevent multiple selections

    setIsTransitioning(true);
    setSelectedOption(option);

    const correct = option === currentAnimal.name;
    setIsCorrect(correct);

    // Calculate points once
    const pointsEarned = correct ? Math.max(1, Math.floor(timeLeft * (difficulty * 0.3))) : 0;
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

  // Get image URL with stable reference
  const currentImageUrl = currentAnimal ? getImageUrl(currentAnimal) : '';
  const isImageCached = currentAnimal ? !!imageCache[currentImageUrl] : false;

  if (!gameInitialized || !currentAnimal) {
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
        Animal Recognition (Level {difficulty})
      </h2>

      <div className="mb-4">
        <p className="text-lg mb-3">
          <span className="font-bold">{player.name}</span>, what animal is this?
        </p>
        <div className="flex justify-center mb-4">
          {!imageError ? (
            <div className={`h-52 w-[400px] rounded-lg overflow-hidden shadow-lg relative`}>
              {/* Loading skeleton */}
              {!imageLoaded && (
                <div className="absolute inset-0 bg-gray-200 dark:bg-gray-700 animate-pulse flex items-center justify-center">
                  <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    Loading animal...
                  </span>
                </div>
              )}

              {/* Actual image - even if not loaded yet, this starts the load process */}
              <img
                src={currentImageUrl}
                alt="Mystery animal"
                className={`h-52 w-auto object-cover rounded-lg shadow-lg transition-opacity duration-300 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
                loading={isImageCached ? "eager" : "lazy"}
              />
            </div>
          ) : (
            <div className={`h-52 w-[400px] rounded-lg shadow-md flex items-center justify-center ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <div className="text-center">
                <ImageOff className={`mx-auto mb-2 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`} size={32} />
                <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  What animal is this?
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
              p-4 rounded-xl text-lg font-semibold transition-all uppercase
              ${selectedOption === null
                ? isDarkMode
                  ? 'bg-teal-900 hover:bg-teal-800 text-white transform hover:scale-105'
                  : 'bg-teal-100 hover:bg-teal-200 text-teal-700 transform hover:scale-105'
                : selectedOption === option
                  ? isCorrect
                    ? isDarkMode ? 'bg-green-800 text-white border-2 border-green-500' : 'bg-green-100 text-green-700 border-2 border-green-500'
                    : isDarkMode ? 'bg-red-800 text-white border-2 border-red-500' : 'bg-red-100 text-red-700 border-2 border-red-500'
                  : option === currentAnimal.name && selectedOption !== null
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
              Great job! That's a {currentAnimal.name}!
            </div>
          ) : (
            <div className="flex items-center justify-center">
              <CircleX className="mr-2 h-6 w-6" />
              This is a {currentAnimal.name}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AnimalGame;
