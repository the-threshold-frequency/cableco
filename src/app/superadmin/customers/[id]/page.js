'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  User, MapPin, Phone, Hash, CreditCard, Tv, 
  Package, Plus, Trash2, FileText, ArrowLeft, Loader2, Check,
  Edit, Save, X, Tag, AlertTriangle, Calendar as CalendarIcon, Clock, Search, Ban, History, DollarSign,
  ChevronLeft, ChevronRight, Receipt, CheckCircle
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

// --- CUSTOM DATE PICKER COMPONENT ---
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

// --- CUSTOM MONTH PICKER COMPONENT ---
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


// --- MODAL: PAYMENT HISTORY & ENTRY ---
const PaymentHistoryModal = ({ isOpen, onClose, customerId, activeSubscription, activeAddons, allPlans, allChannels, employees, initialView = 'list' }) => {
  const [view, setView] = useState(initialView);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [addonSearch, setAddonSearch] = useState(''); 
  const [editingId, setEditingId] = useState(null); // Track ID for edits
  const supabase = createClient();

  const [formData, setFormData] = useState({
    paymentDate: new Date().toISOString().split('T')[0],
    billingMonth: new Date().toISOString().slice(0, 7),
    packageId: '',
    addonIds: [],
    amount: '',
    collectedBy: '',
    status: 'paid', 
    method: 'cash',
    notes: ''
  });

  useEffect(() => {
    if (isOpen) {
      setView(initialView);
      fetchPayments();
      resetForm();
    }
  }, [isOpen, initialView]);

  const resetForm = () => {
    setEditingId(null);
    setFormData({
      packageId: activeSubscription?.package_id || '',
      addonIds: activeAddons.map(a => a.channel_id),
      amount: calculateTotal(activeSubscription?.package_id, activeAddons.map(a => a.channel_id)),
      status: 'paid',
      method: 'cash',
      paymentDate: new Date().toISOString().split('T')[0],
      billingMonth: new Date().toISOString().slice(0, 7),
      notes: '',
      collectedBy: ''
    });
    setAddonSearch('');
  };

  const fetchPayments = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('payments')
      .select(`
        *,
        collected_by_user:users!payments_collected_by_fkey ( full_name )
      `)
      .eq('user_id', customerId)
      .order('payment_date', { ascending: false });
    
    if (error) console.error('Full Error:', JSON.stringify(error, null, 2));
    else setPayments(data || []);
    setLoading(false);
  };

  const calculateTotal = (pkgId, addonIds) => {
    const pkgPrice = allPlans.find(p => p.id === pkgId)?.price || 0;
    const addonsPrice = addonIds.reduce((sum, id) => {
        const ch = allChannels.find(c => c.id === id);
        return sum + (ch?.price || 0);
    }, 0);
    return (pkgPrice + addonsPrice).toFixed(2);
  };

  useEffect(() => {
    if (view === 'add' && !editingId) { // Only auto-calc if NOT editing
        const total = calculateTotal(formData.packageId, formData.addonIds);
        setFormData(prev => ({ ...prev, amount: total }));
    }
  }, [formData.packageId, formData.addonIds, view]);

  const handleToggleAddon = (id) => {
    setFormData(prev => {
        const newIds = prev.addonIds.includes(id) 
            ? prev.addonIds.filter(x => x !== id)
            : [...prev.addonIds, id];
        return { ...prev, addonIds: newIds };
    });
  };

  // --- ACTIONS ---
  
  const handleEditClick = (payment) => {
    setEditingId(payment.id);
    
    setFormData({
        paymentDate: payment.payment_date || '',
        billingMonth: payment.billing_month.slice(0, 7),
        amount: payment.amount,
        status: payment.status,
        method: payment.method,
        notes: payment.notes || '',
        collectedBy: payment.collected_by || '',
        packageId: '', 
        addonIds: []   
    });
    setView('add');
  };

  const handleQuickPay = async (id) => {
    if(!confirm("Mark this pending payment as PAID today?")) return;
    const { error } = await supabase.from('payments').update({
        status: 'paid',
        payment_date: new Date().toISOString()
    }).eq('id', id);
    
    if (error) alert(error.message);
    else fetchPayments();
  };

  const handleSavePayment = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (formData.status === 'paid' && !formData.paymentDate) {
        alert("Please select a Payment Date for paid records.");
        setLoading(false);
        return;
    }

    const payload = {
        amount: parseFloat(formData.amount),
        payment_date: formData.status === 'pending' ? null : formData.paymentDate,
        billing_month: `${formData.billingMonth}-01`,
        collected_by: formData.collectedBy || null,
        status: formData.status,
        method: formData.method,
        notes: formData.notes
    };

    if (!editingId) {
        const pkgName = allPlans.find(p => p.id === formData.packageId)?.name || 'Custom';
        const addonNames = formData.addonIds.map(id => allChannels.find(c => c.id === id)?.name).filter(Boolean);
        payload.user_id = customerId;
        payload.package_name = pkgName;
        payload.addon_names = addonNames;
    }

    const query = editingId 
        ? supabase.from('payments').update(payload).eq('id', editingId)
        : supabase.from('payments').insert(payload);

    const { error } = await query;

    if (error) {
        alert('Error saving: ' + error.message);
    } else {
        await fetchPayments();
        if(editingId) setView('list');
        else onClose(); 
    }
    setLoading(false);
  };

  const filteredChannels = allChannels.filter(c => 
    c.name.toLowerCase().includes(addonSearch.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex justify-center items-end sm:items-center p-0 sm:p-4 backdrop-blur-sm transition-all">
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: #cbd5e1;
          border-radius: 9999px;
        }
        @media (prefers-color-scheme: dark) {
          .custom-scrollbar::-webkit-scrollbar-thumb {
            background-color: #4b5563;
          }
        }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb {
            background-color: #4b5563;
        }
      `}</style>
      <div className="bg-white dark:bg-gray-800 rounded-t-2xl sm:rounded-xl shadow-2xl w-full max-w-2xl p-6 h-[90vh] sm:h-[85vh] flex flex-col animate-in slide-in-from-bottom-10 sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-200">
        
        <div className="flex justify-between items-center mb-6 shrink-0">
           <div>
             <h3 className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
                {view === 'add' ? (editingId ? <Edit className="text-indigo-500"/> : <Plus className="text-indigo-500"/>) : <History className="text-indigo-500"/>} 
                {view === 'add' ? (editingId ? 'Edit Payment' : 'Record New Payment') : 'Payment History'}
             </h3>
             <p className="text-sm text-gray-500 dark:text-gray-400">
                {view === 'add' ? 'Enter payment details' : 'View all past transactions'}
             </p>
           </div>
           <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"><X size={20}/></button>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar pr-1">
            {view === 'list' ? (
                <div className="space-y-3">
                    {payments.length === 0 ? (
                        <div className="text-center py-10 text-gray-400 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl">
                            No payment history found.
                        </div>
                    ) : (
                        payments.map(pay => (
                            <div key={pay.id} className="p-4 border border-gray-100 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-900/30 flex justify-between items-center group">
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="font-bold text-gray-800 dark:text-white">₹{pay.amount}</span>
                                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${
                                            pay.status === 'paid' 
                                            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
                                            : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                                        }`}>
                                            {pay.status || 'paid'}
                                        </span>
                                        <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 uppercase">
                                            {pay.method}
                                        </span>
                                    </div>
                                    <p className="text-xs text-gray-500">
                                        {pay.payment_date ? new Date(pay.payment_date).toLocaleDateString() : 'Pending'} • For {new Date(pay.billing_month).toLocaleDateString('default', { month: 'long', year: 'numeric' })}
                                    </p>
                                    <p className="text-xs text-gray-400 mt-1">
                                        {pay.package_name} {pay.addon_names?.length > 0 && `+ ${pay.addon_names.length} Addons`}
                                    </p>
                                </div>
                                
                                <div className="flex items-center gap-2">
                                    {/* QUICK ACTIONS */}
                                    {pay.status === 'pending' && (
                                        <button 
                                            onClick={() => handleQuickPay(pay.id)}
                                            className="p-2 text-green-600 bg-green-50 dark:bg-green-900/20 hover:bg-green-100 rounded-full transition-colors"
                                            title="Mark as Paid Today"
                                        >
                                            <CheckCircle size={18} />
                                        </button>
                                    )}
                                    <button 
                                        onClick={() => handleEditClick(pay)}
                                        className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
                                        title="Edit Payment"
                                    >
                                        <Edit size={18} />
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            ) : (
                <form onSubmit={handleSavePayment} className="space-y-4">
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

                    {/* Row 2: Collected By & Base Plan */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Collected By</label>
                            <select required value={formData.collectedBy} onChange={e => setFormData({...formData, collectedBy: e.target.value})} className="w-full p-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm dark:text-white outline-none focus:border-indigo-500">
                                <option value="">Select Employee</option>
                                {employees.map(e => <option key={e.id} value={e.id}>{e.full_name}</option>)}
                            </select>
                        </div>
                        
                        {/* Hide Plan/Addon Selection if Editing */}
                        {!editingId && (
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Base Plan</label>
                                <select value={formData.packageId} onChange={e => setFormData({...formData, packageId: e.target.value})} className="w-full p-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm dark:text-white outline-none focus:border-indigo-500">
                                    <option value="">Select Plan</option>
                                    {allPlans.map(p => <option key={p.id} value={p.id}>{p.name} (₹{p.price})</option>)}
                                </select>
                            </div>
                        )}
                    </div>

                    {/* Channel Search (Hide on Edit) */}
                    {!editingId && (
                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider">Select Add-ons</label>
                                <div className="relative w-1/2">
                                    <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-gray-400"/>
                                    <input 
                                        type="text" 
                                        placeholder="Search..." 
                                        value={addonSearch}
                                        onChange={(e) => setAddonSearch(e.target.value)}
                                        className="w-full pl-7 p-1 text-xs bg-gray-100 dark:bg-gray-700 rounded border-none focus:ring-0 text-gray-800 dark:text-gray-200 placeholder-gray-400"
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-lg p-2 bg-gray-50 dark:bg-gray-900/50 custom-scrollbar">
                                {filteredChannels.length > 0 ? filteredChannels.map(c => (
                                    <label key={c.id} className="flex items-center gap-2 text-xs cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 p-1 rounded">
                                        <input type="checkbox" checked={formData.addonIds.includes(c.id)} onChange={() => handleToggleAddon(c.id)} className="rounded text-indigo-600 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:ring-indigo-500"/>
                                        <span className="flex-1 truncate dark:text-gray-300">{c.name}</span>
                                        <span className="text-gray-400">₹{c.price}</span>
                                    </label>
                                )) : (
                                    <p className="text-xs text-gray-400 col-span-2 text-center py-2">No channels found</p>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Row 4: Total Amount & Payment Method */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Total Amount (₹)</label>
                            <input type="number" step="0.01" required value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} className="w-full p-2 bg-white dark:bg-gray-800 border-2 border-indigo-100 dark:border-indigo-900 rounded-lg text-sm font-bold text-indigo-700 dark:text-indigo-400 outline-none focus:border-indigo-500"/>
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
                    
                    <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Notes (Optional)</label>
                        <input type="text" value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} placeholder="Check no, UPI ref, etc." className="w-full p-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm dark:text-white outline-none focus:border-indigo-500"/>
                    </div>
                </form>
            )}
        </div>

        {/* Footer Actions */}
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            {view === 'list' ? (
                <div className="flex gap-3">
                    <button onClick={() => { resetForm(); setView('add'); }} className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium shadow-md flex items-center justify-center gap-2 transition-all active:scale-[0.98]">
                        <Plus size={18}/> Record New Payment
                    </button>
                    <button onClick={onClose} className="px-5 py-3 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-xl font-medium transition-colors">
                        Close
                    </button>
                </div>
            ) : (
                <div className="flex gap-3">
                    <button onClick={() => setView('list')} className="px-4 py-3 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-xl font-medium transition-colors">
                        Cancel
                    </button>
                    <button onClick={handleSavePayment} disabled={loading} className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium shadow-md flex items-center justify-center gap-2 transition-all active:scale-[0.98]">
                        {loading && <Loader2 className="animate-spin h-4 w-4"/>} {editingId ? 'Update Payment' : 'Save Payment'}
                    </button>
                </div>
            )}
        </div>

      </div>
    </div>
  );
};

