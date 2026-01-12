import { useState, useCallback } from 'react';
import { Loader2, Search, FolderTree, BarChart3, Github, File, Folder, FileType } from 'lucide-react';
import { useRepoAnalyzer } from '@/hooks/useRepoAnalyzer';
import { FileTree } from '@/components/FileTree';
import { FileStats } from '@/components/FileStats';
import { ThemeToggle } from '@/components/theme-toggle';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
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
      {/* Theme Toggle */}
      <div className="fixed top-4 right-4 z-50">
        <ThemeToggle />
      </div>

      <div className="container max-w-4xl mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center p-3 rounded-full bg-muted mb-6">
            <Github className="h-8 w-8" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight mb-3">
            GitHub Repo Analyzer
          </h1>
          <p className="text-muted-foreground max-w-md mx-auto">
            Analyze the file structure and statistics of any public GitHub repository
          </p>
        </div>

        {/* Search */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="owner/repo or GitHub URL"
                  value={repoUrl}
                  onChange={(e) => setRepoUrl(e.target.value)}
                  onKeyDown={handleKeyDown}
                  disabled={isAnalyzing}
                  className="pl-10"
                />
              </div>
              <Button
                onClick={handleAnalyze}
                disabled={isAnalyzing || !repoUrl.trim()}
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Analyzing
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
            <CardContent className="py-8">
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                <p className="text-sm text-muted-foreground">{progress || 'Processing...'}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Error State */}
        {error && (
          <Card className="mb-8 border-destructive">
            <CardContent className="py-4">
              <p className="text-sm text-destructive">{error}</p>
            </CardContent>
          </Card>
        )}

        {/* Results */}
        {result && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <FolderTree className="h-5 w-5" />
                    {result.tree.name}
                  </CardTitle>
                  <CardDescription>
                    Repository analysis complete
                  </CardDescription>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 pt-2">
                <Badge variant="secondary" className="gap-1">
                  <File className="h-3 w-3" />
                  {result.stats.totalFiles} files
                </Badge>
                <Badge variant="secondary" className="gap-1">
                  <Folder className="h-3 w-3" />
                  {result.stats.totalDirectories} directories
                </Badge>
                <Badge variant="secondary" className="gap-1">
                  <FileType className="h-3 w-3" />
                  {Object.keys(result.stats.extensionCounts).length} file types
                </Badge>
              </div>
            </CardHeader>
            <Separator />
            <CardContent className="pt-6">
              <Tabs defaultValue="tree">
                <TabsList className="mb-4">
                  <TabsTrigger value="tree" className="gap-2">
                    <FolderTree className="h-4 w-4" />
                    Tree
                  </TabsTrigger>
                  <TabsTrigger value="stats" className="gap-2">
                    <BarChart3 className="h-4 w-4" />
                    Stats
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="tree" className="max-h-[500px] overflow-y-auto -mx-2 px-2">
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
        <div className="text-center mt-12">
          <p className="text-xs text-muted-foreground">
            Uses the GitHub API to analyze public repositories
          </p>
        </div>
      </div>
    </div>
  );
}

export default App;
