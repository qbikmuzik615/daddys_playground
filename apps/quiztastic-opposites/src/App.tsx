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


  return (
    <div className={`min-h-screen transition-all duration-500 relative overflow-hidden ${isDarkMode
      ? 'bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900'
      : 'bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50'}`}>

      {/* Animated background blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className={`absolute top-0 -left-4 w-72 h-72 ${isDarkMode ? 'bg-purple-500' : 'bg-blue-400'} rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float`}></div>
        <div className={`absolute top-0 -right-4 w-72 h-72 ${isDarkMode ? 'bg-cyan-500' : 'bg-purple-400'} rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float animation-delay-2000`}></div>
        <div className={`absolute -bottom-8 left-20 w-72 h-72 ${isDarkMode ? 'bg-pink-500' : 'bg-pink-400'} rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float animation-delay-4000`}></div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8 relative z-10">
        {/* Header */}
        <div className="flex justify-between items-center mb-8 animate-slide-down">
          <div>
            <h1 className={`text-5xl font-display font-extrabold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              <span className="gradient-text">QuizTastic</span> 🎯
            </h1>
            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Learning Made Fun & Interactive
            </p>
          </div>

          <button
            onClick={toggleTheme}
            className={`p-4 rounded-2xl transition-all duration-300 transform hover:scale-110 hover:rotate-12 ${isDarkMode
              ? 'glass-card text-yellow-400 hover:shadow-glow'
              : 'glass-card text-indigo-600 hover:shadow-lg'}`}
            aria-label="Toggle theme"
          >
            {isDarkMode ? <Sun size={28} /> : <Moon size={28} />}
          </button>
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-6 glass-card border-danger-500/50 p-4 flex items-center gap-3 animate-scale-in">
            <div className="p-2 rounded-full bg-danger-500/20">
              <CircleAlert className="h-5 w-5 text-danger-400" />
            </div>
            <p className={isDarkMode ? 'text-danger-200' : 'text-danger-700'}>{error}</p>
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
            <div className="glass-card-strong p-8 mb-6 animate-scale-in">
              {/* Player badges */}
              <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
                <div className="flex flex-wrap gap-3">
                  {players.map((player, index) => (
                    <div
                      key={index}
                      className={`group relative px-6 py-3 rounded-2xl font-semibold transition-all duration-300 transform ${
                        currentPlayerIndex === index
                          ? 'glass-card-strong scale-110 shadow-glow animate-pulse-slow'
                          : 'glass-card opacity-60 hover:opacity-80'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${currentPlayerIndex === index ? 'bg-green-400 animate-pulse' : 'bg-gray-400'}`}></div>
                        <div>
                          <div className={`text-sm font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                            {player.name}
                          </div>
                          <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            Score: {player.score}
                          </div>
                        </div>
                        <div className="ml-2 px-3 py-1 rounded-full bg-gradient-to-r from-accent-400 to-accent-500 text-white text-xs font-bold shadow-lg">
                          ⭐ Lv {player.level}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="glass-card px-4 py-2 rounded-xl">
                  <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Round</div>
                  <div className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {roundsPlayed + 1} / {gameSettings.totalRounds}
                  </div>
                </div>
              </div>

              {/* Level up notification */}
              {showLevelUp !== null && (
                <div className="fixed top-1/4 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 animate-bounce">
                  <div className="glass-card-strong bg-gradient-to-r from-accent-400 to-accent-500 px-8 py-6 shadow-2xl">
                    <div className="flex items-center gap-4">
                      <Trophy className="h-12 w-12 text-white animate-float" />
                      <div className="text-white">
                        <div className="text-2xl font-bold">Level Up! 🎉</div>
                        <div className="text-sm opacity-90">
                          {players[showLevelUp].name} reached Level {players[showLevelUp].level}!
                        </div>
                      </div>
                    </div>
                  </div>
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
            <div className="glass-card-strong p-12 text-center animate-scale-in">
              {/* Trophy animation */}
              <div className="mb-8">
                <Award className="inline-block w-24 h-24 text-accent-400 animate-float mb-4" />
                <h2 className={`text-4xl font-display font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Game Over!
                </h2>
                <h3 className="text-3xl font-bold gradient-text">
                  {players[0].score > players[1].score
                    ? `🏆 ${players[0].name} Wins!`
                    : players[1].score > players[0].score
                      ? `🏆 ${players[1].name} Wins!`
                      : "🤝 It's a Tie!"}
                </h3>
              </div>

              {/* Player results */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
                {players.map((player, index) => (
                  <div
                    key={index}
                    className={`glass-card p-6 transform transition-all duration-300 hover:scale-105 ${
                      (players[0].score > players[1].score && index === 0) ||
                      (players[1].score > players[0].score && index === 1)
                        ? 'ring-4 ring-accent-400 shadow-glow-lg'
                        : ''
                    }`}
                  >
                    <div className="mb-4">
                      <div className={`text-2xl font-bold mb-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {player.name}
                      </div>
                      <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        {player.grade}
                      </div>
                    </div>

                    <div className="mb-4">
                      <div className={`text-6xl font-bold gradient-text`}>
                        {player.score}
                      </div>
                      <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        Total Points
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between glass-card px-4 py-2 rounded-lg">
                        <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Level</span>
                        <div className="px-3 py-1 rounded-full bg-gradient-to-r from-accent-400 to-accent-500 text-white text-sm font-bold">
                          ⭐ {player.level}
                        </div>
                      </div>
                      <div className="flex items-center justify-between glass-card px-4 py-2 rounded-lg">
                        <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Correct</span>
                        <span className={`text-sm font-bold ${isDarkMode ? 'text-success-400' : 'text-success-600'}`}>
                          ✓ {player.correctAnswers}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Play again button */}
              <button
                onClick={resetGame}
                className="btn-primary text-lg flex items-center justify-center mx-auto gap-2"
              >
                <RotateCcw className="h-5 w-5" />
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
