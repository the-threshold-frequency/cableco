'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  User, MapPin, Phone, Hash, CreditCard, Tv, 
  Package, Plus, Trash2, FileText, ArrowLeft, Loader2, Check,
  Edit, Save, X, Tag, AlertTriangle, Calendar, Clock, Search, Ban
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

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
  
  const [availablePlans, setAvailablePlans] = useState([]);
  const [availableChannels, setAvailableChannels] = useState([]);

  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
  const [isChannelModalOpen, setIsChannelModalOpen] = useState(false);

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

    // FETCH SUBSCRIPTION (Updated to handle potential multiple rows gracefully)
    const { data: subData, error: subError } = await supabase
      .from('subscriptions')
      .select('*, packages(*)')
      .eq('user_id', customerId)
      .eq('status', 'active')
      .order('created_at', { ascending: false }) // Get latest if duplicates exist
      .limit(1)
      .maybeSingle(); 
    
    if (subError) console.error('Fetch Subscription Error:', subError);
    setSubscription(subData);

    // Only fetch addons if we have an active subscription
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

    const { data: plans } = await supabase.from('packages').select('*').eq('is_active', true);
    setAvailablePlans(plans || []);
    
    const { data: channels } = await supabase.from('channels').select('*').eq('is_active', true);
    setAvailableChannels(channels || []);

    setLoading(false);
  };

  useEffect(() => {
    if (customerId) fetchData();
  }, [customerId]);


  // --- ACTIONS ---

  // 1. Assign or Change Plan
  const handleAssignPlan = async (newPlanId) => {
    setActionLoading(true);
    try {
      if (subscription) {
        // CASE A: Smart Switch (Pro-rata)
        const { data, error } = await supabase.rpc('switch_plan', {
          sub_id: subscription.id,
          new_pkg_id: newPlanId
        });
        if (error) throw error;
        alert(data.message + (data.invoice_amount ? ` (Invoice: ₹${data.invoice_amount})` : ''));
      } else {
        // CASE B: New Subscription (USING NEW SAFE RPC)
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

  // 2. Remove Plan (Deactivates Customer)
  const handleRemovePlan = async () => {
    if (!subscription) return;
    if (!confirm("Are you sure you want to remove the plan? This will deactivate the customer and hide their add-ons.")) return;

    setActionLoading(true);
    try {
        // Setting status to 'cancelled' removes it from active view
        // Add-ons are linked to this subscription ID so they effectively disappear from active view too
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

  // DYNAMIC STATUS: Determined by presence of active subscription
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
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Full Name</label>
                    <input 
                      type="text" 
                      value={editFormData.full_name}
                      onChange={(e) => setEditFormData({...editFormData, full_name: e.target.value})}
                      className="w-full text-lg font-bold text-gray-800 dark:text-white bg-gray-50 dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                     <div>
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Customer ID</label>
                      <input 
                        type="text" 
                        value={editFormData.customer_id}
                        onChange={(e) => setEditFormData({...editFormData, customer_id: e.target.value})}
                        className="w-full text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Mobile</label>
                      <input 
                        type="text" 
                        value={editFormData.mobile_number}
                        onChange={(e) => setEditFormData({...editFormData, mobile_number: e.target.value})}
                        className="w-full text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">VC Number</label>
                      <input 
                        type="text" 
                        value={editFormData.vc_number}
                        onChange={(e) => setEditFormData({...editFormData, vc_number: e.target.value})}
                        className="w-full text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Address</label>
                      <input 
                        type="text" 
                        value={editFormData.address}
                        onChange={(e) => setEditFormData({...editFormData, address: e.target.value})}
                        className="w-full text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none"
                      />
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

                {/* Invoice History */}
                <h3 className="font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
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
             <h3 className="text-lg font-bold text-gray-800 dark:text-white flex items-center gap-2">
                <CreditCard size={20} className="text-indigo-500"/> Invoice History
             </h3>
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
                <Calendar size={12}/> Next Recharge
            </p>
            <p className="text-sm font-bold text-gray-800 dark:text-white">{nextBillingDate}</p>
          </div>
        </div>
        <button 
          onClick={handleGenerateInvoice}
          disabled={actionLoading || !subscription}
          className="w-full py-3 bg-indigo-600 text-white rounded-xl font-semibold shadow-lg shadow-indigo-500/30 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:shadow-none"
        >
          {actionLoading ? <Loader2 className="animate-spin h-5 w-5"/> : <FileText size={18}/>}
          Generate Invoice
        </button>
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

    </div>
  );
}