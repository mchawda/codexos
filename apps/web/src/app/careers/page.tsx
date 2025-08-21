// SPDX-License-Identifier: LicenseRef-NIA-Proprietary
'use client';

import { motion } from 'framer-motion';
import { 
  Briefcase, 
  MapPin, 
  Clock, 
  DollarSign,
  Heart,
  Zap,
  Shield,
  Users,
  Coffee,
  Laptop,
  Plane,
  GraduationCap,
  ArrowRight,
  Building
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const openPositions = [
  {
    id: 1,
    title: 'Senior Backend Engineer',
    department: 'Engineering',
    location: 'San Francisco / Remote',
    type: 'Full-time',
    salary: '$150k - $200k',
    description: 'Build scalable backend systems for our autonomous agent platform.',
    requirements: [
      '5+ years of experience with Python/Go',
      'Experience with distributed systems',
      'Strong understanding of AI/ML concepts',
    ],
  },
  {
    id: 2,
    title: 'Product Designer',
    department: 'Design',
    location: 'Remote',
    type: 'Full-time',
    salary: '$120k - $160k',
    description: 'Design intuitive interfaces for complex AI workflows.',
    requirements: [
      '3+ years of product design experience',
      'Strong portfolio with developer tools',
      'Experience with design systems',
    ],
  },
  {
    id: 3,
    title: 'AI/ML Engineer',
    department: 'AI Research',
    location: 'San Francisco',
    type: 'Full-time',
    salary: '$180k - $250k',
    description: 'Research and implement cutting-edge AI models for agent capabilities.',
    requirements: [
      'PhD or equivalent experience in ML',
      'Published research in NLP/LLMs',
      'Production ML experience',
    ],
  },
  {
    id: 4,
    title: 'Developer Advocate',
    department: 'Developer Relations',
    location: 'Remote',
    type: 'Full-time',
    salary: '$130k - $170k',
    description: 'Help developers succeed with CodexOS through content and community.',
    requirements: [
      'Software development background',
      'Excellent communication skills',
      'Experience with technical content',
    ],
  },
  {
    id: 5,
    title: 'Site Reliability Engineer',
    department: 'Infrastructure',
    location: 'San Francisco / Remote',
    type: 'Full-time',
    salary: '$160k - $210k',
    description: 'Ensure our platform runs reliably at scale.',
    requirements: [
      'Experience with Kubernetes and cloud platforms',
      'Strong automation and monitoring skills',
      'Incident response experience',
    ],
  },
];

const benefits = [
  {
    icon: Heart,
    title: 'Health & Wellness',
    description: 'Comprehensive health, dental, and vision coverage for you and your family',
  },
  {
    icon: DollarSign,
    title: 'Competitive Equity',
    description: 'Meaningful equity stake in a fast-growing startup',
  },
  {
    icon: Plane,
    title: 'Unlimited PTO',
    description: 'Take the time you need to recharge and stay productive',
  },
  {
    icon: Laptop,
    title: 'Top Equipment',
    description: '$5,000 budget for your ideal work setup',
  },
  {
    icon: GraduationCap,
    title: 'Learning Budget',
    description: '$2,000 annual budget for courses, conferences, and books',
  },
  {
    icon: Coffee,
    title: 'Team Retreats',
    description: 'Quarterly in-person gatherings in amazing locations',
  },
];

const values = [
  {
    icon: Zap,
    title: 'Move Fast',
    description: 'We ship quickly and iterate based on feedback',
  },
  {
    icon: Users,
    title: 'User Obsessed',
    description: 'Every decision starts with our users in mind',
  },
  {
    icon: Shield,
    title: 'High Standards',
    description: 'We hold ourselves to exceptional quality',
  },
  {
    icon: Heart,
    title: 'Empathy First',
    description: 'We care deeply about our team and users',
  },
];

export default function CareersPage() {
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
            <Briefcase className="w-10 h-10 text-white" />
          </motion.div>
          
          <h1 className="text-5xl md:text-7xl font-bold mb-6 text-gradient">
            Join Our Team
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-12">
            Help us build the future of software development. We're looking for 
            talented, passionate people who want to make a real impact.
          </p>
          
          <div className="flex items-center justify-center gap-8">
            <div className="flex items-center gap-2">
              <Building className="w-5 h-5 text-violet-400" />
              <span className="text-muted-foreground">100+ Team Members</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-violet-400" />
              <span className="text-muted-foreground">Remote-First</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-violet-400" />
              <span className="text-muted-foreground">30+ Countries</span>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Why Join Us */}
      <section className="py-20 px-4 bg-white/5">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl font-bold mb-8">Why CodexOS?</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Join a team that's pushing the boundaries of what's possible with AI and development tools.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-4 gap-6">
            {values.map((value, index) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="text-center"
              >
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-r from-violet-600/20 to-purple-600/20 mb-4">
                  <value.icon className="w-8 h-8 text-violet-400" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{value.title}</h3>
                <p className="text-muted-foreground text-sm">{value.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Open Positions */}
      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl font-bold mb-8">Open Positions</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Find your next role and help shape the future of AI-powered development.
            </p>
          </motion.div>

          <div className="space-y-6">
            {openPositions.map((position, index) => (
              <motion.div
                key={position.id}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="group cursor-pointer"
              >
                <div className="p-6 rounded-xl border border-white/10 glass-dark hover:border-white/20 transition-all duration-300">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold mb-2 group-hover:text-violet-400 transition-colors">
                        {position.title}
                      </h3>
                      <p className="text-muted-foreground mb-3">{position.description}</p>
                      <div className="flex flex-wrap gap-3">
                        <Badge variant="outline" className="text-xs">
                          <MapPin className="w-3 h-3 mr-1" />
                          {position.location}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          <Clock className="w-3 h-3 mr-1" />
                          {position.type}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          <DollarSign className="w-3 h-3 mr-1" />
                          {position.salary}
                        </Badge>
                        <Badge className="bg-violet-500/20 text-violet-400 border-violet-500/30 text-xs">
                          {position.department}
                        </Badge>
                      </div>
                    </div>
                    <ArrowRight className="w-5 h-5 text-violet-400 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mt-12"
          >
            <p className="text-muted-foreground">
              Don't see a perfect fit? Send us your resume at{' '}
              <a href="mailto:careers@codexos.dev" className="text-violet-400 hover:text-violet-300 transition-colors">
                careers@codexos.dev
              </a>
            </p>
          </motion.div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-20 px-4 bg-white/5">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl font-bold mb-8">Benefits & Perks</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              We take care of our team so they can focus on building amazing products.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {benefits.map((benefit, index) => (
              <motion.div
                key={benefit.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="text-center"
              >
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-r from-violet-600/20 to-purple-600/20 mb-4">
                  <benefit.icon className="w-8 h-8 text-violet-400" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{benefit.title}</h3>
                <p className="text-muted-foreground text-sm">{benefit.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Hiring Process */}
      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl font-bold mb-8">Our Hiring Process</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              We've designed our process to be thorough yet respectful of your time.
            </p>
          </motion.div>

          <div className="relative">
            <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-px bg-gradient-to-b from-violet-600/50 to-transparent" />
            
            {[
              { step: 1, title: 'Application Review', time: '1-2 days', desc: 'We review every application carefully' },
              { step: 2, title: 'Initial Call', time: '30 min', desc: 'Quick chat about your experience and goals' },
              { step: 3, title: 'Technical Interview', time: '1 hour', desc: 'Deep dive into your technical skills' },
              { step: 4, title: 'Team Interviews', time: '2-3 hours', desc: 'Meet potential teammates and leaders' },
              { step: 5, title: 'Offer', time: '1-2 days', desc: 'Competitive offer with all the details' },
            ].map((item, index) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className={`flex items-center mb-8 ${
                  index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'
                }`}
              >
                <div className="flex-1" />
                <div className="relative z-10 w-12 h-12 rounded-full bg-violet-600 text-white flex items-center justify-center font-bold">
                  {item.step}
                </div>
                <div className="flex-1 px-8">
                  <div className={`p-4 rounded-lg border border-white/10 glass-dark ${
                    index % 2 === 0 ? 'md:text-right' : ''
                  }`}>
                    <h4 className="font-semibold mb-1">{item.title}</h4>
                    <p className="text-sm text-violet-400 mb-1">{item.time}</p>
                    <p className="text-sm text-muted-foreground">{item.desc}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
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
              <Users className="w-16 h-16 text-violet-400 mx-auto mb-6" />
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Ready to Join Us?
              </h2>
              <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                Take the first step towards an exciting career at CodexOS.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button className="px-8 py-4 bg-gradient-to-r from-violet-600 to-purple-600 rounded-xl font-semibold hover:shadow-lg hover:shadow-violet-500/25 transition-all duration-300">
                  View All Openings
                </button>
                <button className="px-8 py-4 rounded-xl border border-white/10 hover:bg-white/5 transition-all duration-300">
                  Learn About Culture
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
