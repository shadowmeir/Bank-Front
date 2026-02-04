import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Wallet,
  TrendingUp,
  PiggyBank,
  ArrowUpRight,
  ArrowDownRight,
  MoreHorizontal,
  Plus,
  Send,
  CreditCard,
  Zap,
  ShoppingBag,
  Coffee,
  Smartphone,
  Home,
  Car } from
'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer } from
'recharts';
import { Sidebar } from '../components/ui/Sidebar';
import { GlassCard } from '../components/ui/GlassCard';
import { StatCard } from '../components/ui/StatCard';
import { Button } from '../components/ui/Button';
import { AnimatedOrbs } from '../components/ui/AnimatedOrbs';
const chartData = [
{
  name: 'Mon',
  value: 4000
},
{
  name: 'Tue',
  value: 3000
},
{
  name: 'Wed',
  value: 4500
},
{
  name: 'Thu',
  value: 3200
},
{
  name: 'Fri',
  value: 5800
},
{
  name: 'Sat',
  value: 4900
},
{
  name: 'Sun',
  value: 6000
}];

const transactions = [
{
  id: 1,
  name: 'Apple Store',
  date: 'Today, 2:30 PM',
  amount: -1299.0,
  type: 'debit',
  category: 'Electronics',
  icon: <Smartphone className="w-5 h-5" />,
  color: 'text-gray-400'
},
{
  id: 2,
  name: 'Netflix Subscription',
  date: 'Today, 10:00 AM',
  amount: -15.99,
  type: 'debit',
  category: 'Entertainment',
  icon: <Zap className="w-5 h-5" />,
  color: 'text-red-400'
},
{
  id: 3,
  name: 'Freelance Payment',
  date: 'Yesterday, 4:30 PM',
  amount: 3250.0,
  type: 'credit',
  category: 'Income',
  icon: <ArrowDownRight className="w-5 h-5" />,
  color: 'text-emerald-400'
},
{
  id: 4,
  name: 'Whole Foods Market',
  date: 'Yesterday, 12:15 PM',
  amount: -84.32,
  type: 'debit',
  category: 'Food',
  icon: <ShoppingBag className="w-5 h-5" />,
  color: 'text-orange-400'
},
{
  id: 5,
  name: 'Electric Bill',
  date: 'Oct 24, 9:00 AM',
  amount: -120.5,
  type: 'debit',
  category: 'Bills',
  icon: <Home className="w-5 h-5" />,
  color: 'text-yellow-400'
},
{
  id: 6,
  name: 'Starbucks',
  date: 'Oct 23, 8:45 AM',
  amount: -6.5,
  type: 'debit',
  category: 'Food',
  icon: <Coffee className="w-5 h-5" />,
  color: 'text-orange-400'
},
{
  id: 7,
  name: 'Uber Ride',
  date: 'Oct 22, 11:30 PM',
  amount: -24.2,
  type: 'debit',
  category: 'Transport',
  icon: <Car className="w-5 h-5" />,
  color: 'text-blue-400'
},
{
  id: 8,
  name: 'Spotify Premium',
  date: 'Oct 22, 11:00 AM',
  amount: -9.99,
  type: 'debit',
  category: 'Entertainment',
  icon: <Zap className="w-5 h-5" />,
  color: 'text-green-400'
},
{
  id: 9,
  name: 'Transfer from Savings',
  date: 'Oct 21, 3:00 PM',
  amount: 500.0,
  type: 'credit',
  category: 'Transfer',
  icon: <ArrowDownRight className="w-5 h-5" />,
  color: 'text-emerald-400'
}];

