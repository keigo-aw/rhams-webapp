import type { InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  num?: boolean;
}

export function Input({ num, className, ...rest }: InputProps) {
  const classes = ['input', num ? 'num' : '', className].filter(Boolean).join(' ');
  return <input className={classes} {...rest} />;
}
