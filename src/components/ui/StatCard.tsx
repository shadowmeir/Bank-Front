import React, { type ReactNode } from 'react';
import { motion } from 'framer-motion';
import { GlassCard } from './GlassCard';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';
interface StatCardProps {
  title: string;
  value: string;
  trend?: string;
  trendUp?: boolean;
  icon: ReactNode;
  color?: 'cyan' | 'purple' | 'blue';
  delay?: number;
}
export function StatCard({
  title,
  value,
  trend,
  trendUp,
  icon,
  color = 'cyan',
  delay = 0
}: StatCardProps) {
  const glowColors = {
    cyan: 'shadow-glow-cyan',
    purple: 'shadow-glow-purple',
    blue: 'shadow-blue-500/30'
  };
  const textColors = {
    cyan: 'text-neon-cyan',
    purple: 'text-neon-purple',
    blue: 'text-blue-400'
  };
  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 20
      }}
      animate={{
        opacity: 1,
        y: 0
      }}
      transition={{
        duration: 0.5,
        delay
      }}>

      <GlassCard className="relative overflow-hidden group" hoverEffect>
        <div
          className={`absolute top-0 right-0 w-32 h-32 bg-${color === 'cyan' ? 'neon-cyan' : color === 'purple' ? 'neon-purple' : 'blue-500'}/5 rounded-full blur-3xl -mr-10 -mt-10 transition-all duration-500 group-hover:bg-${color === 'cyan' ? 'neon-cyan' : color === 'purple' ? 'neon-purple' : 'blue-500'}/10`} />


        <div className="relative z-10">
          <div className="flex justify-between items-start mb-4">
            <div
              className={`p-3 rounded-xl bg-white/5 border border-white/10 ${textColors[color]}`}>

              {icon}
            </div>
            {trend &&
            <div
              className={`flex items-center gap-1 text-sm font-medium ${trendUp ? 'text-green-400' : 'text-red-400'}`}>

                {trendUp ?
              <ArrowUpRight className="w-4 h-4" /> :

              <ArrowDownRight className="w-4 h-4" />
              }
                {trend}
              </div>
            }
          </div>

          <h3 className="text-gray-400 text-sm font-medium mb-1">{title}</h3>
          <div className="text-2xl font-bold tracking-tight">{value}</div>
        </div>
      </GlassCard>
    </motion.div>);

}