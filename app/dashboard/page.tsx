'use client';

import ChatPanel from '@/components/chat/ChatPanel';
import Sidebar from '@/components/layout/Sidebar';
import ComponentPreview from '@/components/preview/ComponentPreview';
import { useAppStore } from '@/store/appStore';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function DashboardPage() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();
  const { 
    currentSession, 
    sessions, 
    createSession, 
    loadSessions, 
    updateGeneratedCode, 
    addChatMessage,
    updateSession 
  } = useAppStore();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth');
      return;
    }

    const initializeDashboard = async () => {
      try {
        await loadSessions();
        
        // If no sessions exist, create a default session
        if (sessions.length === 0) {
          await createSession('New Session');
        }
        
        setIsLoading(false);
      } catch (error) {
        console.error('Error initializing dashboard:', error);
        setIsLoading(false);
      }
    };

    initializeDashboard();
  }, [isAuthenticated, router, loadSessions, sessions.length, createSession]);

  const generateCode = async (prompt: string) => {
    try {
      // Ensure we have a current session
      if (!currentSession?._id) {
        console.log('No current session, creating one...');
        await createSession('New Session');
        // Wait a bit for the session to be created
        setTimeout(() => {
          generateCode(prompt);
        }, 100);
        return;
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/ai/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          prompt,
          sessionId: currentSession._id
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to generate component');
      }

      const result = await response.json();
      
      // Update the generated code
      updateGeneratedCode(result.generatedCode);
      
      // Add AI response to chat
      addChatMessage({
        id: Date.now().toString(),
        role: 'assistant',
        content: `I've generated a component based on your request. Here's the code:\n\n**JSX/TSX:**\n\`\`\`jsx\n${result.generatedCode.jsx}\n\`\`\`\n\n**CSS:**\n\`\`\`css\n${result.generatedCode.css}\n\`\`\``,
        timestamp: new Date()
      });

      // Update session with new code
      if (currentSession._id) {
        updateSession(currentSession._id, {
          generatedCode: result.generatedCode
        });
      }
    } catch (error) {
      console.error('Error generating code:', error);
      addChatMessage({
        id: Date.now().toString(),
        role: 'assistant',
        content: 'Sorry, I encountered an error while generating the component. Please try again with a different prompt.',
        timestamp: new Date()
      });
    }
  };

  if (!isAuthenticated || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <div className="flex-1 flex">
          <ChatPanel onGenerateCode={generateCode} />
          <ComponentPreview />
        </div>
      </div>
    </div>
  );
} 