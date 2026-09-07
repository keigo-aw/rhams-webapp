import type { HTMLAttributes } from 'react';

/** The blueprint frame: hairline-bordered, square, with `+` registration marks at all four corners. */
export function Blueprint({ className, children, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={['blueprint', className].filter(Boolean).join(' ')} {...rest}>
      <i className="corner tl" />
      <i className="corner tr" />
      <i className="corner bl" />
      <i className="corner br" />
      {children}
    </div>
  );
}
