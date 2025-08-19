'use client';

import { motion } from 'framer-motion';
import { 
  Heart, 
  Users, 
  Target, 
  Rocket,
  Code2,
  Globe,
  Sparkles,
  Award,
  Building,
  MapPin,
  Calendar,
  Zap
} from 'lucide-react';
import Image from 'next/image';

const team = [
  {
    name: 'Sarah Chen',
    role: 'CEO & Co-founder',
    image: '/team/sarah.jpg',
    bio: 'Former ML Engineer at Google. PhD in AI from Stanford.',
  },
  {
    name: 'Alex Rivera',
    role: 'CTO & Co-founder',
    image: '/team/alex.jpg',
    bio: 'Ex-Principal Engineer at Microsoft. Open source contributor.',
  },
  {
    name: 'Maya Patel',
    role: 'Head of Product',
    image: '/team/maya.jpg',
    bio: 'Product leader from Stripe. 10+ years in developer tools.',
  },
  {
    name: 'Jordan Kim',
    role: 'Head of Engineering',
    image: '/team/jordan.jpg',
    bio: 'Former Tech Lead at Meta. Distributed systems expert.',
  },
];

const values = [
  {
    icon: Heart,
    title: 'Developer First',
    description: 'We build for developers because we are developers. Every decision prioritizes developer experience.',
  },
  {
    icon: Users,
    title: 'Community Driven',
    description: 'Our community shapes our product. We listen, learn, and build together.',
  },
  {
    icon: Target,
    title: 'Excellence',
    description: 'We strive for excellence in everything we do, from code quality to customer support.',
  },
  {
    icon: Rocket,
    title: 'Innovation',
    description: 'We push boundaries and challenge the status quo to build the future of development.',
  },
];

const milestones = [
  { year: '2022', event: 'CodexOS founded in San Francisco' },
  { year: '2023', event: 'Raised $5M seed funding' },
  { year: '2023', event: 'Launched beta with 1,000 developers' },
  { year: '2024', event: 'Released v1.0 with enterprise features' },
  { year: '2024', event: '10,000+ active developers' },
];

export default function AboutPage() {
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
            <Code2 className="w-10 h-10 text-white" />
          </motion.div>
          
          <h1 className="text-5xl md:text-7xl font-bold mb-6 text-gradient">
            About CodexOS
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-12">
            We're building the future of software development with autonomous AI agents 
            that enhance human creativity and productivity.
          </p>
        </motion.div>
      </section>

      {/* Mission Section */}
      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl font-bold mb-8">Our Mission</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              To democratize AI-powered development and enable every developer to build 
              software 10x faster with intelligent autonomous agents.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Globe,
                title: '1 Million Developers',
                description: 'Our goal is to empower 1 million developers by 2026',
              },
              {
                icon: Sparkles,
                title: 'AI for Everyone',
                description: 'Making advanced AI accessible to developers of all skill levels',
              },
              {
                icon: Zap,
                title: '10x Productivity',
                description: 'Helping developers ship faster and focus on creativity',
              },
            ].map((item, index) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="text-center"
              >
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-r from-violet-600/20 to-purple-600/20 mb-4">
                  <item.icon className="w-8 h-8 text-violet-400" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                <p className="text-muted-foreground">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 px-4 bg-white/5">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl font-bold mb-8">Our Values</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              The principles that guide everything we do
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8">
            {values.map((value, index) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="flex gap-4 p-6 rounded-xl border border-white/10 glass-dark"
              >
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-violet-600/20 to-purple-600/20 flex items-center justify-center">
                    <value.icon className="w-6 h-6 text-violet-400" />
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">{value.title}</h3>
                  <p className="text-muted-foreground">{value.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl font-bold mb-8">Meet the Team</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Talented individuals passionate about revolutionizing software development
            </p>
          </motion.div>

          <div className="grid md:grid-cols-4 gap-8">
            {team.map((member, index) => (
              <motion.div
                key={member.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="text-center"
              >
                <div className="w-32 h-32 mx-auto mb-4 rounded-full bg-gradient-to-r from-violet-600/20 to-purple-600/20 flex items-center justify-center">
                  <Users className="w-16 h-16 text-violet-400" />
                </div>
                <h3 className="text-lg font-semibold mb-1">{member.name}</h3>
                <p className="text-violet-400 text-sm mb-2">{member.role}</p>
                <p className="text-sm text-muted-foreground">{member.bio}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="py-20 px-4 bg-white/5">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl font-bold mb-8">Our Journey</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              From a bold idea to a platform trusted by thousands
            </p>
          </motion.div>

          <div className="relative">
            <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-px bg-gradient-to-b from-violet-600/50 to-transparent" />
            
            {milestones.map((milestone, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className={`flex items-center mb-12 ${
                  index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'
                }`}
              >
                <div className="flex-1" />
                <div className="relative z-10 w-4 h-4 rounded-full bg-violet-600 ring-4 ring-background" />
                <div className="flex-1 px-8">
                  <div className={`p-4 rounded-lg border border-white/10 glass-dark ${
                    index % 2 === 0 ? 'md:text-right' : ''
                  }`}>
                    <p className="text-violet-400 font-semibold mb-1">{milestone.year}</p>
                    <p className="text-white">{milestone.event}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Office Section */}
      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="grid md:grid-cols-2 gap-12 items-center"
          >
            <div>
              <h2 className="text-3xl font-bold mb-8">Our Office</h2>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-violet-400" />
                  <span>San Francisco, California</span>
                </div>
                <div className="flex items-center gap-3">
                  <Building className="w-5 h-5 text-violet-400" />
                  <span>100+ Team Members</span>
                </div>
                <div className="flex items-center gap-3">
                  <Globe className="w-5 h-5 text-violet-400" />
                  <span>Remote-First Culture</span>
                </div>
              </div>
              <p className="text-muted-foreground mt-6">
                While we have a beautiful office in the heart of San Francisco, 
                we embrace a remote-first culture that allows us to hire the best 
                talent from around the world.
              </p>
            </div>
            <div className="relative h-96 rounded-2xl overflow-hidden border border-white/10">
              <div className="absolute inset-0 bg-gradient-to-br from-violet-600/20 to-purple-600/20 flex items-center justify-center">
                <Building className="w-32 h-32 text-white/20" />
              </div>
            </div>
          </motion.div>
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
              <Award className="w-16 h-16 text-violet-400 mx-auto mb-6" />
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Join Our Mission
              </h2>
              <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                Help us build the future of software development. We're always looking for talented individuals.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button className="px-8 py-4 bg-gradient-to-r from-violet-600 to-purple-600 rounded-xl font-semibold hover:shadow-lg hover:shadow-violet-500/25 transition-all duration-300">
                  View Open Positions
                </button>
                <button className="px-8 py-4 rounded-xl border border-white/10 hover:bg-white/5 transition-all duration-300">
                  Get in Touch
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
