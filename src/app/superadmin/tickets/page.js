'use client';

import React, { useState, useEffect } from 'react';
import { 
  Search, Filter, MessageSquare, User, CheckCircle, 
  Clock, AlertTriangle, MoreVertical, Loader2 
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

// --- MODAL: UPDATE TICKET ---
const UpdateTicketModal = ({ isOpen, onClose, ticket, employees, onUpdateTicket, loading }) => {
  const [assignedTo, setAssignedTo] = useState('');
  const [status, setStatus] = useState('');
  const [priority, setPriority] = useState('');

  // Load ticket data into state when modal opens
  useEffect(() => {
    if (ticket) {
      setAssignedTo(ticket.assigned_to || '');
      setStatus(ticket.status || 'open');
      setPriority(ticket.priority || 'medium');
    }
  }, [ticket]);

  if (!isOpen || !ticket) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    await onUpdateTicket(ticket.id, { 
      assigned_to: assignedTo || null, 
      status, 
      priority 
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex justify-center items-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md">
        <div className="p-6 border-b dark:border-gray-700">
          <h3 className="text-xl font-bold text-gray-800 dark:text-white">Update Ticket</h3>
          <p className="text-sm text-gray-500 mt-1">Ref: {ticket.id.slice(0,8)}</p>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-4">
            
            {/* Read Only Info */}
            <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-md mb-4">
              <p className="text-sm font-semibold text-gray-800 dark:text-white">{ticket.subject}</p>
              <p className="text-xs text-gray-500 mt-1">{ticket.description}</p>
            </div>

            {/* Assign Employee */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Assign Technician</label>
              <select
                value={assignedTo}
                onChange={(e) => setAssignedTo(e.target.value)}
                className="w-full p-2.5 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
              >
                <option value="">-- Unassigned --</option>
                {employees.map(emp => (
                  <option key={emp.id} value={emp.id}>{emp.full_name}</option>
                ))}
              </select>
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full p-2.5 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
              >
                <option value="open">Open</option>
                <option value="in_progress">In Progress</option>
                <option value="resolved">Resolved</option>
                <option value="closed">Closed</option>
              </select>
            </div>

            {/* Priority */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full p-2.5 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>

          </div>
          
          <div className="p-6 bg-gray-50 dark:bg-gray-800/50 border-t dark:border-gray-700 flex justify-end gap-3">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-md bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-200 font-medium">Cancel</button>
            <button type="submit" disabled={loading} className="px-4 py-2 rounded-md bg-indigo-600 text-white hover:bg-indigo-700 font-medium flex items-center gap-2">
              {loading && <Loader2 className="animate-spin h-4 w-4"/>}
              Update Ticket
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// --- MAIN PAGE ---
export default function ManageTicketsPage() {
  const [tickets, setTickets] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');
  
  const [selectedTicket, setSelectedTicket] = useState(null);

  const supabase = createClient();

  // Fetch Data
  const fetchData = async () => {
    setLoading(true);
    
    // 1. Fetch Tickets with relations
    // We join 'users' twice! Once for customer (c), once for assigned employee (e)
    // Note: Supabase JS syntax for multiple joins on same table requires alias or careful syntax.
    // Simpler approach: Fetch users separately or rely on simple join if FK names are distinct.
    // Our FKs are 'customer_id' and 'assigned_to'.
    
    const { data: ticketData, error } = await supabase
      .from('tickets')
      .select(`
        *,
        customer:users!customer_id(full_name, mobile_number),
        assignee:users!assigned_to(full_name)
      `)
      .order('created_at', { ascending: false });

    if (error) console.error('Error fetching tickets:', error);
    else setTickets(ticketData || []);

    // 2. Fetch Employees (for dropdown)
    const { data: empData } = await supabase
      .from('users')
      .select('id, full_name')
      .eq('role', 'employee');
    
    setEmployees(empData || []);
    
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Update Handler
  const handleUpdateTicket = async (ticketId, updates) => {
    setActionLoading(true);
    const { error } = await supabase
      .from('tickets')
      .update({
        assigned_to: updates.assigned_to,
        status: updates.status,
        priority: updates.priority,
        updated_at: new Date().toISOString()
      })
      .eq('id', ticketId);

    if (error) {
      alert('Failed to update ticket: ' + error.message);
    } else {
      await fetchData(); // Refresh
    }
    setActionLoading(false);
  };

  // Filter Logic
  const filteredTickets = tickets.filter(t => 
    filterStatus === 'all' || t.status === filterStatus
  );

  const getStatusColor = (status) => {
    switch(status) {
      case 'open': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'in_progress': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'resolved': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'closed': return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (p) => {
    switch(p) {
      case 'critical': return 'text-red-600 font-bold';
      case 'high': return 'text-orange-500 font-semibold';
      case 'medium': return 'text-blue-500';
      default: return 'text-gray-500';
    }
  };

  return (
    <div className="p-4 sm:p-6 md:p-10">
      <div className="max-w-7xl mx-auto">
        
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Support Tickets</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">Manage customer complaints and service requests.</p>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-4 mb-2">
          {['all', 'open', 'in_progress', 'resolved', 'closed'].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-4 py-2 rounded-full text-sm font-medium capitalize whitespace-nowrap transition-colors ${
                filterStatus === status 
                  ? 'bg-indigo-600 text-white shadow-md' 
                  : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              {status.replace('_', ' ')}
            </button>
          ))}
        </div>

        {/* Tickets Grid */}
        <div className="grid grid-cols-1 gap-4">
          {loading ? (
             <div className="text-center py-10 text-gray-500">Loading tickets...</div>
          ) : filteredTickets.length === 0 ? (
             <div className="text-center py-10 text-gray-500 bg-white dark:bg-gray-800 rounded-lg shadow">No tickets found.</div>
          ) : (
            filteredTickets.map((ticket) => (
              <div key={ticket.id} className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow flex flex-col sm:flex-row justify-between gap-4">
                
                {/* Left: Info */}
                <div className="flex-grow">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium uppercase ${getStatusColor(ticket.status)}`}>
                      {ticket.status.replace('_', ' ')}
                    </span>
                    <span className={`text-xs uppercase flex items-center gap-1 ${getPriorityColor(ticket.priority)}`}>
                      <AlertTriangle size={12} /> {ticket.priority}
                    </span>
                    <span className="text-xs text-gray-400">• {new Date(ticket.created_at).toLocaleDateString()}</span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white">{ticket.subject}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mt-1 line-clamp-2">{ticket.description}</p>
                  
                  <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <User size={14}/> {ticket.customer?.full_name} ({ticket.customer?.mobile_number})
                    </span>
                  </div>
                </div>

                {/* Right: Assignment & Action */}
                <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 min-w-[150px] border-t sm:border-t-0 sm:border-l border-gray-100 dark:border-gray-700 pt-3 sm:pt-0 sm:pl-4">
                  <div className="text-right">
                    <p className="text-xs text-gray-400">Assigned To</p>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-200">
                      {ticket.assignee?.full_name || 'Unassigned'}
                    </p>
                  </div>
                  <button 
                    onClick={() => setSelectedTicket(ticket)}
                    className="px-3 py-1.5 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-300 rounded text-sm font-medium hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors"
                  >
                    Manage
                  </button>
                </div>

              </div>
            ))
          )}
        </div>

      </div>

      <UpdateTicketModal 
        isOpen={!!selectedTicket}
        onClose={() => setSelectedTicket(null)}
        ticket={selectedTicket}
        employees={employees}
        onUpdateTicket={handleUpdateTicket}
        loading={actionLoading}
      />
    </div>
  );
}