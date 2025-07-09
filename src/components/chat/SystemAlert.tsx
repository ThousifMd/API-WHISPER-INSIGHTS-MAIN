import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Info, X, AlertCircle } from 'lucide-react';

interface SystemAlertProps {
  message: string;
  type: 'info' | 'warning' | 'error';
  onClose: () => void;
}

export const SystemAlert: React.FC<SystemAlertProps> = ({ message, type, onClose }) => {
  const getIcon = () => {
    switch (type) {
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-orange-500" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  const getBgColor = () => {
    switch (type) {
      case 'warning':
        return 'bg-orange-50 border-orange-200 dark:bg-orange-950 dark:border-orange-800';
      case 'error':
        return 'bg-red-50 border-red-200 dark:bg-red-950 dark:border-red-800';
      default:
        return 'bg-blue-50 border-blue-200 dark:bg-blue-950 dark:border-blue-800';
    }
  };

  return (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 animate-slide-up">
      <Card className={`${getBgColor()} shadow-lg max-w-md mx-auto`}>
        <div className="flex items-start gap-3 p-4">
          {getIcon()}
          <div className="flex-1 text-sm">
            <p className="text-foreground font-medium">{message}</p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-6 w-6 p-0 hover:bg-background/50"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </Card>
    </div>
  );
};