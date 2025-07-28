const express = require('express');
const { body, validationResult } = require('express-validator');
const Session = require('../models/Session');
const auth = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/sessions
// @desc    Get all sessions for the authenticated user
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const sessions = await Session.find({
      userId: req.user._id,
      isActive: true
    }).sort({ updatedAt: -1 });

    res.json(sessions);
  } catch (error) {
    console.error('Get sessions error:', error);
    res.status(500).json({ message: 'Server error getting sessions' });
  }
});

// @route   GET /api/sessions/:id
// @desc    Get a specific session
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const session = await Session.findOne({
      _id: req.params.id,
      userId: req.user._id,
      isActive: true
    });

    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }

    res.json(session);
  } catch (error) {
    console.error('Get session error:', error);
    res.status(500).json({ message: 'Server error getting session' });
  }
});

// @route   POST /api/sessions
// @desc    Create a new session
// @access  Private
router.post('/', auth, [
  body('name')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Session name must be between 1 and 100 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { name } = req.body;

    const session = new Session({
      userId: req.user._id,
      name,
      chatHistory: [],
      generatedCode: {
        jsx: '',
        css: '',
        componentName: 'GeneratedComponent',
        dependencies: [],
        lastUpdated: new Date()
      },
      uiState: {
        selectedElementId: null,
        propertyPanel: {
          isOpen: false,
          position: { x: 0, y: 0 }
        },
        previewSettings: {
          theme: 'light',
          responsive: true
        }
      }
    });

    await session.save();
    res.status(201).json(session);
  } catch (error) {
    console.error('Create session error:', error);
    res.status(500).json({ message: 'Server error creating session' });
  }
});

// @route   PUT /api/sessions/:id
// @desc    Update a session
// @access  Private
router.put('/:id', auth, async (req, res) => {
  try {
    const session = await Session.findOne({
      _id: req.params.id,
      userId: req.user._id,
      isActive: true
    });

    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }

    // Update allowed fields
    const allowedUpdates = ['name', 'chatHistory', 'generatedCode', 'uiState'];
    const updates = {};

    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    // Update timestamp
    updates.updatedAt = new Date();

    const updatedSession = await Session.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    );

    res.json(updatedSession);
  } catch (error) {
    console.error('Update session error:', error);
    res.status(500).json({ message: 'Server error updating session' });
  }
});

// @route   DELETE /api/sessions/:id
// @desc    Delete a session (soft delete)
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const session = await Session.findOne({
      _id: req.params.id,
      userId: req.user._id,
      isActive: true
    });

    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }

    // Soft delete
    session.isActive = false;
    await session.save();

    res.json({ message: 'Session deleted successfully' });
  } catch (error) {
    console.error('Delete session error:', error);
    res.status(500).json({ message: 'Server error deleting session' });
  }
});

// @route   POST /api/sessions/:id/chat
// @desc    Add a chat message to a session
// @access  Private
router.post('/:id/chat', auth, [
  body('message')
    .notEmpty()
    .withMessage('Message content is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const session = await Session.findOne({
      _id: req.params.id,
      userId: req.user._id,
      isActive: true
    });

    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }

    const { message } = req.body;
    const chatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: message,
      timestamp: new Date()
    };

    session.chatHistory.push(chatMessage);
    await session.save();

    res.json(session);
  } catch (error) {
    console.error('Add chat message error:', error);
    res.status(500).json({ message: 'Server error adding chat message' });
  }
});

module.exports = router;