export function DashboardPage() {
  return (
    <div className="min-h-screen bg-dark-bg text-white relative overflow-hidden flex">
      <AnimatedOrbs />

      {/* Sidebar - Desktop */}
      <div className="hidden lg:block w-64 p-4 z-20 h-screen sticky top-0">
        <Sidebar />
      </div>

      {/* Main Content */}
      <main className="flex-1 p-4 lg:p-8 z-10 overflow-y-auto h-screen">
        {/* Header */}
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold">Good Morning, Alex</h1>
            <p className="text-gray-400">
              Here's what's happening with your money today.
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-emerald-400 to-teal-500 p-[2px]">
              <div className="w-full h-full rounded-full bg-black flex items-center justify-center">
                <span className="font-bold text-sm">AL</span>
              </div>
            </div>
          </div>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StatCard
            title="Total Balance"
            value="$24,562.00"
            trend="+2.5%"
            trendUp={true}
            icon={<Wallet className="w-6 h-6" />}
            color="cyan"
            delay={0.1} />

          <StatCard
            title="Monthly Spending"
            value="$1,240.50"
            trend="-4.2%"
            trendUp={true}
            icon={<TrendingUp className="w-6 h-6" />}
            color="purple"
            delay={0.2} />

          <StatCard
            title="Savings Goal"
            value="$8,400.00"
            trend="Target: $10k"
            trendUp={true}
            icon={<PiggyBank className="w-6 h-6" />}
            color="blue"
            delay={0.3} />

        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Chart Section */}
          <div className="lg:col-span-2">
            <GlassCard className="h-full">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-bold">Spending Overview</h2>
                <select className="bg-white/5 border border-white/10 rounded-lg px-3 py-1 text-sm focus:outline-none focus:border-emerald-500 text-gray-300">
                  <option>This Week</option>
                  <option>Last Week</option>
                  <option>This Month</option>
                </select>
              </div>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient
                        id="colorValue"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1">

                        <stop
                          offset="5%"
                          stopColor="#10b981"
                          stopOpacity={0.3} />

                        <stop
                          offset="95%"
                          stopColor="#10b981"
                          stopOpacity={0} />

                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="rgba(255,255,255,0.05)"
                      vertical={false} />

                    <XAxis
                      dataKey="name"
                      axisLine={false}
                      tickLine={false}
                      tick={{
                        fill: '#9ca3af',
                        fontSize: 12
                      }} />

                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{
                        fill: '#9ca3af',
                        fontSize: 12
                      }}
                      tickFormatter={(v) => `$${v}`} />

                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0a0a0f',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '8px'
                      }}
                      itemStyle={{
                        color: '#10b981'
                      }} />

                    <Area
                      type="monotone"
                      dataKey="value"
                      stroke="#10b981"
                      strokeWidth={3}
                      fillOpacity={1}
                      fill="url(#colorValue)" />

                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </GlassCard>
          </div>

          {/* Quick Actions */}
          <div className="lg:col-span-1">
            <GlassCard className="h-full">
              <h2 className="text-lg font-bold mb-6">Quick Actions</h2>
              <div className="space-y-4">
                <Button
                  variant="primary"
                  fullWidth
                  className="justify-start h-14 !bg-emerald-500 hover:!bg-emerald-400 !text-white !shadow-[0_0_20px_rgba(16,185,129,0.3)] border-none">

                  <div className="w-8 h-8 rounded-full bg-black/20 flex items-center justify-center mr-3">
                    <Send className="w-4 h-4" />
                  </div>
                  Send Money
                </Button>
                <Button
                  variant="secondary"
                  fullWidth
                  className="justify-start h-14 !bg-blue-600 hover:!bg-blue-500 !text-white !shadow-[0_0_20px_rgba(59,130,246,0.3)] border-none">

                  <div className="w-8 h-8 rounded-full bg-black/20 flex items-center justify-center mr-3">
                    <Plus className="w-4 h-4" />
                  </div>
                  Add Money
                </Button>
                <Button
                  variant="outline"
                  fullWidth
                  className="justify-start h-14 hover:!border-teal-400 hover:!text-teal-400 hover:!shadow-[0_0_15px_rgba(20,184,166,0.2)]">

                  <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center mr-3">
                    <CreditCard className="w-4 h-4" />
                  </div>
                  Pay Bills
                </Button>
              </div>
            </GlassCard>
          </div>
        </div>

        {/* Recent Transactions */}
        <GlassCard>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold">Recent Transactions</h2>
            <Button variant="ghost" size="sm">
              View All
            </Button>
          </div>
          <div className="space-y-3">
            {transactions.map((tx) =>
            <motion.div
              key={tx.id}
              initial={{
                opacity: 0,
                x: -20
              }}
              animate={{
                opacity: 1,
                x: 0
              }}
              className="flex items-center justify-between p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors border border-transparent hover:border-white/10 group">

                <div className="flex items-center gap-4">
                  <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center bg-white/5 ${tx.color} group-hover:scale-110 transition-transform`}>

                    {tx.icon}
                  </div>
                  <div>
                    <h3 className="font-medium text-white">{tx.name}</h3>
                    <p className="text-sm text-gray-400">
                      {tx.date} • {tx.category}
                    </p>
                  </div>
                </div>
                <div
                className={`font-bold ${tx.type === 'credit' ? 'text-emerald-400' : 'text-white'}`}>

                  {tx.type === 'credit' ? '+' : ''}
                  {tx.amount.toFixed(2)}
                </div>
              </motion.div>
            )}
          </div>
        </GlassCard>
      </main>
    </div>);

}