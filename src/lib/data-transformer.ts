import { AnalyticsData } from './api-client';

// Transform your backend data to match the frontend chart formats

export interface GeographicData {
  name: string;
  value: number;
  percentage?: number;
}

export interface PowerUser {
  userId: string;
  requests: number;
  cost: number;
  avgLatency: number;
  lastActive: string;
}

export interface TimeSeriesData {
  date: string;
  requests: number;
  cost: number;
  errors?: number;
}

// Transform backend data to geographic format for the world map
export const transformToGeographicData = (data: AnalyticsData): GeographicData[] => {
  // TODO: You'll need to add country field to your backend data
  // For now, we'll use company names as a placeholder
  const companyData = data.breakdown.reduce((acc, item) => {
    const company = item.company_name;
    if (!acc[company]) {
      acc[company] = { requests: 0, cost: 0 };
    }
    acc[company].requests += item.request_count;
    acc[company].cost += item.total_cost;
    return acc;
  }, {} as Record<string, { requests: number; cost: number }>);

  const total = Object.values(companyData).reduce((sum, c) => sum + c.requests, 0);

  return Object.entries(companyData)
    .map(([name, data]) => ({
      name,
      value: data.requests,
      percentage: Math.round((data.requests / total) * 100)
    }))
    .sort((a, b) => b.value - a.value);
};

// Transform to power users format
export const transformToPowerUsers = (data: AnalyticsData): PowerUser[] => {
  const companies = data.breakdown.reduce((acc, item) => {
    const company = item.company_name;
    if (!acc[company]) {
      acc[company] = {
        userId: company,
        requests: 0,
        cost: 0,
        totalLatency: 0,
        models: new Set<string>()
      };
    }
    acc[company].requests += item.request_count;
    acc[company].cost += item.total_cost;
    acc[company].totalLatency += item.avg_latency * item.request_count;
    acc[company].models.add(item.model);
    return acc;
  }, {} as Record<string, any>);

  return Object.values(companies)
    .map(c => ({
      userId: c.userId,
      requests: c.requests,
      cost: c.cost,
      avgLatency: Math.round(c.totalLatency / c.requests),
      lastActive: new Date().toISOString() // You'll need to add timestamp to backend
    }))
    .sort((a, b) => b.requests - a.requests)
    .slice(0, 10);
};

// Transform model usage data
export const transformToModelUsage = (data: AnalyticsData) => {
  const modelData = data.breakdown.reduce((acc, item) => {
    const model = item.model;
    if (!acc[model]) {
      acc[model] = { 
        name: model,
        requests: 0, 
        cost: 0, 
        totalLatency: 0,
        vendors: new Set<string>()
      };
    }
    acc[model].requests += item.request_count;
    acc[model].cost += item.total_cost;
    acc[model].totalLatency += item.avg_latency * item.request_count;
    acc[model].vendors.add(item.vendor);
    return acc;
  }, {} as Record<string, any>);

  return Object.values(modelData).map(m => ({
    model: m.name,
    requests: m.requests,
    cost: m.cost,
    avgLatency: Math.round(m.totalLatency / m.requests),
    vendors: Array.from(m.vendors).join(', ')
  }));
};

// Transform vendor breakdown for pie charts
export const transformToVendorBreakdown = (data: AnalyticsData) => {
  const vendorData = data.breakdown.reduce((acc, item) => {
    const vendor = item.vendor;
    if (!acc[vendor]) {
      acc[vendor] = { requests: 0, cost: 0 };
    }
    acc[vendor].requests += item.request_count;
    acc[vendor].cost += item.total_cost;
    return acc;
  }, {} as Record<string, any>);

  const totalCost = Object.values(vendorData).reduce((sum: number, v: any) => sum + v.cost, 0);

  return Object.entries(vendorData).map(([name, data]: [string, any]) => ({
    name,
    value: data.cost,
    percentage: Math.round((data.cost / totalCost) * 100)
  }));
};

// Generate metrics from backend data
export const generateMetrics = (data: AnalyticsData) => {
  const totalRequests = data.breakdown.reduce((sum, item) => sum + item.request_count, 0);
  const avgCostPerRequest = data.summary.total_cost / totalRequests;
  
  return {
    totalRequests: data.summary.total_requests,
    totalCost: data.summary.total_cost,
    avgLatency: Math.round(data.summary.avg_latency),
    uniqueModels: data.summary.unique_models,
    uniqueCompanies: data.summary.unique_companies,
    avgCostPerRequest: avgCostPerRequest.toFixed(3)
  };
};

// Placeholder for time series - you'll need to add timestamps to your backend
export const generateTimeSeriesData = (days: number = 30): TimeSeriesData[] => {
  const data = [];
  const now = new Date();
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    
    data.push({
      date: date.toISOString().split('T')[0],
      requests: Math.floor(Math.random() * 5000) + 1000,
      cost: Math.random() * 500 + 100,
      errors: Math.floor(Math.random() * 50)
    });
  }
  
  return data;
};