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
    setTimeout(() => {
      const analyticsData = shouldIncludeAnalytics(content) ? generateAnalyticsData(content) : undefined;
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
    const keywords = ['cost', 'spend', 'expensive', 'latency', 'performance', 'usage', 'error', 'distributed', 'audio', 'transcription', 'whisper', 'speech', 'video', 'visual', 'frame', 'media', 'multimedia', 'endpoints', 'pattern', 'throughout'];
    return keywords.some(keyword => input.toLowerCase().includes(keyword));
  };

  const generateAnalyticsData = (input: string) => {
    const input_lower = input.toLowerCase();

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
    } else if ((input.includes('speech') || input.includes('audio')) && input.includes('cost')) {
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
    }

    return 'I can help you analyze various aspects of your API usage including costs, performance, usage patterns, vendor comparisons, and media processing (audio, video, images). Try clicking one of the suggested prompts above!';
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