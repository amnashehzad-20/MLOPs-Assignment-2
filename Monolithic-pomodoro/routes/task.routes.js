const express = require('express');
const router = express.Router();
const taskController = require('../controllers/task.controller');
const authMiddleware = require('../middleware/auth');

// Apply auth middleware to all task routes
router.use(authMiddleware);

// Task routes
router.get('/', taskController.getTasks);
router.get('/statistics', taskController.getStatistics);
router.get('/due-soon', taskController.getTasksDueSoon);
router.get('/:id', taskController.getTaskById);
router.post('/', taskController.createTask);
router.put('/:id', taskController.updateTask);
router.delete('/:id', taskController.deleteTask);
router.post('/:id/pomodoro', taskController.updatePomodoroSession);

module.exports = router;