// SPDX-License-Identifier: LicenseRef-NIA-Proprietary
'use client';

import { motion } from 'framer-motion';
import { 
  Cookie, 
  Shield, 
  Settings, 
  Eye,
  Database,
  Globe,
  BarChart,
  Calendar,
  Info
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const cookieTypes = [
  {
    name: 'Essential Cookies',
    icon: Shield,
    required: true,
    description: 'Required for the website to function properly',
    cookies: [
      {
        name: 'codexos_session',
        purpose: 'Maintains user session state',
        duration: 'Session',
      },
      {
        name: 'auth_token',
        purpose: 'Authentication and security',
        duration: '7 days',
      },
      {
        name: 'csrf_token',
        purpose: 'Prevents cross-site request forgery',
        duration: 'Session',
      },
    ],
  },
  {
    name: 'Functional Cookies',
    icon: Settings,
    required: false,
    description: 'Enable personalized features and preferences',
    cookies: [
      {
        name: 'user_preferences',
        purpose: 'Stores user interface preferences',
        duration: '1 year',
      },
      {
        name: 'language',
        purpose: 'Remembers selected language',
        duration: '1 year',
      },
      {
        name: 'timezone',
        purpose: 'Stores user timezone for accurate timestamps',
        duration: '1 year',
      },
    ],
  },
  {
    name: 'Analytics Cookies',
    icon: BarChart,
    required: false,
    description: 'Help us understand how visitors use our website',
    cookies: [
      {
        name: '_ga',
        purpose: 'Google Analytics tracking',
        duration: '2 years',
      },
      {
        name: '_gid',
        purpose: 'Google Analytics session tracking',
        duration: '24 hours',
      },
      {
        name: 'mixpanel_id',
        purpose: 'Product analytics and usage patterns',
        duration: '1 year',
      },
    ],
  },
  {
    name: 'Marketing Cookies',
    icon: Eye,
    required: false,
    description: 'Used to show relevant ads and measure campaigns',
    cookies: [
      {
        name: 'fbp',
        purpose: 'Facebook advertising',
        duration: '90 days',
      },
      {
        name: 'li_sugr',
        purpose: 'LinkedIn insights',
        duration: '90 days',
      },
      {
        name: 'utm_*',
        purpose: 'Campaign tracking',
        duration: '6 months',
      },
    ],
  },
];

export default function CookiePolicyPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 overflow-hidden">
        <div className="absolute inset-0 gradient-mesh opacity-30" />
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-5xl mx-auto text-center relative z-10"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-r from-violet-600 to-purple-600 mb-8"
          >
            <Cookie className="w-10 h-10 text-white" />
          </motion.div>
          
          <h1 className="text-5xl md:text-7xl font-bold mb-6 text-gradient">
            Cookie Policy
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            We use cookies to improve your experience on CodexOS. 
            This policy explains how and why we use cookies.
          </p>
          
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Calendar className="w-4 h-4" />
            <span>Last updated: January 15, 2024</span>
          </div>
        </motion.div>
      </section>

      {/* What Are Cookies */}
      <section className="py-20 px-4">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <div className="flex items-center gap-3 mb-6">
              <Info className="w-6 h-6 text-violet-400" />
              <h2 className="text-2xl font-bold">What Are Cookies?</h2>
            </div>
            
            <div className="space-y-4 text-white/80">
              <p>
                Cookies are small text files that are placed on your device when you visit a website. 
                They help the website remember information about your visit, making your next visit 
                easier and the site more useful to you.
              </p>
              <p>
                We use both session cookies (which expire when you close your browser) and persistent 
                cookies (which remain on your device until they expire or you delete them).
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Cookie Types */}
      <section className="py-20 px-4 bg-white/5">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold mb-4">Types of Cookies We Use</h2>
            <p className="text-xl text-muted-foreground">
              We use different types of cookies for various purposes
            </p>
          </motion.div>

          <div className="space-y-8">
            {cookieTypes.map((type, index) => (
              <motion.div
                key={type.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="p-6 rounded-xl border border-white/10 glass-dark"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-lg bg-gradient-to-r from-violet-600/20 to-purple-600/20">
                      <type.icon className="w-6 h-6 text-violet-400" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold">{type.name}</h3>
                      <p className="text-muted-foreground text-sm mt-1">{type.description}</p>
                    </div>
                  </div>
                  {type.required ? (
                    <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                      Required
                    </Badge>
                  ) : (
                    <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                      Optional
                    </Badge>
                  )}
                </div>

                <div className="space-y-3">
                  {type.cookies.map((cookie, i) => (
                    <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                      <div>
                        <code className="text-sm text-violet-400">{cookie.name}</code>
                        <p className="text-xs text-muted-foreground mt-1">{cookie.purpose}</p>
                      </div>
                      <span className="text-xs text-white/60">Expires: {cookie.duration}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Managing Cookies */}
      <section className="py-20 px-4">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <div className="flex items-center gap-3 mb-6">
              <Settings className="w-6 h-6 text-violet-400" />
              <h2 className="text-2xl font-bold">Managing Your Cookie Preferences</h2>
            </div>
            
            <div className="space-y-6">
              <p className="text-white/80">
                You have control over the cookies we use. Here's how you can manage them:
              </p>

              <div className="space-y-4">
                <div className="p-4 rounded-lg border border-white/10 glass-dark">
                  <h3 className="font-semibold mb-2">Browser Settings</h3>
                  <p className="text-sm text-white/80">
                    Most web browsers allow you to control cookies through their settings. 
                    You can set your browser to refuse cookies or delete certain cookies.
                  </p>
                </div>

                <div className="p-4 rounded-lg border border-white/10 glass-dark">
                  <h3 className="font-semibold mb-2">Cookie Preferences</h3>
                  <p className="text-sm text-white/80 mb-3">
                    Use our cookie preference center to manage optional cookies.
                  </p>
                  <button className="px-4 py-2 rounded-lg bg-gradient-to-r from-violet-600 to-purple-600 text-sm font-semibold hover:shadow-lg hover:shadow-violet-500/25 transition-all duration-300">
                    Manage Preferences
                  </button>
                </div>

                <div className="p-4 rounded-lg border border-white/10 glass-dark">
                  <h3 className="font-semibold mb-2">Opt-Out Links</h3>
                  <p className="text-sm text-white/80 mb-3">
                    You can opt out of third-party cookies:
                  </p>
                  <ul className="space-y-2 text-sm">
                    <li>
                      <a href="https://tools.google.com/dlpage/gaoptout" className="text-violet-400 hover:text-violet-300 transition-colors">
                        Google Analytics Opt-Out
                      </a>
                    </li>
                    <li>
                      <a href="https://www.facebook.com/help/568137493302217" className="text-violet-400 hover:text-violet-300 transition-colors">
                        Facebook Ads Settings
                      </a>
                    </li>
                    <li>
                      <a href="https://www.linkedin.com/psettings/guest-controls" className="text-violet-400 hover:text-violet-300 transition-colors">
                        LinkedIn Cookie Settings
                      </a>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Impact of Disabling Cookies */}
      <section className="py-20 px-4 bg-white/5">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <div className="flex items-center gap-3 mb-6">
              <Database className="w-6 h-6 text-violet-400" />
              <h2 className="text-2xl font-bold">Impact of Disabling Cookies</h2>
            </div>
            
            <div className="p-6 rounded-xl border border-yellow-500/20 bg-yellow-500/5">
              <p className="text-white/80 mb-4">
                Please note that if you disable or refuse cookies, some parts of CodexOS 
                may become inaccessible or not function properly:
              </p>
              <ul className="space-y-2">
                <li className="flex items-start gap-3">
                  <span className="text-yellow-400 mt-1">•</span>
                  <span className="text-white/80">You may need to re-enter your login credentials</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-yellow-400 mt-1">•</span>
                  <span className="text-white/80">Your preferences and settings may not be saved</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-yellow-400 mt-1">•</span>
                  <span className="text-white/80">Some features may not work as intended</span>
                </li>
              </ul>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Third-Party Cookies */}
      <section className="py-20 px-4">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <div className="flex items-center gap-3 mb-6">
              <Globe className="w-6 h-6 text-violet-400" />
              <h2 className="text-2xl font-bold">Third-Party Cookies</h2>
            </div>
            
            <div className="space-y-4 text-white/80">
              <p>
                In addition to our own cookies, we may also use various third-party cookies 
                to report usage statistics of the Service and deliver advertisements on and 
                through the Service.
              </p>
              <p>
                These third parties have their own privacy policies addressing how they use 
                such information. We encourage you to read their privacy policies to learn 
                more about their data practices.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Updates to Policy */}
      <section className="py-20 px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="max-w-3xl mx-auto"
        >
          <div className="p-8 rounded-2xl border border-white/10 glass-dark text-center">
            <Calendar className="w-12 h-12 text-violet-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-3">Updates to This Policy</h3>
            <p className="text-muted-foreground mb-6">
              We may update this Cookie Policy from time to time to reflect changes in our 
              practices or for other operational, legal, or regulatory reasons.
            </p>
            <p className="text-sm text-white/60">
              Questions? Contact us at{' '}
              <a href="mailto:privacy@codexos.dev" className="text-violet-400 hover:text-violet-300 transition-colors">
                privacy@codexos.dev
              </a>
            </p>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
