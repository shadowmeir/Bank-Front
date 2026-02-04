import React, { type ReactNode } from 'react';
import { motion } from 'framer-motion';
interface GlassCardProps {
  children: ReactNode;
  className?: string;
  hoverEffect?: boolean;
  onClick?: () => void;
}
export function GlassCard({
  children,
  className = '',
  hoverEffect = false,
  onClick
}: GlassCardProps) {
  return (
    <motion.div
      className={`glass-panel rounded-2xl p-6 ${hoverEffect ? 'glass-panel-hover transition-all duration-300 cursor-pointer' : ''} ${className}`}
      whileHover={
      hoverEffect ?
      {
        y: -5,
        boxShadow: '0 10px 30px -10px rgba(0,0,0,0.5)'
      } :
      {}
      }
      onClick={onClick}>

      {children}
    </motion.div>);

}