import React, { ReactNode } from 'react';
import { Inbox } from 'lucide-react';

interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: ReactNode;
  action?: ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  icon,
  action,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center bg-zinc-900/30 border border-zinc-800/80 rounded-xl space-y-3">
      <div className="w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-400">
        {icon || <Inbox className="w-6 h-6" />}
      </div>
      <h3 className="text-base font-semibold text-white">{title}</h3>
      {description && <p className="text-sm text-zinc-400 max-w-sm">{description}</p>}
      {action && <div className="pt-2">{action}</div>}
    </div>
  );
};
