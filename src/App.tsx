import { useState, useCallback } from 'react';
import { useRepoAnalyzer } from './hooks/useRepoAnalyzer';
import { FileTree } from './components/FileTree';
import { FileStats } from './components/FileStats';
import './index.css';

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
    <div className="max-w-[1100px] mx-auto px-4 sm:px-8 py-12 min-h-screen flex flex-col">
      {/* Header */}
      <header className="text-center mb-12">
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-2 bg-gradient-to-r from-mocha via-lavender-deep to-teal bg-clip-text text-transparent">
          GitHub Repo Analyzer
        </h1>
        <p className="text-neutral-500 dark:text-neutral-400 text-lg">
          Analyze file structure and statistics of any public GitHub repository
        </p>
      </header>

      {/* Input Section */}
      <div className="flex flex-col sm:flex-row gap-4 mb-10 p-6 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-sm">
        <input
          type="text"
          placeholder="Enter GitHub repo URL (e.g., https://github.com/facebook/react)"
          value={repoUrl}
          onChange={(e) => setRepoUrl(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isAnalyzing}
          className="flex-1 px-5 py-4 text-base border-2 border-neutral-200 dark:border-neutral-700 rounded-xl bg-cloud dark:bg-neutral-800 text-neutral-900 dark:text-cloud placeholder:text-neutral-400 hover:border-neutral-300 dark:hover:border-neutral-600 focus:outline-none focus:border-mocha focus:ring-4 focus:ring-mocha/10 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
        />
        <button
          onClick={handleAnalyze}
          disabled={isAnalyzing || !repoUrl.trim()}
          className="px-8 py-4 text-base font-semibold text-white bg-mocha rounded-xl hover:bg-mocha-dark hover:-translate-y-0.5 hover:shadow-lg hover:shadow-mocha/30 active:translate-y-0 transition-all disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none whitespace-nowrap"
        >
          {isAnalyzing ? 'Analyzing...' : 'Analyze'}
        </button>
      </div>

      {/* Loading State */}
      {isAnalyzing && (
        <div className="flex flex-col items-center gap-6 py-16">
          <div className="w-12 h-12 border-3 border-neutral-200 dark:border-neutral-700 border-t-mocha rounded-full animate-spin" />
          <p className="text-neutral-500 dark:text-neutral-400">{progress || 'Processing...'}</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-gradient-to-r from-red-50 to-red-100 dark:from-red-950/50 dark:to-red-900/30 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-300 px-6 py-4 rounded-xl mb-6">
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* Results */}
      {result && (
        <div className="flex-1 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl overflow-hidden shadow-sm">
          {/* Tabs */}
          <div className="flex gap-2 p-4 bg-neutral-50 dark:bg-neutral-800/50 border-b border-neutral-200 dark:border-neutral-800">
            <button
              onClick={() => setActiveTab('tree')}
              className={`flex-1 max-w-[200px] px-6 py-3 rounded-xl text-sm font-medium transition-all ${
                activeTab === 'tree'
                  ? 'bg-white dark:bg-neutral-900 text-mocha shadow-sm'
                  : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-cloud hover:bg-white dark:hover:bg-neutral-900'
              }`}
            >
              File Tree
            </button>
            <button
              onClick={() => setActiveTab('stats')}
              className={`flex-1 max-w-[200px] px-6 py-3 rounded-xl text-sm font-medium transition-all ${
                activeTab === 'stats'
                  ? 'bg-white dark:bg-neutral-900 text-mocha shadow-sm'
                  : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-cloud hover:bg-white dark:hover:bg-neutral-900'
              }`}
            >
              Statistics
            </button>
          </div>

          {/* Tab Content */}
          <div className="p-6 max-h-[65vh] overflow-y-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-neutral-300 dark:scrollbar-thumb-neutral-700">
            {activeTab === 'tree' && <FileTree node={result.tree} />}
            {activeTab === 'stats' && <FileStats stats={result.stats} />}
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="text-center mt-10 pt-6 border-t border-neutral-200 dark:border-neutral-800">
        <p className="text-neutral-400 text-sm">
          Uses GitHub API to analyze public repositories
        </p>
      </footer>
    </div>
  );
}

export default App;
