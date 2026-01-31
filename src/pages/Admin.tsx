import { useState, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Upload, CheckCircle, AlertCircle, Lock, FileText, Loader2, LogOut, UserPlus, Download, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { 
  uploadQuestionsFromCSV, 
  parseCSVContent, 
  parseExcelContent,
  deleteAllQuestionData,
  parseTopicFromName,
  findBlueprintMatch,
  getQuestionSummary,
} from '@/services/questionService';
import { useAuth } from '@/hooks/useAuth';
import { UsageDashboard } from '@/components/admin/UsageDashboard';
import { QuestionBankSummary } from '@/components/admin/QuestionBankSummary';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const Admin = () => {
  const { user, isAdmin, loading: isLoading, signIn, signUp, signOut } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  
  const [subject, setSubject] = useState('Math');
  const [topicName, setTopicName] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadMode, setUploadMode] = useState<'append' | 'replace'>('append');
  const [isDownloading, setIsDownloading] = useState(false);
  const [isCleaningAll, setIsCleaningAll] = useState(false);
  const [summaryRefreshKey, setSummaryRefreshKey] = useState(0);
  const [uploadResults, setUploadResults] = useState<Array<{
    topic: string;
    normalizedTopic?: string;
    success: boolean;
    count?: number;
    skipped?: number;
    error?: string;
    blueprintMatch?: boolean;
  }>>([]);

  const handleSignIn = async () => {
    if (!email || !password) {
      toast.error('Please enter email and password');
      return;
    }
    
    setAuthLoading(true);
    await signIn(email, password);
    setAuthLoading(false);
  };

  const handleSignUp = async () => {
    if (!email || !password) {
      toast.error('Please enter email and password');
      return;
    }
    
    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    
    setAuthLoading(true);
    await signUp(email, password, email.split('@')[0]);
    toast.info('Note: An admin must grant you admin privileges to upload questions.');
    setIsSignUp(false);
    setAuthLoading(false);
  };

  const handleSignOut = async () => {
    await signOut();
    toast.success('Signed out');
  };

  const detectSubjectFromName = (name: string): string => {
    const lowerName = name.toLowerCase();
    if (/physics|heat|motion|light|electric/i.test(lowerName)) {
      return 'Physics';
    } else if (/chemistry|acid|chemical|fibre/i.test(lowerName)) {
      return 'Chemistry';
    }
    return 'Math';
  };

  const handleDownloadQuestionBank = async () => {
    setIsDownloading(true);
    try {
      const summary = await getQuestionSummary();
      
      if (summary.totalQuestions === 0) {
        toast.error('No questions found in the database');
        return;
      }

      toast.success(`Database contains ${summary.totalQuestions} questions across ${summary.subjects.length} subject(s)`);
    } catch (error) {
      toast.error('Failed to fetch question bank');
      console.error(error);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleCleanAllData = async () => {
    setIsCleaningAll(true);
    try {
      const result = await deleteAllQuestionData({ keepSubjects: false });
      
      if (result.success) {
        toast.success(
          `Cleaned database: ${result.deletedQuestions} questions, ${result.deletedTopics} topics, ${result.deletedSubjects} subjects deleted`
        );
        setUploadResults([]);
        setSummaryRefreshKey(prev => prev + 1);
      } else {
        toast.error(`Failed to clean data: ${result.error}`);
      }
    } catch (error) {
      toast.error('Failed to clean database');
      console.error(error);
    } finally {
      setIsCleaningAll(false);
    }
  };

  const handleFileChange = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    setUploadResults([]);
    const results: typeof uploadResults = [];

    for (const file of Array.from(files)) {
      const fileName = file.name.replace(/\.(csv|tsv|txt|xlsx|xls)$/i, '');
      const isExcel = /\.(xlsx|xls)$/i.test(file.name);
      
      if (isExcel) {
        try {
          const buffer = await file.arrayBuffer();
          const questions = await parseExcelContent(buffer);
          
          if (questions.length === 0) {
            results.push({
              topic: fileName,
              success: false,
              error: 'No valid questions found in Excel file',
            });
            continue;
          }
          
          const rawName = topicName || fileName;
          const { topic: parsedTopic } = parseTopicFromName(rawName);
          const detectedSubject = detectSubjectFromName(rawName) || subject;
          const blueprintMatch = findBlueprintMatch(parsedTopic, detectedSubject);
          
          const result = await uploadQuestionsFromCSV(
            detectedSubject, 
            rawName,
            questions,
            { replaceExisting: uploadMode === 'replace' }
          );
          
          results.push({
            topic: fileName,
            normalizedTopic: result.normalizedTopicName,
            success: result.success,
            count: result.count,
            skipped: result.skipped,
            error: result.error,
            blueprintMatch: blueprintMatch !== null,
          });
        } catch (error) {
          results.push({
            topic: fileName,
            success: false,
            error: `Excel parsing error: ${(error as Error).message}`,
          });
        }
      } else {
        const content = await file.text();
        const detectedSubject = topicName ? subject : detectSubjectFromName(fileName);
        const finalTopicName = topicName || fileName;

        const questions = await parseCSVContent(content);
        
        if (questions.length === 0) {
          results.push({
            topic: finalTopicName,
            success: false,
            error: 'No valid questions found in file',
          });
          continue;
        }

        const result = await uploadQuestionsFromCSV(
          detectedSubject, 
          finalTopicName, 
          questions,
          { replaceExisting: uploadMode === 'replace' }
        );
        
        results.push({
          topic: finalTopicName,
          normalizedTopic: result.normalizedTopicName,
          success: result.success,
          count: result.count,
          skipped: result.skipped,
          error: result.error,
        });
      }
    }

    setUploadResults(results);
    setIsUploading(false);
    setTopicName('');
    event.target.value = '';

    const successCount = results.filter(r => r.success).length;
    const totalInserted = results.reduce((acc, r) => acc + (r.count || 0), 0);
    const totalSkipped = results.reduce((acc, r) => acc + (r.skipped || 0), 0);
    
    if (successCount > 0) {
      let message = `Uploaded ${totalInserted} question(s)`;
      if (totalSkipped > 0) {
        message += `, skipped ${totalSkipped} duplicate(s)`;
      }
      toast.success(message);
      setSummaryRefreshKey(prev => prev + 1);
    }
  }, [subject, topicName, uploadMode]);

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // Not authenticated - show login/signup
  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <motion.div
                className="mx-auto mb-4 p-4 bg-primary/10 rounded-full w-fit"
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Lock className="w-8 h-8 text-primary" />
              </motion.div>
              <CardTitle>{isSignUp ? 'Create Admin Account' : 'Admin Login'}</CardTitle>
              <CardDescription>
                {isSignUp 
                  ? 'Create your admin account' 
                  : 'Sign in with your admin credentials'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <Input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (isSignUp ? handleSignUp() : handleSignIn())}
              />
              <Button 
                className="w-full" 
                onClick={isSignUp ? handleSignUp : handleSignIn}
                disabled={authLoading}
              >
                {authLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : isSignUp ? (
                  <UserPlus className="w-4 h-4 mr-2" />
                ) : null}
                {isSignUp ? 'Create Account' : 'Sign In'}
              </Button>
              <Button 
                variant="ghost" 
                className="w-full" 
                onClick={() => setIsSignUp(!isSignUp)}
              >
                {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  const handleBecomeAdmin = async () => {
    if (!user) return;
    setAuthLoading(true);
    try {
      const response = await fetch('/api/admin/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id }),
      });
      if (response.ok) {
        toast.success('Admin access granted! Refreshing...');
        window.location.reload();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to grant admin access');
      }
    } catch (error) {
      toast.error('Failed to grant admin access');
    }
    setAuthLoading(false);
  };

  // Authenticated but not admin - show access denied with option to request
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <motion.div
                className="mx-auto mb-4 p-4 bg-destructive/10 rounded-full w-fit"
              >
                <AlertCircle className="w-8 h-8 text-destructive" />
              </motion.div>
              <CardTitle>Access Denied</CardTitle>
              <CardDescription>
                You don't have admin privileges yet.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground text-center">
                Signed in as: {user.email}
              </p>
              <Button 
                className="w-full" 
                onClick={handleBecomeAdmin}
                disabled={authLoading}
              >
                {authLoading ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <UserPlus className="w-4 h-4 mr-2" />
                )}
                Become Admin
              </Button>
              <Button variant="outline" className="w-full" onClick={handleSignOut}>
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
              <a 
                href="/" 
                className="block text-center text-primary hover:underline"
              >
                ← Back to Quiz App
              </a>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  // Authenticated admin - show upload interface
  return (
    <div className="min-h-screen bg-background">
      <motion.header 
        className="bg-gradient-magical text-white py-6 px-4"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">📚 Admin - Question Bank Manager</h1>
            <p className="text-white/80 text-sm mt-1">
              Signed in as: {user.id}
            </p>
          </div>
          <Button variant="secondary" size="sm" onClick={handleSignOut}>
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </motion.header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="w-5 h-5" />
              Upload Question Bank
            </CardTitle>
            <CardDescription>
              Upload CSV, TSV, or Excel files with questions. Excel files with multiple sheets will create one topic per sheet.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Subject</label>
                <Select value={subject} onValueChange={setSubject}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Math">Math</SelectItem>
                    <SelectItem value="Physics">Physics</SelectItem>
                    <SelectItem value="Chemistry">Chemistry</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Topic Name (optional)</label>
                <Input
                  placeholder="Leave empty to use filename"
                  value={topicName}
                  onChange={(e) => setTopicName(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-3 block">Upload Mode</label>
                <RadioGroup
                  value={uploadMode}
                  onValueChange={(value) => setUploadMode(value as 'append' | 'replace')}
                  className="flex gap-6"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="append" id="append" />
                    <Label htmlFor="append" className="cursor-pointer">
                      <span className="font-medium">Append</span>
                      <span className="text-muted-foreground text-sm ml-1">(skip duplicates)</span>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="replace" id="replace" />
                    <Label htmlFor="replace" className="cursor-pointer">
                      <span className="font-medium">Replace</span>
                      <span className="text-muted-foreground text-sm ml-1">(delete existing first)</span>
                    </Label>
                  </div>
                </RadioGroup>
              </div>
              
              <label className="block cursor-pointer">
                <input
                  type="file"
                  accept=".csv,.tsv,.txt,.xlsx,.xls"
                  multiple
                  onChange={handleFileChange}
                  className="hidden"
                  disabled={isUploading}
                />
                <motion.div 
                  className={`border-2 border-dashed rounded-xl p-8 text-center transition-all ${
                    isUploading 
                      ? 'border-muted bg-muted/20' 
                      : 'border-border hover:border-primary hover:bg-primary/5'
                  }`}
                  whileHover={!isUploading ? { scale: 1.01 } : {}}
                  whileTap={!isUploading ? { scale: 0.99 } : {}}
                >
                  {isUploading ? (
                    <div className="flex flex-col items-center gap-2">
                      <Loader2 className="w-8 h-8 text-primary animate-spin" />
                      <p className="font-medium">Uploading questions...</p>
                    </div>
                  ) : (
                    <>
                      <motion.div 
                        className="inline-flex p-4 bg-primary/10 rounded-full mb-4"
                        animate={{ y: [0, -5, 0] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        <FileText className="w-8 h-8 text-primary" />
                      </motion.div>
                      <p className="font-semibold text-foreground mb-1">
                        Click to upload question files
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Supports: CSV, TSV, Excel (.xlsx, .xls)
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {uploadMode === 'append' 
                          ? 'Duplicate questions will be automatically skipped'
                          : 'All existing questions in the topic will be deleted first'}
                      </p>
                    </>
                  )}
                </motion.div>
              </label>
            </div>
          </CardContent>
        </Card>

        {uploadResults.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Upload Results</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {uploadResults.map((result, index) => (
                  <motion.div
                    key={index}
                    className={`flex items-center gap-3 p-3 rounded-lg ${
                      result.success 
                        ? result.blueprintMatch === false 
                          ? 'bg-amber-100 dark:bg-amber-950/30 border border-amber-300' 
                          : 'bg-primary/10' 
                        : 'bg-destructive/10'
                    }`}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    {result.success ? (
                      result.blueprintMatch === false ? (
                        <AlertCircle className="w-5 h-5 text-amber-600" />
                      ) : (
                        <CheckCircle className="w-5 h-5 text-primary" />
                      )
                    ) : (
                      <AlertCircle className="w-5 h-5 text-destructive" />
                    )}
                    <div className="flex-1">
                      <p className="font-medium">
                        {result.topic}
                        {result.normalizedTopic && result.normalizedTopic !== result.topic && (
                          <span className="text-primary ml-2 font-normal text-sm">
                            → {result.normalizedTopic}
                          </span>
                        )}
                        {result.blueprintMatch === false && (
                          <span className="text-amber-600 ml-2 font-normal text-xs">
                            ⚠️ Not in blueprint
                          </span>
                        )}
                      </p>
                      {result.success ? (
                        <p className="text-sm text-muted-foreground">
                          {result.count} questions uploaded
                          {result.skipped && result.skipped > 0 && (
                            <span className="text-muted-foreground/70 ml-1">
                              ({result.skipped} duplicates skipped)
                            </span>
                          )}
                        </p>
                      ) : (
                        <p className="text-sm text-destructive">{result.error}</p>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="w-5 h-5" />
              Download Question Bank
            </CardTitle>
            <CardDescription>
              Download all questions as an Excel file with each topic on a separate sheet
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={handleDownloadQuestionBank}
              disabled={isDownloading}
              className="w-full sm:w-auto"
            >
              {isDownloading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Preparing download...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 mr-2" />
                  Download All Questions (.xlsx)
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        <Card className="mt-6 border-destructive/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <Trash2 className="w-5 h-5" />
              Clean All Data
            </CardTitle>
            <CardDescription>
              Delete ALL questions, topics, and subjects for a fresh start. Use this before uploading a complete new question bank.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="destructive"
                  disabled={isCleaningAll}
                  className="w-full sm:w-auto"
                >
                  {isCleaningAll ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Cleaning database...
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete All Questions & Topics
                    </>
                  )}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete ALL questions, topics, and subjects from the database. 
                    This action cannot be undone. Use this only if you want to start fresh with a new question bank.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleCleanAllData} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                    Yes, Delete Everything
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </CardContent>
        </Card>

        <div className="mt-6">
          <QuestionBankSummary key={summaryRefreshKey} />
        </div>
        <div className="mt-6">
          <UsageDashboard />
        </div>

        <div className="mt-8 text-center">
          <a 
            href="/" 
            className="text-primary hover:underline"
          >
            ← Back to Quiz App
          </a>
        </div>
      </main>
    </div>
  );
};

export default Admin;