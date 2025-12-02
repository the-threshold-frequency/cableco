'use client';

import React, { useState, useEffect, Fragment } from 'react';
import { Plus, MoreVertical, Search, X, Package, DollarSign, Edit, Trash2 } from 'lucide-react';
// 1. FIX: Import the correct creator function
import { createClient } from '@/lib/supabase/client';
import { Menu, Transition } from '@headlessui/react';

// --- MODAL COMPONENT ---
const AddPlanModal = ({ isOpen, onClose, onAddPlan }) => {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    // Pass the data to the parent handler
    await onAddPlan({ name, price, description });
    setLoading(false);
    onClose();
    setName('');
    setPrice('');
    setDescription('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md">
        <div className="p-6 border-b dark:border-gray-700 flex justify-between items-center">
          <h3 className="text-xl font-semibold text-gray-800 dark:text-white">Create New Plan</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-white">
            <X size={24} />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Plan Name</label>
              <div className="relative">
                <Package className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400"/>
                <input 
                  type="text" 
                  placeholder="e.g. Gold Package" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)} 
                  required 
                  className="pl-10 w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500" 
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Monthly Price</label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400"/>
                <input 
                  type="number" 
                  step="0.01" 
                  placeholder="0.00" 
                  value={price} 
                  onChange={(e) => setPrice(e.target.value)} 
                  required 
                  className="pl-10 w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500" 
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
              <textarea 
                placeholder="What does this plan include?" 
                value={description} 
                onChange={(e) => setDescription(e.target.value)} 
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500" 
                rows="3"
              />
            </div>
          </div>
          <div className="p-6 bg-gray-50 dark:bg-gray-800/50 border-t dark:border-gray-700 flex justify-end gap-3">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-md bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500 font-medium">Cancel</button>
            <button type="submit" className="px-4 py-2 rounded-md bg-indigo-600 text-white hover:bg-indigo-700 font-medium" disabled={loading}>
              {loading ? 'Creating...' : 'Create Plan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// --- MAIN PAGE COMPONENT ---
export default function ManagePlansPage() {
  // 2. FIX: Initialize the client correctly
  const supabase = createClient();
  
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Fetch Plans
  const fetchPlans = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('packages')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) console.error('Error fetching plans:', error);
    else setPlans(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchPlans();
  }, []); // Run once on mount

  // Create Plan Handler
  const handleAddPlan = async (planData) => {
    const { data, error } = await supabase
      .from('packages')
      .insert([
        { 
          name: planData.name, 
          price: parseFloat(planData.price), 
          description: planData.description,
          is_active: true
        }
      ])
      .select();

    if (error) {
      alert('Error creating plan: ' + error.message);
    } else {
      if (data) setPlans([data[0], ...plans]);
      fetchPlans(); // Refresh list
    }
  };

  // Delete Plan Handler
  const handleDeletePlan = async (id) => {
    if(!confirm("Are you sure? This will delete the plan.")) return;

    const { error } = await supabase
      .from('packages')
      .delete()
      .eq('id', id);

    if (error) {
      console.error(error);
      alert("Failed to delete. It might be in use by a subscription.");
    } else {
      setPlans(plans.filter(p => p.id !== id));
    }
  };

  return (
    <>
      <AddPlanModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onAddPlan={handleAddPlan} 
      />
      
      <div className="p-4 sm:p-6 md:p-10">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Plans & Packages</h1>
              <p className="text-gray-500 dark:text-gray-400 mt-1">Manage the base packages available to customers.</p>
            </div>
            <button onClick={() => setIsModalOpen(true)} className="flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 transition-colors">
              <Plus size={20} />
              <span>Create New Plan</span>
            </button>
          </div>

          {/* Plans Grid / Table */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50 dark:bg-gray-700/50">
                  <tr>
                    <th className="p-4 font-semibold text-gray-600 dark:text-gray-300">Plan Name</th>
                    <th className="p-4 font-semibold text-gray-600 dark:text-gray-300">Price</th>
                    <th className="p-4 font-semibold text-gray-600 dark:text-gray-300">Description</th>
                    <th className="p-4 font-semibold text-gray-600 dark:text-gray-300">Status</th>
                    <th className="p-4 font-semibold text-gray-600 dark:text-gray-300">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {loading ? (
                    <tr><td colSpan="5" className="p-8 text-center text-gray-500">Loading plans...</td></tr>
                  ) : plans.length === 0 ? (
                    <tr><td colSpan="5" className="p-8 text-center text-gray-500">No plans found. Create one to get started.</td></tr>
                  ) : (
                    plans.map((plan) => (
                      <tr key={plan.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                        <td className="p-4 font-medium text-gray-800 dark:text-white">{plan.name}</td>
                        <td className="p-4 text-gray-600 dark:text-gray-300 font-mono">₹{plan.price}</td>
                        <td className="p-4 text-gray-500 dark:text-gray-400 max-w-xs truncate">{plan.description}</td>
                        <td className="p-4">
                          <span className={`px-2 py-1 text-xs rounded-full ₹{plan.is_active ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-red-100 text-red-800'}`}>
                            {plan.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="p-4">
                            <button onClick={() => handleDeletePlan(plan.id)} className="text-red-500 hover:text-red-700 p-2">
                                <Trash2 size={18} />
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
    </>
  );
}