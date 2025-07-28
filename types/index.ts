export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Session {
  _id: string; // MongoDB uses _id
  id?: string; // For compatibility
  userId: string;
  name: string;
  chatHistory: ChatMessage[];
  generatedCode: GeneratedCode;
  uiState: UIState;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  metadata?: {
    imageUrl?: string;
    elementId?: string;
  };
}

export interface GeneratedCode {
  jsx: string;
  css: string;
  componentName: string;
  dependencies: string[];
  lastUpdated: Date;
}

export interface UIState {
  selectedElementId?: string;
  propertyPanel: {
    isOpen: boolean;
    position: { x: number; y: number };
  };
  previewSettings: {
    theme: 'light' | 'dark';
    responsive: boolean;
  };
}

export interface AIResponse {
  code: GeneratedCode;
  message: string;
  suggestions?: string[];
}

export interface ComponentExport {
  jsx: string;
  css: string;
  componentName: string;
  dependencies: string[];
  readme: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface AppState {
  currentSession: Session | null;
  sessions: Session[];
  isLoading: boolean;
  error: string | null;
  autoSaveEnabled: boolean;
}

export interface ChatState {
  messages: ChatMessage[];
  isGenerating: boolean;
  selectedElementId?: string;
}

export interface PreviewState {
  generatedCode: GeneratedCode | null;
  isRendering: boolean;
  error: string | null;
  selectedTab: 'preview' | 'jsx' | 'css';
}

export interface PropertyEditorState {
  isOpen: boolean;
  selectedElement: {
    id: string;
    tagName: string;
    properties: ElementProperties;
  } | null;
  position: { x: number; y: number };
}

export interface ElementProperties {
  size: {
    width: string;
    height: string;
    padding: string;
    margin: string;
  };
  typography: {
    fontSize: string;
    fontWeight: string;
    lineHeight: string;
    textAlign: string;
  };
  colors: {
    backgroundColor: string;
    color: string;
    borderColor: string;
  };
  layout: {
    display: string;
    flexDirection: string;
    justifyContent: string;
    alignItems: string;
  };
  effects: {
    borderRadius: string;
    boxShadow: string;
    borderWidth: string;
    opacity: string;
  };
} 