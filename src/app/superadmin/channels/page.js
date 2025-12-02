'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Search, X, Tv, DollarSign, Tag, Trash2, Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

// --- MODAL COMPONENT ---
const AddChannelModal = ({ isOpen, onClose, onAddChannel }) => {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('General'); // Default category
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    await onAddChannel({ name, price, category });
    setLoading(false);
    onClose();
    setName('');
    setPrice('');
    setCategory('General');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md">
        <div className="p-6 border-b dark:border-gray-700 flex justify-between items-center">
          <h3 className="text-xl font-semibold text-gray-800 dark:text-white">Add New Channel</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-white">
            <X size={24} />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Channel Name</label>
              <div className="relative">
                <Tv className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400"/>
                <input 
                  type="text" 
                  placeholder="e.g. HBO, Star Sports" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)} 
                  required 
                  className="pl-10 w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500" 
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Monthly Price</label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400"/>
                <input 
                  type="number" 
                  step="0.01" 
                  placeholder="0.00" 
                  value={price} 
                  onChange={(e) => setPrice(e.target.value)} 
                  required 
                  className="pl-10 w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500" 
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category</label>
              <div className="relative">
                <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400"/>
                <select 
                  value={category} 
                  onChange={(e) => setCategory(e.target.value)}
                  className="pl-10 w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 appearance-none"
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
          </div>
          <div className="p-6 bg-gray-50 dark:bg-gray-800/50 border-t dark:border-gray-700 flex justify-end gap-3">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-md bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500 font-medium">Cancel</button>
            <button type="submit" className="px-4 py-2 rounded-md bg-indigo-600 text-white hover:bg-indigo-700 font-medium" disabled={loading}>
              {loading ? 'Adding...' : 'Add Channel'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// --- MAIN PAGE COMPONENT ---
export default function ManageChannelsPage() {
  const supabase = createClient();
  const [channels, setChannels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

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

  // Add Channel Handler
  const handleAddChannel = async (channelData) => {
    const { data, error } = await supabase
      .from('channels')
      .insert([
        { 
          name: channelData.name, 
          price: parseFloat(channelData.price), 
          category: channelData.category,
          is_active: true
        }
      ])
      .select();

    if (error) {
      alert('Error creating channel: ' + error.message);
    } else {
      if (data) setChannels([...channels, data[0]].sort((a,b) => a.name.localeCompare(b.name)));
    }
  };

  // Delete Channel Handler
  const handleDeleteChannel = async (id) => {
    if(!confirm("Are you sure? This will remove the channel.")) return;

    const { error } = await supabase
      .from('channels')
      .delete()
      .eq('id', id);

    if (error) {
      alert("Failed to delete. It might be linked to a customer's subscription.");
    } else {
      setChannels(channels.filter(c => c.id !== id));
    }
  };

  // Filter Logic
  const filteredChannels = channels.filter(channel => 
    channel.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    channel.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <AddChannelModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onAddChannel={handleAddChannel} 
      />
      
      <div className="p-4 sm:p-6 md:p-10">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 dark:text-white">A La Carte Channels</h1>
              <p className="text-gray-500 dark:text-gray-400 mt-1">Manage individual channels available for addon.</p>
            </div>
            <button onClick={() => setIsModalOpen(true)} className="flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 transition-colors">
              <Plus size={20} />
              <span>Add New Channel</span>
            </button>
          </div>

          {/* Search Bar */}
          <div className="mb-6 flex flex-col sm:flex-row gap-4">
            <div className="relative flex-grow max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search channels..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Channels Grid / Table */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50 dark:bg-gray-700/50">
                  <tr>
                    <th className="p-4 font-semibold text-gray-600 dark:text-gray-300">Channel Name</th>
                    <th className="p-4 font-semibold text-gray-600 dark:text-gray-300">Category</th>
                    <th className="p-4 font-semibold text-gray-600 dark:text-gray-300">Price</th>
                    <th className="p-4 font-semibold text-gray-600 dark:text-gray-300">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {loading ? (
                    <tr><td colSpan="4" className="p-8 text-center text-gray-500">Loading channels...</td></tr>
                  ) : filteredChannels.length === 0 ? (
                    <tr><td colSpan="4" className="p-8 text-center text-gray-500">No channels found.</td></tr>
                  ) : (
                    filteredChannels.map((channel) => (
                      <tr key={channel.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                        <td className="p-4 font-medium text-gray-800 dark:text-white flex items-center gap-2">
                           <Tv size={16} className="text-gray-400" />
                           {channel.name}
                        </td>
                        <td className="p-4">
                           <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 border border-blue-200 dark:border-blue-800">
                             {channel.category || 'General'}
                           </span>
                        </td>
                        <td className="p-4 text-gray-600 dark:text-gray-300 font-mono">₹{channel.price}</td>
                        <td className="p-4">
                            <button onClick={() => handleDeleteChannel(channel.id)} className="text-red-500 hover:text-red-700 p-2 transition-colors">
                                <Trash2 size={18} />
                            </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}