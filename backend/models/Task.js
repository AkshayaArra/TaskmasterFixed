
const mongoose = require('mongoose');

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
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  dueDate: {
    type: Date
  },
  columnId: {
    type: String,
    required: true,
    enum: ['todo', 'inProgress', 'blocked', 'done'],
    default: 'todo'
  },
  order: {
    type: Number,
    default: 0
  },
  assignee: {
    id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    name: String
  },
  commentsCount: {
    type: Number,
    default: 0
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

const Task = mongoose.model('Task', taskSchema);

module.exports = Task;
