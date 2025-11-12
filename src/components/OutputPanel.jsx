// src/components/OutputPanel.jsx
import React from 'react';
import { Loader, Terminal, X, Copy } from 'lucide-react';

const OutputPanel = ({ output, isLoading }) => {
  const clearOutput = () => {
    // This would need to be handled through props
    console.log('Clear output');
  };

  const copyOutput = async () => {
    try {
      await navigator.clipboard.writeText(output);
    } catch (err) {
      console.error('Failed to copy output: ', err);
    }
  };

  return (
    <div className="output-panel">
      <div className="output-header">
        <Terminal size={16} />
        <span>Output</span>
        <div className="output-actions">
          {output && (
            <button onClick={copyOutput} className="icon-btn" title="Copy Output">
              <Copy size={14} />
            </button>
          )}
          <button onClick={clearOutput} className="icon-btn" title="Clear Output">
            <X size={14} />
          </button>
        </div>
      </div>
      
      <div className="output-content">
        {isLoading ? (
          <div className="loading">
            <Loader className="spinner" size={20} />
            <span>Executing code...</span>
          </div>
        ) : (
          <pre>{output || 'Output will appear here. Click "Run" to execute your code.'}</pre>
        )}
      </div>
    </div>
  );
};

export default OutputPanel;