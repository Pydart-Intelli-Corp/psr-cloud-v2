'use client';

import React from 'react';

interface Action {
  label: string;
  onClick: () => void;
  icon?: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'danger';
}

interface ActionButtonsProps {
  actions: Action[];
  className?: string;
}

/**
 * Reusable action buttons component for page headers
 * Supports multiple actions with different variants
 */
const ActionButtons: React.FC<ActionButtonsProps> = ({
  actions,
  className = ''
}) => {
  const getButtonStyles = (variant: Action['variant'] = 'primary') => {
    switch (variant) {
      case 'primary':
        return 'bg-blue-600 hover:bg-blue-700 text-white';
      case 'secondary':
        return 'bg-green-600 hover:bg-green-700 text-white';
      case 'danger':
        return 'bg-red-600 hover:bg-red-700 text-white';
      default:
        return 'bg-blue-600 hover:bg-blue-700 text-white';
    }
  };

  return (
    <div className={`flex flex-col sm:flex-row gap-3 ${className}`}>
      {actions.map((action, index) => (
        <button
          key={index}
          onClick={action.onClick}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${getButtonStyles(action.variant)}`}
        >
          {action.icon}
          {action.label}
        </button>
      ))}
    </div>
  );
};

export default ActionButtons;