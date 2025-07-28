import { AppState, ChatMessage, GeneratedCode, Session, UIState } from '@/types';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AppStore extends AppState {
  createSession: (name: string) => Promise<void>;
  loadSession: (sessionId: string) => Promise<void>;
  updateSession: (sessionId: string, updates: Partial<Session>) => Promise<void>;
  deleteSession: (sessionId: string) => Promise<void>;
  loadSessions: () => Promise<void>;
  updateGeneratedCode: (code: GeneratedCode) => void;
  addChatMessage: (message: ChatMessage) => void;
  updateUIState: (state: Partial<UIState>) => void;
  toggleAutoSave: () => void;
  clearError: () => void;
}

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  };
};

export const useAppStore = create<AppStore>()(
  persist(
    (set, get) => ({
      currentSession: null,
      sessions: [],
      isLoading: false,
      error: null,
      autoSaveEnabled: true,

      createSession: async (name: string) => {
        set({ isLoading: true, error: null });
        try {
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/sessions`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({ name }),
          });

          if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to create session');
          }

          const session = await response.json();
          set(state => ({
            currentSession: session,
            sessions: [...state.sessions, session],
            isLoading: false,
          }));
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to create session', 
            isLoading: false 
          });
        }
      },

      loadSession: async (sessionId: string) => {
        set({ isLoading: true, error: null });
        try {
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/sessions/${sessionId}`, {
            headers: getAuthHeaders(),
          });

          if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to load session');
          }

          const session = await response.json();
          set({ currentSession: session, isLoading: false });
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to load session', 
            isLoading: false 
          });
        }
      },

      updateSession: async (sessionId: string, updates: Partial<Session>) => {
        try {
          // Check if sessionId is valid
          if (!sessionId || sessionId === 'undefined') {
            console.error('Invalid session ID:', sessionId);
            return;
          }

          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/sessions/${sessionId}`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify(updates),
          });

          if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to update session');
          }

          const updatedSession = await response.json();
          set(state => ({
            currentSession: state.currentSession?._id === sessionId ? updatedSession : state.currentSession,
            sessions: state.sessions.map(s => s._id === sessionId ? updatedSession : s),
          }));
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to update session'
          });
        }
      },

      deleteSession: async (sessionId: string) => {
        try {
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/sessions/${sessionId}`, {
            method: 'DELETE',
            headers: getAuthHeaders(),
          });

          if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to delete session');
          }

          set(state => ({
            currentSession: state.currentSession?.id === sessionId ? null : state.currentSession,
            sessions: state.sessions.filter(s => s.id !== sessionId),
          }));
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to delete session'
          });
        }
      },

      loadSessions: async () => {
        set({ isLoading: true, error: null });
        try {
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/sessions`, {
            headers: getAuthHeaders(),
          });

          if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to load sessions');
          }

          const sessions = await response.json();
          set({ sessions, isLoading: false });
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to load sessions', 
            isLoading: false 
          });
        }
      },

      updateGeneratedCode: (code: GeneratedCode) => {
        set(state => {
          if (!state.currentSession) return state;
          
          const updatedSession = {
            ...state.currentSession,
            generatedCode: code,
            updatedAt: new Date(),
          };

          // Auto-save if enabled
          if (state.autoSaveEnabled && state.currentSession?._id) {
            get().updateSession(state.currentSession._id, updatedSession);
          }
          return { currentSession: updatedSession };
        });
      },

      addChatMessage: (message: ChatMessage) => {
        set(state => {
          const newState = { ...state };
          
          if (state.currentSession) {
            // Update current session
            newState.currentSession = {
              ...state.currentSession,
              chatHistory: [...state.currentSession.chatHistory, message]
            };
            
            // Update in sessions list
            newState.sessions = state.sessions.map(s => 
              s._id === state.currentSession?._id ? newState.currentSession! : s
            );
            
            // Auto-save if enabled
            if (state.autoSaveEnabled && state.currentSession._id) {
              // Use setTimeout to avoid blocking the UI
              setTimeout(() => {
                const store = get();
                if (store.currentSession?._id) {
                  store.updateSession(store.currentSession._id, {
                    chatHistory: store.currentSession.chatHistory
                  });
                }
              }, 1000);
            }
          }
          
          return newState;
        });
      },

      updateUIState: (uiState: Partial<UIState>) => {
        set(state => {
          if (!state.currentSession) return state;
          
          const updatedSession = {
            ...state.currentSession,
            uiState: { ...state.currentSession.uiState, ...uiState },
            updatedAt: new Date(),
          };

          // Auto-save if enabled
          if (state.autoSaveEnabled) {
            get().updateSession(updatedSession.id, updatedSession);
          }

          return { currentSession: updatedSession };
        });
      },

      toggleAutoSave: () => {
        set(state => ({ autoSaveEnabled: !state.autoSaveEnabled }));
      },

      clearError: () => {
        set({ error: null });
      },
    }),
    {
      name: 'app-storage',
      partialize: (state) => ({ 
        autoSaveEnabled: state.autoSaveEnabled,
        currentSession: state.currentSession,
      }),
    }
  )
); 