// --- MODAL: CHANGE PLAN ---
const ChangePlanModal = ({ isOpen, onClose, plans, currentPlanId, onAssignPlan, loading }) => {
  const [selectedPlanId, setSelectedPlanId] = useState(currentPlanId || '');

  useEffect(() => {
    setSelectedPlanId(currentPlanId || '');
  }, [currentPlanId]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex justify-center items-end sm:items-center p-0 sm:p-4 backdrop-blur-sm transition-all">
      <div className="bg-white dark:bg-gray-800 rounded-t-2xl sm:rounded-xl shadow-2xl w-full max-w-md p-6 animate-in slide-in-from-bottom-10 sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-200">
        <div className="flex justify-between items-center mb-4">
           <h3 className="text-xl font-bold text-gray-800 dark:text-white">Assign Base Plan</h3>
           <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"><X size={20}/></button>
        </div>
        
        <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1 custom-scrollbar">
          {plans.map((plan) => (
            <div 
              key={plan.id}
              onClick={() => setSelectedPlanId(plan.id)}
              className={`p-4 border rounded-xl cursor-pointer transition-all active:scale-[0.98] ${
                selectedPlanId === plan.id 
                  ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 ring-1 ring-indigo-500' 
                  : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-750'
              }`}
            >
              <div className="flex justify-between items-center">
                <span className="font-semibold text-gray-800 dark:text-white">{plan.name}</span>
                <span className="font-mono text-indigo-600 dark:text-indigo-400 font-medium">₹{plan.price}</span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">{plan.description}</p>
            </div>
          ))}
        </div>
        <div className="mt-6 grid grid-cols-2 gap-3">
          <button onClick={onClose} className="px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg font-medium transition-colors">Cancel</button>
          <button 
            onClick={() => onAssignPlan(selectedPlanId)}
            disabled={loading || !selectedPlanId}
            className="px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 font-medium shadow-md transition-all active:scale-95"
          >
            {loading ? 'Updating...' : 'Confirm Change'}
          </button>
        </div>
      </div>
    </div>
  );
};

