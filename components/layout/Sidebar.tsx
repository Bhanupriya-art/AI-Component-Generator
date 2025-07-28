'use client';

import { useAppStore } from '@/store/appStore';
import { useAuthStore } from '@/store/authStore';
import {
    ArrowRightOnRectangleIcon,
    CogIcon,
    FolderIcon,
    PlusIcon,
    UserIcon
} from '@heroicons/react/24/outline';
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';

export default function Sidebar() {
  const [isCreatingSession, setIsCreatingSession] = useState(false);
  const [newSessionName, setNewSessionName] = useState('');
  const { user, logout } = useAuthStore();
  const { 
    sessions, 
    currentSession, 
    loadSessions, 
    createSession, 
    loadSession,
    isLoading 
  } = useAppStore();

  useEffect(() => {
    loadSessions();
  }, [loadSessions]);

  const handleCreateSession = async () => {
    if (!newSessionName.trim()) return;
    
    setIsCreatingSession(true);
    await createSession(newSessionName.trim());
    setNewSessionName('');
    setIsCreatingSession(false);
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="sidebar w-80 flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold text-gray-900">AccioJob</h1>
          <button
            onClick={logout}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
            title="Logout"
          >
            <ArrowRightOnRectangleIcon className="h-5 w-5" />
          </button>
        </div>
        
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
            <UserIcon className="h-4 w-4 text-primary-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900">{user?.name}</p>
            <p className="text-xs text-gray-500">{user?.email}</p>
          </div>
        </div>
      </div>

      {/* Create Session */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-gray-900">Sessions</h2>
          <button
            onClick={() => setIsCreatingSession(true)}
            className="p-1 text-gray-400 hover:text-gray-600 rounded"
            title="Create new session"
          >
            <PlusIcon className="h-4 w-4" />
          </button>
        </div>

        <AnimatePresence>
          {isCreatingSession && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-4"
            >
              <div className="space-y-3">
                <input
                  type="text"
                  value={newSessionName}
                  onChange={(e) => setNewSessionName(e.target.value)}
                  placeholder="Session name"
                  className="input-field text-sm"
                  onKeyPress={(e) => e.key === 'Enter' && handleCreateSession()}
                  autoFocus
                />
                <div className="flex space-x-2">
                  <button
                    onClick={handleCreateSession}
                    disabled={!newSessionName.trim() || isLoading}
                    className="btn-primary text-sm px-3 py-1"
                  >
                    Create
                  </button>
                  <button
                    onClick={() => {
                      setIsCreatingSession(false);
                      setNewSessionName('');
                    }}
                    className="btn-secondary text-sm px-3 py-1"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Sessions List */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="space-y-2">
          {sessions.map((session) => (
            <motion.button
              key={session.id}
              onClick={() => loadSession(session.id)}
              className={`w-full text-left p-3 rounded-lg transition-colors duration-200 ${
                currentSession?.id === session.id
                  ? 'bg-primary-50 border border-primary-200'
                  : 'hover:bg-gray-50 border border-transparent'
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex items-center space-x-3">
                <FolderIcon className="h-4 w-4 text-gray-400" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {session.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatDate(session.updatedAt)}
                  </p>
                </div>
              </div>
            </motion.button>
          ))}
          
          {sessions.length === 0 && !isLoading && (
            <div className="text-center py-8">
              <FolderIcon className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-sm text-gray-500">No sessions yet</p>
              <p className="text-xs text-gray-400 mt-1">
                Create your first session to get started
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="p-6 border-t border-gray-200">
        <button className="flex items-center space-x-2 text-sm text-gray-500 hover:text-gray-700 w-full p-2 rounded-lg hover:bg-gray-50">
          <CogIcon className="h-4 w-4" />
          <span>Settings</span>
        </button>
      </div>
    </div>
  );
} 