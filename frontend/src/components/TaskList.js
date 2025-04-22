import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTask } from '../contexts/TaskContext';
import { useTimer } from '../contexts/TimerContext';

function TaskList() {
  const { tasks, loading, error, deleteTask, updateTask } = useTask();
  const { startTimer, currentTask } = useTimer();
  const [filter, setFilter] = useState('all'); // 'all', 'active', 'completed'

  // Handle starting a pomodoro session for a task
  const handleStartTask = (task) => {
    startTimer(task);
  };

  // Handle task completion toggle
  const handleToggleComplete = async (task) => {
    try {
      await updateTask(task._id, { completed: !task.completed });
    } catch (error) {
      console.error('Error toggling task completion:', error);
    }
  };

  // Handle task deletion
  const handleDeleteTask = async (taskId) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await deleteTask(taskId);
      } catch (error) {
        console.error('Error deleting task:', error);
      }
    }
  };

  // Filter tasks based on selected filter
  const filteredTasks = tasks.filter(task => {
    if (filter === 'active') return !task.completed;
    if (filter === 'completed') return task.completed;
    return true; // 'all' filter
  });

  // Sort tasks by priority and completion status
  const sortedTasks = [...filteredTasks].sort((a, b) => {
    // First sort by completion status
    if (a.completed !== b.completed) {
      return a.completed ? 1 : -1; // Incomplete tasks first
    }
    
    // Then sort by priority
    const priorityValues = { high: 0, medium: 1, low: 2 };
    return priorityValues[a.priority] - priorityValues[b.priority];
  });

  // Determine priority badge color
  const getPriorityBadgeColor = (priority) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">My Tasks</h2>
        
        <div className="flex space-x-2">
          <button 
            onClick={() => setFilter('all')} 
            className={`px-3 py-1 rounded-md text-sm ${filter === 'all' ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-700'}`}
          >
            All
          </button>
          <button 
            onClick={() => setFilter('active')} 
            className={`px-3 py-1 rounded-md text-sm ${filter === 'active' ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-700'}`}
          >
            Active
          </button>
          <button 
            onClick={() => setFilter('completed')} 
            className={`px-3 py-1 rounded-md text-sm ${filter === 'completed' ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-700'}`}
          >
            Completed
          </button>
        </div>
      </div>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
          <span className="block sm:inline">{error}</span>
        </div>
      )}
      
      {loading ? (
        <div className="text-center py-8">
          <p className="text-gray-500">Loading tasks...</p>
        </div>
      ) : sortedTasks.length === 0 ? (
        <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-lg">
          <p className="text-gray-500">{filter === 'all' ? 'No tasks yet' : `No ${filter} tasks`}</p>
          <p className="text-gray-500 mt-2">Add a new task to get started!</p>
        </div>
      ) : (
        <ul className="divide-y divide-gray-200">
          {sortedTasks.map(task => (
            <li key={task._id} className="py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-start space-x-3 flex-grow">
                  <input
                    type="checkbox"
                    checked={task.completed}
                    onChange={() => handleToggleComplete(task)}
                    className="h-5 w-5 text-indigo-600 rounded mt-1"
                  />
                  
                  <div className="flex-grow">
                    <div className="flex items-center space-x-2">
                      <span className={`font-medium ${task.completed ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                        {task.title}
                      </span>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityBadgeColor(task.priority)}`}>
                        {task.priority}
                      </span>
                    </div>
                    
                    {task.description && (
                      <p className={`text-sm mt-1 ${task.completed ? 'text-gray-400' : 'text-gray-600'}`}>
                        {task.description}
                      </p>
                    )}
                    
                    <div className="flex items-center mt-2 text-sm text-gray-500 space-x-4">
                      <span>
                        <span className="font-medium">{task.completedPomodoros}</span> / {task.estimatedPomodoros} pomodoros
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  {!task.completed && (
                    <button
                      onClick={() => handleStartTask(task)}
                      disabled={currentTask && currentTask._id === task._id}
                      className={`text-sm px-3 py-1 rounded-md ${
                        currentTask && currentTask._id === task._id
                          ? 'bg-gray-200 text-gray-600'
                          : 'bg-red-500 text-white hover:bg-red-600'
                      }`}
                    >
                      {currentTask && currentTask._id === task._id ? 'Active' : 'Start'}
                    </button>
                  )}
                  
                  <Link 
                    to={`/tasks/${task._id}`}
                    className="text-sm px-3 py-1 rounded-md bg-indigo-100 text-indigo-700 hover:bg-indigo-200"
                  >
                    View
                  </Link>
                  
                  <button
                    onClick={() => handleDeleteTask(task._id)}
                    className="text-sm px-3 py-1 rounded-md bg-gray-100 text-gray-700 hover:bg-gray-200"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default TaskList;