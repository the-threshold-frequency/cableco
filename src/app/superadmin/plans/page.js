'use client';

import React, { useState, useEffect, Fragment } from 'react';
import { 
  Plus, MoreVertical, Search, X, Package, DollarSign, 
  Edit, Trash2, ChevronDown, ChevronUp, Check, Tv, Loader2, 
  List, Type, AlertTriangle, ArrowRight 
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

// --- MODAL: RESOLVE MISSING CHANNELS ---
const ResolveChannelsModal = ({ isOpen, onClose, missingChannels, onResolve, allChannels }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    if (isOpen && missingChannels.length > 0) {
      setItems(missingChannels.map(c => ({ 
        name: c.name, 
        price: 0, 
        status: 'new', 
        matchId: null 
      })));
    }
  }, [isOpen, missingChannels]);

  const handleChange = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] = value;
    
    if (field === 'name') {
      const match = allChannels.find(c => c.name.toLowerCase() === value.toLowerCase().trim());
      if (match) {
        newItems[index].status = 'match';
        newItems[index].matchId = match.id;
        newItems[index].price = match.price; 
      } else {
        newItems[index].status = 'new';
        newItems[index].matchId = null;
      }
    }
    setItems(newItems);
  };

  const handleDiscard = (index) => {
    const newItems = [...items];
    newItems.splice(index, 1);
    setItems(newItems);
  };

  const handleConfirm = async () => {
    const invalidNewItems = items.filter(i => 
        i.status === 'new' && (i.price === '' || i.price === null || isNaN(parseFloat(i.price)))
    );
    
    if (invalidNewItems.length > 0) {
        alert(`Please enter a valid price for new channels: ${invalidNewItems.map(i => i.name).join(', ')}`);
        return;
    }

    setLoading(true);
    const finalIds = [];
    const channelsToCreate = items.filter(i => i.status === 'new');
    const matchedChannels = items.filter(i => i.status === 'match');

    matchedChannels.forEach(i => finalIds.push(i.matchId));

    if (channelsToCreate.length > 0) {
      const { data, error } = await supabase
        .from('channels')
        .insert(channelsToCreate.map(c => ({
          name: c.name.trim(),
          price: parseFloat(c.price),
          category: 'General',
          is_active: true
        })))
        .select();

      if (error) {
        alert('Error creating channels: ' + error.message);
        setLoading(false);
        return;
      }
      if (data) {
        data.forEach(c => finalIds.push(c.id));
      }
    }

    setLoading(false);
    onResolve(finalIds);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 z-[60] flex justify-center items-center p-4 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl p-6 flex flex-col max-h-[85vh]">
        <div className="mb-4">
          <h3 className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
            <AlertTriangle className="text-orange-500" /> Unknown Channels
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Link to existing channels or add new ones.
          </p>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-900/50 p-2 space-y-2">
          {items.map((item, idx) => (
            <div key={idx} className="flex flex-col sm:flex-row gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm items-center">
              <div className="shrink-0 min-w-[60px] text-center">
                {item.status === 'match' ? (
                  <span className="bg-green-100 text-green-700 text-[10px] uppercase font-bold px-2 py-1 rounded block">Linked</span>
                ) : (
                  <span className="bg-blue-100 text-blue-700 text-[10px] uppercase font-bold px-2 py-1 rounded block">Create</span>
                )}
              </div>

              <div className="flex-1 w-full grid grid-cols-2 gap-2">
                <input 
                  type="text" 
                  value={item.name}
                  onChange={(e) => handleChange(idx, 'name', e.target.value)}
                  className="w-full p-2 text-sm border border-gray-300 dark:border-gray-600 rounded bg-transparent dark:text-white focus:ring-1 focus:ring-indigo-500"
                  placeholder="Channel Name"
                />
                <div className="relative">
                   <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 text-xs">₹</span>
                   <input 
                    type="number" 
                    value={item.price}
                    onChange={(e) => handleChange(idx, 'price', e.target.value)}
                    disabled={item.status === 'match'} 
                    className={`w-full pl-5 p-2 text-sm border rounded bg-transparent dark:text-white focus:ring-1 focus:ring-indigo-500 disabled:opacity-50 disabled:bg-gray-100 dark:disabled:bg-gray-700 ${item.status === 'new' && (item.price === '' || item.price === null) ? 'border-orange-400 bg-orange-50 dark:bg-orange-900/20' : 'border-gray-300 dark:border-gray-600'}`}
                    placeholder="0.00"
                  />
                </div>
              </div>
              <button 
                onClick={() => handleDiscard(idx)}
                className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors shrink-0"
              >
                <Trash2 size={18} />
              </button>
            </div>
          ))}
        </div>

        <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-700">
          <button onClick={onClose} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium">Cancel</button>
          <button 
            onClick={handleConfirm}
            disabled={loading}
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 shadow-md flex items-center gap-2"
          >
            {loading && <Loader2 className="animate-spin h-4 w-4" />}
            Confirm & Continue
          </button>
        </div>
      </div>
    </div>
  );
};

