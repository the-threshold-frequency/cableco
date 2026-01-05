'use client';

import React, { useState, useEffect } from 'react';
import { 
  Search, Download, CreditCard, CheckCircle, 
  Clock, Smartphone, Banknote, Edit, Save, X, Loader2
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

// --- EDIT MODAL (Local) ---
const EditPaymentModal = ({ isOpen, onClose, payment, onUpdate }) => {
    const [amount, setAmount] = useState('');
    const [status, setStatus] = useState('');
    const [method, setMethod] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (payment) {
            setAmount(payment.amount);
            setStatus(payment.status);
            setMethod(payment.method);
        }
    }, [payment]);

    const handleSave = async (e) => {
        e.preventDefault();
        setLoading(true);
        const updates = { 
            amount: parseFloat(amount),
            status, 
            method,
            // If setting to paid, set date if missing
            payment_date: status === 'paid' && !payment.payment_date ? new Date().toISOString() : payment.payment_date
        };
        await onUpdate(payment.id, updates);
        setLoading(false);
        onClose();
    };

    if (!isOpen || !payment) return null;

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex justify-center items-center p-4 backdrop-blur-sm">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="p-6 border-b dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-900/50">
                    <h3 className="font-bold text-gray-800 dark:text-white">Edit Payment</h3>
                    <button onClick={onClose}><X size={20} className="text-gray-500"/></button>
                </div>
                <form onSubmit={handleSave} className="p-6 space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Amount</label>
                        <input type="number" step="0.01" value={amount} onChange={e => setAmount(e.target.value)} className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Status</label>
                        <select value={status} onChange={e => setStatus(e.target.value)} className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                            <option value="paid">Paid</option>
                            <option value="pending">Pending</option>
                            <option value="failed">Failed</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Method</label>
                        <select value={method} onChange={e => setMethod(e.target.value)} className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                            <option value="cash">Cash</option>
                            <option value="upi">UPI / Online</option>
                            <option value="card">Card</option>
                            <option value="cheque">Cheque</option>
                            <option value="bank_transfer">Bank Transfer</option>
                        </select>
                    </div>
                    <button type="submit" disabled={loading} className="w-full py-2 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700 flex justify-center items-center gap-2">
                        {loading ? <Loader2 className="animate-spin h-4 w-4"/> : <Save size={16}/>} Save
                    </button>
                </form>
            </div>
        </div>
    );
};

