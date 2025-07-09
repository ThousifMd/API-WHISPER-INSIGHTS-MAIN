import React from 'react';
import { Message } from './ChatInterface';
import { AnalyticsVisualization } from './AnalyticsVisualization';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Bot, User } from 'lucide-react';

interface ChatMessageProps {
  message: Message;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isUser = message.type === 'user';
  const isSystem = message.type === 'system';

  // Function to make important metrics bold in AI responses
  const renderBoldMetrics = (content: string) => {
    if (message.type !== 'ai') {
      return content;
    }

    // Pattern to match important metrics only (excluding list numbers)
    const patterns = [
      // Currency values (e.g., $123.45, $1,234.56, +$681.22)
      '[+-]?\\$[\\d,]+\\.?\\d*',
      // Percentages (e.g., 17.7%, +5%, -12%)
      '[+-]?\\d+\\.?\\d*%',
      // Time measurements (e.g., 892ms, 3.4 min)
      '\\d+\\.?\\d*\\s*ms(?!\\w)',
      '\\d+\\.?\\d*\\s*min(?:utes?)?(?!\\w)',
      // Large numbers with commas (e.g., 15,678, 234,567) but not in list context
      '(?<!\\d\\.\\s)[\\d]{1,3}(?:,[\\d]{3})+(?!\\s*\\.)',
      // Rates (e.g., $0.527/request, 2,456 requests/hour)
      '\\$\\d+\\.\\d+/\\w+',
      '[\\d,]+\\s*\\w+/(?:hour|day|month|year)',
      // Time ranges (e.g., 9-11 AM, 2-4 PM)
      '\\d{1,2}-\\d{1,2}\\s*(?:AM|PM)',
      // Specific metrics with @ symbol (e.g., @ $0.527/request)
      '@\\s*\\$\\d+\\.\\d+/\\w+'
    ];

    const metricsPattern = new RegExp(`(${patterns.join('|')})`, 'g');
    
    const parts = content.split(metricsPattern);
    
    return parts.map((part, index) => {
      if (!part) return null;
      
      // Check if this part matches our metrics pattern
      const isMetric = patterns.some(pattern => new RegExp(`^${pattern}$`).test(part.trim()));
      
      if (isMetric && part.trim()) {
        return (
          <span key={index} className="font-bold">
            {part}
          </span>
        );
      }
      return part;
    }).filter(Boolean);
  };

  if (isSystem) {
    return (
      <div className="flex justify-center">
        <Card className="bg-chat-system-bg text-chat-system-fg px-4 py-2 rounded-full text-sm max-w-md text-center">
          {message.content}
        </Card>
      </div>
    );
  }

  return (
    <div className={`flex gap-3 animate-fade-in ${isUser ? 'justify-end' : 'justify-start'}`}>
      {!isUser && (
        <Avatar className="w-8 h-8 mt-1">
          <AvatarFallback className="bg-primary text-primary-foreground">
            <Bot className="w-4 h-4" />
          </AvatarFallback>
        </Avatar>
      )}
      
      <div className={`max-w-[70%] ${isUser ? 'order-first' : ''}`}>
        <Card className={`p-4 shadow-sm ${
          isUser 
            ? 'bg-chat-user-bg text-chat-user-fg ml-auto' 
            : 'bg-chat-ai-bg text-chat-ai-fg border'
        }`}>
          <div className="whitespace-pre-wrap text-sm leading-relaxed">
            {renderBoldMetrics(message.content)}
          </div>
          
          {message.userId && (
            <div className="mt-2 text-xs opacity-75">
              User: {message.userId}
            </div>
          )}
          
          <div className={`mt-2 text-xs opacity-75 ${isUser ? 'text-right' : 'text-left'}`}>
            {message.timestamp.toLocaleTimeString([], { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </div>
        </Card>

        {/* Analytics Visualization */}
        {message.analyticsData && (
          <div className="mt-3">
            <AnalyticsVisualization data={message.analyticsData} />
          </div>
        )}
      </div>

      {isUser && (
        <Avatar className="w-8 h-8 mt-1">
          <AvatarFallback className="bg-chat-user-bg text-chat-user-fg">
            <User className="w-4 h-4" />
          </AvatarFallback>
        </Avatar>
      )}
    </div>
  );
};