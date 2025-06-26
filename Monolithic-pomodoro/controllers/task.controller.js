const Task = require('../models/task.model');

// Get all tasks for a user
exports.getTasks = async (req, res) => {
  try {
    const { status, priority, sort } = req.query;
    
    // Build filter
    const filter = { userId: req.userId };
    
    if (status === 'completed') {
      filter.completed = true;
    } else if (status === 'active') {
      filter.completed = false;
    }
    
    if (priority && ['low', 'medium', 'high'].includes(priority)) {
      filter.priority = priority;
    }
    
    // Build sort
    let sortOption = { createdAt: -1 }; // Default: newest first
    
    if (sort === 'priority') {
      sortOption = { priority: 1, createdAt: -1 };
    } else if (sort === 'dueDate') {
      sortOption = { dueDate: 1, createdAt: -1 };
    } else if (sort === 'completed') {
      sortOption = { completed: 1, createdAt: -1 };
    }
    
    const tasks = await Task.find(filter).sort(sortOption);
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
    const { title, description, estimatedPomodoros, priority, dueDate } = req.body;
    
    // Validate required fields
    if (!title || !title.trim()) {
      return res.status(400).json({ message: 'Task title is required' });
    }
    
    const newTask = new Task({
      title: title.trim(),
      description: description ? description.trim() : '',
      estimatedPomodoros: Math.max(1, parseInt(estimatedPomodoros) || 1),
      priority: priority || 'medium',
      dueDate: dueDate ? new Date(dueDate) : null,
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
    const { title, description, estimatedPomodoros, priority, completed, completedPomodoros, dueDate } = req.body;
    
    const task = await Task.findOne({
      _id: req.params.id,
      userId: req.userId
    });
    
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    
    // Update fields if provided
    if (title !== undefined) {
      if (!title.trim()) {
        return res.status(400).json({ message: 'Task title cannot be empty' });
      }
      task.title = title.trim();
    }
    
    if (description !== undefined) task.description = description.trim();
    if (estimatedPomodoros !== undefined) {
      task.estimatedPomodoros = Math.max(1, parseInt(estimatedPomodoros) || 1);
    }
    if (priority !== undefined && ['low', 'medium', 'high'].includes(priority)) {
      task.priority = priority;
    }
    if (completed !== undefined) task.completed = completed;
    if (completedPomodoros !== undefined) {
      task.completedPomodoros = Math.max(0, parseInt(completedPomodoros) || 0);
    }
    if (dueDate !== undefined) {
      task.dueDate = dueDate ? new Date(dueDate) : null;
    }
    
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
    
    if (!duration || duration <= 0) {
      return res.status(400).json({ message: 'Valid duration is required' });
    }
    
    const task = await Task.findOne({
      _id: req.params.id,
      userId: req.userId
    });
    
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    
    // Add pomodoro session
    task.pomodoroSessions.push({
      duration: parseInt(duration),
      completed: completed !== false, // Default to true
      date: new Date()
    });
    
    // Increment completed pomodoros if session was completed
    if (completed !== false) {
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
    const activeTasks = totalTasks - completedTasks;
    const totalPomodoros = tasks.reduce((sum, task) => sum + task.completedPomodoros, 0);
    
    // Calculate total time spent in minutes
    const totalTimeInMinutes = tasks.reduce((sum, task) => {
      return sum + task.pomodoroSessions.reduce((sessionsSum, session) => {
        return sessionsSum + (session.completed ? session.duration : 0);
      }, 0);
    }, 0);
    
    // Calculate this week's statistics
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    const thisWeekPomodoros = tasks.reduce((sum, task) => {
      return sum + task.pomodoroSessions.filter(session => 
        session.date >= oneWeekAgo && session.completed
      ).length;
    }, 0);
    
    const thisWeekTime = tasks.reduce((sum, task) => {
      return sum + task.pomodoroSessions
        .filter(session => session.date >= oneWeekAgo && session.completed)
        .reduce((sessionsSum, session) => sessionsSum + session.duration, 0);
    }, 0);
    
    // Priority breakdown
    const priorityBreakdown = {
      high: tasks.filter(task => task.priority === 'high' && !task.completed).length,
      medium: tasks.filter(task => task.priority === 'medium' && !task.completed).length,
      low: tasks.filter(task => task.priority === 'low' && !task.completed).length
    };
    
    res.json({
      totalTasks,
      completedTasks,
      activeTasks,
      totalPomodoros,
      totalTimeInMinutes,
      completionRate: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
      thisWeek: {
        pomodoros: thisWeekPomodoros,
        timeInMinutes: thisWeekTime
      },
      priorityBreakdown,
      averagePomodorosPerTask: totalTasks > 0 ? Math.round((totalPomodoros / totalTasks) * 10) / 10 : 0
    });
  } catch (error) {
    console.error('Get statistics error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get tasks due soon (next 7 days)
exports.getTasksDueSoon = async (req, res) => {
  try {
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    
    const tasks = await Task.find({
      userId: req.userId,
      completed: false,
      dueDate: {
        $gte: new Date(),
        $lte: nextWeek
      }
    }).sort({ dueDate: 1 });
    
    res.json(tasks);
  } catch (error) {
    console.error('Get tasks due soon error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};