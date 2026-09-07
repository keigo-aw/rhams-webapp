import type { ButtonHTMLAttributes } from 'react';

type Variant = 'primary' | 'secondary' | 'ghost' | 'icon';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  block?: boolean;
  danger?: boolean;
}

export function Button({ variant = 'secondary', block, danger, className, style, type = 'button', ...rest }: ButtonProps) {
  const classes = ['btn', `btn-${variant}`, block ? 'btn-block' : '', className].filter(Boolean).join(' ');
  const dangerStyle = danger ? { borderColor: 'var(--color-danger)', color: 'var(--color-danger)' } : undefined;
  return <button type={type} className={classes} style={{ ...dangerStyle, ...style }} {...rest} />;
}
