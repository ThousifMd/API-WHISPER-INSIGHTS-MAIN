import express from 'express';
import cors from 'cors';

const app = express();
const PORT = 8001;

// Enable CORS for all origins
app.use(cors());
app.use(express.json());

// Mock data
const mockData = {
    summary: {
        total_requests: 4,
        unique_companies: 1,
        unique_models: 1,
        total_cost: 0.021,
        avg_latency: 400.0
    },
    breakdown: [{
        company_name: "TechCorp Inc",
        vendor: "openai",
        model: "gpt-4",
        request_count: 4,
        total_cost: 0.021,
        avg_cost: 0.00525,
        total_input_tokens: 350,
        total_output_tokens: 175,
        avg_latency: 400.0
    }],
    schema_info: {
        optimized: true,
        normalization: "Schema v2 (3NF)",
        tables: 8,
        foreign_keys: true
    }
};

// API endpoints
app.get('/proxy/stats/optimized', (req, res) => {
    console.log('Received request for analytics data');
    console.log('Authorization:', req.headers.authorization);
    res.json(mockData);
});

app.post('/auth/validate', (req, res) => {
    const { api_key } = req.body;
    console.log('Validating API key:', api_key);
    
    // Mock validation - accept any key starting with "als_"
    if (api_key && api_key.startsWith('als_')) {
        res.json({
            valid: true,
            company_id: "d74d5aa8-d092-4998-87eb-2b5ee447e710",
            company_name: "TechCorp Inc"
        });
    } else {
        res.status(401).json({ valid: false });
    }
});

app.get('/health/detailed', (req, res) => {
    res.json({
        status: "healthy",
        version: "1.0.0",
        timestamp: new Date().toISOString(),
        uptime_seconds: process.uptime()
    });
});

app.listen(PORT, () => {
    console.log(`Mock backend server running on http://localhost:${PORT}`);
    console.log('Available endpoints:');
    console.log('  GET  /proxy/stats/optimized');
    console.log('  POST /auth/validate');
    console.log('  GET  /health/detailed');
});