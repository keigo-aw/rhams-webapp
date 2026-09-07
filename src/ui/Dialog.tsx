import type { ReactNode } from 'react';

interface DialogProps {
  title: string;
  children: ReactNode;
  actions: ReactNode;
  onBackdropClick?: () => void;
}

export function Dialog({ title, children, actions, onBackdropClick }: DialogProps) {
  return (
    <div className="dialog-backdrop" onClick={onBackdropClick}>
      <div className="dialog" role="dialog" aria-modal="true" aria-labelledby="dialog-title" onClick={(e) => e.stopPropagation()}>
        <p className="dialog-title" id="dialog-title">
          {title}
        </p>
        <div className="dialog-body">{children}</div>
        <div className="dialog-actions">{actions}</div>
      </div>
    </div>
  );
}
