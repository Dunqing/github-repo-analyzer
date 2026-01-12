import { useState, useCallback } from 'react';
import { Loader2, Search, FolderTree, BarChart3 } from 'lucide-react';
import { useRepoAnalyzer } from '@/hooks/useRepoAnalyzer';
import { FileTree } from '@/components/FileTree';
import { FileStats } from '@/components/FileStats';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import '@/index.css';

function App() {
  const [repoUrl, setRepoUrl] = useState('');
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
    <div className="min-h-screen bg-background">
      <div className="container max-w-5xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-3 bg-gradient-to-r from-mocha via-lavender-deep to-teal bg-clip-text text-transparent">
            GitHub Repo Analyzer
          </h1>
          <p className="text-muted-foreground text-lg">
            Analyze file structure and statistics of any public GitHub repository
          </p>
        </div>

        {/* Search Card */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Enter repo (e.g., facebook/react)"
                  value={repoUrl}
                  onChange={(e) => setRepoUrl(e.target.value)}
                  onKeyDown={handleKeyDown}
                  disabled={isAnalyzing}
                  className="pl-10 h-12"
                />
              </div>
              <Button
                onClick={handleAnalyze}
                disabled={isAnalyzing || !repoUrl.trim()}
                size="lg"
                className="h-12"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  'Analyze'
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Loading State */}
        {isAnalyzing && (
          <Card className="mb-8">
            <CardContent className="py-12">
              <div className="flex flex-col items-center gap-4">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
                <p className="text-muted-foreground">{progress || 'Processing...'}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Error State */}
        {error && (
          <Card className="mb-8 border-destructive/50 bg-destructive/10">
            <CardContent className="py-4">
              <p className="text-destructive">
                <strong>Error:</strong> {error}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Results */}
        {result && (
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2">
                <FolderTree className="h-5 w-5" />
                {result.tree.name}
              </CardTitle>
              <CardDescription>
                {result.stats.totalFiles} files · {result.stats.totalDirectories} directories · {Object.keys(result.stats.extensionCounts).length} file types
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="tree" className="w-full">
                <TabsList className="w-full sm:w-auto">
                  <TabsTrigger value="tree" className="flex-1 sm:flex-none gap-2">
                    <FolderTree className="h-4 w-4" />
                    File Tree
                  </TabsTrigger>
                  <TabsTrigger value="stats" className="flex-1 sm:flex-none gap-2">
                    <BarChart3 className="h-4 w-4" />
                    Statistics
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="tree" className="max-h-[60vh] overflow-y-auto pr-2">
                  <FileTree node={result.tree} />
                </TabsContent>
                <TabsContent value="stats">
                  <FileStats stats={result.stats} />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        )}

        {/* Footer */}
        <footer className="text-center mt-10 pt-6 border-t border-border">
          <p className="text-muted-foreground text-sm">
            Uses GitHub API to analyze public repositories
          </p>
        </footer>
      </div>
    </div>
  );
}

export default App;
