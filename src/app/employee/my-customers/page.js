'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Search, X, User, Mail, Phone, MapPin, Tv, DollarSign, Calendar, Edit, LifeBuoy, MoreVertical, ArrowLeft, Check } from 'lucide-react';

// --- MOCK SUPABASE CLIENT ---
// Replace with real client
const mockSupabaseClient = {
  from: () => ({
    select: () => Promise.resolve({ data: [], error: null }),
    insert: () => Promise.resolve({ data: [], error: null }),
    update: () => Promise.resolve({ data: [], error: null }),
    delete: () => Promise.resolve({ data: [], error: null }),
  })
};

export default function MyCustomersPage() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    // Simulate fetch
    setTimeout(() => {
        setCustomers([
            { id: 1, full_name: 'John Doe', email: 'john@example.com', mobile_number: '1234567890', address: '123 Main St' },
            { id: 2, full_name: 'Jane Smith', email: 'jane@example.com', mobile_number: '0987654321', address: '456 Oak Ave' },
        ]);
        setLoading(false);
    }, 1000);
  }, []);

  const filteredCustomers = customers.filter(c => 
    c.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = (id) => {
      // FIX: Escaped quotes below
      if(confirm("Are you sure you want to delete this customer?")) {
          setCustomers(customers.filter(c => c.id !== id));
      }
  };

  return (
    <div className="p-4 sm:p-6 md:p-10">
        <div className="max-w-7xl mx-auto">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800 dark:text-white">My Customers</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">Manage your assigned customer base.</p>
                </div>
            </div>

             {/* Search Bar */}
            <div className="mb-6 relative max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                    type="text"
                    placeholder="Search by name or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 dark:bg-gray-700/50">
                            <tr>
                                <th className="p-4 font-semibold text-gray-600 dark:text-gray-300">Name</th>
                                <th className="p-4 font-semibold text-gray-600 dark:text-gray-300">Email</th>
                                <th className="p-4 font-semibold text-gray-600 dark:text-gray-300">Phone</th>
                                <th className="p-4 font-semibold text-gray-600 dark:text-gray-300">Address</th>
                                <th className="p-4 font-semibold text-gray-600 dark:text-gray-300">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                            {loading ? (
                                <tr><td colSpan="5" className="p-8 text-center text-gray-500">Loading...</td></tr>
                            ) : filteredCustomers.length === 0 ? (
                                <tr><td colSpan="5" className="p-8 text-center text-gray-500">No customers found.</td></tr>
                            ) : (
                                filteredCustomers.map((customer) => (
                                    <tr key={customer.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                        <td className="p-4 font-medium text-gray-800 dark:text-white">{customer.full_name}</td>
                                        <td className="p-4 text-gray-600 dark:text-gray-400">{customer.email}</td>
                                        <td className="p-4 text-gray-600 dark:text-gray-400">{customer.mobile_number}</td>
                                        <td className="p-4 text-gray-600 dark:text-gray-400">{customer.address}</td>
                                        <td className="p-4">
                                            <button onClick={() => handleDelete(customer.id)} className="text-red-500 hover:text-red-700">Delete</button>
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