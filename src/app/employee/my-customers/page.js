'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Search, X, User, Mail, Phone, MapPin, Tv, DollarSign, Calendar, Edit, LifeBuoy, MoreVertical, ArrowLeft, Check } from 'lucide-react';

// --- MOCK DATA ---
// In a real app, this data would be fetched from Supabase
// where 'customer.assigned_employee_id' === logged_in_employee_id
const initialMyCustomers = [
  { id: 1, fullName: 'Alice Wonderland', email: 'alice@example.com', phone: '555-0101', address: '123 Fantasy Lane', plan: 'Premium HD', subEndDate: '2025-11-15', status: 'Active' },
  { id: 3, fullName: 'Charlie Chocolate', email: 'charlie@example.com', phone: '555-0103', address: '789 Sweet St', plan: 'Premium HD', subEndDate: '2025-10-12', status: 'Expires Soon' },
];

// Mock data for plans, to be used in the modal
const availablePlans = [
  { id: 1, name: 'Basic SD', price: 19.99, duration_days: 30 },
  { id: 2, name: 'Family Plus', price: 39.99, duration_days: 30 },
  { id: 3, name: 'Premium HD', price: 59.99, duration_days: 30 },
];

// --- "ADD NEW CUSTOMER" MODAL (Multi-step) ---
const AddCustomerModal = ({ isOpen, onClose, onAddCustomer }) => {
  const [step, setStep] = useState(1);
  const [customer, setCustomer] = useState({ fullName: '', email: '', phone: '', address: '' });
  const [plan, setPlan] = useState(availablePlans[0]);
  const [payment, setPayment] = useState({ method: 'cash', amount: availablePlans[0].price });

  useEffect(() => {
    // Reset form when modal is closed
    if (!isOpen) {
      setStep(1);
      setCustomer({ fullName: '', email: '', phone: '', address: '' });
      setPlan(availablePlans[0]);
      setPayment({ method: 'cash', amount: availablePlans[0].price });
    }
  }, [isOpen]);

  const handleCustomerChange = (e) => setCustomer(prev => ({ ...prev, [e.target.name]: e.target.value }));
  
  const handlePlanChange = (e) => {
    const selectedPlan = availablePlans.find(p => p.id == e.target.value);
    setPlan(selectedPlan);
    setPayment(prev => ({ ...prev, amount: selectedPlan.price }));
  };

  const handlePaymentChange = (e) => setPayment(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    // This is where you would make multiple calls to Supabase:
    // 1. Create the user (auth.signUp)
    // 2. Insert into 'users' table (with 'customer' role and 'assigned_employee_id')
    // 3. Insert into 'subscriptions' table
    // 4. Insert into 'payments' table
    
    // Simulating the final customer object
    const newCustomer = {
      ...customer,
      id: Date.now(),
      plan: plan.name,
      subEndDate: new Date(Date.now() + plan.duration_days * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: 'Active'
    };
    
    onAddCustomer(newCustomer);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-lg">
        <div className="p-5 border-b dark:border-gray-700 flex justify-between items-center">
          <h3 className="text-xl font-semibold text-gray-800 dark:text-white">Add New Customer</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-white"><X size={24} /></button>
        </div>
        
        {/* Step Indicator */}
        <div className="p-6">
            <ol className="flex items-center w-full text-sm font-medium text-center">
                <li className={`flex md:w-full items-center ${step >= 1 ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-500'} sm:after:content-[''] after:w-full after:h-1 after:border-b ${step > 1 ? 'after:border-indigo-600' : 'after:border-gray-200'} after:border-1 after:hidden sm:after:inline-block after:mx-6 xl:after:mx-10`}>
                    <span className="flex items-center after:content-['/'] sm:after:hidden after:mx-2 after:text-gray-200">
                        {step > 1 ? <Check className="w-4 h-4 mr-2" /> : <span className="mr-2">1</span>}
                        Customer
                    </span>
                </li>
                <li className={`flex md:w-full items-center ${step >= 2 ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-500'} sm:after:content-[''] after:w-full after:h-1 after:border-b ${step > 2 ? 'after:border-indigo-600' : 'after:border-gray-200'} after:border-1 after:hidden sm:after:inline-block after:mx-6 xl:after:mx-10`}>
                    <span className="flex items-center after:content-['/'] sm:after:hidden after:mx-2 after:text-gray-200">
                        {step > 2 ? <Check className="w-4 h-4 mr-2" /> : <span className="mr-2">2</span>}
                        Plan
                    </span>
                </li>
                <li className={`flex items-center ${step === 3 ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-500'}`}>
                    <span className="mr-2">3</span>
                    Payment
                </li>
            </ol>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="p-6 max-h-[60vh] overflow-y-auto">
            {/* --- STEP 1: Customer Details --- */}
            {step === 1 && (
              <div className="space-y-4">
                <div className="relative"><User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400"/><input type="text" name="fullName" placeholder="Full Name" value={customer.fullName} onChange={handleCustomerChange} required className="pl-10 w-full p-3 border rounded-md bg-gray-50 dark:border-gray-600 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500" /></div>
                <div className="relative"><Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400"/><input type="email" name="email" placeholder="Email (Optional)" value={customer.email} onChange={handleCustomerChange} className="pl-10 w-full p-3 border rounded-md bg-gray-50 dark:border-gray-600 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500" /></div>
                <div className="relative"><Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400"/><input type="tel" name="phone" placeholder="Phone Number" value={customer.phone} onChange={handleCustomerChange} required className="pl-10 w-full p-3 border rounded-md bg-gray-50 dark:border-gray-600 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500" /></div>
                <div className="relative"><MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400"/><input type="text" name="address" placeholder="Address" value={customer.address} onChange={handleCustomerChange} required className="pl-10 w-full p-3 border rounded-md bg-gray-50 dark:border-gray-600 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500" /></div>
              </div>
            )}
            
            {/* --- STEP 2: Plan Selection --- */}
            {step === 2 && (
              <div className="space-y-4">
                 <div className="relative"><Tv className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400"/>
                    <select name="plan" value={plan.id} onChange={handlePlanChange} className="pl-10 w-full p-3 border rounded-md bg-gray-50 dark:border-gray-600 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 appearance-none">
                        {availablePlans.map(p => <option key={p.id} value={p.id}>{p.name} - ${p.price}/mo</option>)}
                    </select>
                </div>
                <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded-md">
                    <h4 className="font-semibold text-gray-800 dark:text-white">Plan Summary</h4>
                    <p className="text-gray-600 dark:text-gray-300">Customer will be subscribed to <span className="font-bold">{plan.name}</span>.</p>
                    <p className="text-gray-600 dark:text-gray-300">The first payment will be <span className="font-bold">${plan.price}</span> for {plan.duration_days} days.</p>
                </div>
              </div>
            )}

            {/* --- STEP 3: Log Payment --- */}
            {step === 3 && (
                <div className="space-y-4">
                    <div className="relative"><DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400"/>
                        <input type="number" name="amount" value={payment.amount} readOnly className="pl-10 w-full p-3 border rounded-md bg-gray-200 dark:border-gray-600 dark:bg-gray-600 text-gray-500 focus:outline-none" />
                    </div>
                    <div className="relative"><Check className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400"/>
                        <select name="method" value={payment.method} onChange={handlePaymentChange} className="pl-10 w-full p-3 border rounded-md bg-gray-50 dark:border-gray-600 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 appearance-none">
                            <option value="cash">Cash</option>
                            <option value="online">Online (QR/Link)</option>
                            <option value="card">Card</option>
                        </select>
                    </div>
                     <div className="p-4 bg-green-100 dark:bg-green-900/50 rounded-md">
                        <p className="text-green-800 dark:text-green-300">Ready to activate. Click "Finish & Add Customer" to create the account, start the subscription, and log this payment.</p>
                    </div>
                </div>
            )}
          </div>
          
          {/* Modal Footer (Navigation) */}
          <div className="p-5 bg-gray-50 dark:bg-gray-800/50 border-t dark:border-gray-700 flex justify-between gap-3">
            <button type="button" onClick={() => setStep(s => s - 1)} disabled={step === 1} className="flex items-center gap-2 px-4 py-2 rounded-md bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500 font-medium disabled:opacity-50">
                <ArrowLeft size={16} /> Back
            </button>
            {step < 3 ? (
                <button type="button" onClick={() => setStep(s => s + 1)} className="px-4 py-2 rounded-md bg-indigo-600 text-white hover:bg-indigo-700 font-medium">
                    Next
                </button>
            ) : (
                <button type="submit" className="px-4 py-2 rounded-md bg-green-600 text-white hover:bg-green-700 font-medium">
                    Finish & Add Customer
                </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};


// --- MAIN PAGE COMPONENT ---
export default function MyCustomersPage() {
  const [myCustomers, setMyCustomers] = useState(initialMyCustomers);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const handleAddCustomer = (newCustomer) => {
    setMyCustomers([newCustomer, ...myCustomers]);
  };
  
  const filteredCustomers = myCustomers.filter(c =>
    c.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.phone.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const statusColor = {
    Active: 'text-green-500',
    'Expires Soon': 'text-yellow-500',
    Inactive: 'text-red-500',
  };

  return (
    <>
      <AddCustomerModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
        onAddCustomer={handleAddCustomer}
      />
      {/* We can add an EditCustomerModal here later */}

      <div className="p-4 sm:p-6 md:p-10">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 dark:text-white">My Customers</h1>
              <p className="text-gray-500 dark:text-gray-400 mt-1">View, add, and manage your assigned customers.</p>
            </div>
            <button onClick={() => setIsAddModalOpen(true)} className="flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 transition-colors">
              <Plus size={20} />
              <span>Add New Customer</span>
            </button>
          </div>

          {/* Search Bar */}
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, email, or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Customers Table */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50 dark:bg-gray-700/50">
                  <tr>
                    <th className="p-4 font-semibold text-gray-600 dark:text-gray-300">Customer</th>
                    <th className="p-4 font-semibold text-gray-600 dark:text-gray-300">Plan & Status</th>
                    <th className="p-4 font-semibold text-gray-600 dark:text-gray-300">Contact</th>
                    <th className="p-4 font-semibold text-gray-600 dark:text-gray-300">Address</th>
                    <th className="p-4 font-semibold text-gray-600 dark:text-gray-300">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredCustomers.map((customer) => (
                    <tr key={customer.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                      <td className="p-4 whitespace-nowrap">
                        <p className="font-medium text-gray-800 dark:text-white">{customer.fullName}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{customer.email}</p>
                      </td>
                      <td className="p-4 whitespace-nowrap">
                         <p className="font-medium text-gray-800 dark:text-white">{customer.plan}</p>
                         <p className={`text-sm font-medium ${statusColor[customer.status] || 'text-gray-500'}`}>
                           {customer.status === 'Expires Soon' ? `Expires: ${customer.subEndDate}` : customer.status}
                         </p>
                      </td>
                       <td className="p-4 text-gray-500 dark:text-gray-400 whitespace-nowrap">{customer.phone}</td>
                       <td className="p-4 text-gray-500 dark:text-gray-400 whitespace-nowrap">{customer.address}</td>
                      <td className="p-4">
                         <div className="flex gap-2">
                            <button title="Edit Customer" className="p-2 text-gray-500 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
                               <Edit size={18} />
                           </button>
                           <button title="Log Support Ticket" className="p-2 text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
                               <LifeBuoy size={18} />
                           </button>
                           <a href={`/employee/payments?customerId=${customer.id}`} title="Record Payment" className="p-2 text-gray-500 hover:text-green-600 dark:hover:text-green-400 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
                               <DollarSign size={18} />
                           </a>
                         </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {filteredCustomers.length === 0 && (
                <div className="text-center p-8 text-gray-500 dark:text-gray-400">
                    You have no customers matching your search.
                </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
