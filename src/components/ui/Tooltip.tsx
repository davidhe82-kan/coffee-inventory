import { useState, useRef } from 'react';
import { cn } from '@/lib/utils';

interface TooltipProps {
  content: string;
  children: React.ReactElement;
  className?: string;
}

export function Tooltip({ content, children, className }: TooltipProps) {
  const [show, setShow] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={ref}
      className={cn('relative inline-block', className)}
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
      onFocus={() => setShow(true)}
      onBlur={() => setShow(false)}
    >
      {children}
      {show && (
        <div className="absolute top-full left-1/2 mt-2 -translate-x-1/2 whitespace-nowrap rounded-md bg-coffee-900 px-2 py-1 text-xs text-white shadow-lg z-50">
          {content}
          <div className="absolute bottom-full left-1/2 -translate-x-1/2 -mb-1 border-4 border-transparent border-b-coffee-900" />
        </div>
      )}
    </div>
  );
}
