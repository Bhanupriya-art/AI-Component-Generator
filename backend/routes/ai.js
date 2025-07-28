const express = require('express');
const { body, validationResult } = require('express-validator');
const auth = require('../middleware/auth');
const Session = require('../models/Session');

const router = express.Router();

// @route   POST /api/ai/generate
// @desc    Generate component code using AI
// @access  Private
router.post('/generate', auth, [
  body('prompt')
    .notEmpty()
    .withMessage('Prompt is required'),
  body('sessionId')
    .notEmpty()
    .withMessage('Session ID is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { prompt, sessionId } = req.body;

    // Verify session exists and belongs to user
    const session = await Session.findOne({
      _id: sessionId,
      userId: req.user._id,
      isActive: true
    });

    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }

    // Generate vanilla JavaScript code (no imports, no modules)
    const generatedCode = {
      jsx: `// Vanilla JavaScript component (no imports needed)
const GeneratedComponent = () => {
  const container = React.createElement('div', { 
    className: 'generated-component',
    style: {
      padding: '2rem',
      border: '1px solid #e5e7eb',
      borderRadius: '0.5rem',
      backgroundColor: 'white',
      boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
      margin: '1rem'
    }
  });

  const title = React.createElement('h2', { 
    style: {
      color: '#374151',
      marginBottom: '1rem',
      fontSize: '1.5rem',
      fontWeight: '600'
    }
  }, 'Generated Component');

  const description = React.createElement('p', { 
    style: {
      color: '#6b7280',
      marginBottom: '1.5rem',
      lineHeight: '1.6'
    }
  }, 'This is a component generated based on your prompt: "${prompt}"');

  const button = React.createElement('button', { 
    style: {
      backgroundColor: '#3b82f6',
      color: 'white',
      padding: '0.5rem 1rem',
      border: 'none',
      borderRadius: '0.375rem',
      cursor: 'pointer',
      fontWeight: '500',
      transition: 'background-color 0.2s'
    },
    onMouseOver: (e) => {
      e.target.style.backgroundColor = '#2563eb';
    },
    onMouseOut: (e) => {
      e.target.style.backgroundColor = '#3b82f6';
    },
    onClick: () => {
      alert('Button clicked! This component was generated for: "${prompt}"');
    }
  }, 'Click me');

  container.appendChild(title);
  container.appendChild(description);
  container.appendChild(button);

  return container;
};`,
      css: `/* Additional styles for the preview container */
body {
  margin: 0;
  padding: 20px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background-color: #f9fafb;
}

.preview-container {
  max-width: 800px;
  margin: 0 auto;
  background: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}`,
      componentName: 'GeneratedComponent',
      dependencies: [],
      lastUpdated: new Date()
    };

    // Add AI response to chat history
    session.chatHistory.push({
      id: Date.now().toString(),
      role: 'assistant',
      content: `I've generated a component based on your request: "${prompt}"`,
      timestamp: new Date()
    });

    // Update session with generated code
    session.generatedCode = generatedCode;
    await session.save();

    res.json({
      generatedCode,
      message: 'Component generated successfully'
    });
  } catch (error) {
    console.error('AI generation error:', error);
    res.status(500).json({ message: 'Server error generating component' });
  }
});

module.exports = router; 