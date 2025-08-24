// SPDX-License-Identifier: LicenseRef-NIA-Proprietary
'use client';

import { motion } from 'framer-motion';
import { 
  Shield, 
  Lock, 
  Eye, 
  Users,
  Database,
  Globe,
  Mail,
  FileText,
  Calendar
} from 'lucide-react';

const sections = [
  {
    id: 'information-we-collect',
    title: 'Information We Collect',
    icon: Database,
    content: [
      {
        subtitle: 'Information You Provide',
        items: [
          'Account information (name, email, company)',
          'Payment information (processed by Stripe)',
          'Content you create (agents, workflows, configurations)',
          'Communications with us (support tickets, emails)',
        ],
      },
      {
        subtitle: 'Information Collected Automatically',
        items: [
          'Usage data (features used, actions taken)',
          'Device information (browser type, OS)',
          'Log data (IP address, access times)',
          'Cookies and similar technologies',
        ],
      },
    ],
  },
  {
    id: 'how-we-use-information',
    title: 'How We Use Your Information',
    icon: Eye,
    content: [
      {
        subtitle: 'We use your information to:',
        items: [
          'Provide and improve our services',
          'Process payments and prevent fraud',
          'Send service updates and marketing communications',
          'Respond to support requests',
          'Comply with legal obligations',
          'Protect our users and platform',
        ],
      },
    ],
  },
  {
    id: 'information-sharing',
    title: 'Information Sharing',
    icon: Users,
    content: [
      {
        subtitle: 'We may share information with:',
        items: [
          'Service providers (hosting, analytics, payment processing)',
          'Professional advisors (lawyers, accountants)',
          'Law enforcement when required by law',
          'Business transferees in case of merger or acquisition',
        ],
      },
      {
        subtitle: 'We never:',
        items: [
          'Sell your personal information',
          'Share your code or agent data without permission',
          'Use your content for advertising',
        ],
      },
    ],
  },
  {
    id: 'data-security',
    title: 'Data Security',
    icon: Lock,
    content: [
      {
        subtitle: 'Security Measures',
        items: [
          'Encryption in transit and at rest',
          'Regular security audits and testing',
          'Access controls and authentication',
          'Employee training and background checks',
          'Incident response procedures',
        ],
      },
    ],
  },
  {
    id: 'your-rights',
    title: 'Your Rights',
    icon: Shield,
    content: [
      {
        subtitle: 'You have the right to:',
        items: [
          'Access your personal information',
          'Correct inaccurate information',
          'Delete your account and data',
          'Export your data',
          'Opt-out of marketing communications',
          'Lodge a complaint with supervisory authorities',
        ],
      },
    ],
  },
];

export default function PrivacyPolicyPage() {
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
            <FileText className="w-10 h-10 text-white" />
          </motion.div>
          
          <h1 className="text-5xl md:text-7xl font-bold mb-6 text-gradient">
            Privacy Policy
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            Your privacy is important to us. This policy explains how we collect, 
            use, and protect your information.
          </p>
          
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Calendar className="w-4 h-4" />
            <span>Last updated: January 15, 2024</span>
          </div>
        </motion.div>
      </section>

      {/* Table of Contents */}
      <section className="py-12 px-4 border-b border-white/10">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold mb-6">Table of Contents</h2>
          <nav className="space-y-2">
            {sections.map((section, index) => (
              <motion.a
                key={section.id}
                href={`#${section.id}`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="flex items-center gap-3 text-muted-foreground hover:text-white transition-colors"
              >
                <section.icon className="w-5 h-5 text-violet-400" />
                <span>{section.title}</span>
              </motion.a>
            ))}
          </nav>
        </div>
      </section>

      {/* Content Sections */}
      <section className="py-20 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="prose prose-invert max-w-none">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="mb-12"
            >
              <p className="text-lg text-muted-foreground">
                CodexOS ("we", "our", or "us") is committed to protecting your privacy. 
                This Privacy Policy explains how we collect, use, disclose, and safeguard 
                your information when you use our platform.
              </p>
            </motion.div>

            {sections.map((section, sectionIndex) => (
              <motion.div
                key={section.id}
                id={section.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: sectionIndex * 0.1 }}
                className="mb-16"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 rounded-lg bg-gradient-to-r from-violet-600/20 to-purple-600/20">
                    <section.icon className="w-6 h-6 text-violet-400" />
                  </div>
                  <h2 className="text-2xl font-bold">{section.title}</h2>
                </div>

                {section.content.map((subsection, i) => (
                  <div key={i} className="mb-6">
                    {subsection.subtitle && (
                      <h3 className="text-lg font-semibold mb-3">{subsection.subtitle}</h3>
                    )}
                    <ul className="space-y-2">
                      {subsection.items.map((item, j) => (
                        <li key={j} className="flex items-start gap-3">
                          <span className="text-violet-400 mt-1">•</span>
                          <span className="text-white/80">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </motion.div>
            ))}

            {/* Additional Sections */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="mb-16"
            >
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                <Globe className="w-6 h-6 text-violet-400" />
                International Data Transfers
              </h2>
              <p className="text-white/80 mb-4">
                Your information may be transferred to and maintained on servers located 
                outside of your state, province, country, or other governmental jurisdiction 
                where data protection laws may differ.
              </p>
              <p className="text-white/80">
                We take appropriate safeguards to ensure your information remains protected 
                in accordance with this Privacy Policy.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="mb-16"
            >
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                <Users className="w-6 h-6 text-violet-400" />
                Children's Privacy
              </h2>
              <p className="text-white/80">
                Our service is not intended for use by children under the age of 13. 
                We do not knowingly collect personal information from children under 13. 
                If you become aware that a child has provided us with personal information, 
                please contact us.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="mb-16"
            >
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                <Mail className="w-6 h-6 text-violet-400" />
                Contact Us
              </h2>
              <p className="text-white/80 mb-4">
                If you have questions about this Privacy Policy or our privacy practices, 
                please contact us at:
              </p>
              <div className="p-6 rounded-xl bg-white/5 border border-white/10">
                <p className="font-semibold mb-2">CodexOS Privacy Team</p>
                <p className="text-white/80">Email: privacy@codexos.dev</p>
                <p className="text-white/80">Address: 68 Circular Road</p>
                <p className="text-white/80">049422 Singapore</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Updates Notice */}
      <section className="py-20 px-4 bg-white/5">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="max-w-3xl mx-auto"
        >
          <div className="p-8 rounded-2xl border border-white/10 glass-dark text-center">
            <Calendar className="w-12 h-12 text-violet-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-3">Policy Updates</h3>
            <p className="text-muted-foreground">
              We may update this Privacy Policy from time to time. We will notify you of 
              any changes by posting the new Privacy Policy on this page and updating the 
              "Last updated" date.
            </p>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
