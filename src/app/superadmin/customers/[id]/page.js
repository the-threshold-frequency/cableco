'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  User, MapPin, Phone, Hash, CreditCard, Tv, 
  Package, Plus, Trash2, FileText, ArrowLeft, Loader2, Check,
  Edit, Save, X
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
    <div className="fixed inset-0 bg-black/50 z-50 flex justify-center items-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md p-6">
        <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4">Assign Base Plan</h3>
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {plans.map((plan) => (
            <div 
              key={plan.id}
              onClick={() => setSelectedPlanId(plan.id)}
              className={`p-4 border rounded-lg cursor-pointer transition-all ${
                selectedPlanId === plan.id 
                  ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 ring-1 ring-indigo-500' 
                  : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-750'
              }`}
            >
              <div className="flex justify-between items-center">
                <span className="font-semibold text-gray-800 dark:text-white">{plan.name}</span>
                <span className="font-mono text-gray-600 dark:text-gray-300">₹{plan.price}</span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{plan.description}</p>
            </div>
          ))}
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md">Cancel</button>
          <button 
            onClick={() => onAssignPlan(selectedPlanId)}
            disabled={loading || !selectedPlanId}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
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
    <div className="fixed inset-0 bg-black/50 z-50 flex justify-center items-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-lg p-6 h-[80vh] flex flex-col">
        <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4">Manage Add-on Channels</h3>
        
        <input 
          type="text" 
          placeholder="Search channels..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full p-2 mb-4 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
        />

        <div className="flex-1 overflow-y-auto space-y-2 pr-2">
          {filteredChannels.map((channel) => {
            const isActive = activeChannelIds.includes(channel.id);
            return (
              <div 
                key={channel.id}
                onClick={() => onToggleChannel(channel.id, isActive)}
                className={`flex justify-between items-center p-3 rounded-lg cursor-pointer border transition-colors ${
                  isActive 
                    ? 'border-green-500 bg-green-50 dark:bg-green-900/20' 
                    : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50'
                }`}
              >
                <div>
                  <p className="font-medium text-gray-800 dark:text-white">{channel.name}</p>
                  <span className="text-xs px-2 py-0.5 bg-gray-200 dark:bg-gray-700 rounded-full text-gray-600 dark:text-gray-300">
                    {channel.category}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-mono text-sm text-gray-600 dark:text-gray-400">₹{channel.price}</span>
                  <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                    isActive ? 'bg-green-500 border-green-500' : 'border-gray-400'
                  }`}>
                    {isActive && <Check size={12} className="text-white" />}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 flex justify-end">
          <button onClick={onClose} className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">Done</button>
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
  
  // Available Options for Modals
  const [availablePlans, setAvailablePlans] = useState([]);
  const [availableChannels, setAvailableChannels] = useState([]);

  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  
  // Modal States
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
  const [isChannelModalOpen, setIsChannelModalOpen] = useState(false);

  // Edit Mode State
  const [isEditing, setIsEditing] = useState(false);
  const [editFormData, setEditFormData] = useState({
    full_name: '',
    mobile_number: '',
    address: '',
    vc_number: ''
  });

  // --- DATA FETCHING ---
  const fetchData = async () => {
    if (!customer) setLoading(true);
    
    // 1. Fetch Customer Profile
    const { data: userData } = await supabase.from('users').select('*').eq('id', customerId).single();
    setCustomer(userData);

    // 2. Fetch Active Subscription
    const { data: subData } = await supabase
      .from('subscriptions')
      .select('*, packages(*)')
      .eq('user_id', customerId)
      .eq('status', 'active')
      .maybeSingle(); 
    
    setSubscription(subData);

    // 3. Fetch Add-ons
    if (subData) {
      const { data: addonData } = await supabase
        .from('subscription_addons')
        .select('*, channels(*)')
        .eq('subscription_id', subData.id);
      setAddons(addonData || []);
    } else {
        setAddons([]);
    }

    // 4. Fetch Invoices
    const { data: invoiceData } = await supabase
      .from('invoices')
      .select('*')
      .eq('user_id', customerId)
      .order('issued_date', { ascending: false });
    setInvoices(invoiceData || []);

    // 5. Fetch Metadata
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

  // 1. Assign or Change Plan (Updated for Pro-Rata)
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

        // Show result message
        alert(data.message + (data.invoice_amount ? ` (Invoice: ₹${data.invoice_amount})` : ''));

      } else {
        // CASE B: New Subscription
        const { error } = await supabase.from('subscriptions').insert({
          user_id: customerId,
          package_id: newPlanId,
          status: 'active',
          next_billing_date: new Date(new Date().setDate(new Date().getDate() + 30)).toISOString()
        });
        if (error) throw error;
      }
      
      await fetchData(); 
      setIsPlanModalOpen(false);
    } catch (error) {
      alert('Error updating plan: ' + error.message);
      console.error(error);
    }
    setActionLoading(false);
  };

  // 2. Toggle Channel
  const handleToggleChannel = async (channelId, isCurrentlyActive) => {
    if (!subscription) {
      alert("Please assign a base plan first.");
      return;
    }

    if (isCurrentlyActive) {
      await supabase
        .from('subscription_addons')
        .delete()
        .eq('subscription_id', subscription.id)
        .eq('channel_id', channelId);
    } else {
      await supabase
        .from('subscription_addons')
        .insert({
          subscription_id: subscription.id,
          channel_id: channelId
        });
    }
    
    const { data: addonData } = await supabase
        .from('subscription_addons')
        .select('*, channels(*)')
        .eq('subscription_id', subscription.id);
    setAddons(addonData || []);
  };

  // 3. Generate Invoice
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

  // 4. Update Profile
  const handleStartEdit = () => {
    setEditFormData({
      full_name: customer.full_name || '',
      mobile_number: customer.mobile_number || '',
      address: customer.address || '',
      vc_number: customer.vc_number || ''
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
          vc_number: editFormData.vc_number
        })
        .eq('id', customerId);

      if (error) throw error;

      setCustomer({ ...customer, ...editFormData });
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile: ' + error.message);
    }
    setActionLoading(false);
  };


  if (loading) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin h-8 w-8 text-indigo-600"/></div>;
  if (!customer) return <div className="p-10 text-center">Customer not found</div>;

  return (
    <div className="p-4 sm:p-6 md:p-10 max-w-7xl mx-auto space-y-6">
      
      <button onClick={() => router.back()} className="flex items-center text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white transition-colors">
        <ArrowLeft size={20} className="mr-2"/> Back to List
      </button>

      {/* Header Profile Card - Editable */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 relative border-l-4 border-indigo-500">
        
        {/* Edit Controls (Top Right) */}
        {!isEditing ? (
          <button 
            onClick={handleStartEdit} 
            className="absolute top-6 right-6 p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-full transition-all"
            title="Edit Details"
          >
            <Edit size={20} />
          </button>
        ) : (
          <div className="absolute top-6 right-6 flex gap-2">
            <button 
              onClick={() => setIsEditing(false)} 
              className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-full transition-colors"
              disabled={actionLoading}
            >
              <X size={24} />
            </button>
            <button 
              onClick={handleSaveProfile} 
              className="p-2 text-green-500 hover:bg-green-50 dark:hover:bg-green-900/30 rounded-full transition-colors"
              disabled={actionLoading}
            >
              {actionLoading ? <Loader2 className="animate-spin" size={24}/> : <Save size={24} />}
            </button>
          </div>
        )}

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pr-16">
          <div className="w-full max-w-3xl">
            {isEditing ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Full Name</label>
                  <input 
                    type="text" 
                    value={editFormData.full_name}
                    onChange={(e) => setEditFormData({...editFormData, full_name: e.target.value})}
                    className="w-full text-2xl font-bold text-gray-800 dark:text-white bg-gray-50 dark:bg-gray-700/50 border-b-2 border-indigo-500 focus:outline-none rounded px-2 py-1"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">VC Number</label>
                    <input 
                      type="text" 
                      value={editFormData.vc_number}
                      onChange={(e) => setEditFormData({...editFormData, vc_number: e.target.value})}
                      className="w-full text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-700/50 border-b border-gray-300 focus:border-indigo-500 focus:outline-none rounded px-2 py-1"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Mobile</label>
                    <input 
                      type="text" 
                      value={editFormData.mobile_number}
                      onChange={(e) => setEditFormData({...editFormData, mobile_number: e.target.value})}
                      className="w-full text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-700/50 border-b border-gray-300 focus:border-indigo-500 focus:outline-none rounded px-2 py-1"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Address</label>
                    <input 
                      type="text" 
                      value={editFormData.address}
                      onChange={(e) => setEditFormData({...editFormData, address: e.target.value})}
                      className="w-full text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-700/50 border-b border-gray-300 focus:border-indigo-500 focus:outline-none rounded px-2 py-1"
                    />
                  </div>
                </div>
              </div>
            ) : (
              <>
                <h1 className="text-3xl font-bold text-gray-800 dark:text-white">{customer.full_name}</h1>
                <div className="flex flex-wrap gap-6 mt-3 text-gray-600 dark:text-gray-300">
                  <span className="flex items-center gap-2"><Hash size={18} className="text-indigo-500"/> <span className="font-medium">VC:</span> {customer.vc_number || 'N/A'}</span>
                  <span className="flex items-center gap-2"><Phone size={18} className="text-indigo-500"/> {customer.mobile_number}</span>
                  <span className="flex items-center gap-2"><MapPin size={18} className="text-indigo-500"/> {customer.address || 'No Address'}</span>
                </div>
              </>
            )}
          </div>
          
          {!isEditing && (
            <div className="flex gap-3 mt-4 md:mt-0">
              <span className="px-3 py-1 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 rounded-full text-sm font-medium border border-green-200 dark:border-green-800">
                Active
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* LEFT COLUMN: Subscription & Channels */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Subscription Card */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-700/50">
              <h2 className="text-lg font-semibold text-gray-800 dark:text-white flex items-center gap-2">
                <Package size={20} className="text-indigo-500"/> Current Plan
              </h2>
              <button 
                onClick={() => setIsPlanModalOpen(true)}
                className="text-sm px-3 py-1.5 bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-md hover:bg-gray-50 dark:hover:bg-gray-500 transition-colors"
              >
                {subscription ? 'Change Plan' : 'Assign Plan'}
              </button>
            </div>
            <div className="p-6">
              {subscription ? (
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{subscription.packages.name}</h3>
                    <span className="text-xl font-mono font-semibold text-gray-700 dark:text-gray-300">₹{subscription.packages.price}/mo</span>
                  </div>
                  <p className="text-gray-500 dark:text-gray-400">{subscription.packages.description}</p>
                  <div className="mt-4 text-sm text-gray-400">
                    Next Billing: {new Date(subscription.next_billing_date).toLocaleDateString()}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No active plan assigned.
                </div>
              )}
            </div>
          </div>

          {/* Channels Card */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-700/50">
              <h2 className="text-lg font-semibold text-gray-800 dark:text-white flex items-center gap-2">
                <Tv size={20} className="text-indigo-500"/> A La Carte Channels
              </h2>
              <button 
                onClick={() => setIsChannelModalOpen(true)}
                disabled={!subscription}
                className="text-sm px-3 py-1.5 bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-md hover:bg-gray-50 dark:hover:bg-gray-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Manage Channels
              </button>
            </div>
            <div className="p-6">
              {addons.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {addons.map((addon) => (
                    <div key={addon.id} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg border border-gray-100 dark:border-gray-700">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center text-indigo-600 dark:text-indigo-300 font-bold text-xs">
                          {addon.channels.name.substring(0,2).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-gray-800 dark:text-white">{addon.channels.name}</p>
                          <p className="text-xs text-gray-500">{addon.channels.category}</p>
                        </div>
                      </div>
                      <span className="font-mono text-sm text-gray-600 dark:text-gray-300">₹{addon.channels.price}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No add-on channels active.
                </div>
              )}
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: Billing */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden h-full">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-700/50">
              <h2 className="text-lg font-semibold text-gray-800 dark:text-white flex items-center gap-2">
                <CreditCard size={20} className="text-indigo-500"/> Billing
              </h2>
            </div>
            <div className="p-6">
              {/* Summary Stats */}
              <div className="mb-6 p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg border border-indigo-100 dark:border-indigo-800">
                <p className="text-sm text-gray-500 dark:text-indigo-300 mb-1">Estimated Monthly Bill</p>
                <p className="text-3xl font-bold text-indigo-700 dark:text-white">
                  ₹{(
                    (subscription?.packages?.price || 0) + 
                    addons.reduce((acc, curr) => acc + (curr.channels?.price || 0), 0)
                  ).toFixed(2)}
                </p>
                <button 
                  onClick={handleGenerateInvoice}
                  disabled={actionLoading || !subscription}
                  className="mt-4 w-full py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 text-sm font-medium flex justify-center items-center gap-2 disabled:opacity-50"
                >
                  {actionLoading ? <Loader2 className="animate-spin h-4 w-4"/> : <FileText size={16}/>}
                  Generate Invoice Now
                </button>
              </div>

              {/* Invoice History */}
              <h3 className="font-medium text-gray-700 dark:text-gray-300 mb-3">Recent Invoices</h3>
              <div className="space-y-3">
                {invoices.length > 0 ? (
                  invoices.map((inv) => (
                    <div key={inv.id} className="flex justify-between items-center p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                      <div>
                        <p className="font-medium text-gray-800 dark:text-white">₹{inv.amount_due}</p>
                        <p className="text-xs text-gray-500">{new Date(inv.issued_date).toLocaleDateString()}</p>
                      </div>
                      <span className={`px-2 py-1 text-xs rounded-full capitalize ${
                        inv.status === 'paid' ? 'bg-green-100 text-green-800' :
                        inv.status === 'overdue' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {inv.status}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500 text-center py-4">No invoices found.</p>
                )}
              </div>
            </div>
          </div>
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

    </div>
  );
}