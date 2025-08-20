'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useUser } from '@/contexts/user-context';
import { 
  Code2, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowRight,
  ShieldCheck,
  Info,
  Github,
  Chrome,
  Users
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';

export default function LoginPage() {
  const router = useRouter();
  const { setUser } = useUser();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loginSuccess, setLoginSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate login process
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // For demo purposes, extract name from email or use default
    const emailName = email.split('@')[0];
    const nameParts = emailName.split('.');
    
    const mockUser = {
      id: Math.random().toString(36).substr(2, 9),
      firstName: nameParts[0]?.charAt(0).toUpperCase() + nameParts[0]?.slice(1) || 'User',
      lastName: nameParts[1]?.charAt(0).toUpperCase() + nameParts[1]?.slice(1) || 'Name',
      email: email,
    };
    
    setUser(mockUser);
    setLoginSuccess(true);
    setIsLoading(false);
    
    // Redirect to dashboard after success
    setTimeout(() => {
      router.push('/dashboard');
    }, 1000);
  };

  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-violet-900/20 via-background to-purple-900/20" />
      <div className="absolute inset-0 space-grid opacity-20" />
      
      {/* Matrix rain effect placeholder */}
      <div className="matrix-rain absolute inset-0 pointer-events-none">
        {Array.from({ length: 20 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute text-primary/20 font-mono text-sm"
            initial={{ 
              x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1920),
              y: -50,
              opacity: 0 
            }}
            animate={{ 
              y: typeof window !== 'undefined' ? window.innerHeight + 50 : 1080,
              opacity: [0, 1, 1, 0],
            }}
            transition={{
              duration: Math.random() * 10 + 10,
              repeat: Infinity,
              delay: Math.random() * 10,
              ease: "linear"
            }}
          >
            {Math.random() > 0.5 ? '0' : '1'}
          </motion.div>
        ))}
      </div>

      {/* Login Container */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md px-6 relative z-10"
      >
        {/* Logo Section */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-violet-600 to-purple-600 rounded-2xl mb-4 shadow-lg glow-primary">
            <Code2 className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight mb-1">CodexOS</h1>
          <p className="text-sm text-muted-foreground">Sign in to your workspace</p>
          <div className="flex items-center justify-center gap-2 mt-3">
            <div className="inline-flex items-center gap-1 px-2 py-1 bg-green-500/10 border border-green-500/20 rounded-lg text-xs font-medium text-green-500">
              <ShieldCheck className="w-3 h-3" />
              <span>Protected Session</span>
            </div>
          </div>
        </motion.div>

        {/* Login Form */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-dark rounded-2xl shadow-2xl border border-white/10 p-6 relative overflow-hidden"
        >
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-violet-600/10 via-transparent to-purple-600/10 pointer-events-none" />
          
          <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
            {/* Email Field */}
            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center gap-2">
                Email address
                <span className="text-xs text-destructive">*</span>
              </Label>
              <div className="relative">
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="john.doe@company.com"
                  required
                  className="pl-12 pr-10 h-12 bg-background/50 border-white/10 focus:border-primary focus:bg-background/80 transition-all"
                />
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                {email && (
                  <div className={`absolute right-4 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full transition-all ${
                    isEmailValid ? 'bg-green-500' : 'bg-transparent'
                  }`} />
                )}
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <Label htmlFor="password" className="flex items-center gap-2">
                Password
                <span className="text-xs text-destructive">*</span>
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="pl-12 pr-12 h-12 bg-background/50 border-white/10 focus:border-primary focus:bg-background/80 transition-all"
                />
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1 rounded-md hover:bg-accent"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <label className="flex items-center cursor-pointer">
                <Checkbox className="mr-2" />
                <span className="text-sm text-muted-foreground">Remember me for 30 days</span>
              </label>
              <Link 
                href="/forgot-password" 
                className="text-sm text-primary hover:text-primary/80 font-medium transition-colors hover:underline"
              >
                Forgot password?
              </Link>
            </div>

            {/* Sign In Button */}
            <Button
              type="submit"
              disabled={isLoading || loginSuccess}
              className="w-full h-12 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                  <span>Signing in...</span>
                </>
              ) : loginSuccess ? (
                <>
                  <ShieldCheck className="w-4 h-4 text-green-400 mr-2" />
                  <span className="text-green-400">Success!</span>
                </>
              ) : (
                <>
                  <span>Sign in securely</span>
                  <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
                </>
              )}
            </Button>

            {/* Security Notice */}
            <div className="flex items-center gap-2 text-xs text-muted-foreground bg-background/50 p-3 rounded-lg border border-white/10">
              <Info className="w-4 h-4 text-primary" />
              <span>Your connection is secured with 256-bit SSL encryption</span>
            </div>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/10" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-3 bg-background text-muted-foreground font-medium">Or continue with</span>
              </div>
            </div>

            {/* Social Login */}
            <div className="grid grid-cols-2 gap-3">
              <Button
                type="button"
                variant="outline"
                className="h-12 border-white/10 hover:bg-accent hover:border-white/20 hover:-translate-y-0.5 transition-all"
              >
                <Github className="w-5 h-5 mr-2" />
                GitHub
              </Button>
              <Button
                type="button"
                variant="outline"
                className="h-12 border-white/10 hover:bg-accent hover:border-white/20 hover:-translate-y-0.5 transition-all"
              >
                <Chrome className="w-5 h-5 mr-2" />
                Google
              </Button>
            </div>
          </form>
        </motion.div>

        {/* Sign Up Link */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-center mt-6"
        >
          <p className="text-sm text-muted-foreground">
            Don't have an account?{' '}
            <Link 
              href="/signup" 
              className="text-primary font-medium hover:text-primary/80 transition-colors hover:underline"
            >
              Start your free trial
            </Link>
          </p>
        </motion.div>

        {/* Trust Indicators */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="flex items-center justify-center gap-6 mt-8 text-xs text-muted-foreground flex-wrap"
        >
          <div className="flex items-center gap-1 px-2 py-1 rounded-md hover:bg-accent transition-all">
            <ShieldCheck className="w-4 h-4 text-green-400" />
            <span>SOC 2 Certified</span>
          </div>
          <div className="flex items-center gap-1 px-2 py-1 rounded-md hover:bg-accent transition-all">
            <Lock className="w-4 h-4 text-primary" />
            <span>256-bit SSL</span>
          </div>
          <div className="flex items-center gap-1 px-2 py-1 rounded-md hover:bg-accent transition-all">
            <Users className="w-4 h-4 text-purple-400" />
            <span>125k+ teams</span>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
