import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell, AreaChart, Area, ScatterChart, Scatter, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from 'recharts';
import { TrendingUp, TrendingDown, Minus, MessageSquare } from 'lucide-react';
import { WorldMap } from '@/components/charts/WorldMap';
import { SimpleWorldMap } from '@/components/charts/SimpleWorldMap';

interface AnalyticsData {
  type: string;
  charts?: Array<{
    type: 'line' | 'bar' | 'table' | 'pie' | 'area' | 'scatter' | 'radar' | 'bubble' | 'stacked-bar' | 'horizontalBar' | 'donut' | 'heatmap' | 'column' | 'stackedColumn' | 'combo' | 'map';
    title: string;
    data: any[];
  }>;
  metrics?: Array<{
    label: string;
    value: string;
    trend: string;
    trending: 'up' | 'down' | 'neutral' | string;
  }>;
}

interface AnalyticsVisualizationProps {
  data: AnalyticsData;
}

export const AnalyticsVisualization: React.FC<AnalyticsVisualizationProps> = ({ data }) => {
  console.log('AnalyticsVisualization received data:', data);

  const handleExplainChart = (chartTitle: string) => {
    // This would typically trigger a new AI message explaining the chart
    console.log(`Explaining chart: ${chartTitle}`);
  };

  const getTrendIcon = (trending: string) => {
    switch (trending) {
      case 'up':
        return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'down':
        return <TrendingDown className="w-4 h-4 text-red-500" />;
      default:
        return <Minus className="w-4 h-4 text-muted-foreground" />;
    }
  };

  // Define colors for charts - more vibrant and visually appealing
  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4', '#F97316'];
  const CHART_COLORS = {
    blue: '#3B82F6',
    green: '#10B981',
    yellow: '#F59E0B',
    red: '#EF4444',
    purple: '#8B5CF6',
    pink: '#EC4899',
    cyan: '#06B6D4',
    orange: '#F97316',
    indigo: '#6366F1',
    teal: '#14B8A6'
  };

  return (
    <div className="space-y-4">
      {/* Metrics Cards */}
      {data.metrics && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {data.metrics.map((metric, index) => (
            <Card key={index} className="bg-background/95 backdrop-blur-sm">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{metric.label}</p>
                    <p className="text-2xl font-bold text-foreground">{metric.value}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    {getTrendIcon(metric.trending)}
                    <span className={`text-sm font-medium ${metric.trending === 'up' ? 'text-green-500' :
                      metric.trending === 'down' ? 'text-red-500' :
                        'text-muted-foreground'
                      }`}>
                      {metric.trend}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Charts */}
      {data.charts && data.charts.map((chart, index) => (
        <Card key={index} className="bg-background/95 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg">{chart.title}</CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleExplainChart(chart.title)}
              className="gap-2"
            >
              <MessageSquare className="w-4 h-4" />
              Explain this chart
            </Button>
          </CardHeader>
          <CardContent>
            {chart.type === 'line' && chart.data && chart.data.length > 0 && (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chart.data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <defs>
                    {COLORS.map((color, index) => (
                      <linearGradient key={`gradient-${index}`} id={`colorGradient${index}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={color} stopOpacity={0.8}/>
                        <stop offset="95%" stopColor={color} stopOpacity={0.1}/>
                      </linearGradient>
                    ))}
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 12 }}
                    tickFormatter={(value) => {
                      const date = new Date(value);
                      return `${date.getMonth() + 1}/${date.getDate()}`;
                    }}
                  />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip
                    labelFormatter={(value) => new Date(value).toLocaleDateString()}
                    formatter={(value: any, name: string) => {
                      if (typeof value === 'number') {
                        // Check if this is an uptime/percentage value
                        if (name.toLowerCase().includes('uptime') || (value > 90 && value <= 100)) {
                          return [`${value.toFixed(2)}%`, name];
                        }
                        // Default to currency for other numeric values
                        return [`$${value.toFixed(2)}`, name];
                      }
                      return [value, name];
                    }}
                    contentStyle={{
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      border: '1px solid #E5E7EB',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                  {/* Dynamically render lines based on data keys */}
                  {Object.keys(chart.data[0] || {})
                    .filter(key => key !== 'date' && typeof chart.data[0][key] === 'number')
                    .map((key, index) => (
                      <Line
                        key={key}
                        type="monotone"
                        dataKey={key}
                        stroke={COLORS[index % COLORS.length]}
                        strokeWidth={3}
                        dot={{ r: 4, strokeWidth: 2, fill: '#fff' }}
                        activeDot={{ r: 6, strokeWidth: 0 }}
                        name={key.charAt(0).toUpperCase() + key.slice(1)}
                        animationBegin={0}
                        animationDuration={1000}
                        animationEasing="ease-out"
                      />
                    ))
                  }
                  <Legend 
                    iconType="line"
                    wrapperStyle={{ paddingTop: '20px' }}
                    formatter={(value) => <span className="text-sm font-medium">{value}</span>}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}

            {chart.type === 'bar' && (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chart.data}>
                  <defs>
                    {COLORS.map((color, index) => (
                      <linearGradient key={`barGradient-${index}`} id={`barColorGradient${index}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={color} stopOpacity={1}/>
                        <stop offset="100%" stopColor={color} stopOpacity={0.8}/>
                      </linearGradient>
                    ))}
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis
                    dataKey={
                      chart.data[0]?.vendor ? "vendor" : 
                      chart.data[0]?.useCase ? "useCase" :
                      chart.data[0]?.process ? "process" :
                      "name"
                    }
                    tick={{ fontSize: 12 }}
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip
                    formatter={(value: any, name: string) => [
                      typeof value === 'number' ?
                        (name.toLowerCase().includes('cost') ? `$${value.toFixed(2)}` :
                          name.toLowerCase().includes('latency') ? `${value.toFixed(0)}ms` :
                            name.toLowerCase().includes('requests') || name.toLowerCase().includes('videos') ? value.toLocaleString() :
                              name.toLowerCase().includes('uptime') ? `${value.toFixed(2)}%` :
                                name.toLowerCase().includes('mttr') || name.toLowerCase().includes('avgtime') ? `${value.toFixed(1)} min` :
                                  name.toLowerCase().includes('incidents') ? `${value} incidents` :
                                    name.toLowerCase().includes('avgduration') ? `${value.toFixed(1)} min` :
                                      value.toLocaleString()) : value,
                      name
                    ]}
                    contentStyle={{
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      border: '1px solid #E5E7EB',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                    }}
                    cursor={{ fill: 'rgba(0, 0, 0, 0.05)' }}
                  />
                  {/* Render multiple bars if data has multiple numeric series */}
                  {Object.keys(chart.data[0] || {})
                    .filter(key => key !== 'name' && key !== 'vendor' && key !== 'type' && key !== 'useCase' && key !== 'process' && typeof chart.data[0][key] === 'number')
                    .map((key, index) => {
                      // Special handling for latency chart
                      if (key === 'latency' && chart.title.includes('Latency Ranking')) {
                        return (
                          <Bar
                            key={key}
                            dataKey={key}
                            radius={[4, 4, 0, 0]}
                          >
                            {chart.data.map((entry, idx) => (
                              <Cell
                                key={`cell-${idx}`}
                                fill={
                                  entry.type === 'Fast' ? '#10B981' :
                                    entry.type === 'Medium' ? '#F59E0B' :
                                      '#EF4444'
                                }
                              />
                            ))}
                          </Bar>
                        );
                      }
                      return (
                        <Bar
                          key={key}
                          dataKey={key}
                          fill={`url(#barColorGradient${index % COLORS.length})`}
                          radius={[8, 8, 0, 0]}
                          name={key}
                          animationBegin={0}
                          animationDuration={800}
                          animationEasing="ease-out"
                        />
                      );
                    })
                  }
                  <Legend 
                    iconType="rect"
                    wrapperStyle={{ paddingTop: '20px' }}
                    formatter={(value) => <span className="text-sm font-medium">{value}</span>}
                  />
                </BarChart>
              </ResponsiveContainer>
            )}

            {/* Pie Chart */}
            {chart.type === 'pie' && (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={chart.data}
                    cx="50%"
                    cy="50%"
                    label={({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
                      if (percent < 0.05) return null;
                      const RADIAN = Math.PI / 180;
                      const radius = innerRadius + (outerRadius - innerRadius) * 0.7;
                      const x = cx + radius * Math.cos(-midAngle * RADIAN);
                      const y = cy + radius * Math.sin(-midAngle * RADIAN);
                      
                      return (
                        <text 
                          x={x} 
                          y={y} 
                          fill="white" 
                          textAnchor="middle" 
                          dominantBaseline="middle"
                          className="font-bold text-xs"
                          style={{ pointerEvents: 'none' }}
                        >
                          {`${(percent * 100).toFixed(0)}%`}
                        </text>
                      );
                    }}
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    animationBegin={0}
                    animationDuration={800}
                    animationEasing="ease-out"
                  >
                    {chart.data.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={COLORS[index % COLORS.length]}
                        style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))' }}
                      />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: any, name: string) => [
                      typeof value === 'number' && name.toLowerCase().includes('cost') ? `$${value.toFixed(2)}` : value,
                      name
                    ]}
                    contentStyle={{
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      border: '1px solid #E5E7EB',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                  <Legend 
                    wrapperStyle={{ paddingTop: '20px' }}
                    iconType="circle"
                    formatter={(value) => <span className="text-sm font-medium">{value}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}

            {/* Donut Chart */}
            {chart.type === 'donut' && (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={chart.data}
                    cx="50%"
                    cy="50%"
                    label={({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
                      if (percent < 0.05) return null;
                      const RADIAN = Math.PI / 180;
                      const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
                      const x = cx + radius * Math.cos(-midAngle * RADIAN);
                      const y = cy + radius * Math.sin(-midAngle * RADIAN);
                      
                      return (
                        <text 
                          x={x} 
                          y={y} 
                          fill="white" 
                          textAnchor="middle" 
                          dominantBaseline="middle"
                          className="font-bold text-xs"
                          style={{ pointerEvents: 'none' }}
                        >
                          {`${(percent * 100).toFixed(0)}%`}
                        </text>
                      );
                    }}
                    labelLine={false}
                    outerRadius={80}
                    innerRadius={40}
                    fill="#8884d8"
                    dataKey="value"
                    animationBegin={0}
                    animationDuration={800}
                    animationEasing="ease-out"
                  >
                    {chart.data.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={COLORS[index % COLORS.length]}
                        style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))' }}
                      />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: any) => `$${value.toFixed(2)}`}
                    contentStyle={{
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      border: '1px solid #E5E7EB',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                  <Legend 
                    wrapperStyle={{ paddingTop: '20px' }}
                    iconType="circle"
                    formatter={(value) => <span className="text-sm font-medium">{value}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}

            {/* Area Chart */}
            {chart.type === 'area' && (
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={chart.data}>
                  <defs>
                    {COLORS.map((color, index) => (
                      <linearGradient key={`areaGradient-${index}`} id={`areaColorGradient${index}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={color} stopOpacity={0.8}/>
                        <stop offset="95%" stopColor={color} stopOpacity={0.1}/>
                      </linearGradient>
                    ))}
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 12 }}
                    tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip
                    labelFormatter={(value) => new Date(value).toLocaleDateString()}
                    formatter={(value: any, name: string) => {
                      if (name.toLowerCase().includes('cost')) {
                        return [`$${value.toFixed(2)}`, name];
                      } else if (name.toLowerCase().includes('minutes')) {
                        return [`${value.toFixed(0)} min`, name];
                      } else if (name.toLowerCase().includes('requests')) {
                        return [value.toLocaleString(), name];
                      }
                      return [value.toLocaleString(), name];
                    }}
                    contentStyle={{
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      border: '1px solid #E5E7EB',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                  {Object.keys(chart.data[0] || {})
                    .filter(key => key !== 'date')
                    .map((key, index) => (
                      <Area
                        key={key}
                        type="monotone"
                        dataKey={key}
                        stroke={COLORS[index % COLORS.length]}
                        strokeWidth={2}
                        fill={`url(#areaColorGradient${index % COLORS.length})`}
                        fillOpacity={0.8}
                        stackId="1"
                        animationBegin={0}
                        animationDuration={1000}
                        animationEasing="ease-out"
                      />
                    ))
                  }
                  <Legend 
                    iconType="rect"
                    wrapperStyle={{ paddingTop: '20px' }}
                    formatter={(value) => <span className="text-sm font-medium">{value}</span>}
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}

            {/* Scatter Chart */}
            {chart.type === 'scatter' && (
              <ResponsiveContainer width="100%" height={300}>
                <ScatterChart margin={{ top: 20, right: 20, bottom: 40, left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis
                    type="number"
                    dataKey={chart.data[0]?.x !== undefined ? "x" : "requests"}
                    name="Requests"
                    tick={{ fontSize: 12 }}
                    label={{ value: 'Request Volume', position: 'insideBottom', offset: -5 }}
                  />
                  <YAxis
                    type="number"
                    dataKey={chart.data[0]?.y !== undefined ? "y" : "latency"}
                    name="Latency (ms)"
                    tick={{ fontSize: 12 }}
                    label={{ value: 'Latency (ms)', angle: -90, position: 'insideLeft' }}
                  />
                  <Tooltip
                    cursor={{ strokeDasharray: '3 3' }}
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        const requests = data.x || data.requests;
                        const latency = data.y || data.latency;
                        return (
                          <div className="bg-background border rounded p-2 shadow-lg">
                            <p className="font-semibold">{data.model || data.region || 'Unknown'}</p>
                            <p className="text-sm">Requests: {requests?.toLocaleString()}</p>
                            <p className="text-sm">Latency: {latency}ms</p>
                            {data.cost && <p className="text-sm">Cost/req: ${data.cost.toFixed(3)}</p>}
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Scatter
                    data={chart.data}
                    fill={COLORS[0]}
                    animationBegin={0}
                    animationDuration={800}
                    animationEasing="ease-out"
                  >
                    {chart.data.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={COLORS[index % COLORS.length]}
                        style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))' }}
                      />
                    ))}
                  </Scatter>
                </ScatterChart>
              </ResponsiveContainer>
            )}

            {/* Radar Chart */}
            {chart.type === 'radar' && (
              <ResponsiveContainer width="100%" height={300}>
                <RadarChart data={chart.data}>
                  <PolarGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                  <PolarAngleAxis dataKey={Object.keys(chart.data[0] || {}).find(key => ['endpoint', 'model', 'metric'].includes(key)) || 'endpoint'} tick={{ fontSize: 10 }} />
                  <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fontSize: 10 }} />
                  {Object.keys(chart.data[0] || {})
                    .filter(key => !['endpoint', 'model', 'metric'].includes(key) && typeof chart.data[0][key] === 'number')
                    .map((key, index) => (
                      <Radar
                        key={key}
                        name={key}
                        dataKey={key}
                        stroke={COLORS[index % COLORS.length]}
                        strokeWidth={2}
                        fill={COLORS[index % COLORS.length]}
                        fillOpacity={0.3}
                        animationBegin={0}
                        animationDuration={1000}
                        animationEasing="ease-out"
                      />
                    ))
                  }
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      border: '1px solid #E5E7EB',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                  <Legend 
                    wrapperStyle={{ paddingTop: '20px' }}
                    formatter={(value) => <span className="text-sm font-medium">{value}</span>}
                  />
                </RadarChart>
              </ResponsiveContainer>
            )}

            {/* Bubble Chart (using Scatter with custom rendering) */}
            {chart.type === 'bubble' && (
              <ResponsiveContainer width="100%" height={300}>
                <ScatterChart margin={{ top: 20, right: 30, bottom: 40, left: 60 }}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis
                    type="number"
                    dataKey="x"
                    name="Latency"
                    domain={['dataMin - 500', 'dataMax + 500']}
                    tick={{ fontSize: 12 }}
                    label={{ value: 'Average Latency (ms)', position: 'insideBottom', offset: -5 }}
                  />
                  <YAxis
                    type="number"
                    dataKey="y"
                    name="Cost per Request ($)"
                    domain={[0, 'dataMax + 0.5']}
                    tick={{ fontSize: 12 }}
                    label={{ value: 'Avg Cost/Request ($)', angle: -90, position: 'insideLeft' }}
                  />
                  <Tooltip
                    cursor={{ strokeDasharray: '3 3' }}
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-background border rounded p-2 shadow-lg">
                            <p className="font-semibold">{data.name}</p>
                            <p className="text-sm">Avg Latency: {data.x.toLocaleString()}ms</p>
                            <p className="text-sm">Avg Cost: ${data.y.toFixed(3)}</p>
                            <p className="text-sm">Request Volume: {Math.round(Math.pow(data.z / 2, 2)).toLocaleString()}</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Scatter
                    data={chart.data}
                    fill={COLORS[0]}
                    animationBegin={0}
                    animationDuration={1000}
                    animationEasing="ease-out"
                    shape={(props: any) => {
                      const { cx, cy, payload, index } = props;
                      // Find min and max z values (bubble sizes) for normalization
                      const allSizes = chart.data.map((d: any) => d.z);
                      const minSize = Math.min(...allSizes);
                      const maxSize = Math.max(...allSizes);

                      // Normalize z value to a reasonable bubble size range (10-40 pixels radius)
                      const normalizedSize = ((payload.z - minSize) / (maxSize - minSize)) * 30 + 10;

                      // Get color based on index
                      const color = COLORS[index % COLORS.length];

                      return (
                        <circle
                          cx={cx}
                          cy={cy}
                          r={normalizedSize}
                          fill={color}
                          fillOpacity={0.7}
                          stroke={color}
                          strokeWidth={2}
                        />
                      );
                    }}
                  />
                </ScatterChart>
              </ResponsiveContainer>
            )}



            {/* Heatmap Chart (custom implementation) */}
            {chart.type === 'heatmap' && (
              <div className="w-full h-[400px] overflow-x-auto">
                <div className="grid grid-cols-8 gap-0.5 min-w-[600px]">
                  <div className="col-span-1"></div>
                  {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                    <div key={day} className="text-center text-xs font-medium p-1">{day}</div>
                  ))}
                  {Array.from({ length: 24 }, (_, hour) => {
                    const hourStr = hour.toString().padStart(2, '0') + ':00';
                    return (
                      <React.Fragment key={hour}>
                        <div className="text-xs text-right pr-2 py-1">{hourStr}</div>
                        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => {
                          const dataPoint = chart.data.find(d => d.hour === hourStr && d.day === day);
                          const value = dataPoint?.errors || dataPoint?.usage || dataPoint?.requests || 0;
                          const isErrorHeatmap = chart.title.toLowerCase().includes('error');
                          
                          // Different scales for errors vs usage
                          const maxValue = isErrorHeatmap ? 50 : 250;
                          const intensity = Math.min(value / maxValue, 1);
                          
                          // Color schemes based on type
                          const bgColor = isErrorHeatmap ? 
                            // Error colors (red scale)
                            (value > 30 ? `rgba(239, 68, 68, ${0.3 + intensity * 0.7})` :
                             value > 15 ? `rgba(249, 115, 22, ${0.3 + intensity * 0.7})` :
                             value > 5 ? `rgba(245, 158, 11, ${0.3 + intensity * 0.7})` :
                             value > 0 ? `rgba(16, 185, 129, ${0.3 + intensity * 0.7})` :
                             `rgba(229, 231, 235, 0.5)`) :
                            // Usage colors (blue scale)
                            (value > 200 ? `rgba(59, 130, 246, ${0.8 + intensity * 0.2})` :
                             value > 150 ? `rgba(59, 130, 246, ${0.6 + intensity * 0.2})` :
                             value > 100 ? `rgba(59, 130, 246, ${0.4 + intensity * 0.2})` :
                             value > 50 ? `rgba(59, 130, 246, ${0.3 + intensity * 0.2})` :
                             value > 0 ? `rgba(59, 130, 246, ${0.2 + intensity * 0.1})` :
                             `rgba(229, 231, 235, 0.3)`);
                          
                          const label = isErrorHeatmap ? 'errors' : 'requests';
                          const showValue = isErrorHeatmap ? value > 30 : value > 150;
                          
                          return (
                            <div
                              key={`${hour}-${day}`}
                              className="relative h-4 cursor-pointer transition-all hover:ring-2 hover:ring-primary"
                              style={{ backgroundColor: bgColor }}
                              title={`${hourStr} ${day}: ${value} ${label}`}
                            >
                              {showValue && (
                                <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-white">
                                  {value}
                                </span>
                              )}
                            </div>
                          );
                        })}
                      </React.Fragment>
                    );
                  })}
                </div>
                <div className="flex items-center gap-4 mt-4 text-xs">
                  <span className="text-muted-foreground">
                    {chart.title.toLowerCase().includes('error') ? 'Error Intensity:' : 'Usage Intensity:'}
                  </span>
                  {chart.title.toLowerCase().includes('error') ? (
                    <>
                      <div className="flex items-center gap-1">
                        <div className="w-4 h-4 bg-green-500"></div>
                        <span>Low (0-5)</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-4 h-4 bg-yellow-500"></div>
                        <span>Medium (6-15)</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-4 h-4 bg-orange-500"></div>
                        <span>High (16-30)</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-4 h-4 bg-red-500"></div>
                        <span>Critical (30+)</span>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex items-center gap-1">
                        <div className="w-4 h-4" style={{ backgroundColor: 'rgba(59, 130, 246, 0.2)' }}></div>
                        <span>Low (1-50)</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-4 h-4" style={{ backgroundColor: 'rgba(59, 130, 246, 0.4)' }}></div>
                        <span>Medium (51-100)</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-4 h-4" style={{ backgroundColor: 'rgba(59, 130, 246, 0.6)' }}></div>
                        <span>High (101-150)</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-4 h-4" style={{ backgroundColor: 'rgba(59, 130, 246, 0.8)' }}></div>
                        <span>Peak (151-200)</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-4 h-4" style={{ backgroundColor: 'rgba(59, 130, 246, 1)' }}></div>
                        <span>Max (200+)</span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Column Chart (vertical bar) */}
            {chart.type === 'column' && (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chart.data}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis
                    dataKey={Object.keys(chart.data[0] || {}).find(key => !['errors', 'recovered', 'requests', 'cost', 'value', 'count'].includes(key)) || 'hour'}
                    tick={{ fontSize: 10 }}
                    interval={chart.data.length > 10 ? 2 : 0}
                  />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip
                    formatter={(value: any, name: string) => [
                      name === 'cost' ? `$${value}` :
                        name === 'errors' || name === 'recovered' ? `${value} requests` :
                          value.toLocaleString(),
                      name.charAt(0).toUpperCase() + name.slice(1)
                    ]}
                  />
                  {Object.keys(chart.data[0] || {})
                    .filter(key => typeof chart.data[0][key] === 'number')
                    .map((key, index) => (
                      <Bar
                        key={key}
                        dataKey={key}
                        fill={COLORS[index % COLORS.length]}
                        radius={[8, 8, 0, 0]}
                        name={key.charAt(0).toUpperCase() + key.slice(1)}
                        animationBegin={0}
                        animationDuration={800}
                        animationEasing="ease-out"
                      />
                    ))
                  }
                  <Legend />
                </BarChart>
              </ResponsiveContainer>
            )}

            {/* Stacked Bar Chart */}
            {chart.type === 'stacked-bar' && (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chart.data}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis
                    dataKey={Object.keys(chart.data[0] || {}).find(key => key === 'department' || key === 'name' || key === 'category') || Object.keys(chart.data[0] || {})[0]}
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      border: '1px solid #E5E7EB',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                  {Object.keys(chart.data[0] || {})
                    .filter(key => typeof chart.data[0][key] === 'number')
                    .map((key, index) => (
                      <Bar
                        key={key}
                        dataKey={key}
                        stackId="a"
                        fill={COLORS[index % COLORS.length]}
                        name={key.charAt(0).toUpperCase() + key.slice(1)}
                        animationBegin={0}
                        animationDuration={800}
                        animationEasing="ease-out"
                        radius={[4, 4, 0, 0]}
                      />
                    ))
                  }
                  <Legend />
                </BarChart>
              </ResponsiveContainer>
            )}

            {/* Stacked Column Chart */}
            {chart.type === 'stackedColumn' && (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chart.data}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis
                    dataKey="timeSlot"
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip
                    formatter={(value: any) => `${value}%`}
                  />
                  {Object.keys(chart.data[0] || {})
                    .filter(key => key !== 'timeSlot' && key !== 'model' && typeof chart.data[0][key] === 'number')
                    .map((key, index) => (
                      <Bar
                        key={key}
                        dataKey={key}
                        stackId="a"
                        fill={COLORS[index % COLORS.length]}
                        animationBegin={0}
                        animationDuration={800}
                        animationEasing="ease-out"
                        radius={[4, 4, 0, 0]}
                      />
                    ))
                  }
                  <Legend />
                </BarChart>
              </ResponsiveContainer>
            )}

            {/* Combo Chart (bar + line) */}
            {chart.type === 'combo' && (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chart.data}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis
                    dataKey="day"
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis yAxisId="left" tick={{ fontSize: 12 }} />
                  <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar yAxisId="left" dataKey="requests" fill={COLORS[0]} radius={[4, 4, 0, 0]}>
                    {chart.data.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={index < 5 ? CHART_COLORS.blue : CHART_COLORS.orange}
                      />
                    ))}
                  </Bar>
                  <Legend />
                </BarChart>
              </ResponsiveContainer>
            )}


            {/* Map Chart - D3.js World Map */}
            {chart.type === 'map' && (
              <WorldMap data={chart.data} />
            )}

            {chart.type === 'table' && (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      {Object.keys(chart.data[0] || {}).map((key) => (
                        <th key={key} className="text-left p-2 font-medium text-muted-foreground">
                          {key.charAt(0).toUpperCase() + key.slice(1)}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {chart.data.map((row, rowIndex) => (
                      <tr key={rowIndex} className="border-b border-border/50">
                        {Object.entries(row).map(([key, value], cellIndex) => (
                          <td key={cellIndex} className="p-2">
                            {key === 'rate' ? (
                              <span className={`font-medium ${parseFloat(value as string) > 10 ? 'text-red-500' :
                                parseFloat(value as string) > 5 ? 'text-orange-500' :
                                  'text-green-500'
                                }`}>
                                {value as string}
                              </span>
                            ) : (
                              value as string
                            )}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};