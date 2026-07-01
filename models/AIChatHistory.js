const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema(
  {
    userId:    { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    sessionId: { type: String },
    messages: [
      {
        role:      { type: String, enum: ['user', 'assistant'] },
        content:   { type: String },
        timestamp: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model('AIChatHistory', chatSchema);
