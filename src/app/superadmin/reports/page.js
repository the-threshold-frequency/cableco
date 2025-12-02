'use client';

import React, { useState, useEffect } from 'react';
import { BarChart2, TrendingUp, Users, PieChart, ArrowUp, ArrowDown, Calendar, Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

// --- COMPONENT: REVENUE BAR CHART (CSS-ONLY) ---
const RevenueChart = ({ data }) => {
  if (!data || data.length === 0) return <div className="h-64 flex items-center justify-center text-gray-400">No data available</div>;

  const maxVal = Math.max(...data.map(d => d.value));

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700">
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-bold text-gray-800 dark:text-white flex items-center gap-2">
          <TrendingUp className="text-indigo-500" size={20}/> Revenue Trend
        </h3>
        <span className="text-xs text-gray-500 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">Last 6 Months</span>
      </div>
      
      <div className="flex items-end justify-between h-64 gap-2 sm:gap-4 mt-4">
        {data.map((item, index) => {
          const heightPercent = maxVal > 0 ? (item.value / maxVal) * 100 : 0;
          return (
            <div key={index} className="flex flex-col items-center flex-1 group relative">
              {/* Tooltip */}
              <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-900 text-white text-xs py-1 px-2 rounded pointer-events-none whitespace-nowrap z-10">
                ₹{item.value.toLocaleString()}
              </div>
              
              {/* Bar */}
              <div 
                className="w-full max-w-[40px] bg-indigo-100 dark:bg-indigo-900/30 rounded-t-sm relative overflow-hidden transition-all duration-500 ease-out"
                style={{ height: `${heightPercent}%` }}
              >
                <div className="absolute bottom-0 left-0 right-0 bg-indigo-500 hover:bg-indigo-600 transition-colors h-full w-full opacity-80"></div>
              </div>
              
              {/* Label */}
              <span className="text-xs text-gray-500 dark:text-gray-400 mt-2 font-medium truncate w-full text-center">
                {item.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// --- COMPONENT: PLAN DISTRIBUTION ---
const PlanDistribution = ({ plans }) => {
  const total = plans.reduce((acc, curr) => acc + curr.count, 0);

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700">
      <h3 className="font-bold text-gray-800 dark:text-white flex items-center gap-2 mb-6">
        <PieChart className="text-purple-500" size={20}/> Plan Popularity
      </h3>
      
      <div className="space-y-4">
        {plans.map((plan, index) => (
          <div key={index}>
            <div className="flex justify-between text-sm mb-1">
              <span className="font-medium text-gray-700 dark:text-gray-300">{plan.name}</span>
              <span className="text-gray-500">{plan.count} users ({((plan.count / total) * 100).toFixed(0)}%)</span>
            </div>
            <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2.5 overflow-hidden">
              <div 
                className={`h-2.5 rounded-full ${['bg-blue-500', 'bg-purple-500', 'bg-pink-500', 'bg-orange-500'][index % 4]}`} 
                style={{ width: `${(plan.count / total) * 100}%` }}
              ></div>
            </div>
          </div>
        ))}
        {plans.length === 0 && <p className="text-center text-gray-500 py-4">No active subscriptions found.</p>}
      </div>
    </div>
  );
};

// --- MAIN PAGE ---
export default function ReportsPage() {
  const [loading, setLoading] = useState(true);
  const [revenueData, setRevenueData] = useState([]);
  const [planStats, setPlanStats] = useState([]);
  const [collectionStats, setCollectionStats] = useState({ paid: 0, overdue: 0, pending: 0 });
  const [topCustomers, setTopCustomers] = useState([]);
  
  const supabase = createClient();

  useEffect(() => {
    const fetchReportData = async () => {
      setLoading(true);

      // 1. REVENUE DATA (Simulated Aggregation for Last 6 Months)
      // Note: In a real app with massive data, use a Supabase RPC function for this aggregation.
      // Here we fetch recent invoices and process in JS for simplicity.
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
      
      const { data: invoices } = await supabase
        .from('invoices')
        .select('amount_paid, issued_date, status, users(full_name, id)')
        .gte('issued_date', sixMonthsAgo.toISOString());

      // Process Monthly Revenue
      const monthlyRev = {};
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      
      // Initialize last 6 months labels
      for (let i = 5; i >= 0; i--) {
        const d = new Date();
        d.setMonth(d.getMonth() - i);
        monthlyRev[months[d.getMonth()]] = 0;
      }

      // Process Invoices for Revenue & Collection Stats
      let paid = 0, overdue = 0, pending = 0;
      const customerSpend = {};

      (invoices || []).forEach(inv => {
        // Revenue Chart
        if (inv.status === 'paid' || inv.amount_paid > 0) {
          const date = new Date(inv.issued_date);
          const monthName = months[date.getMonth()];
          if (monthlyRev[monthName] !== undefined) {
            monthlyRev[monthName] += (inv.amount_paid || 0);
          }
        }

        // Collection Stats
        if (inv.status === 'paid') paid++;
        else if (inv.status === 'overdue') overdue++;
        else pending++;

        // Top Customers
        if (inv.users) {
            const uid = inv.users.id;
            if (!customerSpend[uid]) customerSpend[uid] = { name: inv.users.full_name, total: 0 };
            customerSpend[uid].total += (inv.amount_paid || 0);
        }
      });

      setRevenueData(Object.keys(monthlyRev).map(key => ({ label: key, value: monthlyRev[key] })));
      setCollectionStats({ paid, overdue, pending });
      
      // Sort and set Top 5 Customers
      const sortedCustomers = Object.values(customerSpend).sort((a,b) => b.total - a.total).slice(0, 5);
      setTopCustomers(sortedCustomers);


      // 2. PLAN STATS
      const { data: subs } = await supabase
        .from('subscriptions')
        .select('packages(name)')
        .eq('status', 'active');

      const planCounts = {};
      (subs || []).forEach(sub => {
        const pName = sub.packages?.name || 'Unknown';
        planCounts[pName] = (planCounts[pName] || 0) + 1;
      });

      setPlanStats(Object.keys(planCounts).map(name => ({ name, count: planCounts[name] })));

      setLoading(false);
    };

    fetchReportData();
  }, [supabase]);

  if (loading) {
    return (
      <div className="w-full h-screen flex justify-center items-center bg-gray-50 dark:bg-gray-950">
        <Loader2 className="animate-spin h-10 w-10 text-indigo-500" />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 md:p-10 max-w-7xl mx-auto space-y-8">
      
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Reports & Analytics</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Insights into your business performance.</p>
      </div>

      {/* Top Row: Revenue Chart & Plan Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RevenueChart data={revenueData} />
        </div>
        <div>
          <PlanDistribution plans={planStats} />
        </div>
      </div>

      {/* Bottom Row: Collection Stats & Leaderboard */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Collection Health */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700">
          <h3 className="font-bold text-gray-800 dark:text-white flex items-center gap-2 mb-6">
            <BarChart2 className="text-green-500" size={20}/> Invoice Status Breakdown
          </h3>
          <div className="flex items-center justify-around text-center">
            <div>
                <div className="w-16 h-16 rounded-full border-4 border-green-500 flex items-center justify-center text-xl font-bold text-gray-800 dark:text-white mb-2">
                    {collectionStats.paid}
                </div>
                <p className="text-sm text-gray-500 font-medium">Paid</p>
            </div>
            <div>
                <div className="w-16 h-16 rounded-full border-4 border-yellow-500 flex items-center justify-center text-xl font-bold text-gray-800 dark:text-white mb-2">
                    {collectionStats.pending}
                </div>
                <p className="text-sm text-gray-500 font-medium">Pending</p>
            </div>
            <div>
                <div className="w-16 h-16 rounded-full border-4 border-red-500 flex items-center justify-center text-xl font-bold text-gray-800 dark:text-white mb-2">
                    {collectionStats.overdue}
                </div>
                <p className="text-sm text-gray-500 font-medium">Overdue</p>
            </div>
          </div>
        </div>

        {/* Top Customers */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700">
          <h3 className="font-bold text-gray-800 dark:text-white flex items-center gap-2 mb-6">
            <Users className="text-blue-500" size={20}/> Top Customers (LTV)
          </h3>
          <div className="space-y-4">
            {topCustomers.length > 0 ? topCustomers.map((c, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 flex items-center justify-center bg-indigo-100 text-indigo-600 dark:bg-indigo-900 dark:text-indigo-300 font-bold rounded-full text-xs">
                            {i + 1}
                        </div>
                        <span className="font-medium text-gray-700 dark:text-gray-200">{c.name}</span>
                    </div>
                    <span className="font-mono font-semibold text-gray-800 dark:text-white">₹{c.total.toLocaleString()}</span>
                </div>
            )) : (
                <p className="text-gray-500 text-center text-sm">No payment data yet.</p>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}