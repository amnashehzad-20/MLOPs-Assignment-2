const Task = require('../models/task.model');

// Get all tasks for a user
exports.getTasks = async (req, res) => {
  try {
    const tasks = await Task.find({ userId: req.userId }).sort({ createdAt: -1 });
    res.json(tasks);
  } catch (error) {
    console.error('Get tasks error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get a specific task
exports.getTaskById = async (req, res) => {
  try {
    const task = await Task.findOne({ 
      _id: req.params.id,
      userId: req.userId 
    });
    
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    
    res.json(task);
  } catch (error) {
    console.error('Get task error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Create a new task
exports.createTask = async (req, res) => {
  try {
    const { title, description, estimatedPomodoros, priority } = req.body;
    
    const newTask = new Task({
      title,
      description,
      estimatedPomodoros,
      priority: priority || 'medium',
      userId: req.userId
    });
    
    const savedTask = await newTask.save();
    res.status(201).json(savedTask);
  } catch (error) {
    console.error('Create task error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update a task
exports.updateTask = async (req, res) => {
  try {
    const { title, description, estimatedPomodoros, priority, completed, completedPomodoros } = req.body;
    
    const task = await Task.findOne({
      _id: req.params.id,
      userId: req.userId
    });
    
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    
    // Update fields if provided
    if (title !== undefined) task.title = title;
    if (description !== undefined) task.description = description;
    if (estimatedPomodoros !== undefined) task.estimatedPomodoros = estimatedPomodoros;
    if (priority !== undefined) task.priority = priority;
    if (completed !== undefined) task.completed = completed;
    if (completedPomodoros !== undefined) task.completedPomodoros = completedPomodoros;
    
    const updatedTask = await task.save();
    res.json(updatedTask);
  } catch (error) {
    console.error('Update task error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Delete a task
exports.deleteTask = async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({
      _id: req.params.id,
      userId: req.userId
    });
    
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    
    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Delete task error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update pomodoro session for a task
exports.updatePomodoroSession = async (req, res) => {
  try {
    const { duration, completed } = req.body;
    
    const task = await Task.findOne({
      _id: req.params.id,
      userId: req.userId
    });
    
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    
    // Add pomodoro session
    task.pomodoroSessions.push({
      duration,
      completed,
      date: new Date()
    });
    
    // Increment completed pomodoros if session was completed
    if (completed) {
      task.completedPomodoros += 1;
    }
    
    const updatedTask = await task.save();
    res.json(updatedTask);
  } catch (error) {
    console.error('Update pomodoro session error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get pomodoro statistics
exports.getStatistics = async (req, res) => {
  try {
    // Get all tasks for the user
    const tasks = await Task.find({ userId: req.userId });
    
    // Calculate statistics
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(task => task.completed).length;
    const totalPomodoros = tasks.reduce((sum, task) => sum + task.completedPomodoros, 0);
    
    // Calculate total time spent in minutes
    const totalTimeInMinutes = tasks.reduce((sum, task) => {
      return sum + task.pomodoroSessions.reduce((sessionsSum, session) => {
        return sessionsSum + (session.completed ? session.duration : 0);
      }, 0);
    }, 0);
    
    res.json({
      totalTasks,
      completedTasks,
      totalPomodoros,
      totalTimeInMinutes,
      completionRate: totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0
    });
  } catch (error) {
    console.error('Get statistics error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};