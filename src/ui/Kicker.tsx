import type { HTMLAttributes } from 'react';

export function Kicker({ className, ...rest }: HTMLAttributes<HTMLParagraphElement>) {
  return <p className={['k', className].filter(Boolean).join(' ')} {...rest} />;
}
