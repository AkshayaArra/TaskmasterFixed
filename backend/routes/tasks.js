
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Task = require('../models/Task');
const User = require('../models/User');

// Get all tasks for current user
router.get('/', auth, async (req, res) => {
  try {
    const tasks = await Task.find({ createdBy: req.userId })
      .sort({ order: 1 });
    
    res.json(tasks);
  } catch (error) {
    console.error('Get tasks error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create task
router.post('/', auth, async (req, res) => {
  try {
    const { title, description, priority, dueDate, columnId, assignee } = req.body;
    
    // Get highest order in column
    const highestOrderTask = await Task.findOne({ 
      createdBy: req.userId,
      columnId
    }).sort({ order: -1 });
    
    const order = highestOrderTask ? highestOrderTask.order + 1 : 0;
    
    let assigneeData = null;
    if (assignee && assignee.id) {
      const assigneeUser = await User.findById(assignee.id);
      if (assigneeUser) {
        assigneeData = {
          id: assigneeUser._id,
          name: assigneeUser.name
        };
      }
    }
    
    const task = new Task({
      title,
      description,
      priority,
      dueDate,
      columnId,
      order,
      assignee: assigneeData,
      createdBy: req.userId
    });
    
    await task.save();
    res.status(201).json(task);
  } catch (error) {
    console.error('Create task error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update task
router.put('/:id', auth, async (req, res) => {
  try {
    const { title, description, priority, dueDate, assignee } = req.body;
    
    // Find task and check ownership
    const task = await Task.findOne({ 
      _id: req.params.id,
      createdBy: req.userId
    });
    
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    
    // Update fields
    if (title) task.title = title;
    if (description !== undefined) task.description = description;
    if (priority) task.priority = priority;
    if (dueDate !== undefined) task.dueDate = dueDate;
    
    if (assignee && assignee.id) {
      const assigneeUser = await User.findById(assignee.id);
      if (assigneeUser) {
        task.assignee = {
          id: assigneeUser._id,
          name: assigneeUser.name
        };
      }
    } else if (assignee === null) {
      task.assignee = null;
    }
    
    await task.save();
    res.json(task);
  } catch (error) {
    console.error('Update task error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete task
router.delete('/:id', auth, async (req, res) => {
  try {
    // Find and delete task
    const task = await Task.findOneAndDelete({ 
      _id: req.params.id,
      createdBy: req.userId
    });
    
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    
    // Reorder remaining tasks in column
    await Task.updateMany(
      { 
        createdBy: req.userId,
        columnId: task.columnId,
        order: { $gt: task.order }
      },
      { $inc: { order: -1 } }
    );
    
    res.json({ message: 'Task deleted' });
  } catch (error) {
    console.error('Delete task error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Move task
router.put('/:id/move', auth, async (req, res) => {
  try {
    const { sourceColumn, destinationColumn, newIndex } = req.body;
    
    // Find task
    const task = await Task.findOne({ 
      _id: req.params.id,
      createdBy: req.userId
    });
    
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    
    const oldColumn = task.columnId;
    const oldOrder = task.order;
    
    // Update tasks in old column
    if (oldColumn === sourceColumn) {
      await Task.updateMany(
        { 
          createdBy: req.userId,
          columnId: oldColumn,
          order: { $gt: oldOrder }
        },
        { $inc: { order: -1 } }
      );
    }
    
    // Make space in new column
    await Task.updateMany(
      { 
        createdBy: req.userId,
        columnId: destinationColumn,
        order: { $gte: newIndex }
      },
      { $inc: { order: 1 } }
    );
    
    // Update task with new column and order
    task.columnId = destinationColumn;
    task.order = newIndex;
    await task.save();
    
    res.json(task);
  } catch (error) {
    console.error('Move task error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
