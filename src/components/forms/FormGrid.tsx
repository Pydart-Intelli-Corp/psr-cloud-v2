'use client';

import React from 'react';

interface FormGridProps {
  children: React.ReactNode;
  columns?: 1 | 2;
  className?: string;
}

/**
 * Reusable form grid container component
 * Used across dairy, BMC, society, and machine forms
 */
const FormGrid: React.FC<FormGridProps> = ({
  children,
  columns = 2,
  className = ''
}) => {
  const gridClass = columns === 1 ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2';

  return (
    <div className={`grid ${gridClass} gap-4 sm:gap-6 ${className}`}>
      {children}
    </div>
  );
};

export default FormGrid;