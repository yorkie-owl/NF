import type { ReactNode } from 'react';
import { Label } from '@/components/ui/label';

export interface FieldProps {
  id: string;
  label: string;
  error?: string | undefined;
  children: ReactNode;
}

/**
 * Labeled form field with an inline error slot. Shared between auth and
 * profile forms (login / profile edit).
 */
export function Field({ id, label, error, children }: FieldProps) {
  return (
    <div>
      <Label htmlFor={id}>{label}</Label>
      <div className="mt-1.5">{children}</div>
      {error ? (
        <p className="mt-1 text-[12px] text-danger-500">{error}</p>
      ) : null}
    </div>
  );
}
