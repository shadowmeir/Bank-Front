import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Check, LayoutGrid, User, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAccount } from '../../contexts/AccountContext';
export function AccountSwitcher() {
  const { accounts, currentAccount, setSelectedAccountId } = useAccount();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
      dropdownRef.current &&
      !dropdownRef.current.contains(event.target as Node))
      {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  const handleSelect = (accountId: string | null) => {
    setSelectedAccountId(accountId);
    setIsOpen(false);
    if (accountId) {
      navigate(`/accounts/${accountId}`);
    } else {
      navigate('/dashboard');
    }
  };
  return (
    <div className="relative mb-6" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all duration-200 group">

        <div className="flex items-center gap-3 overflow-hidden">
          <div
            className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${!currentAccount ? 'bg-gradient-to-br from-neon-cyan to-neon-purple' : currentAccount.type === 'Personal' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-blue-500/20 text-blue-400'}`}>

            {!currentAccount ?
            <LayoutGrid className="w-4 h-4 text-white" /> :
            currentAccount.type === 'Personal' ?
            <User className="w-4 h-4" /> :

            <Users className="w-4 h-4" />
            }
          </div>
          <div className="text-left truncate">
            <p className="text-xs text-gray-400 font-medium">
              {currentAccount ? 'Current Account' : 'Portfolio View'}
            </p>
            <p className="text-sm font-bold text-white truncate">
              {currentAccount ? currentAccount.name : 'All Accounts'}
            </p>
          </div>
        </div>
        <ChevronDown
          className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />

      </button>

      <AnimatePresence>
        {isOpen &&
        <motion.div
          initial={{
            opacity: 0,
            y: 10,
            scale: 0.95
          }}
          animate={{
            opacity: 1,
            y: 0,
            scale: 1
          }}
          exit={{
            opacity: 0,
            y: 10,
            scale: 0.95
          }}
          transition={{
            duration: 0.2
          }}
          className="absolute top-full left-0 right-0 mt-2 p-2 rounded-xl bg-[#0f0f16] border border-white/10 shadow-xl z-50 backdrop-blur-xl">

            <div className="space-y-1">
              <button
              onClick={() => handleSelect(null)}
              className={`w-full flex items-center gap-3 p-2 rounded-lg transition-colors ${!currentAccount ? 'bg-white/10' : 'hover:bg-white/5'}`}>

                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-neon-cyan to-neon-purple flex items-center justify-center">
                  <LayoutGrid className="w-4 h-4 text-white" />
                </div>
                <div className="text-left flex-1">
                  <p className="text-sm font-bold text-white">
                    Portfolio Overview
                  </p>
                  <p className="text-xs text-gray-400">View all accounts</p>
                </div>
                {!currentAccount &&
              <Check className="w-4 h-4 text-neon-cyan" />
              }
              </button>

              <div className="h-px bg-white/10 my-2" />

              {accounts.map((account) =>
            <button
              key={account.id}
              onClick={() => handleSelect(account.id)}
              className={`w-full flex items-center gap-3 p-2 rounded-lg transition-colors ${currentAccount?.id === account.id ? 'bg-white/10' : 'hover:bg-white/5'}`}>

                  <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center ${account.type === 'Personal' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-blue-500/20 text-blue-400'}`}>

                    {account.type === 'Personal' ?
                <User className="w-4 h-4" /> :

                <Users className="w-4 h-4" />
                }
                  </div>
                  <div className="text-left flex-1">
                    <p className="text-sm font-bold text-white">
                      {account.name}
                    </p>
                    <p className="text-xs text-gray-400">
                      {account.currencySymbol}
                      {account.balance.toLocaleString()}
                    </p>
                  </div>
                  {currentAccount?.id === account.id &&
              <Check className="w-4 h-4 text-neon-cyan" />
              }
                </button>
            )}
            </div>
          </motion.div>
        }
      </AnimatePresence>
    </div>);

}