const mongoose = require('mongoose');

const pomodoroSessionSchema = new mongoose.Schema({
  duration: {
    type: Number,
    required: true
  },
  completed: {
    type: Boolean,
    default: true
  },
  date: {
    type: Date,
    default: Date.now
  }
});

const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  userId: {  // Changed from reference to string ID
    type: String,
    required: true
  },
  estimatedPomodoros: {
    type: Number,
    default: 1
  },
  completedPomodoros: {
    type: Number,
    default: 0
  },
  pomodoroSessions: [pomodoroSessionSchema],
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  completed: {
    type: Boolean,
    default: false
  },
  dueDate: {
    type: Date
  }
}, { timestamps: true });

module.exports = mongoose.model('Task', taskSchema);