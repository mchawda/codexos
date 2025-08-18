'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Settings, 
  User, 
  Shield,
  CreditCard,
  Bell,
  Globe,
  Key,
  Database,
  Zap,
  Monitor,
  Moon,
  Sun,
  Check,
  AlertCircle,
  ChevronRight,
  Save,
  RefreshCw,
  Download,
  Upload,
  Mail,
  Lock,
  Users,
  Building,
  Trash2
} from 'lucide-react';

interface SettingSection {
  id: string;
  title: string;
  icon: React.ComponentType<any>;
  description: string;
}

export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState('profile');
  const [theme, setTheme] = useState('dark');
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    agentComplete: true,
    marketplaceUpdates: false,
    securityAlerts: true
  });

  const sections: SettingSection[] = [
    {
      id: 'profile',
      title: 'Profile',
      icon: User,
      description: 'Manage your personal information'
    },
    {
      id: 'organization',
      title: 'Organization',
      icon: Building,
      description: 'Organization settings and team management'
    },
    {
      id: 'security',
      title: 'Security',
      icon: Shield,
      description: 'Security settings and authentication'
    },
    {
      id: 'billing',
      title: 'Billing',
      icon: CreditCard,
      description: 'Subscription and payment information'
    },
    {
      id: 'api',
      title: 'API Keys',
      icon: Key,
      description: 'Manage API keys and LLM providers'
    },
    {
      id: 'notifications',
      title: 'Notifications',
      icon: Bell,
      description: 'Email and push notification preferences'
    },
    {
      id: 'integrations',
      title: 'Integrations',
      icon: Zap,
      description: 'Third-party service connections'
    },
    {
      id: 'appearance',
      title: 'Appearance',
      icon: Monitor,
      description: 'Theme and display preferences'
    },
    {
      id: 'data',
      title: 'Data & Privacy',
      icon: Database,
      description: 'Data export and privacy settings'
    }
  ];

  const renderSectionContent = () => {
    switch (activeSection) {
      case 'profile':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Profile Information</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Full Name</label>
                  <input
                    type="text"
                    className="w-full mt-1 px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
                    defaultValue="John Doe"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Email</label>
                  <input
                    type="email"
                    className="w-full mt-1 px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
                    defaultValue="john.doe@company.com"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Role</label>
                  <input
                    type="text"
                    className="w-full mt-1 px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
                    defaultValue="Senior Developer"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Bio</label>
                  <textarea
                    className="w-full mt-1 px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
                    rows={3}
                    defaultValue="Building the future of AI-powered development"
                  />
                </div>
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline">Cancel</Button>
              <Button>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
            </div>
          </div>
        );

      case 'organization':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Organization Details</h3>
              <div className="glass rounded-lg p-6 mb-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold">Acme Corporation</h4>
                    <p className="text-sm text-muted-foreground">Enterprise Plan</p>
                  </div>
                  <Badge>Owner</Badge>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Team Members</h3>
              <div className="space-y-3">
                {['john.doe@company.com', 'jane.smith@company.com', 'mike.wilson@company.com'].map((email) => (
                  <div key={email} className="flex items-center justify-between p-3 bg-background/50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center">
                        {email[0].toUpperCase()}
                      </div>
                      <span className="text-sm">{email}</span>
                    </div>
                    <Badge variant="outline">Admin</Badge>
                  </div>
                ))}
              </div>
              <Button className="mt-4">
                <Users className="h-4 w-4 mr-2" />
                Invite Team Member
              </Button>
            </div>
          </div>
        );

      case 'security':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Security Settings</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 glass rounded-lg">
                  <div>
                    <h4 className="font-medium">Two-Factor Authentication</h4>
                    <p className="text-sm text-muted-foreground">Add an extra layer of security</p>
                  </div>
                  <Button variant="outline" size="sm">
                    Enable
                  </Button>
                </div>
                <div className="flex items-center justify-between p-4 glass rounded-lg">
                  <div>
                    <h4 className="font-medium">Session Timeout</h4>
                    <p className="text-sm text-muted-foreground">Automatically log out after inactivity</p>
                  </div>
                  <select className="px-3 py-1 bg-background border border-border rounded">
                    <option>30 minutes</option>
                    <option>1 hour</option>
                    <option>4 hours</option>
                    <option>Never</option>
                  </select>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
              <div className="space-y-2">
                {[
                  { action: 'Login from Chrome on MacOS', time: '2 hours ago', location: 'San Francisco, CA' },
                  { action: 'API key generated', time: '1 day ago', location: 'API' },
                  { action: 'Password changed', time: '5 days ago', location: 'San Francisco, CA' }
                ].map((activity, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-background/50 rounded-lg">
                    <div>
                      <p className="text-sm font-medium">{activity.action}</p>
                      <p className="text-xs text-muted-foreground">{activity.location}</p>
                    </div>
                    <span className="text-xs text-muted-foreground">{activity.time}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'api':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">LLM Provider Configuration</h3>
              <div className="space-y-4">
                <div className="glass rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium">OpenAI</h4>
                    <Badge className="bg-green-500/10 text-green-500">Connected</Badge>
                  </div>
                  <input
                    type="password"
                    className="w-full px-3 py-2 bg-background/50 border border-border rounded text-sm"
                    defaultValue="sk-proj-••••••••••••••••••••••••"
                  />
                  <div className="flex items-center justify-between mt-3">
                    <span className="text-xs text-muted-foreground">GPT-4, GPT-3.5 Turbo</span>
                    <Button variant="ghost" size="sm">Test Connection</Button>
                  </div>
                </div>
                
                <div className="glass rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium">Anthropic</h4>
                    <Badge variant="outline">Not Connected</Badge>
                  </div>
                  <input
                    type="password"
                    className="w-full px-3 py-2 bg-background/50 border border-border rounded text-sm"
                    placeholder="Enter API key"
                  />
                  <div className="flex items-center justify-between mt-3">
                    <span className="text-xs text-muted-foreground">Claude 3 Opus, Sonnet</span>
                    <Button variant="ghost" size="sm">Connect</Button>
                  </div>
                </div>

                <div className="glass rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium">Ollama (Local)</h4>
                    <Badge className="bg-green-500/10 text-green-500">Connected</Badge>
                  </div>
                  <input
                    type="text"
                    className="w-full px-3 py-2 bg-background/50 border border-border rounded text-sm"
                    defaultValue="http://localhost:11434"
                  />
                  <div className="flex items-center justify-between mt-3">
                    <span className="text-xs text-muted-foreground">Llama 3, Mistral, CodeLlama</span>
                    <Button variant="ghost" size="sm">Configure</Button>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">CodexOS API Keys</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-background/50 rounded-lg">
                  <div>
                    <code className="text-sm">codex_live_abc123xyz789...</code>
                    <p className="text-xs text-muted-foreground">Created 30 days ago • Last used today</p>
                  </div>
                  <Button variant="ghost" size="sm">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <Button className="mt-4">
                <Key className="h-4 w-4 mr-2" />
                Generate New API Key
              </Button>
            </div>
          </div>
        );

      case 'notifications':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Notification Preferences</h3>
              <div className="space-y-4">
                {Object.entries({
                  email: 'Email Notifications',
                  push: 'Push Notifications',
                  agentComplete: 'Agent Completion Alerts',
                  marketplaceUpdates: 'Marketplace Updates',
                  securityAlerts: 'Security Alerts'
                }).map(([key, label]) => (
                  <div key={key} className="flex items-center justify-between p-4 glass rounded-lg">
                    <div>
                      <h4 className="font-medium">{label}</h4>
                      <p className="text-sm text-muted-foreground">
                        {key === 'email' && 'Receive important updates via email'}
                        {key === 'push' && 'Get browser push notifications'}
                        {key === 'agentComplete' && 'Notify when agents finish execution'}
                        {key === 'marketplaceUpdates' && 'New templates and updates'}
                        {key === 'securityAlerts' && 'Critical security notifications'}
                      </p>
                    </div>
                    <button
                      onClick={() => setNotifications({...notifications, [key]: !notifications[key as keyof typeof notifications]})}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        notifications[key as keyof typeof notifications] ? 'bg-violet-600' : 'bg-gray-600'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          notifications[key as keyof typeof notifications] ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'appearance':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Theme</h3>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => setTheme('light')}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    theme === 'light' ? 'border-violet-500 bg-accent' : 'border-border'
                  }`}
                >
                  <Sun className="h-8 w-8 mb-2 mx-auto" />
                  <p className="font-medium">Light</p>
                </button>
                <button
                  onClick={() => setTheme('dark')}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    theme === 'dark' ? 'border-violet-500 bg-accent' : 'border-border'
                  }`}
                >
                  <Moon className="h-8 w-8 mb-2 mx-auto" />
                  <p className="font-medium">Dark</p>
                </button>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Display Options</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">Compact Mode</label>
                  <input type="checkbox" className="rounded" />
                </div>
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">Show Animations</label>
                  <input type="checkbox" className="rounded" defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">High Contrast</label>
                  <input type="checkbox" className="rounded" />
                </div>
              </div>
            </div>
          </div>
        );

      case 'billing':
        return (
          <div className="space-y-6">
            <div className="glass rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold">Current Plan</h3>
                  <p className="text-sm text-muted-foreground">Enterprise</p>
                </div>
                <Badge className="bg-violet-500/10 text-violet-500">Active</Badge>
              </div>
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div>
                  <p className="text-sm text-muted-foreground">Monthly Cost</p>
                  <p className="text-2xl font-bold">$299</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Users</p>
                  <p className="text-2xl font-bold">25/50</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">API Calls</p>
                  <p className="text-2xl font-bold">247K/1M</p>
                </div>
              </div>
              <div className="flex space-x-2">
                <Button variant="outline">Change Plan</Button>
                <Button variant="outline">View Invoice</Button>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Payment Method</h3>
              <div className="glass rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <CreditCard className="h-8 w-8" />
                    <div>
                      <p className="font-medium">•••• •••• •••• 4242</p>
                      <p className="text-sm text-muted-foreground">Expires 12/25</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">Update</Button>
                </div>
              </div>
            </div>
          </div>
        );

      case 'data':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Data Management</h3>
              <div className="space-y-4">
                <div className="glass rounded-lg p-4">
                  <h4 className="font-medium mb-2">Export Your Data</h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    Download all your agents, templates, and execution history
                  </p>
                  <Button>
                    <Download className="h-4 w-4 mr-2" />
                    Export Data
                  </Button>
                </div>
                
                <div className="glass rounded-lg p-4">
                  <h4 className="font-medium mb-2">Delete Account</h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    Permanently delete your account and all associated data
                  </p>
                  <Button variant="destructive">
                    Delete Account
                  </Button>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Privacy Settings</h3>
              <div className="space-y-3">
                <label className="flex items-center space-x-3">
                  <input type="checkbox" className="rounded" defaultChecked />
                  <span className="text-sm">Allow usage analytics</span>
                </label>
                <label className="flex items-center space-x-3">
                  <input type="checkbox" className="rounded" defaultChecked />
                  <span className="text-sm">Share crash reports</span>
                </label>
                <label className="flex items-center space-x-3">
                  <input type="checkbox" className="rounded" />
                  <span className="text-sm">Participate in beta features</span>
                </label>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="flex-1 flex">
      {/* Sidebar */}
      <div className="w-64 border-r border-border p-4">
        <h2 className="text-2xl font-bold mb-6">Settings</h2>
        <nav className="space-y-1">
          {sections.map((section) => {
            const Icon = section.icon;
            return (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                  activeSection === section.id
                    ? 'bg-accent text-accent-foreground'
                    : 'hover:bg-accent hover:text-accent-foreground'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span className="font-medium">{section.title}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Content */}
      <div className="flex-1 p-8">
        <div className="max-w-4xl">
          {renderSectionContent()}
        </div>
      </div>
    </div>
  );
}
