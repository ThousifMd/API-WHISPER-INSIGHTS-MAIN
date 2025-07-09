import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, TrendingUp, TrendingDown, ArrowUp, ArrowDown, Minus, AlertCircle, Activity, Zap, DollarSign } from 'lucide-react';
import { AnalyticsData } from '@/lib/api-client';
import { Progress } from '@/components/ui/progress';

interface UserContextPanelProps {
  currentUserId: string;
  onUserIdChange: (userId: string) => void;
  analyticsData?: AnalyticsData | null;
}

interface LiveMetric {
  totalRequests: number;
  requestsPerMinute: number;
  totalCost: number;
  activeSessions: number;
  avgLatency: number;
  errorRate: number;
}

export const UserContextPanel: React.FC<UserContextPanelProps> = ({
  currentUserId,
  onUserIdChange,
  analyticsData
}) => {
  const [liveMetrics, setLiveMetrics] = useState<LiveMetric>({
    totalRequests: 1254873,
    requestsPerMinute: 1847,
    totalCost: 3542.67,
    activeSessions: 342,
    avgLatency: 287,
    errorRate: 0.23
  });

  // Update metrics every 2 seconds with realistic variations
  useEffect(() => {
    const interval = setInterval(() => {
      setLiveMetrics(prev => ({
        totalRequests: prev.totalRequests + Math.floor(Math.random() * 50 + 20),
        requestsPerMinute: Math.floor(Math.random() * 500 + 1500 + Math.sin(Date.now() / 10000) * 200),
        totalCost: prev.totalCost + (Math.random() * 2.5 + 0.5),
        activeSessions: Math.floor(Math.random() * 50 + 320),
        avgLatency: Math.floor(Math.random() * 100 + 250),
        errorRate: Math.max(0, Math.min(5, prev.errorRate + (Math.random() - 0.5) * 0.5))
      }));
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const getTrendIcon = (current: number, baseline: number, threshold: number = 5) => {
    const percentChange = ((current - baseline) / baseline) * 100;
    if (percentChange > threshold) return <ArrowUp className="w-4 h-4 text-green-500" />;
    if (percentChange < -threshold) return <ArrowDown className="w-4 h-4 text-red-500" />;
    return <Minus className="w-4 h-4 text-gray-500" />;
  };

  return (
    <div className="w-80 border-r bg-background/95 backdrop-blur-sm p-4 space-y-3 flex flex-col h-screen overflow-hidden">
      <Card className="flex-shrink-0">
        <CardHeader className="pb-2 pt-4">
          <CardTitle className="text-base flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Live Metrics
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 pb-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Total Requests</span>
            <div className="flex items-center gap-2">
              <span className="font-bold w-24 text-right tabular-nums">{liveMetrics.totalRequests.toLocaleString()}</span>
              {getTrendIcon(liveMetrics.requestsPerMinute, 1800)}
            </div>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Requests/min</span>
            <div className="flex items-center gap-2">
              <span className="font-bold w-16 text-right tabular-nums">{liveMetrics.requestsPerMinute.toLocaleString()}</span>
              <span className="text-xs text-muted-foreground animate-pulse">●</span>
            </div>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Total Cost</span>
            <div className="flex items-center gap-2">
              <span className="font-bold text-green-500 w-20 text-right tabular-nums">${liveMetrics.totalCost.toFixed(2)}</span>
              <ArrowUp className="w-4 h-4 text-green-500" />
            </div>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Active Sessions</span>
            <span className="font-bold w-12 text-right tabular-nums">{liveMetrics.activeSessions}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Avg Latency</span>
            <div className="flex items-center gap-2">
              <span className="font-bold w-16 text-right tabular-nums">{liveMetrics.avgLatency}ms</span>
              {getTrendIcon(liveMetrics.avgLatency, 300, 10)}
            </div>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Error Rate</span>
            <div className="flex items-center gap-2">
              <span className={`font-bold w-14 text-right tabular-nums ${liveMetrics.errorRate > 1 ? 'text-red-500' : 'text-green-500'}`}>
                {liveMetrics.errorRate.toFixed(2)}%
              </span>
              {liveMetrics.errorRate > 1 ? 
                <TrendingUp className="w-4 h-4 text-red-500" /> : 
                <TrendingDown className="w-4 h-4 text-green-500" />
              }
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="flex-shrink-0">
        <CardHeader className="pb-2 pt-4">
          <CardTitle className="text-base flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Quick Insights
          </CardTitle>
        </CardHeader>
        <CardContent className="pb-3">
          <QuickInsights metrics={liveMetrics} />
        </CardContent>
      </Card>

      {/* Cost Alerts Section */}
      <Card className="flex-shrink-0">
        <CardHeader className="pb-2 pt-4">
          <CardTitle className="text-base flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            Cost Alerts
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 pb-3">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Daily Budget</span>
              <span className="font-medium tabular-nums">${(liveMetrics.totalCost / 30 * 1.2).toFixed(0).padStart(3, ' ')} / $5,000</span>
            </div>
            <Progress value={(liveMetrics.totalCost / 30 * 1.2) / 50} className="h-2" />
          </div>
          <div className="space-y-1 text-sm">
            <div className="flex items-center gap-2 text-yellow-600">
              <div className="w-2 h-2 bg-yellow-600 rounded-full animate-pulse" />
              <span>GPT-4 usage 23% above average</span>
            </div>
            <div className="flex items-center gap-2 text-green-600">
              <div className="w-2 h-2 bg-green-600 rounded-full" />
              <span>Claude-3 costs optimized</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Performance Status */}
      <Card className="flex-1">
        <CardHeader className="pb-2 pt-4">
          <CardTitle className="text-base flex items-center gap-2">
            <Activity className="w-4 h-4" />
            Performance Status
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 pb-3">
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-green-50 dark:bg-green-950 rounded-lg p-2 text-center">
              <Zap className="w-4 h-4 mx-auto text-green-600 mb-1" />
              <div className="text-xs text-muted-foreground">Response Time</div>
              <div className="text-sm font-bold text-green-600">Excellent</div>
            </div>
            <div className="bg-yellow-50 dark:bg-yellow-950 rounded-lg p-2 text-center">
              <DollarSign className="w-4 h-4 mx-auto text-yellow-600 mb-1" />
              <div className="text-xs text-muted-foreground">Cost Efficiency</div>
              <div className="text-sm font-bold text-yellow-600">Moderate</div>
            </div>
          </div>
          <div className="pt-2 space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">API Health Score</span>
              <span className="font-bold text-green-600">94/100</span>
            </div>
            <Progress value={94} className="h-2" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Quick Insights Component
const QuickInsights: React.FC<{ metrics: LiveMetric }> = ({ metrics }) => {
  const [insights, setInsights] = useState<Array<{ text: string; type: 'info' | 'warning' | 'success' }>>([]);
  
  useEffect(() => {
    const generateInsights = () => {
      const possibleInsights = [
        { text: `Peak usage: ${metrics.requestsPerMinute} req/min`, type: 'info' as const },
        { text: `Cost projection: $${(metrics.totalCost * 24).toFixed(2)}/day`, type: metrics.totalCost > 5000 ? 'warning' as const : 'info' as const },
        { text: `${metrics.activeSessions} active sessions`, type: 'info' as const },
        { text: `Error rate ${metrics.errorRate > 1 ? 'elevated' : 'normal'}: ${metrics.errorRate.toFixed(2)}%`, type: metrics.errorRate > 1 ? 'warning' as const : 'success' as const },
        { text: `Latency ${metrics.avgLatency < 300 ? 'excellent' : 'elevated'}: ${metrics.avgLatency}ms`, type: metrics.avgLatency < 300 ? 'success' as const : 'warning' as const },
        { text: `OpenAI usage up 15% today`, type: 'info' as const },
        { text: `New endpoint /api/v2 trending`, type: 'info' as const },
        { text: `Mobile traffic increased 30%`, type: 'success' as const },
        { text: `Anthropic Claude-3 now 40% of requests`, type: 'info' as const },
        { text: `GPU endpoints showing 2x cost`, type: 'warning' as const },
      ];
      
      // Randomly select 3 insights
      const shuffled = possibleInsights.sort(() => 0.5 - Math.random());
      setInsights(shuffled.slice(0, 3));
    };
    
    generateInsights();
    const interval = setInterval(generateInsights, 10000); // Change insights every 10 seconds
    
    return () => clearInterval(interval);
  }, [metrics]);
  
  const getInsightStyle = (type: string) => {
    switch (type) {
      case 'warning':
        return 'bg-orange-50 dark:bg-orange-950 text-orange-700 dark:text-orange-300';
      case 'success':
        return 'bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-300';
      default:
        return 'bg-muted/50 text-muted-foreground';
    }
  };
  
  return (
    <div className="space-y-1.5 text-xs">
      {insights.map((insight, index) => (
        <div
          key={index}
          className={`px-2 py-1 rounded transition-all duration-500 ${getInsightStyle(insight.type)}`}
        >
          • {insight.text}
        </div>
      ))}
    </div>
  );
};