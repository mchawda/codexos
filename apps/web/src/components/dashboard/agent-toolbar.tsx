// SPDX-License-Identifier: LicenseRef-NIA-Proprietary
'use client';

import { useState } from 'react';
import { Search, Filter, Grid3X3, List, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAgentStore } from '@/lib/stores/agent-store';

export function AgentToolbar() {
  const { filters, updateFilters, resetFilters, showGraphView, toggleGraphView } = useAgentStore();
  const [searchValue, setSearchValue] = useState(filters.search);

  const handleSearchChange = (value: string) => {
    setSearchValue(value);
    updateFilters({ search: value });
  };

  const handleFilterChange = (key: keyof typeof filters, value: string) => {
    updateFilters({ [key]: value });
  };

  const handleReset = () => {
    setSearchValue('');
    resetFilters();
  };

  return (
    <div className="space-y-4">
      {/* Search and View Toggle */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2 flex-1 max-w-md">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search agents..."
              value={searchValue}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant={showGraphView ? "default" : "outline"}
            size="sm"
            onClick={toggleGraphView}
          >
            {showGraphView ? <Grid3X3 className="h-4 w-4 mr-2" /> : <List className="h-4 w-4 mr-2" />}
            {showGraphView ? 'Graph View' : 'List View'}
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium text-muted-foreground">Filters:</span>
        </div>

        {/* Status Filter */}
        <Select value={filters.status} onValueChange={(value) => handleFilterChange('status', value)}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="running">Running</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
            <SelectItem value="error">Error</SelectItem>
          </SelectContent>
        </Select>

        {/* Mode Filter */}
        <Select value={filters.mode} onValueChange={(value) => handleFilterChange('mode', value)}>
          <SelectTrigger className="w-36">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Modes</SelectItem>
            <SelectItem value="autonomous">Autonomous</SelectItem>
            <SelectItem value="assisted">Assisted</SelectItem>
            <SelectItem value="scheduled">Scheduled</SelectItem>
          </SelectContent>
        </Select>

        {/* Agent Type Filter */}
        <Select value={filters.agentType} onValueChange={(value) => handleFilterChange('agentType', value)}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="LLM">LLM</SelectItem>
            <SelectItem value="Tool">Tool</SelectItem>
            <SelectItem value="RAG">RAG</SelectItem>
            <SelectItem value="Trigger Agent">Trigger Agent</SelectItem>
          </SelectContent>
        </Select>

        {/* Active Filters Display */}
        {(filters.status !== 'all' || filters.mode !== 'all' || filters.agentType !== 'all' || filters.search) && (
          <div className="flex items-center space-x-2">
            <span className="text-sm text-muted-foreground">Active:</span>
            {filters.status !== 'all' && (
              <Badge variant="secondary" className="text-xs">
                Status: {filters.status}
              </Badge>
            )}
            {filters.mode !== 'all' && (
              <Badge variant="secondary" className="text-xs">
                Mode: {filters.mode}
              </Badge>
            )}
            {filters.agentType !== 'all' && (
              <Badge variant="secondary" className="text-xs">
                Type: {filters.agentType}
              </Badge>
            )}
            {filters.search && (
              <Badge variant="secondary" className="text-xs">
                Search: "{filters.search}"
              </Badge>
            )}
          </div>
        )}

        {/* Reset Button */}
        {(filters.status !== 'all' || filters.mode !== 'all' || filters.agentType !== 'all' || filters.search) && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleReset}
            className="text-muted-foreground hover:text-foreground"
          >
            <RotateCcw className="h-4 w-4 mr-1" />
            Reset
          </Button>
        )}
      </div>
    </div>
  );
}
