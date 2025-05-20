const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Task = require('../models/Task');
const User = require('../models/User');

// Get all tasks for current user
router.get('/', auth, async (req, res) => {
  try {
    // Removed createdBy filter to show all tasks
    const tasks = await Task.find()
      .sort({ order: 1 });

    res.json(tasks);
  } catch (error) {
    console.error('Get tasks error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all tasks for current workspace
router.get('/:workspaceId', auth, async (req, res) => {
  try {
    // Only filter by workspace, removed user restrictions
    const tasks = await Task.find({
      workspace: req.params.workspaceId
    }).sort({ order: 1 });

    res.json(tasks);
  } catch (error) {
    console.error('Get tasks error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create task
router.post('/:workspaceId', auth, async (req, res) => {
  try {
    const { title, description, priority, dueDate, columnId, assignee } = req.body;

    // Get highest order in column
    const highestOrderTask = await Task.findOne({
      workspace: req.params.workspaceId,
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
      createdBy: req.userId,
      workspace: req.params.workspaceId
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

    // Find task without checking ownership
    const task = await Task.findById(req.params.id);

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
    // Find and delete task without checking ownership
    const task = await Task.findByIdAndDelete(req.params.id);

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Reorder remaining tasks in column
    await Task.updateMany(
      {
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

    // Find task without checking ownership
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const oldColumn = task.columnId;
    const oldOrder = task.order;

    // Update tasks in old column
    if (oldColumn === sourceColumn) {
      await Task.updateMany(
        {
          columnId: oldColumn,
          order: { $gt: oldOrder }
        },
        { $inc: { order: -1 } }
      );
    }

    // Make space in new column
    await Task.updateMany(
      {
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
