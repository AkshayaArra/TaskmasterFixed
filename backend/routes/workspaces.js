const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Workspace = require('../models/Workspace');
const User = require('../models/User');

// Get all workspaces for the current user
router.get('/', auth, async (req, res) => {
  try {
    const workspaces = await Workspace.find({
      $or: [
        { owner: req.userId },
        { 'members.user': req.userId }
      ]
    }).populate('owner', 'name email')
      .populate('members.user', 'name email');

    res.json(workspaces);
  } catch (error) {
    console.error('Get workspaces error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create a new workspace
router.post('/', auth, async (req, res) => {
  try {
    const { name } = req.body;

    const workspace = new Workspace({
      name,
      owner: req.userId,
      members: [{ user: req.userId, role: 'owner' }]
    });

    await workspace.save();

    // Populate owner and member details
    await workspace.populate('owner', 'name email');
    await workspace.populate('members.user', 'name email');

    res.status(201).json(workspace);
  } catch (error) {
    console.error('Create workspace error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update workspace
router.put('/:id', auth, async (req, res) => {
  try {
    const { name } = req.body;
    const workspace = await Workspace.findOne({
      _id: req.params.id,
      owner: req.userId
    });

    if (!workspace) {
      return res.status(404).json({ message: 'Workspace not found' });
    }

    workspace.name = name;
    await workspace.save();

    await workspace.populate('owner', 'name email');
    await workspace.populate('members.user', 'name email');

    res.json(workspace);
  } catch (error) {
    console.error('Update workspace error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete workspace
router.delete('/:id', auth, async (req, res) => {
  try {
    const workspace = await Workspace.findOne({
      _id: req.params.id,
      owner: req.userId
    });

    if (!workspace) {
      return res.status(404).json({ message: 'Workspace not found' });
    }

    await workspace.remove();
    res.json({ message: 'Workspace deleted' });
  } catch (error) {
    console.error('Delete workspace error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add member to workspace
router.post('/:id/members', auth, async (req, res) => {
  try {
    const { email, role = 'member' } = req.body;

    const workspace = await Workspace.findOne({
      _id: req.params.id,
      owner: req.userId
    });

    if (!workspace) {
      return res.status(404).json({ message: 'Workspace not found' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if user is already a member
    if (workspace.members.some(member => member.user.toString() === user._id.toString())) {
      return res.status(400).json({ message: 'User is already a member' });
    }

    workspace.members.push({ user: user._id, role });
    await workspace.save();

    await workspace.populate('owner', 'name email');
    await workspace.populate('members.user', 'name email');

    res.json(workspace);
  } catch (error) {
    console.error('Add member error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Remove member from workspace
router.delete('/:id/members/:userId', auth, async (req, res) => {
  try {
    const workspace = await Workspace.findOne({
      _id: req.params.id,
      owner: req.userId
    });

    if (!workspace) {
      return res.status(404).json({ message: 'Workspace not found' });
    }

    workspace.members = workspace.members.filter(
      member => member.user.toString() !== req.params.userId
    );

    await workspace.save();

    await workspace.populate('owner', 'name email');
    await workspace.populate('members.user', 'name email');

    res.json(workspace);
  } catch (error) {
    console.error('Remove member error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 