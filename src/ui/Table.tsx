import type { TableHTMLAttributes, ReactNode } from 'react';

export function Table({ className, ...rest }: TableHTMLAttributes<HTMLTableElement>) {
  return <table className={['table', className].filter(Boolean).join(' ')} {...rest} />;
}

/** Renders a table header cell's small unit sub-label, e.g. "X" over "m". */
export function TableUnit({ children }: { children: ReactNode }) {
  return <u>{children}</u>;
}
