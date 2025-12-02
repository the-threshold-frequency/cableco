'use client';

import React, { useState, useEffect, Fragment } from 'react';
import { Plus, MoreVertical, Search, X, User, Mail, Lock, Edit, Trash2 } from 'lucide-react';
import { supabase } from "@/lib/supabaseClient";
import { Menu, Transition } from '@headlessui/react';

// --- MODAL COMPONENT ---
const AddEmployeeModal = ({ isOpen, onClose, onAddEmployee }) => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Call the onAddEmployee function (which is handleAddEmployee in the main component)
    const success = await onAddEmployee({ email, password, full_name: fullName });
    
    setIsLoading(false);
    if (success) {
      onClose(); // Close modal after successful submission
      setFullName('');
      setEmail('');
      setPassword('');
    } else {
      setError('Failed to create employee. The email may already be in use.');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md">
        <div className="p-6 border-b dark:border-gray-700 flex justify-between items-center">
          <h3 className="text-xl font-semibold text-gray-800 dark:text-white">Add New Employee</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-white">
            <X size={24} />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-4">
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400"/>
              <input type="text" placeholder="Full Name" value={fullName} onChange={(e) => setFullName(e.target.value)} required className="pl-10 w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400"/>
              <input type="email" placeholder="Email Address" value={email} onChange={(e) => setEmail(e.target.value)} required className="pl-10 w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400"/>
              <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} className="pl-10 w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
          </div>
          <div className="p-6 bg-gray-50 dark:bg-gray-800/50 border-t dark:border-gray-700 flex justify-end gap-3">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-md bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500 font-medium">Cancel</button>
            <button type="submit" className="px-4 py-2 rounded-md bg-indigo-600 text-white hover:bg-indigo-700 font-medium" disabled={isLoading}>
              {isLoading ? 'Adding...' : 'Add Employee'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// --- MAIN PAGE COMPONENT ---
export default function ManageEmployeesPage() {
  //const supabase = createBrowserClient();
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Fetch employees on load
  useEffect(() => {
    const fetchEmployees = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('role', 'employee');

      if (error) {
        console.error('Error fetching employees:', error);
      } else {
        setEmployees(data);
      }
      setLoading(false);
    };
    fetchEmployees();
  }, [supabase]);

  // Function to call the Edge Function
  const handleAddEmployee = async (employeeData) => {
    try {
      const { data, error } = await supabase.functions.invoke('create-employee', {
        body: JSON.stringify(employeeData),
      });

      if (error) throw error;

      // Add new employee to the local state
      setEmployees([data, ...employees]);
      return true; // Indicate success
    } catch (error) {
      console.error('Error creating employee:', error);
      return false; // Indicate failure
    }
  };
  
  // Function to delete an employee
  // NOTE: This only deletes from the 'users' table. 
  // You would need another Edge Function to delete from 'auth.users'.
  const handleDeleteEmployee = async (employeeId) => {
    if (window.confirm('Are you sure? This will delete the employee\'s profile. (Auth user will remain)')) {
        const { error } = await supabase
            .from('users')
            .delete()
            .eq('id', employeeId);
        
        if (error) {
            console.error('Error deleting employee:', error);
            alert('Failed to delete employee.');
        } else {
            setEmployees(employees.filter(emp => emp.id !== employeeId));
        }
    }
  };


  const filteredEmployees = employees.filter(emp =>
    emp.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <AddEmployeeModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onAddEmployee={handleAddEmployee}
      />
      <div className="p-4 sm:p-6 md:p-10">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Employee Management</h1>
              <p className="text-gray-500 dark:text-gray-400 mt-1">Add, view, and manage employee accounts.</p>
            </div>
            <button onClick={() => setIsModalOpen(true)} className="flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 transition-colors">
              <Plus size={20} />
              <span>Add New Employee</span>
            </button>
          </div>

          {/* Search Bar */}
          <div className="mb-6 flex flex-col sm:flex-row gap-4">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Employees Table */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50 dark:bg-gray-700/50">
                  <tr>
                    <th className="p-4 font-semibold text-gray-600 dark:text-gray-300">Name</th>
                    <th className="p-4 font-semibold text-gray-600 dark:text-gray-300">Email</th>
                    <th className="p-4 font-semibold text-gray-600 dark:text-gray-300">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {loading ? (
                    <tr>
                        <td colSpan="3" className="text-center p-8 text-gray-500 dark:text-gray-400">Loading employees...</td>
                    </tr>
                  ) : filteredEmployees.length === 0 ? (
                    <tr>
                        <td colSpan="3" className="text-center p-8 text-gray-500 dark:text-gray-400">No employees found.</td>
                    </tr>
                  ) : (
                    filteredEmployees.map((employee) => (
                        <tr key={employee.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                        <td className="p-4 whitespace-nowrap">
                            <span className="font-medium text-gray-800 dark:text-white">{employee.full_name}</span>
                        </td>
                        <td className="p-4 text-gray-500 dark:text-gray-400 whitespace-nowrap">{employee.email}</td>
                        <td className="p-4">
                            <Menu as="div" className="relative">
                                <Menu.Button className="p-2 text-gray-500 hover:text-gray-800 dark:hover:text-white rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
                                    <MoreVertical size={20} />
                                </Menu.Button>
                                <Transition
                                    as={Fragment}
                                    enter="transition ease-out duration-100"
                                    enterFrom="transform opacity-0 scale-95"
                                    enterTo="transform opacity-100 scale-100"
                                    leave="transition ease-in duration-75"
                                    leaveFrom="transform opacity-100 scale-100"
                                    leaveTo="transform opacity-0 scale-95"
                                >
                                    <Menu.Items className="absolute right-0 w-48 mt-2 origin-top-right bg-white dark:bg-gray-800 divide-y divide-gray-100 dark:divide-gray-700 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-10">
                                        <div className="px-1 py-1">
                                            <Menu.Item>
                                            {({ active }) => (
                                                <button
                                                className={`${
                                                    active ? 'bg-indigo-500 text-white' : 'text-gray-900 dark:text-gray-200'
                                                } group flex rounded-md items-center w-full px-2 py-2 text-sm`}
                                                >
                                                <Edit className="mr-2 h-5 w-5" />
                                                Edit
                                                </button>
                                            )}
                                            </Menu.Item>
                                            <Menu.Item>
                                            {({ active }) => (
                                                <button
                                                onClick={() => handleDeleteEmployee(employee.id)}
                                                className={`${
                                                    active ? 'bg-red-500 text-white' : 'text-red-600'
                                                } group flex rounded-md items-center w-full px-2 py-2 text-sm`}
                                                >
                                                <Trash2 className="mr-2 h-5 w-5" />
                                                Delete
                                                </button>
                                            )}
                                            </Menu.Item>
                                        </div>
                                    </Menu.Items>
                                </Transition>
                            </Menu>
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






