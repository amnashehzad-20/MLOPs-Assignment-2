import React, { createContext, useState, useContext, useRef, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { useTask } from './TaskContext';

const TimerContext = createContext();

export function useTimer() {
  return useContext(TimerContext);
}

export function TimerProvider({ children }) {
  const { currentUser } = useAuth();
  const { updatePomodoroSession } = useTask();

  // Timer states
  const [isRunning, setIsRunning] = useState(false);
  const [mode, setMode] = useState('work'); // 'work', 'shortBreak', 'longBreak'
  const [timeLeft, setTimeLeft] = useState(25 * 60); // Default work time: 25 minutes
  const [currentTask, setCurrentTask] = useState(null);
  const [completedPomodoros, setCompletedPomodoros] = useState(0);
  
  // Settings (user preferences)
  const [settings, setSettings] = useState({
    workDuration: 25, // minutes,
    shortBreakDuration: 5, // minutes
    longBreakDuration: 15, // minutes
    longBreakInterval: 4 // after X pomodoros
  });
  
  // Timer ref
  const timerRef = useRef(null);
  
  // Handle timer completion
  const handleTimerComplete = useCallback(async () => {
    // Clear interval
    clearInterval(timerRef.current);
    setIsRunning(false);
    
    // If work session completed
    if (mode === 'work' && currentTask) {
      // Update completed pomodoros
      setCompletedPomodoros(prev => prev + 1);
      
      // Save pomodoro session to database
      try {
        await updatePomodoroSession(currentTask._id, {
          duration: settings.workDuration,
          completed: true
        });
      } catch (error) {
        console.error('Error saving pomodoro session:', error);
      }
      
      // Play notification sound if available
      const audio = new Audio('/notification.mp3');
      audio.play().catch(e => console.log('Audio play failed:', e));
      
      // Determine next break type
      const nextCompletedCount = completedPomodoros + 1;
      if (nextCompletedCount % settings.longBreakInterval === 0) {
        setMode('longBreak');
      } else {
        setMode('shortBreak');
      }
    }
    // If break completed, switch back to work mode
    else if (mode === 'shortBreak' || mode === 'longBreak') {
      // Play notification sound if available
      const audio = new Audio('/notification.mp3');
      audio.play().catch(e => console.log('Audio play failed:', e));
      
      setMode('work');
    }
  }, [mode, currentTask, settings, completedPomodoros, updatePomodoroSession]);
  
  // Load user settings
  useEffect(() => {
    if (currentUser && currentUser.pomodoroSettings) {
      setSettings({
        workDuration: currentUser.pomodoroSettings.workDuration,
        shortBreakDuration: currentUser.pomodoroSettings.shortBreakDuration,
        longBreakDuration: currentUser.pomodoroSettings.longBreakDuration,
        longBreakInterval: currentUser.pomodoroSettings.longBreakInterval
      });
    }
  }, [currentUser]);

  // Set time based on mode
  useEffect(() => {
    if (mode === 'work') {
      setTimeLeft(settings.workDuration * 60);
    } else if (mode === 'shortBreak') {
      setTimeLeft(settings.shortBreakDuration * 60);
    } else if (mode === 'longBreak') {
      setTimeLeft(settings.longBreakDuration * 60);
    }
  }, [mode, settings]);
  
  // Timer logic
  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prevTime => {
          if (prevTime <= 1) {
            handleTimerComplete();
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
    }
    
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isRunning, handleTimerComplete]);
  
  // Start timer
  const startTimer = (task = null) => {
    if (task) {
      setCurrentTask(task);
    }
    setIsRunning(true);
  };
  
  // Pause timer
  const pauseTimer = () => {
    setIsRunning(false);
  };
  
  // Reset timer
  const resetTimer = () => {
    setIsRunning(false);
    clearInterval(timerRef.current);
    
    if (mode === 'work') {
      setTimeLeft(settings.workDuration * 60);
    } else if (mode === 'shortBreak') {
      setTimeLeft(settings.shortBreakDuration * 60);
    } else if (mode === 'longBreak') {
      setTimeLeft(settings.longBreakDuration * 60);
    }
  };
  
  // Skip current session
  const skipSession = () => {
    resetTimer();
    
    if (mode === 'work') {
      const nextCompletedCount = completedPomodoros + 1;
      if (nextCompletedCount % settings.longBreakInterval === 0) {
        setMode('longBreak');
      } else {
        setMode('shortBreak');
      }
    } else {
      setMode('work');
    }
  };
  
  // Update timer settings
  const updateSettings = (newSettings) => {
    setSettings(prevSettings => ({
      ...prevSettings,
      ...newSettings
    }));
    
    // Reset timer with new duration
    resetTimer();
  };
  
  // Format time display (MM:SS)
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const value = {
    isRunning,
    mode,
    timeLeft,
    currentTask,
    completedPomodoros,
    settings,
    startTimer,
    pauseTimer,
    resetTimer,
    skipSession,
    updateSettings,
    formatTime,
    setMode
  };

  return (
    <TimerContext.Provider value={value}>
      {children}
    </TimerContext.Provider>
  );
}