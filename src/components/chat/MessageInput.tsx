import React, { useState, KeyboardEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Send, Paperclip } from 'lucide-react';

interface MessageInputProps {
  onSendMessage: (message: string) => void;
  disabled?: boolean;
}

export const MessageInput: React.FC<MessageInputProps> = ({ onSendMessage, disabled }) => {
  const [message, setMessage] = useState('');

  const handleSend = () => {
    if (message.trim() && !disabled) {
      onSendMessage(message.trim());
      setMessage('');
    }
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const quickPrompts = [
    "What's my total API spend this month vs last month?",
    "Which models have the highest latency?",
    "Show me cost breakdown by vendor and model",
    "What's my usage pattern throughout the day?",
    "Show me the top 5 most expensive API endpoints",
    "How are errors distributed across my API calls?"
  ];

  return (
    <div className="border-t bg-background/95 backdrop-blur-sm p-3 sm:p-4 space-y-2 sm:space-y-3">
      {/* Quick Prompts */}
      <div className="flex flex-wrap gap-1 sm:gap-2">
        {quickPrompts.map((prompt, index) => (
          <Button
            key={index}
            variant="outline"
            size="sm"
            onClick={() => setMessage(prompt)}
            className="text-xs whitespace-nowrap"
            disabled={disabled}
          >
            {prompt}
          </Button>
        ))}
      </div>

      {/* Input Area */}
      <Card className="p-3">
        <div className="flex gap-3 items-end">
          <div className="flex-1">
            <Textarea
              placeholder="Ask about API costs, errors, performance, or user analytics..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={disabled}
              className="min-h-[44px] max-h-32 resize-none border-0 p-0 focus-visible:ring-0 bg-transparent"
              rows={1}
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              disabled={disabled}
              className="p-2"
            >
              <Paperclip className="w-4 h-4" />
            </Button>
            <Button
              onClick={handleSend}
              disabled={!message.trim() || disabled}
              size="sm"
              className="px-4"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </Card>

      <div className="text-xs text-muted-foreground text-center">
        Press Enter to send, Shift+Enter for new line
      </div>
    </div>
  );
};