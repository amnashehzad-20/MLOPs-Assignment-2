import React from 'react';
import { useTimer } from '../contexts/TimerContext';

function PomodoroTimer() {
  const {
    isRunning,
    mode,
    timeLeft,
    startTimer,
    pauseTimer,
    resetTimer,
    skipSession,
    formatTime,
    setMode
  } = useTimer();

  // Get mode name for display
  const getModeName = () => {
    switch (mode) {
      case 'work':
        return 'Focus Time';
      case 'shortBreak':
        return 'Short Break';
      case 'longBreak':
        return 'Long Break';
      default:
        return 'Focus Time';
    }
  };

  // Get color class based on mode
  const getModeColorClass = () => {
    switch (mode) {
      case 'work':
        return 'bg-red-500';
      case 'shortBreak':
        return 'bg-green-500';
      case 'longBreak':
        return 'bg-blue-500';
      default:
        return 'bg-red-500';
    }
  };

  return (
    <div className="pomodoro-timer p-6 rounded-lg shadow-lg max-w-md mx-auto bg-white">
      <div className={`timer-header p-4 rounded-t-lg text-white text-center ${getModeColorClass()}`}>
        <h2 className="text-2xl font-bold">{getModeName()}</h2>
      </div>

      <div className="timer-display text-center py-8">
        <div className="time text-6xl font-bold">{formatTime(timeLeft)}</div>
      </div>

      <div className="timer-controls flex justify-center space-x-4 mb-6">
        {isRunning ? (
          <button
            onClick={pauseTimer}
            className="px-6 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 transition"
          >
            Pause
          </button>
        ) : (
          <button
            onClick={() => startTimer()}
            className={`px-6 py-2 text-white rounded-md hover:opacity-90 transition ${
              mode === 'work' ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'
            }`}
          >
            Start
          </button>
        )}
        <button
          onClick={resetTimer}
          className="px-6 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition"
        >
          Reset
        </button>
        <button
          onClick={skipSession}
          className="px-6 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition"
        >
          Skip
        </button>
      </div>

      <div className="mode-controls flex justify-center space-x-2 text-sm">
        <button
          onClick={() => setMode('work')}
          className={`px-4 py-1 rounded-md ${
            mode === 'work' 
              ? 'bg-red-500 text-white' 
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Focus
        </button>
        <button
          onClick={() => setMode('shortBreak')}
          className={`px-4 py-1 rounded-md ${
            mode === 'shortBreak' 
              ? 'bg-green-500 text-white' 
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Short Break
        </button>
        <button
          onClick={() => setMode('longBreak')}
          className={`px-4 py-1 rounded-md ${
            mode === 'longBreak' 
              ? 'bg-blue-500 text-white' 
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Long Break
        </button>
      </div>
    </div>
  );
}

export default PomodoroTimer;