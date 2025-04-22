import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { tasksAPI } from '../services/api';
import { useAuth } from './AuthContext';

const TaskContext = createContext();

export function useTask() {
  return useContext(TaskContext);
}

export function TaskProvider({ children }) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statistics, setStatistics] = useState(null);
  
  const { currentUser } = useAuth();
  
  // Fetch statistics
  const fetchStatistics = useCallback(async () => {
    if (!currentUser) return;
    
    try {
      const response = await tasksAPI.getStatistics();
      setStatistics(response.data);
    } catch (error) {
      console.error('Error fetching statistics:', error);
    }
  }, [currentUser]);
  
  // Fetch tasks when user is authenticated
  const fetchTasks = useCallback(async () => {
    if (!currentUser) return;
    
    try {
      setLoading(true);
      const response = await tasksAPI.getTasks();
      setTasks(response.data);
      setError('');
      
      // Also fetch statistics
      fetchStatistics();
    } catch (error) {
      console.error('Error fetching tasks:', error);
      setError('Failed to fetch tasks');
    } finally {
      setLoading(false);
    }
  }, [currentUser, fetchStatistics]);

  useEffect(() => {
    if (currentUser) {
      fetchTasks();
    } else {
      setTasks([]);
      setStatistics(null);
      setLoading(false);
    }
  }, [currentUser, fetchTasks]);

  const getTaskById = async (taskId) => {
    try {
      setLoading(true);
      const response = await tasksAPI.getTaskById(taskId);
      return response.data;
    } catch (error) {
      console.error(`Error fetching task ${taskId}:`, error);
      setError('Failed to fetch task');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const createTask = async (taskData) => {
    try {
      setLoading(true);
      const response = await tasksAPI.createTask(taskData);
      
      // Update tasks list
      setTasks([response.data, ...tasks]);
      
      // Update statistics
      fetchStatistics();
      
      return response.data;
    } catch (error) {
      console.error('Error creating task:', error);
      setError('Failed to create task');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateTask = async (taskId, updatedData) => {
    try {
      setLoading(true);
      const response = await tasksAPI.updateTask(taskId, updatedData);
      
      // Update tasks list
      setTasks(tasks.map(task => 
        task._id === taskId ? response.data : task
      ));
      
      // Update statistics
      fetchStatistics();
      
      return response.data;
    } catch (error) {
      console.error(`Error updating task ${taskId}:`, error);
      setError('Failed to update task');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const deleteTask = async (taskId) => {
    try {
      setLoading(true);
      await tasksAPI.deleteTask(taskId);
      
      // Update tasks list
      setTasks(tasks.filter(task => task._id !== taskId));
      
      // Update statistics
      fetchStatistics();
      
      return true;
    } catch (error) {
      console.error(`Error deleting task ${taskId}:`, error);
      setError('Failed to delete task');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updatePomodoroSession = async (taskId, sessionData) => {
    try {
      setLoading(true);
      const response = await tasksAPI.updatePomodoroSession(taskId, sessionData);
      
      // Update tasks list
      setTasks(tasks.map(task => 
        task._id === taskId ? response.data : task
      ));
      
      // Update statistics
      fetchStatistics();
      
      return response.data;
    } catch (error) {
      console.error(`Error updating pomodoro session for task ${taskId}:`, error);
      setError('Failed to update pomodoro session');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const value = {
    tasks,
    loading,
    error,
    statistics,
    fetchTasks,
    getTaskById,
    createTask,
    updateTask,
    deleteTask,
    updatePomodoroSession
  };

  return (
    <TaskContext.Provider value={value}>
      {children}
    </TaskContext.Provider>
  );
}