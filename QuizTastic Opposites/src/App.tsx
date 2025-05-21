import { useState, useEffect } from 'react';
import './index.css';
import GameSelection from './components/GameSelection';
import GamesContainer from './components/GamesContainer';
import ErrorBoundary from './components/ErrorBoundary';
import { Award, CircleAlert, Moon, RotateCcw, Sun, Trophy } from 'lucide-react';

export type Player = {
  name: string;
  age: number;
  grade: string;
  score: number;
  level: number;
  correctAnswers: number;
};

export type GameState = 'selection' | 'opposites' | 'multiplication' | 'animals' | 'wordmath' | 'results';

export type GameSettings = {
  timerDuration: number;
  totalRounds: number;
  difficulty: number;
};

const App = () => {
  const [gameState, setGameState] = useState<GameState>('selection');
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [players, setPlayers] = useState<Player[]>([
    { name: 'Alex (Pre-K)', age: 5, grade: 'Pre-K', score: 0, level: 1, correctAnswers: 0 },
    { name: 'Player 2', age: 7, grade: '1st Grade', score: 0, level: 1, correctAnswers: 0 },
  ]);
  const [roundsPlayed, setRoundsPlayed] = useState(0);
  const [gameSettings, setGameSettings] = useState<GameSettings>({
    timerDuration: 20,
    totalRounds: 10,
    difficulty: 1
  });
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showLevelUp, setShowLevelUp] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadGoogleFonts = () => {
      const link = document.createElement('link');
      link.href = 'https://fonts.googleapis.com/css2?family=Comic+Neue:wght@400;700&display=swap';
      link.rel = 'stylesheet';
      document.head.appendChild(link);
    };

    loadGoogleFonts();
  }, []);

  useEffect(() => {
    // Apply dark mode to document body
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const checkForLevelUp = (index: number) => {
    // Level up every 5 correct answers
    const player = players[index];
    const levelThreshold = player.level * 5;
    
    if (player.correctAnswers >= levelThreshold && player.level < 10) {
      setPlayers(prevPlayers => {
        const newPlayers = [...prevPlayers];
        newPlayers[index].level += 1;
        return newPlayers;
      });
      setShowLevelUp(index);
      
      // Hide level up notification after 3 seconds
      setTimeout(() => {
        setShowLevelUp(null);
      }, 3000);
      
      return true;
    }
    return false;
  };

  const updatePlayerScore = (points: number, isCorrect: boolean) => {
    setPlayers(prevPlayers => {
      const newPlayers = [...prevPlayers];
      newPlayers[currentPlayerIndex].score += points;
      
      if (isCorrect) {
        newPlayers[currentPlayerIndex].correctAnswers += 1;
      }
      
      return newPlayers;
    });
    
    if (isCorrect) {
      checkForLevelUp(currentPlayerIndex);
    }
  };

  const nextTurn = () => {
    setCurrentPlayerIndex(prevIndex => (prevIndex === 0 ? 1 : 0));
    setRoundsPlayed(prev => prev + 1);
    
    if (roundsPlayed + 1 >= gameSettings.totalRounds) {
      setGameState('results');
    }
  };

  const startGame = (customPlayers: Player[], settings: GameSettings) => {
    try {
      setPlayers(customPlayers);
      setGameSettings(settings);
      // Start with the younger player first
      setCurrentPlayerIndex(customPlayers[0].age <= customPlayers[1].age ? 0 : 1);
      // Choose game type based on current player's age and randomize sometimes
      selectGameForPlayer(customPlayers[currentPlayerIndex]);
      setRoundsPlayed(0);
      setError(null);
    } catch (e) {
      setError("Failed to start game. Please try again.");
      console.error("Error starting game:", e);
    }
  };

  const selectGameForPlayer = (player: Player) => {
    if (player.age < 6) {
      // For Pre-K: alternate between opposites and animal recognition
      const random = Math.random();
      setGameState(random > 0.5 ? 'opposites' : 'animals');
    } else {
      // For 1st grade: alternate between multiplication and word math problems
      const random = Math.random();
      setGameState(random > 0.5 ? 'multiplication' : 'wordmath');
    }
  };

  const resetGame = () => {
    setPlayers([
      { name: 'Alex (Pre-K)', age: 5, grade: 'Pre-K', score: 0, level: 1, correctAnswers: 0 },
      { name: 'Player 2', age: 7, grade: '1st Grade', score: 0, level: 1, correctAnswers: 0 },
    ]);
    setCurrentPlayerIndex(0);
    setGameState('selection');
    setRoundsPlayed(0);
    setError(null);
  };

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  const handleGameError = () => {
    setError("There was a problem with the game. Let's try again.");
    resetGame();
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDarkMode 
      ? 'bg-gradient-to-b from-gray-900 to-indigo-900 text-white' 
      : 'bg-gradient-to-b from-blue-100 to-purple-100 text-gray-900'}`} 
      style={{ fontFamily: "'Comic Neue', cursive" }}>
      <div className="max-w-5xl mx-auto p-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className={`text-4xl font-bold text-center ${isDarkMode ? 'text-purple-300' : 'text-indigo-600'} drop-shadow-md`}>
            Fun Learning Quiz!
          </h1>
          <button 
            onClick={toggleTheme} 
            className={`p-2 rounded-full ${isDarkMode 
              ? 'bg-yellow-400 text-gray-900' 
              : 'bg-indigo-600 text-white'}`}
            aria-label="Toggle theme"
          >
            {isDarkMode ? <Sun size={24} /> : <Moon size={24} />}
          </button>
        </div>

        {error && (
          <div className={`mb-4 p-4 rounded-lg ${isDarkMode ? 'bg-red-900 bg-opacity-30 text-red-200' : 'bg-red-100 text-red-700'} flex items-center`}>
            <CircleAlert className="h-5 w-5 mr-2 flex-shrink-0" />
            <p>{error}</p>
          </div>
        )}

        <ErrorBoundary onReset={resetGame}>
          {gameState === 'selection' && (
            <GameSelection 
              onStart={startGame} 
              initialSettings={gameSettings}
              isDarkMode={isDarkMode}
            />
          )}

          {(gameState === 'opposites' || gameState === 'multiplication' || gameState === 'animals' || gameState === 'wordmath') && (
            <div className={`${isDarkMode 
              ? 'bg-gray-800 text-white' 
              : 'bg-white text-gray-900'} rounded-2xl shadow-xl p-6 mb-4`}>
              <div className="flex justify-between items-center mb-4">
                <div className="flex space-x-3">
                  {players.map((player, index) => (
                    <div 
                      key={index}
                      className={`px-4 py-2 rounded-full font-semibold ${
                        currentPlayerIndex === index
                          ? isDarkMode 
                            ? 'bg-purple-600 text-white ring-4 ring-purple-300 animate-pulse' 
                            : 'bg-indigo-500 text-white ring-4 ring-indigo-200 animate-pulse'
                          : isDarkMode
                            ? 'bg-gray-700 text-gray-300'
                            : 'bg-gray-100 text-gray-500'
                      }`}
                    >
                      {player.name}: {player.score}
                      <span className="ml-2 text-xs bg-yellow-500 text-black px-2 py-0.5 rounded-full">
                        Lv {player.level}
                      </span>
                    </div>
                  ))}
                </div>
                <div className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                  Round {roundsPlayed + 1} of {gameSettings.totalRounds}
                </div>
              </div>

              {showLevelUp !== null && (
                <div className="fixed top-1/4 left-1/2 transform -translate-x-1/2 -translate-y-1/2 
                  bg-yellow-400 text-black px-6 py-4 rounded-xl shadow-2xl z-50
                  animate-bounce flex items-center space-x-2">
                  <Trophy className="h-6 w-6" />
                  <span className="font-bold text-lg">Level Up! {players[showLevelUp].name} is now level {players[showLevelUp].level}!</span>
                </div>
              )}

              <GamesContainer 
                gameState={gameState}
                player={players[currentPlayerIndex]}
                gameSettings={gameSettings}
                onComplete={(points, isCorrect) => {
                  updatePlayerScore(points, isCorrect);
                  nextTurn();
                }}
                isDarkMode={isDarkMode}
              />
            </div>
          )}

          {gameState === 'results' && (
            <div className={`${isDarkMode 
              ? 'bg-gray-800 text-white' 
              : 'bg-white text-gray-900'} rounded-2xl shadow-xl p-8 text-center`}>
              <h2 className={`text-3xl font-bold ${isDarkMode ? 'text-purple-300' : 'text-indigo-600'} mb-4`}>
                Game Over!
              </h2>
              <div className="mb-6">
                <Award className={`inline-block ${isDarkMode ? 'text-yellow-300' : 'text-yellow-500'} w-20 h-20 mb-2`} />
                <h3 className="text-2xl font-bold">
                  {players[0].score > players[1].score 
                    ? `${players[0].name} Wins!` 
                    : players[1].score > players[0].score 
                      ? `${players[1].name} Wins!` 
                      : "It's a Tie!"}
                </h3>
              </div>
              
              <div className="flex justify-center space-x-8 mb-8">
                {players.map((player, index) => (
                  <div key={index} className="text-center">
                    <div className={`text-xl font-bold ${index === 0 
                      ? isDarkMode ? 'text-green-400' : 'text-green-600' 
                      : isDarkMode ? 'text-purple-400' : 'text-purple-600'}`}>
                      {player.name}
                    </div>
                    <div className="text-4xl font-bold">{player.score}</div>
                    <div className={`${isDarkMode ? 'text-gray-300' : 'text-gray-500'} mb-2`}>{player.grade}</div>
                    <div className="bg-yellow-500 text-black px-3 py-1 rounded-full inline-block">
                      Level {player.level}
                    </div>
                    <div className={`mt-2 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      {player.correctAnswers} correct answers
                    </div>
                  </div>
                ))}
              </div>
              
              <button
                onClick={resetGame}
                className={`${isDarkMode 
                  ? 'bg-purple-600 hover:bg-purple-700 text-white' 
                  : 'bg-indigo-500 hover:bg-indigo-600 text-white'} 
                  px-6 py-3 rounded-full text-lg font-semibold transition-colors 
                  flex items-center justify-center mx-auto`}
              >
                <RotateCcw className="mr-2 h-5 w-5" />
                Play Again
              </button>
            </div>
          )}
        </ErrorBoundary>
      </div>
    </div>
  );
};

export default App;
