// src/components/CodeEditor.jsx
import React, { useRef, useState } from 'react';
import Editor from '@monaco-editor/react';
import { getAICompletion } from '../services/openai';

const languageMap = {
  javascript: 'javascript',
  python: 'python',
  java: 'java',
  cpp: 'cpp',
  c: 'c',
  php: 'php',
  ruby: 'ruby',
};

const CodeEditor = ({ code, setCode, language, theme }) => {
  const editorRef = useRef(null);
  const [isAILoading, setIsAILoading] = useState(false);

  const handleEditorDidMount = (editor, monaco) => {
    editorRef.current = editor;
    
    // Add custom keybindings for AI
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Space, async () => {
      await triggerAICompletion();
    });
  };

  const triggerAICompletion = async () => {
    if (!editorRef.current) return;

    const selection = editorRef.current.getSelection();
    const position = editorRef.current.getPosition();
    const model = editorRef.current.getModel();
    
    // Get text from current line start to cursor
    const lineContent = model.getLineContent(position.lineNumber);
    const textBeforeCursor = lineContent.substring(0, position.column - 1);
    
    if (textBeforeCursor.trim().length < 3) return;

    setIsAILoading(true);
    
    try {
      const completion = await getAICompletion(textBeforeCursor, language);
      
      if (completion) {
        const op = {
          range: {
            startLineNumber: position.lineNumber,
            startColumn: position.column,
            endLineNumber: position.lineNumber,
            endColumn: position.column,
          },
          text: completion,
          forceMoveMarkers: true
        };
        
        editorRef.current.executeEdits("ai-completion", [op]);
      }
    } catch (error) {
      console.error('AI Completion error:', error);
    } finally {
      setIsAILoading(false);
    }
  };

  const handleEditorChange = (value) => {
    setCode(value);
  };

  return (
    <div className="code-editor">
      {isAILoading && (
        <div className="ai-loading-indicator">
          <div className="spinner"></div>
          AI is thinking...
        </div>
      )}
      <Editor
        height="100%"
        language={languageMap[language]}
        value={code}
        onChange={handleEditorChange}
        onMount={handleEditorDidMount}
        theme={theme}
        options={{
          minimap: { enabled: true },
          fontSize: 14,
          wordWrap: 'on',
          scrollBeyondLastLine: false,
          automaticLayout: true,
          tabSize: 2,
          insertSpaces: true,
          formatOnPaste: true,
          formatOnType: true,
          suggestOnTriggerCharacters: true,
          quickSuggestions: true,
          parameterHints: { enabled: true },
          codeLens: true,
          bracketPairColorization: { enabled: true },
          renderWhitespace: 'boundary',
          lineNumbers: 'on',
          folding: true,
          foldingHighlight: true,
          matchBrackets: 'always',
          smoothScrolling: true,
        }}
      />
    </div>
  );
};

export default CodeEditor;