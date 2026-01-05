'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { 
  Plus, Search, X, User, Phone, Edit, Trash2, 
  Loader2, Users, ShieldCheck, Save, Calendar, TrendingUp, History
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { createEmployeeAction } from '@/app/actions/createEmployee';
import { updateEmployeeAction } from '@/app/actions/updateEmployee';

// --- MODAL: EMPLOYEE HISTORY & STATS ---
const EmployeeHistoryModal = ({ isOpen, onClose, employee }) => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({ today: 0, month: 0 });
  const supabase = createClient();

  const fetchHistory = useCallback(async () => {
    if (!employee) return;
    setLoading(true);
    
    // 1. Fetch recent payments
    const { data: payments, error } = await supabase
      .from('payments')
      .select(`
        id, amount, payment_date, method, status,
        customer:users!payments_user_id_fkey ( full_name, vc_number )
      `)
      .eq('collected_by', employee.id)
      .eq('status', 'paid')
      .order('payment_date', { ascending: false })
      .limit(50);

    if (error) console.error('History fetch error:', error);
    
    // 2. Calculate Stats
    const todayStr = new Date().toISOString().split('T')[0];
    const monthStr = new Date().toISOString().slice(0, 7); 

    let todayTotal = 0;
    let monthTotal = 0;

    // Fetch aggregates for accurate totals
    const { data: allPayments } = await supabase
        .from('payments')
        .select('amount, payment_date')
        .eq('collected_by', employee.id)
        .eq('status', 'paid')
        .gte('payment_date', `${monthStr}-01`); 

    if (allPayments) {
        allPayments.forEach(p => {
            const pDate = p.payment_date.split('T')[0];
            if (pDate === todayStr) todayTotal += p.amount;
            monthTotal += p.amount;
        });
    }

    setStats({ today: todayTotal, month: monthTotal });
    setHistory(payments || []);
    setLoading(false);
  }, [employee, supabase]);

  useEffect(() => {
    if (isOpen && employee) {
      fetchHistory();
    }
  }, [isOpen, employee, fetchHistory]);

  if (!isOpen || !employee) return null;

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex justify-end transition-all">
      <div className="bg-white dark:bg-gray-800 w-full max-w-md h-full shadow-2xl animate-in slide-in-from-right duration-300 flex flex-col">
        <div className="p-6 border-b dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 flex justify-between items-center">
          <div>
            <h3 className="text-xl font-bold text-gray-800 dark:text-white">{employee.full_name}</h3>
            <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                <Phone size={12}/> {employee.mobile_number}
            </p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors text-gray-500">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 grid grid-cols-2 gap-4 bg-white dark:bg-gray-800">
            <div className="p-4 rounded-2xl bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-800">
                <p className="text-xs font-bold text-green-600 dark:text-green-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                    <Calendar size={12}/> Today
                </p>
                <p className="text-2xl font-bold text-green-700 dark:text-green-300">₹{stats.today.toLocaleString()}</p>
            </div>
            <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800">
                <p className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                    <TrendingUp size={12}/> This Month
                </p>
                <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">₹{stats.month.toLocaleString()}</p>
            </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 pt-0 custom-scrollbar">
            <h4 className="font-bold text-gray-700 dark:text-gray-300 mb-4 flex items-center gap-2">
                <History size={16}/> Recent Collections
            </h4>
            
            {loading ? (
                <div className="flex justify-center py-10"><Loader2 className="animate-spin text-indigo-600"/></div>
            ) : history.length === 0 ? (
                <p className="text-center text-gray-400 py-10 text-sm">No recent collections found.</p>
            ) : (
                <div className="space-y-3">
                    {history.map(pay => (
                        <div key={pay.id} className="flex justify-between items-center p-3 border border-gray-100 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                            <div>
                                <p className="font-bold text-gray-800 dark:text-white text-sm">{pay.customer?.full_name || 'Unknown'}</p>
                                <p className="text-xs text-gray-500 flex gap-2 mt-0.5">
                                    <span>{new Date(pay.payment_date).toLocaleDateString()}</span>
                                    <span className="capitalize px-1.5 py-0 bg-gray-100 dark:bg-gray-700 rounded text-[10px]">{pay.method}</span>
                                </p>
                            </div>
                            <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">₹{pay.amount}</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

// --- MODAL: ADD EMPLOYEE ---
const AddEmployeeModal = ({ isOpen, onClose, onAddEmployee }) => {
  const [fullName, setFullName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const password = `cableco${mobileNumber}`; 

    const result = await onAddEmployee({ 
        email: null, 
        password, 
        full_name: fullName, 
        mobile_number: mobileNumber 
    });
    
    setIsLoading(false);
    if (result.success) {
      onClose();
      setFullName('');
      setMobileNumber('');
    } else {
        alert(result.message);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex justify-center items-center p-4 backdrop-blur-sm transition-all">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200 border border-white/10">
        <div className="p-6 border-b dark:border-gray-700 flex justify-between items-center bg-gray-50/80 dark:bg-gray-900/50">
          <div>
            <h3 className="text-xl font-bold text-gray-800 dark:text-white">New Staff Member</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Create account for collection agent</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors text-gray-500">
            <X size={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 ml-1">Full Name</label>
            <div className="relative group">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors"/>
              <input 
                type="text" 
                placeholder="e.g. Rahul Kumar" 
                value={fullName} 
                onChange={(e) => setFullName(e.target.value)} 
                required 
                className="pl-10 w-full p-3 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all" 
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 ml-1">Mobile Number</label>
            <div className="relative group">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors"/>
              <input 
                type="tel" 
                placeholder="e.g. 9876543210" 
                value={mobileNumber} 
                onChange={(e) => setMobileNumber(e.target.value)} 
                required 
                pattern="[0-9]{10}"
                className="pl-10 w-full p-3 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none font-mono tracking-wide" 
              />
            </div>
            <div className="mt-2 p-2 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg border border-indigo-100 dark:border-indigo-800/30 flex gap-2">
                <ShieldCheck size={14} className="text-indigo-600 shrink-0 mt-0.5"/>
                <p className="text-[10px] text-indigo-700 dark:text-indigo-300 leading-tight">
                  Auto-generated credentials:<br/>
                  Login: <strong>{mobileNumber}</strong> (Phone)<br/>
                  Pass: <strong>cableco{mobileNumber || '...'}</strong>
                </p>
            </div>
          </div>
          
          <button type="submit" className="w-full py-3.5 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 active:scale-[0.98] transition-all shadow-lg shadow-indigo-500/20 flex justify-center items-center gap-2" disabled={isLoading}>
            {isLoading ? <Loader2 className="animate-spin h-5 w-5"/> : <Plus size={20}/>}
            Create Account
          </button>
        </form>
      </div>
    </div>
  );
};

// --- MODAL: EDIT EMPLOYEE ---
const EditEmployeeModal = ({ isOpen, onClose, employee, onUpdateEmployee }) => {
  const [fullName, setFullName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (employee) {
        setFullName(employee.full_name || '');
        setMobileNumber(employee.mobile_number || '');
    }
  }, [employee]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const result = await onUpdateEmployee({ 
        id: employee.id,
        full_name: fullName, 
        mobile_number: mobileNumber 
    });
    
    setIsLoading(false);
    if (result.success) {
      onClose();
    } else {
        alert(result.message);
    }
  };

  if (!isOpen || !employee) return null;

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex justify-center items-center p-4 backdrop-blur-sm transition-all">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200 border border-white/10">
        <div className="p-6 border-b dark:border-gray-700 flex justify-between items-center bg-gray-50/80 dark:bg-gray-900/50">
          <div>
            <h3 className="text-xl font-bold text-gray-800 dark:text-white">Edit Staff Details</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Update information for {employee.full_name}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors text-gray-500">
            <X size={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 ml-1">Full Name</label>
            <div className="relative group">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors"/>
              <input 
                type="text" 
                value={fullName} 
                onChange={(e) => setFullName(e.target.value)} 
                required 
                className="pl-10 w-full p-3 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all" 
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 ml-1">Mobile Number</label>
            <div className="relative group">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors"/>
              <input 
                type="tel" 
                value={mobileNumber} 
                onChange={(e) => setMobileNumber(e.target.value)} 
                required 
                pattern="[0-9]{10}"
                className="pl-10 w-full p-3 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none font-mono tracking-wide" 
              />
            </div>
            {/* FIXED: Unescaped entity fixed here */}
            <p className="text-[10px] text-orange-500 mt-2 ml-1">
              * Changing this will change the user&apos;s login phone number.
            </p>
          </div>
          
          <button type="submit" className="w-full py-3.5 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 active:scale-[0.98] transition-all shadow-lg shadow-indigo-500/20 flex justify-center items-center gap-2" disabled={isLoading}>
            {isLoading ? <Loader2 className="animate-spin h-5 w-5"/> : <Save size={20}/>}
            Save Changes
          </button>
        </form>
      </div>
    </div>
  );
};


// --- MAIN PAGE COMPONENT ---
export default function ManageEmployeesPage() {
  const supabase = createClient();
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  const fetchEmployeesData = useCallback(async () => {
    setLoading(true);
    
    const { data: empData, error: empError } = await supabase
      .from('users')
      .select('*')
      .eq('role', 'employee');

    if (empError) {
        console.error('Error fetching employees:', empError);
        setLoading(false);
        return;
    }

    const { data: custData } = await supabase
        .from('users')
        .select('id, assigned_to')
        .eq('role', 'customer');

    const { data: invData } = await supabase
        .from('invoices')
        .select('user_id, amount_due, amount_paid, status')
        .neq('status', 'paid'); 

    const { data: payData } = await supabase
        .from('payments')
        .select('amount, collected_by, status')
        .eq('status', 'paid'); 

    const processedEmployees = empData.map(emp => {
        const myCustomers = custData?.filter(c => c.assigned_to === emp.id) || [];
        const myCustomerIds = myCustomers.map(c => c.id);

        const pendingAmount = invData
            ?.filter(inv => myCustomerIds.includes(inv.user_id))
            .reduce((sum, inv) => sum + (inv.amount_due - (inv.amount_paid || 0)), 0) || 0;

        const collectedAmount = payData
            ?.filter(pay => pay.collected_by === emp.id)
            .reduce((sum, pay) => sum + (pay.amount || 0), 0) || 0;

        return {
            ...emp,
            stats: {
                totalCustomers: myCustomers.length,
                pendingAmount: pendingAmount,
                collectedAmount: collectedAmount
            }
        };
    });

    setEmployees(processedEmployees);
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    fetchEmployeesData();
  }, [fetchEmployeesData]);

  const handleAddEmployee = async (employeeData) => {
    const result = await createEmployeeAction(employeeData);
    if (result.success) {
        setTimeout(() => fetchEmployeesData(), 1000);
    }
    return result;
  };

  const handleUpdateEmployee = async (employeeData) => {
    const result = await updateEmployeeAction(employeeData);
    if (result.success) {
        setTimeout(() => fetchEmployeesData(), 1000);
    }
    return result;
  };

  const openEditModal = (employee) => {
      setSelectedEmployee(employee);
      setIsEditModalOpen(true);
  };

  const openHistoryModal = (employee) => {
      setSelectedEmployee(employee);
      setIsHistoryModalOpen(true);
  };
  
  const handleDeleteEmployee = async (employeeId) => {
    if (window.confirm('Are you sure? This will remove the employee profile.')) {
        const { error } = await supabase.from('users').delete().eq('id', employeeId);
        if (error) alert('Failed to delete: ' + error.message);
        else fetchEmployeesData();
    }
  };

  const filteredEmployees = employees.filter(emp =>
    emp.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.mobile_number?.includes(searchTerm)
  );

  return (
    <>
      <AddEmployeeModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
        onAddEmployee={handleAddEmployee}
      />

      <EditEmployeeModal 
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)} 
        employee={selectedEmployee}
        onUpdateEmployee={handleUpdateEmployee}
      />

      <EmployeeHistoryModal
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
        employee={selectedEmployee}
      />

      <div className="p-4 sm:p-6 md:p-10 max-w-7xl mx-auto min-h-screen">
        
        <div className="flex flex-col sm:flex-row justify-between sm:items-end gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white tracking-tight">Staff & Agents</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1 font-medium">Monitor performance and manage field agents.</p>
          </div>
          <button 
            onClick={() => setIsAddModalOpen(true)} 
            className="flex items-center justify-center gap-2 px-5 py-3 bg-indigo-600 text-white font-semibold rounded-xl shadow-lg shadow-indigo-500/30 hover:bg-indigo-700 hover:scale-105 transition-all active:scale-95"
          >
            <Plus size={20} />
            <span>Add Staff</span>
          </button>
        </div>

        <div className="mb-6 relative max-w-md group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
            <input
              type="text"
              placeholder="Search by name or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all shadow-sm group-hover:shadow-md"
            />
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-gray-50/50 dark:bg-gray-900/50 border-b border-gray-100 dark:border-gray-700">
                <tr>
                  <th className="p-5 font-bold text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider">Staff Details</th>
                  <th className="p-5 font-bold text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider text-center">Assigned</th>
                  <th className="p-5 font-bold text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider text-right">Pending (Due)</th>
                  <th className="p-5 font-bold text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider text-right">Total Collected</th>
                  <th className="p-5 font-bold text-gray-500 dark:text-gray-400 text-right w-32">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700/50">
                {loading ? (
                  <tr><td colSpan="5" className="p-12 text-center text-gray-500"><Loader2 className="animate-spin mx-auto mb-3 h-8 w-8 text-indigo-500"/>Loading staff metrics...</td></tr>
                ) : filteredEmployees.length === 0 ? (
                  <tr><td colSpan="5" className="p-12 text-center text-gray-500 font-medium bg-gray-50/30">No staff members found.</td></tr>
                ) : (
                  filteredEmployees.map((employee) => (
                    <tr 
                      key={employee.id} 
                      onClick={() => openHistoryModal(employee)} 
                      className="group hover:bg-indigo-50/30 dark:hover:bg-indigo-900/10 transition-colors duration-200 cursor-pointer"
                    >
                      <td className="p-5">
                        <div className="flex items-center gap-4">
                            <div className="h-11 w-11 rounded-full bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/50 dark:to-purple-900/50 border border-indigo-100 dark:border-indigo-800 flex items-center justify-center text-indigo-600 dark:text-indigo-300 font-bold shadow-sm group-hover:scale-110 transition-transform">
                                {employee.full_name?.charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <p className="font-bold text-gray-900 dark:text-white group-hover:text-indigo-600 transition-colors">{employee.full_name}</p>
                                <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1.5 mt-0.5">
                                    <Phone size={12} className="text-gray-400"/> 
                                    <span className="font-mono tracking-wide">{employee.mobile_number || 'N/A'}</span>
                                </p>
                            </div>
                        </div>
                      </td>
                      <td className="p-5 text-center">
                         <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-600">
                            <Users size={12} className="mr-1.5 opacity-70"/> {employee.stats.totalCustomers}
                         </span>
                      </td>
                      <td className="p-5 text-right">
                         <div className="flex flex-col items-end">
                             <span className={`font-mono font-bold text-sm ${employee.stats.pendingAmount > 0 ? 'text-orange-600 dark:text-orange-400' : 'text-gray-400'}`}>
                                ₹{employee.stats.pendingAmount.toLocaleString()}
                             </span>
                             {employee.stats.pendingAmount > 0 && <span className="text-[10px] text-orange-400 uppercase font-bold tracking-wide">Due</span>}
                         </div>
                      </td>
                      <td className="p-5 text-right">
                         <div className="flex items-center justify-end gap-2">
                             <span className="font-mono font-bold text-sm text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-2.5 py-1 rounded-md border border-green-100 dark:border-green-800">
                                ₹{employee.stats.collectedAmount.toLocaleString()}
                             </span>
                         </div>
                      </td>
                      <td className="p-5" onClick={(e) => e.stopPropagation()}>
                        <div className="flex justify-end gap-2 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-all duration-200 translate-x-2 group-hover:translate-x-0">
                            <button 
                                onClick={() => openEditModal(employee)}
                                className="p-2 rounded-lg bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-indigo-600 hover:bg-indigo-50 hover:border-indigo-200 dark:hover:bg-indigo-900/30 transition-all shadow-sm hover:shadow-md tooltip-trigger"
                                title="Edit Details"
                            >
                                <Edit size={16} />
                            </button>
                            <button 
                                onClick={() => handleDeleteEmployee(employee.id)}
                                className="p-2 rounded-lg bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-red-500 hover:bg-red-50 hover:border-red-200 dark:hover:bg-red-900/30 transition-all shadow-sm hover:shadow-md"
                                title="Delete Staff"
                            >
                                <Trash2 size={16} />
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