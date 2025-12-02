'use client';

import React, { useState, useEffect, Fragment } from 'react';
import {
    LayoutDashboard, Users, FileText, DollarSign, BarChart2,
    UserCheck, LifeBuoy, Tv, LogOut, Menu, X, UserCircle
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client'; 
import { useRouter } from 'next/navigation';

// --- NAVIGATION LINKS CONFIGURATION ---
const navLinks = {
  superadmin: [
    { name: 'Dashboard', icon: LayoutDashboard, href: '/dashboard' },
    { name: 'Employees', icon: UserCheck, href: '/superadmin/employees' },
    { name: 'Customers', icon: Users, href: '/superadmin/customers' },
    { name: 'Plans', icon: FileText, href: '/superadmin/plans' },
    { name: 'Channels', icon: Tv, href: '/superadmin/channels' }, 
    { name: 'Payments', icon: DollarSign, href: '/superadmin/payments' },
    { name: 'Reports', icon: BarChart2, href: '/superadmin/reports' },
    { name: 'Tickets', icon: LifeBuoy, href: '/superadmin/tickets' },
  ],
  employee: [
    { name: 'Dashboard', icon: LayoutDashboard, href: '/dashboard' },
    { name: 'My Customers', icon: Users, href: '/employee/my-customers' },
    { name: 'Record Payment', icon: DollarSign, href: '/employee/payments' },
    { name: 'Support Tickets', icon: LifeBuoy, href: '/employee/support-tickets' },
  ],
  customer: [
    { name: 'My Plan', icon: Tv, href: '/customer/my-plan' },
    { name: 'Payment History', icon: DollarSign, href: '/customer/payment-history' },
    { name: 'Get Support', icon: LifeBuoy, href: '/customer/support' },
  ],
};

// --- SIDEBAR COMPONENT ---
function Sidebar({ userRole, isSidebarOpen, setSidebarOpen }) { // CHANGED: Accept userRole prop
    const [currentPath, setCurrentPath] = useState('');
    const supabase = createClient();
    const router = useRouter();

    useEffect(() => {
        if (typeof window !== 'undefined') {
            setCurrentPath(window.location.pathname);
        }
    }, []);

    // USE PASSED ROLE
    const links = navLinks[userRole] || navLinks['customer'];

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push('/login');
    };

    return (
        <aside className={`fixed inset-y-0 left-0 bg-white dark:bg-gray-900 shadow-lg z-50 transform ₹{isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0 transition-transform duration-300 ease-in-out w-64`}>
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2">
                    <Tv className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
                    <span className="text-xl font-bold text-gray-800 dark:text-white">CableCo</span>
                </div>
                <button onClick={() => setSidebarOpen(false)} className="md:hidden p-1 text-gray-500 hover:text-gray-800 dark:hover:text-white">
                    <X size={20} />
                </button>
            </div>

            <nav className="flex-grow p-4">
                <ul>
                    {links.map((link) => (
                        <li key={link.name}>
                            <a href={link.href} className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors duration-200 ₹{currentPath === link.href ? 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/50 dark:text-indigo-300' : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800'}`}>
                                <link.icon size={20} />
                                <span className="font-medium">{link.name}</span>
                            </a>
                        </li>
                    ))}
                </ul>
            </nav>

            <div className="p-4 border-t border-gray-200 dark:border-gray-700 mt-auto">
                 <button onClick={handleLogout} className="flex items-center w-full gap-3 px-3 py-2.5 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/50 transition-colors duration-200">
                    <LogOut size={20} />
                    <span className="font-medium">Logout</span>
                </button>
            </div>
        </aside>
    );
}

// --- MAIN LAYOUT COMPONENT ---
export default function DashboardLayout({ children }) {
    const [session, setSession] = useState(null);
    const [role, setRole] = useState(null); // ADDED: Role state
    const [loading, setLoading] = useState(true);
    const [isSidebarOpen, setSidebarOpen] = useState(false);
    const supabase = createClient();
    const router = useRouter();

    useEffect(() => {
        const getSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                router.push('/login');
            } else {
                setSession(session);
                // FETCH ROLE FROM DB
                const { data: userProfile } = await supabase
                    .from('users')
                    .select('role')
                    .eq('id', session.user.id)
                    .single();
                setRole(userProfile?.role || 'customer');
            }
            setLoading(false);
        };

        getSession();

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            if (!session) {
                router.push('/login');
            } else {
                setSession(session);
            }
        });

        return () => subscription.unsubscribe();
    }, [router, supabase]);

    if (loading) {
         return (
            <div className="w-screen h-screen flex justify-center items-center bg-gray-50 dark:bg-gray-900">
                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-indigo-500"></div>
            </div>
        );
    }

    if (!session) return null;

    return (
        <div className="flex h-screen bg-gray-50 dark:bg-gray-950">
            {isSidebarOpen && <div onClick={() => setSidebarOpen(false)} className="fixed inset-0 bg-black/50 z-40 md:hidden"></div>}

            <Sidebar userRole={role} isSidebarOpen={isSidebarOpen} setSidebarOpen={setSidebarOpen} />

            <div className="flex-1 flex flex-col overflow-hidden">
                <header className="flex items-center justify-between p-4 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 md:justify-end">
                    <button onClick={() => setSidebarOpen(true)} className="p-2 text-gray-500 rounded-md md:hidden">
                        <Menu size={24} />
                    </button>
                    <div className="flex items-center gap-3">
                         <UserCircle size={28} className="text-gray-500"/>
                        <div>
                             <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">{session.user?.user_metadata?.full_name || 'User'}</p>
                             <p className="text-xs text-gray-500 dark:text-gray-400">{session.user?.email}</p>
                        </div>
                    </div>
                </header>

                <main className="flex-1 overflow-x-hidden overflow-y-auto">
                    {children}
                </main>
            </div>
        </div>
    );
}