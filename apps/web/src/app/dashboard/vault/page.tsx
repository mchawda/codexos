'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Shield, 
  Key, 
  Lock,
  Unlock,
  Plus,
  Search,
  Copy,
  Eye,
  EyeOff,
  Edit,
  Trash2,
  Download,
  Upload,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Database,
  FileKey,
  Globe,
  Server
} from 'lucide-react';

interface VaultItem {
  id: string;
  name: string;
  type: 'api_key' | 'password' | 'certificate' | 'token' | 'ssh_key';
  category: string;
  lastUsed: string;
  lastModified: string;
  environment: 'development' | 'staging' | 'production';
  accessCount: number;
  tags: string[];
  status: 'active' | 'expiring' | 'expired';
}

export default function VaultPage() {
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItem, setEditingItem] = useState<VaultItem | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [vaultItems, setVaultItems] = useState<VaultItem[]>([
    {
      id: '1',
      name: 'OpenAI Production API Key',
      type: 'api_key',
      category: 'LLM Provider',
      lastUsed: '5 minutes ago',
      lastModified: '2 days ago',
      environment: 'production',
      accessCount: 1247,
      tags: ['openai', 'gpt-4', 'production'],
      status: 'active'
    },
    {
      id: '2',
      name: 'AWS S3 Access Token',
      type: 'token',
      category: 'Cloud Storage',
      lastUsed: '1 hour ago',
      lastModified: '1 week ago',
      environment: 'production',
      accessCount: 892,
      tags: ['aws', 's3', 'storage'],
      status: 'expiring'
    },
    {
      id: '3',
      name: 'PostgreSQL Database Password',
      type: 'password',
      category: 'Database',
      lastUsed: '10 minutes ago',
      lastModified: '1 month ago',
      environment: 'development',
      accessCount: 3456,
      tags: ['database', 'postgres', 'dev'],
      status: 'active'
    },
    {
      id: '4',
      name: 'GitHub Deploy Key',
      type: 'ssh_key',
      category: 'Version Control',
      lastUsed: '2 hours ago',
      lastModified: '3 months ago',
      environment: 'production',
      accessCount: 234,
      tags: ['github', 'deployment', 'ci/cd'],
      status: 'active'
    },
    {
      id: '5',
      name: 'SSL Certificate - api.codexos.dev',
      type: 'certificate',
      category: 'Security',
      lastUsed: 'Active',
      lastModified: '2 months ago',
      environment: 'production',
      accessCount: 0,
      tags: ['ssl', 'tls', 'api'],
      status: 'expired'
    }
  ]);

  const [showValues, setShowValues] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'api_key':
        return <Key className="w-4 h-4" />;
      case 'password':
        return <Lock className="w-4 h-4" />;
      case 'certificate':
        return <FileKey className="w-4 h-4" />;
      case 'token':
        return <Globe className="w-4 h-4" />;
      case 'ssh_key':
        return <Server className="w-4 h-4" />;
      default:
        return <Key className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'text-green-500';
      case 'expiring':
        return 'text-yellow-500';
      case 'expired':
        return 'text-red-500';
      default:
        return '';
    }
  };

  const getEnvironmentColor = (env: string) => {
    switch (env) {
      case 'production':
        return 'bg-red-500/10 text-red-500 border-red-500/20';
      case 'staging':
        return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
      case 'development':
        return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      default:
        return '';
    }
  };

  const toggleShowValue = (id: string) => {
    const newSet = new Set(showValues);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setShowValues(newSet);
  };

  const filteredItems = vaultItems.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this credential?')) {
      setVaultItems(vaultItems.filter(item => item.id !== id));
    }
  };

  const handleCopy = (id: string) => {
    // In a real app, you would copy the actual credential value
    navigator.clipboard.writeText('sk-proj-abc123xyz789...');
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDownload = (item: VaultItem) => {
    // Create a JSON file with the credential data
    const dataStr = JSON.stringify({
      name: item.name,
      type: item.type,
      category: item.category,
      environment: item.environment,
      value: 'sk-proj-abc123xyz789...' // In real app, use actual value
    }, null, 2);
    
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${item.name.replace(/\s+/g, '-').toLowerCase()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Vault</h2>
          <p className="text-muted-foreground">
            Secure credential management with enterprise-grade encryption
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button 
            variant="outline"
            onClick={() => {
              // Create a file input element
              const input = document.createElement('input');
              input.type = 'file';
              input.accept = '.json,.csv';
              input.onchange = (e) => {
                const file = (e.target as HTMLInputElement).files?.[0];
                if (file) {
                  alert(`Importing credentials from ${file.name}...\n\nIn a real app, this would parse and import your credentials.`);
                }
              };
              input.click();
            }}
          >
            <Upload className="mr-2 h-4 w-4" />
            Import
          </Button>
          <Button onClick={() => setShowAddModal(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Credential
          </Button>
        </div>
      </div>

      {/* Security Status */}
      <div className="glass-dark rounded-lg p-6 border border-green-500/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-3 rounded-full bg-green-500/10">
              <Shield className="h-6 w-6 text-green-500" />
            </div>
            <div>
              <h3 className="font-semibold">Vault Security Status</h3>
              <p className="text-sm text-muted-foreground">
                All credentials are encrypted with AES-256-GCM
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="text-sm font-medium">Last Audit</p>
              <p className="text-xs text-muted-foreground">2 hours ago</p>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => {
                alert('Security audit started! This would check for:\n\n• Expired credentials\n• Weak passwords\n• Unused credentials\n• Access anomalies\n• Compliance violations');
              }}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Run Audit
            </Button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="glass-dark rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Total Credentials
              </p>
              <p className="text-2xl font-bold">{vaultItems.length}</p>
            </div>
            <Database className="h-8 w-8 text-muted-foreground/20" />
          </div>
        </div>
        <div className="glass-dark rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Active
              </p>
              <p className="text-2xl font-bold">
                {vaultItems.filter(i => i.status === 'active').length}
              </p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-500/20" />
          </div>
        </div>
        <div className="glass-dark rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Expiring Soon
              </p>
              <p className="text-2xl font-bold">
                {vaultItems.filter(i => i.status === 'expiring').length}
              </p>
            </div>
            <AlertTriangle className="h-8 w-8 text-yellow-500/20" />
          </div>
        </div>
        <div className="glass-dark rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Total Accesses
              </p>
              <p className="text-2xl font-bold">
                {vaultItems.reduce((acc, i) => acc + i.accessCount, 0).toLocaleString()}
              </p>
            </div>
            <Unlock className="h-8 w-8 text-muted-foreground/20" />
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="glass-dark rounded-lg p-4">
        <div className="flex items-center space-x-2">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search credentials by name, category, or tags..."
            className="flex-1 bg-transparent border-none outline-none text-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Credentials List */}
      <div className="space-y-4">
        {filteredItems.map((item) => (
          <div
            key={item.id}
            className="glass-dark rounded-lg p-6 hover:bg-accent/5 transition-all duration-300"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-4">
                <div className="p-3 rounded-lg bg-accent/20">
                  {getTypeIcon(item.type)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-3">
                    <h4 className="font-semibold">{item.name}</h4>
                    <Badge 
                      variant="outline" 
                      className={`text-xs ${getEnvironmentColor(item.environment)}`}
                    >
                      {item.environment}
                    </Badge>
                    <span className={`text-xs font-medium ${getStatusColor(item.status)}`}>
                      {item.status === 'active' && '● Active'}
                      {item.status === 'expiring' && '● Expiring Soon'}
                      {item.status === 'expired' && '● Expired'}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">{item.category}</p>
                  
                  {/* Credential Value Display */}
                  <div className="flex items-center space-x-2 mt-3">
                    <code className="px-3 py-1 bg-background/50 rounded text-xs font-mono">
                      {showValues.has(item.id) 
                        ? 'sk-proj-abc123xyz789...' 
                        : '••••••••••••••••'}
                    </code>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => toggleShowValue(item.id)}
                    >
                      {showValues.has(item.id) ? (
                        <EyeOff className="h-3 w-3" />
                      ) : (
                        <Eye className="h-3 w-3" />
                      )}
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-7 w-7"
                      onClick={() => handleCopy(item.id)}
                    >
                      {copiedId === item.id ? (
                        <CheckCircle className="h-3 w-3 text-green-500" />
                      ) : (
                        <Copy className="h-3 w-3" />
                      )}
                    </Button>
                  </div>

                  {/* Tags */}
                  <div className="flex items-center space-x-2 mt-3">
                    {item.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>

                  {/* Metadata */}
                  <div className="flex items-center space-x-4 mt-3 text-xs text-muted-foreground">
                    <span>Last used: {item.lastUsed}</span>
                    <span>•</span>
                    <span>Modified: {item.lastModified}</span>
                    <span>•</span>
                    <span>Accessed {item.accessCount} times</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-1">
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => setEditingItem(item)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => handleDownload(item)}
                >
                  <Download className="h-4 w-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => handleDelete(item.id)}
                  className="hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Credential Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-background glass-dark rounded-lg p-6 w-full max-w-lg space-y-4">
            <h3 className="text-xl font-semibold">Add New Credential</h3>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Name</label>
                <input
                  type="text"
                  className="w-full mt-1 px-3 py-2 bg-background/50 border border-border rounded focus:outline-none focus:ring-2 focus:ring-violet-500"
                  placeholder="e.g., Production API Key"
                />
              </div>
              
              <div>
                <label className="text-sm font-medium">Type</label>
                <select className="w-full mt-1 px-3 py-2 bg-background/50 border border-border rounded focus:outline-none focus:ring-2 focus:ring-violet-500">
                  <option value="api_key">API Key</option>
                  <option value="password">Password</option>
                  <option value="token">Token</option>
                  <option value="certificate">Certificate</option>
                  <option value="ssh_key">SSH Key</option>
                </select>
              </div>
              
              <div>
                <label className="text-sm font-medium">Value</label>
                <textarea
                  className="w-full mt-1 px-3 py-2 bg-background/50 border border-border rounded focus:outline-none focus:ring-2 focus:ring-violet-500 font-mono text-sm"
                  rows={3}
                  placeholder="Enter credential value..."
                />
              </div>
              
              <div>
                <label className="text-sm font-medium">Category</label>
                <input
                  type="text"
                  className="w-full mt-1 px-3 py-2 bg-background/50 border border-border rounded focus:outline-none focus:ring-2 focus:ring-violet-500"
                  placeholder="e.g., LLM Provider"
                />
              </div>
              
              <div>
                <label className="text-sm font-medium">Environment</label>
                <select className="w-full mt-1 px-3 py-2 bg-background/50 border border-border rounded focus:outline-none focus:ring-2 focus:ring-violet-500">
                  <option value="development">Development</option>
                  <option value="staging">Staging</option>
                  <option value="production">Production</option>
                </select>
              </div>
              
              <div>
                <label className="text-sm font-medium">Tags (comma separated)</label>
                <input
                  type="text"
                  className="w-full mt-1 px-3 py-2 bg-background/50 border border-border rounded focus:outline-none focus:ring-2 focus:ring-violet-500"
                  placeholder="e.g., api, production, critical"
                />
              </div>
            </div>
            
            <div className="flex justify-end space-x-2 pt-4">
              <Button variant="outline" onClick={() => setShowAddModal(false)}>
                Cancel
              </Button>
              <Button 
                onClick={() => {
                  // In a real app, you would save the credential here
                  const newItem: VaultItem = {
                    id: Date.now().toString(),
                    name: 'New Credential',
                    type: 'api_key',
                    category: 'New Category',
                    lastUsed: 'Never',
                    lastModified: 'Just now',
                    environment: 'development',
                    accessCount: 0,
                    tags: ['new'],
                    status: 'active'
                  };
                  setVaultItems([...vaultItems, newItem]);
                  setShowAddModal(false);
                }}
              >
                Add Credential
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Credential Modal */}
      {editingItem && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-background glass-dark rounded-lg p-6 w-full max-w-lg space-y-4">
            <h3 className="text-xl font-semibold">Edit Credential</h3>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Name</label>
                <input
                  type="text"
                  className="w-full mt-1 px-3 py-2 bg-background/50 border border-border rounded focus:outline-none focus:ring-2 focus:ring-violet-500"
                  defaultValue={editingItem.name}
                />
              </div>
              
              <div>
                <label className="text-sm font-medium">Category</label>
                <input
                  type="text"
                  className="w-full mt-1 px-3 py-2 bg-background/50 border border-border rounded focus:outline-none focus:ring-2 focus:ring-violet-500"
                  defaultValue={editingItem.category}
                />
              </div>
              
              <div>
                <label className="text-sm font-medium">Environment</label>
                <select 
                  className="w-full mt-1 px-3 py-2 bg-background/50 border border-border rounded focus:outline-none focus:ring-2 focus:ring-violet-500"
                  defaultValue={editingItem.environment}
                >
                  <option value="development">Development</option>
                  <option value="staging">Staging</option>
                  <option value="production">Production</option>
                </select>
              </div>
              
              <div>
                <label className="text-sm font-medium">Status</label>
                <select 
                  className="w-full mt-1 px-3 py-2 bg-background/50 border border-border rounded focus:outline-none focus:ring-2 focus:ring-violet-500"
                  defaultValue={editingItem.status}
                >
                  <option value="active">Active</option>
                  <option value="expiring">Expiring Soon</option>
                  <option value="expired">Expired</option>
                </select>
              </div>
            </div>
            
            <div className="flex justify-end space-x-2 pt-4">
              <Button variant="outline" onClick={() => setEditingItem(null)}>
                Cancel
              </Button>
              <Button 
                onClick={() => {
                  // In a real app, you would update the credential here
                  setEditingItem(null);
                }}
              >
                Save Changes
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
