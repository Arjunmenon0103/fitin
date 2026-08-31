import { clsx } from 'clsx';

interface WordmarkProps {
  className?: string;
}

/** FitIn set in the display serif, with the accent carried by "In". */
export default function Wordmark({ className }: WordmarkProps) {
  return (
    <span className={clsx('font-display leading-none tracking-[-0.02em]', className)}>
      Fit<span className="text-violet-500">In</span>
    </span>
  );
}
