"use client";

import React, { forwardRef } from "react";
import {
  Form as AntForm,
  type FormItemProps as AntFormItemProps,
  Checkbox as AntCheckbox,
  Radio as AntRadio,
  Select as AntSelect,
  Switch as AntSwitch,
  type CheckboxProps,
  type RadioGroupProps,
  type SelectProps,
  type SwitchProps,
} from "antd";
import type { CheckboxRef } from "antd/es/checkbox";
import type { BaseSelectRef } from "rc-select";
import { cn } from "@/utils/common";

// Form wrapper
export const Form = AntForm;

// Form Item с кастомными стилями
export interface FormItemProps extends AntFormItemProps {
  error?: string;
}

export const FormItem = ({
  error,
  help,
  validateStatus,
  className,
  ...props
}: FormItemProps) => {
  return (
    <AntForm.Item
      help={error || help}
      validateStatus={error ? "error" : validateStatus}
      className={cn("mb-6", className)}
      {...props}
    />
  );
};

// Form Label
interface FormLabelProps {
  children: React.ReactNode;
  required?: boolean;
  className?: string;
}

export function FormLabel({ children, required, className }: FormLabelProps) {
  return (
    <label
      className={cn(
        "block text-sm font-medium text-text-primary mb-1.5",
        className,
      )}
    >
      {children}
      {required && <span className="text-error ml-1">*</span>}
    </label>
  );
}

// Form Error Message
interface FormErrorProps {
  error?: string;
  className?: string;
}

export function FormError({ error, className }: FormErrorProps) {
  if (!error) return null;

  return <p className={cn("text-sm text-error mt-1.5", className)}>{error}</p>;
}

// Form Helper Text
interface FormHelperProps {
  children: React.ReactNode;
  className?: string;
}

export function FormHelper({ children, className }: FormHelperProps) {
  return (
    <p className={cn("text-sm text-text-secondary mt-1.5", className)}>
      {children}
    </p>
  );
}

// Checkbox
export const Checkbox = forwardRef<CheckboxRef, CheckboxProps>(
  ({ className, ...props }, ref) => {
    return (
      <AntForm.Item valuePropName="checked" className="mb-0">
        <AntCheckbox ref={ref} className={cn("", className)} {...props} />
      </AntForm.Item>
    );
  },
);

Checkbox.displayName = "Checkbox";

// Radio Group
export const RadioGroup = forwardRef<HTMLDivElement, RadioGroupProps>(
  ({ className, options, ...props }, ref) => {
    return (
      <AntRadio.Group
        ref={ref}
        className={cn("", className)}
        options={options}
        {...props}
      />
    );
  },
);

RadioGroup.displayName = "RadioGroup";

// Select
export const Select = forwardRef<BaseSelectRef, SelectProps>(
  ({ className, ...props }, ref) => {
    return (
      <AntSelect ref={ref} className={cn("w-full", className)} {...props} />
    );
  },
);

Select.displayName = "Select";

// Switch
export const Switch = forwardRef<HTMLButtonElement, SwitchProps>(
  ({ className, ...props }, ref) => {
    return <AntSwitch ref={ref} className={cn("", className)} {...props} />;
  },
);

Switch.displayName = "Switch";
