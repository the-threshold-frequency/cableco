'use client';

import React, { useState, useEffect } from 'react';
import { Users, DollarSign, Tv, UserCheck, Clock, UserPlus, FileText, Bell, LifeBuoy, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

// --- UI COMPONENTS ---

const StatCard = ({ title, value, icon, color, subtext }) => (
  <div className="bg-white dark:bg-gray-800 p-6 sm:px-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300">
    <div className="flex items-start justify-between">
      <div className="flex items-center">
        <div className={`p-3 rounded-xl mr-4 text-white shadow-md ${color}`}>
          {icon}
        </div>
        <div>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
          <h3 className="text-2xl font-bold text-gray-800 dark:text-white mt-1">{value}</h3>
        </div>
      </div>
    </div>
    {subtext && <p className="text-xs text-gray-400 mt-4">{subtext}</p>}
  </div>
);

const RevenueWidget = ({ view, setView, paidAmount, pendingAmount, loading }) => (
  <div className="bg-white dark:bg-gray-800 p-6 sm:px-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 lg:col-span-2">
    {/* Header & Toggle */}
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
      <div className="flex items-center gap-4">
        <div className="p-3 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 text-white shadow-md">
          <DollarSign size={24} />
        </div>
        <div>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Revenue (Paid)</p>
          <div className="flex items-baseline gap-2">
             {loading ? (
                <div className="h-8 w-24 bg-gray-200 dark:bg-gray-700 animate-pulse rounded"></div>
             ) : (
                <h3 className="text-3xl font-bold text-gray-800 dark:text-white">
                    ₹{paidAmount.toLocaleString()}
                </h3>
             )}
          </div>
        </div>
      </div>
      
      {/* View Toggle */}
      <div className="bg-gray-100 dark:bg-gray-700 p-1 rounded-lg flex text-xs font-medium self-end sm:self-auto">
        <button
          onClick={() => setView('daily')}
          className={`px-4 py-1.5 rounded-md transition-all duration-200 ${
            view === 'daily' 
              ? 'bg-white dark:bg-gray-600 shadow-sm text-indigo-600 dark:text-indigo-400 font-bold' 
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
          }`}
        >
          Daily
        </button>
        <button
          onClick={() => setView('monthly')}
          className={`px-4 py-1.5 rounded-md transition-all duration-200 ${
            view === 'monthly' 
              ? 'bg-white dark:bg-gray-600 shadow-sm text-indigo-600 dark:text-indigo-400 font-bold' 
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
          }`}
        >
          Monthly
        </button>
      </div>
    </div>

    {/* Breakdown Grid */}
    <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100 dark:border-gray-700">
      <div className="p-4 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-800/30">
        <p className="text-xs font-medium text-green-600 dark:text-green-400 mb-1 flex items-center gap-1">
          <ArrowUpRight size={14}/> Collected
        </p>
        <p className="text-lg font-bold text-gray-800 dark:text-white">
            {loading ? '...' : `₹${paidAmount.toLocaleString()}`}
        </p>
      </div>
      <div className="p-4 rounded-xl bg-orange-50 dark:bg-orange-900/20 border border-orange-100 dark:border-orange-800/30">
        <p className="text-xs font-medium text-orange-600 dark:text-orange-400 mb-1 flex items-center gap-1">
          <Clock size={14}/> Pending Due
        </p>
        <p className="text-lg font-bold text-gray-800 dark:text-white">
            {loading ? '...' : `₹${pendingAmount.toLocaleString()}`}
        </p>
      </div>
    </div>
  </div>
);

const ActionButton = ({ text, icon, onClick }) => (
    <button onClick={onClick} className="w-full flex items-center justify-between text-left p-4 sm:px-6 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/50 hover:shadow-md transition-all duration-200 group">
        <div className="flex items-center gap-3">
            <div className="text-indigo-500 group-hover:scale-110 transition-transform duration-200">
                {icon}
            </div>
            <span className="font-medium text-gray-700 dark:text-gray-200">{text}</span>
        </div>
        <ArrowUpRight size={16} className="text-gray-300 group-hover:text-indigo-500 transition-colors" />
    </button>
);

// --- ROLE DASHBOARDS ---

const SuperAdminDashboard = ({ user }) => {
  const supabase = createClient();
  
  // Dashboard State
  const [revenueView, setRevenueView] = useState('monthly'); // 'daily' | 'monthly'
  const [stats, setStats] = useState({ 
    customers: 0, 
    subscriptions: 0, 
    employees: 0 
  });
  const [financials, setFinancials] = useState({
    paid: 0,
    pending: 0
  });
  const [loading, setLoading] = useState(true);

  // Fetch General Stats (One-time)
  useEffect(() => {
    const fetchGeneralStats = async () => {
      const { count: customersCount } = await supabase.from('users').select('*', { count: 'exact', head: true }).eq('role', 'customer');
      const { count: employeesCount } = await supabase.from('users').select('*', { count: 'exact', head: true }).eq('role', 'employee');
      const { count: subsCount } = await supabase.from('subscriptions').select('*', { count: 'exact', head: true }).eq('status', 'active');
      
      setStats({
        customers: customersCount || 0,
        subscriptions: subsCount || 0,
        employees: employeesCount || 0
      });
    };
    fetchGeneralStats();
  }, [supabase]);

  // Fetch Financials (Depends on revenueView toggle)
  useEffect(() => {
    const fetchFinancials = async () => {
        setLoading(true);
        const now = new Date();
        let startDate;

        // Determine date range filter
        if (revenueView === 'daily') {
            // Start of today (00:00:00)
            startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
        } else {
            // Start of this month (1st 00:00:00)
            startDate = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
        }

        // Fetch invoices created/issued in this range
        const { data: invoices } = await supabase
            .from('invoices')
            .select('amount_due, amount_paid, status, issued_date')
            .gte('issued_date', startDate);

        let paidTotal = 0;
        let pendingTotal = 0;

        if (invoices) {
            invoices.forEach(inv => {
                // Calculate Paid Total
                paidTotal += (inv.amount_paid || 0);

                // Calculate Pending Total
                if (inv.status === 'pending' || inv.status === 'overdue') {
                    pendingTotal += (inv.amount_due - (inv.amount_paid || 0));
                }
            });
        }

        setFinancials({
            paid: paidTotal,
            pending: pendingTotal
        });
        setLoading(false);
    };

    fetchFinancials();
  }, [revenueView, supabase]);

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
            <h2 className="text-3xl font-bold text-gray-800 dark:text-white">Dashboard</h2>
            <p className="text-gray-500 dark:text-gray-400 mt-1">Overview for {user.user_metadata.full_name}</p>
        </div>
        <div className="text-sm px-3 py-1 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-300 rounded-full font-medium">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Revenue Widget (Spans 2 cols on Large screens) */}
        <RevenueWidget 
            view={revenueView} 
            setView={setRevenueView} 
            paidAmount={financials.paid}
            pendingAmount={financials.pending}
            loading={loading}
        />

        <StatCard 
            title="Total Customers" 
            value={stats.customers} 
            icon={<Users size={24}/>} 
            color="bg-blue-500" 
            subtext="Active subscriber base"
        />
        <StatCard 
            title="Active Plans" 
            value={stats.subscriptions} 
            icon={<Tv size={24}/>} 
            color="bg-purple-500" 
            subtext="Currently live connections"
        />
      </div>

      {/* Quick Actions */}
      <div>
          <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-6">Quick Actions</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <ActionButton text="Manage Customers" icon={<Users size={20} />} onClick={() => window.location.href='/superadmin/customers'} />
              <ActionButton text="View Payments" icon={<DollarSign size={20} />} onClick={() => window.location.href='/superadmin/payments'} />
              <ActionButton text="Manage Plans" icon={<FileText size={20} />} onClick={() => window.location.href='/superadmin/plans'} />
              <ActionButton text="Manage Channels" icon={<Tv size={20} />} onClick={() => window.location.href='/superadmin/channels'} />
              <ActionButton text="Staff Members" icon={<UserCheck size={20} />} onClick={() => window.location.href='/superadmin/employees'} />
              <ActionButton text="System Reports" icon={<FileText size={20} />} onClick={() => window.location.href='/superadmin/reports'} />
          </div>
      </div>
    </div>
  );
};

