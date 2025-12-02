'use client';

import React, { useState } from 'react';
import { Plus, Search, X, User, List, Type, Tag, ChevronDown, CheckCircle, Clock, MoreVertical, Edit } from 'lucide-react';

// --- MOCK DATA ---
const myCustomers = [
  { id: 1, fullName: 'Alice Wonderland' },
  { id: 3, fullName: 'Charlie Chocolate' },
  { id: 10, fullName: 'David Copperfield' },
  { id: 11, fullName: 'Eva Green' },
];

const initialTickets = [
  { id: 'TKT-1001', customerId: 1, customerName: 'Alice Wonderland', subject: 'Remote not working', priority: 'Medium', status: 'Open', createdDate: '2025-10-28' },
  { id: 'TKT-1002', customerId: 3, customerName: 'Charlie Chocolate', subject: 'Billing query', priority: 'Low', status: 'In Progress', createdDate: '2025-10-27' },
  { id: 'TKT-1003', customerId: 1, customerName: 'Alice Wonderland', subject: 'Channels missing from plan', priority: 'High', status: 'Open', createdDate: '2025-10-28' },
  { id: 'TKT-1004', customerId: 10, customerName: 'David Copperfield', subject: 'Signal interruption', priority: 'Medium', status: 'Resolved', createdDate: '2025-10-26' },
];

const priorities = ['Low', 'Medium', 'High'];
const statuses = ['Open', 'In Progress', 'Resolved'];

