
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface VoucherProgressProps {
  current: number;
  original: number;
  className?: string;
}

export const VoucherProgress = ({ current, original, className }: VoucherProgressProps) => {
  const usagePercentage = ((original - current) / original) * 100;
  const remainingPercentage = (current / original) * 100;
  
  const getProgressColor = (percentage: number) => {
    if (percentage >= 70) return 'bg-green-500';
    if (percentage >= 30) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
        <span>Used: ${(original - current).toFixed(2)}</span>
        <span>Remaining: ${current.toFixed(2)}</span>
      </div>
      <div className="relative">
        <Progress 
          value={remainingPercentage} 
          className="h-2"
        />
        <div 
          className={cn(
            "absolute top-0 left-0 h-2 rounded-l-full transition-all",
            getProgressColor(remainingPercentage)
          )}
          style={{ width: `${remainingPercentage}%` }}
        />
      </div>
      <div className="text-xs text-center text-gray-500">
        {remainingPercentage.toFixed(1)}% remaining
      </div>
    </div>
  );
};