// --- MODAL COMPONENT: UPSERT PLAN (ADD/EDIT) ---
const UpsertPlanModal = ({ isOpen, onClose, onSave, allChannels, onChannelsUpdated, planToEdit }) => {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [selectedChannels, setSelectedChannels] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const [inputMode, setInputMode] = useState('list'); 
  const [channelText, setChannelText] = useState('');
  
  const [isResolveOpen, setIsResolveOpen] = useState(false);
  const [missingChannels, setMissingChannels] = useState([]);

  useEffect(() => {
    if (isOpen && planToEdit) {
        setName(planToEdit.name);
        setPrice(planToEdit.price);
        setDescription(planToEdit.description || '');
        const existingIds = planToEdit.package_channels?.map(pc => pc.channel_id) || [];
        setSelectedChannels(existingIds);
        setInputMode('list');
    } else if (isOpen && !planToEdit) {
        resetForm();
    }
  }, [isOpen, planToEdit]);

  const handleModeSwitch = (mode) => {
    if (mode === 'text') {
      const text = selectedChannels
        .map(id => allChannels.find(c => c.id === id)?.name)
        .filter(Boolean)
        .join(', '); 
      setChannelText(text);
    } else {
      const items = parseTextToItems(channelText);
      const matchedIds = [];
      items.forEach(item => {
          const match = allChannels.find(c => c.name.toLowerCase() === item.name.toLowerCase());
          if (match) matchedIds.push(match.id);
      });
      setSelectedChannels(matchedIds);
    }
    setInputMode(mode);
  };

  const parseTextToItems = (text) => {
    if (!text.trim()) return [];
    return text.split(/[\n,]+/).map(s => {
        const name = s.trim();
        return name ? { name } : null;
    }).filter(Boolean);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    let finalChannelIds = [...selectedChannels];

    if (inputMode === 'text') {
        const items = parseTextToItems(channelText);
        const foundIds = [];
        const missing = [];

        items.forEach(item => {
            const match = allChannels.find(c => c.name.toLowerCase() === item.name.toLowerCase());
            if (match) {
                foundIds.push(match.id);
            } else {
                missing.push(item);
            }
        });

        if (missing.length > 0) {
            setSelectedChannels(foundIds);
            setMissingChannels(missing);
            setIsResolveOpen(true);
            return; 
        }
        
        finalChannelIds = foundIds;
    }
    finishSave(finalChannelIds);
  };

  const finishSave = async (channelIds) => {
    setLoading(true);
    await onSave({ name, price, description, channelIds, id: planToEdit?.id });
    setLoading(false);
    onClose();
    resetForm();
  };

  const handleResolveComplete = async (newIds) => {
      setIsResolveOpen(false);
      await onChannelsUpdated(); 
      const allIds = [...selectedChannels, ...newIds];
      const uniqueIds = [...new Set(allIds)];
      finishSave(uniqueIds);
  };

  const resetForm = () => {
    setName('');
    setPrice('');
    setDescription('');
    setSelectedChannels([]);
    setChannelText('');
    setInputMode('list');
  };

  const toggleChannel = (id) => {
    setSelectedChannels(prev => 
      prev.includes(id) ? prev.filter(cId => cId !== id) : [...prev, id]
    );
  };

  if (!isOpen) return null;

  return (
    <>
    <div className="fixed inset-0 bg-black/60 z-50 flex justify-center items-end sm:items-center p-0 sm:p-4 backdrop-blur-sm transition-all">
      <div className="bg-white dark:bg-gray-800 rounded-t-2xl sm:rounded-xl shadow-2xl w-full max-w-md p-6 animate-in slide-in-from-bottom-10 sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
        
        <div className="flex justify-between items-center mb-4 shrink-0">
          <h3 className="text-xl font-bold text-gray-800 dark:text-white">
            {planToEdit ? 'Edit Plan' : 'Create New Plan'}
          </h3>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="space-y-4 overflow-y-auto pr-2 custom-scrollbar flex-1">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Plan Name</label>
              <div className="relative">
                <Package className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400"/>
                <input 
                  type="text" 
                  placeholder="e.g. Gold Package" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)} 
                  required 
                  className="pl-10 w-full p-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none" 
                />
              </div>
            </div>
            
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Monthly Price</label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400"/>
                <input 
                  type="number" 
                  step="0.01" 
                  placeholder="0.00" 
                  value={price} 
                  onChange={(e) => setPrice(e.target.value)} 
                  required 
                  className="pl-10 w-full p-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none" 
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Description</label>
              <textarea 
                placeholder="What does this plan include?" 
                value={description} 
                onChange={(e) => setDescription(e.target.value)} 
                className="w-full p-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none" 
                rows="2"
              />
            </div>

            {/* Channel Selection Area */}
            <div>
               <div className="flex justify-between items-center mb-2">
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Channels ({inputMode === 'list' ? selectedChannels.length : 'Text Mode'})
                  </label>
                  
                  {/* Mode Toggle */}
                  <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-0.5">
                    <button
                      type="button"
                      onClick={() => handleModeSwitch('list')}
                      className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${inputMode === 'list' ? 'bg-white dark:bg-gray-600 shadow text-indigo-600' : 'text-gray-400 hover:text-gray-600'}`}
                    >
                      List
                    </button>
                    <button
                      type="button"
                      onClick={() => handleModeSwitch('text')}
                      className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${inputMode === 'text' ? 'bg-white dark:bg-gray-600 shadow text-indigo-600' : 'text-gray-400 hover:text-gray-600'}`}
                    >
                      Text
                    </button>
                  </div>
               </div>
               
               {inputMode === 'list' ? (
                 <div className="border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-900/50 max-h-48 overflow-y-auto p-2 grid grid-cols-1 gap-1 custom-scrollbar">
                    {allChannels.length > 0 ? allChannels.map(channel => (
                      <div 
                        key={channel.id} 
                        onClick={() => toggleChannel(channel.id)}
                        className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors ${
                          selectedChannels.includes(channel.id) 
                            ? 'bg-indigo-100 dark:bg-indigo-900/30 border border-indigo-200 dark:border-indigo-800' 
                            : 'hover:bg-gray-100 dark:hover:bg-gray-800 border border-transparent'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                           <Tv size={14} className={selectedChannels.includes(channel.id) ? "text-indigo-600 dark:text-indigo-400" : "text-gray-400"}/>
                           <span className={`text-sm ${selectedChannels.includes(channel.id) ? "font-semibold text-indigo-900 dark:text-indigo-100" : "text-gray-700 dark:text-gray-300"}`}>{channel.name}</span>
                        </div>
                        {selectedChannels.includes(channel.id) && <Check size={16} className="text-indigo-600 dark:text-indigo-400"/>}
                      </div>
                    )) : <p className="text-sm text-gray-400 text-center p-2">No channels available.</p>}
                 </div>
               ) : (
                 <div>
                   <textarea
                      placeholder="Type channel names separated by commas (e.g. HBO, ESPN, Star Plus)"
                      value={channelText}
                      onChange={(e) => setChannelText(e.target.value)}
                      className="w-full p-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-mono h-48 resize-none"
                   />
                   <div className="mt-2 flex items-center gap-2 text-xs text-gray-500">
                      <Check size={12} className="text-green-500" />
                      <span>{selectedChannels.length} known channels found</span>
                   </div>
                 </div>
               )}
            </div>

          </div>
          <div className="pt-6 mt-auto">
            <button type="submit" className="w-full py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-all active:scale-[0.98] shadow-lg shadow-indigo-500/30 flex justify-center items-center gap-2" disabled={loading}>
              {loading && <Loader2 className="animate-spin h-5 w-5"/>}
              {planToEdit ? 'Update Plan' : (inputMode === 'text' ? 'Check & Create' : 'Create Plan')}
            </button>
          </div>
        </form>
      </div>
    </div>
    
    <ResolveChannelsModal 
      isOpen={isResolveOpen}
      onClose={() => setIsResolveOpen(false)}
      missingChannels={missingChannels}
      allChannels={allChannels}
      onResolve={handleResolveComplete}
    />
    </>
  );
};

