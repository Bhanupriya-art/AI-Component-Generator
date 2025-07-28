const mongoose = require('mongoose');

const chatMessageSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['user', 'assistant'],
    required: true
  },
  content: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  metadata: {
    imageUrl: String,
    elementId: String
  }
});

const generatedCodeSchema = new mongoose.Schema({
  jsx: {
    type: String,
    default: ''
  },
  css: {
    type: String,
    default: ''
  },
  componentName: {
    type: String,
    default: 'GeneratedComponent'
  },
  dependencies: [{
    type: String
  }],
  lastUpdated: {
    type: Date,
    default: Date.now
  }
});

const uiStateSchema = new mongoose.Schema({
  selectedElementId: String,
  propertyPanel: {
    isOpen: {
      type: Boolean,
      default: false
    },
    position: {
      x: Number,
      y: Number
    }
  },
  previewSettings: {
    theme: {
      type: String,
      enum: ['light', 'dark'],
      default: 'light'
    },
    responsive: {
      type: Boolean,
      default: true
    }
  }
});

const sessionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: [true, 'Session name is required'],
    trim: true,
    maxlength: [100, 'Session name cannot be more than 100 characters']
  },
  chatHistory: [chatMessageSchema],
  generatedCode: {
    type: generatedCodeSchema,
    default: {
      jsx: '',
      css: '',
      componentName: 'GeneratedComponent',
      dependencies: [],
      lastUpdated: new Date()
    }
  },
  uiState: {
    type: uiStateSchema,
    default: {
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
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for faster queries
sessionSchema.index({ userId: 1, createdAt: -1 });
sessionSchema.index({ userId: 1, updatedAt: -1 });

module.exports = mongoose.model('Session', sessionSchema); 