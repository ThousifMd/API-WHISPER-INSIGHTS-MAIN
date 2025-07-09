import React from 'react';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Bot } from 'lucide-react';

export const TypingIndicator: React.FC = () => {
  return (
    <div className="flex gap-3 justify-start animate-fade-in">
      <Avatar className="w-8 h-8 mt-1">
        <AvatarFallback className="bg-primary text-primary-foreground">
          <Bot className="w-4 h-4" />
        </AvatarFallback>
      </Avatar>
      
      <Card className="bg-chat-ai-bg text-chat-ai-fg border p-4 max-w-[70%]">
        <div className="flex items-center gap-1">
          <span className="text-sm text-muted-foreground">AI is analyzing</span>
          <div className="flex gap-1 ml-2">
            <div className="w-2 h-2 bg-muted-foreground rounded-full animate-typing"></div>
            <div className="w-2 h-2 bg-muted-foreground rounded-full animate-typing" style={{ animationDelay: '0.2s' }}></div>
            <div className="w-2 h-2 bg-muted-foreground rounded-full animate-typing" style={{ animationDelay: '0.4s' }}></div>
          </div>
        </div>
      </Card>
    </div>
  );
};