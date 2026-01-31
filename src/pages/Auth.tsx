import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles, Mail, Lock, User, Loader2, GraduationCap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/hooks/useAuth';
import { z } from 'zod';

const emailSchema = z.string().email('Please enter a valid email');
const passwordSchema = z.string().min(6, 'Password must be at least 6 characters');
const displayNameSchema = z.string().min(2, 'Name must be at least 2 characters').max(20, 'Name must be under 20 characters');

const AVAILABLE_GRADES = [6, 7, 8, 9, 10, 11, 12];

const Auth = () => {
  const navigate = useNavigate();
  const { user, loading, signIn, signUp } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [grade, setGrade] = useState<number>(7);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string; displayName?: string }>({});

  // Redirect if already logged in
  useEffect(() => {
    if (user && !loading) {
      navigate('/');
    }
  }, [user, loading, navigate]);

  const validateForm = () => {
    const newErrors: typeof errors = {};

    const emailResult = emailSchema.safeParse(email);
    if (!emailResult.success) {
      newErrors.email = emailResult.error.errors[0].message;
    }

    const passwordResult = passwordSchema.safeParse(password);
    if (!passwordResult.success) {
      newErrors.password = passwordResult.error.errors[0].message;
    }

    if (isSignUp) {
      const nameResult = displayNameSchema.safeParse(displayName);
      if (!nameResult.success) {
        newErrors.displayName = nameResult.error.errors[0].message;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);

    if (isSignUp) {
      const { error } = await signUp(email, password, displayName, grade);
      if (!error) {
        navigate('/');
      }
    } else {
      const { error } = await signIn(email, password);
      if (!error) {
        navigate('/');
      }
    }

    setIsSubmitting(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <motion.header 
        className="bg-gradient-magical text-white py-6 px-4"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="max-w-md mx-auto text-center">
          <motion.div
            className="flex items-center justify-center gap-2 mb-2"
            animate={{ y: [0, -5, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Sparkles className="w-8 h-8" />
            <h1 className="text-2xl font-bold">Magic Mastery Quiz</h1>
            <Sparkles className="w-8 h-8" />
          </motion.div>
          <p className="text-white/80 text-sm">
            {isSignUp ? 'Create your account to start learning!' : 'Welcome back, young wizard!'}
          </p>
        </div>
      </motion.header>

      {/* Auth Form */}
      <main className="flex-1 flex items-center justify-center p-4">
        <motion.div
          className="w-full max-w-md"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="bg-card rounded-2xl shadow-card p-6 border border-border">
            <h2 className="text-xl font-bold text-center mb-6">
              {isSignUp ? '✨ Join the Magic!' : '🔮 Sign In'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              {isSignUp && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="displayName">Display Name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="displayName"
                        type="text"
                        placeholder="Your wizard name"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    {errors.displayName && (
                      <p className="text-sm text-destructive">{errors.displayName}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="grade">Your Class/Grade</Label>
                    <div className="relative">
                      <GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground z-10" />
                      <Select
                        value={String(grade)}
                        onValueChange={(val) => setGrade(Number(val))}
                      >
                        <SelectTrigger className="pl-10">
                          <SelectValue placeholder="Select your class" />
                        </SelectTrigger>
                        <SelectContent>
                          {AVAILABLE_GRADES.map((g) => (
                            <SelectItem key={g} value={String(g)}>
                              Class {g}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Select your current class to get appropriate questions
                    </p>
                  </div>
                </>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="wizard@magic.school"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                  />
                </div>
                {errors.email && (
                  <p className="text-sm text-destructive">{errors.email}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="Your secret spell"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10"
                  />
                </div>
                {errors.password && (
                  <p className="text-sm text-destructive">{errors.password}</p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-magical hover:opacity-90"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : null}
                {isSignUp ? 'Create Account' : 'Sign In'}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <button
                onClick={() => {
                  setIsSignUp(!isSignUp);
                  setErrors({});
                }}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                {isSignUp ? (
                  <>Already have an account? <span className="text-primary font-medium">Sign in</span></>
                ) : (
                  <>New here? <span className="text-primary font-medium">Create an account</span></>
                )}
              </button>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default Auth;
