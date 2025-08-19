'use client';

import { motion } from 'framer-motion';
import { 
  Mail, 
  MessageSquare, 
  Phone, 
  MapPin,
  Clock,
  Send,
  Twitter,
  Linkedin,
  Github,
  HelpCircle,
  Briefcase,
  Bug
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const contactMethods = [
  {
    icon: Mail,
    title: 'Email Us',
    description: 'Get in touch with our team',
    contact: 'hello@codexos.dev',
    link: 'mailto:hello@codexos.dev',
  },
  {
    icon: MessageSquare,
    title: 'Live Chat',
    description: 'Chat with our support team',
    contact: 'Available 9am-6pm PST',
    action: 'Start Chat',
  },
  {
    icon: Phone,
    title: 'Schedule a Call',
    description: 'Book a demo or consultation',
    contact: '30-minute sessions',
    action: 'Book Now',
  },
];

const departments = [
  {
    title: 'Sales',
    email: 'sales@codexos.dev',
    description: 'Enterprise plans and pricing',
    icon: Briefcase,
  },
  {
    title: 'Support',
    email: 'support@codexos.dev',
    description: 'Technical help and guidance',
    icon: HelpCircle,
  },
  {
    title: 'Security',
    email: 'security@codexos.dev',
    description: 'Report vulnerabilities',
    icon: Bug,
  },
];

export default function ContactPage() {
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
            <MessageSquare className="w-10 h-10 text-white" />
          </motion.div>
          
          <h1 className="text-5xl md:text-7xl font-bold mb-6 text-gradient">
            Get in Touch
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Have a question, need support, or want to explore how CodexOS can help your team? 
            We're here to help.
          </p>
        </motion.div>
      </section>

      {/* Contact Methods */}
      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            {contactMethods.map((method, index) => (
              <motion.div
                key={method.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="text-center"
              >
                <div className="p-8 rounded-2xl border border-white/10 glass-dark hover:border-white/20 transition-all duration-300 h-full">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-r from-violet-600/20 to-purple-600/20 mb-6">
                    <method.icon className="w-8 h-8 text-violet-400" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{method.title}</h3>
                  <p className="text-muted-foreground mb-4">{method.description}</p>
                  <p className="font-medium mb-4">{method.contact}</p>
                  {method.link ? (
                    <a
                      href={method.link}
                      className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-gradient-to-r from-violet-600 to-purple-600 font-semibold hover:shadow-lg hover:shadow-violet-500/25 transition-all duration-300"
                    >
                      Contact Now
                    </a>
                  ) : (
                    <button className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-gradient-to-r from-violet-600 to-purple-600 font-semibold hover:shadow-lg hover:shadow-violet-500/25 transition-all duration-300">
                      {method.action}
                    </button>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form */}
      <section className="py-20 px-4">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-3xl font-bold mb-8 text-center">Send Us a Message</h2>
            
            <form className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-2">First Name</label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 focus:border-violet-400 focus:outline-none transition-colors"
                    placeholder="John"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Last Name</label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 focus:border-violet-400 focus:outline-none transition-colors"
                    placeholder="Doe"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Email</label>
                <input
                  type="email"
                  className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 focus:border-violet-400 focus:outline-none transition-colors"
                  placeholder="john@company.com"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Company</label>
                <input
                  type="text"
                  className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 focus:border-violet-400 focus:outline-none transition-colors"
                  placeholder="Acme Corp"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Subject</label>
                <select className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 focus:border-violet-400 focus:outline-none transition-colors">
                  <option value="">Select a topic</option>
                  <option value="sales">Sales Inquiry</option>
                  <option value="support">Technical Support</option>
                  <option value="partnership">Partnership</option>
                  <option value="other">Other</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Message</label>
                <textarea
                  rows={6}
                  className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 focus:border-violet-400 focus:outline-none transition-colors resize-none"
                  placeholder="Tell us how we can help..."
                />
              </div>
              
              <button
                type="submit"
                className="w-full py-4 rounded-lg bg-gradient-to-r from-violet-600 to-purple-600 font-semibold hover:shadow-lg hover:shadow-violet-500/25 transition-all duration-300 flex items-center justify-center gap-2"
              >
                <Send className="w-5 h-5" />
                Send Message
              </button>
            </form>
          </motion.div>
        </div>
      </section>

      {/* Department Contacts */}
      <section className="py-20 px-4 bg-white/5">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold mb-4">Department Contacts</h2>
            <p className="text-xl text-muted-foreground">
              Reach the right team directly
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {departments.map((dept, index) => (
              <motion.div
                key={dept.title}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="p-6 rounded-xl border border-white/10 glass-dark hover:border-white/20 transition-all duration-300"
              >
                <dept.icon className="w-8 h-8 text-violet-400 mb-4" />
                <h3 className="text-lg font-semibold mb-2">{dept.title}</h3>
                <p className="text-sm text-muted-foreground mb-3">{dept.description}</p>
                <a
                  href={`mailto:${dept.email}`}
                  className="text-violet-400 hover:text-violet-300 transition-colors text-sm"
                >
                  {dept.email}
                </a>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Office Info */}
      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-3xl font-bold mb-8">Visit Our Office</h2>
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <MapPin className="w-5 h-5 text-violet-400 mt-1" />
                  <div>
                    <h4 className="font-semibold mb-1">Headquarters</h4>
                    <p className="text-muted-foreground">
                      123 AI Street, Suite 400<br />
                      San Francisco, CA 94105<br />
                      United States
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <Clock className="w-5 h-5 text-violet-400 mt-1" />
                  <div>
                    <h4 className="font-semibold mb-1">Office Hours</h4>
                    <p className="text-muted-foreground">
                      Monday - Friday: 9:00 AM - 6:00 PM PST<br />
                      Saturday - Sunday: Closed
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="mt-8">
                <h4 className="font-semibold mb-4">Connect on Social</h4>
                <div className="flex gap-4">
                  <a
                    href="https://twitter.com/codexos"
                    className="w-10 h-10 rounded-lg border border-white/10 hover:border-white/20 flex items-center justify-center transition-all duration-300 hover:bg-white/5"
                  >
                    <Twitter className="w-5 h-5 text-white/60" />
                  </a>
                  <a
                    href="https://linkedin.com/company/codexos"
                    className="w-10 h-10 rounded-lg border border-white/10 hover:border-white/20 flex items-center justify-center transition-all duration-300 hover:bg-white/5"
                  >
                    <Linkedin className="w-5 h-5 text-white/60" />
                  </a>
                  <a
                    href="https://github.com/codexos"
                    className="w-10 h-10 rounded-lg border border-white/10 hover:border-white/20 flex items-center justify-center transition-all duration-300 hover:bg-white/5"
                  >
                    <Github className="w-5 h-5 text-white/60" />
                  </a>
                </div>
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="relative h-96 rounded-2xl overflow-hidden border border-white/10"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-violet-600/10 to-purple-600/10" />
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3153.0977551707394!2d-122.39320668468184!3d37.78779817975622!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8085807f3e3a3b3b%3A0x3b3b3b3b3b3b3b3b!2sSan%20Francisco%2C%20CA!5e0!3m2!1sen!2sus!4v1234567890"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="opacity-80"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* FAQ Link */}
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
              <HelpCircle className="w-16 h-16 text-violet-400 mx-auto mb-6" />
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Have Questions?
              </h2>
              <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                Check out our FAQ for quick answers to common questions.
              </p>
              <button className="px-8 py-4 bg-gradient-to-r from-violet-600 to-purple-600 rounded-xl font-semibold hover:shadow-lg hover:shadow-violet-500/25 transition-all duration-300">
                Visit Help Center
              </button>
            </div>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
