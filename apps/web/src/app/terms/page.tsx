// SPDX-License-Identifier: LicenseRef-NIA-Proprietary
'use client';

import { motion } from 'framer-motion';
import { 
  ScrollText, 
  Scale, 
  UserCheck, 
  Ban,
  Shield,
  AlertTriangle,
  DollarSign,
  Gavel,
  Calendar,
  Globe
} from 'lucide-react';

const sections = [
  {
    id: 'acceptance',
    title: 'Acceptance of Terms',
    icon: UserCheck,
    content: `By accessing or using CodexOS ("Service"), you agree to be bound by these Terms of Service ("Terms"). If you disagree with any part of these terms, you do not have permission to access the Service.`,
  },
  {
    id: 'use-license',
    title: 'Use License',
    icon: Scale,
    content: `Subject to your compliance with these Terms, we grant you a limited, non-exclusive, non-transferable license to access and use the Service for your internal business purposes. This license does not include:`,
    items: [
      'Resale or commercial use of the Service',
      'Collection and use of any product listings, descriptions, or prices',
      'Derivative use of the Service or its contents',
      'Use of data mining, robots, or similar data gathering tools',
      'Distribution of Service content without permission',
    ],
  },
  {
    id: 'user-accounts',
    title: 'User Accounts',
    icon: UserCheck,
    content: `When you create an account with us, you must provide accurate, complete, and current information. You are responsible for:`,
    items: [
      'Maintaining the confidentiality of your account credentials',
      'All activities that occur under your account',
      'Notifying us immediately of any unauthorized use',
      'Ensuring your use complies with applicable laws',
    ],
  },
  {
    id: 'prohibited-uses',
    title: 'Prohibited Uses',
    icon: Ban,
    content: `You may not use our Service:`,
    items: [
      'For any unlawful purpose or to solicit illegal activities',
      'To transmit malware, viruses, or malicious code',
      'To harass, abuse, or harm another person',
      'To violate any international, federal, or state laws',
      'To infringe upon or violate our intellectual property rights',
      'To submit false or misleading information',
      'To interfere with or circumvent security features',
    ],
  },
  {
    id: 'intellectual-property',
    title: 'Intellectual Property',
    icon: Shield,
    content: `The Service and its original content, features, and functionality are owned by CodexOS and are protected by international copyright, trademark, patent, trade secret, and other intellectual property laws.`,
    subsections: [
      {
        subtitle: 'Your Content',
        content: 'You retain ownership of content you create using our Service. By using the Service, you grant us a license to use, modify, and display your content solely to provide the Service to you.',
      },
      {
        subtitle: 'Feedback',
        content: 'Any feedback, suggestions, or ideas you provide about the Service become our property and may be used without compensation to you.',
      },
    ],
  },
  {
    id: 'payment-terms',
    title: 'Payment Terms',
    icon: DollarSign,
    content: `If you purchase a subscription to the Service:`,
    items: [
      'All fees are in USD and non-refundable unless otherwise stated',
      'Subscriptions auto-renew unless cancelled before the renewal date',
      'We may change fees upon 30 days notice',
      'You are responsible for all applicable taxes',
      'Failure to pay may result in service termination',
    ],
  },
  {
    id: 'termination',
    title: 'Termination',
    icon: AlertTriangle,
    content: `We may terminate or suspend your account immediately, without prior notice or liability, for any reason, including:`,
    items: [
      'Breach of these Terms',
      'Fraudulent, abusive, or illegal activity',
      'Non-payment of fees',
      'Upon your request',
    ],
    additional: 'Upon termination, your right to use the Service will cease immediately. All provisions which should reasonably survive termination will remain in effect.',
  },
  {
    id: 'liability',
    title: 'Limitation of Liability',
    icon: Gavel,
    content: `TO THE MAXIMUM EXTENT PERMITTED BY LAW, CODEXOS SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS OR REVENUES, WHETHER INCURRED DIRECTLY OR INDIRECTLY, OR ANY LOSS OF DATA, USE, GOODWILL, OR OTHER INTANGIBLE LOSSES.`,
  },
];

export default function TermsOfServicePage() {
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
            <ScrollText className="w-10 h-10 text-white" />
          </motion.div>
          
          <h1 className="text-5xl md:text-7xl font-bold mb-6 text-gradient">
            Terms of Service
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            Please read these terms carefully before using CodexOS. 
            By using our service, you agree to be bound by these terms.
          </p>
          
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Calendar className="w-4 h-4" />
            <span>Effective date: January 15, 2024</span>
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

                <p className="text-white/80 mb-6">{section.content}</p>

                {section.items && (
                  <ul className="space-y-2 mb-6">
                    {section.items.map((item, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <span className="text-violet-400 mt-1">•</span>
                        <span className="text-white/80">{item}</span>
                      </li>
                    ))}
                  </ul>
                )}

                {section.subsections && section.subsections.map((subsection, i) => (
                  <div key={i} className="mb-6">
                    <h3 className="text-lg font-semibold mb-3">{subsection.subtitle}</h3>
                    <p className="text-white/80">{subsection.content}</p>
                  </div>
                ))}

                {section.additional && (
                  <p className="text-white/80">{section.additional}</p>
                )}
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
                <Shield className="w-6 h-6 text-violet-400" />
                Indemnification
              </h2>
              <p className="text-white/80">
                You agree to defend, indemnify, and hold harmless CodexOS and its licensees 
                and licensors, and their employees, contractors, agents, officers and directors, 
                from and against any and all claims, damages, obligations, losses, liabilities, 
                costs or debt, and expenses (including but not limited to attorney's fees).
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
                <Globe className="w-6 h-6 text-violet-400" />
                Governing Law
              </h2>
              <p className="text-white/80">
                These Terms shall be governed and construed in accordance with the laws of 
                California, United States, without regard to its conflict of law provisions. 
                Our failure to enforce any right or provision of these Terms will not be 
                considered a waiver of those rights.
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
                <ScrollText className="w-6 h-6 text-violet-400" />
                Changes to Terms
              </h2>
              <p className="text-white/80 mb-4">
                We reserve the right, at our sole discretion, to modify or replace these 
                Terms at any time. If a revision is material, we will try to provide at 
                least 30 days notice prior to any new terms taking effect.
              </p>
              <p className="text-white/80">
                By continuing to access or use our Service after those revisions become 
                effective, you agree to be bound by the revised terms.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-20 px-4 bg-white/5">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="max-w-3xl mx-auto"
        >
          <div className="p-8 rounded-2xl border border-white/10 glass-dark text-center">
            <Gavel className="w-12 h-12 text-violet-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-3">Questions About These Terms?</h3>
            <p className="text-muted-foreground mb-6">
              If you have any questions about these Terms of Service, please contact our legal team.
            </p>
            <div className="inline-flex items-center gap-4 px-6 py-3 rounded-xl bg-white/5 border border-white/10">
              <span className="text-white/80">Email:</span>
              <a href="mailto:legal@codexos.dev" className="text-violet-400 hover:text-violet-300 transition-colors">
                legal@codexos.dev
              </a>
            </div>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
