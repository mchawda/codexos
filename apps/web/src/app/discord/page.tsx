// SPDX-License-Identifier: LicenseRef-NIA-Proprietary
'use client';

import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, Loader2 } from 'lucide-react';

export default function DiscordRedirectPage() {
  useEffect(() => {
    // Redirect to Discord invite link after a short delay
    const timer = setTimeout(() => {
      window.location.href = 'https://discord.gg/codexos';
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="text-center"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 mb-8"
        >
          <MessageSquare className="w-10 h-10 text-white" />
        </motion.div>
        
        <h1 className="text-3xl font-bold mb-4">Joining CodexOS Discord...</h1>
        <p className="text-muted-foreground mb-8">
          You'll be redirected to our Discord server in a moment
        </p>
        
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="inline-block"
        >
          <Loader2 className="w-8 h-8 text-violet-400" />
        </motion.div>
        
        <p className="text-sm text-muted-foreground mt-8">
          Not redirected?{' '}
          <a 
            href="https://discord.gg/codexos" 
            className="text-violet-400 hover:text-violet-300 transition-colors"
          >
            Click here
          </a>
        </p>
      </motion.div>
    </div>
  );
}
