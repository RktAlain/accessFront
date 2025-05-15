
import { cn } from '@/lib/utils';
import { CheckCircle, Clock, AlertTriangle, XCircle, FileText, RefreshCw } from 'lucide-react';

type StatusType = 'pending' | 'approved' | 'rejected' | 'draft' | 'processing' | 'completed' | 'warning' | 'critical';

interface StatusBadgeProps {
  status: StatusType;
  label?: string;
  className?: string;
  withIcon?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const STATUS_STYLES = {
  pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  approved: 'bg-green-100 text-green-800 border-green-200',
  rejected: 'bg-red-100 text-red-800 border-red-200',
  draft: 'bg-gray-100 text-gray-800 border-gray-200',
  processing: 'bg-blue-100 text-blue-800 border-blue-200',
  completed: 'bg-indigo-100 text-indigo-800 border-indigo-200',
  warning: 'bg-orange-100 text-orange-800 border-orange-200',
  critical: 'bg-red-200 text-red-800 border-red-300',
};

const STATUS_LABELS = {
  pending: 'En attente',
  approved: 'Approuvé',
  rejected: 'Rejeté',
  draft: 'Brouillon',
  processing: 'En cours',
  completed: 'Terminé',
  warning: 'Attention',
  critical: 'Critique',
};

const STATUS_ICONS = {
  pending: Clock,
  approved: CheckCircle,
  rejected: XCircle,
  draft: FileText,
  processing: RefreshCw,
  completed: CheckCircle,
  warning: AlertTriangle,
  critical: AlertTriangle,
};

export function StatusBadge({ status, label, className, withIcon = false, size = 'md' }: StatusBadgeProps) {
  const displayLabel = label || STATUS_LABELS[status];
  const Icon = STATUS_ICONS[status];
  
  const sizeClasses = {
    sm: 'px-1.5 py-0.5 text-xs',
    md: 'px-2.5 py-0.5 text-xs',
    lg: 'px-3 py-1 text-sm'
  };
  
  return (
    <span 
      className={cn(
        'rounded-full font-medium border inline-flex items-center justify-center gap-1',
        STATUS_STYLES[status],
        sizeClasses[size],
        className
      )}
    >
      {withIcon && Icon && <Icon className={cn("shrink-0", size === 'sm' ? 'h-3 w-3' : size === 'md' ? 'h-3.5 w-3.5' : 'h-4 w-4')} />}
      {displayLabel}
    </span>
  );
}
