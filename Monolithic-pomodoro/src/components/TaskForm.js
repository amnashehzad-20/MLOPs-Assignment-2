import React, { useState } from 'react';
import { useTask } from '../contexts/TaskContext';

function TaskForm({ onTaskAdded }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [estimatedPomodoros, setEstimatedPomodoros] = useState(1);
  const [priority, setPriority] = useState('medium');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { createTask } = useTask();
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Reset error
    setError('');
    
    // Validate form
    if (!title.trim()) {
      return setError('Task title is required');
    }
    
    try {
      setLoading(true);
      
      const taskData = {
        title,
        description,
        estimatedPomodoros,
        priority
      };
      
      await createTask(taskData);
      
      // Reset form
      setTitle('');
      setDescription('');
      setEstimatedPomodoros(1);
      setPriority('medium');
      
      // Notify parent component
      if (onTaskAdded) {
        onTaskAdded();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create task');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="bg-white shadow rounded-lg p-6 mb-6">
      <h2 className="text-xl font-bold mb-4">Add New Task</h2>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
          <span className="block sm:inline">{error}</span>
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="title" className="block text-gray-700 text-sm font-bold mb-2">
            Task Title *
          </label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            placeholder="What do you need to do?"
            required
          />
        </div>
        
        <div className="mb-4">
          <label htmlFor="description" className="block text-gray-700 text-sm font-bold mb-2">
            Description
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            placeholder="Task details (optional)"
            rows="3"
          />
        </div>
        
        <div className="flex flex-wrap -mx-2 mb-4">
          <div className="w-1/2 px-2">
            <label htmlFor="estimatedPomodoros" className="block text-gray-700 text-sm font-bold mb-2">
              Estimated Pomodoros
            </label>
            <input
              type="number"
              id="estimatedPomodoros"
              value={estimatedPomodoros}
              onChange={(e) => setEstimatedPomodoros(Math.max(1, parseInt(e.target.value) || 1))}
              min="1"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
          </div>
          
          <div className="w-1/2 px-2">
            <label htmlFor="priority" className="block text-gray-700 text-sm font-bold mb-2">
              Priority
            </label>
            <select
              id="priority"
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
        </div>
        
        <div className="flex items-center justify-end">
          <button
            type="submit"
            disabled={loading}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            {loading ? 'Adding...' : 'Add Task'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default TaskForm;