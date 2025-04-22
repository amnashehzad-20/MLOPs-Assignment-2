import React, { useEffect } from 'react';
import PomodoroTimer from '../components/PomodoroTimer';
import TaskForm from '../components/TaskForm';
import TaskList from '../components/TaskList';
import { useTask } from '../contexts/TaskContext';

function Dashboard() {
  const { fetchTasks, statistics } = useTask();
  
  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <div className="sticky top-8">
            {/* Timer Section */}
            <PomodoroTimer />
            
            {/* Statistics Card */}
            {statistics && (
              <div className="bg-white shadow rounded-lg p-6 mt-6">
                <h2 className="text-xl font-bold mb-4">Statistics</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-indigo-50 p-4 rounded-lg text-center">
                    <p className="text-sm text-indigo-600 font-medium">Total Tasks</p>
                    <p className="text-2xl font-bold text-indigo-800">{statistics.totalTasks}</p>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg text-center">
                    <p className="text-sm text-green-600 font-medium">Completed</p>
                    <p className="text-2xl font-bold text-green-800">{statistics.completedTasks}</p>
                  </div>
                  <div className="bg-red-50 p-4 rounded-lg text-center">
                    <p className="text-sm text-red-600 font-medium">Pomodoros</p>
                    <p className="text-2xl font-bold text-red-800">{statistics.totalPomodoros}</p>
                  </div>
                  <div className="bg-yellow-50 p-4 rounded-lg text-center">
                    <p className="text-sm text-yellow-600 font-medium">Total Time</p>
                    <p className="text-2xl font-bold text-yellow-800">
                      {Math.floor(statistics.totalTimeInMinutes / 60)}h {statistics.totalTimeInMinutes % 60}m
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        
        <div className="lg:col-span-2">
          {/* Task Form */}
          <TaskForm onTaskAdded={fetchTasks} />
          
          {/* Task List */}
          <TaskList />
        </div>
      </div>
    </div>
  );
}

export default Dashboard;