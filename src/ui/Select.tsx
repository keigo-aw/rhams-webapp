import type { SelectHTMLAttributes } from 'react';

export function Select({ className, children, ...rest }: SelectHTMLAttributes<HTMLSelectElement>) {
  const classes = ['input', className].filter(Boolean).join(' ');
  return (
    <select className={classes} {...rest}>
      {children}
    </select>
  );
}
