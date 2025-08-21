// SPDX-License-Identifier: LicenseRef-NIA-Proprietary
'use client';

import { motion } from 'framer-motion';
import { 
  Activity, 
  CheckCircle, 
  AlertCircle, 
  XCircle,
  Clock,
  Server,
  Database,
  Globe,
  Shield,
  Zap,
  TrendingUp,
  Calendar,
  RefreshCw
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const services = [
  {
    name: 'API Services',
    status: 'operational',
    uptime: '99.99%',
    responseTime: '45ms',
    icon: Server,
  },
  {
    name: 'Agent Execution',
    status: 'operational',
    uptime: '99.98%',
    responseTime: '120ms',
    icon: Zap,
  },
  {
    name: 'Database',
    status: 'operational',
    uptime: '99.99%',
    responseTime: '15ms',
    icon: Database,
  },
  {
    name: 'RAG Engine',
    status: 'operational',
    uptime: '99.97%',
    responseTime: '85ms',
    icon: Globe,
  },
  {
    name: 'Authentication',
    status: 'operational',
    uptime: '100%',
    responseTime: '35ms',
    icon: Shield,
  },
  {
    name: 'CDN',
    status: 'operational',
    uptime: '100%',
    responseTime: '12ms',
    icon: Globe,
  },
];

const recentIncidents = [
  {
    date: 'January 10, 2024',
    title: 'Elevated API Response Times',
    status: 'resolved',
    duration: '15 minutes',
    description: 'Brief increase in API response times due to traffic spike. Auto-scaling resolved the issue.',
  },
  {
    date: 'December 28, 2023',
    title: 'RAG Engine Maintenance',
    status: 'completed',
    duration: '2 hours',
    description: 'Scheduled maintenance to upgrade vector database. No service disruption.',
  },
  {
    date: 'December 15, 2023',
    title: 'Authentication Service Update',
    status: 'completed',
    duration: '30 minutes',
    description: 'Security patch applied to authentication service. Minimal impact.',
  },
];

const metrics = [
  { label: 'Current Uptime', value: '99.99%', trend: 'stable' },
  { label: 'Average Response', value: '65ms', trend: 'down' },
  { label: 'Error Rate', value: '0.01%', trend: 'stable' },
  { label: 'Active Regions', value: '12', trend: 'up' },
];

const getStatusColor = (status: string) => {
  switch (status) {
    case 'operational':
      return 'text-green-400';
    case 'degraded':
      return 'text-yellow-400';
    case 'outage':
      return 'text-red-400';
    default:
      return 'text-gray-400';
  }
};

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'operational':
      return <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Operational</Badge>;
    case 'degraded':
      return <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">Degraded</Badge>;
    case 'outage':
      return <Badge className="bg-red-500/20 text-red-400 border-red-500/30">Outage</Badge>;
    case 'resolved':
      return <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">Resolved</Badge>;
    case 'completed':
      return <Badge className="bg-violet-500/20 text-violet-400 border-violet-500/30">Completed</Badge>;
    default:
      return null;
  }
};

export default function SystemStatusPage() {
  const allOperational = services.every(s => s.status === 'operational');

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
            <Activity className="w-10 h-10 text-white" />
          </motion.div>
          
          <h1 className="text-5xl md:text-7xl font-bold mb-6 text-gradient">
            System Status
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            Real-time status of CodexOS services and infrastructure
          </p>
          
          {allOperational ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="inline-flex items-center gap-3 px-6 py-3 rounded-xl bg-green-500/20 border border-green-500/30"
            >
              <CheckCircle className="w-6 h-6 text-green-400" />
              <span className="text-lg font-semibold text-green-400">All Systems Operational</span>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="inline-flex items-center gap-3 px-6 py-3 rounded-xl bg-yellow-500/20 border border-yellow-500/30"
            >
              <AlertCircle className="w-6 h-6 text-yellow-400" />
              <span className="text-lg font-semibold text-yellow-400">Some Systems Degraded</span>
            </motion.div>
          )}
        </motion.div>
      </section>

      {/* System Metrics */}
      <section className="py-12 px-4 border-b border-white/10">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {metrics.map((metric, index) => (
              <motion.div
                key={metric.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="text-center"
              >
                <div className="flex items-center justify-center gap-2 mb-1">
                  <p className="text-2xl font-bold">{metric.value}</p>
                  {metric.trend === 'up' && <TrendingUp className="w-4 h-4 text-green-400" />}
                  {metric.trend === 'down' && <TrendingUp className="w-4 h-4 text-green-400 rotate-180" />}
                </div>
                <p className="text-sm text-muted-foreground">{metric.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Service Status */}
      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="mb-12"
          >
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-bold">Service Status</h2>
              <button className="flex items-center gap-2 px-4 py-2 rounded-lg border border-white/10 hover:bg-white/5 transition-all duration-300">
                <RefreshCw className="w-4 h-4" />
                Refresh
              </button>
            </div>
            
            <div className="space-y-4">
              {services.map((service, index) => (
                <motion.div
                  key={service.name}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="p-6 rounded-xl border border-white/10 glass-dark"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="p-3 rounded-lg bg-white/5">
                        <service.icon className="w-6 h-6 text-violet-400" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold mb-1">{service.name}</h3>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>Uptime: {service.uptime}</span>
                          <span>Response: {service.responseTime}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <CheckCircle className={`w-6 h-6 ${getStatusColor(service.status)}`} />
                      {getStatusBadge(service.status)}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Recent Incidents */}
      <section className="py-20 px-4 bg-white/5">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-3xl font-bold mb-8">Recent Incidents</h2>
            
            <div className="space-y-6">
              {recentIncidents.map((incident, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="p-6 rounded-xl border border-white/10 glass-dark"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-lg font-semibold mb-1">{incident.title}</h3>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {incident.date}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          Duration: {incident.duration}
                        </span>
                      </div>
                    </div>
                    {getStatusBadge(incident.status)}
                  </div>
                  <p className="text-muted-foreground">{incident.description}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Uptime History */}
      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-3xl font-bold mb-8">90-Day Uptime History</h2>
            
            <div className="p-8 rounded-xl border border-white/10 glass-dark">
              <div className="grid grid-cols-30 gap-1 mb-6">
                {Array.from({ length: 90 }, (_, i) => (
                  <div
                    key={i}
                    className={`aspect-square rounded-sm ${
                      Math.random() > 0.01 ? 'bg-green-500' : 'bg-yellow-500'
                    } opacity-60 hover:opacity-100 transition-opacity cursor-pointer`}
                    title={`Day ${90 - i}`}
                  />
                ))}
              </div>
              
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">90 days ago</span>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-sm bg-green-500" />
                    <span className="text-muted-foreground">No issues</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-sm bg-yellow-500" />
                    <span className="text-muted-foreground">Minor issues</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-sm bg-red-500" />
                    <span className="text-muted-foreground">Major issues</span>
                  </div>
                </div>
                <span className="text-muted-foreground">Today</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Subscribe Section */}
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
              <AlertCircle className="w-16 h-16 text-violet-400 mx-auto mb-6" />
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Get Status Updates
              </h2>
              <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                Subscribe to receive notifications about system status changes and scheduled maintenance.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 px-4 py-3 rounded-lg bg-white/5 border border-white/10 focus:border-violet-400 focus:outline-none transition-colors"
                />
                <button className="px-8 py-3 bg-gradient-to-r from-violet-600 to-purple-600 rounded-lg font-semibold hover:shadow-lg hover:shadow-violet-500/25 transition-all duration-300">
                  Subscribe
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
