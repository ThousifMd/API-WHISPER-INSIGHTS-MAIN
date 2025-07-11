# Backend Integration Guide

## Current Setup
Your frontend expects data from these endpoints:

```typescript
// In api-client.ts
const API_BASE = 'http://localhost:8001';

// Current endpoint
GET /proxy/stats/optimized
```

## Required Backend Changes

### 1. Add Geographic Data to Your Backend

Your current backend returns company data but not geographic info. You need to add:

```python
# In your backend API
@app.get("/api/analytics/geographic")
async def get_geographic_data():
    # Query your database for user locations
    return {
        "countries": [
            {"name": "United States", "value": 124, "percentage": 35},
            {"name": "United Kingdom", "value": 87, "percentage": 24},
            {"name": "Germany", "value": 56, "percentage": 15},
            # ... more countries
        ]
    }
```

### 2. Add Time-Series Data

```python
@app.get("/api/analytics/timeseries")
async def get_timeseries_data(days: int = 30):
    # Query your logs with timestamps
    return {
        "daily": [
            {"date": "2024-01-01", "requests": 1523, "cost": 45.23, "errors": 12},
            {"date": "2024-01-02", "requests": 1654, "cost": 48.92, "errors": 8},
            # ... more days
        ]
    }
```

### 3. Add User-Level Analytics

```python
@app.get("/api/analytics/users")
async def get_user_analytics():
    return {
        "powerUsers": [
            {
                "userId": "john@company.com",
                "requests": 15420,
                "cost": 523.45,
                "avgLatency": 234,
                "lastActive": "2024-01-15T10:30:00Z",
                "country": "United States"  # Add this!
            }
        ],
        "growth": {
            "newUsers": 45,
            "churned": 12,
            "retained": 234
        }
    }
```

## Frontend Integration Steps

### Step 1: Update API Client

```typescript
// src/lib/api-client.ts
class APILensClient {
    // Add new methods
    async getGeographicData() {
        const response = await fetch(`${API_BASE}/api/analytics/geographic`, {
            headers: this.headers
        });
        return response.json();
    }
    
    async getUserAnalytics() {
        const response = await fetch(`${API_BASE}/api/analytics/users`, {
            headers: this.headers
        });
        return response.json();
    }
    
    async getTimeSeries(days: number = 30) {
        const response = await fetch(`${API_BASE}/api/analytics/timeseries?days=${days}`, {
            headers: this.headers
        });
        return response.json();
    }
}
```

### Step 2: Use Real Data in ChatInterface

```typescript
// In generateAnalyticsData function
if (input_lower.includes('geographic') || input_lower.includes('country')) {
    // Use real data if available
    if (backendData) {
        const geoData = await apiClient.getGeographicData();
        return {
            type: 'analytics',
            charts: [{
                type: 'map',
                title: 'Global User Distribution',
                data: geoData.countries
            }]
        };
    }
    // Fall back to mock data if backend unavailable
}
```

## Quick Start Without Backend Changes

If you can't modify your backend immediately, you can:

### Option 1: Use Static JSON Files
```typescript
// public/data/geographic.json
{
    "countries": [
        {"name": "United States", "value": 124},
        {"name": "United Kingdom", "value": 87}
    ]
}

// In your code
const response = await fetch('/data/geographic.json');
const geoData = await response.json();
```

### Option 2: Transform Existing Data
```typescript
// Use the data-transformer.ts we created
const existingData = await apiClient.getAnalytics();
const powerUsers = transformToPowerUsers(existingData);
const vendorBreakdown = transformToVendorBreakdown(existingData);
```

### Option 3: Proxy Through a Middleware
```javascript
// Simple Node.js proxy server
app.get('/api/transform/geographic', async (req, res) => {
    // Fetch from your existing API
    const data = await fetch('http://localhost:8001/proxy/stats/optimized');
    const json = await data.json();
    
    // Transform to geographic format
    // (You'd need to add country data to your user records)
    const geographic = transformToGeographic(json);
    
    res.json(geographic);
});
```

## Testing the Integration

1. Start your backend server
2. Update the API_BASE URL if needed
3. Check browser console for data fetching
4. The frontend will automatically use real data when available

## Fallback Strategy

The frontend is designed to fall back to mock data if the backend is unavailable, so you can develop incrementally:

```typescript
try {
    const realData = await apiClient.getUserAnalytics();
    // Use real data
} catch (error) {
    console.warn('Using mock data:', error);
    // Use existing mock data
}
```