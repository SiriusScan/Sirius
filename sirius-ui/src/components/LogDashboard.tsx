import React, { useState, useEffect, useMemo } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '~/components/lib/ui/table';
import { Badge } from '~/components/lib/ui/badge';
import { Button } from '~/components/lib/ui/button';
import { Input } from '~/components/lib/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/lib/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/lib/ui/card';
import { RefreshCw, Search, Filter, AlertTriangle, Info, Bug, AlertCircle } from 'lucide-react';
import { logService, LogEntry, LogRetrievalRequest, LogStatsResponse } from '~/services/logService';

interface LogDashboardProps {
  className?: string;
}

export const LogDashboard: React.FC<LogDashboardProps> = ({ className }) => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [stats, setStats] = useState<LogStatsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [offset, setOffset] = useState(0);
  const [limit] = useState(50);

  // Filters
  const [serviceFilter, setServiceFilter] = useState<string>('');
  const [levelFilter, setLevelFilter] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Get unique services and levels from logs
  const availableServices = useMemo(() => {
    const services = new Set<string>();
    logs.forEach(log => services.add(log.service));
    return Array.from(services).sort();
  }, [logs]);

  const availableLevels = useMemo(() => {
    const levels = new Set<string>();
    logs.forEach(log => levels.add(log.level));
    return Array.from(levels).sort();
  }, [logs]);

  // Build request object
  const request: LogRetrievalRequest = useMemo(() => {
    const req: LogRetrievalRequest = {
      limit,
      offset,
    };

    if (serviceFilter) req.service = serviceFilter;
    if (levelFilter) req.level = levelFilter;
    if (searchQuery.trim()) req.search = searchQuery.trim();

    return req;
  }, [serviceFilter, levelFilter, searchQuery, limit, offset]);

  // Load logs
  const loadLogs = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await logService.getLogsWithRetry(request);
      setLogs(response.logs);
      setTotal(response.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load logs');
      console.error('Failed to load logs:', err);
    } finally {
      setLoading(false);
    }
  };

  // Load stats
  const loadStats = async () => {
    try {
      const statsData = await logService.getLogStatsWithRetry();
      setStats(statsData);
    } catch (err) {
      console.error('Failed to load log stats:', err);
    }
  };

  // Initial load
  useEffect(() => {
    loadLogs();
    loadStats();
  }, [request]);

  // Auto-refresh
  useEffect(() => {
    const stopPolling = logService.startLogPolling(
      (response) => {
        setLogs(response.logs);
        setTotal(response.total);
        setError(null);
      },
      (err) => {
        setError(err.message);
        console.error('Log polling error:', err);
      },
      request,
      { interval: 10000 } // 10 seconds
    );

    const stopStatsPolling = logService.startStatsPolling(
      (statsData) => {
        setStats(statsData);
      },
      (err) => {
        console.error('Stats polling error:', err);
      },
      { interval: 30000 } // 30 seconds
    );

    return () => {
      stopPolling();
      stopStatsPolling();
    };
  }, [request]);

  // Handle pagination
  const handlePreviousPage = () => {
    if (offset > 0) {
      setOffset(Math.max(0, offset - limit));
    }
  };

  const handleNextPage = () => {
    if (offset + limit < total) {
      setOffset(offset + limit);
    }
  };

  // Handle refresh
  const handleRefresh = () => {
    loadLogs();
    loadStats();
  };

  // Clear filters
  const clearFilters = () => {
    setServiceFilter('');
    setLevelFilter('');
    setSearchQuery('');
    setOffset(0);
  };

  // Get log level icon
  const getLogLevelIcon = (level: string) => {
    switch (level) {
      case 'error':
        return <AlertCircle className="h-4 w-4" />;
      case 'warn':
        return <AlertTriangle className="h-4 w-4" />;
      case 'info':
        return <Info className="h-4 w-4" />;
      case 'debug':
        return <Bug className="h-4 w-4" />;
      default:
        return <Info className="h-4 w-4" />;
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">System Logs</h2>
          <p className="text-muted-foreground">
            Centralized logging system for all Sirius components
          </p>
        </div>
        <Button onClick={handleRefresh} disabled={loading} variant="outline">
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Logs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total_logs}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Services</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{Object.keys(stats.service_stats).length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Errors</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-500">
                {stats.level_stats.error || 0}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Warnings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-500">
                {stats.level_stats.warn || 0}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Service</label>
              <Select value={serviceFilter} onValueChange={setServiceFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All services" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All services</SelectItem>
                  {availableServices.map(service => (
                    <SelectItem key={service} value={service}>
                      {service}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Level</label>
              <Select value={levelFilter} onValueChange={setLevelFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All levels" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All levels</SelectItem>
                  {availableLevels.map(level => (
                    <SelectItem key={level} value={level}>
                      {level}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Search</label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search messages..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">&nbsp;</label>
              <Button onClick={clearFilters} variant="outline" className="w-full">
                Clear Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Error Alert */}
      {error && (
        <div className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-lg">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5 text-red-400" />
            <span className="text-red-400 font-medium">Error</span>
          </div>
          <p className="text-red-300 text-sm mt-1">{error}</p>
        </div>
      )}

      {/* Logs Table */}
      <Card>
        <CardHeader>
          <CardTitle>Log Entries</CardTitle>
          <CardDescription>
            Showing {logs.length} of {total} logs
            {loading && ' (Loading...)'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>Level</TableHead>
                  <TableHead>Service</TableHead>
                  <TableHead>Component</TableHead>
                  <TableHead>Message</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="font-mono text-sm">
                      <div>{logService.formatTimestamp(log.timestamp)}</div>
                      <div className="text-muted-foreground text-xs">
                        {logService.formatRelativeTime(log.timestamp)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={logService.getLogLevelBadgeVariant(log.level)}
                        className="flex items-center gap-1 w-fit"
                      >
                        {getLogLevelIcon(log.level)}
                        {log.level.toUpperCase()}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      {log.service}
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      {log.subcomponent}
                    </TableCell>
                    <TableCell>
                      <div className="max-w-md truncate" title={log.message}>
                        {log.message}
                      </div>
                      {log.metadata && Object.keys(log.metadata).length > 0 && (
                        <div className="text-xs text-muted-foreground mt-1">
                          {Object.entries(log.metadata).slice(0, 2).map(([key, value]) => (
                            <span key={key} className="mr-2">
                              {key}: {String(value)}
                            </span>
                          ))}
                          {Object.keys(log.metadata).length > 2 && '...'}
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between mt-4">
            <div className="text-sm text-muted-foreground">
              Showing {offset + 1} to {Math.min(offset + limit, total)} of {total} entries
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePreviousPage}
                disabled={offset === 0 || loading}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleNextPage}
                disabled={offset + limit >= total || loading}
              >
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
