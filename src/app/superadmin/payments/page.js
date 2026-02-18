'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, Download, CreditCard, CheckCircle, 
  Clock, Smartphone, Banknote, Edit, Save, X, Loader2,
  Calendar as CalendarIcon, ChevronLeft, ChevronRight, User
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

// --- CUSTOM DATE PICKER COMPONENT (Ported from Customer Page) ---
const CustomDatePicker = ({ label, value, onChange, disabled }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [viewDate, setViewDate] = useState(value ? new Date(value) : new Date());
  const containerRef = useRef(null);

  const daysInMonth = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1).getDay();
  
  const handleDateClick = (day) => {
    const newDate = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
    const formatted = newDate.toLocaleDateString('en-CA'); 
    onChange(formatted);
    setIsOpen(false);
  };

  const changeMonth = (offset) => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + offset, 1));
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className={`relative ${disabled ? 'opacity-50 pointer-events-none' : ''}`} ref={containerRef}>
      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">{label}</label>
      <div 
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={`w-full p-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm dark:text-white outline-none flex items-center justify-between cursor-pointer ${disabled ? 'cursor-not-allowed bg-gray-100 dark:bg-gray-800' : 'focus:border-indigo-500'}`}
      >
        <span>{value ? new Date(value).toLocaleDateString() : 'Pending...'}</span>
        <CalendarIcon size={16} className="text-gray-400"/>
      </div>

      {isOpen && !disabled && (
        <div className="absolute top-full left-0 mt-2 z-50 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl p-4 w-64 animate-in fade-in zoom-in-95 duration-100">
          <div className="flex justify-between items-center mb-4">
            <button onClick={(e) => { e.preventDefault(); changeMonth(-1); }} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"><ChevronLeft size={16} className="text-gray-600 dark:text-gray-300"/></button>
            <span className="font-bold text-gray-800 dark:text-white text-sm">
              {viewDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
            </span>
            <button onClick={(e) => { e.preventDefault(); changeMonth(1); }} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"><ChevronRight size={16} className="text-gray-600 dark:text-gray-300"/></button>
          </div>
          
          <div className="grid grid-cols-7 gap-1 text-center mb-2">
            {['S','M','T','W','T','F','S'].map((d, i) => <span key={i} className="text-[10px] text-gray-400 font-bold">{d}</span>)}
          </div>
          
          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: firstDayOfMonth }).map((_, i) => <div key={`empty-${i}`} />)}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const isSelected = value && new Date(value).getDate() === day && new Date(value).getMonth() === viewDate.getMonth() && new Date(value).getFullYear() === viewDate.getFullYear();
              return (
                <button
                  key={day}
                  onClick={(e) => { e.preventDefault(); handleDateClick(day); }}
                  className={`w-8 h-8 flex items-center justify-center rounded-full text-sm transition-colors ${
                    isSelected 
                      ? 'bg-indigo-600 text-white font-bold' 
                      : 'text-gray-700 dark:text-gray-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/30'
                  }`}
                >
                  {day}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

// --- CUSTOM MONTH PICKER COMPONENT (Ported from Customer Page) ---
const CustomMonthPicker = ({ label, value, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [viewYear, setViewYear] = useState(value ? parseInt(value.split('-')[0]) : new Date().getFullYear());
  const containerRef = useRef(null);

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const handleMonthClick = (monthIndex) => {
    const monthStr = (monthIndex + 1).toString().padStart(2, '0');
    onChange(`${viewYear}-${monthStr}`);
    setIsOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) setIsOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={containerRef}>
      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">{label}</label>
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm dark:text-white outline-none focus:border-indigo-500 flex items-center justify-between cursor-pointer"
      >
        <span>
            {value ? new Date(value + '-01').toLocaleDateString('default', { month: 'long', year: 'numeric' }) : 'Select Month'}
        </span>
        <CalendarIcon size={16} className="text-gray-400"/>
      </div>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 z-50 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl p-4 w-64 animate-in fade-in zoom-in-95 duration-100">
          <div className="flex justify-between items-center mb-4">
            <button onClick={(e) => { e.preventDefault(); setViewYear(viewYear - 1); }} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"><ChevronLeft size={16} className="text-gray-600 dark:text-gray-300"/></button>
            <span className="font-bold text-gray-800 dark:text-white text-sm">{viewYear}</span>
            <button onClick={(e) => { e.preventDefault(); setViewYear(viewYear + 1); }} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"><ChevronRight size={16} className="text-gray-600 dark:text-gray-300"/></button>
          </div>
          
          <div className="grid grid-cols-3 gap-2">
            {months.map((m, i) => {
              const isSelected = value && parseInt(value.split('-')[1]) === (i + 1) && parseInt(value.split('-')[0]) === viewYear;
              return (
                <button
                  key={m}
                  onClick={(e) => { e.preventDefault(); handleMonthClick(i); }}
                  className={`py-2 text-xs rounded-lg transition-colors ${
                    isSelected 
                      ? 'bg-indigo-600 text-white font-bold' 
                      : 'text-gray-700 dark:text-gray-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/30'
                  }`}
                >
                  {m.slice(0, 3)}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

// --- RICH EDIT MODAL (Matching Customer Page Style) ---
const EditPaymentModal = ({ isOpen, onClose, payment, onUpdate, employees }) => {
    const [formData, setFormData] = useState({
        amount: '',
        status: '',
        method: '',
        paymentDate: '',
        billingMonth: '',
        collectedBy: '',
        notes: ''
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (payment) {
            setFormData({
                amount: payment.amount,
                status: payment.status,
                method: payment.method,
                paymentDate: payment.payment_date || '',
                billingMonth: payment.billing_month.slice(0, 7),
                collectedBy: payment.collected_by || '',
                notes: payment.notes || ''
            });
        }
    }, [payment]);

    const handleSave = async (e) => {
        e.preventDefault();
        setLoading(true);

        if (formData.status === 'paid' && !formData.paymentDate) {
            alert("Please select a Payment Date for paid records.");
            setLoading(false);
            return;
        }

        const updates = { 
            amount: parseFloat(formData.amount),
            status: formData.status, 
            method: formData.method,
            payment_date: formData.status === 'pending' ? null : formData.paymentDate,
            billing_month: `${formData.billingMonth}-01`,
            collected_by: formData.collectedBy || null,
            notes: formData.notes
        };

        await onUpdate(payment.id, updates);
        setLoading(false);
        onClose();
    };

    if (!isOpen || !payment) return null;

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex justify-center items-center p-4 backdrop-blur-sm transition-all">
            <div className="bg-white dark:bg-gray-800 rounded-t-2xl sm:rounded-xl shadow-2xl w-full max-w-2xl p-6 overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="flex justify-between items-center mb-6 shrink-0">
                    <div>
                        <h3 className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
                            <Edit className="text-indigo-500"/> Edit Payment
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Update payment details for {payment.customer?.full_name || 'Customer'}
                        </p>
                    </div>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"><X size={20}/></button>
                </div>

                <form onSubmit={handleSave} className="space-y-4">
                    {/* Row 1: Dates & Status */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Status</label>
                            <select 
                                value={formData.status} 
                                onChange={e => {
                                    const newStatus = e.target.value;
                                    setFormData({
                                        ...formData, 
                                        status: newStatus,
                                        paymentDate: newStatus === 'pending' ? '' : new Date().toISOString().split('T')[0]
                                    });
                                }} 
                                className="w-full p-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm dark:text-white outline-none focus:border-indigo-500"
                            >
                                <option value="paid">Paid</option>
                                <option value="pending">Pending</option>
                                <option value="failed">Failed</option>
                            </select>
                        </div>
                        <div>
                            <CustomDatePicker 
                                label="Payment Date"
                                value={formData.paymentDate}
                                onChange={(date) => setFormData({...formData, paymentDate: date})}
                                disabled={formData.status === 'pending'} 
                            />
                        </div>
                        <div>
                            <CustomMonthPicker 
                                label="Billing Month"
                                value={formData.billingMonth}
                                onChange={(month) => setFormData({...formData, billingMonth: month})}
                            />
                        </div>
                    </div>

                    {/* Row 2: Collected By & Method */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Collected By</label>
                            <select required value={formData.collectedBy} onChange={e => setFormData({...formData, collectedBy: e.target.value})} className="w-full p-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm dark:text-white outline-none focus:border-indigo-500">
                                <option value="">Select Employee</option>
                                {employees.map(e => <option key={e.id} value={e.id}>{e.full_name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Payment Method</label>
                            <select 
                                required
                                value={formData.method} 
                                onChange={e => setFormData({...formData, method: e.target.value})} 
                                className="w-full p-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm dark:text-white outline-none focus:border-indigo-500"
                            >
                                <option value="cash">Cash</option>
                                <option value="upi">UPI / Online</option>
                                <option value="card">Card</option>
                                <option value="cheque">Cheque</option>
                                <option value="bank_transfer">Bank Transfer</option>
                            </select>
                        </div>
                    </div>

                    {/* Row 3: Amount & Notes */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Total Amount (₹)</label>
                            <input type="number" step="0.01" required value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} className="w-full p-2 bg-white dark:bg-gray-800 border-2 border-indigo-100 dark:border-indigo-900 rounded-lg text-sm font-bold text-indigo-700 dark:text-indigo-400 outline-none focus:border-indigo-500"/>
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Notes (Optional)</label>
                            <input type="text" value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} placeholder="Check no, UPI ref, etc." className="w-full p-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm dark:text-white outline-none focus:border-indigo-500"/>
                        </div>
                    </div>

                    <div className="pt-4 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
                        <button type="button" onClick={onClose} className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-xl font-medium transition-colors">
                            Cancel
                        </button>
                        <button type="submit" disabled={loading} className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium shadow-md flex items-center justify-center gap-2 transition-all active:scale-[0.98]">
                            {loading && <Loader2 className="animate-spin h-4 w-4"/>} Save Changes
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default function PaymentsPage() {
  const supabase = createClient();
  const [payments, setPayments] = useState([]);
  const [employees, setEmployees] = useState([]); // NEW: Store employees for modal
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); 
  
  // Edit State
  const [editingPayment, setEditingPayment] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  useEffect(() => {
    fetchPayments();
    fetchEmployees();
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

  const fetchEmployees = async () => {
      const { data } = await supabase.from('users').select('id, full_name').eq('role', 'employee');
      setEmployees(data || []);
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
            employees={employees}
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