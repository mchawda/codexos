// SPDX-License-Identifier: LicenseRef-NIA-Proprietary
'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Send, CheckCircle } from 'lucide-react';

interface NewsletterProps {
  title?: string;
  description?: string;
  className?: string;
}

export function Newsletter({ 
  title = 'Stay Connected to Innovation',
  description = 'Get updates on new features, agent templates, and exclusive developer insights.',
  className = ''
}: NewsletterProps) {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setIsSubmitting(false);
    setIsSubmitted(true);
    
    // Reset after 3 seconds
    setTimeout(() => {
      setIsSubmitted(false);
      setEmail('');
    }, 3000);
  };

  return (
    <div className={`border-t border-border/20 pt-12 ${className}`}>
      <div className="max-w-2xl mx-auto text-center">
        <h4 className="text-lg font-medium text-foreground mb-4 font-manrope">{title}</h4>
        <p className="text-sm text-muted-foreground mb-8">{description}</p>
        
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 justify-center">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email address"
            className="input-glass flex-1 max-w-md"
            disabled={isSubmitting || isSubmitted}
            required
          />
          
          <motion.button
            type="submit"
            disabled={isSubmitting || isSubmitted}
            className={`px-8 py-3 rounded-xl text-sm font-medium text-foreground transition-all duration-300 flex items-center justify-center gap-2 ${
              isSubmitted 
                ? 'bg-green-500/15 border-green-500/30' 
                : 'glass-blue border border-blue-500/30 hover:border-blue-500/50'
            }`}
            whileTap={{ scale: 0.98 }}
          >
            {isSubmitted ? (
              <>
                <CheckCircle className="w-4 h-4" />
                Subscribed!
              </>
            ) : isSubmitting ? (
              <div className="w-4 h-4 border-2 border-foreground/30 border-t-foreground rounded-full animate-spin" />
            ) : (
              <>
                Subscribe
                <Send className="w-4 h-4" />
              </>
            )}
          </motion.button>
        </form>
        
        {isSubmitted && (
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-sm text-green-400 mt-4"
          >
            Thank you for subscribing! Check your email for confirmation.
          </motion.p>
        )}
      </div>
    </div>
  );
}
