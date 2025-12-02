'use client';

import React, { useState, useEffect } from 'react';
import { 
  Search, DollarSign, Filter, CheckCircle, 
  Clock, AlertCircle, FileText, Loader2, X 
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

// --- MODAL: RECORD PAYMENT ---
const RecordPaymentModal = ({ isOpen, onClose, invoice, onRecordPayment, loading }) => {
  const [method, setMethod] = useState('cash');
  const [reference, setReference] = useState('');

  if (!isOpen || !invoice) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    // FIX: Pass invoice.user_id to the handler
    await onRecordPayment(invoice.id, invoice.user_id, invoice.amount_due, method, reference);
    onClose();
    setMethod('cash');
    setReference('');
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex justify-center items-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md">
        <div className="p-6 border-b dark:border-gray-700 flex justify-between items-center">
          <h3 className="text-xl font-bold text-gray-800 dark:text-white">Record Payment</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-white">
            <X size={24} />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-4">
            <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg border border-indigo-100 dark:border-indigo-800 text-center">
              <p className="text-sm text-gray-500 dark:text-gray-400">Amount to Collect</p>
              <p className="text-3xl font-bold text-indigo-700 dark:text-indigo-300">₹{invoice.amount_due}</p>
              <p className="text-xs text-gray-500 mt-1">From: {invoice.users?.full_name}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Payment Method</label>
              <select
                value={method}
                onChange={(e) => setMethod(e.target.value)}
                className="w-full p-2.5 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
              >
                <option value="cash">Cash</option>
                <option value="upi">UPI / Online</option>
                <option value="bank_transfer">Bank Transfer</option>
                <option value="cheque">Cheque</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Reference ID (Optional)</label>
              <input 
                type="text" 
                placeholder="e.g. UPI Transaction ID" 
                value={reference}
                onChange={(e) => setReference(e.target.value)}
                className="w-full p-2.5 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
          </div>
          
          <div className="p-6 bg-gray-50 dark:bg-gray-800/50 border-t dark:border-gray-700 flex justify-end gap-3">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-md bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-200 font-medium">Cancel</button>
            <button type="submit" disabled={loading} className="px-4 py-2 rounded-md bg-green-600 text-white hover:bg-green-700 font-medium flex items-center gap-2">
              {loading ? <Loader2 className="animate-spin h-4 w-4"/> : <CheckCircle size={18}/>}
              Mark as Paid
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// --- MAIN PAGE COMPONENT ---
export default function PaymentsPage() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  
  // Modal State
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  const supabase = createClient();

  // Fetch Invoices
  const fetchInvoices = async () => {
    setLoading(true);
    // Fetch invoices + customer name
    const { data, error } = await supabase
      .from('invoices')
      .select('*, users(full_name, vc_number)')
      .order('issued_date', { ascending: false });

    if (error) console.error('Error fetching invoices:', error);
    else setInvoices(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  // Handle Payment Recording
  const handleRecordPayment = async (invoiceId, userId, amount, method, reference) => {
    setActionLoading(true);
    try {
      // 1. Create Payment Record
      // FIX: Added user_id to the insert object
      const { error: payError } = await supabase.from('payments').insert({
        invoice_id: invoiceId,
        user_id: userId, 
        amount: amount,
        method: method,
        transaction_ref: reference,
        status: 'completed'
      });
      if (payError) throw payError;

      // 2. Update Invoice Status
      const { error: invError } = await supabase
        .from('invoices')
        .update({ 
          status: 'paid',
          amount_paid: amount,
          paid_at: new Date().toISOString()
        })
        .eq('id', invoiceId);
      if (invError) throw invError;

      await fetchInvoices(); // Refresh list
    } catch (error) {
      alert('Error recording payment: ' + error.message);
    }
    setActionLoading(false);
  };

  // Filter Logic
  const filteredInvoices = invoices.filter(inv => {
    const matchesSearch = 
      inv.users?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.users?.vc_number?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterStatus === 'all' || inv.status === filterStatus;

    return matchesSearch && matchesFilter;
  });

  return (
    <div className="p-4 sm:p-6 md:p-10">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Payments & Invoices</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">Track pending bills and record collections.</p>
          </div>
        </div>

        {/* Controls: Search & Filter */}
        <div className="mb-6 flex flex-col md:flex-row gap-4">
          <div className="relative flex-grow max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search customer or VC number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          
          <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
            {['all', 'pending', 'paid', 'overdue'].map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-4 py-2 rounded-full text-sm font-medium capitalize whitespace-nowrap transition-colors ${
                  filterStatus === status 
                    ? 'bg-indigo-600 text-white shadow-md' 
                    : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        {/* Invoices Table */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 dark:bg-gray-700/50">
                <tr>
                  <th className="p-4 font-semibold text-gray-600 dark:text-gray-300">Customer</th>
                  <th className="p-4 font-semibold text-gray-600 dark:text-gray-300">Date</th>
                  <th className="p-4 font-semibold text-gray-600 dark:text-gray-300">Amount</th>
                  <th className="p-4 font-semibold text-gray-600 dark:text-gray-300">Status</th>
                  <th className="p-4 font-semibold text-gray-600 dark:text-gray-300 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {loading ? (
                  <tr><td colSpan="5" className="p-8 text-center text-gray-500">Loading invoices...</td></tr>
                ) : filteredInvoices.length === 0 ? (
                  <tr><td colSpan="5" className="p-8 text-center text-gray-500">No invoices found.</td></tr>
                ) : (
                  filteredInvoices.map((inv) => (
                    <tr key={inv.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                      <td className="p-4">
                        <p className="font-medium text-gray-900 dark:text-white">{inv.users?.full_name || 'Unknown'}</p>
                        <p className="text-xs text-gray-500">{inv.users?.vc_number ? `VC: ${inv.users.vc_number}` : 'No VC'}</p>
                      </td>
                      <td className="p-4 text-sm text-gray-600 dark:text-gray-300">
                        {new Date(inv.issued_date).toLocaleDateString()}
                      </td>
                      <td className="p-4 font-mono font-medium text-gray-900 dark:text-white">
                        ₹{inv.amount_due}
                      </td>
                      <td className="p-4">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs rounded-full capitalize font-medium ${
                          inv.status === 'paid' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                          inv.status === 'overdue' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                          'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                        }`}>
                          {inv.status === 'paid' && <CheckCircle size={12}/>}
                          {inv.status === 'pending' && <Clock size={12}/>}
                          {inv.status === 'overdue' && <AlertCircle size={12}/>}
                          {inv.status}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        {inv.status === 'pending' || inv.status === 'overdue' ? (
                          <button 
                            onClick={() => setSelectedInvoice(inv)}
                            className="inline-flex items-center gap-1 text-sm bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-md transition-colors"
                          >
                            <DollarSign size={14} /> Record Pay
                          </button>
                        ) : (
                          <span className="text-xs text-gray-400 italic">Completed</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <RecordPaymentModal 
        isOpen={!!selectedInvoice}
        onClose={() => setSelectedInvoice(null)}
        invoice={selectedInvoice}
        onRecordPayment={handleRecordPayment}
        loading={actionLoading}
      />
    </div>
  );
}