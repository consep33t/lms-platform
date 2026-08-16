import React from 'react';
import { Input, InputProps } from '@/components/atoms/Input';

export interface FormFieldProps extends InputProps {
  description?: string;
}

/**
 * Molecule FormField Component
 * Combines label, input, description, and error messaging into a cohesive form control.
 */
export const FormField: React.FC<FormFieldProps> = ({
  description,
  ...props
}) => {
  return (
    <div className="flex flex-col gap-1 w-full">
      <Input {...props} />
      {description && !props.error && (
        <span className="text-[11px] text-slate-500 dark:text-slate-400">
          {description}
        </span>
      )}
    </div>
  );
};
