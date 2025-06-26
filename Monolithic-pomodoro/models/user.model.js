const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    trim: true,
    min: 3,
    max: 50
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true,
    min: 6
  },
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  pomodoroSettings: {
    workDuration: {
      type: Number,
      default: 25 // 25 minutes
    },
    shortBreakDuration: {
      type: Number,
      default: 5 // 5 minutes
    },
    longBreakDuration: {
      type: Number,
      default: 15 // 15 minutes
    },
    longBreakInterval: {
      type: Number,
      default: 4 // After 4 pomodoros
    }
  }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);