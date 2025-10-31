'use client';

import React, { useEffect, useRef } from 'react';
import Image from 'next/image';
import { motion, useAnimation } from 'framer-motion';

interface FlowerSpinnerProps {
  className?: string;
  size?: number;
  isLoading?: boolean;
}

/**
 * Inline Flower Spinner - Small component for inline loading states with smooth deceleration
 */
const FlowerSpinner: React.FC<FlowerSpinnerProps> = ({
  className = '',
  size = 20,
  isLoading = true
}) => {
  const controls = useAnimation();
  const currentRotation = useRef(0);

  useEffect(() => {
    if (isLoading) {
      // Start continuous rotation
      controls.start({
        rotate: [currentRotation.current, currentRotation.current + 360],
        transition: {
          duration: 2,
          ease: "linear",
          repeat: Infinity,
          repeatType: "loop"
        }
      });
    } else {
      // Get current rotation and decelerate to next full rotation
      controls.stop();
      const current = currentRotation.current % 360;
      const targetRotation = currentRotation.current + (360 - current);
      
      controls.start({
        rotate: targetRotation,
        transition: {
          duration: 1.5,
          ease: "easeOut"
        }
      }).then(() => {
        currentRotation.current = targetRotation;
      });
    }
  }, [isLoading, controls]);

  return (
    <motion.div 
      className={`relative ${className}`}
      style={{ width: size, height: size }}
      animate={controls}
      onUpdate={(latest) => {
        if (typeof latest.rotate === 'number') {
          currentRotation.current = latest.rotate;
        }
      }}
    >
      <Image
        src="/flower.png"
        alt="Loading"
        fill
        className="object-contain"
        priority
      />
    </motion.div>
  );
};

export default FlowerSpinner;