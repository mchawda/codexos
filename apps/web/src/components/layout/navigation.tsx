'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Code2, Menu, X, Sun, Moon, Github, Users } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTheme } from 'next-themes';

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);
  const isHomePage = pathname === '/';

  const navItems = [
    { href: '/features', label: 'Features' },
    { href: '/marketplace', label: 'Marketplace' },
    { href: '/docs', label: 'Documentation' },
    { href: '/pricing', label: 'Pricing' },
  ];

  return (
    <motion.nav
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className="fixed top-0 left-0 right-0 z-50 px-6 py-6"
    >
      <div className="max-w-4xl mx-auto">
        <div className="border border-white/10 rounded-full px-6 py-3" style={{ background: 'rgba(10, 11, 20, 0.9)', backdropFilter: 'blur(40px)', WebkitBackdropFilter: 'blur(40px)' }}>
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-3">
              <motion.div
                whileHover={{ scale: 1.05, rotate: 5 }}
                transition={{ type: 'spring', stiffness: 400 }}
                className="p-2 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 glow-primary"
              >
                <Code2 className="h-6 w-6 text-white" />
              </motion.div>
              <span className="text-xl font-bold text-gradient">
                CodexOS
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-1 text-sm font-medium text-white/60">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="hover:text-white transition-colors duration-300 px-4 py-2 rounded-full hover:bg-white/5"
                >
                  {item.label}
                </Link>
              ))}
            </div>

            {/* Right Side Actions */}
            <div className="hidden md:flex items-center gap-2">
              <button 
                className="hover:bg-white/5 p-2 rounded-full transition-all duration-300 border border-white/5"
                style={{ background: 'rgba(255, 255, 255, 0.02)' }}
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                aria-label="Toggle theme"
              >
                <div className="w-4 h-4 text-white/60">
                  {mounted && (
                    theme === 'dark' ? (
                      <Sun className="w-4 h-4" />
                    ) : (
                      <Moon className="w-4 h-4" />
                    )
                  )}
                </div>
              </button>
              
              <a
                href="https://github.com/codexos"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:bg-white/5 p-2 rounded-full transition-all duration-300 border border-white/5"
                style={{ background: 'rgba(255, 255, 255, 0.02)' }}
                aria-label="GitHub"
              >
                <Github className="w-4 h-4 text-white/60" />
              </a>

              <Link href="/login">
                <button 
                  className="hover:bg-white/5 p-2 rounded-full transition-all duration-300 border border-white/5"
                  style={{ background: 'rgba(255, 255, 255, 0.02)' }}
                  aria-label="Account"
                >
                  <Users className="w-4 h-4 text-white/60" />
                </button>
              </Link>
              
              <Link href="/dashboard" className="relative">
                <button 
                  className="hover:bg-white/5 p-2 rounded-full transition-all duration-300 border border-white/5"
                  style={{ background: 'rgba(255, 255, 255, 0.02)' }}
                  aria-label="Dashboard"
                >
                  <Code2 className="w-4 h-4 text-white/60" />
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 text-white text-xs rounded-full flex items-center justify-center font-medium">!</span>
                </button>
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden p-2 text-foreground hover:bg-accent rounded-lg transition-colors"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

          {/* Mobile Menu */}
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="md:hidden mt-4 pt-4 border-t border-border/50"
            >
              <div className="flex flex-col space-y-4">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="text-muted-foreground hover:text-foreground transition-colors duration-200 py-2"
                    onClick={() => setIsOpen(false)}
                  >
                    {item.label}
                  </Link>
                ))}
                <div className="flex items-center space-x-4 pt-4 border-t border-border/50">
                  <Button 
                    variant="outline" 
                    className="flex-1"
                    asChild
                  >
                    <Link href="/login">
                      Sign In
                    </Link>
                  </Button>
                  <Button 
                    className="flex-1 bg-gradient-to-r from-violet-600 to-purple-600"
                    asChild
                  >
                    <Link href="/dashboard">
                      Get Started
                    </Link>
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </motion.nav>
  );
}
