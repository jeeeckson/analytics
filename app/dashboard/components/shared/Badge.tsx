type BadgeVariant = 'soft' | 'hard' | 'approved' | 'neutral';

interface BadgeProps {
  label: string;
  variant: BadgeVariant;
  size?: 'sm' | 'md';
}

/**
 * Badge component for indicating soft/hard declines, status, etc.
 * Displays a small pill-shaped badge with color coding.
 */
export function Badge({ label, variant, size = 'sm' }: BadgeProps) {
  const variantClasses = {
    soft: 'bg-softDecline-bg text-softDecline-text border-softDecline-border',
    hard: 'bg-hardDecline-bg text-hardDecline-text border-hardDecline-border',
    approved: 'bg-approved-bg text-approved-text border-approved-border',
    neutral: 'bg-gray-100 text-gray-700 border-gray-300',
  };

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-3 py-1',
  };

  return (
    <span
      className={`inline-flex items-center rounded-full border font-medium ${variantClasses[variant]} ${sizeClasses[size]}`}
    >
      {label}
    </span>
  );
}
