'use client';

import React, { useState, useEffect } from 'react';
import { DollarSign, User, Tv, Check, Calendar, ChevronDown, Search } from 'lucide-react';

// --- MOCK DATA ---
// In a real app, this data would be fetched from Supabase
const myCustomers = [
  { id: 1, fullName: 'Alice Wonderland', plan: 'Premium HD' },
  { id: 3, fullName: 'Charlie Chocolate', plan: 'Premium HD' },
  { id: 10, fullName: 'David Copperfield', plan: 'Family Plus' },
  { id: 11, fullName: 'Eva Green', plan: 'Basic SD' },
];

const availablePlans = [
  { id: 1, name: 'Basic SD', price: 19.99, duration_days: 30 },
  { id: 2, name: 'Family Plus', price: 39.99, duration_days: 30 },
  { id: 3, name: 'Premium HD', price: 59.99, duration_days: 30 },
];

// --- MAIN PAGE COMPONENT ---
export default function RecordPaymentPage() {
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [selectedPlanId, setSelectedPlanId] = useState('');
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Check for customerId in URL query params on load
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const customerId = params.get('customerId');
    if (customerId) {
      const customer = myCustomers.find(c => c.id == customerId);
      if (customer) {
        setSelectedCustomerId(customerId);
        const plan = availablePlans.find(p => p.name === customer.plan);
        if (plan) {
          setSelectedPlanId(plan.id);
          setAmount(plan.price.toString());
        }
      }
    }
  }, []);

  const handleCustomerChange = (e) => {
    const customerId = e.target.value;
    setSelectedCustomerId(customerId);
    
    // Auto-select customer's current plan
    const customer = myCustomers.find(c => c.id == customerId);
    if (customer) {
      const plan = availablePlans.find(p => p.name === customer.plan);
      if (plan) {
        setSelectedPlanId(plan.id);
        setAmount(plan.price.toString());
      } else {
        setSelectedPlanId('');
        setAmount('');
      }
    } else {
        setSelectedPlanId('');
        setAmount('');
    }
  };

  const handlePlanChange = (e) => {
    const planId = e.target.value;
    setSelectedPlanId(planId);
    
    // Auto-fill amount based on plan
    const plan = availablePlans.find(p => p.id == planId);
    if (plan) {
      setAmount(plan.price.toString());
    } else {
      setAmount('');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);
    setIsSuccess(false);

    // In a real app, you would send this data to Supabase:
    // 1. Insert into 'payments' table.
    // 2. Update 'subscriptions' table with new 'end_date'.
    console.log({
      customerId: selectedCustomerId,
      planId: selectedPlanId,
      amount,
      paymentMethod,
      paymentDate,
    });

    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      setIsSuccess(true);
      
      // Reset form after a short delay
      setTimeout(() => {
         setIsSuccess(false);
         setSelectedCustomerId('');
         setSelectedPlanId('');
         setAmount('');
         setPaymentMethod('cash');
      }, 2500);
    }, 1500);
  };

  return (
    <div className="p-4 sm:p-6 md:p-10">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Record Payment</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Log a new subscription payment for a customer.</p>
        </div>

        {/* Payment Form */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
          <form onSubmit={handleSubmit}>
            <div className="p-6 sm:p-8 space-y-6">
              {/* Customer Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Customer</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/Next-gen h-5 w-5 text-gray-400" />
                  <select
                    value={selectedCustomerId}
                    onChange={handleCustomerChange}
                    required
                    className="pl-10 pr-10 w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 appearance-none"
                  >
                    <option value="" disabled>Select a customer...</option>
                    {myCustomers.map(customer => (
                      <option key={customer.id} value={customer.id}>{customer.fullName}</option>
                    ))}
                  </select>
                   <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
                </div>
              </div>

              {/* Plan Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Plan</label>
                <div className="relative">
                  <Tv className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <select
                    value={selectedPlanId}
                    onChange={handlePlanChange}
                    required
                    disabled={!selectedCustomerId}
                    className="pl-10 pr-10 w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 appearance-none disabled:bg-gray-200 dark:disabled:bg-gray-600"
                  >
                    <option value="" disabled>Select a plan...</option>
                    {availablePlans.map(plan => (
                      <option key={plan.id} value={plan.id}>{plan.name} (${plan.price})</option>
                    ))}
                  </select>
                   <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
                </div>
              </div>

              {/* Amount & Method */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Amount</label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      required
                      step="0.01"
                      className="pl-10 w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Payment Method</label>
                  <div className="relative">
                    <Check className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <select
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      required
                      className="pl-10 pr-10 w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 appearance-none"
                    >
                      <option value="cash">Cash</option>
                      <option value="online">Online (QR/Link)</option>
                      <option value="card">Card</option>
                    </select>
                     <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
                  </div>
                </div>
              </div>
              
              {/* Payment Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Payment Date</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="date"
                    value={paymentDate}
                    onChange={(e) => setPaymentDate(e.target.value)}
                    required
                    className="pl-10 w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
              
            </div>
            <div className="p-6 bg-gray-50 dark:bg-gray-800/50 border-t dark:border-gray-700">
              <button
                type="submit"
                disabled={isLoading || isSuccess}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                ) : isSuccess ? (
                   <>
                    <Check size={20} />
                    Payment Recorded!
                   </>
                ) : (
                  'Record Payment'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

