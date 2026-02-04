import React from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight, CreditCard, Users, User } from 'lucide-react';
import { GlassCard } from './GlassCard';
import { Account } from '../../contexts/AccountContext';
interface AccountCardProps {
  account: Account;
  onClick?: () => void;
  isSelected?: boolean;
}
export function AccountCard({
  account,
  onClick,
  isSelected
}: AccountCardProps) {
  const isPersonal = account.type === 'Personal';
  const colorClass = isPersonal ? 'text-emerald-400' : 'text-blue-400';
  const bgClass = isPersonal ? 'bg-emerald-500/10' : 'bg-blue-500/10';
  const borderClass = isPersonal ?
  'border-emerald-500/20' :
  'border-blue-500/20';
  const glowClass = isPersonal ?
  'group-hover:shadow-[0_0_30px_rgba(16,185,129,0.15)]' :
  'group-hover:shadow-[0_0_30px_rgba(59,130,246,0.15)]';
  return (
    <GlassCard
      className={`relative group cursor-pointer transition-all duration-300 ${isSelected ? 'border-2 ' + borderClass : ''} ${glowClass}`}
      onClick={onClick}
      hoverEffect>

      <div className="flex justify-between items-start mb-6">
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center ${bgClass} ${colorClass}`}>

            {isPersonal ?
            <User className="w-5 h-5" /> :

            <Users className="w-5 h-5" />
            }
          </div>
          <div>
            <h3 className="font-bold text-white text-lg">{account.name}</h3>
            <p className="text-sm text-gray-400 font-mono">
              {account.accountNumber}
            </p>
          </div>
        </div>
        <span
          className={`px-2 py-1 rounded text-xs font-medium border ${bgClass} ${borderClass} ${colorClass}`}>

          {account.type}
        </span>
      </div>

      <div className="space-y-1">
        <p className="text-sm text-gray-400">Available Balance</p>
        <div className="flex items-baseline gap-1">
          <span className="text-2xl font-bold text-white">
            {account.currencySymbol}
          </span>
          <span className="text-3xl font-bold text-white">
            {account.balance.toLocaleString('en-US', {
              minimumFractionDigits: 2
            })}
          </span>
          <span className="text-sm text-gray-400 ml-1">{account.currency}</span>
        </div>
      </div>

      <div className="mt-6 pt-4 border-t border-white/5 flex justify-between items-center">
        <div className="flex -space-x-2">
          <div className="w-6 h-6 rounded-full bg-white/10 border border-black"></div>
          <div className="w-6 h-6 rounded-full bg-white/20 border border-black"></div>
        </div>
        <div
          className={`flex items-center gap-1 text-sm font-medium ${colorClass} opacity-0 group-hover:opacity-100 transition-opacity`}>

          View Details <ArrowUpRight className="w-4 h-4" />
        </div>
      </div>
    </GlassCard>);

}