import { useState, useEffect } from 'react';
import { Player, GameState, GameSettings } from '../App';
import OppositesGame from './OppositesGame';
import MultiplicationGame from './MultiplicationGame';
import AnimalGame from './AnimalGame';
import WordMathGame from './WordMathGame';
import ErrorBoundary from './ErrorBoundary';
import { CircleAlert, RotateCcw } from 'lucide-react';
import { useImagePreloader } from '../hooks/useImagePreloader';

interface GamesContainerProps {
  gameState: GameState;
  player: Player;
  gameSettings: GameSettings;
  onComplete: (points: number, isCorrect: boolean) => void;
  isDarkMode: boolean;
}

// Get image URLs for preloading based on game type
const getPreloadUrls = (gameType: GameState): string[] => {
  const urls: string[] = [];

  // Add game-specific image URLs for preloading
  switch (gameType) {
    case 'animals':
      // Preload common animal images
      const animals = ['dog', 'cat', 'elephant', 'lion', 'bear'];
      animals.forEach(animal => {
        const prompt = `cute cartoon ${animal}, friendly, simple, pre-k educational`;
        urls.push(`https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=400&height=300&nologo=true&seed=${animal}`);
      });
      break;

    case 'opposites':
      // Preload common opposite images
      const opposites = [
        { word: 'big', prompt: 'A large elephant next to a tiny mouse, cartoon style' },
        { word: 'hot', prompt: 'A steaming cup on one side and an ice cube on the other side, cartoon style' }
      ];
      opposites.forEach(pair => {
        urls.push(`https://image.pollinations.ai/prompt/${encodeURIComponent(pair.prompt)}?width=400&height=300&nologo=true&seed=${pair.word}`);
      });
      break;

    default:
      // No preloading needed for other games
      break;
  }

  return urls;
};

const GamesContainer: React.FC<GamesContainerProps> = ({
  gameState,
  player,
  gameSettings,
  onComplete,
  isDarkMode
}) => {
  const [error, setError] = useState<string | null>(null);
  const { preloadImages, loading } = useImagePreloader();

  // Preload images when game type changes
  useEffect(() => {
    const urls = getPreloadUrls(gameState);
    if (urls.length > 0) {
      preloadImages(urls).catch(err => {
        console.error("Failed to preload game images:", err);
      });
    }
  }, [gameState, preloadImages]);

  const handleGameError = () => {
    setError("There was a problem with the game. Let's try again.");
  };

  const renderCurrentGame = () => {
    try {
      // Select game based on the game state
      switch (gameState) {
        case 'opposites':
          return (
            <ErrorBoundary onReset={handleGameError}>
              <OppositesGame
                player={player}
                timerDuration={gameSettings.timerDuration}
                difficulty={player.level}
                onComplete={onComplete}
              />
            </ErrorBoundary>
          );
        case 'multiplication':
          return (
            <ErrorBoundary onReset={handleGameError}>
              <MultiplicationGame
                player={player}
                timerDuration={gameSettings.timerDuration}
                difficulty={player.level}
                onComplete={onComplete}
              />
            </ErrorBoundary>
          );
        case 'animals':
          return (
            <ErrorBoundary onReset={handleGameError}>
              <AnimalGame
                player={player}
                timerDuration={gameSettings.timerDuration}
                difficulty={player.level}
                onComplete={onComplete}
              />
            </ErrorBoundary>
          );
        case 'wordmath':
          return (
            <ErrorBoundary onReset={handleGameError}>
              <WordMathGame
                player={player}
                timerDuration={gameSettings.timerDuration}
                difficulty={player.level}
                onComplete={onComplete}
              />
            </ErrorBoundary>
          );
        default:
          return null;
      }
    } catch (e) {
      console.error("Error loading game component:", e);
      setError("Failed to load game. Please try again.");
      return (
        <div className={`p-6 rounded-xl border ${
          isDarkMode
            ? 'bg-red-900 bg-opacity-20 border-red-800 text-red-200'
            : 'bg-red-50 border-red-200 text-red-800'
        } text-center`}>
          <CircleAlert className="w-12 h-12 mx-auto mb-4" />
          <h3 className="text-lg font-bold mb-2">Game Error</h3>
          <p className="mb-4">We couldn't load this game right now.</p>
          <button
            onClick={() => setError(null)}
            className={`${
              isDarkMode
                ? 'bg-red-700 hover:bg-red-600 text-white'
                : 'bg-red-100 hover:bg-red-200 text-red-700'
            } px-4 py-2 rounded-lg flex items-center mx-auto`}
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Try Again
          </button>
        </div>
      );
    }
  };

  return (
    <div>
      {loading && gameState === 'animals' && (
        <div className="text-xs text-center mb-1 opacity-70">
          <span className={isDarkMode ? 'text-blue-300' : 'text-blue-500'}>
            Preparing animal images...
          </span>
        </div>
      )}

      {error ? (
        <div className={`mb-4 p-4 rounded-lg ${isDarkMode ? 'bg-red-900 bg-opacity-30 text-red-200' : 'bg-red-100 text-red-700'} flex items-center`}>
          <CircleAlert className="h-5 w-5 mr-2 flex-shrink-0" />
          <p>{error}</p>
        </div>
      ) : renderCurrentGame()}
    </div>
  );
};

export default GamesContainer;
