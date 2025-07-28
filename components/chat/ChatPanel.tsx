'use client';

import { useAppStore } from '@/store/appStore';
import { ChatMessage } from '@/types';
import {
    PaperAirplaneIcon,
    PhotoIcon,
    SparklesIcon
} from '@heroicons/react/24/outline';
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';

interface ChatPanelProps {
  onGenerateCode: (prompt: string) => Promise<void>;
  isGenerating: boolean;
}

export default function ChatPanel({ onGenerateCode, isGenerating }: ChatPanelProps) {
  const [message, setMessage] = useState('');
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { currentSession, addChatMessage } = useAppStore();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [currentSession?.chatHistory]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || isGenerating) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: message.trim(),
      timestamp: new Date(),
      metadata: selectedElementId ? { elementId: selectedElementId } : undefined,
    };

    addChatMessage(userMessage);
    setMessage('');
    setSelectedElementId(null);

    await onGenerateCode(message.trim());
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 bg-white">
        <div className="flex items-center space-x-2">
          <SparklesIcon className="h-5 w-5 text-primary-600" />
          <h3 className="font-semibold text-gray-900">AI Assistant</h3>
        </div>
        {selectedElementId && (
          <div className="mt-2 p-2 bg-primary-50 rounded-lg">
            <p className="text-xs text-primary-700">
              Targeting element: <span className="font-medium">{selectedElementId}</span>
            </p>
          </div>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <AnimatePresence>
          {currentSession?.chatHistory.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={`chat-message ${msg.role}`}
            >
              <div className="flex items-start space-x-3">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                  msg.role === 'user' 
                    ? 'bg-primary-100 text-primary-600' 
                    : 'bg-gray-100 text-gray-600'
                }`}>
                  {msg.role === 'user' ? 'U' : 'AI'}
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="text-xs font-medium text-gray-500">
                      {msg.role === 'user' ? 'You' : 'AI Assistant'}
                    </span>
                    <span className="text-xs text-gray-400">
                      {formatTime(msg.timestamp)}
                    </span>
                  </div>
                  <div className="text-sm text-gray-900 whitespace-pre-wrap">
                    {msg.content}
                  </div>
                  {msg.metadata?.elementId && (
                    <div className="mt-2 text-xs text-primary-600 bg-primary-50 px-2 py-1 rounded">
                      Element: {msg.metadata.elementId}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {isGenerating && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="chat-message ai"
          >
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center">
                AI
              </div>
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-1">
                  <span className="text-xs font-medium text-gray-500">AI Assistant</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-600"></div>
                  <span className="text-sm text-gray-600">Generating component...</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-gray-200 bg-white">
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="flex items-end space-x-2">
            <div className="flex-1">
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Describe the component you want to generate..."
                className="input-field resize-none"
                rows={3}
                disabled={isGenerating}
              />
            </div>
            <button
              type="submit"
              disabled={!message.trim() || isGenerating}
              className="btn-primary p-3 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <PaperAirplaneIcon className="h-4 w-4" />
            </button>
          </div>
          
          <div className="flex items-center justify-between text-xs text-gray-500">
            <div className="flex items-center space-x-4">
              <button
                type="button"
                className="flex items-center space-x-1 hover:text-gray-700"
              >
                <PhotoIcon className="h-4 w-4" />
                <span>Upload Image</span>
              </button>
            </div>
            <span>Press Enter to send, Shift+Enter for new line</span>
          </div>
        </form>
      </div>
    </div>
  );
} 