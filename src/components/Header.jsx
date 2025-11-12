// src/components/Header.jsx
import React from 'react';
import { Play, Settings, Sun, Moon, Download, Upload, Lightbulb } from 'lucide-react';
import { executeCode } from '../services/judge0';
import { getAICompletion, getAISuggestion } from '../services/openai';

const languages = [
  { value: 'javascript', label: 'JavaScript' },
  { value: 'python', label: 'Python' },
  { value: 'java', label: 'Java' },
  { value: 'cpp', label: 'C++' },
  { value: 'c', label: 'C' },
  { value: 'php', label: 'PHP' },
  { value: 'ruby', label: 'Ruby' },
];

const Header = ({ language, setLanguage, theme, setTheme, code, setCode, setOutput, setIsLoading }) => {

  const handleRunCode = async () => {
    setIsLoading(true);
    setOutput('⚙️ Running code...');
    try {
      const result = await executeCode(code, language);
      setOutput(result);
    } catch (error) {
      setOutput(`❌ Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // 🤖 AI Completion
  const handleAIAssist = async () => {
    setIsLoading(true);
    setOutput('🤖 Generating AI completion...');
    try {
      const suggestion = await getAICompletion(code, language);
      setOutput(`🤖 AI Completion:\n\n${suggestion}`);
    } catch (error) {
      setOutput(`AI Error: ${error.message}\n\nMake sure your OpenAI API key is set.`);
    } finally {
      setIsLoading(false);
    }
  };

  // 💡 AI Suggestion (Logic Building Upgrade)
  const handleAISuggestion = async (hintLevel = "basic") => {
    setIsLoading(true);
    setOutput(`💡 Getting ${hintLevel} level AI suggestions...`);
    try {
      const suggestion = await getAISuggestion(code, language, hintLevel);
      setOutput(`💡 ${hintLevel.toUpperCase()} Suggestion:\n\n${suggestion}`);
    } catch (error) {
      setOutput(`AI Suggestion Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // File Download
  const handleDownload = () => {
    const element = document.createElement('a');
    const file = new Blob([code], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `code.${getFileExtension(language)}`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  // File Upload
  const handleUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setCode(e.target.result);
      };
      reader.readAsText(file);
    }
  };

  const getFileExtension = (lang) => {
    const extensions = {
      javascript: 'js',
      python: 'py',
      java: 'java',
      cpp: 'cpp',
      c: 'c',
      php: 'php',
      ruby: 'rb'
    };
    return extensions[lang] || 'txt';
  };

  return (
    <header className="header">
      <div className="header-left">
        <h1>🚀 AI Code Editor</h1>
        <select 
          value={language} 
          onChange={(e) => setLanguage(e.target.value)}
          className="language-select"
        >
          {languages.map(lang => (
            <option key={lang.value} value={lang.value}>
              {lang.label}
            </option>
          ))}
        </select>
      </div>
      
      <div className="header-right">
        {/* Upload / Download */}
        <div className="file-actions">
          <label htmlFor="file-upload" className="btn btn-secondary">
            <Upload size={16} />
            Upload
          </label>
          <input
            id="file-upload"
            type="file"
            accept=".js,.py,.java,.cpp,.c,.php,.rb,.txt"
            onChange={handleUpload}
            style={{ display: 'none' }}
          />
          <button onClick={handleDownload} className="btn btn-secondary">
            <Download size={16} />
            Download
          </button>
        </div>

        {/* Theme Toggle */}
        <button 
          onClick={() => setTheme(theme === 'vs-dark' ? 'light' : 'vs-dark')}
          className="btn btn-secondary"
          title="Toggle Theme"
        >
          {theme === 'vs-dark' ? <Sun size={16} /> : <Moon size={16} />}
          Theme
        </button>

        {/* AI Buttons */}
        <button 
          onClick={handleAIAssist}
          className="btn btn-ai"
          title="AI Complete Code"
        >
          <Settings size={16} />
          Complete
        </button>

        <button 
          onClick={() => handleAISuggestion("intermediate")}
          className="btn btn-secondary"
          title="AI Suggest Improvement"
        >
          <Lightbulb size={16} />
          Suggest
        </button>

        {/* Run Button */}
        <button 
          onClick={handleRunCode}
          className="btn btn-run"
          title="Run Code"
        >
          <Play size={16} />
          Run
        </button>
      </div>
    </header>
  );
};

export default Header;
