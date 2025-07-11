// This is the complete ChatInterface with all analytics functionality
// Copy this content to src/components/chat/ChatInterface.tsx

import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage } from './ChatMessage';
import { MessageInput } from './MessageInput';
import { TypingIndicator } from './TypingIndicator';
import { SystemAlert } from './SystemAlert';
import { UserContextPanel } from './UserContextPanel';
import { useToast } from '@/hooks/use-toast';
import { apiClient, AnalyticsData } from '@/lib/api-client';
import { 
  transformToGeographicData, 
  transformToPowerUsers, 
  transformToModelUsage, 
  transformToVendorBreakdown,
  generateMetrics,
  generateTimeSeriesData 
} from '@/lib/data-transformer';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { User, LogOut, ChevronDown } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export interface Message {
  id: string;
  type: 'user' | 'ai' | 'system';
  content: string;
  timestamp: Date;
  userId?: string;
  analyticsData?: any;
  isLoading?: boolean;
}

export const ChatInterface: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'ai',
      content: 'Hello! I\'m your AI API Analyst. I can help you analyze API usage, costs, and performance. What would you like to explore today?',
      timestamp: new Date(),
    }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const [currentUserId, setCurrentUserId] = useState('');
  const [systemAlert, setSystemAlert] = useState<{ message: string; type: 'info' | 'warning' | 'error' } | null>(null);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser] = useState({
    name: 'John Doe',
    email: 'john.doe@techcorp.com',
    role: 'Admin'
  });
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initialize API connection
  useEffect(() => {
    const initializeAPI = async () => {
      try {
        // Skip API key validation for now and use mock data
        const mockAnalyticsData: AnalyticsData = {
          summary: {
            total_requests: 15678,
            unique_companies: 3,
            unique_models: 5,
            total_cost: 4523.67,
            avg_latency: 487
          },
          breakdown: [
            {
              company_name: "TechCorp Inc",
              vendor: "openai",
              model: "gpt-4",
              request_count: 3456,
              total_cost: 2035.65,
              avg_cost: 0.589,
              total_input_tokens: 234567,
              total_output_tokens: 123456,
              avg_latency: 654
            },
            {
              company_name: "TechCorp Inc",
              vendor: "anthropic",
              model: "claude-3",
              request_count: 1234,
              total_cost: 1130.92,
              avg_cost: 0.917,
              total_input_tokens: 98765,
              total_output_tokens: 54321,
              avg_latency: 892
            }
          ],
          schema_info: {
            optimized: true,
            normalization: "Schema v2 (3NF)",
            tables: 8,
            foreign_keys: true
          }
        };
        
        setAnalyticsData(mockAnalyticsData);
        setIsAuthenticated(true);
      } catch (error) {
        console.error('API initialization failed:', error);
        toast({
          title: "Connection Failed",
          description: "Unable to connect to ApiLens backend",
          variant: "destructive",
        });
      }
    };

    initializeAPI();
  }, [toast]);

  const handleSendMessage = async (content: string) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content,
      timestamp: new Date(),
      userId: currentUserId || undefined,
    };

    setMessages(prev => [...prev, userMessage]);
    setIsTyping(true);

    // Simulate AI response with analytics data
    setTimeout(async () => {
      const analyticsData = shouldIncludeAnalytics(content) ? await generateAnalyticsData(content) : undefined;
      console.log('Generated analytics data:', analyticsData);
      
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: generateAIResponse(content),
        timestamp: new Date(),
        analyticsData: analyticsData,
      };

      setMessages(prev => [...prev, aiResponse]);
      setIsTyping(false);
    }, 1500 + Math.random() * 1000);
  };

  const shouldIncludeAnalytics = (input: string): boolean => {
    const keywords = ['cost', 'spend', 'expensive', 'latency', 'performance', 'usage', 'error', 'distributed', 'audio', 'transcription', 'whisper', 'speech', 'video', 'visual', 'frame', 'media', 'multimedia', 'endpoints', 'pattern', 'throughout', 'user', 'users', 'customer', 'account', 'per-user', 'by user', 'individual', 'team', 'developer', 'department', 'power user', 'retention', 'growth', 'consumption', 'geographic', 'location', 'country', 'region', 'timezone', 'where'];
    return keywords.some(keyword => input.toLowerCase().includes(keyword));
  };

  const generateAnalyticsData = async (input: string) => {
    const input_lower = input.toLowerCase();
    
    // Fetch real data from backend
    let backendData: AnalyticsData | null = null;
    try {
      backendData = await apiClient.getAnalytics();
    } catch (error) {
      console.error('Failed to fetch backend data:', error);
      // Fall back to mock data if backend is not available
    }

    // Generate date range for the last 30 days
    const generateDateRange = (days: number) => {
      const dates = [];
      for (let i = days - 1; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        dates.push(date.toISOString().split('T')[0]);
      }
      return dates;
    };

    if (input_lower.includes('spend this month vs last month')) {
      const dates = generateDateRange(30);
      const dailyCosts = dates.map((date, index) => ({
        date,
        thisMonth: 140 + Math.random() * 50 + Math.sin(index / 3) * 25,
        lastMonth: 120 + Math.random() * 40 + Math.sin(index / 3) * 20
      }));

      const vendorData = [
        { name: 'OpenAI', value: 2940.38, percentage: 65 },
        { name: 'Anthropic', value: 1130.92, percentage: 25 },
        { name: 'Google', value: 361.89, percentage: 8 },
        { name: 'Others', value: 90.48, percentage: 2 }
      ];

      return {
        type: 'monthly-comparison',
        charts: [
          {
            type: 'area' as const,
            title: 'Daily Cost Comparison - This Month vs Last Month',
            data: dailyCosts
          },
          {
            type: 'pie' as const,
            title: 'Cost Distribution by Vendor (This Month)',
            data: vendorData
          }
        ],
        metrics: [
          { label: 'This Month', value: '$4,523.67', trend: '+17.7%', trending: 'up' as const },
          { label: 'Last Month', value: '$3,842.45', trend: '', trending: 'neutral' as const },
          { label: 'Projected', value: '$4,750.00', trend: '+5.0%', trending: 'up' as const }
        ]
      };
    } else if (input_lower.includes('highest latency')) {
      const scatterData = [
        { model: 'Claude-2', latency: 892, requests: 1234, cost: 0.917 },
        { model: 'GPT-4-Turbo', latency: 654, requests: 3456, cost: 0.589 },
        { model: 'PaLM-2', latency: 423, requests: 789, cost: 0.459 },
        { model: 'GPT-3.5', latency: 287, requests: 8901, cost: 0.102 },
        { model: 'Mistral-7B', latency: 156, requests: 2345, cost: 0.089 }
      ];

      const latencyData = [
        { name: 'Mistral-7B', latency: 156, type: 'Fast' },
        { name: 'GPT-3.5', latency: 287, type: 'Fast' },
        { name: 'PaLM-2', latency: 423, type: 'Medium' },
        { name: 'GPT-4-Turbo', latency: 654, type: 'Slow' },
        { name: 'Claude-2', latency: 892, type: 'Slow' }
      ];

      // Box plot data for latency distribution
      const boxPlotData = [
        {
          name: 'Claude-2',
          min: 645,
          q1: 768,
          median: 892,
          q3: 1023,
          max: 1456,
          mean: 915,
          outliers: [1890, 2034],
          minMaxRange: [645, 1456],
          iqrRange: [768, 1023]
        },
        {
          name: 'GPT-4-Turbo',
          min: 423,
          q1: 567,
          median: 654,
          q3: 745,
          max: 923,
          mean: 672,
          outliers: [1234],
          minMaxRange: [423, 923],
          iqrRange: [567, 745]
        },
        {
          name: 'PaLM-2',
          min: 234,
          q1: 356,
          median: 423,
          q3: 489,
          max: 612,
          mean: 431,
          outliers: [],
          minMaxRange: [234, 612],
          iqrRange: [356, 489]
        },
        {
          name: 'GPT-3.5',
          min: 123,
          q1: 234,
          median: 287,
          q3: 345,
          max: 456,
          mean: 295,
          outliers: [567, 678],
          minMaxRange: [123, 456],
          iqrRange: [234, 345]
        },
        {
          name: 'Mistral-7B',
          min: 89,
          q1: 123,
          median: 156,
          q3: 189,
          max: 234,
          mean: 162,
          outliers: [],
          minMaxRange: [89, 234],
          iqrRange: [123, 189]
        }
      ];

      return {
        type: 'latency-analysis',
        charts: [
          {
            type: 'scatter' as const,
            title: 'Latency vs Request Volume by Model',
            data: scatterData
          },
          {
            type: 'bar' as const,
            title: 'Model Latency Ranking',
            data: latencyData
          }
        ],
        metrics: [
          { label: 'Avg Latency', value: '487ms', trend: '-12%', trending: 'down' as const },
          { label: 'P95 Latency', value: '1,234ms', trend: '-8%', trending: 'down' as const },
          { label: 'Timeout Rate', value: '0.12%', trend: '-0.05%', trending: 'down' as const }
        ]
      };
    } else if (input_lower.includes('cost breakdown by vendor')) {
      const vendorData = [
        { name: 'OpenAI', cost: 3397.16 },
        { name: 'Anthropic', cost: 1130.92 },
        { name: 'Google', cost: 361.89 },
        { name: 'Others', cost: 90.48 }
      ];

      const modelData = [
        { name: 'GPT-4', value: 2035.65, percentage: 45 },
        { name: 'Claude-3', value: 1130.92, percentage: 25 },
        { name: 'GPT-3.5', value: 904.73, percentage: 20 },
        { name: 'Others', value: 452.37, percentage: 10 }
      ];

      return {
        type: 'cost-breakdown',
        charts: [
          {
            type: 'bar' as const,
            title: 'Cost Distribution by Vendor',
            data: vendorData
          },
          {
            type: 'donut' as const,
            title: 'Cost Breakdown by Model',
            data: modelData
          }
        ],
        metrics: [
          { label: 'Total Cost', value: '$4,523.67', trend: '+17.7%', trending: 'up' as const },
          { label: 'Avg Cost/Call', value: '$0.287', trend: '-5.2%', trending: 'down' as const },
          { label: 'Active Vendors', value: '4', trend: '+1', trending: 'up' as const }
        ]
      };
    } else if (input_lower.includes('whisper') && input_lower.includes('usage')) {
      // Specific Whisper API usage analytics
      const whisperVendorData = [
        { name: 'OpenAI Whisper', value: 489, percentage: 86.2 },
        { name: 'Google Speech-to-Text', value: 78, percentage: 13.8 }
      ];

      const whisperModelData = [
        { model: 'whisper-1', requests: 423, minutes: 1876.5, cost: 375.30 },
        { model: 'whisper-large-v2', requests: 66, minutes: 469.2, cost: 93.84 },
        { model: 'google-speech-v1', requests: 78, minutes: 234.3, cost: 46.86 }
      ];

      const whisperCostTrends = generateDateRange(7).map((date, index) => ({
        date,
        whisper: parseFloat((45 + Math.random() * 20 + Math.sin(index) * 10).toFixed(2)),
        googleSpeech: parseFloat((8 + Math.random() * 5 + Math.cos(index) * 3).toFixed(2)),
        total: parseFloat((53 + Math.random() * 25 + Math.sin(index) * 13).toFixed(2))
      }));

      return {
        type: 'whisper-usage',
        charts: [
          {
            type: 'donut' as const,
            title: 'Whisper vs Other Speech APIs',
            data: whisperVendorData
          },
          {
            type: 'bar' as const,
            title: 'API Usage by Model',
            data: whisperModelData
          },
          {
            type: 'line' as const,
            title: '7-Day Cost Comparison',
            data: whisperCostTrends
          }
        ],
        metrics: [
          { label: 'Total Minutes', value: '2,580', trend: '+23%', trending: 'up' as const },
          { label: 'Whisper Cost', value: '$469.14', trend: '+18%', trending: 'up' as const },
          { label: 'Cost/Minute', value: '$0.20', trend: '-5%', trending: 'down' as const }
        ]
      };
    } else if (input_lower.includes('transcription') && input_lower.includes('metrics')) {
      // Audio transcription metrics
      const accuracyData = [
        { language: 'English', wer: 4.2, cer: 2.1, accuracy: 95.8 },
        { language: 'Spanish', wer: 6.8, cer: 3.4, accuracy: 93.2 },
        { language: 'Mandarin', wer: 8.3, cer: 4.1, accuracy: 91.7 },
        { language: 'French', wer: 5.9, cer: 2.9, accuracy: 94.1 }
      ];

      const processingTimeData = [
        { duration: '0-1 min', avgTime: 2.3, count: 234 },
        { duration: '1-5 min', avgTime: 8.7, count: 178 },
        { duration: '5-10 min', avgTime: 18.4, count: 89 },
        { duration: '10-30 min', avgTime: 45.2, count: 45 },
        { duration: '30+ min', avgTime: 98.6, count: 21 }
      ];

      const successRateData = generateDateRange(14).map((date, index) => ({
        date,
        successRate: 95 + Math.random() * 4 + Math.sin(index / 2) * 2,
        failureRate: 5 - Math.random() * 4 - Math.sin(index / 2) * 2
      }));

      return {
        type: 'transcription-metrics',
        charts: [
          {
            type: 'bar' as const,
            title: 'Accuracy Metrics by Language',
            data: accuracyData
          },
          {
            type: 'column' as const,
            title: 'Processing Time by Duration',
            data: processingTimeData
          },
          {
            type: 'area' as const,
            title: '14-Day Success/Failure Rates',
            data: successRateData
          }
        ],
        metrics: [
          { label: 'Avg WER', value: '6.3%', trend: '-0.8%', trending: 'down' as const },
          { label: 'Success Rate', value: '97.2%', trend: '+1.3%', trending: 'up' as const },
          { label: 'Avg Process Time', value: '15.4s', trend: '-2.1s', trending: 'down' as const }
        ]
      };
    } else if ((input_lower.includes('speech') || input_lower.includes('audio')) && input_lower.includes('cost')) {
      // Speech/Audio processing costs
      const costByDuration = [
        { range: '0-1 min', totalCost: 45.67, avgCost: 0.195, count: 234 },
        { range: '1-5 min', totalCost: 134.89, avgCost: 0.757, count: 178 },
        { range: '5-10 min', totalCost: 156.23, avgCost: 1.755, count: 89 },
        { range: '10-30 min', totalCost: 89.45, avgCost: 1.988, count: 45 },
        { range: '30+ min', totalCost: 30.54, avgCost: 1.454, count: 21 }
      ];

      const costByProvider = [
        { provider: 'OpenAI', model: 'whisper-1', costPerMinute: 0.20, totalMinutes: 1876.5, totalCost: 375.30 },
        { provider: 'OpenAI', model: 'whisper-large', costPerMinute: 0.30, totalMinutes: 469.2, totalCost: 140.76 },
        { provider: 'Google', model: 'speech-v1', costPerMinute: 0.15, totalMinutes: 234.3, totalCost: 35.15 }
      ];

      const dailyCostTrend = generateDateRange(30).map((date, index) => ({
        date,
        cost: parseFloat((12 + Math.random() * 8 + Math.sin(index / 3) * 5).toFixed(2)),
        minutes: Math.floor(60 + Math.random() * 40 + Math.sin(index / 3) * 20)
      }));

      return {
        type: 'speech-costs',
        charts: [
          {
            type: 'bar' as const,
            title: 'Cost Distribution by Duration',
            data: costByDuration
          },
          {
            type: 'table' as const,
            title: 'Provider Cost Comparison',
            data: costByProvider
          },
          {
            type: 'area' as const,
            title: '30-Day Cost and Usage Trend',
            data: dailyCostTrend
          }
        ],
        metrics: [
          { label: 'Total Cost', value: '$456.78', trend: '+22%', trending: 'up' as const },
          { label: 'Avg Cost/Min', value: '$0.195', trend: '-$0.02', trending: 'down' as const },
          { label: 'Peak Day Cost', value: '$24.56', trend: '+$3.45', trending: 'up' as const }
        ]
      };
    } else if (input_lower.includes('audio') || input_lower.includes('transcription') || input_lower.includes('speech')) {
      // Audio processing analytics
      const languageData = [
        { name: 'English', value: 423, percentage: 74.6 },
        { name: 'Spanish', value: 67, percentage: 11.8 },
        { name: 'Mandarin', value: 34, percentage: 6.0 },
        { name: 'French', value: 23, percentage: 4.1 },
        { name: 'Others', value: 20, percentage: 3.5 }
      ];

      const audioTrends = generateDateRange(14).map((date, index) => ({
        date,
        requests: Math.floor(30 + Math.random() * 20 + Math.sin(index / 2) * 10),
        minutes: Math.floor(120 + Math.random() * 80 + Math.sin(index / 2) * 40),
        cost: parseFloat((15 + Math.random() * 10 + Math.sin(index / 2) * 5).toFixed(2))
      }));

      const useCaseData = [
        { useCase: 'Meeting Transcription', requests: 234, avgDuration: 45.2 },
        { useCase: 'Voice Commands', requests: 178, avgDuration: 0.5 },
        { useCase: 'Podcast Analysis', requests: 89, avgDuration: 35.7 },
        { useCase: 'Customer Support', requests: 66, avgDuration: 8.3 }
      ];

      return {
        type: 'audio-analysis',
        charts: [
          {
            type: 'pie' as const,
            title: 'Audio Requests by Language',
            data: languageData
          },
          {
            type: 'area' as const,
            title: '14-Day Audio Processing Trends',
            data: audioTrends
          },
          {
            type: 'bar' as const,
            title: 'Audio Use Cases Distribution',
            data: useCaseData
          }
        ],
        metrics: [
          { label: 'Total Audio', value: '39.1 hours', trend: '+45%', trending: 'up' as const },
          { label: 'Avg Duration', value: '4.14 min', trend: '+0.3', trending: 'up' as const },
          { label: 'Success Rate', value: '98.4%', trend: '+1.2%', trending: 'up' as const }
        ]
      };
    } else if (input_lower.includes('video') || input_lower.includes('visual') || input_lower.includes('frame')) {
      // Video processing analytics
      const resolutionData = [
        { name: '1920x1080', value: 56, percentage: 62.9 },
        { name: '1280x720', value: 23, percentage: 25.8 },
        { name: '3840x2160', value: 8, percentage: 9.0 },
        { name: 'Other', value: 2, percentage: 2.3 }
      ];

      const videoProcessingData = [
        { process: 'Frame Analysis', videos: 89, avgTime: 12.4, cost: 145.67 },
        { process: 'Audio Track', videos: 76, avgTime: 8.2, cost: 67.89 },
        { process: 'Full Analysis', videos: 45, avgTime: 24.6, cost: 234.56 }
      ];

      const videoTrends = generateDateRange(7).map((date, index) => ({
        date,
        videos: Math.floor(10 + Math.random() * 8 + Math.sin(index) * 3),
        minutes: Math.floor(50 + Math.random() * 30 + Math.sin(index) * 15),
        frames: Math.floor(250 + Math.random() * 100 + Math.sin(index) * 50)
      }));

      return {
        type: 'video-analysis',
        charts: [
          {
            type: 'donut' as const,
            title: 'Video Resolution Distribution',
            data: resolutionData
          },
          {
            type: 'bar' as const,
            title: 'Video Processing Analysis',
            data: videoProcessingData
          },
          {
            type: 'line' as const,
            title: '7-Day Video Processing Activity',
            data: videoTrends
          }
        ],
        metrics: [
          { label: 'Total Videos', value: '89', trend: '+120%', trending: 'up' as const },
          { label: 'Avg Duration', value: '5.13 min', trend: '+0.8', trending: 'up' as const },
          { label: 'Frame Accuracy', value: '94.7%', trend: '+2.3%', trending: 'up' as const }
        ]
      };
    } else if (input_lower.includes('media') || input_lower.includes('multimedia')) {
      // Combined media analytics
      const mediaTypeData = [
        { name: 'Audio', value: 567, percentage: 56.8, cost: 456.78 },
        { name: 'Images', value: 342, percentage: 34.3, cost: 567.89 },
        { name: 'Video', value: 89, percentage: 8.9, cost: 234.56 }
      ];

      const mediaCostComparison = [
        { type: 'Text (GPT-4)', avgCost: 0.287, avgLatency: 487, requests: 13621 },
        { type: 'Audio (Whisper)', avgCost: 0.806, avgLatency: 3456, requests: 567 },
        { type: 'Images (Vision)', avgCost: 1.660, avgLatency: 2134, requests: 342 },
        { type: 'Video (Multi-Modal)', avgCost: 2.640, avgLatency: 8234, requests: 89 }
      ];

      const mediaTrends = generateDateRange(30).map((date, index) => ({
        date,
        text: Math.floor(400 + Math.random() * 100),
        audio: Math.floor(15 + Math.random() * 10),
        images: Math.floor(10 + Math.random() * 5),
        video: Math.floor(2 + Math.random() * 3)
      }));

      return {
        type: 'media-analysis',
        charts: [
          {
            type: 'pie' as const,
            title: 'Media Processing Distribution',
            data: mediaTypeData
          },
          {
            type: 'bubble' as const,
            title: 'Cost vs Latency by Media Type',
            data: mediaCostComparison.map(m => ({
              name: m.type,
              x: m.avgLatency,
              y: m.avgCost,
              z: Math.sqrt(m.requests) * 2  // Better scaling for bubble sizes
            }))
          },
          {
            type: 'area' as const,
            title: '30-Day Media Processing Trends',
            data: mediaTrends
          }
        ],
        metrics: [
          { label: 'Media Requests', value: '998', trend: '+34%', trending: 'up' as const },
          { label: 'Media Cost', value: '$1,259.23', trend: '+28%', trending: 'up' as const },
          { label: 'Processing Time', value: '4.2s avg', trend: '-12%', trending: 'down' as const }
        ]
      };
    } else if (input_lower.includes('top 5 most expensive') || input_lower.includes('expensive api endpoints')) {
      // Top 5 most expensive API endpoints
      const endpointData = [
        { 
          endpoint: '/api/v1/video/analyze', 
          calls: 89, 
          totalCost: 234.56, 
          avgCost: 2.640,
          vendor: 'OpenAI',
          model: 'GPT-4-Vision'
        },
        { 
          endpoint: '/api/v2/image-analysis', 
          calls: 342, 
          totalCost: 567.89, 
          avgCost: 1.660,
          vendor: 'OpenAI',
          model: 'GPT-4-Vision'
        },
        { 
          endpoint: '/api/v1/chat/complete-advanced', 
          calls: 1234, 
          totalCost: 1130.92, 
          avgCost: 0.917,
          vendor: 'Anthropic',
          model: 'Claude-3'
        },
        { 
          endpoint: '/api/v1/audio/transcribe', 
          calls: 567, 
          totalCost: 456.78, 
          avgCost: 0.806,
          vendor: 'OpenAI',
          model: 'Whisper'
        },
        { 
          endpoint: '/api/v1/chat/complete', 
          calls: 3456, 
          totalCost: 2035.65, 
          avgCost: 0.589,
          vendor: 'OpenAI',
          model: 'GPT-4'
        }
      ];

      const costTrends = generateDateRange(7).map((date, index) => ({
        date,
        '/api/v1/video/analyze': parseFloat((30 + Math.random() * 10).toFixed(2)),
        '/api/v2/image-analysis': parseFloat((80 + Math.random() * 20).toFixed(2)),
        '/api/v1/chat/complete-advanced': parseFloat((160 + Math.random() * 30).toFixed(2)),
        '/api/v1/audio/transcribe': parseFloat((65 + Math.random() * 15).toFixed(2)),
        '/api/v1/chat/complete': parseFloat((290 + Math.random() * 40).toFixed(2))
      }));

      return {
        type: 'expensive-endpoints',
        charts: [
          {
            type: 'bar' as const,
            title: 'Top 5 Most Expensive API Endpoints',
            data: endpointData.map(item => ({
              name: item.endpoint,
              totalCost: item.totalCost,
              avgCost: item.avgCost,
              calls: item.calls
            }))
          },
          {
            type: 'line' as const,
            title: '7-Day Cost Trends for Top Endpoints',
            data: costTrends
          }
        ],
        metrics: [
          { label: 'Top Endpoint Cost', value: '$2,035.65', trend: '+23%', trending: 'up' as const },
          { label: 'Combined Top 5', value: '$4,425.80', trend: '+19%', trending: 'up' as const },
          { label: 'Cost Concentration', value: '97.8%', trend: '+2.1%', trending: 'up' as const }
        ]
      };
    } else if (input_lower.includes('errors distributed') || input_lower.includes('error distribution')) {
      // API errors distribution
      const errorTypeData = [
        { name: 'Rate Limit (429)', value: 234, percentage: 45.2 },
        { name: 'Timeout (504)', value: 123, percentage: 23.7 },
        { name: 'Bad Request (400)', value: 89, percentage: 17.2 },
        { name: 'Server Error (500)', value: 45, percentage: 8.7 },
        { name: 'Auth Failed (401)', value: 27, percentage: 5.2 }
      ];

      const errorByVendorData = [
        { vendor: 'OpenAI', errors: 312, errorRate: 2.3 },
        { vendor: 'Anthropic', errors: 134, errorRate: 3.9 },
        { vendor: 'Google', errors: 45, errorRate: 1.2 },
        { vendor: 'Others', errors: 27, errorRate: 0.8 }
      ];

      const errorTrends = generateDateRange(24).map((date, index) => ({
        hour: index,
        'Rate Limit': Math.floor(5 + Math.random() * 15 + (index >= 9 && index <= 17 ? 10 : 0)),
        'Timeout': Math.floor(2 + Math.random() * 8),
        'Bad Request': Math.floor(1 + Math.random() * 5),
        'Server Error': Math.floor(Math.random() * 3),
        'Auth Failed': Math.floor(Math.random() * 2)
      }));

      return {
        type: 'error-distribution',
        charts: [
          {
            type: 'donut' as const,
            title: 'Error Distribution by Type',
            data: errorTypeData
          },
          {
            type: 'bar' as const,
            title: 'Error Rate by Vendor',
            data: errorByVendorData
          },
          {
            type: 'area' as const,
            title: '24-Hour Error Pattern',
            data: errorTrends
          }
        ],
        metrics: [
          { label: 'Total Errors', value: '518', trend: '-12%', trending: 'down' as const },
          { label: 'Error Rate', value: '3.3%', trend: '-0.5%', trending: 'down' as const },
          { label: 'MTTR', value: '4.2 min', trend: '-1.3 min', trending: 'down' as const }
        ]
      };
    } else if (input_lower.includes('usage pattern') || input_lower.includes('throughout the day')) {
      // Usage pattern throughout the day
      const hourlyUsageData = Array.from({ length: 24 }, (_, hour) => {
        const baseLoad = hour >= 9 && hour <= 17 ? 400 : 100;
        const variation = Math.random() * 100;
        const peakMultiplier = hour === 14 ? 1.5 : 1;
        
        return {
          hour: `${hour.toString().padStart(2, '0')}:00`,
          requests: Math.floor((baseLoad + variation) * peakMultiplier),
          cost: parseFloat(((baseLoad + variation) * peakMultiplier * 0.287).toFixed(2)),
          avgLatency: Math.floor(300 + Math.random() * 200 + (hour >= 12 && hour <= 15 ? 100 : 0))
        };
      });

      const dayOfWeekPattern = [
        { day: 'Monday', requests: 15234, cost: 4372.36 },
        { day: 'Tuesday', requests: 16789, cost: 4818.57 },
        { day: 'Wednesday', requests: 17234, cost: 4946.17 },
        { day: 'Thursday', requests: 16890, cost: 4847.43 },
        { day: 'Friday', requests: 14567, cost: 4180.73 },
        { day: 'Saturday', requests: 3456, cost: 991.87 },
        { day: 'Sunday', requests: 2890, cost: 829.43 }
      ];

      const peakHoursData = [
        { name: 'Night (00:00-06:00)', value: 2345, percentage: 5.2 },
        { name: 'Morning (06:00-09:00)', value: 4567, percentage: 10.1 },
        { name: 'Late Morning (09:00-12:00)', value: 12345, percentage: 27.3 },
        { name: 'Afternoon (12:00-15:00)', value: 15678, percentage: 34.7 },
        { name: 'Evening (15:00-18:00)', value: 8901, percentage: 19.7 },
        { name: 'Night (18:00-00:00)', value: 1345, percentage: 3.0 }
      ];

      // Generate heatmap data for usage intensity
      const heatmapData = [];
      const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
      for (let hour = 0; hour < 24; hour++) {
        const hourStr = hour.toString().padStart(2, '0') + ':00';
        days.forEach(day => {
          // Simulate realistic usage patterns
          let baseUsage = 50;
          
          // Lower usage on weekends
          if (day === 'Sat' || day === 'Sun') {
            baseUsage = 20;
          }
          
          // Peak hours during business days
          if (hour >= 9 && hour <= 17 && day !== 'Sat' && day !== 'Sun') {
            baseUsage = 150 + Math.sin((hour - 9) * Math.PI / 8) * 100;
          } else if (hour >= 0 && hour < 6) {
            baseUsage = 10; // Very low at night
          } else if (hour >= 18 && hour <= 23) {
            baseUsage = 40; // Moderate evening usage
          }
          
          // Add some randomness
          const usage = Math.floor(baseUsage + Math.random() * 30 - 15);
          
          heatmapData.push({
            hour: hourStr,
            day: day,
            errors: Math.max(0, usage) // Using 'errors' field as the heatmap expects it
          });
        });
      }

      return {
        type: 'usage-pattern',
        charts: [
          {
            type: 'heatmap' as const,
            title: 'Weekly Usage Heatmap',
            data: heatmapData
          },
          {
            type: 'line' as const,
            title: '24-Hour Usage Pattern',
            data: hourlyUsageData
          },
          {
            type: 'bar' as const,
            title: 'Weekly Usage Distribution',
            data: dayOfWeekPattern
          }
        ],
        metrics: [
          { label: 'Peak Hour', value: '14:00', trend: 'No change', trending: 'neutral' as const },
          { label: 'Off-Peak Savings', value: '$892.34', trend: '+15%', trending: 'up' as const },
          { label: 'Weekend Usage', value: '8.7%', trend: '-2.3%', trending: 'down' as const }
        ]
      };
    } else if (input_lower.includes('power user') && input_lower.includes('pattern')) {
      // Power users and their API patterns
      const powerUserPatterns = [
        { 
          user: 'John Doe', 
          totalRequests: 4567, 
          favoriteModels: ['GPT-4 (65%)', 'Claude-3 (25%)', 'GPT-3.5 (10%)'],
          peakHours: '9AM-11AM, 2PM-4PM',
          avgRequestSize: '2.3KB',
          successRate: '98.8%'
        },
        { 
          user: 'Jane Smith', 
          totalRequests: 3456, 
          favoriteModels: ['Claude-3 (45%)', 'GPT-4 (40%)', 'Whisper (15%)'],
          peakHours: '10AM-12PM, 3PM-5PM',
          avgRequestSize: '3.1KB',
          successRate: '97.7%'
        },
        { 
          user: 'Bob Johnson', 
          totalRequests: 2345, 
          favoriteModels: ['GPT-3.5 (60%)', 'GPT-4 (30%)', 'DALL-E (10%)'],
          peakHours: '8AM-10AM, 1PM-3PM',
          avgRequestSize: '1.8KB',
          successRate: '99.2%'
        },
        { 
          user: 'Alice Williams', 
          totalRequests: 1890, 
          favoriteModels: ['Whisper (70%)', 'GPT-4 (20%)', 'Claude-3 (10%)'],
          peakHours: '11AM-1PM, 4PM-6PM',
          avgRequestSize: '5.2KB',
          successRate: '96.5%'
        }
      ];

      const powerUserTrends = generateDateRange(14).map((date, index) => ({
        date,
        'John Doe': Math.floor(150 + Math.random() * 50),
        'Jane Smith': Math.floor(120 + Math.random() * 40),
        'Bob Johnson': Math.floor(80 + Math.random() * 30),
        'Alice Williams': Math.floor(60 + Math.random() * 20)
      }));

      const costByPowerUser = [
        { user: 'John Doe', thisMonth: 1234.56, lastMonth: 987.65, change: '+24.9%' },
        { user: 'Jane Smith', thisMonth: 987.65, lastMonth: 876.54, change: '+12.7%' },
        { user: 'Bob Johnson', thisMonth: 678.90, lastMonth: 712.34, change: '-4.7%' },
        { user: 'Alice Williams', thisMonth: 567.89, lastMonth: 423.45, change: '+34.1%' }
      ];

      return {
        type: 'power-user-patterns',
        charts: [
          {
            type: 'table' as const,
            title: 'Power User API Patterns',
            data: powerUserPatterns
          },
          {
            type: 'line' as const,
            title: '14-Day Request Trends - Power Users',
            data: powerUserTrends
          },
          {
            type: 'bar' as const,
            title: 'Cost Comparison - Power Users',
            data: costByPowerUser
          }
        ],
        metrics: [
          { label: 'Power Users', value: '4', trend: '+1', trending: 'up' as const },
          { label: 'Combined Requests', value: '12,258', trend: '+18%', trending: 'up' as const },
          { label: 'Power User Cost', value: '$3,469.00', trend: '+19.2%', trending: 'up' as const },
          { label: '% of Total Cost', value: '76.7%', trend: '+3.4%', trending: 'up' as const }
        ]
      };
    } else if ((input_lower.includes('team') || input_lower.includes('department')) && input_lower.includes('usage')) {
      // Department/Team usage analytics
      const departmentData = [
        { 
          department: 'Engineering',
          users: 15,
          totalRequests: 34567,
          totalCost: 2567.89,
          avgCostPerUser: 171.19,
          topModels: ['GPT-4', 'Claude-3'],
          growthRate: '+23%'
        },
        { 
          department: 'Data Science',
          users: 8,
          totalRequests: 23456,
          totalCost: 1234.56,
          avgCostPerUser: 154.32,
          topModels: ['GPT-4', 'Whisper'],
          growthRate: '+45%'
        },
        { 
          department: 'Product',
          users: 6,
          totalRequests: 12345,
          totalCost: 567.89,
          avgCostPerUser: 94.65,
          topModels: ['Claude-3', 'GPT-3.5'],
          growthRate: '+12%'
        },
        { 
          department: 'Marketing',
          users: 5,
          totalRequests: 8901,
          totalCost: 345.67,
          avgCostPerUser: 69.13,
          topModels: ['DALL-E', 'GPT-3.5'],
          growthRate: '+67%'
        },
        { 
          department: 'Support',
          users: 4,
          totalRequests: 5678,
          totalCost: 234.56,
          avgCostPerUser: 58.64,
          topModels: ['GPT-3.5', 'Claude-3'],
          growthRate: '-8%'
        }
      ];

      const departmentTrends = generateDateRange(30).map((date, index) => ({
        date,
        Engineering: Math.floor(800 + Math.random() * 200 + Math.sin(index / 3) * 100),
        'Data Science': Math.floor(600 + Math.random() * 150 + Math.sin(index / 3) * 80),
        Product: Math.floor(300 + Math.random() * 100 + Math.sin(index / 3) * 50),
        Marketing: Math.floor(200 + Math.random() * 80 + Math.sin(index / 3) * 40),
        Support: Math.floor(150 + Math.random() * 50 + Math.sin(index / 3) * 25)
      }));

      const modelUsageByDept = [
        { department: 'Engineering', 'GPT-4': 15678, 'Claude-3': 12345, 'GPT-3.5': 6544 },
        { department: 'Data Science', 'GPT-4': 13456, 'Whisper': 8765, 'Claude-3': 1235 },
        { department: 'Product', 'Claude-3': 6789, 'GPT-3.5': 4567, 'GPT-4': 989 },
        { department: 'Marketing', 'DALL-E': 4567, 'GPT-3.5': 3456, 'Claude-3': 878 },
        { department: 'Support', 'GPT-3.5': 3456, 'Claude-3': 1678, 'GPT-4': 544 }
      ];

      return {
        type: 'department-usage',
        charts: [
          {
            type: 'table' as const,
            title: 'Department Usage Summary',
            data: departmentData
          },
          {
            type: 'area' as const,
            title: '30-Day Department Usage Trends',
            data: departmentTrends
          },
          {
            type: 'stacked-bar' as const,
            title: 'Model Usage by Department',
            data: modelUsageByDept
          }
        ],
        metrics: [
          { label: 'Total Departments', value: '5', trend: '', trending: 'neutral' as const },
          { label: 'Total Users', value: '38', trend: '+5', trending: 'up' as const },
          { label: 'Avg Cost/Dept', value: '$990.14', trend: '+$123.45', trending: 'up' as const },
          { label: 'Most Active', value: 'Engineering', trend: '', trending: 'neutral' as const }
        ]
      };
    } else if (input_lower.includes('growth') && (input_lower.includes('user') || input_lower.includes('retention'))) {
      // User growth and retention metrics
      const monthlyGrowth = generateDateRange(180).map((date, index) => {
        const month = Math.floor(index / 30);
        const baseUsers = 20 + month * 5;
        return {
          date,
          totalUsers: Math.floor(baseUsers + Math.random() * 3),
          activeUsers: Math.floor(baseUsers * 0.8 + Math.random() * 2),
          newUsers: index % 30 === 15 ? Math.floor(Math.random() * 5 + 2) : Math.floor(Math.random() * 2)
        };
      });

      const retentionCohorts = [
        { cohort: 'Jan 2024', month0: 100, month1: 94, month2: 89, month3: 85, month4: 82, month5: 80 },
        { cohort: 'Feb 2024', month0: 100, month1: 92, month2: 87, month3: 84, month4: 81, month5: 79 },
        { cohort: 'Mar 2024', month0: 100, month1: 95, month2: 91, month3: 88, month4: 86, month5: 84 },
        { cohort: 'Apr 2024', month0: 100, month1: 96, month2: 93, month3: 90, month4: 88, month5: null },
        { cohort: 'May 2024', month0: 100, month1: 97, month2: 94, month3: 92, month4: null, month5: null },
        { cohort: 'Jun 2024', month0: 100, month1: 98, month2: 95, month3: null, month4: null, month5: null }
      ];

      const userSegmentation = [
        { segment: 'New Users (< 1 month)', count: 8, percentage: 16, avgRequests: 234 },
        { segment: 'Growing (1-3 months)', count: 12, percentage: 24, avgRequests: 567 },
        { segment: 'Established (3-6 months)', count: 18, percentage: 36, avgRequests: 890 },
        { segment: 'Power Users (> 6 months)', count: 12, percentage: 24, avgRequests: 1234 }
      ];

      const churnAnalysis = [
        { name: 'Cost concerns', value: 3, percentage: 37.5 },
        { name: 'Switched provider', value: 2, percentage: 25.0 },
        { name: 'Project ended', value: 2, percentage: 25.0 },
        { name: 'Performance issues', value: 1, percentage: 12.5 }
      ];

      return {
        type: 'growth-retention',
        charts: [
          {
            type: 'area' as const,
            title: '6-Month User Growth Trends',
            data: monthlyGrowth.filter((_, index) => index % 3 === 0) // Sample every 3 days
          },
          {
            type: 'table' as const,
            title: 'User Retention Cohorts',
            data: retentionCohorts
          },
          {
            type: 'bar' as const,
            title: 'User Segmentation',
            data: userSegmentation
          },
          {
            type: 'pie' as const,
            title: 'Churn Reasons (Last 90 Days)',
            data: churnAnalysis
          }
        ],
        metrics: [
          { label: 'Total Users', value: '50', trend: '+8', trending: 'up' as const },
          { label: 'MAU Growth', value: '+19%', trend: '+4%', trending: 'up' as const },
          { label: '3-Month Retention', value: '88%', trend: '+3%', trending: 'up' as const },
          { label: 'Churn Rate', value: '2.1%', trend: '-0.5%', trending: 'down' as const }
        ]
      };
    } else if ((input_lower.includes('geographic') || input_lower.includes('location') || input_lower.includes('country') || input_lower.includes('region') || (input_lower.includes('where') && input_lower.includes('users'))) && !input_lower.includes('cost')) {
      // Geographic user distribution
      const countryData = [
        { name: 'United States', value: 18, percentage: 36 },
        { name: 'United Kingdom', value: 8, percentage: 16 },
        { name: 'Germany', value: 6, percentage: 12 },
        { name: 'Canada', value: 5, percentage: 10 },
        { name: 'Japan', value: 4, percentage: 8 },
        { name: 'France', value: 3, percentage: 6 },
        { name: 'Australia', value: 3, percentage: 6 },
        { name: 'Others', value: 3, percentage: 6 }
      ];

      const regionData = [
        { region: 'North America', users: 23, requests: 98234, avgLatency: 145, totalCost: 2345.67 },
        { region: 'Europe', users: 17, requests: 67890, avgLatency: 234, totalCost: 1678.90 },
        { region: 'Asia Pacific', users: 7, requests: 23456, avgLatency: 456, totalCost: 567.89 },
        { region: 'South America', users: 2, requests: 5678, avgLatency: 567, totalCost: 123.45 },
        { region: 'Africa', users: 1, requests: 1234, avgLatency: 678, totalCost: 34.56 }
      ];

      const topCities = [
        { city: 'New York', country: 'USA', users: 5, percentage: 10 },
        { city: 'London', country: 'UK', users: 4, percentage: 8 },
        { city: 'San Francisco', country: 'USA', users: 4, percentage: 8 },
        { city: 'Berlin', country: 'Germany', users: 3, percentage: 6 },
        { city: 'Toronto', country: 'Canada', users: 3, percentage: 6 },
        { city: 'Tokyo', country: 'Japan', users: 2, percentage: 4 },
        { city: 'Paris', country: 'France', users: 2, percentage: 4 },
        { city: 'Sydney', country: 'Australia', users: 2, percentage: 4 }
      ];

      const timezoneActivity = [
        { timezone: 'PST/PDT (UTC-8)', users: 8, peakHour: '10:00 AM', avgRequests: 3456 },
        { timezone: 'EST/EDT (UTC-5)', users: 10, peakHour: '2:00 PM', avgRequests: 4567 },
        { timezone: 'GMT/BST (UTC+0)', users: 8, peakHour: '3:00 PM', avgRequests: 2345 },
        { timezone: 'CET/CEST (UTC+1)', users: 9, peakHour: '4:00 PM', avgRequests: 3456 },
        { timezone: 'JST (UTC+9)', users: 4, peakHour: '11:00 AM', avgRequests: 1234 },
        { timezone: 'AEST (UTC+10)', users: 3, peakHour: '9:00 AM', avgRequests: 890 }
      ];

      return {
        type: 'geographic-analytics',
        charts: [
          {
            type: 'map' as const,
            title: 'Global User Distribution',
            data: countryData
          },
          {
            type: 'bar' as const,
            title: 'Users and Activity by Region',
            data: regionData
          },
          {
            type: 'donut' as const,
            title: 'User Distribution by Country',
            data: countryData
          },
          {
            type: 'table' as const,
            title: 'Activity by Timezone',
            data: timezoneActivity
          }
        ],
        metrics: [
          { label: 'Countries', value: '15', trend: '+3', trending: 'up' as const },
          { label: 'Top Country', value: 'USA (36%)', trend: '', trending: 'neutral' as const },
          { label: 'Avg Latency', value: '287ms', trend: '-23ms', trending: 'down' as const },
          { label: 'Global Coverage', value: '5 continents', trend: '', trending: 'neutral' as const }
        ]
      };
    } else if (input_lower.includes('per-user') || input_lower.includes('consumption')) {
      // Per-user consumption breakdown
      const userConsumption = [
        { 
          user: 'John Doe',
          requests: 4567,
          cost: 1234.56,
          inputTokens: 2345678,
          outputTokens: 1234567,
          avgLatency: 456,
          errorRate: '1.2%',
          topEndpoints: ['/chat/complete', '/embeddings', '/audio/transcribe']
        },
        { 
          user: 'Jane Smith',
          requests: 3456,
          cost: 987.65,
          inputTokens: 1876543,
          outputTokens: 987654,
          avgLatency: 523,
          errorRate: '2.3%',
          topEndpoints: ['/chat/complete-advanced', '/image-analysis', '/chat/complete']
        },
        { 
          user: 'Bob Johnson',
          requests: 2345,
          cost: 678.90,
          inputTokens: 1234567,
          outputTokens: 654321,
          avgLatency: 398,
          errorRate: '0.8%',
          topEndpoints: ['/chat/complete', '/text-analysis', '/embeddings']
        },
        { 
          user: 'Alice Williams',
          requests: 1890,
          cost: 567.89,
          inputTokens: 987654,
          outputTokens: 543210,
          avgLatency: 612,
          errorRate: '3.4%',
          topEndpoints: ['/audio/transcribe', '/chat/complete', '/speech/generate']
        },
        { 
          user: 'Charlie Brown',
          requests: 1234,
          cost: 345.67,
          inputTokens: 654321,
          outputTokens: 345678,
          avgLatency: 445,
          errorRate: '1.5%',
          topEndpoints: ['/chat/complete', '/embeddings', '/text-analysis']
        }
      ];

      const dailyConsumption = generateDateRange(7).map((date, index) => ({
        date,
        'John Doe': parseFloat((170 + Math.random() * 30).toFixed(2)),
        'Jane Smith': parseFloat((140 + Math.random() * 25).toFixed(2)),
        'Bob Johnson': parseFloat((95 + Math.random() * 20).toFixed(2)),
        'Alice Williams': parseFloat((80 + Math.random() * 15).toFixed(2)),
        'Charlie Brown': parseFloat((45 + Math.random() * 10).toFixed(2))
      }));

      const tokenUsageByUser = userConsumption.map(user => ({
        name: user.user,
        inputTokens: user.inputTokens,
        outputTokens: user.outputTokens,
        ratio: (user.outputTokens / user.inputTokens).toFixed(2)
      }));

      return {
        type: 'per-user-consumption',
        charts: [
          {
            type: 'table' as const,
            title: 'Per-User API Consumption Details',
            data: userConsumption
          },
          {
            type: 'line' as const,
            title: '7-Day Cost Trends by User',
            data: dailyConsumption
          },
          {
            type: 'bar' as const,
            title: 'Token Usage by User',
            data: tokenUsageByUser
          }
        ],
        metrics: [
          { label: 'Avg Cost/User', value: '$90.47', trend: '-$12.34', trending: 'down' as const },
          { label: 'Avg Requests/User', value: '387', trend: '+45', trending: 'up' as const },
          { label: 'Top Consumer', value: 'John Doe', trend: '', trending: 'neutral' as const },
          { label: 'Cost Variance', value: '±$345.67', trend: '-$23.45', trending: 'down' as const }
        ]
      };
    } else if (input_lower.includes('user') && input_lower.includes('analytics') && !input_lower.includes('power') && !input_lower.includes('individual') && !input_lower.includes('per-user')) {
      // Aggregate user analytics
      const userDistribution = [
        { name: 'Power Users (>1000 req/day)', value: 4, percentage: 8 },
        { name: 'Active Users (100-1000 req/day)', value: 12, percentage: 24 },
        { name: 'Regular Users (10-100 req/day)', value: 25, percentage: 50 },
        { name: 'Occasional Users (<10 req/day)', value: 9, percentage: 18 }
      ];

      const usageByTier = [
        { name: 'Enterprise', value: 4, percentage: 8 },
        { name: 'Pro', value: 12, percentage: 24 },
        { name: 'Basic', value: 18, percentage: 36 },
        { name: 'Free', value: 16, percentage: 32 }
      ];

      const userGrowthTrend = generateDateRange(30).map((date, index) => ({
        date,
        totalUsers: Math.floor(42 + index * 0.27),
        activeUsers: Math.floor(35 + index * 0.23 + Math.random() * 3),
        newSignups: index % 7 === 0 ? Math.floor(3 + Math.random() * 3) : Math.floor(Math.random() * 2)
      }));

      const cohortActivity = [
        { cohort: 'This Week', users: 50, avgRequests: 234, avgCost: 67.89 },
        { cohort: 'Last Week', users: 48, avgRequests: 198, avgCost: 54.32 },
        { cohort: 'Last Month', users: 45, avgRequests: 567, avgCost: 123.45 },
        { cohort: '3 Months Ago', users: 38, avgRequests: 890, avgCost: 198.76 },
        { cohort: '6+ Months', users: 32, avgRequests: 1234, avgCost: 345.67 }
      ];

      const engagementMetrics = generateDateRange(7).map((date, index) => ({
        date,
        DAU: Math.floor(35 + Math.random() * 5),
        WAU: Math.floor(42 + Math.random() * 3),
        MAU: 50,
        'DAU/MAU': parseFloat((0.7 + Math.random() * 0.1).toFixed(2))
      }));

      const revenueByTier = [
        { name: 'Enterprise', value: 3456.78, percentage: 63.4 },
        { name: 'Pro', value: 1234.56, percentage: 22.6 },
        { name: 'Basic', value: 567.89, percentage: 10.4 },
        { name: 'Free', value: 123.45, percentage: 2.3 },
        { name: 'Other', value: 73.10, percentage: 1.3 }
      ];

      return {
        type: 'user-analytics-aggregate',
        charts: [
          {
            type: 'area' as const,
            title: '30-Day User Growth Trend',
            data: userGrowthTrend
          },
          {
            type: 'donut' as const,
            title: 'User Distribution by Subscription Tier',
            data: usageByTier
          },
          {
            type: 'pie' as const,
            title: 'Revenue Distribution by Tier',
            data: revenueByTier
          },
          {
            type: 'pie' as const,
            title: 'User Distribution by Activity Level',
            data: userDistribution
          }
        ],
        metrics: [
          { label: 'Total Users', value: '50', trend: '+19%', trending: 'up' as const },
          { label: 'Monthly Active', value: '42', trend: '+8', trending: 'up' as const },
          { label: 'DAU/MAU Ratio', value: '0.74', trend: '+0.05', trending: 'up' as const },
          { label: 'Avg Revenue/User', value: '$90.47', trend: '+$12.34', trending: 'up' as const }
        ]
      };
    } else if (input_lower.includes('user') || input_lower.includes('customer') || input_lower.includes('per-user') || input_lower.includes('by user') || input_lower.includes('individual') || input_lower.includes('team') || input_lower.includes('developer')) {
      // Specific user details (for other user-related queries)
      const userActivityData = [
        { name: 'John Doe', requests: 4567, cost: 1234.56, avgLatency: 456, errorRate: 1.2 },
        { name: 'Jane Smith', requests: 3456, cost: 987.65, avgLatency: 523, errorRate: 2.3 },
        { name: 'Bob Johnson', requests: 2345, cost: 678.90, avgLatency: 398, errorRate: 0.8 },
        { name: 'Alice Williams', requests: 1890, cost: 567.89, avgLatency: 612, errorRate: 3.4 },
        { name: 'Charlie Brown', requests: 1234, cost: 345.67, avgLatency: 445, errorRate: 1.5 },
        { name: 'Diana Prince', requests: 987, cost: 234.56, avgLatency: 378, errorRate: 0.5 },
        { name: 'Eve Davis', requests: 678, cost: 198.76, avgLatency: 489, errorRate: 2.1 },
        { name: 'Frank Miller', requests: 567, cost: 156.78, avgLatency: 567, errorRate: 1.8 },
        { name: 'Grace Lee', requests: 456, cost: 123.45, avgLatency: 423, errorRate: 0.9 },
        { name: 'Henry Wilson', requests: 345, cost: 98.76, avgLatency: 534, errorRate: 2.7 }
      ];

      const userDistribution = [
        { name: 'Power Users (>1000 req/day)', value: 4, percentage: 8 },
        { name: 'Active Users (100-1000 req/day)', value: 12, percentage: 24 },
        { name: 'Regular Users (10-100 req/day)', value: 25, percentage: 50 },
        { name: 'Occasional Users (<10 req/day)', value: 9, percentage: 18 }
      ];

      const departmentUsage = [
        { department: 'Engineering', users: 15, totalCost: 2567.89, avgCostPerUser: 171.19 },
        { department: 'Data Science', users: 8, totalCost: 1234.56, avgCostPerUser: 154.32 },
        { department: 'Product', users: 6, totalCost: 567.89, avgCostPerUser: 94.65 },
        { department: 'Marketing', users: 5, totalCost: 345.67, avgCostPerUser: 69.13 },
        { department: 'Support', users: 4, totalCost: 234.56, avgCostPerUser: 58.64 }
      ];

      const userGrowthTrend = generateDateRange(30).map((date, index) => ({
        date,
        activeUsers: Math.floor(35 + index * 0.5 + Math.random() * 5),
        newUsers: Math.floor(Math.random() * 3),
        totalRequests: Math.floor(800 + index * 20 + Math.random() * 100)
      }));

      const userCostTrend = userActivityData.slice(0, 5).map(user => ({
        name: user.name,
        thisMonth: user.cost,
        lastMonth: user.cost * (0.8 + Math.random() * 0.3),
        growth: `${Math.floor(Math.random() * 40 - 10)}%`
      }));

      const modelUsageByUser = [
        { user: 'John Doe', 'GPT-4': 2345, 'Claude-3': 1234, 'GPT-3.5': 988 },
        { user: 'Jane Smith', 'GPT-4': 1567, 'Claude-3': 987, 'GPT-3.5': 902 },
        { user: 'Bob Johnson', 'GPT-4': 1234, 'Claude-3': 567, 'GPT-3.5': 544 },
        { user: 'Alice Williams', 'GPT-4': 987, 'Claude-3': 456, 'GPT-3.5': 447 },
        { user: 'Charlie Brown', 'GPT-4': 678, 'Claude-3': 345, 'GPT-3.5': 211 }
      ];

      return {
        type: 'user-details',
        charts: [
          {
            type: 'bar' as const,
            title: 'Top 10 Users by API Usage',
            data: userActivityData
          },
          {
            type: 'pie' as const,
            title: 'User Distribution by Activity Level',
            data: userDistribution
          },
          {
            type: 'table' as const,
            title: 'Department Usage Summary',
            data: departmentUsage
          },
          {
            type: 'area' as const,
            title: '30-Day User Growth and Activity',
            data: userGrowthTrend
          }
        ],
        metrics: [
          { label: 'Active Users', value: '50', trend: '+8', trending: 'up' as const },
          { label: 'Avg Cost/User', value: '$90.47', trend: '-$12.34', trending: 'down' as const },
          { label: 'Power Users', value: '4', trend: '+2', trending: 'up' as const },
          { label: 'User Retention', value: '94%', trend: '+3%', trending: 'up' as const }
        ]
      };
    }

    // Default overview
    return {
      type: 'overview',
      charts: [
        {
          type: 'bar' as const,
          title: 'API Usage Overview',
          data: analyticsData?.breakdown.map(item => ({
            name: `${item.vendor}/${item.model}`,
            requests: item.request_count,
            cost: item.total_cost
          })) || []
        }
      ],
      metrics: [
        { label: 'Total Requests', value: analyticsData?.summary.total_requests.toLocaleString() || '0', trend: '', trending: 'neutral' as const },
        { label: 'Total Cost', value: `$${analyticsData?.summary.total_cost.toFixed(2) || '0'}`, trend: '', trending: 'neutral' as const },
        { label: 'Avg Latency', value: `${analyticsData?.summary.avg_latency.toFixed(1) || '0'}ms`, trend: '', trending: 'neutral' as const }
      ]
    };
  };

  const generateAIResponse = (userInput: string): string => {
    const input = userInput.toLowerCase();

    if (!analyticsData) {
      return 'I\'m still connecting to your API data. Please wait a moment and try again.';
    }

    if (input.includes('spend this month vs last month')) {
      return `Analyzing your API spend comparison:\n\n📊 Monthly Comparison:\n- This Month: $4,523.67\n- Last Month: $3,842.45\n- Change: +$681.22 (17.7% increase)\n\nKey Insights:\n- OpenAI GPT-4 usage increased by 34%\n- New Claude-3 adoption added $312 to monthly costs\n- API call volume grew by 28%\n\nI've created visualizations below showing the daily cost trends and breakdown by vendor.`;
    } else if (input.includes('highest latency')) {
      return `Here are the models ranked by latency:\n\n🚦 Latency Analysis:\n1. Anthropic Claude-2 - 892ms avg (⚠️ Highest)\n2. OpenAI GPT-4-Turbo - 654ms avg\n3. Google PaLM-2 - 423ms avg\n4. OpenAI GPT-3.5 - 287ms avg\n5. Mistral-7B - 156ms avg (✅ Fastest)\n\nRecommendations:\n- Consider Mistral-7B for latency-sensitive applications\n- Claude-2's higher latency is offset by superior reasoning for complex tasks\n- GPT-3.5 offers the best balance of speed and capability\n\nSee the chart below for latency distribution across all your API calls.`;
    } else if (input.includes('cost breakdown by vendor')) {
      return `Breaking down your costs by vendor and model:\n\n💰 Cost Analysis:\n\nBy Vendor:\n- OpenAI: $3,397.16 (75%)\n- Anthropic: $1,130.92 (25%)\n- Google: $361.89 (8%)\n- Others: $90.48 (2%)\n\nTop Models by Cost:\n1. GPT-4: $2,035.65 (45%)\n2. Claude-3: $1,130.92 (25%)\n3. GPT-3.5-Turbo: $904.73 (20%)\n\nThe visualization below shows detailed cost breakdown with request volumes.`;
    } else if (input.includes('cost') || input.includes('spend')) {
      return `Based on your API usage data, your total cost this month is $${analyticsData.summary.total_cost.toFixed(2)}. The main contributors are GPT-4 ($2,035.65) and Claude-3 ($1,130.92).`;
    } else if (input.includes('whisper') && input.includes('usage')) {
      return `OpenAI Whisper API Usage Analysis:\n\n🎙️ Whisper vs Other Speech APIs:\n\nAPI Distribution:\n- OpenAI Whisper: 489 requests (86.2%)\n- Google Speech-to-Text: 78 requests (13.8%)\n\nModel Breakdown:\n- whisper-1: 423 requests, 1,876.5 minutes processed\n- whisper-large-v2: 66 requests, 469.2 minutes processed\n- google-speech-v1: 78 requests, 234.3 minutes processed\n\nCost Analysis:\n- Whisper Total Cost: $469.14\n- Google Speech Cost: $46.86\n- Total Speech API Cost: $516.00\n\nPerformance:\n- Whisper processes 31.3 minutes per request average\n- Google processes 3.0 minutes per request average\n- Whisper handles longer audio files more efficiently\n\nRecommendations:\n- Use whisper-1 for general transcription (best cost/performance)\n- Reserve whisper-large-v2 for high-accuracy requirements\n- Consider Google Speech for short clips under 1 minute`;
    } else if (input.includes('transcription') && input.includes('metrics')) {
      return `Audio Transcription Metrics:\n\n📊 Accuracy Analysis:\n\nWord Error Rate (WER) by Language:\n- English: 4.2% (95.8% accuracy)\n- Spanish: 6.8% (93.2% accuracy)\n- Mandarin: 8.3% (91.7% accuracy)\n- French: 5.9% (94.1% accuracy)\n\nProcessing Performance:\n- 0-1 min audio: 2.3s average processing\n- 1-5 min audio: 8.7s average processing\n- 5-10 min audio: 18.4s average processing\n- 10-30 min audio: 45.2s average processing\n- 30+ min audio: 98.6s average processing\n\nReliability:\n- Overall Success Rate: 97.2%\n- Failure Rate: 2.8% (mostly timeouts)\n- Average Retry Count: 1.2 per failed request\n\nQuality Improvements:\n- WER improved by 0.8% in last 30 days\n- Character Error Rate (CER) averaging 3.1%\n- Punctuation accuracy: 89.4%\n\nThe visualizations below show detailed accuracy and performance trends.`;
    } else if ((input.includes('speech') && input.includes('cost')) || (input.includes('audio') && input.includes('cost') && !input.includes('transcribe'))) {
      return `Speech/Audio Processing Cost Analysis:\n\n💰 Cost Breakdown:\n\nBy Audio Duration:\n- 0-1 min: $45.67 total ($0.195/request avg)\n- 1-5 min: $134.89 total ($0.757/request avg)\n- 5-10 min: $156.23 total ($1.755/request avg)\n- 10-30 min: $89.45 total ($1.988/request avg)\n- 30+ min: $30.54 total ($1.454/request avg)\n\nProvider Comparison:\n┌──────────┬─────────────────┬──────────────┬─────────────┐\n│ Provider │ Model           │ $/Minute     │ Total Cost  │\n├──────────┼─────────────────┼──────────────┼─────────────┤\n│ OpenAI   │ whisper-1       │ $0.20        │ $375.30     │\n│ OpenAI   │ whisper-large   │ $0.30        │ $140.76     │\n│ Google   │ speech-v1       │ $0.15        │ $35.15      │\n└──────────┴─────────────────┴──────────────┴─────────────┘\n\nCost Trends:\n- Monthly Total: $456.78 (+22% MoM)\n- Daily Average: $15.23\n- Peak Day: $24.56 (Wednesday)\n\nCost Optimization Tips:\n- Batch short clips together for processing\n- Use whisper-1 instead of large model when possible\n- Consider Google Speech for clips under 1 minute`;
    } else if (input.includes('audio') || input.includes('transcription') || input.includes('speech')) {
      return `Audio AI Processing Analytics:\n\n🎙️ Audio/Speech Processing Overview:\n\nTotal Audio Requests: 567\nTotal Minutes Processed: 2,345.67 minutes (39.1 hours)\nAverage Duration: 4.14 minutes per request\n\nVendor Breakdown:\n- OpenAI Whisper: 489 requests (86.2%)\n- Google Speech-to-Text: 78 requests (13.8%)\n\nCost Analysis:\n- Total Audio Processing Cost: $456.78\n- Average Cost per Minute: $0.195\n- Cost per Request: $0.806\n\nLanguage Distribution:\n- English: 423 requests (74.6%)\n- Spanish: 67 requests (11.8%)\n- Mandarin: 34 requests (6.0%)\n- Other: 43 requests (7.6%)\n\nUse Cases:\n- Meeting Transcription: 234 requests\n- Voice Commands: 178 requests\n- Podcast Analysis: 89 requests\n- Customer Support: 66 requests\n\nPerformance Metrics:\n- Average Processing Time: 3.456 seconds per minute of audio\n- Success Rate: 98.4%\n- Word Error Rate (WER): 4.2%\n\nThe visualization below shows audio processing trends and language distribution.`;
    } else if (input.includes('video') || input.includes('visual') || input.includes('frame')) {
      return `Video AI Processing Analytics:\n\n🎬 Video Analysis Overview:\n\nTotal Video Requests: 89\nTotal Minutes Processed: 456.78 minutes (7.6 hours)\nAverage Duration: 5.13 minutes per video\n\nProcessing Breakdown:\n- Frame Extraction + Analysis: 89 videos\n- Audio Track Transcription: 76 videos (85.4%)\n- Full Content Analysis: 45 videos (50.6%)\n\nVendor Usage:\n- OpenAI GPT-4-Vision: 89 requests (frames)\n- OpenAI Whisper: 76 requests (audio tracks)\n\nCost Analysis:\n- Total Video Processing Cost: $234.56\n- Average Cost per Video: $2.64\n- Cost per Minute: $0.513\n\nResolution Distribution:\n- 1920x1080 (Full HD): 56 videos (62.9%)\n- 1280x720 (HD): 23 videos (25.8%)\n- 3840x2160 (4K): 8 videos (9.0%)\n- Other: 2 videos (2.3%)\n\nUse Cases:\n- Content Moderation: 34 videos\n- Educational Analysis: 28 videos\n- Security Monitoring: 18 videos\n- Marketing Insights: 9 videos\n\nPerformance:\n- Average Processing Time: 12.4 seconds per minute\n- Frame Analysis Rate: 5 frames per video average\n- Combined Accuracy: 94.7%\n\nThe charts below show video processing trends and resolution distribution.`;
    } else if (input.includes('media') || input.includes('multimedia')) {
      return `Multimedia AI Processing Overview:\n\n📊 Combined Media Analytics:\n\nTotal Media Requests: 998\n- Images: 342 requests (34.3%)\n- Audio: 567 requests (56.8%)\n- Video: 89 requests (8.9%)\n\nTotal Processing Cost: $1,259.23 (27.8% of total AI spend)\n\nMedia Type Comparison:\n┌─────────────┬──────────┬───────────┬────────────┐\n│ Type        │ Requests │ Avg Cost  │ Avg Latency│\n├─────────────┼──────────┼───────────┼────────────┤\n│ Text        │ 13,621   │ $0.287    │ 487ms      │\n│ Images      │ 342      │ $1.660    │ 2,134ms    │\n│ Audio       │ 567      │ $0.806    │ 3,456ms    │\n│ Video       │ 89       │ $2.640    │ 8,234ms    │\n└─────────────┴──────────┴───────────┴────────────┘\n\nTrends:\n- Media processing growing 34% month-over-month\n- Audio requests increased 45% (voice interfaces)\n- Video analysis emerging use case (+120%)\n\nTop Media Processing Endpoints:\n1. /api/v1/audio/transcribe - 567 requests\n2. /api/v2/image-analysis - 342 requests  \n3. /api/v1/video/analyze - 89 requests\n\nRecommendations:\n- Implement audio caching for repeated content\n- Consider batch processing for video analysis\n- Optimize image dimensions before processing`;
    } else if (input.includes('expensive') && input.includes('endpoint')) {
      return `Top 5 Most Expensive API Endpoints:\n\n💰 Endpoint Cost Analysis:\n\n1. /api/v1/chat/complete\n   - Total Cost: $1,845.23\n   - Calls: 4,234\n   - Avg Cost: $0.436/call\n   - Vendor: OpenAI (GPT-4)\n\n2. /api/v1/embeddings/create\n   - Total Cost: $678.90\n   - Calls: 8,456\n   - Avg Cost: $0.080/call\n   - Vendor: OpenAI (text-embedding-ada)\n\n3. /api/v2/analyze/text\n   - Total Cost: $567.89\n   - Calls: 987\n   - Avg Cost: $0.575/call\n   - Vendor: Anthropic (Claude-3)\n\n4. /api/v2/image-analysis\n   - Total Cost: $456.78\n   - Calls: 234\n   - Avg Cost: $1.953/call\n   - Vendor: OpenAI (GPT-4-Vision)\n\n5. /api/v1/video/analyze\n   - Total Cost: $345.67\n   - Calls: 123\n   - Avg Cost: $2.810/call\n   - Vendor: OpenAI (GPT-4-Vision)\n\nKey Insights:\n- Chat completion accounts for 40.8% of total API costs\n- Video analysis has the highest per-call cost at $2.64\n- Embeddings have high volume but low individual cost\n- Consider caching for frequently repeated requests`;
    } else if (input.includes('error') && input.includes('distributed')) {
      return `API Error Distribution Analysis:\n\n🚨 Error Breakdown:\n\nTotal Errors (Last 24h): 234\nError Rate: 1.49%\n\nBy Error Type:\n- Rate Limit Exceeded: 89 (38.0%)\n- Request Timeout: 67 (28.6%)\n- Bad Request (400): 34 (14.5%)\n- Server Error (500): 23 (9.8%)\n- Authentication Failed: 12 (5.1%)\n- Other: 9 (3.8%)\n\nBy Vendor:\n- OpenAI: 1.2% error rate (mostly rate limits)\n- Anthropic: 0.8% error rate (mostly timeouts)\n- Google: 2.1% error rate (mixed errors)\n- Others: 1.5% error rate\n\nPeak Error Times:\n- 10:00 AM - 11:00 AM: 34 errors\n- 2:00 PM - 3:00 PM: 45 errors\n- 6:00 PM - 7:00 PM: 23 errors\n\nRecommendations:\n- Implement exponential backoff for rate limits\n- Add request queuing during peak hours\n- Monitor timeout patterns and adjust limits\n- Review authentication token refresh logic`;
    } else if (input.includes('usage pattern') && input.includes('day')) {
      return `Daily Usage Pattern Analysis:\n\n📈 24-Hour Usage Distribution:\n\nPeak Hours:\n- 9:00 AM - 10:00 AM: 1,234 requests (8.9%)\n- 2:00 PM - 3:00 PM: 1,567 requests (11.3%) ⭐ Peak\n- 4:00 PM - 5:00 PM: 1,345 requests (9.7%)\n\nLowest Activity:\n- 2:00 AM - 3:00 AM: 45 requests (0.3%)\n- 3:00 AM - 4:00 AM: 34 requests (0.2%) ⭐ Lowest\n- 4:00 AM - 5:00 AM: 67 requests (0.5%)\n\nWeekly Patterns:\n- Monday: 18.2% of weekly traffic\n- Tuesday: 19.8%\n- Wednesday: 22.1% ⭐ Busiest\n- Thursday: 20.3%\n- Friday: 15.7%\n- Weekend: 3.9% combined\n\nCost Implications:\n- Peak hours cost: $0.312/request average\n- Off-peak cost: $0.287/request average\n- Potential savings by load shifting: ~$234/month\n\nRecommendations:\n- Schedule batch jobs during 2-5 AM window\n- Implement caching for peak hour requests\n- Consider rate limiting during 2-3 PM peak`;
    } else if (input.includes('top 5 most expensive') || input.includes('expensive api endpoints')) {
      return `Top 5 Most Expensive API Endpoints Analysis:\n\n💰 Highest Cost Endpoints:\n\n1. /api/v1/chat/complete - $2,035.65\n   - Model: OpenAI GPT-4\n   - Calls: 3,456\n   - Avg Cost: $0.589/call\n\n2. /api/v1/chat/complete-advanced - $1,130.92\n   - Model: Anthropic Claude-3\n   - Calls: 1,234\n   - Avg Cost: $0.917/call\n\n3. /api/v2/image-analysis - $567.89\n   - Model: OpenAI GPT-4-Vision\n   - Calls: 342\n   - Avg Cost: $1.660/call\n\n4. /api/v1/audio/transcribe - $456.78\n   - Model: OpenAI Whisper\n   - Calls: 567\n   - Avg Cost: $0.806/call\n\n5. /api/v1/video/analyze - $234.56\n   - Model: OpenAI GPT-4-Vision\n   - Calls: 89\n   - Avg Cost: $2.640/call (highest per-call cost)\n\nKey Insights:\n- These 5 endpoints account for 97.8% of total API costs\n- Video analysis has the highest per-call cost at $2.64\n- Chat completions drive the bulk of spending due to high volume\n\nCost Optimization Recommendations:\n- Consider GPT-3.5-Turbo for less complex chat tasks\n- Implement request batching for image/video analysis\n- Use caching for frequently repeated queries`;
    } else if (input.includes('errors distributed') || input.includes('error distribution')) {
      return `API Error Distribution Analysis:\n\n🚨 Error Breakdown (Last 30 Days):\n\nTotal Errors: 518 (3.3% error rate)\n\nError Types:\n1. Rate Limit (429) - 234 errors (45.2%)\n   - Peak times: 9 AM - 5 PM business hours\n   - Mainly affecting OpenAI endpoints\n\n2. Timeout (504) - 123 errors (23.7%)\n   - Most common with video/image processing\n   - Average timeout after 30 seconds\n\n3. Bad Request (400) - 89 errors (17.2%)\n   - Usually malformed JSON or invalid parameters\n   - Most frequent in custom integrations\n\n4. Server Error (500) - 45 errors (8.7%)\n   - Vendor-side issues, temporary outages\n   - Distributed across all providers\n\n5. Auth Failed (401) - 27 errors (5.2%)\n   - Expired or invalid API keys\n   - Rotation issues after key updates\n\nError Rate by Vendor:\n- Anthropic: 3.9% (highest)\n- OpenAI: 2.3%\n- Google: 1.2%\n- Others: 0.8% (lowest)\n\nImprovement Trends:\n- Total errors down 12% from last month\n- Mean Time To Recovery (MTTR): 4.2 minutes\n- Error rate improved by 0.5 percentage points\n\nThe visualizations below show hourly error patterns and vendor-specific error rates.`;
    } else if (input.includes('usage pattern') || input.includes('throughout the day')) {
      return `API Usage Pattern Analysis:\n\n📈 Daily Usage Patterns:\n\nPeak Usage Hours:\n- Primary Peak: 2:00 PM (14:00)\n- Secondary Peak: 10:00 AM\n- Lowest Usage: 3:00 AM - 6:00 AM\n\nHourly Breakdown:\n- Night (00:00-06:00): 5.2% of daily traffic\n- Morning (06:00-09:00): 10.1% of daily traffic\n- Business Hours (09:00-18:00): 81.7% of daily traffic\n- Evening (18:00-00:00): 3.0% of daily traffic\n\nWeekly Pattern:\n- Weekdays: 91.3% of total usage\n- Peak Day: Wednesday (17,234 requests)\n- Weekend: 8.7% of total usage\n- Saturday: 3,456 requests\n- Sunday: 2,890 requests\n\nCost Implications:\n- Business hours cost: $4,165.32 (92.1%)\n- Off-peak potential savings: $892.34\n- Weekend average: $910.65/day\n- Weekday average: $4,632.89/day\n\nLatency Patterns:\n- Peak hour latency: +20% (average 584ms)\n- Off-peak latency: -15% (average 414ms)\n- Best performance window: 2 AM - 7 AM\n\nRecommendations:\n- Schedule batch jobs during off-peak hours\n- Consider rate limiting during peak times\n- Implement request queuing for non-urgent tasks`;
    } else if (input.includes('power user') && input.includes('pattern')) {
      return `Power User API Patterns Analysis:\n\n🔥 Top Power Users:\n\n1. John Doe - 4,567 requests/month\n   - Favorite Models: GPT-4 (65%), Claude-3 (25%), GPT-3.5 (10%)\n   - Peak Hours: 9AM-11AM, 2PM-4PM\n   - Success Rate: 98.8%\n   - Avg Request Size: 2.3KB\n\n2. Jane Smith - 3,456 requests/month\n   - Favorite Models: Claude-3 (45%), GPT-4 (40%), Whisper (15%)\n   - Peak Hours: 10AM-12PM, 3PM-5PM\n   - Success Rate: 97.7%\n   - Avg Request Size: 3.1KB\n\n3. Bob Johnson - 2,345 requests/month\n   - Favorite Models: GPT-3.5 (60%), GPT-4 (30%), DALL-E (10%)\n   - Peak Hours: 8AM-10AM, 1PM-3PM\n   - Success Rate: 99.2%\n   - Avg Request Size: 1.8KB\n\n4. Alice Williams - 1,890 requests/month\n   - Favorite Models: Whisper (70%), GPT-4 (20%), Claude-3 (10%)\n   - Peak Hours: 11AM-1PM, 4PM-6PM\n   - Success Rate: 96.5%\n   - Avg Request Size: 5.2KB\n\nCost Trends:\n- Combined power user cost: $3,469.00 (+19.2% MoM)\n- These 4 users represent 76.7% of total API costs\n- John Doe's usage increased 24.9% this month\n- Bob Johnson reduced costs by 4.7% (optimization efforts)\n\nRecommendations:\n- Implement volume discounts for power users\n- Consider dedicated rate limits for high-volume users\n- Share best practices from Bob Johnson's cost optimization`;
    } else if ((input.includes('team') || input.includes('department')) && input.includes('usage')) {
      return `Department Usage Analysis:\n\n👥 Department Breakdown:\n\n1. Engineering (15 users)\n   - Total Requests: 34,567\n   - Total Cost: $2,567.89\n   - Avg Cost/User: $171.19\n   - Top Models: GPT-4, Claude-3\n   - Growth Rate: +23%\n\n2. Data Science (8 users)\n   - Total Requests: 23,456\n   - Total Cost: $1,234.56\n   - Avg Cost/User: $154.32\n   - Top Models: GPT-4, Whisper\n   - Growth Rate: +45% (highest growth)\n\n3. Product (6 users)\n   - Total Requests: 12,345\n   - Total Cost: $567.89\n   - Avg Cost/User: $94.65\n   - Top Models: Claude-3, GPT-3.5\n   - Growth Rate: +12%\n\n4. Marketing (5 users)\n   - Total Requests: 8,901\n   - Total Cost: $345.67\n   - Avg Cost/User: $69.13\n   - Top Models: DALL-E, GPT-3.5\n   - Growth Rate: +67% (new AI initiatives)\n\n5. Support (4 users)\n   - Total Requests: 5,678\n   - Total Cost: $234.56\n   - Avg Cost/User: $58.64\n   - Top Models: GPT-3.5, Claude-3\n   - Growth Rate: -8% (only declining dept)\n\nKey Insights:\n- Engineering is the largest consumer (52% of costs)\n- Data Science shows highest growth rate (45%)\n- Marketing's 67% growth driven by new AI content initiatives\n- Support team optimized usage, reducing costs by 8%\n\nThe charts below show detailed trends and model usage by department.`;
    } else if (input.includes('growth') && (input.includes('user') || input.includes('retention'))) {
      return `User Growth & Retention Analysis:\n\n📈 Growth Metrics:\n\nUser Base Evolution:\n- Total Users: 50 (+8 users, +19% MoM)\n- Active Users (MAU): 42 (84% activation rate)\n- New Users This Month: 8\n- Churned Users: 1 (2.1% churn rate)\n\nRetention Cohorts:\n- Jan 2024: 80% retained after 6 months\n- Feb 2024: 79% retained after 5 months\n- Mar 2024: 84% retained after 4 months\n- Apr 2024: 88% retained after 3 months\n- May 2024: 94% retained after 2 months\n- Jun 2024: 95% retained after 1 month\n\nUser Segmentation:\n- New Users (<1 month): 8 users (16%)\n- Growing (1-3 months): 12 users (24%)\n- Established (3-6 months): 18 users (36%)\n- Power Users (>6 months): 12 users (24%)\n\nChurn Analysis (Last 90 Days):\n- Cost concerns: 3 users (37.5%)\n- Switched provider: 2 users (25.0%)\n- Project ended: 2 users (25.0%)\n- Performance issues: 1 user (12.5%)\n\nPositive Trends:\n- 3-month retention improved from 85% to 88%\n- Churn rate decreased by 0.5 percentage points\n- Average time to power user status: 4.2 months\n\nRecommendations:\n- Address cost concerns with volume pricing\n- Implement user success program for 2-3 month users\n- Create power user community for knowledge sharing`;
    } else if ((input.includes('geographic') || input.includes('location') || input.includes('country') || input.includes('region') || (input.includes('where') && input.includes('users'))) && !input.includes('cost')) {
      return `Geographic User Distribution:\n\n🌍 Global User Analytics:\n\nTop Countries:\n1. United States - 18 users (36%)\n2. United Kingdom - 8 users (16%)\n3. Germany - 6 users (12%)\n4. Canada - 5 users (10%)\n5. Japan - 4 users (8%)\n6. France - 3 users (6%)\n7. Australia - 3 users (6%)\n8. Others - 3 users (6%)\n\nRegional Breakdown:\n┌─────────────────┬───────┬──────────┬─────────────┐\n│ Region          │ Users │ Requests │ Avg Latency │\n├─────────────────┼───────┼──────────┼─────────────┤\n│ North America   │ 23    │ 98,234   │ 145ms       │\n│ Europe          │ 17    │ 67,890   │ 234ms       │\n│ Asia Pacific    │ 7     │ 23,456   │ 456ms       │\n│ South America   │ 2     │ 5,678    │ 567ms       │\n│ Africa          │ 1     │ 1,234    │ 678ms       │\n└─────────────────┴───────┴──────────┴─────────────┘\n\nTop Cities:\n- New York, USA: 5 users\n- London, UK: 4 users\n- San Francisco, USA: 4 users\n- Berlin, Germany: 3 users\n- Toronto, Canada: 3 users\n\nTimezone Insights:\n- Most active timezone: EST/EDT (10 users)\n- Peak global activity: 2:00 PM EST\n- Lowest latency: North America (145ms avg)\n- Highest growth region: Asia Pacific (+43% MoM)\n\nKey Findings:\n- 72% of users are in English-speaking countries\n- European users have 2x higher engagement despite higher latency\n- Asia Pacific showing fastest growth but needs latency optimization\n- Consider CDN expansion in Europe and APAC regions`;
    } else if (input.includes('per-user') || input.includes('consumption')) {
      return `Per-User Consumption Analysis:\n\n📊 Individual User Breakdown:\n\n1. John Doe\n   - Requests: 4,567 (highest volume)\n   - Cost: $1,234.56\n   - Tokens: 2.3M input / 1.2M output\n   - Avg Latency: 456ms\n   - Error Rate: 1.2%\n   - Top Endpoints: /chat/complete, /embeddings, /audio/transcribe\n\n2. Jane Smith\n   - Requests: 3,456\n   - Cost: $987.65\n   - Tokens: 1.9M input / 988K output\n   - Avg Latency: 523ms\n   - Error Rate: 2.3%\n   - Top Endpoints: /chat/complete-advanced, /image-analysis\n\n3. Bob Johnson\n   - Requests: 2,345\n   - Cost: $678.90\n   - Tokens: 1.2M input / 654K output\n   - Avg Latency: 398ms (fastest)\n   - Error Rate: 0.8% (lowest)\n   - Top Endpoints: /chat/complete, /text-analysis\n\n4. Alice Williams\n   - Requests: 1,890\n   - Cost: $567.89\n   - Tokens: 988K input / 543K output\n   - Avg Latency: 612ms\n   - Error Rate: 3.4% (highest)\n   - Top Endpoints: /audio/transcribe, /speech/generate\n\n5. Charlie Brown\n   - Requests: 1,234\n   - Cost: $345.67\n   - Tokens: 654K input / 346K output\n   - Avg Latency: 445ms\n   - Error Rate: 1.5%\n   - Top Endpoints: /chat/complete, /embeddings\n\nConsumption Insights:\n- Average cost per user: $90.47 (down $12.34)\n- Token output/input ratio averages 0.53\n- Audio processing users (Alice) show higher latency\n- Bob Johnson has best performance metrics\n\nThe visualizations below show detailed consumption patterns and trends.`;
    } else if (input.includes('user') && input.includes('analytics') && !input.includes('power') && !input.includes('individual') && !input.includes('per-user')) {
      return `User Analytics Overview:\n\n📊 Aggregate User Metrics:\n\nUser Base Summary:\n- Total Users: 50\n- Monthly Active Users (MAU): 42 (84% activation)\n- Daily Active Users (DAU): 37 (74% DAU/MAU ratio)\n- New Users This Month: 8 (+19% growth)\n\nUser Distribution by Activity:\n- Power Users (>1000 req/day): 4 users (8%)\n- Active Users (100-1000 req/day): 12 users (24%)\n- Regular Users (10-100 req/day): 25 users (50%)\n- Occasional Users (<10 req/day): 9 users (18%)\n\nUsage by Subscription Tier:\n┌────────────┬───────┬──────────────┬─────────────┐\n│ Tier       │ Users │ Total Reqs   │ Total Cost  │\n├────────────┼───────┼──────────────┼─────────────┤\n│ Enterprise │ 4     │ 89,234       │ $3,456.78   │\n│ Pro        │ 12    │ 45,678       │ $1,234.56   │\n│ Basic      │ 18    │ 23,456       │ $567.89     │\n│ Free       │ 16    │ 8,901        │ $123.45     │\n└────────────┴───────┴──────────────┴─────────────┘\n\nEngagement Trends:\n- DAU/MAU ratio improved from 0.69 to 0.74 (+5%)\n- Average revenue per user: $90.47 (+$12.34 MoM)\n- User retention rate: 94% (industry avg: 85%)\n- Average session frequency: 4.2x per day\n\nKey Insights:\n- Strong user growth momentum (+19% MoM)\n- Healthy engagement metrics (74% DAU/MAU)\n- Enterprise tier drives 65% of revenue with only 8% of users\n- Free-to-paid conversion rate: 12% (above industry average)\n\nThe visualizations below show detailed breakdowns and trends.`;
    } else if (input.includes('user') || input.includes('customer') || input.includes('per-user') || input.includes('by user') || input.includes('individual') || input.includes('team') || input.includes('developer')) {
      return `User Analytics Overview:\n\n👥 User Activity Summary:\n\nTop Users by API Usage:\n1. John Doe - 4,567 requests ($1,234.56)\n2. Jane Smith - 3,456 requests ($987.65)\n3. Bob Johnson - 2,345 requests ($678.90)\n4. Alice Williams - 1,890 requests ($567.89)\n5. Charlie Brown - 1,234 requests ($345.67)\n\nUser Distribution:\n- Power Users (>1000 req/day): 4 users (8%)\n- Active Users (100-1000 req/day): 12 users (24%)\n- Regular Users (10-100 req/day): 25 users (50%)\n- Occasional Users (<10 req/day): 9 users (18%)\n\nDepartment Breakdown:\n┌─────────────────┬───────┬────────────┬─────────────┐\n│ Department      │ Users │ Total Cost │ Avg/User    │\n├─────────────────┼───────┼────────────┼─────────────┤\n│ Engineering     │ 15    │ $2,567.89  │ $171.19     │\n│ Data Science    │ 8     │ $1,234.56  │ $154.32     │\n│ Product         │ 6     │ $567.89    │ $94.65      │\n│ Marketing       │ 5     │ $345.67    │ $69.13      │\n│ Support         │ 4     │ $234.56    │ $58.64      │\n└─────────────────┴───────┴────────────┴─────────────┘\n\nKey Insights:\n- 4 power users account for 42% of total API costs\n- Engineering team has highest per-user consumption\n- User base growing at 12% month-over-month\n- Average cost per user decreased by $12.34 (cost optimization efforts working)\n\nRecommendations:\n- Implement user-specific rate limits for power users\n- Provide usage dashboards to help users self-monitor\n- Consider volume discounts for high-usage departments`;
    }

    return 'I can help you analyze various aspects of your API usage including costs, performance, usage patterns, vendor comparisons, user analytics, and media processing (audio, video, images). Try clicking one of the suggested prompts above!';
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-background to-secondary/20">
      {/* System Alert */}
      {systemAlert && (
        <SystemAlert
          message={systemAlert.message}
          type={systemAlert.type}
          onClose={() => setSystemAlert(null)}
        />
      )}

      {/* User Context Panel */}
      <UserContextPanel
        currentUserId={currentUserId}
        onUserIdChange={setCurrentUserId}
        analyticsData={analyticsData}
      />

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="border-b bg-background/95 backdrop-blur-sm px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">ApiLens AI</h1>
              <p className="text-sm text-muted-foreground">AI API Analyst tracking 10M+ API calls per day</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-muted-foreground">Live</span>
              </div>
              
              {/* User Profile Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-9 px-2">
                    <Avatar className="h-8 w-8 mr-2">
                      <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                        {currentUser.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex items-center gap-2">
                      <div className="text-left">
                        <p className="text-sm font-medium leading-none">{currentUser.name}</p>
                        <p className="text-xs text-muted-foreground">{currentUser.role}</p>
                      </div>
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{currentUser.name}</p>
                      <p className="text-xs leading-none text-muted-foreground">{currentUser.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="cursor-pointer">
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile Settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="cursor-pointer">
                    <span className="mr-2 text-base">🔑</span>
                    <span>API Keys</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="cursor-pointer">
                    <span className="mr-2 text-base">💳</span>
                    <span>Billing</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="cursor-pointer text-red-600">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {messages.map((message) => (
            <ChatMessage key={message.id} message={message} />
          ))}
          {isTyping && <TypingIndicator />}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <MessageInput onSendMessage={handleSendMessage} disabled={isTyping} />
      </div>
    </div>
  );
};