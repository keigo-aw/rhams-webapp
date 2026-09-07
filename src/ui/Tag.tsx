import type { HTMLAttributes } from 'react';

type Variant = 'accent' | 'accent-2' | 'neutral' | 'outline' | 'danger';

interface TagProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: Variant;
}

export function Tag({ variant = 'neutral', className, ...rest }: TagProps) {
  const classes = ['tag', `tag-${variant}`, className].filter(Boolean).join(' ');
  return <span className={classes} {...rest} />;
}
