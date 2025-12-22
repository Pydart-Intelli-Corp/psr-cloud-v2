'use client';

import React from 'react';

interface FormInputProps {
  label: string;
  type?: 'text' | 'email' | 'tel' | 'date' | 'number' | 'password';
  value: string | number;
  onChange: (value: string) => void;
  onBlur?: () => void;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  error?: string;
  className?: string;
  colSpan?: 1 | 2;
  maxLength?: number;
  pattern?: string;
  inputMode?: 'text' | 'decimal' | 'numeric' | 'tel' | 'search' | 'email' | 'url';
  step?: string | number;
  min?: string | number;
  max?: string | number;
  helperText?: string;
}

/**
 * Reusable input component with consistent styling
 * Used across dairy, BMC, society, and machine forms
 */
const FormInput: React.FC<FormInputProps> = ({
  label,
  type = 'text',
  value,
  onChange,
  onBlur,
  placeholder,
  required = false,
  disabled = false,
  readOnly = false,
  error,
  className = '',
  colSpan = 1,
  maxLength,
  pattern,
  inputMode,
  step,
  min,
  max,
  helperText
}) => {
  const colSpanClass = colSpan === 2 ? 'sm:col-span-2' : '';
  const errorClass = error ? 'border-red-300 bg-red-50 dark:border-red-700 dark:bg-red-900/20' : '';
  const readOnlyClass = readOnly ? 'bg-gray-100 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed' : '';

  return (
    <div className={`${colSpanClass} ${className}`}>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        readOnly={readOnly}
        maxLength={maxLength}
        pattern={pattern}
        inputMode={inputMode}
        step={step}
        min={min}
        max={max}
        className={`form-input-custom w-full px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-400 focus:border-emerald-500 dark:focus:border-emerald-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 focus:outline-none ${errorClass} ${readOnlyClass}`}
      />
      {helperText && !error && (
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{helperText}</p>
      )}
      {error && (
        <p className="mt-1 text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
    </div>
  );
};

export default FormInput;