export default function PaymentsPage() {
  const supabase = createClient();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); 
  
  // Edit State
  const [editingPayment, setEditingPayment] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('payments')
      .select(`
        *,
        customer:users!payments_user_id_fkey ( full_name, vc_number, mobile_number ),
        collector:users!payments_collected_by_fkey ( full_name )
      `)
      .order('payment_date', { ascending: false });

    if (error) {
      console.error('Error fetching payments:', error);
    } else {
      setPayments(data || []);
    }
    setLoading(false);
  };

  const updatePayment = async (id, updates) => {
      const { error } = await supabase.from('payments').update(updates).eq('id', id);
      if (error) alert('Update failed: ' + error.message);
      else fetchPayments();
  };

  const handleQuickPay = async (id) => {
      if(!confirm("Mark as PAID now?")) return;
      await updatePayment(id, { 
          status: 'paid', 
          payment_date: new Date().toISOString() 
      });
  };

  const getMethodIcon = (method) => {
    switch (method?.toLowerCase()) {
      case 'cash': return <Banknote size={14} />;
      case 'upi': return <Smartphone size={14} />;
      case 'card': return <CreditCard size={14} />;
      default: return <CreditCard size={14} />;
    }
  };

  const filteredPayments = payments.filter(payment => {
    const matchesSearch = 
      payment.customer?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.customer?.vc_number?.includes(searchTerm) ||
      payment.customer?.mobile_number?.includes(searchTerm) ||
      payment.collector?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
      payment.amount.toString().includes(searchTerm);
    
    const matchesStatus = statusFilter === 'all' || payment.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const totalCollected = filteredPayments
    .filter(p => p.status === 'paid')
    .reduce((sum, p) => sum + (p.amount || 0), 0);

  return (
    <>
        <EditPaymentModal 
            isOpen={isEditModalOpen} 
            onClose={() => setIsEditModalOpen(false)} 
            payment={editingPayment} 
            onUpdate={updatePayment}
        />

        <div className="p-4 sm:p-6 md:p-10 max-w-7xl mx-auto min-h-screen">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-8">
            <div>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white tracking-tight">Payments & Transactions</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">Monitor realtime collections and transaction history.</p>
            </div>
            
            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-5 py-3 rounded-2xl shadow-lg shadow-indigo-500/20">
                <p className="text-xs font-medium opacity-80 uppercase tracking-wider mb-0.5">Total Collected (Visible)</p>
                <p className="text-2xl font-bold">₹{totalCollected.toLocaleString()}</p>
            </div>
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1 group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
            <input 
                type="text" 
                placeholder="Search customer, VC, collector or amount..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all shadow-sm"
            />
            </div>
            
            <div className="flex gap-2">
            <select 
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-700 dark:text-gray-200 focus:outline-none focus:border-indigo-500 cursor-pointer"
            >
                <option value="all">All Status</option>
                <option value="paid">Paid</option>
                <option value="pending">Pending</option>
                <option value="failed">Failed</option>
            </select>

            <button className="px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-2">
                <Download size={18}/> <span className="hidden sm:inline">Export</span>
            </button>
            </div>
        </div>

        {/* Table */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
            <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
                <thead className="bg-gray-50/50 dark:bg-gray-900/50 border-b border-gray-100 dark:border-gray-700">
                <tr>
                    <th className="p-5 font-bold text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider">Customer</th>
                    <th className="p-5 font-bold text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider">Date & Month</th>
                    <th className="p-5 font-bold text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider">Collector</th>
                    <th className="p-5 font-bold text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider">Method</th>
                    <th className="p-5 font-bold text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider text-right">Amount</th>
                    <th className="p-5 font-bold text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider text-right">Status</th>
                    <th className="p-5 font-bold text-gray-500 dark:text-gray-400 text-right">Actions</th> 
                </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700/50">
                {loading ? (
                    <tr><td colSpan="7" className="p-12 text-center text-gray-500">Loading payments...</td></tr>
                ) : filteredPayments.length === 0 ? (
                    <tr><td colSpan="7" className="p-12 text-center text-gray-500">No payments found.</td></tr>
                ) : (
                    filteredPayments.map((payment) => (
                    <tr key={payment.id} className="group hover:bg-gray-50 dark:hover:bg-gray-700/20 transition-colors">
                        
                        {/* Customer */}
                        <td className="p-5">
                        <div>
                            <p className="font-bold text-gray-900 dark:text-white">{payment.customer?.full_name || 'Unknown'}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 flex items-center gap-1">
                            <span className="bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded text-[10px] font-mono">{payment.customer?.vc_number}</span>
                            </p>
                        </div>
                        </td>

                        {/* Date */}
                        <td className="p-5">
                        <div className="flex flex-col">
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                {payment.payment_date ? new Date(payment.payment_date).toLocaleDateString() : '-'}
                            </span>
                            <span className="text-xs text-gray-400 mt-0.5">
                                For {new Date(payment.billing_month).toLocaleDateString('default', { month: 'short', year: 'numeric' })}
                            </span>
                        </div>
                        </td>

                        {/* Collector */}
                        <td className="p-5">
                            {payment.collector?.full_name ? (
                                <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300">
                                    {payment.collector.full_name}
                                </span>
                            ) : (
                                <span className="text-xs text-gray-400 italic">Self / Online</span>
                            )}
                        </td>

                        {/* Method */}
                        <td className="p-5">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 capitalize">
                                {getMethodIcon(payment.method)} {payment.method || 'Cash'}
                            </span>
                        </td>

                        {/* Amount */}
                        <td className="p-5 text-right">
                        <span className="font-mono font-bold text-gray-900 dark:text-white">₹{payment.amount}</span>
                        </td>

                        {/* Status */}
                        <td className="p-5 text-right">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${
                            payment.status === 'paid' 
                            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
                            : payment.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                            : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                        }`}>
                            {payment.status === 'paid' && <CheckCircle size={10} className="mr-1"/>}
                            {payment.status === 'pending' && <Clock size={10} className="mr-1"/>}
                            {payment.status}
                        </span>
                        </td>

                        {/* Actions */}
                        <td className="p-5 text-right">
                            <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                {payment.status === 'pending' && (
                                    <button 
                                        onClick={() => handleQuickPay(payment.id)}
                                        className="p-1.5 bg-green-50 text-green-600 hover:bg-green-100 rounded-md" 
                                        title="Mark Paid"
                                    >
                                        <CheckCircle size={16}/>
                                    </button>
                                )}
                                <button 
                                    onClick={() => { setEditingPayment(payment); setIsEditModalOpen(true); }}
                                    className="p-1.5 bg-gray-50 text-indigo-600 hover:bg-indigo-50 rounded-md" 
                                    title="Edit"
                                >
                                    <Edit size={16}/>
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
    </>
  );
}