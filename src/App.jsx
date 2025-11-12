// src/App.jsx
import React, { useState } from 'react';
import CodeEditor from './components/CodeEditor';
import OutputPanel from './components/OutputPanel';
import Header from './components/Header';
import './App.css';

function App() {
  const [code, setCode] = useState(`// Welcome to AI Code Editor!
function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}

console.log("Fibonacci of 10:", fibonacci(10));`);
  
  const [output, setOutput] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [isLoading, setIsLoading] = useState(false);
  const [theme, setTheme] = useState('vs-dark');

  return (
    <div className="app">
      <Header 
        language={language} 
        setLanguage={setLanguage}
        theme={theme}
        setTheme={setTheme}
        code={code}
        setOutput={setOutput}
        setIsLoading={setIsLoading}
      />
      
      <div className="main-content">
        <div className="editor-container">
          <CodeEditor 
            code={code}
            setCode={setCode}
            language={language}
            theme={theme}
          />
        </div>
        
        <div className="output-container">
          <OutputPanel 
            output={output}
            isLoading={isLoading}
          />
        </div>
      </div>
    </div>
  );
}

export default App;