// --- TICKET MODAL COMPONENT ---
const LogTicketModal = ({ isOpen, onClose, onSave, ticket }) => {
  const isEditing = !!ticket;
  const [formData, setFormData] = useState(
    isEditing ? ticket : {
      customerId: '',
      priority: 'Medium',
      subject: '',
      description: '',
    }
  );

  // Pre-fill form for editing
  React.useEffect(() => {
    if (isOpen) {
        if (isEditing) {
            setFormData(ticket);
        } else {
            setFormData({
                customerId: '',
                priority: 'Medium',
                subject: '',
                description: '',
            });
        }
    }
  }, [ticket, isOpen, isEditing]);


  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const customer = myCustomers.find(c => c.id == formData.customerId);
    onSave({ 
      ...formData, 
      id: isEditing ? ticket.id : `TKT-${Math.floor(Date.now() / 1000)}`,
      customerName: customer ? customer.fullName : 'N/A',
      status: isEditing ? ticket.status : 'Open',
      createdDate: isEditing ? ticket.createdDate : new Date().toISOString().split('T')[0]
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-lg">
        <div className="p-5 border-b dark:border-gray-700 flex justify-between items-center">
          <h3 className="text-xl font-semibold text-gray-800 dark:text-white">
            {isEditing ? 'Edit Support Ticket' : 'Log New Support Ticket'}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-white">
            <X size={24} />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400"/>
                <select name="customerId" value={formData.customerId} onChange={handleChange} required className="pl-10 w-full p-3 border rounded-md bg-gray-50 dark:border-gray-600 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 appearance-none" disabled={isEditing}>
                  <option value="" disabled>Select Customer</option>
                  {myCustomers.map(c => <option key={c.id} value={c.id}>{c.fullName}</option>)}
                </select>
              </div>
              <div className="relative">
                <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400"/>
                <select name="priority" value={formData.priority} onChange={handleChange} required className="pl-10 w-full p-3 border rounded-md bg-gray-50 dark:border-gray-600 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 appearance-none">
                  {priorities.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
            </div>
            {isEditing && (
                 <div className="relative">
                    <CheckCircle className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400"/>
                    <select name="status" value={formData.status} onChange={handleChange} required className="pl-10 w-full p-3 border rounded-md bg-gray-50 dark:border-gray-600 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 appearance-none">
                        {statuses.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                </div>
            )}
            <div className="relative">
              <Type className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400"/>
              <input type="text" name="subject" placeholder="Subject / Issue Title" value={formData.subject} onChange={handleChange} required className="pl-10 w-full p-3 border rounded-md bg-gray-50 dark:border-gray-600 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div>
              <textarea name="description" placeholder="Detailed description of the issue..." value={formData.description} onChange={handleChange} rows="4" className="w-full p-3 border rounded-md bg-gray-50 dark:border-gray-600 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"></textarea>
            </div>
          </div>
          <div className="p-5 bg-gray-50 dark:bg-gray-800/50 border-t dark:border-gray-700 flex justify-end gap-3">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-md bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500 font-medium">Cancel</button>
            <button type="submit" className="px-4 py-2 rounded-md bg-indigo-600 text-white hover:bg-indigo-700 font-medium">Save Ticket</button>
          </div>
        </form>
      </div>
    </div>
  );
};


// --- MAIN PAGE COMPONENT ---
export default function SupportTicketsPage() {
  const [tickets, setTickets] = useState(initialTickets);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTicket, setEditingTicket] = useState(null);

  const handleOpenModal = (ticket = null) => {
    setEditingTicket(ticket);
    setIsModalOpen(true);
  };
  
  const handleCloseModal = () => {
    setEditingTicket(null);
    setIsModalOpen(false);
  }

  const handleSaveTicket = (ticketData) => {
    if (editingTicket) {
      setTickets(tickets.map(t => t.id === ticketData.id ? ticketData : t));
    } else {
      setTickets([ticketData, ...tickets]);
    }
  };
  
  const filteredTickets = tickets.filter(ticket => {
    const searchMatch = ticket.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        ticket.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        ticket.id.toLowerCase().includes(searchTerm.toLowerCase());
    const statusMatch = statusFilter === 'All' || ticket.status === statusFilter;
    return searchMatch && statusMatch;
  });
  
  const statusConfig = {
    Open: { icon: Clock, color: 'text-yellow-600', bg: 'bg-yellow-100 dark:bg-yellow-900/50' },
    'In Progress': { icon: Edit, color: 'text-blue-600', bg: 'bg-blue-100 dark:bg-blue-900/50' },
    Resolved: { icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-100 dark:bg-green-900/50' },
  };
  
  const priorityConfig = {
      Low: 'text-gray-500',
      Medium: 'text-yellow-600',
      High: 'text-red-600',
  }

  return (
    <>
      <LogTicketModal 
        isOpen={isModalOpen} 
        onClose={handleCloseModal} 
        onSave={handleSaveTicket}
        ticket={editingTicket}
      />
      <div className="p-4 sm:p-6 md:p-10">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Support Tickets</h1>
              <p className="text-gray-500 dark:text-gray-400 mt-1">Log and track customer support issues.</p>
            </div>
            <button onClick={() => handleOpenModal()} className="flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 transition-colors">
              <Plus size={20} />
              <span>Log New Ticket</span>
            </button>
          </div>

          {/* Search and Filter Bar */}
          <div className="mb-6 flex flex-col sm:flex-row gap-4">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by Ticket ID, Customer, or Subject..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div className="relative">
             <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full sm:w-48 appearance-none pr-10 pl-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
                <option value="All">All Statuses</option>
                {statuses.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
          </div>
          </div>

          {/* Tickets Table */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50 dark:bg-gray-700/50">
                  <tr>
                    <th className="p-4 font-semibold text-gray-600 dark:text-gray-300">Ticket ID</th>
                    <th className="p-4 font-semibold text-gray-600 dark:text-gray-300">Customer</th>
                    <th className="p-4 font-semibold text-gray-600 dark:text-gray-300">Subject</th>
                    <th className="p-4 font-semibold text-gray-600 dark:text-gray-300">Priority</th>
                    <th className="p-4 font-semibold text-gray-600 dark:text-gray-300">Status</th>
                    <th className="p-4 font-semibold text-gray-600 dark:text-gray-300">Date</th>
                    <th className="p-4 font-semibold text-gray-600 dark:text-gray-300">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredTickets.map((ticket) => {
                    const statusInfo = statusConfig[ticket.status];
                    const priorityColor = priorityConfig[ticket.priority];
                    return (
                        <tr key={ticket.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                          <td className="p-4 whitespace-nowrap"><span className="font-mono text-sm text-gray-500 dark:text-gray-400">{ticket.id}</span></td>
                          <td className="p-4 whitespace-nowrap"><span className="font-medium text-gray-800 dark:text-white">{ticket.customerName}</span></td>
                          <td className="p-4"><span className="text-gray-600 dark:text-gray-300">{ticket.subject}</span></td>
                          <td className="p-4 whitespace-nowrap"><span className={`font-medium ${priorityColor}`}>{ticket.priority}</span></td>
                          <td className="p-4 whitespace-nowrap">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full ${statusInfo.bg} ${statusInfo.color}`}>
                              <statusInfo.icon size={14} />
                              {ticket.status}
                            </span>
                          </td>
                          <td className="p-4 text-gray-500 dark:text-gray-400 whitespace-nowrap">{ticket.createdDate}</td>
                          <td className="p-4">
                            <button onClick={() => handleOpenModal(ticket)} className="p-2 text-gray-500 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
                               <Edit size={18} />
                               <span className="sr-only">Edit Ticket</span>
                            </button>
                          </td>
                        </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {filteredTickets.length === 0 && (
                <div className="text-center p-8 text-gray-500 dark:text-gray-400">
                    No tickets found matching your criteria.
                </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