// --- MODAL: MANAGE CHANNELS ---
const ManageChannelsModal = ({ isOpen, onClose, allChannels, activeChannelIds, onToggleChannel, loading }) => {
  const [searchTerm, setSearchTerm] = useState('');

  if (!isOpen) return null;

  const filteredChannels = allChannels.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex justify-center items-end sm:items-center p-0 sm:p-4 backdrop-blur-sm transition-all">
      <div className="bg-white dark:bg-gray-800 rounded-t-2xl sm:rounded-xl shadow-2xl w-full max-w-lg p-6 h-[85vh] sm:h-[80vh] flex flex-col animate-in slide-in-from-bottom-10 sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-200">
        <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-gray-800 dark:text-white">Manage Add-ons</h3>
            <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"><X size={20}/></button>
        </div>
        
        <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400"/>
            <input 
              type="text" 
              placeholder="Search channels..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 p-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
            />
        </div>

        <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
          {filteredChannels.map((channel) => {
            const isActive = activeChannelIds.includes(channel.id);
            return (
              <div 
                key={channel.id}
                onClick={() => onToggleChannel(channel.id, isActive)}
                className={`flex justify-between items-center p-3 rounded-xl cursor-pointer border transition-all active:scale-[0.99] ${
                  isActive 
                    ? 'border-green-500 bg-green-50 dark:bg-green-900/20' 
                    : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'
                }`}
              >
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                      isActive ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' : 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400'
                  }`}>
                      {channel.name.substring(0,2).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-gray-800 dark:text-white truncate">{channel.name}</p>
                    <span className="text-xs px-2 py-0.5 bg-gray-200 dark:bg-gray-700 rounded-full text-gray-600 dark:text-gray-300 inline-block mt-0.5">
                      {channel.category}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="font-mono text-sm text-gray-600 dark:text-gray-400">₹{channel.price}</span>
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                    isActive ? 'bg-green-500 border-green-500' : 'border-gray-300 dark:border-gray-600'
                  }`}>
                    {isActive && <Check size={14} className="text-white" />}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <button onClick={onClose} className="w-full py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 font-medium shadow-lg shadow-indigo-500/30 transition-all active:scale-[0.98]">Done</button>
        </div>
      </div>
    </div>
  );
};

// --- MAIN PAGE COMPONENT ---
export default function CustomerDetailsPage() {
  const { id: customerId } = useParams();
  const router = useRouter();
  const supabase = createClient();

  const [customer, setCustomer] = useState(null);
  const [subscription, setSubscription] = useState(null);
  const [addons, setAddons] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [recentPayments, setRecentPayments] = useState([]); 
  
  const [availablePlans, setAvailablePlans] = useState([]);
  const [availableChannels, setAvailableChannels] = useState([]);
  const [employees, setEmployees] = useState([]);

  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
  const [isChannelModalOpen, setIsChannelModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentModalView, setPaymentModalView] = useState('list'); 

  const [isEditing, setIsEditing] = useState(false);
  const [editFormData, setEditFormData] = useState({
    full_name: '',
    mobile_number: '',
    address: '',
    vc_number: '',
    customer_id: ''
  });

  // --- DATA FETCHING ---
  const fetchData = async () => {
    if (!customer) setLoading(true);
    
    const { data: userData } = await supabase.from('users').select('*').eq('id', customerId).single();
    setCustomer(userData);

    // Fetch active subscription
    const { data: subData, error: subError } = await supabase
      .from('subscriptions')
      .select('*, packages(*)')
      .eq('user_id', customerId)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle(); 
    
    if (subError) console.error('Fetch Subscription Error:', subError);
    setSubscription(subData);

    // Only fetch addons if active subscription exists
    if (subData) {
      const { data: addonData } = await supabase
        .from('subscription_addons')
        .select('*, channels(*)')
        .eq('subscription_id', subData.id);
      setAddons(addonData || []);
    } else {
        setAddons([]);
    }

    const { data: invoiceData } = await supabase
      .from('invoices')
      .select('*')
      .eq('user_id', customerId)
      .order('issued_date', { ascending: false });
    setInvoices(invoiceData || []);

    // FETCH RECENT PAYMENTS
    const { data: paymentData } = await supabase
      .from('payments')
      .select('id, amount, payment_date, status, method')
      .eq('user_id', customerId)
      .order('payment_date', { ascending: false })
      .limit(3);
    setRecentPayments(paymentData || []);

    const { data: plans } = await supabase.from('packages').select('*').eq('is_active', true);
    setAvailablePlans(plans || []);
    
    const { data: channels } = await supabase.from('channels').select('*').eq('is_active', true);
    setAvailableChannels(channels || []);

    // Fetch Employees
    const { data: empData } = await supabase.from('users').select('id, full_name').eq('role', 'employee');
    setEmployees(empData || []);

    setLoading(false);
  };

  useEffect(() => {
    if (customerId) fetchData();
  }, [customerId]);

  const openPaymentModal = (view) => {
      setPaymentModalView(view);
      setIsPaymentModalOpen(true);
  };


  // --- ACTIONS ---

  // 1. Assign or Change Plan
  const handleAssignPlan = async (newPlanId) => {
    setActionLoading(true);
    try {
      if (subscription) {
        const { data, error } = await supabase.rpc('switch_plan', {
          sub_id: subscription.id,
          new_pkg_id: newPlanId
        });
        if (error) throw error;
        alert(data.message + (data.invoice_amount ? ` (Invoice: ₹${data.invoice_amount})` : ''));
      } else {
        const { error } = await supabase.rpc('assign_new_plan', {
            p_user_id: customerId,
            p_package_id: newPlanId
        });
        if (error) throw error;
      }
      await fetchData(); 
      setIsPlanModalOpen(false);
    } catch (error) {
      alert('Error updating plan: ' + error.message);
    }
    setActionLoading(false);
  };

  // 2. Remove Plan
  const handleRemovePlan = async () => {
    if (!subscription) return;
    if (!confirm("Are you sure you want to remove the plan? This will deactivate the customer and hide their add-ons.")) return;

    setActionLoading(true);
    try {
        const { error } = await supabase
            .from('subscriptions')
            .update({ status: 'cancelled', updated_at: new Date().toISOString() })
            .eq('id', subscription.id);

        if (error) throw error;
        await fetchData(); 
    } catch (error) {
        alert('Error removing plan: ' + error.message);
    }
    setActionLoading(false);
  };

  // 3. Toggle Channels
  const handleToggleChannel = async (channelId, isCurrentlyActive) => {
    if (!subscription) {
      alert("Please assign a base plan first.");
      return;
    }

    if (isCurrentlyActive) {
      await supabase.from('subscription_addons').delete().eq('subscription_id', subscription.id).eq('channel_id', channelId);
    } else {
      await supabase.from('subscription_addons').insert({ subscription_id: subscription.id, channel_id: channelId });
    }
    
    const { data: addonData } = await supabase.from('subscription_addons').select('*, channels(*)').eq('subscription_id', subscription.id);
    setAddons(addonData || []);
  };

  // 4. Generate Invoice
  const handleGenerateInvoice = async () => {
    if (!subscription) return;
    if (!confirm("Generate a new invoice for the current month?")) return;

    setActionLoading(true);
    const { data, error } = await supabase.rpc('generate_invoice', { sub_id: subscription.id });
    
    if (error) {
        alert('Error generating invoice: ' + error.message);
    } else {
        await fetchData(); 
        alert(`Invoice generated for ₹${data.amount}`);
    }
    setActionLoading(false);
  };

  // 5. Profile Editing
  const handleStartEdit = () => {
    setEditFormData({
      full_name: customer.full_name || '',
      mobile_number: customer.mobile_number || '',
      address: customer.address || '',
      vc_number: customer.vc_number || '',
      customer_id: customer.customer_id || ''
    });
    setIsEditing(true);
  };

  const handleSaveProfile = async () => {
    setActionLoading(true);
    try {
      const { error } = await supabase
        .from('users')
        .update({
          full_name: editFormData.full_name,
          mobile_number: editFormData.mobile_number,
          address: editFormData.address,
          vc_number: editFormData.vc_number,
          customer_id: editFormData.customer_id
        })
        .eq('id', customerId);

      if (error) throw error;
      setCustomer({ ...customer, ...editFormData });
      setIsEditing(false);
    } catch (error) {
      alert('Failed to update profile: ' + error.message);
    }
    setActionLoading(false);
  };

  // 6. Delete Customer
  const handleDeleteCustomer = async () => {
    if (!confirm('Are you sure you want to delete this customer? This action cannot be undone and will remove all billing history.')) return;
    setActionLoading(true);
    
    const { error } = await supabase.from('users').delete().eq('id', customerId);
    
    if (error) {
      alert('Error deleting customer: ' + error.message);
      setActionLoading(false);
    } else {
      router.push('/superadmin/customers'); 
    }
  };


  if (loading) return <div className="h-screen w-full flex items-center justify-center bg-gray-50 dark:bg-gray-900"><Loader2 className="animate-spin h-10 w-10 text-indigo-600"/></div>;
  if (!customer) return <div className="p-10 text-center text-gray-500">Customer not found</div>;

  // Calculate Total Bill for Display
  const totalMonthlyBill = (
    (subscription?.packages?.price || 0) + 
    addons.reduce((acc, curr) => acc + (curr.channels?.price || 0), 0)
  ).toFixed(2);

  const nextBillingDate = subscription?.next_billing_date 
    ? new Date(subscription.next_billing_date).toLocaleDateString() 
    : 'N/A';

  const customerStatus = subscription ? 'Active' : 'Inactive';
  const statusColor = subscription 
    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 border-green-200 dark:border-green-800' 
    : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 border-red-200 dark:border-red-800';


  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-gray-900/50 pb-40 lg:pb-20"> 
        
      {/* Sticky Top Bar for Mobile Navigation */}
      <div className="sticky top-0 z-30 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 p-4 flex items-center shadow-sm lg:hidden">
          <button onClick={() => router.back()} className="p-2 -ml-2 mr-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300 transition-colors">
            <ArrowLeft size={20}/>
          </button>
          <h1 className="text-lg font-bold text-gray-800 dark:text-white truncate flex-1">
            {customer.full_name}
          </h1>
      </div>
      
      {/* Desktop Back Button */}
      <div className="hidden lg:block pt-6 px-10">
         <button onClick={() => router.back()} className="flex items-center text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white transition-colors">
           <ArrowLeft size={20} className="mr-2"/> Back to List
         </button>
      </div>

      <div className="p-4 sm:p-6 md:p-10 max-w-7xl mx-auto space-y-6">
        
        {/* Profile Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-5 sm:p-8 relative border-t-4 border-indigo-500 overflow-hidden group">
          
          {/* Action Buttons (Top Right) */}
          <div className="absolute top-4 right-4 flex gap-2 z-10">
            {!isEditing ? (
              <button 
                onClick={handleStartEdit} 
                className="p-2 text-gray-500 hover:text-indigo-600 bg-gray-100 hover:bg-indigo-50 dark:bg-gray-700 dark:hover:bg-indigo-900/30 rounded-full transition-all shadow-sm"
                title="Edit Details"
              >
                <Edit size={18} />
              </button>
            ) : (
              <div className="flex gap-2 bg-white dark:bg-gray-800 p-1 rounded-full shadow-md border border-gray-100 dark:border-gray-700">
                <button 
                  onClick={() => setIsEditing(false)} 
                  className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-full transition-colors"
                  disabled={actionLoading}
                >
                  <X size={20} />
                </button>
                <button 
                  onClick={handleSaveProfile} 
                  className="p-2 text-green-500 hover:bg-green-50 dark:hover:bg-green-900/30 rounded-full transition-colors"
                  disabled={actionLoading}
                >
                  {actionLoading ? <Loader2 className="animate-spin" size={20}/> : <Save size={20} />}
                </button>
              </div>
            )}
          </div>

          {/* Profile Content */}
          <div className="flex flex-col md:flex-row gap-6 relative">
            {/* Avatar */}
            <div className="shrink-0 flex justify-center md:block">
                <div className="h-20 w-20 sm:h-24 sm:w-24 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900 dark:to-purple-900 flex items-center justify-center text-indigo-600 dark:text-indigo-300 text-3xl font-bold shadow-inner">
                    {customer.full_name?.charAt(0).toUpperCase() || 'U'}
                </div>
            </div>

            {/* Details Form/View */}
            <div className="w-full space-y-4">
              {isEditing ? (
                <div className="space-y-4 animate-in fade-in slide-in-from-left-2 duration-200">
                  {/* ... (Existing Edit Form Code) ... */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Full Name</label>
                    <input type="text" value={editFormData.full_name} onChange={(e) => setEditFormData({...editFormData, full_name: e.target.value})} className="w-full text-lg font-bold text-gray-800 dark:text-white bg-gray-50 dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"/>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Customer ID</label>
                      <input type="text" value={editFormData.customer_id} onChange={(e) => setEditFormData({...editFormData, customer_id: e.target.value})} className="w-full text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none"/>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Mobile</label>
                      <input type="text" value={editFormData.mobile_number} onChange={(e) => setEditFormData({...editFormData, mobile_number: e.target.value})} className="w-full text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none"/>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">VC Number</label>
                      <input type="text" value={editFormData.vc_number} onChange={(e) => setEditFormData({...editFormData, vc_number: e.target.value})} className="w-full text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none"/>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Address</label>
                      <input type="text" value={editFormData.address} onChange={(e) => setEditFormData({...editFormData, address: e.target.value})} className="w-full text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none"/>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center md:text-left space-y-3">
                  <div>
                      <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-white">{customer.full_name}</h1>
                      {customer.customer_id && (
                        <div className="inline-flex items-center gap-1.5 mt-1 px-2.5 py-0.5 bg-indigo-50 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 rounded-md text-sm font-medium">
                          <Tag size={14} /> <span>{customer.customer_id}</span>
                        </div>
                      )}
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-6 text-sm sm:text-base text-gray-600 dark:text-gray-300">
                    <div className="flex items-center justify-center md:justify-start gap-2">
                        <Hash size={18} className="text-gray-400"/> 
                        <span className="font-medium">VC:</span> {customer.vc_number || 'N/A'}
                    </div>
                    <div className="flex items-center justify-center md:justify-start gap-2">
                        <Phone size={18} className="text-gray-400"/> 
                        {customer.mobile_number}
                    </div>
                    <div className="flex items-center justify-center md:justify-start gap-2 sm:col-span-2">
                        <MapPin size={18} className="text-gray-400 shrink-0"/> 
                        <span className="truncate">{customer.address || 'No Address Provided'}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* DYNAMIC STATUS BADGE */}
          {!isEditing && (
              <div className="mt-4 md:mt-0 md:absolute md:bottom-8 md:right-8 text-center md:text-right">
                <span className={`inline-block px-4 py-1.5 rounded-full text-sm font-bold border ${statusColor}`}>
                    {customerStatus}
                </span>
              </div>
          )}
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* LEFT: Subscription & Channels */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Subscription Card */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md border border-gray-100 dark:border-gray-700 overflow-hidden">
              <div className="p-5 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50/50 dark:bg-gray-800">
                <h2 className="text-lg font-bold text-gray-800 dark:text-white flex items-center gap-2">
                  <Package size={20} className="text-indigo-500"/> Current Plan
                </h2>
                <div className="flex gap-2">
                    {/* NEW DELETE BUTTON FOR PLAN */}
                    {subscription && (
                        <button 
                            onClick={handleRemovePlan}
                            className="p-2 text-red-500 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/40 rounded-lg transition-all"
                            title="Remove Plan"
                        >
                            <Trash2 size={18} />
                        </button>
                    )}
                    <button 
                        onClick={() => setIsPlanModalOpen(true)}
                        className="text-sm px-4 py-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-all font-medium shadow-sm active:scale-95"
                    >
                        {subscription ? 'Change' : 'Assign'}
                    </button>
                </div>
              </div>
              <div className="p-5">
                {subscription ? (
                  <div>
                    <div className="flex justify-between items-start mb-3">
                      <div>
                          <h3 className="text-xl sm:text-2xl font-bold text-indigo-600 dark:text-indigo-400">{subscription.packages.name}</h3>
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 mt-1">
                             <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span> Active
                          </span>
                      </div>
                      <span className="text-xl font-mono font-bold text-gray-700 dark:text-gray-300">₹{subscription.packages.price}<span className="text-sm font-sans font-normal text-gray-400">/mo</span></span>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-900/50 p-3 rounded-lg border border-gray-100 dark:border-gray-700">{subscription.packages.description}</p>
                    <div className="mt-4 flex items-center text-sm text-gray-500">
                      <Clock size={16} className="mr-2"/> 
                      Next Billing: <span className="font-medium text-gray-700 dark:text-gray-300 ml-1">{nextBillingDate}</span>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-10 text-gray-400 flex flex-col items-center">
                    <Package size={48} className="mb-2 opacity-20"/>
                    <p>No active plan assigned.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Channels Card */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md border border-gray-100 dark:border-gray-700 overflow-hidden">
              <div className="p-5 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50/50 dark:bg-gray-800">
                <h2 className="text-lg font-bold text-gray-800 dark:text-white flex items-center gap-2">
                  <Tv size={20} className="text-indigo-500"/> Add-ons
                </h2>
                <button 
                  onClick={() => setIsChannelModalOpen(true)}
                  disabled={!subscription}
                  className="text-sm px-4 py-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-all font-medium shadow-sm active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Manage
                </button>
              </div>
              <div className="p-5">
                {addons.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {addons.map((addon) => (
                      <div key={addon.id} className="flex justify-between items-center p-3 bg-white dark:bg-gray-700/40 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm">
                        <div className="flex items-center gap-3 overflow-hidden">
                          <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center text-purple-600 dark:text-purple-300 font-bold text-xs shrink-0">
                            {addon.channels.name.substring(0,2).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-gray-800 dark:text-white truncate">{addon.channels.name}</p>
                            <p className="text-[10px] uppercase tracking-wide text-gray-500">{addon.channels.category}</p>
                          </div>
                        </div>
                        <span className="font-mono text-sm font-medium text-gray-600 dark:text-gray-300">₹{addon.channels.price}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500 text-sm">
                    {subscription ? 'No add-on channels active.' : 'Assign a plan to add channels.'}
                  </div>
                )}
              </div>
            </div>

          </div>

          {/* RIGHT: Billing (Desktop Only - Mobile has sticky footer) */}
          <div className="space-y-6 hidden lg:block"> 
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md border border-gray-100 dark:border-gray-700 overflow-hidden h-full flex flex-col">
              <div className="p-5 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50/50 dark:bg-gray-800">
                <h2 className="text-lg font-bold text-gray-800 dark:text-white flex items-center gap-2">
                  <CreditCard size={20} className="text-indigo-500"/> Billing
                </h2>
                <button onClick={() => openPaymentModal('list')} className="p-2 text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-colors" title="Payment History">
                    <History size={20} />
                </button>
              </div>
              <div className="p-5 flex-1 flex flex-col">
                
                {/* Blue Bordered Transparent Card (Desktop) */}
                <div className="mb-6 p-5 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl border border-indigo-100 dark:border-indigo-800 text-center">
                  <p className="text-sm text-gray-500 dark:text-indigo-300 mb-2 font-medium">Estimated Monthly Bill</p>
                  <p className="text-4xl font-bold text-indigo-700 dark:text-white">
                    ₹{totalMonthlyBill}
                  </p>
                  <button 
                    onClick={handleGenerateInvoice}
                    disabled={actionLoading || !subscription}
                    className="mt-5 w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold flex justify-center items-center gap-2 disabled:opacity-50 transition-all active:scale-95 shadow-md shadow-indigo-500/20"
                  >
                    {actionLoading ? <Loader2 className="animate-spin h-4 w-4"/> : <FileText size={16}/>}
                    Generate Invoice
                  </button>
                </div>

                {/* --- NEW SECTION: RECENT PAYMENTS --- */}
                <div className="mb-6">
                    <div className="flex justify-between items-center mb-3">
                        <h3 className="font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                            <Receipt size={16}/> Recent Payments
                        </h3>
                        <button 
                            onClick={() => openPaymentModal('add')}
                            className="text-xs px-2.5 py-1 bg-green-100 hover:bg-green-200 text-green-700 rounded-md font-bold transition-colors"
                        >
                            + Record Pay
                        </button>
                    </div>
                    <div className="space-y-2">
                        {recentPayments.length > 0 ? (
                            recentPayments.map(pay => (
                                <div key={pay.id} className="flex justify-between items-center p-2.5 bg-gray-50 dark:bg-gray-700/30 rounded-lg border border-gray-100 dark:border-gray-700">
                                    <div>
                                        <p className="font-bold text-gray-800 dark:text-white text-sm">₹{pay.amount}</p>
                                        <p className="text-[10px] text-gray-500 uppercase tracking-wide">{pay.method}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs font-medium text-gray-600 dark:text-gray-300">
                                            {pay.payment_date ? new Date(pay.payment_date).toLocaleDateString(undefined, { day: '2-digit', month: 'short' }) : 'Pending'}
                                        </p>
                                        <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase ${
                                            pay.status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                                        }`}>
                                            {pay.status}
                                        </span>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-xs text-gray-400 text-center py-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-dashed border-gray-200 dark:border-gray-700">
                                No recent payments.
                            </p>
                        )}
                        {recentPayments.length > 0 && (
                            <button onClick={() => openPaymentModal('list')} className="w-full text-center text-xs text-indigo-600 hover:underline mt-2">
                                View Full History
                            </button>
                        )}
                    </div>
                </div>


                {/* Invoice History */}
                <h3 className="font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2 pt-4 border-t border-gray-100 dark:border-gray-700">
                    <FileText size={16}/> Invoice History
                </h3>
                <div className="space-y-3 flex-1 overflow-y-auto max-h-[400px] custom-scrollbar pr-1">
                  {invoices.length > 0 ? (
                    invoices.map((inv) => (
                      <div key={inv.id} className="flex justify-between items-center p-3 border border-gray-100 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                        <div>
                          <p className="font-bold text-gray-800 dark:text-white">₹{inv.amount_due}</p>
                          <p className="text-xs text-gray-500">{new Date(inv.issued_date).toLocaleDateString()}</p>
                        </div>
                        <span className={`px-2.5 py-1 text-[10px] uppercase tracking-wider font-bold rounded-full ${
                          inv.status === 'paid' ? 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300' :
                          inv.status === 'overdue' ? 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300' :
                          'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300'
                        }`}>
                          {inv.status}
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-400 text-center py-8 italic">No invoice history.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          {/* Mobile Only Invoice History (Since Right Col is hidden on mobile) */}
          <div className="lg:hidden space-y-4 pb-8">
             <div className="flex items-center justify-between">
                 <h3 className="text-lg font-bold text-gray-800 dark:text-white flex items-center gap-2">
                    <CreditCard size={20} className="text-indigo-500"/> Invoice History
                 </h3>
                 <button onClick={() => openPaymentModal('list')} className="flex items-center gap-1 text-sm font-medium text-indigo-600">
                    <History size={16}/> Payment History
                 </button>
             </div>
             <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md border border-gray-100 dark:border-gray-700 p-4">
               <div className="space-y-3">
                  {invoices.length > 0 ? (
                    invoices.map((inv) => (
                      <div key={inv.id} className="flex justify-between items-center p-3 border border-gray-100 dark:border-gray-700 rounded-xl">
                        <div>
                          <p className="font-bold text-gray-800 dark:text-white">₹{inv.amount_due}</p>
                          <p className="text-xs text-gray-500">{new Date(inv.issued_date).toLocaleDateString()}</p>
                        </div>
                        <span className={`px-2.5 py-1 text-[10px] uppercase tracking-wider font-bold rounded-full ${
                          inv.status === 'paid' ? 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300' :
                          inv.status === 'overdue' ? 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300' :
                          'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300'
                        }`}>
                          {inv.status}
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-400 text-center py-4 italic">No invoice history.</p>
                  )}
                </div>
             </div>
          </div>

        </div>

        {/* Danger Zone */}
        <div className="mt-12 border-t border-gray-200 dark:border-gray-700 pt-8">
            <div className="bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 rounded-xl p-4 flex flex-col sm:flex-row justify-between items-center gap-4">
                <div>
                    <h3 className="text-red-800 dark:text-red-400 font-bold flex items-center gap-2">
                        <AlertTriangle size={20}/> Danger Zone
                    </h3>
                    <p className="text-sm text-red-600 dark:text-red-300 mt-1">
                        Deleting this customer will permanently remove all their data, including subscription history and invoices.
                    </p>
                </div>
                <button 
                    onClick={handleDeleteCustomer}
                    className="w-full sm:w-auto px-4 py-2.5 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors shadow-md active:scale-95 flex items-center justify-center gap-2 whitespace-nowrap"
                >
                    <Trash2 size={18} /> Delete Customer
                </button>
            </div>
        </div>

      </div>

      {/* Mobile Sticky Billing Footer (VISIBLE ON MOBILE ONLY) */}
      <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 p-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] lg:hidden z-20 safe-area-bottom">
        <div className="flex justify-between items-center mb-3">
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide font-medium">Total Monthly Bill</p>
            <p className="text-xl font-extrabold text-indigo-600 dark:text-indigo-400">₹{totalMonthlyBill}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide font-medium flex items-center justify-end gap-1">
                <CalendarIcon size={12}/> Next Recharge
            </p>
            <p className="text-sm font-bold text-gray-800 dark:text-white">{nextBillingDate}</p>
          </div>
        </div>
        <div className="flex gap-2">
            <button 
                onClick={() => openPaymentModal('add')}
                className="flex-1 py-3 bg-green-600 text-white rounded-xl font-semibold shadow-lg shadow-green-500/30 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            >
                <Plus size={18}/> Pay Bill
            </button>
            <button 
              onClick={handleGenerateInvoice}
              disabled={actionLoading || !subscription}
              className="px-4 py-3 bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300 rounded-xl font-semibold active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <FileText size={18}/>
            </button>
        </div>
      </div>

      {/* Modals */}
      <ChangePlanModal 
        isOpen={isPlanModalOpen} 
        onClose={() => setIsPlanModalOpen(false)} 
        plans={availablePlans}
        currentPlanId={subscription?.package_id}
        onAssignPlan={handleAssignPlan}
        loading={actionLoading}
      />

      <ManageChannelsModal 
        isOpen={isChannelModalOpen} 
        onClose={() => setIsChannelModalOpen(false)} 
        allChannels={availableChannels} 
        activeChannelIds={addons.map(a => a.channel_id)} 
        onToggleChannel={handleToggleChannel} 
      />

      <PaymentHistoryModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        initialView={paymentModalView}
        customerId={customerId}
        activeSubscription={subscription}
        activeAddons={addons}
        allPlans={availablePlans}
        allChannels={availableChannels}
        employees={employees}
      />

    </div>
  );
}