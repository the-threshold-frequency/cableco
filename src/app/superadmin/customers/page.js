'use client';

import React, { useState, useEffect } from 'react';
import { Search, Eye, MoreVertical, User, MapPin, Hash, Phone, Loader2, Plus } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

export default function ManageCustomersPage() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const router = useRouter();
  const supabase = createClient();

  // Fetch Customers
  useEffect(() => {
    const fetchCustomers = async () => {
      setLoading(true);
      // We fetch users with role 'customer'
      // We also want to know their active plan, so we join with subscriptions
      const { data, error } = await supabase
        .from('users')
        .select(`
          *,
          subscriptions (
            status,
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

    fetchCustomers();
  }, [supabase]);

  // Filter Logic
  const filteredCustomers = customers.filter(c => {
    const searchLower = searchTerm.toLowerCase();
    return (
      (c.full_name?.toLowerCase() || '').includes(searchLower) ||
      (c.email?.toLowerCase() || '').includes(searchLower) ||
      (c.mobile_number?.toLowerCase() || '').includes(searchLower) ||
      (c.vc_number?.toLowerCase() || '').includes(searchLower)
    );
  });

  // Helper to get active package name safely
  const getActivePackage = (customer) => {
    const activeSub = customer.subscriptions?.find(sub => sub.status === 'active');
    return activeSub?.packages?.name || 'No Active Plan';
  };

  return (
    <div className="p-4 sm:p-6 md:p-10">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Customers</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">View and manage your subscriber base.</p>
          </div>
          {/* Note: You usually add customers via Signup, but you could add a manual 'Create Customer' modal here later */}
        </div>

        {/* Search Bar */}
        <div className="mb-6 relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, phone, or VC number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* Customers Table */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
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
                    <tr key={customer.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                      
                      {/* Customer Info */}
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center text-indigo-600 dark:text-indigo-300 font-bold">
                            {customer.full_name?.charAt(0).toUpperCase() || 'U'}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">{customer.full_name}</p>
                            <p className="text-xs text-gray-500 flex items-center gap-1">
                              <Hash size={12} /> VC: {customer.vc_number || 'N/A'}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Contact */}
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

                      {/* Current Plan */}
                      <td className="p-4">
                        <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                          getActivePackage(customer) !== 'No Active Plan' 
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                            : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                        }`}>
                          {getActivePackage(customer)}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="p-4 text-right">
                        <button 
                          onClick={() => router.push(`/superadmin/customers/${customer.id}`)}
                          className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-200 font-medium inline-flex items-center gap-1"
                        >
                          View <Eye size={16} />
                        </button>
                      </td>

                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}