'use client';

import React, { useState, useEffect } from 'react';
import { 
  Plus, Search, X, Tv, DollarSign, Tag, Trash2, Loader2, 
  List, Type, AlertTriangle, ArrowRight, Check, Film, Trophy, Globe, Music, Baby,
  Edit, Save
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

// --- HELPER: CATEGORY COLORS & ICONS ---
const getCategoryStyle = (cat) => {
    const c = (cat || 'General').toLowerCase();
    if (c.includes('sport')) return { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-700 dark:text-blue-300', icon: Trophy };
    if (c.includes('movie') || c.includes('cinema')) return { bg: 'bg-purple-100 dark:bg-purple-900/30', text: 'text-purple-700 dark:text-purple-300', icon: Film };
    if (c.includes('news')) return { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-700 dark:text-red-300', icon: Globe };
    if (c.includes('music')) return { bg: 'bg-pink-100 dark:bg-pink-900/30', text: 'text-pink-700 dark:text-pink-300', icon: Music };
    if (c.includes('kid')) return { bg: 'bg-yellow-100 dark:bg-yellow-900/30', text: 'text-yellow-700 dark:text-yellow-300', icon: Baby };
    return { bg: 'bg-gray-100 dark:bg-gray-800', text: 'text-gray-600 dark:text-gray-400', icon: Tv };
};

// --- MODAL: RESOLVE DUPLICATES ---
const ResolveDuplicatesModal = ({ isOpen, onClose, duplicates, onConfirm, loading }) => {
  const [items, setItems] = useState([]);

  useEffect(() => {
    if (isOpen && duplicates.length > 0) {
      setItems(duplicates.map(d => ({ ...d, action: 'update' })));
    }
  }, [isOpen, duplicates]);

  const toggleAction = (index) => {
    const newItems = [...items];
    newItems[index].action = newItems[index].action === 'update' ? 'skip' : 'update';
    setItems(newItems);
  };

  const handleConfirm = () => {
    const updates = items.filter(i => i.action === 'update');
    onConfirm(updates);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 z-[60] flex justify-center items-end sm:items-center p-0 sm:p-4 backdrop-blur-sm transition-all">
      <div className="bg-white dark:bg-gray-800 rounded-t-2xl sm:rounded-2xl shadow-2xl w-full max-w-2xl p-6 flex flex-col max-h-[85vh] animate-in slide-in-from-bottom-10 sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-200">
        <div className="mb-4">
          <h3 className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
            <AlertTriangle className="text-orange-500" /> Duplicate Channels
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Review price changes for existing channels.
          </p>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-900/50 p-2 space-y-2">
          {items.map((item, idx) => (
            <div 
              key={idx} 
              onClick={() => toggleAction(idx)}
              className={`flex flex-col sm:flex-row gap-3 p-3 rounded-lg border shadow-sm items-center cursor-pointer transition-all ${
                item.action === 'update' 
                  ? 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800' 
                  : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 opacity-60'
              }`}
            >
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                 item.action === 'update' ? 'bg-indigo-600 border-indigo-600' : 'border-gray-400'
              }`}>
                {item.action === 'update' && <Check size={12} className="text-white" />}
              </div>

              <div className="flex-1 w-full flex justify-between items-center">
                <div>
                    <p className="font-bold text-gray-800 dark:text-white truncate max-w-[150px] sm:max-w-xs">{item.name}</p>
                    <span className="text-[10px] text-gray-500 uppercase tracking-wide">{item.action === 'update' ? 'Update Price' : 'Keep Old Price'}</span>
                </div>
                
                <div className="flex items-center gap-3 text-sm">
                    <div className="text-gray-400 line-through">₹{item.oldPrice}</div>
                    <ArrowRight size={14} className="text-gray-400"/>
                    <div className="font-bold text-gray-900 dark:text-white">₹{item.newPrice}</div>
                </div>
              </div>
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
            Confirm Updates
          </button>
        </div>
      </div>
    </div>
  );
};

// --- MODAL: ADD CHANNEL (Liquid Glass) ---
const AddChannelModal = ({ isOpen, onClose, onBulkOperation, existingChannels }) => {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('General');
  const [loading, setLoading] = useState(false);

  const [mode, setMode] = useState('single'); 
  const [bulkText, setBulkText] = useState('');
  
  const [isResolveOpen, setIsResolveOpen] = useState(false);
  const [duplicates, setDuplicates] = useState([]);
  const [pendingNewChannels, setPendingNewChannels] = useState([]);

  const resetForm = () => {
    setName('');
    setPrice('');
    setCategory('General');
    setBulkText('');
    setMode('single');
    setDuplicates([]);
    setPendingNewChannels([]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (mode === 'single') {
        const exists = existingChannels.find(c => c.name.toLowerCase() === name.trim().toLowerCase());
        if (exists) {
            setDuplicates([{ 
                id: exists.id, 
                name: exists.name, 
                oldPrice: exists.price, 
                newPrice: parseFloat(price) 
            }]);
            setPendingNewChannels([]); 
            setIsResolveOpen(true);
            return;
        }
        setLoading(true);
        await onBulkOperation({ 
            newChannels: [{ name, price, category }], 
            updates: [] 
        });
        setLoading(false);
        onClose();
        resetForm();
    
    } else {
        const lines = bulkText.split(/[\n,]+/).filter(l => l.trim());
        const parsed = [];
        
        lines.forEach(line => {
            const [n, p] = line.split(':').map(s => s?.trim());
            if (n) {
                parsed.push({ name: n, price: parseFloat(p) || 0, category: 'General' });
            }
        });

        if (parsed.length === 0) return;

        const newCh = [];
        const dupes = [];

        parsed.forEach(p => {
            const match = existingChannels.find(ex => ex.name.toLowerCase() === p.name.toLowerCase());
            if (match) {
                dupes.push({
                    id: match.id,
                    name: match.name,
                    oldPrice: match.price,
                    newPrice: p.price
                });
            } else {
                newCh.push(p);
            }
        });

        if (dupes.length > 0) {
            setDuplicates(dupes);
            setPendingNewChannels(newCh);
            setIsResolveOpen(true);
        } else {
            setLoading(true);
            await onBulkOperation({ newChannels: newCh, updates: [] });
            setLoading(false);
            onClose();
            resetForm();
        }
    }
  };

  const handleResolveConfirm = async (updatesToApply) => {
      setIsResolveOpen(false);
      setLoading(true);
      
      const formattedUpdates = updatesToApply.map(u => ({ id: u.id, price: u.newPrice }));
      
      await onBulkOperation({ 
          newChannels: pendingNewChannels, 
          updates: formattedUpdates 
      });
      
      setLoading(false);
      onClose();
      resetForm();
  };

  if (!isOpen) return null;

  return (
    <>
    <div className="fixed inset-0 bg-black/60 z-50 flex justify-center items-end sm:items-center p-0 sm:p-4 backdrop-blur-sm transition-all">
      {/* Liquid Glass Container */}
      <div className="w-full max-w-md bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border border-white/20 dark:border-gray-700/30 shadow-2xl rounded-t-2xl sm:rounded-2xl p-6 animate-in slide-in-from-bottom-10 sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-300 flex flex-col max-h-[90vh]">
        
        <div className="flex justify-between items-center mb-6 shrink-0">
          <h3 className="text-2xl font-bold text-gray-800 dark:text-white tracking-tight">Add Channels</h3>
          <button onClick={onClose} className="p-2 bg-gray-100/50 dark:bg-gray-800/50 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors">
            <X size={20} className="text-gray-600 dark:text-gray-300" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          
          {/* Mode Toggle */}
          <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1 mb-4 shrink-0">
             <button
               type="button"
               onClick={() => setMode('single')}
               className={`flex-1 py-1.5 text-xs font-semibold rounded-md flex items-center justify-center gap-2 transition-all ${mode === 'single' ? 'bg-white dark:bg-gray-700 shadow text-indigo-600 dark:text-indigo-400' : 'text-gray-500'}`}
             >
                <List size={14}/> Single
             </button>
             <button
               type="button"
               onClick={() => setMode('bulk')}
               className={`flex-1 py-1.5 text-xs font-semibold rounded-md flex items-center justify-center gap-2 transition-all ${mode === 'bulk' ? 'bg-white dark:bg-gray-700 shadow text-indigo-600 dark:text-indigo-400' : 'text-gray-500'}`}
             >
                <Type size={14}/> Bulk Text
             </button>
          </div>

          <div className="space-y-4 overflow-y-auto pr-1 custom-scrollbar flex-1">
            
            {mode === 'single' ? (
                <>
                    <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Channel Name</label>
                    <div className="relative">
                        <Tv className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400"/>
                        <input 
                        type="text" 
                        placeholder="e.g. HBO" 
                        value={name} 
                        onChange={(e) => setName(e.target.value)} 
                        required 
                        className="w-full pl-10 p-3 bg-white/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500/50 outline-none" 
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
                        className="w-full pl-10 p-3 bg-white/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500/50 outline-none" 
                        />
                    </div>
                    </div>

                    <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Category</label>
                    <div className="relative">
                        <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400"/>
                        <select 
                        value={category} 
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full pl-10 p-3 bg-white/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500/50 outline-none appearance-none"
                        >
                        <option value="General">General</option>
                        <option value="Movies">Movies</option>
                        <option value="Sports">Sports</option>
                        <option value="News">News</option>
                        <option value="Kids">Kids</option>
                        <option value="Infotainment">Infotainment</option>
                        </select>
                    </div>
                    </div>
                </>
            ) : (
                <div className="h-full flex flex-col">
                    <textarea
                        value={bulkText}
                        onChange={(e) => setBulkText(e.target.value)}
                        placeholder="Format: Name : Price, Name : Price&#10;Example:&#10;HBO : 10,&#10;ESPN : 5.50"
                        className="w-full flex-1 p-3 bg-white/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500/50 outline-none font-mono text-sm resize-none"
                    />
                    <p className="text-[10px] text-gray-400 mt-2">Duplicates will be detected automatically.</p>
                </div>
            )}
          </div>
          <div className="pt-6 mt-auto">
            <button type="submit" className="w-full py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-all active:scale-[0.98] shadow-lg shadow-indigo-500/30 flex justify-center items-center gap-2" disabled={loading}>
              {loading && <Loader2 className="animate-spin h-5 w-5"/>}
              {mode === 'single' ? 'Add Channel' : 'Process Bulk List'}
            </button>
          </div>
        </form>
      </div>
    </div>

    <ResolveDuplicatesModal 
        isOpen={isResolveOpen}
        onClose={() => setIsResolveOpen(false)}
        duplicates={duplicates}
        onConfirm={handleResolveConfirm}
        loading={loading}
    />
    </>
  );
};

// --- MAIN PAGE COMPONENT ---
export default function ManageChannelsPage() {
  const supabase = createClient();
  const [channels, setChannels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // --- EDIT STATE ---
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({ name: '', price: '', category: 'General' });

  // Fetch Channels
  const fetchChannels = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('channels')
      .select('*')
      .order('name', { ascending: true });

    if (error) console.error('Error fetching channels:', error);
    else setChannels(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchChannels();
  }, []);

  // BULK ADD / UPDATE HANDLER
  const handleBulkOperation = async ({ newChannels, updates }) => {
    if (newChannels.length > 0) {
        const { error: insertError } = await supabase
            .from('channels')
            .insert(newChannels.map(c => ({
                name: c.name,
                price: c.price,
                category: c.category || 'General',
                is_active: true
            })));
        if (insertError) alert('Error inserting channels: ' + insertError.message);
    }

    if (updates.length > 0) {
        for (const u of updates) {
            const { error: updateError } = await supabase
                .from('channels')
                .update({ price: u.price })
                .eq('id', u.id);
            if (updateError) console.error(`Error updating ${u.id}:`, updateError);
        }
    }
    fetchChannels(); 
  };

  // DELETE
  const handleDeleteChannel = async (id) => {
    if(!confirm("Are you sure? This will remove the channel.")) return;
    const { error } = await supabase.from('channels').delete().eq('id', id);
    if (error) {
      alert("Failed to delete. It might be linked to a customer's subscription.");
    } else {
      setChannels(channels.filter(c => c.id !== id));
    }
  };

  // --- INLINE EDIT HANDLERS ---
  const handleStartEdit = (channel) => {
      setEditingId(channel.id);
      setEditData({ 
          name: channel.name, 
          price: channel.price, 
          category: channel.category || 'General' 
      });
  };

  const handleCancelEdit = () => {
      setEditingId(null);
      setEditData({ name: '', price: '', category: 'General' });
  };

  const handleSaveEdit = async (id) => {
      if (!editData.name.trim()) return alert("Name cannot be empty");
      
      // Optimistic Update
      const updatedChannels = channels.map(c => 
          c.id === id ? { ...c, name: editData.name, price: parseFloat(editData.price), category: editData.category } : c
      );
      setChannels(updatedChannels);
      setEditingId(null);

      // DB Update
      const { error } = await supabase
          .from('channels')
          .update({ name: editData.name, price: parseFloat(editData.price), category: editData.category })
          .eq('id', id);
      
      if (error) {
          alert('Error updating channel: ' + error.message);
          fetchChannels(); // Revert on error
      }
  };

  const filteredChannels = channels.filter(channel => 
    channel.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    channel.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <AddChannelModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onBulkOperation={handleBulkOperation} 
        existingChannels={channels} 
      />
      
      <div className="min-h-screen bg-gray-50/50 dark:bg-gray-900/50">
        
        {/* --- MOBILE HEADER (Sticky) --- */}
        <div className="lg:hidden sticky top-0 z-30 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-b border-gray-200 dark:border-gray-800 p-4 shadow-sm">
            <div className="flex justify-between items-center mb-3">
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">A La Carte</h1>
                <button 
                    onClick={() => setIsModalOpen(true)} 
                    className="p-2 bg-indigo-600 text-white rounded-full shadow-lg shadow-indigo-500/30 active:scale-95 transition-all"
                >
                    <Plus size={20} />
                </button>
            </div>
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                    type="text"
                    placeholder="Search channels..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9 p-2.5 bg-gray-100 dark:bg-gray-800 border-none rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none text-sm transition-all placeholder:text-gray-400"
                />
            </div>
        </div>

        <div className="p-4 sm:p-6 md:p-10 max-w-7xl mx-auto">
          
          {/* --- DESKTOP HEADER --- */}
          <div className="hidden lg:flex flex-row justify-between items-center gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 dark:text-white">A La Carte Channels</h1>
              <p className="text-gray-500 dark:text-gray-400 mt-1">Manage individual channels available for addon.</p>
            </div>
            
            <div className="flex items-center gap-4">
                <div className="relative w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-9 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                </div>
                <button onClick={() => setIsModalOpen(true)} className="flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 transition-colors">
                  <Plus size={20} />
                  <span>Add Channels</span>
                </button>
            </div>
          </div>

          {/* --- GRID VIEW --- */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
             {loading ? (
                <div className="col-span-full flex justify-center py-20"><Loader2 className="animate-spin text-indigo-600 h-8 w-8"/></div>
             ) : filteredChannels.length === 0 ? (
                <div className="col-span-full text-center py-20 text-gray-500 bg-white dark:bg-gray-800 rounded-2xl border border-dashed border-gray-300 dark:border-gray-700">
                    No channels found.
                </div>
             ) : (
                filteredChannels.map((channel) => {
                    const catStyle = getCategoryStyle(channel.category);
                    const CatIcon = catStyle.icon;
                    const isEditing = editingId === channel.id;

                    return (
                        <div key={channel.id} className={`bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm border transition-all relative group ${isEditing ? 'border-indigo-500 ring-1 ring-indigo-500' : 'border-gray-100 dark:border-gray-700 hover:shadow-md'}`}>
                            
                            {/* Header: Icon + Category (EDITABLE) */}
                            <div className="flex items-center gap-3 mb-3">
                                <div className={`p-2 rounded-xl ${catStyle.bg} ${catStyle.text}`}>
                                    <CatIcon size={20} />
                                </div>
                                {isEditing ? (
                                   <select 
                                     value={editData.category} 
                                     onChange={(e) => setEditData({...editData, category: e.target.value})}
                                     className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-800 dark:text-white uppercase tracking-wide focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                   >
                                      <option value="General">General</option>
                                      <option value="Movies">Movies</option>
                                      <option value="Sports">Sports</option>
                                      <option value="News">News</option>
                                      <option value="Kids">Kids</option>
                                      <option value="Infotainment">Infotainment</option>
                                   </select>
                                ) : (
                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 uppercase tracking-wide`}>
                                        {channel.category || 'General'}
                                    </span>
                                )}
                            </div>
                            
                            {/* Content: Edit Mode vs View Mode */}
                            {isEditing ? (
                                <div className="space-y-2">
                                    <input 
                                        type="text" 
                                        value={editData.name}
                                        onChange={(e) => setEditData({...editData, name: e.target.value})}
                                        className="w-full p-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded bg-gray-50 dark:bg-gray-900 dark:text-white focus:ring-1 focus:ring-indigo-500 outline-none font-bold"
                                        autoFocus
                                    />
                                    <div className="relative">
                                        <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 text-xs">₹</span>
                                        <input 
                                            type="number" 
                                            value={editData.price}
                                            onChange={(e) => setEditData({...editData, price: e.target.value})}
                                            className="w-full pl-5 p-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded bg-gray-50 dark:bg-gray-900 dark:text-white focus:ring-1 focus:ring-indigo-500 outline-none font-mono"
                                        />
                                    </div>
                                    <div className="flex gap-2 pt-1">
                                        <button onClick={() => handleSaveEdit(channel.id)} className="flex-1 bg-green-100 text-green-700 hover:bg-green-200 p-1.5 rounded-md text-xs font-bold flex justify-center items-center gap-1"><Check size={14}/> Save</button>
                                        <button onClick={handleCancelEdit} className="flex-1 bg-gray-100 text-gray-600 hover:bg-gray-200 p-1.5 rounded-md text-xs font-bold flex justify-center items-center gap-1"><X size={14}/> Cancel</button>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <h3 className="font-bold text-gray-900 dark:text-white mb-1 truncate" title={channel.name}>{channel.name}</h3>
                                    <p className="font-mono font-semibold text-indigo-600 dark:text-indigo-400 text-lg">₹{channel.price}</p>

                                    {/* Action Buttons (Absolute) */}
                                    <div className="absolute top-4 right-4 flex gap-1 opacity-100 lg:opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button 
                                            onClick={() => handleStartEdit(channel)}
                                            className="p-1.5 text-gray-400 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-colors"
                                        >
                                            <Edit size={16} />
                                        </button>
                                        <button 
                                            onClick={() => handleDeleteChannel(channel.id)}
                                            className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    );
                })
             )}
          </div>

        </div>
      </div>
    </>
  );
}