'use client';

import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  gradient: string;
}

export default function FeatureCard({ icon: Icon, title, description, gradient }: FeatureCardProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -5 }}
      transition={{ type: 'spring', stiffness: 300 }}
      className="relative group"
    >
      <div className="absolute inset-0 bg-gradient-to-r opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-500" 
           style={{
             backgroundImage: `linear-gradient(to right, var(--tw-gradient-stops))`,
           }}
           className={cn("bg-gradient-to-r", gradient)}
      />
      
      <div className="relative glass-dark rounded-xl p-6 h-full border border-white/10 group-hover:border-white/20 transition-all duration-300">
        <div className={cn("inline-flex p-3 rounded-lg bg-gradient-to-r", gradient, "bg-opacity-10")}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        
        <h3 className="text-xl font-semibold mt-4 mb-2">{title}</h3>
        <p className="text-muted-foreground leading-relaxed">{description}</p>
      </div>
    </motion.div>
  );
}
