import { useState } from 'react';
import { Player, GameSettings } from '../App';
import { Book, LayoutList, Play, Timer, Users } from 'lucide-react';

interface GameSelectionProps {
  onStart: (players: Player[], settings: GameSettings) => void;
  initialSettings: GameSettings;
  isDarkMode: boolean;
}

const GameSelection: React.FC<GameSelectionProps> = ({ onStart, initialSettings, isDarkMode }) => {
  const [players, setPlayers] = useState<Player[]>([
    { name: 'Alex (Pre-K)', age: 5, grade: 'Pre-K', score: 0, level: 1, correctAnswers: 0 },
    { name: '1st Grade Player', age: 7, grade: '1st Grade', score: 0, level: 1, correctAnswers: 0 },
  ]);

  const [settings, setSettings] = useState<GameSettings>(initialSettings);

  const handleNameChange = (index: number, name: string) => {
    const newPlayers = [...players];
    newPlayers[index].name = name;
    setPlayers(newPlayers);
  };

  const handleTimerChange = (seconds: number) => {
    setSettings({
      ...settings,
      timerDuration: seconds
    });
  };

  const handleRoundsChange = (rounds: number) => {
    setSettings({
      ...settings,
      totalRounds: rounds
    });
  };

  const handleDifficultyChange = (difficulty: number) => {
    setSettings({
      ...settings,
      difficulty: difficulty
    });
  };

  return (
    <div className={`${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'} rounded-2xl shadow-xl p-8`}>
      <div className="text-center mb-8">
        <Users className={`inline-block ${isDarkMode ? 'text-purple-400' : 'text-indigo-500'} w-12 h-12 mb-2`} />
        <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-purple-300' : 'text-indigo-600'}`}>Who's Playing Today?</h2>
        <p className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>
          Choose your players and customize your learning adventure!
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {players.map((player, index) => (
          <div
            key={index}
            className={`p-4 rounded-xl ${index === 0
              ? isDarkMode ? 'bg-green-900 border border-green-700' : 'bg-green-50 border border-green-200'
              : isDarkMode ? 'bg-purple-900 border border-purple-700' : 'bg-purple-50 border border-purple-200'}`}
          >
            <h3 className="font-bold text-lg mb-2">
              {index === 0 ? 'Pre-K Player (5 years old)' : '1st Grade Player (7 years old)'}
            </h3>
            <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
              Player Name
            </label>
            <input
              type="text"
              value={player.name}
              onChange={(e) => handleNameChange(index, e.target.value)}
              className={`w-full px-4 py-2 rounded-lg border ${isDarkMode
                ? 'bg-gray-700 border-gray-600 text-white focus:ring-2 focus:ring-purple-500'
                : 'bg-white border-gray-300 focus:ring-2 focus:ring-indigo-300 focus:border-indigo-500'}
                outline-none transition-colors`}
              placeholder={`Enter player ${index + 1} name`}
            />
            <div className={`mt-2 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              {index === 0
                ? 'Will play opposites & animal recognition games'
                : 'Will play multiplication & word math problems'}
            </div>
          </div>
        ))}
      </div>

      <div className={`p-4 rounded-xl mb-8 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
        <h3 className={`font-bold text-lg mb-4 flex items-center ${isDarkMode ? 'text-purple-300' : 'text-indigo-600'}`}>
          <Timer className="mr-2 h-5 w-5" />
          Game Settings
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
              Timer Duration (seconds)
            </label>
            <div className="flex items-center">
              <input
                type="range"
                min="5"
                max="60"
                step="5"
                value={settings.timerDuration}
                onChange={(e) => handleTimerChange(parseInt(e.target.value))}
                className={`w-full mr-3 ${isDarkMode ? 'accent-purple-500' : 'accent-indigo-500'}`}
              />
              <span className={`font-mono text-lg ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                {settings.timerDuration}s
              </span>
            </div>
            <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              Time allowed for each question
            </p>
          </div>

          <div>
            <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
              Total Rounds
            </label>
            <div className="flex items-center">
              <input
                type="range"
                min="4"
                max="20"
                step="2"
                value={settings.totalRounds}
                onChange={(e) => handleRoundsChange(parseInt(e.target.value))}
                className={`w-full mr-3 ${isDarkMode ? 'accent-purple-500' : 'accent-indigo-500'}`}
              />
              <span className={`font-mono text-lg ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                {settings.totalRounds}
              </span>
            </div>
            <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              Number of questions in the game
            </p>
          </div>
        </div>

        <div className="mt-6">
          <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
            Starting Difficulty
          </label>
          <div className="flex items-center">
            <input
              type="range"
              min="1"
              max="5"
              step="1"
              value={settings.difficulty}
              onChange={(e) => handleDifficultyChange(parseInt(e.target.value))}
              className={`w-full mr-3 ${isDarkMode ? 'accent-purple-500' : 'accent-indigo-500'}`}
            />
            <span className={`font-mono text-lg ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              {settings.difficulty}
            </span>
          </div>
          <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            Set initial challenge level (players will level up as they play)
          </p>
        </div>
      </div>

      <div className={`p-4 rounded-xl mb-8 ${isDarkMode ? 'bg-blue-900 bg-opacity-30' : 'bg-blue-50'}`}>
        <h3 className={`font-bold text-lg mb-2 flex items-center ${isDarkMode ? 'text-blue-300' : 'text-blue-600'}`}>
          <Book className="mr-2 h-5 w-5" />
          Available Games
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-green-900 bg-opacity-50' : 'bg-green-100'}`}>
            <h4 className="font-bold">Pre-K Games (Age 5)</h4>
            <ul className="list-disc list-inside text-sm mt-1">
              <li>Opposites Challenge (big/small, hot/cold)</li>
              <li>Animal Recognition (name and identify)</li>
            </ul>
          </div>

          <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-purple-900 bg-opacity-50' : 'bg-purple-100'}`}>
            <h4 className="font-bold">1st Grade Games (Age 7)</h4>
            <ul className="list-disc list-inside text-sm mt-1">
              <li>Multiplication (with visual aids)</li>
              <li>Word Math Problems (storytelling math)</li>
            </ul>
          </div>
        </div>

        <p className={`text-xs mt-3 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          Games will automatically adjust to each player's age and level
        </p>
      </div>

      <div className="text-center">
        <button
          onClick={() => onStart(players, settings)}
          className={`${isDarkMode
            ? 'bg-purple-600 hover:bg-purple-700'
            : 'bg-indigo-500 hover:bg-indigo-600'}
            text-white px-6 py-3 rounded-full text-lg font-semibold
            transition-colors flex items-center justify-center mx-auto`}
        >
          <Play className="mr-2 h-5 w-5" />
          Start Learning Adventure
        </button>
      </div>
    </div>
  );
};

export default GameSelection;
