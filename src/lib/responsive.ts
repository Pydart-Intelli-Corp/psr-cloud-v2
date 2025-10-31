/**
 * Responsive Design Utilities
 * 
 * Custom hooks and utilities for responsive behavior
 */

'use client';

import { useState, useEffect } from 'react';

/**
 * Breakpoint values matching Tailwind CSS
 */
export const BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
} as const;

/**
 * Hook to detect current breakpoint
 * 
 * @example
 * const { isMobile, isTablet, isDesktop } = useBreakpoint();
 */
export function useBreakpoint() {
  const [breakpoint, setBreakpoint] = useState({
    isMobile: false,
    isTablet: false,
    isDesktop: false,
    width: 0,
  });

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      setBreakpoint({
        isMobile: width < BREAKPOINTS.md,
        isTablet: width >= BREAKPOINTS.md && width < BREAKPOINTS.lg,
        isDesktop: width >= BREAKPOINTS.lg,
        width,
      });
    };

    // Set initial value
    handleResize();

    // Add event listener
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return breakpoint;
}

/**
 * Hook for media query matching
 * 
 * @example
 * const isMobile = useMediaQuery('(max-width: 768px)');
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.matchMedia(query).matches;
    }
    return false;
  });

  useEffect(() => {
    const media = window.matchMedia(query);
    
    // Create listener
    const listener = (e: MediaQueryListEvent) => setMatches(e.matches);

    // Add listener
    media.addEventListener('change', listener);

    // Cleanup
    return () => media.removeEventListener('change', listener);
  }, [query]);

  return matches;
}

/**
 * Hook to detect if device is touch-enabled
 */
export function useIsTouch(): boolean {
  const [isTouch, setIsTouch] = useState(() => {
    if (typeof window !== 'undefined') {
      return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    }
    return false;
  });

  useEffect(() => {
    // Recheck on mount in case SSR initial value was wrong
    const checkTouch = () => {
      const touchEnabled = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      if (touchEnabled !== isTouch) {
        setIsTouch(touchEnabled);
      }
    };
    
    setTimeout(checkTouch, 0);
  }, [isTouch]);

  return isTouch;
}

/**
 * Hook to get viewport dimensions
 */
export function useViewport() {
  const [viewport, setViewport] = useState({
    width: 0,
    height: 0,
  });

  useEffect(() => {
    const handleResize = () => {
      setViewport({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return viewport;
}

/**
 * Responsive class name builder
 * 
 * @example
 * const classes = responsive({
 *   base: 'p-4',
 *   sm: 'p-6',
 *   lg: 'p-8'
 * });
 */
export function responsive(classes: {
  base?: string;
  sm?: string;
  md?: string;
  lg?: string;
  xl?: string;
  '2xl'?: string;
}): string {
  const classArray: string[] = [];

  if (classes.base) classArray.push(classes.base);
  if (classes.sm) classArray.push(`sm:${classes.sm}`);
  if (classes.md) classArray.push(`md:${classes.md}`);
  if (classes.lg) classArray.push(`lg:${classes.lg}`);
  if (classes.xl) classArray.push(`xl:${classes.xl}`);
  if (classes['2xl']) classArray.push(`2xl:${classes['2xl']}`);

  return classArray.join(' ');
}

/**
 * Get responsive value based on current breakpoint
 * 
 * @example
 * const columns = useResponsiveValue({ mobile: 1, tablet: 2, desktop: 3 });
 */
export function useResponsiveValue<T>(values: {
  mobile: T;
  tablet?: T;
  desktop?: T;
}): T {
  const { isTablet, isDesktop } = useBreakpoint();

  if (isDesktop && values.desktop !== undefined) return values.desktop;
  if (isTablet && values.tablet !== undefined) return values.tablet;
  return values.mobile;
}

/**
 * Common responsive padding classes
 */
export const RESPONSIVE_PADDING = {
  none: '',
  sm: 'p-3 sm:p-4 lg:p-6',
  md: 'p-4 sm:p-6 lg:p-8',
  lg: 'p-6 sm:p-8 lg:p-12',
} as const;

/**
 * Common responsive spacing classes
 */
export const RESPONSIVE_SPACING = {
  tight: 'space-y-2 sm:space-y-3',
  normal: 'space-y-4 sm:space-y-6',
  loose: 'space-y-6 sm:space-y-8',
} as const;

/**
 * Common responsive text classes
 */
export const RESPONSIVE_TEXT = {
  xs: 'text-xs sm:text-sm',
  sm: 'text-sm sm:text-base',
  base: 'text-base sm:text-lg',
  lg: 'text-lg sm:text-xl',
  xl: 'text-xl sm:text-2xl',
  '2xl': 'text-2xl sm:text-3xl',
  '3xl': 'text-3xl sm:text-4xl',
} as const;

/**
 * Common responsive heading classes
 */
export const RESPONSIVE_HEADING = {
  h1: 'text-2xl sm:text-3xl lg:text-4xl font-bold',
  h2: 'text-xl sm:text-2xl lg:text-3xl font-semibold',
  h3: 'text-lg sm:text-xl lg:text-2xl font-semibold',
  h4: 'text-base sm:text-lg lg:text-xl font-semibold',
} as const;

/**
 * Common responsive gap classes
 */
export const RESPONSIVE_GAP = {
  sm: 'gap-3 sm:gap-4',
  md: 'gap-4 sm:gap-6',
  lg: 'gap-6 sm:gap-8',
} as const;

/**
 * Common responsive grid classes
 */
export const RESPONSIVE_GRID = {
  '1-2': 'grid grid-cols-1 md:grid-cols-2',
  '1-2-3': 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3',
  '1-2-4': 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
  '2-3-4': 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4',
  '2-4': 'grid grid-cols-2 lg:grid-cols-4',
} as const;

/**
 * Touch target minimum sizes
 */
export const TOUCH_TARGET = {
  min: 'min-h-[44px] min-w-[44px]',
  comfortable: 'min-h-[48px] min-w-[48px]',
} as const;

/**
 * Safe area utilities for iOS notch
 */
export const SAFE_AREA = {
  top: 'pt-[env(safe-area-inset-top)]',
  bottom: 'pb-[env(safe-area-inset-bottom)]',
  left: 'pl-[env(safe-area-inset-left)]',
  right: 'pr-[env(safe-area-inset-right)]',
} as const;

/**
 * Common mobile-first container classes
 */
export const CONTAINER = {
  page: 'p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6 pb-20 lg:pb-8',
  card: 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg sm:rounded-xl p-4 sm:p-6 shadow-sm',
  section: 'space-y-4 sm:space-y-6',
} as const;

/**
 * Utility to combine class names
 */
export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}
