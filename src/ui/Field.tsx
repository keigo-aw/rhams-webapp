import type { ReactNode } from 'react';

interface FieldProps {
  label: string;
  htmlFor?: string;
  maxWidth?: number;
  children: ReactNode;
}

export function Field({ label, htmlFor, maxWidth, children }: FieldProps) {
  return (
    <div className="field" style={maxWidth ? { maxWidth } : undefined}>
      <label htmlFor={htmlFor}>{label}</label>
      {children}
    </div>
  );
}
