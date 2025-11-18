'use client';

import React, { useState, useRef, useEffect } from 'react';

interface FloatingAction {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  color: string;
}

interface FloatingActionButtonProps {
  actions: FloatingAction[];
  directClick?: boolean; // If true and only 1 action, trigger action directly without expanding
}

/**
 * Floating Action Button (FAB) with expandable menu
 * Shows a flower icon that expands upward to reveal action buttons
 * If directClick is true and there's only one action, clicking FAB triggers that action directly
 */
const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({ actions, directClick = false }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const fabRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (fabRef.current && !fabRef.current.contains(event.target as Node)) {
        setIsExpanded(false);
      }
    };

    if (isExpanded) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isExpanded]);

  const handleActionClick = (action: FloatingAction) => {
    action.onClick();
    setIsExpanded(false);
  };

  const handleMainButtonClick = () => {
    // If directClick is enabled and there's only one action, trigger it directly
    if (directClick && actions.length === 1) {
      actions[0].onClick();
    } else {
      setIsExpanded(!isExpanded);
    }
  };

  return (
    <div ref={fabRef} className="fixed bottom-8 right-8 z-50">
      {/* Action Menu - Professional Layout */}
      <div className={`absolute bottom-20 right-0 flex flex-col-reverse gap-3 transition-all duration-300 ease-out ${
        isExpanded ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-4 scale-95 pointer-events-none'
      }`}>
        {actions.map((action, index) => (
          <div
            key={index}
            className={`flex items-center gap-3 group transition-all duration-300 ease-out ${
              isExpanded ? 'opacity-100' : 'opacity-0'
            }`}
            style={{
              animationDelay: isExpanded ? `${index * 50}ms` : '0ms'
            }}
          >
            {/* Label - Professional Typography - Only show on hover */}
            {isExpanded && (
              <div className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap shadow-lg border border-gray-200 dark:border-gray-700 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                {action.label}
              </div>
            )}

            {/* Action Button - Clean & Professional */}
            <button
              onClick={() => handleActionClick(action)}
              className={`relative w-14 h-14 ${action.color} rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center justify-center`}
            >
              <div className="transform group-hover:scale-110 transition-transform duration-200">
                {action.icon}
              </div>
            </button>
          </div>
        ))}
      </div>

      {/* Main FAB - Professional Design */}
      <button
        onClick={handleMainButtonClick}
        className="relative w-16 h-16 bg-gradient-to-br from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 rounded-2xl shadow-xl hover:shadow-2xl transform hover:scale-105 active:scale-95 transition-all duration-200 flex items-center justify-center group"
        aria-label="Quick actions menu"
        style={{
          boxShadow: '0 8px 24px rgba(5, 150, 105, 0.4), 0 2px 8px rgba(0, 0, 0, 0.1)'
        }}
      >
        {/* Background overlay on hover */}
        <div className="absolute inset-0 bg-white/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
        
        {/* Icon with smooth rotation */}
        <div className={`relative z-10 transform transition-transform duration-300 ${isExpanded ? 'rotate-45' : 'rotate-0'}`}>
          {/* Plus/Close icon */}
          <svg 
            width="28" 
            height="28" 
            viewBox="0 0 24 24" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
            className="text-white"
          >
            <path 
              d="M12 5V19M5 12H19" 
              stroke="currentColor" 
              strokeWidth="2.5" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            />
          </svg>
        </div>

        {/* Notification badge (optional) */}
        <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-md opacity-0 group-hover:opacity-0">
          3
        </div>
      </button>

      {/* Backdrop - Subtle professional overlay */}
      {isExpanded && (
        <div 
          className="fixed inset-0 bg-black/5 backdrop-blur-[2px] -z-10 transition-opacity duration-300"
          onClick={() => setIsExpanded(false)}
        />
      )}
    </div>
  );
};

export default FloatingActionButton;
