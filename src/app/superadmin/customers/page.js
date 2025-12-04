'use client';

import React, { useState, useEffect } from 'react';
import { Search, Eye, MoreVertical, User, MapPin, Hash, Phone, Loader2, Plus, X, Trash2, ChevronRight, Tag, RefreshCw } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { createCustomerAction } from '@/app/actions/createCustomer';

// --- MODAL: ADD CUSTOMER (LIQUID GLASS STYLE) ---
const AddCustomerModal = ({ isOpen, onClose, onAddSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const formData = new FormData(e.target);
    const result = await createCustomerAction(formData);

    setLoading(false);

    if (result.success) {
      onAddSuccess();
      onClose();
    } else {
      setError(result.message);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex justify-center items-end sm:items-center p-0 sm:p-4 backdrop-blur-[2px] transition-all">
      <div className="w-full max-w-md bg-white/20 dark:bg-black/40 backdrop-blur-2xl border border-white/30 dark:border-white/10 shadow-[0_8px_32px_0_rgba(31,38,135,0.37)] rounded-t-3xl sm:rounded-3xl p-8 animate-in slide-in-from-bottom-10 sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-300 relative overflow-hidden">
        
        <div className="absolute -top-20 -left-20 w-60 h-60 bg-indigo-500/30 rounded-full blur-3xl pointer-events-none mix-blend-overlay"></div>
        <div className="absolute -bottom-20 -right-20 w-60 h-60 bg-purple-500/30 rounded-full blur-3xl pointer-events-none mix-blend-overlay"></div>

        <div className="relative z-10">
            <div className="flex justify-between items-center mb-8">
            <div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight drop-shadow-sm">New Customer</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 font-medium">Enter details to create account</p>
            </div>
            <button onClick={onClose} className="p-2 bg-white/20 hover:bg-white/40 dark:bg-white/10 dark:hover:bg-white/20 rounded-full transition-colors backdrop-blur-md border border-white/20">
                <X size={20} className="text-gray-800 dark:text-white" />
            </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
            {error && <p className="text-sm text-red-600 bg-red-100/80 p-3 rounded-xl border border-red-200 backdrop-blur-sm">{error}</p>}
            
            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar -mr-2 p-1">
                <div>
                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-200 uppercase tracking-wider mb-1.5 ml-1">Full Name *</label>
                    <input name="full_name" type="text" required placeholder="e.g. John Doe" 
                        className="w-full p-3.5 bg-white/40 dark:bg-black/20 border border-white/40 dark:border-white/10 rounded-xl text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:ring-2 focus:ring-indigo-500/50 focus:bg-white/60 dark:focus:bg-black/40 focus:border-transparent outline-none transition-all backdrop-blur-sm shadow-sm" 
                    />
                </div>

                <div>
                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-200 uppercase tracking-wider mb-1.5 ml-1">Mobile Number *</label>
                    <input name="mobile_number" type="text" required placeholder="e.g. 9876543210" 
                        className="w-full p-3.5 bg-white/40 dark:bg-black/20 border border-white/40 dark:border-white/10 rounded-xl text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:ring-2 focus:ring-indigo-500/50 focus:bg-white/60 dark:focus:bg-black/40 focus:border-transparent outline-none transition-all backdrop-blur-sm shadow-sm" 
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-200 uppercase tracking-wider mb-1.5 ml-1">Customer ID</label>
                    <input name="customer_id" type="text" placeholder="Legacy ID" 
                        className="w-full p-3.5 bg-white/40 dark:bg-black/20 border border-white/40 dark:border-white/10 rounded-xl text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:ring-2 focus:ring-indigo-500/50 focus:bg-white/60 dark:focus:bg-black/40 focus:border-transparent outline-none transition-all backdrop-blur-sm shadow-sm" 
                    />
                    </div>
                    <div>
                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-200 uppercase tracking-wider mb-1.5 ml-1">VC Number</label>
                    <input name="vc_number" type="text" placeholder="STB ID" 
                        className="w-full p-3.5 bg-white/40 dark:bg-black/20 border border-white/40 dark:border-white/10 rounded-xl text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:ring-2 focus:ring-indigo-500/50 focus:bg-white/60 dark:focus:bg-black/40 focus:border-transparent outline-none transition-all backdrop-blur-sm shadow-sm" 
                    />
                    </div>
                </div>

                <div>
                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-200 uppercase tracking-wider mb-1.5 ml-1">Address</label>
                    <input name="address" type="text" placeholder="House No, Street, Area" 
                        className="w-full p-3.5 bg-white/40 dark:bg-black/20 border border-white/40 dark:border-white/10 rounded-xl text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:ring-2 focus:ring-indigo-500/50 focus:bg-white/60 dark:focus:bg-black/40 focus:border-transparent outline-none transition-all backdrop-blur-sm shadow-sm" 
                    />
                </div>

                <div>
                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-200 uppercase tracking-wider mb-1.5 ml-1">Email (Optional)</label>
                    <input name="email" type="email" placeholder="Auto-generated if blank" 
                        className="w-full p-3.5 bg-white/40 dark:bg-black/20 border border-white/40 dark:border-white/10 rounded-xl text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:ring-2 focus:ring-indigo-500/50 focus:bg-white/60 dark:focus:bg-black/40 focus:border-transparent outline-none transition-all backdrop-blur-sm shadow-sm" 
                    />
                </div>
            </div>

            <div className="pt-4">
                <button type="submit" disabled={loading} className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-lg shadow-indigo-500/40 flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-70">
                {loading && <Loader2 className="animate-spin h-5 w-5"/>}
                Create Account
                </button>
            </div>
            </form>
        </div>
      </div>
    </div>
  );
};

// --- MAIN PAGE COMPONENT ---
export default function ManageCustomersPage() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  // Fetch Customers
  const fetchCustomers = async () => {
    setLoading(true);
    // FIX: Added 'created_at' to subscriptions so we can find the latest one
    const { data, error } = await supabase
      .from('users')
      .select(`
        *,
        subscriptions (
          status,
          created_at,
          packages ( name )
        )
      `)
      .eq('role', 'customer')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching customers:', error);
    } else {
      setCustomers(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  // Filter Logic
  const filteredCustomers = customers.filter(c => {
    const searchLower = searchTerm.toLowerCase();
    return (
      (c.full_name?.toLowerCase() || '').includes(searchLower) ||
      (c.email?.toLowerCase() || '').includes(searchLower) ||
      (c.mobile_number?.toLowerCase() || '').includes(searchLower) ||
      (c.vc_number?.toLowerCase() || '').includes(searchLower) ||
      (c.customer_id?.toLowerCase() || '').includes(searchLower)
    );
  });

  // Helper to get active package name safely
  // FIX: Sort by date to ensure we get the latest active plan, not an old one
  const getActivePackage = (customer) => {
    if (!customer.subscriptions || customer.subscriptions.length === 0) return 'No Active Plan';
    
    const activeSub = customer.subscriptions
        .filter(sub => sub.status === 'active')
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))[0];

    return activeSub?.packages?.name || 'No Active Plan';
  };

  // Delete Handler
  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this customer? This action cannot be undone.")) return;
    const { error } = await supabase.from('users').delete().eq('id', id);
    if (error) {
        alert('Error deleting customer: ' + error.message);
    } else {
        setCustomers(customers.filter(c => c.id !== id));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-gray-900/50">
        
        {/* --- MOBILE HEADER (Sticky) --- */}
        <div className="lg:hidden sticky top-0 z-30 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-b border-gray-200 dark:border-gray-800 p-4 shadow-sm">
            <div className="flex justify-between items-center mb-3">
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">Customers</h1>
                <div className="flex gap-2">
                    <button onClick={fetchCustomers} className="p-2 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 rounded-full shadow-sm active:scale-95 transition-all">
                        <RefreshCw size={20} />
                    </button>
                    <button 
                        onClick={() => setIsModalOpen(true)} 
                        className="p-2 bg-indigo-600 text-white rounded-full shadow-lg shadow-indigo-500/30 active:scale-95 transition-all"
                    >
                        <Plus size={20} />
                    </button>
                </div>
            </div>
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                    type="text"
                    placeholder="Search customers..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9 p-2.5 bg-gray-100 dark:bg-gray-800 border-none rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none text-sm transition-all placeholder:text-gray-400"
                />
            </div>
        </div>

        <div className="p-4 sm:p-6 md:p-10 max-w-7xl mx-auto">
            
            {/* --- DESKTOP HEADER --- */}
            <div className="hidden lg:flex flex-row justify-between items-center gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Customers</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">View and manage your subscriber base.</p>
                </div>
                
                <div className="flex items-center gap-4">
                    <div className="relative w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-9 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>
                    <button onClick={fetchCustomers} className="p-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors" title="Refresh List">
                        <RefreshCw size={20} />
                    </button>
                    <button onClick={() => setIsModalOpen(true)} className="flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 transition-colors">
                        <Plus size={20} />
                        <span>Add Customer</span>
                    </button>
                </div>
            </div>

            {/* --- MOBILE LIST VIEW (Cards) --- */}
            <div className="grid grid-cols-1 gap-3 lg:hidden">
                {loading ? (
                     <div className="flex justify-center py-10"><Loader2 className="animate-spin text-indigo-600"/></div>
                ) : filteredCustomers.length === 0 ? (
                     <div className="text-center py-10 text-gray-500">No customers found.</div>
                ) : (
                    filteredCustomers.map(customer => (
                        <div 
                            key={customer.id}
                            onClick={() => router.push(`/superadmin/customers/${customer.id}`)}
                            className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 active:scale-[0.99] transition-transform flex items-center justify-between"
                        >
                            <div className="flex items-center gap-4 overflow-hidden">
                                <div className="h-12 w-12 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center text-indigo-700 dark:text-indigo-300 font-bold shrink-0 text-lg">
                                    {customer.full_name?.charAt(0).toUpperCase() || 'U'}
                                </div>
                                <div className="min-w-0">
                                    <h3 className="font-bold text-gray-900 dark:text-white truncate pr-2">{customer.full_name}</h3>
                                    <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                        {customer.customer_id && <span className="font-mono bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded">{customer.customer_id}</span>}
                                        <span className="truncate font-medium text-indigo-600 dark:text-indigo-400">{getActivePackage(customer)}</span>
                                    </div>
                                </div>
                            </div>
                            <ChevronRight size={20} className="text-gray-400 shrink-0" />
                        </div>
                    ))
                )}
            </div>

            {/* --- DESKTOP TABLE VIEW --- */}
            <div className="hidden lg:block bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                    <thead className="bg-gray-50 dark:bg-gray-700/50">
                        <tr>
                        <th className="p-4 font-semibold text-gray-600 dark:text-gray-300">Customer Info</th>
                        <th className="p-4 font-semibold text-gray-600 dark:text-gray-300">Contact</th>
                        <th className="p-4 font-semibold text-gray-600 dark:text-gray-300">Current Plan</th>
                        <th className="p-4 font-semibold text-gray-600 dark:text-gray-300 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        {loading ? (
                        <tr><td colSpan="4" className="p-8 text-center text-gray-500">Loading customers...</td></tr>
                        ) : filteredCustomers.length === 0 ? (
                        <tr><td colSpan="4" className="p-8 text-center text-gray-500">No customers found.</td></tr>
                        ) : (
                        filteredCustomers.map((customer) => (
                            <tr key={customer.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                            <td className="p-4">
                                <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center text-indigo-600 dark:text-indigo-300 font-bold">
                                    {customer.full_name?.charAt(0).toUpperCase() || 'U'}
                                </div>
                                <div>
                                    <p className="font-medium text-gray-900 dark:text-white">{customer.full_name}</p>
                                    <div className="flex gap-3 text-xs text-gray-500">
                                    {customer.customer_id && (
                                        <span className="flex items-center gap-1 text-indigo-600 dark:text-indigo-400 font-medium">
                                        ID: {customer.customer_id}
                                        </span>
                                    )}
                                    <span className="flex items-center gap-1">
                                        <Hash size={12} /> VC: {customer.vc_number || 'N/A'}
                                    </span>
                                    </div>
                                </div>
                                </div>
                            </td>
                            <td className="p-4">
                                <div className="space-y-1">
                                <p className="text-sm text-gray-600 dark:text-gray-300 flex items-center gap-2">
                                    <Phone size={14} className="text-gray-400"/> {customer.mobile_number}
                                </p>
                                <p className="text-sm text-gray-600 dark:text-gray-300 flex items-center gap-2">
                                    <MapPin size={14} className="text-gray-400"/> {customer.address || 'No Address'}
                                </p>
                                </div>
                            </td>
                            <td className="p-4">
                                <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                                getActivePackage(customer) !== 'No Active Plan' 
                                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                                    : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                                }`}>
                                {getActivePackage(customer)}
                                </span>
                            </td>
                            <td className="p-4 text-right">
                                <div className="flex items-center justify-end gap-2">
                                    <button 
                                    onClick={() => router.push(`/superadmin/customers/${customer.id}`)}
                                    className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-200 font-medium inline-flex items-center gap-1 px-2 py-1 rounded hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors"
                                    >
                                    <Eye size={18} /> View
                                    </button>
                                    <button 
                                    onClick={() => handleDelete(customer.id)}
                                    className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 font-medium inline-flex items-center gap-1 px-2 py-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                    >
                                    <Trash2 size={18} />
                                    </button>
                                </div>
                            </td>
                            </tr>
                        ))
                        )}
                    </tbody>
                    </table>
                </div>
            </div>
        </div>

        <AddCustomerModal 
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onAddSuccess={() => { fetchCustomers(); }}
        />
    </div>
  );
}