import { useState, useCallback } from 'react';
import { useRepoAnalyzer } from './hooks/useRepoAnalyzer';
import { FileTree } from './components/FileTree';
import { FileStats } from './components/FileStats';
import './App.css';

function App() {
  const [repoUrl, setRepoUrl] = useState('');
  const [activeTab, setActiveTab] = useState<'tree' | 'stats'>('tree');

  const { analyze, isAnalyzing, progress, result, error } = useRepoAnalyzer();

  const handleAnalyze = useCallback(async () => {
    if (!repoUrl.trim()) return;
    await analyze(repoUrl);
  }, [analyze, repoUrl]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAnalyze();
    }
  };

  return (
    <div className="app">
      <header className="header">
        <h1>GitHub Repo Analyzer</h1>
        <p className="subtitle">Analyze file structure and statistics of any public GitHub repository</p>
      </header>

      <div className="input-section">
        <input
          type="text"
          className="repo-input"
          placeholder="Enter GitHub repo URL (e.g., https://github.com/facebook/react)"
          value={repoUrl}
          onChange={(e) => setRepoUrl(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isAnalyzing}
        />
        <button
          className="analyze-btn"
          onClick={handleAnalyze}
          disabled={isAnalyzing || !repoUrl.trim()}
        >
          {isAnalyzing ? 'Analyzing...' : 'Analyze'}
        </button>
      </div>

      {isAnalyzing && (
        <div className="loading">
          <div className="spinner" />
          <p>{progress || 'Processing...'}</p>
        </div>
      )}

      {error && (
        <div className="error">
          <strong>Error:</strong> {error}
        </div>
      )}

      {result && (
        <div className="results">
          <div className="tabs">
            <button
              className={`tab ${activeTab === 'tree' ? 'active' : ''}`}
              onClick={() => setActiveTab('tree')}
            >
              File Tree
            </button>
            <button
              className={`tab ${activeTab === 'stats' ? 'active' : ''}`}
              onClick={() => setActiveTab('stats')}
            >
              Statistics
            </button>
          </div>

          <div className="tab-content">
            {activeTab === 'tree' && (
              <div className="tree-container">
                <FileTree node={result.tree} />
              </div>
            )}
            {activeTab === 'stats' && (
              <FileStats stats={result.stats} />
            )}
          </div>
        </div>
      )}

      <footer className="footer">
        <p>Uses GitHub API to analyze public repositories</p>
      </footer>
    </div>
  );
}

export default App;
