'use client';

import React, { useState, useEffect } from 'react';
import {
    LayoutDashboard, Users, FileText, DollarSign, BarChart2,
    UserCheck, LifeBuoy, Tv, LogOut, Menu, X, UserCircle, ChevronRight
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client'; 
import { useRouter, usePathname } from 'next/navigation';

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
function Sidebar({ userRole, isSidebarOpen, setSidebarOpen }) { 
    const supabase = createClient();
    const router = useRouter();
    const pathname = usePathname();

    // USE PASSED ROLE
    const links = navLinks[userRole] || navLinks['customer'];

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push('/auth/login'); // FIX: Redirect to /auth/login
    };

    return (
        <>
            {/* Mobile Backdrop Overlay */}
            <div 
                className={`fixed inset-0 bg-black/60 z-40 lg:hidden transition-opacity duration-300 backdrop-blur-sm ${
                    isSidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
                }`}
                onClick={() => setSidebarOpen(false)}
            />

            {/* Sidebar Container */}
            <aside className={`
                fixed top-0 left-0 z-50 h-full w-72 
                bg-white dark:bg-gray-900 
                border-r border-gray-200 dark:border-gray-800
                transform transition-transform duration-300 ease-out
                lg:translate-x-0 lg:static lg:h-screen lg:shadow-none
                ${isSidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'}
            `}>
                {/* Sidebar Header */}
                <div className="flex items-center justify-between h-16 px-6 border-b border-gray-100 dark:border-gray-800">
                    <div className="flex items-center gap-2.5">
                        <div className="bg-indigo-600 p-1.5 rounded-lg">
                            <Tv className="h-5 w-5 text-white" />
                        </div>
                        <span className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">CableCo</span>
                    </div>
                    <button 
                        onClick={() => setSidebarOpen(false)} 
                        className="lg:hidden p-2 -mr-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Navigation Links */}
                <nav className="flex-1 overflow-y-auto py-6 px-3 space-y-1 custom-scrollbar">
                    {links.map((link) => {
                        const isActive = pathname === link.href;
                        return (
                            <a 
                                key={link.name} 
                                href={link.href}
                                onClick={() => setSidebarOpen(false)}
                                className={`
                                    group flex items-center justify-between px-3 py-3 rounded-xl text-sm font-medium transition-all duration-200
                                    ${isActive 
                                        ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-300' 
                                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/50 hover:text-gray-900 dark:hover:text-gray-200'
                                    }
                                `}
                            >
                                <div className="flex items-center gap-3">
                                    <link.icon size={20} className={`transition-colors ${isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-400 group-hover:text-gray-500 dark:text-gray-500'}`} />
                                    <span>{link.name}</span>
                                </div>
                                {isActive && <div className="w-1.5 h-1.5 rounded-full bg-indigo-600 dark:bg-indigo-400" />}
                            </a>
                        );
                    })}
                </nav>

                {/* Sidebar Footer / Logout */}
                <div className="p-4 border-t border-gray-100 dark:border-gray-800">
                     <button 
                        onClick={handleLogout} 
                        className="flex items-center w-full gap-3 px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 transition-all duration-200 group"
                    >
                        <LogOut size={20} className="group-hover:scale-110 transition-transform"/>
                        <span className="font-medium">Sign Out</span>
                    </button>
                </div>
            </aside>
        </>
    );
}

// --- MAIN LAYOUT COMPONENT ---
export default function DashboardLayout({ children }) {
    const [session, setSession] = useState(null);
    const [role, setRole] = useState(null); 
    const [loading, setLoading] = useState(true);
    const [isSidebarOpen, setSidebarOpen] = useState(false);
    const supabase = createClient();
    const router = useRouter();

    useEffect(() => {
        const getSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                router.push('/auth/login'); // FIX: Redirect to /auth/login
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
                router.push('/auth/login'); // FIX: Redirect to /auth/login
            } else {
                setSession(session);
            }
        });

        return () => subscription.unsubscribe();
    }, [router, supabase]);

    if (loading) {
         return (
            <div className="w-screen h-screen flex justify-center items-center bg-gray-50 dark:bg-gray-900">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    if (!session) return null;

    return (
        <div className="flex h-screen bg-gray-50 dark:bg-gray-950 overflow-hidden">
            
            {/* Sidebar (Responsive) */}
            <Sidebar 
                userRole={role} 
                isSidebarOpen={isSidebarOpen} 
                setSidebarOpen={setSidebarOpen} 
            />

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
                
                {/* Mobile Header */}
                <header className="lg:hidden flex items-center justify-between px-4 h-16 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 sticky top-0 z-30">
                    <div className="flex items-center gap-3">
                        <button 
                            onClick={() => setSidebarOpen(true)} 
                            className="p-2 -ml-2 text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800 rounded-lg transition-colors"
                        >
                            <Menu size={24} />
                        </button>
                        <span className="font-bold text-gray-900 dark:text-white text-lg">CableCo</span>
                    </div>
                    
                    <div className="flex items-center gap-3">
                         <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center text-indigo-700 dark:text-indigo-300 text-sm font-bold">
                            {session.user?.user_metadata?.full_name?.charAt(0).toUpperCase() || 'U'}
                         </div>
                    </div>
                </header>

                {/* Desktop Header (Hidden on Mobile) */}
                <header className="hidden lg:flex items-center justify-end px-8 h-16 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
                    <div className="flex items-center gap-3 pl-4 border-l border-gray-200 dark:border-gray-700">
                         <div className="text-right hidden sm:block">
                             <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 leading-none">
                                {session.user?.user_metadata?.full_name || 'User'}
                             </p>
                             <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                {session.user?.email}
                             </p>
                        </div>
                        <div className="h-10 w-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-600 dark:text-gray-300">
                            <UserCircle size={24} />
                        </div>
                    </div>
                </header>

                {/* Scrollable Page Content */}
                <main className="flex-1 overflow-x-hidden overflow-y-auto scroll-smooth">
                    {children}
                </main>
            </div>
        </div>
    );
}