'use client';

import { motion } from 'framer-motion';
import { 
  Shield, 
  Lock, 
  Key, 
  FileCheck,
  AlertTriangle,
  CheckCircle,
  Database,
  Globe,
  Users,
  Fingerprint,
  Eye,
  Server,
  Zap,
  Award
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const securityFeatures = [
  {
    icon: Lock,
    title: 'End-to-End Encryption',
    description: 'All data is encrypted in transit and at rest using AES-256-GCM',
    details: [
      'TLS 1.3 for all connections',
      'Encrypted database storage',
      'Secure key management',
    ],
  },
  {
    icon: Users,
    title: 'Access Control',
    description: 'Fine-grained permissions and role-based access control',
    details: [
      'Multi-factor authentication',
      'SSO integration (SAML, OAuth)',
      'Role-based permissions',
    ],
  },
  {
    icon: Database,
    title: 'Data Protection',
    description: 'Comprehensive data protection and privacy measures',
    details: [
      'Data isolation per tenant',
      'Automated backups',
      'GDPR compliant',
    ],
  },
  {
    icon: Eye,
    title: 'Audit & Monitoring',
    description: 'Complete visibility into system access and changes',
    details: [
      'Comprehensive audit logs',
      'Real-time monitoring',
      'Anomaly detection',
    ],
  },
];

const certifications = [
  {
    name: 'SOC 2 Type II',
    description: 'Annual compliance audit for security, availability, and confidentiality',
    icon: Award,
    status: 'Certified',
  },
  {
    name: 'ISO 27001',
    description: 'International standard for information security management',
    icon: FileCheck,
    status: 'Certified',
  },
  {
    name: 'GDPR Compliant',
    description: 'Full compliance with EU data protection regulations',
    icon: Globe,
    status: 'Compliant',
  },
  {
    name: 'HIPAA Ready',
    description: 'Healthcare data protection standards',
    icon: Shield,
    status: 'Available',
  },
];

const securityPractices = [
  {
    category: 'Application Security',
    practices: [
      'Regular security audits and penetration testing',
      'Dependency scanning and updates',
      'Static and dynamic code analysis',
      'Security headers and CSP implementation',
    ],
  },
  {
    category: 'Infrastructure Security',
    practices: [
      'Network isolation and segmentation',
      'DDoS protection and rate limiting',
      'Regular security patches',
      'Intrusion detection systems',
    ],
  },
  {
    category: 'Operational Security',
    practices: [
      'Security training for all employees',
      'Incident response procedures',
      '24/7 security monitoring',
      'Regular disaster recovery drills',
    ],
  },
];

export default function SecurityPage() {
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
            <Shield className="w-10 h-10 text-white" />
          </motion.div>
          
          <h1 className="text-5xl md:text-7xl font-bold mb-6 text-gradient">
            Security at CodexOS
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-12">
            Your data security is our top priority. We implement industry-leading security 
            measures to protect your code, data, and AI agents.
          </p>
          
          <div className="flex items-center justify-center gap-8">
            <Badge className="px-4 py-2 text-sm">
              <Lock className="w-4 h-4 mr-2" />
              Bank-Level Encryption
            </Badge>
            <Badge className="px-4 py-2 text-sm">
              <FileCheck className="w-4 h-4 mr-2" />
              SOC 2 Certified
            </Badge>
            <Badge className="px-4 py-2 text-sm">
              <Globe className="w-4 h-4 mr-2" />
              GDPR Compliant
            </Badge>
          </div>
        </motion.div>
      </section>

      {/* Security Features */}
      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl font-bold mb-8">Enterprise-Grade Security</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Multiple layers of security to protect your most sensitive data
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8">
            {securityFeatures.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <div className="p-8 rounded-2xl border border-white/10 glass-dark h-full">
                  <div className="flex items-start gap-4 mb-6">
                    <div className="p-3 rounded-lg bg-gradient-to-r from-violet-600/20 to-purple-600/20">
                      <feature.icon className="w-6 h-6 text-violet-400" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                      <p className="text-muted-foreground">{feature.description}</p>
                    </div>
                  </div>
                  
                  <ul className="space-y-3">
                    {feature.details.map((detail, i) => (
                      <li key={i} className="flex items-center gap-3">
                        <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                        <span className="text-sm text-white/80">{detail}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Certifications */}
      <section className="py-20 px-4 bg-white/5">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl font-bold mb-8">Compliance & Certifications</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Meeting and exceeding industry standards for security and compliance
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {certifications.map((cert, index) => (
              <motion.div
                key={cert.name}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="text-center"
              >
                <div className="p-6 rounded-xl border border-white/10 glass-dark hover:border-white/20 transition-all duration-300 h-full">
                  <cert.icon className="w-12 h-12 text-violet-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">{cert.name}</h3>
                  <p className="text-sm text-muted-foreground mb-3">{cert.description}</p>
                  <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                    {cert.status}
                  </Badge>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Security Practices */}
      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl font-bold mb-8">Security Best Practices</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Comprehensive security measures across all aspects of our platform
            </p>
          </motion.div>

          <div className="space-y-8">
            {securityPractices.map((section, index) => (
              <motion.div
                key={section.category}
                initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="p-6 rounded-xl border border-white/10 glass-dark"
              >
                <h3 className="text-xl font-semibold mb-4 flex items-center gap-3">
                  <Zap className="w-5 h-5 text-violet-400" />
                  {section.category}
                </h3>
                <ul className="grid md:grid-cols-2 gap-3">
                  {section.practices.map((practice, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                      <span className="text-white/80">{practice}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Vulnerability Reporting */}
      <section className="py-20 px-4 bg-white/5">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <div className="text-center mb-12">
              <AlertTriangle className="w-16 h-16 text-yellow-400 mx-auto mb-6" />
              <h2 className="text-3xl font-bold mb-4">Responsible Disclosure</h2>
              <p className="text-xl text-muted-foreground">
                Help us keep CodexOS secure by reporting vulnerabilities
              </p>
            </div>

            <div className="p-8 rounded-2xl border border-white/10 glass-dark">
              <h3 className="text-xl font-semibold mb-4">How to Report</h3>
              <p className="text-muted-foreground mb-6">
                We appreciate the security community's efforts in helping keep CodexOS safe. 
                If you discover a vulnerability, please follow our responsible disclosure process:
              </p>
              
              <ol className="space-y-4 mb-8">
                <li className="flex items-start gap-3">
                  <span className="text-violet-400 font-semibold">1.</span>
                  <span>Email security@codexos.dev with details of the vulnerability</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-violet-400 font-semibold">2.</span>
                  <span>Include steps to reproduce and potential impact</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-violet-400 font-semibold">3.</span>
                  <span>Allow us 90 days to address the issue before public disclosure</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-violet-400 font-semibold">4.</span>
                  <span>We'll acknowledge receipt within 48 hours</span>
                </li>
              </ol>
              
              <div className="p-4 rounded-lg bg-violet-600/10 border border-violet-600/20">
                <p className="text-sm">
                  <strong>Note:</strong> We offer a bug bounty program for qualifying vulnerabilities. 
                  Rewards range from $100 to $10,000 based on severity and impact.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Trust Center CTA */}
      <section className="py-20 px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl mx-auto"
        >
          <div className="relative overflow-hidden rounded-3xl p-12 glass-dark border border-white/10">
            <div className="absolute inset-0 gradient-mesh opacity-20" />
            
            <div className="relative z-10 text-center">
              <Key className="w-16 h-16 text-violet-400 mx-auto mb-6" />
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Security Questions?
              </h2>
              <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                Learn more about our security practices or request our security documentation.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button className="px-8 py-4 bg-gradient-to-r from-violet-600 to-purple-600 rounded-xl font-semibold hover:shadow-lg hover:shadow-violet-500/25 transition-all duration-300">
                  Visit Trust Center
                </button>
                <button className="px-8 py-4 rounded-xl border border-white/10 hover:bg-white/5 transition-all duration-300">
                  Contact Security Team
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
