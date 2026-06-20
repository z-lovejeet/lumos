import { LucideIcon } from 'lucide-react';
import { Button, buttonVariants } from '@/components/ui/button';
import Link from 'next/link';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
  actionOnClick?: () => void;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  actionHref,
  actionOnClick
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center border rounded-xl bg-muted/20 border-dashed">
      <div className="bg-muted p-4 rounded-full mb-4 text-muted-foreground">
        <Icon className="w-8 h-8" />
      </div>
      <h3 className="text-xl font-semibold tracking-tight mb-2">{title}</h3>
      <p className="text-muted-foreground max-w-sm mb-6">
        {description}
      </p>
      
      {actionLabel && (
        actionHref ? (
          <Link href={actionHref} className={buttonVariants()}>
            {actionLabel}
          </Link>
        ) : (
          <Button onClick={actionOnClick}>{actionLabel}</Button>
        )
      )}
    </div>
  );
}
