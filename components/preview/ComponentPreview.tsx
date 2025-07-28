'use client';

import { useAppStore } from '@/store/appStore';
import { useState } from 'react';

export default function ComponentPreview() {
  const { currentSession } = useAppStore();
  const [activeTab, setActiveTab] = useState<'preview' | 'jsx' | 'css'>('preview');

  const generatedCode = currentSession?.generatedCode;

  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      alert(`${type} copied to clipboard!`);
    } catch (error) {
      alert('Failed to copy to clipboard');
    }
  };

  const downloadAsZip = async () => {
    if (!generatedCode) return;

    // Simple download without JSZip for now
    const content = `JSX:\n${generatedCode.jsx}\n\nCSS:\n${generatedCode.css}`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'generated-component.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    alert('Component downloaded!');
  };

  const createPreviewHTML = () => {
    if (!generatedCode) return '';

    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Component Preview</title>
    <style>
        ${generatedCode.css}
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
        }
    </style>
</head>
<body>
    <div class="preview-container">
        <div id="root"></div>
    </div>
    
    <script src="https://unpkg.com/react@18/umd/react.development.js"></script>
    <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
    
    <script>
        ${generatedCode.jsx}
        
        const root = ReactDOM.createRoot(document.getElementById('root'));
        root.render(React.createElement(GeneratedComponent));
    </script>
</body>
</html>`;
  };

  if (!generatedCode) {
    return (
      <div className="flex-1 bg-white border-l border-gray-200 flex items-center justify-center">
        <div className="text-center text-gray-500">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium mb-2">No Component Generated</h3>
          <p className="text-sm">Start a conversation to generate your first component</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-white border-l border-gray-200 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Component Preview</h2>
          <div className="flex items-center space-x-2">
            <button
              onClick={downloadAsZip}
              className="btn-secondary flex items-center space-x-1"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span>Download</span>
            </button>
          </div>
        </div>
        
        {/* Tabs */}
        <div className="flex space-x-1 mt-4">
          <button
            onClick={() => setActiveTab('preview')}
            className={`px-3 py-2 text-sm font-medium rounded-md ${
              activeTab === 'preview'
                ? 'bg-primary-100 text-primary-700'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Preview
          </button>
          <button
            onClick={() => setActiveTab('jsx')}
            className={`px-3 py-2 text-sm font-medium rounded-md ${
              activeTab === 'jsx'
                ? 'bg-primary-100 text-primary-700'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            JSX/TSX
          </button>
          <button
            onClick={() => setActiveTab('css')}
            className={`px-3 py-2 text-sm font-medium rounded-md ${
              activeTab === 'css'
                ? 'bg-primary-100 text-primary-700'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            CSS
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {activeTab === 'preview' && (
          <div className="h-full">
            <iframe
              srcDoc={createPreviewHTML()}
              className="w-full h-full border-0"
              sandbox="allow-scripts allow-same-origin"
              title="Component Preview"
            />
          </div>
        )}
        
        {activeTab === 'jsx' && (
          <div className="h-full flex flex-col">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-sm font-medium text-gray-900">JSX/TSX Code</h3>
              <button
                onClick={() => copyToClipboard(generatedCode.jsx, 'JSX')}
                className="btn-secondary flex items-center space-x-1"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                <span>Copy</span>
              </button>
            </div>
            <div className="flex-1 overflow-auto p-4">
              <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-auto text-sm">
                <code>{generatedCode.jsx}</code>
              </pre>
            </div>
          </div>
        )}
        
        {activeTab === 'css' && (
          <div className="h-full flex flex-col">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-sm font-medium text-gray-900">CSS Code</h3>
              <button
                onClick={() => copyToClipboard(generatedCode.css, 'CSS')}
                className="btn-secondary flex items-center space-x-1"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                <span>Copy</span>
              </button>
            </div>
            <div className="flex-1 overflow-auto p-4">
              <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-auto text-sm">
                <code>{generatedCode.css}</code>
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 