const EmployeeDashboard = ({ user }) => (
  <div>
    <h2 className="text-3xl font-bold text-gray-800 dark:text-white">Employee Dashboard</h2>
    <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      <StatCard title="Assigned Customers" value="0" icon={<Users size={24}/>} color="bg-blue-500" />
      <StatCard title="Upcoming Renewals" value="0" icon={<Clock size={24}/>} color="bg-red-500" />
      <StatCard title="Recent Payments" value="0" icon={<DollarSign size={24}/>} color="bg-green-500" />
    </div>
  </div>
);

const CustomerDashboard = ({ user }) => (
  <div>
    <h2 className="text-3xl font-bold text-gray-800 dark:text-white">My Account</h2>
    <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 sm:px-8 rounded-2xl shadow-lg">
            <h3 className="font-semibold text-lg text-gray-800 dark:text-white">Current Plan</h3>
            <p className="text-indigo-500 dark:text-indigo-400 text-2xl font-bold mt-2">Loading...</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 sm:px-8 rounded-2xl shadow-lg">
            <h3 className="font-semibold text-lg text-gray-800 dark:text-white">Next Recharge</h3>
            <p className="text-gray-500 text-2xl font-bold mt-2">N/A</p>
        </div>
    </div>
  </div>
);

// --- MAIN COMPONENT ---
export default function DashboardPage() {
  const [session, setSession] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const init = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session) {
            setSession(session);
            // FETCH REAL ROLE FROM DB
            const { data: userProfile } = await supabase
                .from('users')
                .select('role')
                .eq('id', session.user.id)
                .single();
            
            // Set role from DB, fallback to 'customer'
            setRole(userProfile?.role || 'customer');
        }
        setLoading(false);
    };
    init();
  }, [supabase]);

  if (loading) {
    return (
        <div className="w-full h-[80vh] flex justify-center items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
    );
  }
  
  if (!session) return <div className="p-10 text-center">Please log in.</div>;

  // Render based on role
  // Container now has px-6 for mobile (previously p-4) to add better horizontal padding as requested
  return (
    <div className="px-6 py-6 sm:p-10 max-w-7xl mx-auto">
        {(() => {
            switch (role) {
                case 'superadmin': return <SuperAdminDashboard user={session.user} />;
                case 'employee': return <EmployeeDashboard user={session.user} />;
                case 'customer': return <CustomerDashboard user={session.user} />;
                default: return <CustomerDashboard user={session.user} />;
            }
        })()}
    </div>
  );
}