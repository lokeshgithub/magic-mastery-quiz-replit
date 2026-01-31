import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, BarChart3, Zap, DollarSign, Users, RefreshCw } from 'lucide-react';

interface UsageStats {
  totalCalls: number;
  totalEstimatedCost: number;
  uniqueUsers: number;
  uniqueSessions: number;
  byActionType: Record<string, { count: number; cost: number }>;
  recentLogs: Array<{
    id: string;
    action_type: string;
    user_id: string | null;
    session_id: string | null;
    estimated_cost: number;
    created_at: string;
    details: Record<string, unknown>;
  }>;
}

export function UsageDashboard() {
  const [stats, setStats] = useState<UsageStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('7d');
  const [error, setError] = useState<string | null>(null);

  const fetchUsageStats = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Calculate date range
      const now = new Date();
      let startDate: Date;
      
      switch (timeRange) {
        case '24h':
          startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
          break;
        case '7d':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case '30d':
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        case 'all':
          startDate = new Date(0);
          break;
        default:
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      }

      const response = await fetch(`/api/admin/usage-logs?since=${startDate.toISOString()}&limit=1000`);
      if (!response.ok) {
        throw new Error('Failed to fetch usage logs');
      }
      
      const logs: any[] = await response.json();

      if (!logs || logs.length === 0) {
        setStats({
          totalCalls: 0,
          totalEstimatedCost: 0,
          uniqueUsers: 0,
          uniqueSessions: 0,
          byActionType: {},
          recentLogs: [],
        });
        return;
      }

      // Calculate stats
      const uniqueUserIds = new Set(logs.filter(l => l.user_id).map(l => l.user_id));
      const uniqueSessionIds = new Set(logs.filter(l => l.session_id).map(l => l.session_id));
      
      const byActionType: Record<string, { count: number; cost: number }> = {};
      let totalCost = 0;

      for (const log of logs) {
        const cost = Number(log.estimated_cost) || 0;
        totalCost += cost;
        
        if (!byActionType[log.action_type]) {
          byActionType[log.action_type] = { count: 0, cost: 0 };
        }
        byActionType[log.action_type].count++;
        byActionType[log.action_type].cost += cost;
      }

      setStats({
        totalCalls: logs.length,
        totalEstimatedCost: totalCost,
        uniqueUsers: uniqueUserIds.size,
        uniqueSessions: uniqueSessionIds.size,
        byActionType,
        recentLogs: logs.slice(0, 50).map(log => ({
          ...log,
          details: (log.details as Record<string, unknown>) || {},
        })),
      });
    } catch (err) {
      console.error('Error fetching usage stats:', err);
      setError('Failed to fetch usage statistics. Make sure you have admin access.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsageStats();
  }, [timeRange]);

  const formatCost = (cost: number) => {
    if (cost < 0.01) {
      return `$${cost.toFixed(6)}`;
    }
    return `$${cost.toFixed(4)}`;
  };

  const formatActionType = (type: string) => {
    return type.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  };

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Usage Analytics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-destructive">{error}</p>
          <Button onClick={fetchUsageStats} className="mt-4" variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Usage Analytics
            </CardTitle>
            <CardDescription>
              Monitor API calls, AI usage, and estimated costs
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="24h">Last 24h</SelectItem>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="all">All time</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={fetchUsageStats} variant="outline" size="icon" disabled={isLoading}>
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : stats ? (
          <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-primary/10 rounded-lg p-4">
                <div className="flex items-center gap-2 text-primary mb-1">
                  <Zap className="w-4 h-4" />
                  <span className="text-sm font-medium">Total Calls</span>
                </div>
                <p className="text-2xl font-bold">{stats.totalCalls.toLocaleString()}</p>
              </div>
              <div className="bg-primary/10 rounded-lg p-4">
                <div className="flex items-center gap-2 text-primary mb-1">
                  <DollarSign className="w-4 h-4" />
                  <span className="text-sm font-medium">Est. Cost</span>
                </div>
                <p className="text-2xl font-bold">{formatCost(stats.totalEstimatedCost)}</p>
              </div>
              <div className="bg-primary/10 rounded-lg p-4">
                <div className="flex items-center gap-2 text-primary mb-1">
                  <Users className="w-4 h-4" />
                  <span className="text-sm font-medium">Unique Users</span>
                </div>
                <p className="text-2xl font-bold">{stats.uniqueUsers}</p>
              </div>
              <div className="bg-primary/10 rounded-lg p-4">
                <div className="flex items-center gap-2 text-primary mb-1">
                  <BarChart3 className="w-4 h-4" />
                  <span className="text-sm font-medium">Sessions</span>
                </div>
                <p className="text-2xl font-bold">{stats.uniqueSessions}</p>
              </div>
            </div>

            {/* Usage by Action Type */}
            <div>
              <h3 className="font-semibold mb-3">Usage by Action Type</h3>
              <div className="space-y-2">
                {Object.entries(stats.byActionType).map(([type, data]) => (
                  <div 
                    key={type}
                    className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                  >
                    <div>
                      <p className="font-medium">{formatActionType(type)}</p>
                      <p className="text-sm text-muted-foreground">
                        {data.count.toLocaleString()} calls
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-primary">{formatCost(data.cost)}</p>
                      <p className="text-xs text-muted-foreground">estimated</p>
                    </div>
                  </div>
                ))}
                {Object.keys(stats.byActionType).length === 0 && (
                  <p className="text-muted-foreground text-center py-4">
                    No usage data yet
                  </p>
                )}
              </div>
            </div>

            {/* Recent Activity */}
            <div>
              <h3 className="font-semibold mb-3">Recent Activity</h3>
              <div className="max-h-64 overflow-y-auto space-y-2">
                {stats.recentLogs.map((log) => (
                  <div 
                    key={log.id}
                    className="flex items-center justify-between p-2 text-sm border-b border-border"
                  >
                    <div>
                      <span className="font-medium">{formatActionType(log.action_type)}</span>
                      {log.user_id && (
                        <span className="text-muted-foreground ml-2">
                          User: {log.user_id.slice(0, 8)}...
                        </span>
                      )}
                    </div>
                    <div className="text-right text-muted-foreground">
                      <span>{formatCost(log.estimated_cost)}</span>
                      <span className="ml-2">
                        {new Date(log.created_at).toLocaleString()}
                      </span>
                    </div>
                  </div>
                ))}
                {stats.recentLogs.length === 0 && (
                  <p className="text-muted-foreground text-center py-4">
                    No recent activity
                  </p>
                )}
              </div>
            </div>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}