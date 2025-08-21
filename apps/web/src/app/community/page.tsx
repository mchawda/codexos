// SPDX-License-Identifier: LicenseRef-NIA-Proprietary
'use client';

import { motion } from 'framer-motion';
import { 
  Users, 
  MessageSquare, 
  Calendar, 
  Trophy,
  Star,
  Github,
  Twitter,
  Youtube,
  Heart,
  Code2,
  BookOpen,
  Sparkles,
  ArrowRight,
  TrendingUp
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const communityStats = [
  { label: 'Active Members', value: '10,000+', icon: Users },
  { label: 'GitHub Stars', value: '5.2k', icon: Star },
  { label: 'Discord Members', value: '3,500+', icon: MessageSquare },
  { label: 'Contributors', value: '200+', icon: Code2 },
];

const communityChannels = [
  {
    icon: MessageSquare,
    title: 'Discord Server',
    description: 'Join our vibrant Discord community for real-time discussions',
    members: '3,500+',
    action: 'Join Discord',
    link: 'https://discord.gg/codexos',
    color: 'from-indigo-600 to-purple-600',
  },
  {
    icon: Github,
    title: 'GitHub Discussions',
    description: 'Participate in technical discussions and feature requests',
    members: '1,200+',
    action: 'View Discussions',
    link: 'https://github.com/codexos/discussions',
    color: 'from-gray-600 to-gray-800',
  },
  {
    icon: Twitter,
    title: 'Twitter/X',
    description: 'Follow us for updates, tips, and community highlights',
    members: '8,000+',
    action: 'Follow Us',
    link: 'https://twitter.com/codexos',
    color: 'from-blue-400 to-blue-600',
  },
  {
    icon: Youtube,
    title: 'YouTube Channel',
    description: 'Watch tutorials, demos, and community showcases',
    members: '2,500+',
    action: 'Subscribe',
    link: 'https://youtube.com/@codexos',
    color: 'from-red-500 to-red-600',
  },
];

const upcomingEvents = [
  {
    title: 'CodexOS Community Meetup',
    date: 'February 15, 2024',
    time: '2:00 PM PST',
    type: 'Virtual',
    description: 'Monthly community meetup with demos and Q&A',
  },
  {
    title: 'AI Agent Hackathon',
    date: 'March 1-3, 2024',
    time: 'All Weekend',
    type: 'Virtual',
    description: 'Build innovative AI agents and win prizes',
  },
  {
    title: 'Office Hours with Team',
    date: 'Every Thursday',
    time: '3:00 PM PST',
    type: 'Virtual',
    description: 'Get your questions answered by the CodexOS team',
  },
];

const contributors = [
  { name: 'Alex Chen', avatar: '👨‍💻', contributions: 127, role: 'Core' },
  { name: 'Sarah Kim', avatar: '👩‍💻', contributions: 98, role: 'Docs' },
  { name: 'Mike Johnson', avatar: '🧑‍💻', contributions: 76, role: 'Plugins' },
  { name: 'Lisa Wang', avatar: '👩‍🔬', contributions: 65, role: 'AI' },
  { name: 'David Park', avatar: '👨‍🔬', contributions: 54, role: 'Testing' },
  { name: 'Emma Davis', avatar: '👩‍🎨', contributions: 43, role: 'UI/UX' },
];

const communityResources = [
  {
    icon: BookOpen,
    title: 'Community Guidelines',
    description: 'Learn about our community values and code of conduct',
  },
  {
    icon: Sparkles,
    title: 'Showcase Gallery',
    description: 'See amazing projects built by community members',
  },
  {
    icon: Trophy,
    title: 'Recognition Program',
    description: 'Get recognized for your contributions',
  },
  {
    icon: Heart,
    title: 'Community Support',
    description: 'Help and get help from fellow developers',
  },
];

export default function CommunityPage() {
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
            <Users className="w-10 h-10 text-white" />
          </motion.div>
          
          <h1 className="text-5xl md:text-7xl font-bold mb-6 text-gradient">
            Join Our Community
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-12">
            Connect with thousands of developers building the future with AI agents. 
            Share knowledge, get help, and showcase your work.
          </p>
          
          <div className="flex items-center justify-center gap-8">
            {communityStats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="text-center"
              >
                <div className="flex items-center gap-2 mb-1">
                  <stat.icon className="w-5 h-5 text-violet-400" />
                  <p className="text-2xl font-bold">{stat.value}</p>
                </div>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Community Channels */}
      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold mb-4">Join the Conversation</h2>
            <p className="text-xl text-muted-foreground">
              Choose your preferred platform and start connecting
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-6">
            {communityChannels.map((channel, index) => (
              <motion.div
                key={channel.title}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="group cursor-pointer"
              >
                <a href={channel.link} target="_blank" rel="noopener noreferrer">
                  <div className="p-6 rounded-xl border border-white/10 glass-dark hover:border-white/20 transition-all duration-300">
                    <div className="flex items-start justify-between mb-4">
                      <div className={`p-3 rounded-lg bg-gradient-to-r ${channel.color} bg-opacity-20`}>
                        <channel.icon className="w-6 h-6 text-white" />
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {channel.members} members
                      </Badge>
                    </div>
                    
                    <h3 className="text-xl font-semibold mb-2 group-hover:text-violet-400 transition-colors">
                      {channel.title}
                    </h3>
                    <p className="text-muted-foreground mb-4">{channel.description}</p>
                    
                    <div className="flex items-center text-violet-400 group-hover:text-violet-300 transition-colors">
                      <span className="text-sm font-medium">{channel.action}</span>
                      <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </a>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Upcoming Events */}
      <section className="py-20 px-4 bg-white/5">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold mb-4">Upcoming Events</h2>
            <p className="text-xl text-muted-foreground">
              Join us for workshops, meetups, and hackathons
            </p>
          </motion.div>

          <div className="space-y-6">
            {upcomingEvents.map((event, index) => (
              <motion.div
                key={event.title}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="group cursor-pointer"
              >
                <div className="p-6 rounded-xl border border-white/10 glass-dark hover:border-white/20 transition-all duration-300">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-semibold group-hover:text-violet-400 transition-colors">
                          {event.title}
                        </h3>
                        <Badge className="bg-violet-500/20 text-violet-400 border-violet-500/30">
                          {event.type}
                        </Badge>
                      </div>
                      <p className="text-muted-foreground mb-3">{event.description}</p>
                      <div className="flex items-center gap-4 text-sm">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4 text-violet-400" />
                          {event.date}
                        </span>
                        <span className="text-muted-foreground">{event.time}</span>
                      </div>
                    </div>
                    <button className="px-6 py-3 rounded-lg bg-gradient-to-r from-violet-600/20 to-purple-600/20 hover:from-violet-600/30 hover:to-purple-600/30 transition-all duration-300">
                      Register
                    </button>
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
            className="text-center mt-8"
          >
            <button className="px-6 py-3 rounded-lg border border-white/10 hover:bg-white/5 transition-all duration-300">
              View All Events
            </button>
          </motion.div>
        </div>
      </section>

      {/* Top Contributors */}
      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold mb-4">Top Contributors</h2>
            <p className="text-xl text-muted-foreground">
              Recognizing our amazing community members
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {contributors.map((contributor, index) => (
              <motion.div
                key={contributor.name}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="text-center"
              >
                <div className="p-6 rounded-xl border border-white/10 glass-dark hover:border-white/20 transition-all duration-300">
                  <div className="text-4xl mb-3">{contributor.avatar}</div>
                  <h4 className="font-semibold mb-1">{contributor.name}</h4>
                  <p className="text-sm text-violet-400 mb-2">{contributor.role}</p>
                  <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                    <TrendingUp className="w-4 h-4" />
                    <span>{contributor.contributions} contributions</span>
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
            className="text-center mt-8"
          >
            <a
              href="https://github.com/codexos/contributors"
              className="inline-flex items-center gap-2 text-violet-400 hover:text-violet-300 transition-colors"
            >
              View All Contributors
              <ArrowRight className="w-4 h-4" />
            </a>
          </motion.div>
        </div>
      </section>

      {/* Community Resources */}
      <section className="py-20 px-4 bg-white/5">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold mb-4">Community Resources</h2>
            <p className="text-xl text-muted-foreground">
              Everything you need to be an active community member
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-6">
            {communityResources.map((resource, index) => (
              <motion.div
                key={resource.title}
                initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="flex gap-4 p-6 rounded-xl border border-white/10 glass-dark hover:border-white/20 transition-all duration-300"
              >
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-violet-600/20 to-purple-600/20 flex items-center justify-center">
                    <resource.icon className="w-6 h-6 text-violet-400" />
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">{resource.title}</h3>
                  <p className="text-muted-foreground text-sm">{resource.description}</p>
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
              <Heart className="w-16 h-16 text-violet-400 mx-auto mb-6" />
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Ready to Make an Impact?
              </h2>
              <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                Join our community today and help shape the future of AI-powered development.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button className="px-8 py-4 bg-gradient-to-r from-violet-600 to-purple-600 rounded-xl font-semibold hover:shadow-lg hover:shadow-violet-500/25 transition-all duration-300">
                  Join Discord
                </button>
                <button className="px-8 py-4 rounded-xl border border-white/10 hover:bg-white/5 transition-all duration-300">
                  Contribute on GitHub
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
