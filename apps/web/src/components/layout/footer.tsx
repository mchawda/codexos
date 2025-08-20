'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Code2, Github, Twitter, Linkedin, Youtube, CheckCircle, Shield } from 'lucide-react';
import { Newsletter } from '@/components/ui/newsletter';

const footerLinks = {
  Product: [
    { href: '/features', label: 'Features' },
    { href: '/dashboard', label: 'Agent Builder' },
    { href: '/marketplace', label: 'Marketplace' },
    { href: '/pricing', label: 'Pricing' },
    { href: '/roadmap', label: 'Roadmap' },
  ],
  Developers: [
    { href: '/docs', label: 'Documentation' },
    { href: '/api', label: 'API Reference' },
    { href: '/guides', label: 'Guides' },
    { href: '/templates', label: 'Templates' },
    { href: '/changelog', label: 'Changelog' },
  ],
  Company: [
    { href: '/about', label: 'About Us' },
    { href: '/blog', label: 'Blog' },
    { href: '/careers', label: 'Careers' },
    { href: '/contact', label: 'Contact' },
    { href: '/partners', label: 'Partners' },
  ],
  Support: [
    { href: '/help', label: 'Help Center' },
    { href: '/community', label: 'Community' },
    { href: '/discord', label: 'Discord' },
    { href: '/status', label: 'System Status' },
    { href: '/security', label: 'Security' },
  ],
};

export default function Footer() {
  return (
    <footer className="max-w-7xl lg:px-8 mx-auto px-6 pb-12 pt-20">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
        className="lg:p-16 border-white/10 border rounded-3xl p-12 glass-dark"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12 mb-16">
          {/* Company Info */}
          <div className="lg:col-span-1 md:col-span-2 lg:col-span-1">
            <div className="flex items-center mb-6">
              <Code2 className="h-8 w-8 text-white mr-3" />
              <span className="text-xl font-semibold tracking-tight text-white">CodexOS</span>
            </div>
            <p className="text-sm text-white/60 leading-relaxed mb-6">
              Building the future of software development with autonomous AI agents.
            </p>
            <div className="flex items-center gap-3">
              <a 
                href="https://twitter.com/codexos" 
                className="w-8 h-8 rounded-lg flex items-center justify-center border border-white/10 hover:border-white/20 transition-all duration-300 hover:bg-white/5 glass-ultra"
                aria-label="Twitter"
              >
                <Twitter className="w-3.5 h-3.5 text-white/60" />
              </a>
              <a 
                href="https://linkedin.com/company/codexos" 
                className="w-8 h-8 rounded-lg flex items-center justify-center border border-white/10 hover:border-white/20 transition-all duration-300 hover:bg-white/5 glass-ultra"
                aria-label="LinkedIn"
              >
                <Linkedin className="w-3.5 h-3.5 text-white/60" />
              </a>
              <a 
                href="https://youtube.com/@codexos" 
                className="w-8 h-8 rounded-lg flex items-center justify-center border border-white/10 hover:border-white/20 transition-all duration-300 hover:bg-white/5 glass-ultra"
                aria-label="YouTube"
              >
                <Youtube className="w-3.5 h-3.5 text-white/60" />
              </a>
              <a 
                href="https://github.com/mchawda" 
                className="w-8 h-8 rounded-lg flex items-center justify-center border border-white/10 hover:border-white/20 transition-all duration-300 hover:bg-white/5 glass-ultra"
                aria-label="GitHub"
              >
                <Github className="w-3.5 h-3.5 text-white/60" />
              </a>
            </div>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h4 className="text-sm font-medium text-white mb-6 uppercase tracking-wide">
                {category}
              </h4>
              <ul className="space-y-4">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link 
                      href={link.href}
                      className="text-sm text-white/60 hover:text-white transition-colors duration-300"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Newsletter */}
        <Newsletter />

        {/* Bottom Bar */}
        <div className="border-t border-white/10 pt-8 mt-12 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-wrap items-center gap-6 text-xs text-white/40">
            <span>© 2024 CodexOS. All rights reserved.</span>
            <Link href="/privacy" className="hover:text-white/60 transition-colors duration-300">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-white/60 transition-colors duration-300">
              Terms of Service
            </Link>
            <Link href="/cookies" className="hover:text-white/60 transition-colors duration-300">
              Cookie Policy
            </Link>
          </div>
          <div className="flex items-center gap-4 text-xs text-white/40">
            <span className="flex items-center gap-2">
              <CheckCircle className="w-3 h-3 text-green-400" />
              SOC2 Certified
            </span>
            <span className="flex items-center gap-2">
              <Shield className="w-3 h-3 text-blue-400" />
              ISO 27001
            </span>
          </div>
        </div>
      </motion.div>
    </footer>
  );
}