// --- MAIN PAGE COMPONENT ---
export default function ManagePlansPage() {
  const supabase = createClient();
  const [plans, setPlans] = useState([]);
  const [allChannels, setAllChannels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null); 
  const [expandedPlanId, setExpandedPlanId] = useState(null); 

  // Fetch Plans & Channels
  const fetchData = async () => {
    setLoading(true);
    
    const { data: plansData, error: plansError } = await supabase
      .from('packages')
      .select(`
        *,
        package_channels (
          channel_id,
          channels ( id, name )
        )
      `)
      .order('created_at', { ascending: false });

    if (plansError) console.error('Error fetching plans:', plansError);
    else setPlans(plansData || []);

    const { data: channelsData } = await supabase
      .from('channels')
      .select('id, name, price')
      .eq('is_active', true)
      .order('name');
    
    setAllChannels(channelsData || []);
    setLoading(false);
  };

  const refreshChannels = async () => {
      const { data: channelsData } = await supabase
      .from('channels')
      .select('id, name, price')
      .eq('is_active', true)
      .order('name');
      setAllChannels(channelsData || []);
  };

  useEffect(() => {
    fetchData();
  }, []);

  // CREATE / UPDATE HANDLER
  const handleSavePlan = async (planData) => {
    let planId = planData.id;

    if (planId) {
        const { error: updateError } = await supabase
            .from('packages')
            .update({
                name: planData.name,
                price: parseFloat(planData.price),
                description: planData.description,
            })
            .eq('id', planId);
        
        if (updateError) {
            alert('Error updating plan: ' + updateError.message);
            return;
        }
    } else {
        const { data: newPkg, error: pkgError } = await supabase
            .from('packages')
            .insert([{ 
                name: planData.name, 
                price: parseFloat(planData.price), 
                description: planData.description,
                is_active: true
            }])
            .select()
            .single();

        if (pkgError) {
            alert('Error creating plan: ' + pkgError.message);
            return;
        }
        planId = newPkg.id;
    }

    if (planId) {
        await supabase.from('package_channels').delete().eq('package_id', planId);
        
        if (planData.channelIds.length > 0) {
            const channelInserts = planData.channelIds.map(cId => ({
                package_id: planId,
                channel_id: cId
            }));

            const { error: linkError } = await supabase
                .from('package_channels')
                .insert(channelInserts);

            if (linkError) console.error("Error linking channels:", linkError);
        }
    }

    fetchData(); 
  };

  const handleEditClick = (plan) => {
      setEditingPlan(plan);
      setIsModalOpen(true);
  };

  const handleAddClick = () => {
      setEditingPlan(null);
      setIsModalOpen(true);
  };

  const handleDeletePlan = async (id) => {
    if(!confirm("Are you sure? This will delete the plan.")) return;

    const { error } = await supabase
      .from('packages')
      .delete()
      .eq('id', id);

    if (error) {
      alert("Failed to delete. It might be in use by a subscription.");
    } else {
      setPlans(plans.filter(p => p.id !== id));
    }
  };

  return (
    <>
      <UpsertPlanModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSave={handleSavePlan} 
        allChannels={allChannels}
        onChannelsUpdated={refreshChannels}
        planToEdit={editingPlan}
      />
      
      <div className="p-4 sm:p-6 md:p-10 max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between sm:items-end gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-white">Plans & Packages</h1>
            <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400 mt-1">Manage base packages and pricing.</p>
          </div>
          <button onClick={handleAddClick} className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 bg-indigo-600 text-white font-semibold rounded-xl shadow-md hover:bg-indigo-700 transition-all active:scale-95">
            <Plus size={20} />
            <span>Create New Plan</span>
          </button>
        </div>

        {/* --- MOBILE VIEW: CARDS --- */}
        <div className="grid grid-cols-1 gap-4 lg:hidden">
          {loading ? (
            <div className="text-center py-10 text-gray-500"><Loader2 className="animate-spin mx-auto"/> Loading...</div>
          ) : plans.length === 0 ? (
             <div className="text-center py-10 text-gray-500 bg-white dark:bg-gray-800 rounded-xl border border-dashed border-gray-300 dark:border-gray-700">No plans found.</div>
          ) : (
            plans.map(plan => {
               const channelCount = plan.package_channels?.length || 0;
               const isExpanded = expandedPlanId === plan.id;
               return (
                 <div key={plan.id} className="bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col gap-4">
                    <div className="flex justify-between items-start">
                       <div>
                          <h3 className="font-bold text-lg text-gray-900 dark:text-white">{plan.name}</h3>
                          <span className={`inline-flex mt-1 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide rounded-full ${plan.is_active ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-700'}`}>
                            {plan.is_active ? 'Active' : 'Inactive'}
                          </span>
                       </div>
                       <div className="text-right">
                          <span className="block font-mono text-xl font-bold text-indigo-600 dark:text-indigo-400">₹{plan.price}</span>
                          <span className="text-xs text-gray-400">/month</span>
                       </div>
                    </div>

                    <div className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                       {plan.description || 'No description provided.'}
                    </div>

                    <div className="h-px bg-gray-100 dark:bg-gray-700 w-full"></div>

                    <div className="flex items-center justify-between">
                       <button 
                          onClick={() => setExpandedPlanId(isExpanded ? null : plan.id)}
                          disabled={channelCount === 0}
                          className={`flex items-center gap-2 text-sm font-medium transition-colors ${channelCount > 0 ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-400'}`}
                       >
                          <Tv size={16} />
                          {channelCount} Channels
                          {channelCount > 0 && (isExpanded ? <ChevronUp size={16}/> : <ChevronDown size={16}/>)}
                       </button>

                       <div className="flex items-center gap-1">
                          <button onClick={() => handleEditClick(plan)} className="p-2 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-gray-700 rounded-lg transition-all">
                             <Edit size={18} />
                          </button>
                          <button onClick={() => handleDeletePlan(plan.id)} className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-gray-700 rounded-lg transition-all">
                             <Trash2 size={18} />
                          </button>
                       </div>
                    </div>

                    {isExpanded && channelCount > 0 && (
                      <div className="bg-gray-50 dark:bg-gray-900/50 p-3 rounded-xl border border-gray-100 dark:border-gray-700 animate-in fade-in slide-in-from-top-2">
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Included Channels</p>
                        <div className="flex flex-wrap gap-2">
                            {plan.package_channels.map((pc, idx) => (
                              <span key={idx} className="px-2 py-1 text-xs bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-md shadow-sm text-gray-700 dark:text-gray-200">
                                {pc.channels?.name || 'Unknown'}
                              </span>
                            ))}
                        </div>
                      </div>
                    )}
                 </div>
               )
            })
          )}
        </div>

        {/* --- DESKTOP VIEW: TABLE (Hidden on Mobile) --- */}
        <div className="hidden lg:block bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden border border-gray-100 dark:border-gray-700">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700">
                <tr>
                  <th className="p-4 font-semibold text-gray-600 dark:text-gray-300">Plan Name</th>
                  <th className="p-4 font-semibold text-gray-600 dark:text-gray-300">Price</th>
                  <th className="p-4 font-semibold text-gray-600 dark:text-gray-300 w-1/3">Description</th>
                  <th className="p-4 font-semibold text-gray-600 dark:text-gray-300">Channels</th>
                  <th className="p-4 font-semibold text-gray-600 dark:text-gray-300">Status</th>
                  <th className="p-4 font-semibold text-gray-600 dark:text-gray-300">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {loading ? (
                  <tr><td colSpan="6" className="p-8 text-center text-gray-500">Loading plans...</td></tr>
                ) : plans.length === 0 ? (
                  <tr><td colSpan="6" className="p-8 text-center text-gray-500">No plans found. Create one to get started.</td></tr>
                ) : (
                  plans.map((plan) => {
                    const channelCount = plan.package_channels?.length || 0;
                    const isExpanded = expandedPlanId === plan.id;
                    
                    return (
                      <Fragment key={plan.id}>
                        <tr className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                          <td className="p-4 font-medium text-gray-800 dark:text-white">{plan.name}</td>
                          <td className="p-4 text-gray-600 dark:text-gray-300 font-mono">₹{plan.price}</td>
                          <td className="p-4 text-gray-500 dark:text-gray-400 max-w-xs truncate" title={plan.description}>
                            {plan.description}
                          </td>
                          
                          {/* --- DROPDOWN TRIGGER COLUMN --- */}
                          <td className="p-4">
                            <button 
                              onClick={() => setExpandedPlanId(isExpanded ? null : plan.id)}
                              disabled={channelCount === 0}
                              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                                channelCount === 0 
                                  ? 'text-gray-400 cursor-default'
                                  : isExpanded 
                                    ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                              }`}
                            >
                              <Tv size={14} />
                              {channelCount} Channels
                              {channelCount > 0 && (
                                isExpanded ? <ChevronUp size={14}/> : <ChevronDown size={14}/>
                              )}
                            </button>
                          </td>

                          <td className="p-4">
                            <span className={`px-2 py-1 text-xs rounded-full ${plan.is_active ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-red-100 text-red-800'}`}>
                              {plan.is_active ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td className="p-4">
                              <div className="flex items-center gap-2">
                                <button onClick={() => handleEditClick(plan)} className="text-indigo-600 hover:text-indigo-800 p-2 transition-colors">
                                    <Edit size={18} />
                                </button>
                                <button onClick={() => handleDeletePlan(plan.id)} className="text-red-500 hover:text-red-700 p-2 transition-colors">
                                    <Trash2 size={18} />
                                </button>
                              </div>
                          </td>
                        </tr>

                        {/* --- DROPDOWN CONTENT ROW --- */}
                        {isExpanded && channelCount > 0 && (
                           <tr className="bg-indigo-50/50 dark:bg-gray-800/50 animate-in fade-in slide-in-from-top-1 duration-200">
                             <td colSpan="6" className="p-4 pl-16">
                               <div className="flex flex-wrap gap-2">
                                 {plan.package_channels.map((pc, idx) => (
                                   <span key={idx} className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-600 shadow-sm">
                                     {pc.channels?.name || 'Unknown Channel'}
                                   </span>
                                 ))}
                               </div>
                             </td>
                           </tr>
                        )}
                      </Fragment>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}