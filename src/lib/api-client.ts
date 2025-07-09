const API_BASE = 'http://localhost:8001'; // Your backend URL - update if different

export interface AnalyticsData {
    summary: {
        total_requests: number;
        unique_companies: number;
        unique_models: number;
        total_cost: number;
        avg_latency: number;
    };
    breakdown: Array<{
        company_name: string;
        vendor: string;
        model: string;
        request_count: number;
        total_cost: number;
        avg_cost: number;
        total_input_tokens: number;
        total_output_tokens: number;
        avg_latency: number;
    }>;
    schema_info: {
        optimized: boolean;
        normalization: string;
        tables: number;
        foreign_keys: boolean;
    };
}

export interface AuthResponse {
    valid: boolean;
    company_id: string;
    company_name: string;
}

export interface HealthResponse {
    status: string;
    version: string;
    timestamp: string;
    uptime_seconds: number;
}

class APILensClient {
    private apiKey: string | null = null;
    private headers: Record<string, string> = {
        'Content-Type': 'application/json'
    };

    setApiKey(apiKey: string) {
        this.apiKey = apiKey;
        this.headers['Authorization'] = `Bearer ${apiKey}`;
    }

    // Validate API key
    async validateApiKey(apiKey: string): Promise<AuthResponse> {
        const response = await fetch(`${API_BASE}/auth/validate`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ api_key: apiKey })
        });

        if (!response.ok) {
            throw new Error(`Authentication failed: ${response.status}`);
        }

        return response.json();
    }

    // Get analytics data
    async getAnalytics(): Promise<AnalyticsData> {
        if (!this.apiKey) {
            throw new Error('API key not set');
        }

        const response = await fetch(`${API_BASE}/proxy/stats/optimized`, {
            headers: this.headers
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return response.json();
    }

    // Health check
    async checkHealth(): Promise<HealthResponse> {
        const response = await fetch(`${API_BASE}/health/detailed`);

        if (!response.ok) {
            throw new Error(`Health check failed: ${response.status}`);
        }

        return response.json();
    }

    // Get API key from localStorage or prompt user
    async getOrRequestApiKey(): Promise<string> {
        const storedKey = localStorage.getItem('apilens_api_key');

        if (storedKey) {
            try {
                await this.validateApiKey(storedKey);
                return storedKey;
            } catch (error) {
                localStorage.removeItem('apilens_api_key');
            }
        }

        // Prompt user for API key
        const apiKey = prompt('Please enter your ApiLens API key:');
        if (!apiKey) {
            throw new Error('API key is required');
        }

        // Validate the new key
        await this.validateApiKey(apiKey);

        // Store the valid key
        localStorage.setItem('apilens_api_key', apiKey);
        return apiKey;
    }
}

export const apiClient = new APILensClient();