import { useState, useEffect, useCallback } from 'react';
import { 
  Users, 
  UserPlus, 
  Shield, 
  ShieldAlert, 
  UserCheck, 
  Search, 
  Trash2, 
  Edit,
  Edit3, 
  RefreshCw, 
  Eye, 
  EyeOff, 
  CheckCircle2, 
  AlertCircle, 
  X, 
  Lock, 
  Mail, 
  User as UserIcon,
  ShieldCheck,
  Filter
} from 'lucide-react';
import Pagination from '../../components/admin/Pagination';
import { useAuth } from '../../context/AuthContext';
import AgroLoader from '../../components/common/AgroLoader';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

interface ManagedUser {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'MODERATOR' | 'USER' | string;
  avatar?: string | null;
  createdAt: string;
  updatedAt: string;
}

interface UserStats {
  totalUsers: number;
  adminCount: number;
  moderatorCount: number;
  userCount: number;
}

export default function UserManagement() {
  const { user: currentUser } = useAuth();

  const [users, setUsers] = useState<ManagedUser[]>([]);
  const [stats, setStats] = useState<UserStats>({
    totalUsers: 0,
    adminCount: 0,
    moderatorCount: 0,
    userCount: 0,
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const pageSize = 12;

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<ManagedUser | null>(null);
  const [viewingUser, setViewingUser] = useState<ManagedUser | null>(null);

  // Form states
  const [addForm, setAddForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'USER',
  });
  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    role: 'USER',
    password: '',
  });

  const [showAddPassword, setShowAddPassword] = useState(false);
  const [showEditPassword, setShowEditPassword] = useState(false);

  // Notification state
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const showToast = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => {
      setNotification(null);
    }, 4000);
  };

  const getHeaders = () => {
    const token = localStorage.getItem('admin_token');
    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token || ''}`,
    };
  };

  // Fetch users with search and pagination
  const fetchUsers = useCallback(async (page = 1, search = searchQuery, role = roleFilter) => {
    setIsLoading(true);
    try {
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: pageSize.toString(),
        search: search.trim(),
        role: role,
      });

      const response = await fetch(`${API_BASE_URL}/users/admin/all?${queryParams.toString()}`, {
        headers: getHeaders(),
      });

      if (response.ok) {
        const data = await response.json();
        setUsers(data.data || []);
        if (data.stats) {
          setStats(data.stats);
        }
        if (data.meta) {
          setTotalPages(data.meta.totalPages || 1);
          setTotalItems(data.meta.total || 0);
        }
      } else {
        const err = await response.json().catch(() => ({}));
        showToast('error', err.error || 'Failed to fetch users');
      }
    } catch (error) {
      console.error('Fetch users error:', error);
      showToast('error', 'Error connecting to server.');
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery, roleFilter]);

  useEffect(() => {
    fetchUsers(currentPage, searchQuery, roleFilter);
  }, [currentPage, roleFilter, fetchUsers]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchUsers(1, searchQuery, roleFilter);
  };

  const handleRoleFilterChange = (newRole: string) => {
    setRoleFilter(newRole);
    setCurrentPage(1);
    fetchUsers(1, searchQuery, newRole);
  };

  // Open Add Modal
  const openAddUser = () => {
    setAddForm({
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      role: 'USER',
    });
    setShowAddPassword(false);
    setIsAddModalOpen(true);
  };

  // Create User Handler
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addForm.name.trim() || !addForm.email.trim() || !addForm.password) {
      showToast('error', 'Please fill in all mandatory fields.');
      return;
    }

    if (addForm.password.length < 6) {
      showToast('error', 'Password must be at least 6 characters.');
      return;
    }

    if (addForm.password !== addForm.confirmPassword) {
      showToast('error', 'Passwords do not match.');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(`${API_BASE_URL}/users/admin/create`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          name: addForm.name.trim(),
          email: addForm.email.trim(),
          password: addForm.password,
          role: addForm.role,
        }),
      });

      const resData = await response.json();

      if (response.ok) {
        showToast('success', 'User created successfully!');
        setIsAddModalOpen(false);
        fetchUsers(currentPage);
      } else {
        showToast('error', resData.error || 'Failed to create user.');
      }
    } catch (error) {
      console.error('Error creating user:', error);
      showToast('error', 'Network error during user creation.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Open Edit Modal
  const openEditUser = (user: ManagedUser) => {
    setSelectedUser(user);
    setEditForm({
      name: user.name,
      email: user.email,
      role: user.role,
      password: '',
    });
    setShowEditPassword(false);
    setIsEditModalOpen(true);
  };

  // Update User Handler
  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;

    if (!editForm.name.trim() || !editForm.email.trim()) {
      showToast('error', 'Name and Email are required.');
      return;
    }

    if (editForm.password && editForm.password.length < 6) {
      showToast('error', 'New password must be at least 6 characters.');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload: any = {
        name: editForm.name.trim(),
        email: editForm.email.trim(),
        role: editForm.role,
      };

      if (editForm.password.trim()) {
        payload.password = editForm.password.trim();
      }

      const response = await fetch(`${API_BASE_URL}/users/admin/${selectedUser.id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(payload),
      });

      const resData = await response.json();

      if (response.ok) {
        showToast('success', 'User role & details updated successfully!');
        setIsEditModalOpen(false);
        fetchUsers(currentPage);
      } else {
        showToast('error', resData.error || 'Failed to update user.');
      }
    } catch (error) {
      console.error('Error updating user:', error);
      showToast('error', 'Network error during user update.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Open Delete Confirmation Modal
  const openDeleteModal = (user: ManagedUser) => {
    if (currentUser && (currentUser.id === user.id || currentUser.email === user.email)) {
      showToast('error', 'You cannot delete your own logged-in admin account.');
      return;
    }
    setSelectedUser(user);
    setIsDeleteModalOpen(true);
  };

  // Delete User Handler
  const handleDeleteUser = async () => {
    if (!selectedUser) return;

    setIsSubmitting(true);
    try {
      const response = await fetch(`${API_BASE_URL}/users/admin/${selectedUser.id}`, {
        method: 'DELETE',
        headers: getHeaders(),
      });

      const resData = await response.json();

      if (response.ok) {
        showToast('success', 'User deleted successfully.');
        setIsDeleteModalOpen(false);
        fetchUsers(currentPage);
      } else {
        showToast('error', resData.error || 'Failed to delete user.');
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      showToast('error', 'Network error during deletion.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Badge rendering helper
  const renderRoleBadge = (role: string) => {
    switch (role?.toUpperCase()) {
      case 'ADMIN':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            ADMIN
          </span>
        );
      case 'MODERATOR':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
            MODERATOR
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            USER
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Toast Notification */}
      {notification && (
        <div 
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-xl transition-all duration-300 ${
            notification.type === 'success' 
              ? 'bg-emerald-900 text-emerald-100 border border-emerald-700' 
              : 'bg-rose-900 text-rose-100 border border-rose-700'
          }`}
        >
          {notification.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
          )}
          <span className="text-sm font-medium">{notification.message}</span>
          <button 
            onClick={() => setNotification(null)} 
            className="text-gray-300 hover:text-white ml-2"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-50 rounded-xl text-emerald-600 border border-emerald-100">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-800 font-inter">User Management</h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                පරිශීලක සහ භූමිකා කළමනාකරණය (Add users, change roles, and manage permissions)
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => fetchUsers(currentPage)}
            title="Refresh list"
            className="p-2.5 text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition border border-slate-200 flex items-center justify-center"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-emerald-600' : ''}`} />
          </button>
          <button
            onClick={openAddUser}
            className="flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-medium px-4 py-2.5 rounded-xl shadow-sm transition active:scale-[0.98]"
          >
            <UserPlus className="w-4 h-4" />
            <span>Add New User</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Users */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Users</p>
            <h3 className="text-2xl font-bold text-slate-800 mt-1">{stats.totalUsers}</h3>
            <p className="text-xs text-slate-500 mt-0.5">මුළු ලියාපදිංචි පරිශීලකයින්</p>
          </div>
          <div className="p-3 bg-slate-100 text-slate-700 rounded-xl">
            <Users className="w-6 h-6" />
          </div>
        </div>

        {/* Administrators */}
        <div className="bg-white p-5 rounded-2xl border border-rose-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-rose-600">Administrators</p>
            <h3 className="text-2xl font-bold text-slate-800 mt-1">{stats.adminCount}</h3>
            <p className="text-xs text-slate-500 mt-0.5">පරිපාලකවරු (Full Access)</p>
          </div>
          <div className="p-3 bg-rose-50 text-rose-600 rounded-xl border border-rose-100">
            <Shield className="w-6 h-6" />
          </div>
        </div>

        {/* Moderators / Staff */}
        <div className="bg-white p-5 rounded-2xl border border-indigo-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-indigo-600">Moderators / Staff</p>
            <h3 className="text-2xl font-bold text-slate-800 mt-1">{stats.moderatorCount}</h3>
            <p className="text-xs text-slate-500 mt-0.5">කළමනාකරුවන්</p>
          </div>
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl border border-indigo-100">
            <ShieldAlert className="w-6 h-6" />
          </div>
        </div>

        {/* Standard Users */}
        <div className="bg-white p-5 rounded-2xl border border-emerald-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-emerald-600">Standard Users</p>
            <h3 className="text-2xl font-bold text-slate-800 mt-1">{stats.userCount}</h3>
            <p className="text-xs text-slate-500 mt-0.5">සාමාන්‍ය පරිශීලකයින්</p>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-100">
            <UserCheck className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Filter and Search Controls */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search Bar */}
        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by name or email address..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-20 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
          />
          <button
            type="submit"
            className="absolute right-1.5 top-1/2 -translate-y-1/2 px-2.5 py-1 text-xs bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition"
          >
            Search
          </button>
        </form>

        {/* Role Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          <span className="text-xs text-slate-400 font-medium flex items-center gap-1 mr-1">
            <Filter className="w-3.5 h-3.5" /> Filter:
          </span>
          {[
            { id: 'ALL', label: 'All Roles' },
            { id: 'ADMIN', label: 'Admins' },
            { id: 'MODERATOR', label: 'Moderators' },
            { id: 'USER', label: 'Users' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleRoleFilterChange(tab.id)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition ${
                roleFilter === tab.id
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Users Table Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50/90 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500 whitespace-nowrap">
              <tr>
                <th className="px-3 py-2">User / Profile</th>
                <th className="px-3 py-2">Email Address</th>
                <th className="px-3 py-2">User Role</th>
                <th className="px-3 py-2">Created Date</th>
                <th className="px-3 py-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="py-16 text-center text-slate-400">
                    <div className="flex justify-center items-center">
                      <AgroLoader message="Loading users data..." />
                    </div>
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-16 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Users className="w-12 h-12 text-slate-300" />
                      <p className="text-base font-semibold text-slate-700">No users found</p>
                      <p className="text-xs text-slate-400">Try changing your search query or filter criteria.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                users.map((user) => {
                  const isCurrent = Boolean(currentUser && (currentUser.id === user.id || currentUser.email === user.email));
                  const initial = user.name ? user.name.charAt(0).toUpperCase() : 'U';

                  return (
                    <tr key={user.id} className="hover:bg-slate-50/70 transition-colors">
                      {/* Name & Avatar */}
                      <td className="px-3 py-1.5 whitespace-nowrap">
                        <div className="flex items-center gap-2 max-w-xs">
                          <div className="w-6 h-6 rounded bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shadow-2xs shrink-0">
                            {initial}
                          </div>
                          <span className="font-semibold text-slate-800 truncate" title={user.name}>{user.name}</span>
                          {isCurrent && (
                            <span className="px-1 py-0.2 text-[9px] font-bold bg-amber-100 text-amber-800 rounded">
                              YOU
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Email */}
                      <td className="px-3 py-1.5 whitespace-nowrap text-slate-600">
                        <span className="truncate max-w-[200px] inline-block" title={user.email}>{user.email}</span>
                      </td>

                      {/* Role */}
                      <td className="px-3 py-1.5 whitespace-nowrap">
                        {renderRoleBadge(user.role)}
                      </td>

                      {/* Created Date */}
                      <td className="px-3 py-1.5 whitespace-nowrap text-slate-500">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>

                      {/* Actions */}
                      <td className="px-3 py-1.5 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => setViewingUser(user)}
                            className="p-1 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded transition-colors cursor-pointer"
                            title="View User Details"
                          >
                            <Eye size={15} />
                          </button>

                          <button
                            onClick={() => openEditUser(user)}
                            className="p-1 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors cursor-pointer"
                            title="Edit User & Role"
                          >
                            <Edit size={15} />
                          </button>

                          <button
                            onClick={() => openDeleteModal(user)}
                            disabled={isCurrent}
                            className={`p-1 rounded transition-colors cursor-pointer ${
                              isCurrent
                                ? 'text-slate-300 cursor-not-allowed'
                                : 'text-slate-500 hover:text-rose-600 hover:bg-rose-50'
                            }`}
                            title={isCurrent ? "You cannot delete your own logged-in account" : "Delete User"}
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={(page) => setCurrentPage(page)}
          totalItems={totalItems}
          pageSize={pageSize}
        />
      </div>

      {/* ================= MODAL: ADD NEW USER ================= */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-100 overflow-hidden transform transition-all">
            <div className="bg-gradient-to-r from-emerald-600 to-teal-700 p-6 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/10 rounded-xl">
                  <UserPlus className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold">Add New User</h3>
                  <p className="text-xs text-emerald-100">නව පරිශීලකයෙකු එක් කරන්න</p>
                </div>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="p-6 space-y-4">
              {/* Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Full Name (සම්පූර්ණ නම) <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Kasun Bandara"
                    value={addForm.name}
                    onChange={(e) => setAddForm({ ...addForm, name: e.target.value })}
                    className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Email Address (විද්‍යුත් තැපෑල) <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    placeholder="user@example.com"
                    value={addForm.email}
                    onChange={(e) => setAddForm({ ...addForm, email: e.target.value })}
                    className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Role Selection */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Assign User Role (භූමිකාව) <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <ShieldCheck className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <select
                    value={addForm.role}
                    onChange={(e) => setAddForm({ ...addForm, role: e.target.value })}
                    className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-medium"
                  >
                    <option value="USER">USER - Normal Web User (සාමාන්‍ය පරිශීලක)</option>
                    <option value="MODERATOR">MODERATOR - Content / Staff Manager (කළමනාකරු)</option>
                    <option value="ADMIN">ADMIN - Full System Administrator (පරිපාලක)</option>
                  </select>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  {addForm.role === 'ADMIN' && '⚠️ Admin role provides full unrestricted access to the administration dashboard.'}
                  {addForm.role === 'MODERATOR' && 'ℹ️ Moderator role allows managing courses, products, and articles.'}
                  {addForm.role === 'USER' && 'ℹ️ Standard client user with public site & portal permissions.'}
                </p>
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Password (මුරපදය) <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type={showAddPassword ? 'text' : 'password'}
                    required
                    placeholder="At least 6 characters"
                    value={addForm.password}
                    onChange={(e) => setAddForm({ ...addForm, password: e.target.value })}
                    className="w-full pl-9 pr-10 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowAddPassword(!showAddPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showAddPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Confirm Password (මුරපදය තහවුරු කරන්න) <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type={showAddPassword ? 'text' : 'password'}
                    required
                    placeholder="Repeat the password"
                    value={addForm.confirmPassword}
                    onChange={(e) => setAddForm({ ...addForm, confirmPassword: e.target.value })}
                    className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 mt-6">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 text-sm font-medium bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-sm transition flex items-center gap-2 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Creating...</span>
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4" />
                      <span>Create User</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: EDIT USER & ROLE ================= */}
      {isEditModalOpen && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-100 overflow-hidden transform transition-all">
            <div className="bg-gradient-to-r from-slate-900 to-slate-800 p-6 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/10 rounded-xl">
                  <Edit3 className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <h3 className="text-lg font-bold">Edit User & Role</h3>
                  <p className="text-xs text-slate-300">පරිශීලක තොරතුරු සහ භූමිකාව වෙනස් කරන්න</p>
                </div>
              </div>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateUser} className="p-6 space-y-4">
              {/* Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Full Name (නම) <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Email Address (විද්‍යුත් තැපෑල) <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={editForm.email}
                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                    className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Change Role */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  User Role (පරිශීලක භූමිකාව වෙනස් කරන්න) <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <ShieldCheck className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <select
                    value={editForm.role}
                    onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                    className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-semibold text-slate-800"
                  >
                    <option value="ADMIN">ADMIN - Full Administrator (පරිපාලක)</option>
                    <option value="MODERATOR">MODERATOR - Staff / Manager (කළමනාකරු)</option>
                    <option value="USER">USER - Standard User (සාමාන්‍ය පරිශීලක)</option>
                  </select>
                </div>
              </div>

              {/* Optional Reset Password */}
              <div className="pt-2 border-t border-slate-100">
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  New Password (නව මුරපදය - Optional)
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type={showEditPassword ? 'text' : 'password'}
                    placeholder="Leave blank to keep current password"
                    value={editForm.password}
                    onChange={(e) => setEditForm({ ...editForm, password: e.target.value })}
                    className="w-full pl-9 pr-10 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowEditPassword(!showEditPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showEditPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Only enter a password if you want to reset this user&apos;s password.
                </p>
              </div>

              {/* Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 mt-6">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 text-sm font-medium bg-slate-900 hover:bg-black text-white rounded-xl shadow-sm transition flex items-center gap-2 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>Save Changes</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: DELETE CONFIRMATION ================= */}
      {isDeleteModalOpen && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-100 overflow-hidden transform transition-all p-6 space-y-4">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-rose-100 text-rose-600 rounded-2xl shrink-0">
                <AlertCircle className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">Delete User Account</h3>
                <p className="text-xs text-slate-500">පරිශීලක ගිණුම ස්ථිරවම ඉවත් කිරීම</p>
              </div>
            </div>

            <div className="bg-rose-50/70 border border-rose-100 rounded-2xl p-4 text-xs text-rose-800 space-y-1.5">
              <p className="font-semibold text-rose-900">Are you sure you want to delete this user?</p>
              <p>
                <span className="font-bold">{selectedUser.name}</span> ({selectedUser.email}) - {selectedUser.role}
              </p>
              <p className="text-rose-600">This action is permanent and cannot be undone.</p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsDeleteModalOpen(false)}
                disabled={isSubmitting}
                className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteUser}
                disabled={isSubmitting}
                className="px-5 py-2 text-sm font-medium bg-rose-600 hover:bg-rose-700 text-white rounded-xl shadow-sm transition flex items-center gap-2 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Deleting...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    <span>Confirm Delete</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: VIEW USER DETAILS ================= */}
      {viewingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setViewingUser(null)} />
          <div className="bg-white rounded-2xl w-full max-w-lg relative z-10 shadow-2xl max-h-[90vh] flex flex-col overflow-hidden">
            <div className="flex items-center justify-between p-5 border-b border-gray-100 bg-gray-50/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-base shadow-sm">
                  {viewingUser.name ? viewingUser.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-base">{viewingUser.name}</h3>
                  <p className="text-xs text-gray-500">{viewingUser.email}</p>
                </div>
              </div>
              <button 
                onClick={() => setViewingUser(null)} 
                className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100">
                <span className="text-xs font-semibold text-gray-500">User Role</span>
                <div>{renderRoleBadge(viewingUser.role)}</div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-slate-400 block mb-0.5">Account ID</span>
                  <span className="font-mono text-slate-700 select-all break-all">{viewingUser.id}</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-slate-400 block mb-0.5">Session Status</span>
                  <span className="font-semibold text-slate-800">
                    {currentUser && (currentUser.id === viewingUser.id || currentUser.email === viewingUser.email) ? (
                      <span className="text-amber-600 font-bold">Current Active Session</span>
                    ) : (
                      <span className="text-emerald-600">Active</span>
                    )}
                  </span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-slate-400 block mb-0.5">Created Date</span>
                  <span className="font-medium text-slate-800">{new Date(viewingUser.createdAt).toLocaleString()}</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-slate-400 block mb-0.5">Last Updated</span>
                  <span className="font-medium text-slate-800">{new Date(viewingUser.updatedAt).toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-gray-100 bg-gray-50 flex items-center justify-end gap-2">
              <button 
                onClick={() => {
                  const u = viewingUser;
                  setViewingUser(null);
                  openEditUser(u);
                }} 
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-medium transition cursor-pointer flex items-center gap-1.5"
              >
                <Edit size={13} />
                Edit User
              </button>
              <button 
                onClick={() => setViewingUser(null)} 
                className="px-4 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-100 text-xs font-medium transition cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
