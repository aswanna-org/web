import { useState, useEffect, useCallback } from 'react';
import {
  Plus,
  Search,
  Eye,
  Edit,
  Trash2,
  Briefcase,
  CheckCircle2,
  Clock,
  XCircle,
  RefreshCw,
  Calendar,
  Check,
  X,
  Building2
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useConfirm } from '../../admin/components/ConfirmDialog';
import UserJobModal, { type UserJobItem } from '../components/UserJobModal';
import UserJobViewModal from '../components/UserJobViewModal';

export const UserJobManagement = () => {
  const { user, token } = useAuth();
  const { confirm } = useConfirm();
  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  const [jobs, setJobs] = useState<UserJobItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'APPROVED' | 'PENDING' | 'REJECTED'>('all');

  // Modals
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState<UserJobItem | null>(null);

  // Lookups
  const [categories, setCategories] = useState<{ id: string; name: string; sinhalaName?: string }[]>([]);
  const [institutions, setInstitutions] = useState<{ id: string; name: string }[]>([]);

  const fetchLookups = useCallback(async () => {
    try {
      const [catRes, instRes] = await Promise.all([
        fetch(`${API_BASE_URL}/careers/categories`),
        fetch(`${API_BASE_URL}/careers/institutions`)
      ]);
      if (catRes.ok) {
        const catJson = await catRes.json();
        setCategories(catJson.data || []);
      }
      if (instRes.ok) {
        const instJson = await instRes.json();
        setInstitutions(instJson.data || []);
      }
    } catch (err) {
      console.error('Error fetching job lookups:', err);
    }
  }, [API_BASE_URL]);

  const fetchJobs = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const params = new URLSearchParams({
        userId: user.id,
        limit: '100'
      });
      if (search.trim()) params.append('search', search.trim());

      const res = await fetch(`${API_BASE_URL}/careers/jobs?${params.toString()}`, {
        headers: (token ? { Authorization: `Bearer ${token}` } : {}) as HeadersInit
      });
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setJobs(json.data);
      } else {
        setJobs([]);
      }
    } catch (err) {
      console.error('Error fetching user jobs:', err);
      setJobs([]);
    } finally {
      setLoading(false);
    }
  }, [API_BASE_URL, user?.id, token, search]);

  useEffect(() => {
    fetchLookups();
  }, [fetchLookups]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  const handleDelete = async (id: string, designation: string) => {
    const confirmed = await confirm({
      title: 'Delete Job Post',
      subtitle: 'මෙම රැකියා ඇබෑර්තු දැන්වීම ස්ථිරවම ඉවත් කිරීමට ඔබට අවශ්‍යද?',
      message: `Are you sure you want to delete "${designation}"? This action cannot be undone.`,
      confirmText: 'Yes, Delete',
      cancelText: 'Cancel',
      type: 'danger'
    });

    if (!confirmed) return;

    try {
      const res = await fetch(`${API_BASE_URL}/careers/jobs/${id}`, {
        method: 'DELETE',
        headers: (token ? { Authorization: `Bearer ${token}` } : {}) as HeadersInit
      });
      if (res.ok) {
        fetchJobs();
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to delete job post.');
      }
    } catch (err) {
      console.error('Delete error:', err);
      alert('Network error while deleting job post.');
    }
  };

  const handleToggleStatus = async (id: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/careers/jobs/${id}/status`, {
        method: 'PATCH',
        headers: (token ? { Authorization: `Bearer ${token}` } : {}) as HeadersInit
      });
      if (res.ok) {
        fetchJobs();
      }
    } catch (err) {
      console.error('Toggle status error:', err);
    }
  };

  const filteredJobs = jobs.filter((j) => {
    if (statusFilter !== 'all' && j.approvalStatus !== statusFilter) return false;
    return true;
  });

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 sm:p-5 rounded-2xl border border-gray-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-blue-50 text-blue-700 rounded-xl">
              <Briefcase size={20} />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-gray-900 leading-tight">My Job Postings</h2>
              <p className="text-xs text-gray-500">ඔබ විසින් පළ කරන ලද කෘෂි රැකියා ඇබෑර්තු දැන්වීම්</p>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            setSelectedJob(null);
            setIsFormOpen(true);
          }}
          className="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl transition shadow-xs cursor-pointer"
        >
          <Plus size={15} />
          <span>Post a New Job</span>
        </button>
      </div>

      {/* Filters & Search */}
      <div className="bg-white p-3 sm:p-4 rounded-xl border border-gray-200/80 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by designation, category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto justify-end overflow-x-auto">
          <button
            type="button"
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1 text-xs rounded-lg font-medium transition cursor-pointer whitespace-nowrap ${
              statusFilter === 'all'
                ? 'bg-gray-900 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            All ({jobs.length})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('APPROVED')}
            className={`px-3 py-1 text-xs rounded-lg font-medium transition cursor-pointer whitespace-nowrap ${
              statusFilter === 'APPROVED'
                ? 'bg-emerald-600 text-white'
                : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
            }`}
          >
            Approved ({jobs.filter((j) => j.approvalStatus === 'APPROVED').length})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('PENDING')}
            className={`px-3 py-1 text-xs rounded-lg font-medium transition cursor-pointer whitespace-nowrap ${
              statusFilter === 'PENDING'
                ? 'bg-amber-600 text-white'
                : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
            }`}
          >
            Pending ({jobs.filter((j) => j.approvalStatus === 'PENDING').length})
          </button>
        </div>
      </div>

      {/* Mobile Card View (Completely responsive for mobile - Compact) */}
      <div className="block md:hidden space-y-2.5">
        {loading ? (
          <div className="bg-white p-6 rounded-xl border border-gray-200 text-center text-xs text-gray-500">
            <RefreshCw size={16} className="animate-spin text-blue-600 mx-auto mb-1.5" />
            <span>Loading job postings...</span>
          </div>
        ) : filteredJobs.length === 0 ? (
          <div className="bg-white p-6 rounded-xl border border-gray-200 text-center text-xs text-gray-400">
            <Briefcase size={32} className="mx-auto mb-1.5 text-gray-300" />
            <p className="font-semibold text-gray-700 text-xs">No job postings found</p>
            <p className="text-[11px] text-gray-400 mt-0.5">Tap "+ Post a New Job" to list your first vacancy.</p>
          </div>
        ) : (
          filteredJobs.map((job) => {
            const deadline = job.applicationInfo?.applicationDeadline;
            const employer = job.companyName || job.institution?.name;

            return (
              <div key={job.id} className="bg-white rounded-xl border border-gray-200/90 shadow-2xs p-2.5 space-y-2">
                {/* Card Top: Icon + Designation + Approval Badge */}
                <div className="flex items-start gap-2 justify-between">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-700 border border-blue-100 flex items-center justify-center shrink-0">
                      <Briefcase size={16} />
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-bold text-xs text-gray-900 truncate">
                        {job.designation}
                      </h4>
                      <div className="flex items-center gap-1 mt-0.5">
                        <span className="px-1 py-0.2 rounded text-[9px] font-semibold bg-blue-50 text-blue-700 border border-blue-200/60 truncate">
                          {job.jobCategory?.name || 'Category'}
                        </span>
                        {job.jobNature && (
                          <span className="px-1 py-0.2 rounded text-[9px] font-medium bg-gray-100 text-gray-600 capitalize truncate">
                            {job.jobNature.toLowerCase().replace(/_/g, ' ')}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Approval Status Badge */}
                  <div className="shrink-0">
                    {job.approvalStatus === 'APPROVED' ? (
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-semibold bg-emerald-100 text-emerald-800">
                        <CheckCircle2 size={10} />
                        <span>Approved</span>
                      </span>
                    ) : job.approvalStatus === 'REJECTED' ? (
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-semibold bg-rose-100 text-rose-800">
                        <XCircle size={10} />
                        <span>Rejected</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-semibold bg-amber-100 text-amber-800">
                        <Clock size={10} />
                        <span>Pending</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Details Row: Employer, Deadline, Active State */}
                <div className="grid grid-cols-2 gap-1.5 pt-1.5 border-t border-gray-100 text-[10px]">
                  <div className="flex items-center gap-1 text-gray-600 truncate">
                    <Building2 size={11} className="text-gray-400 shrink-0" />
                    <span className="truncate">{employer || 'Company / Inst. N/A'}</span>
                  </div>
                  <div className="flex items-center justify-end">
                    <button
                      type="button"
                      onClick={() => handleToggleStatus(job.id)}
                      className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[9px] font-semibold transition cursor-pointer ${
                        job.isActive
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-gray-100 text-gray-500 border border-gray-200'
                      }`}
                    >
                      {job.isActive ? <Check size={9} /> : <X size={9} />}
                      <span>{job.isActive ? 'Active' : 'Closed'}</span>
                    </button>
                  </div>
                  <div className="col-span-2 flex items-center gap-1 text-gray-500">
                    <Calendar size={11} className="text-gray-400 shrink-0" />
                    <span>
                      Deadline:{' '}
                      <span className="font-medium text-gray-700">
                        {deadline ? new Date(deadline).toLocaleDateString() : 'Open / Unspecified'}
                      </span>
                    </span>
                  </div>
                </div>

                {/* Action Buttons Row */}
                <div className="flex items-center gap-1.5 pt-1.5 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedJob(job);
                      setIsViewOpen(true);
                    }}
                    className="flex-1 py-1 px-2 bg-gray-50 hover:bg-gray-100 text-gray-700 text-[11px] font-semibold rounded-lg border border-gray-200 flex items-center justify-center gap-1 transition cursor-pointer"
                  >
                    <Eye size={12} className="text-gray-500" />
                    <span>View</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedJob(job);
                      setIsFormOpen(true);
                    }}
                    className="flex-1 py-1 px-2 bg-blue-50 hover:bg-blue-100 text-blue-700 text-[11px] font-semibold rounded-lg border border-blue-200/60 flex items-center justify-center gap-1 transition cursor-pointer"
                  >
                    <Edit size={12} className="text-blue-600" />
                    <span>Edit</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(job.id, job.designation)}
                    className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg border border-rose-200/60 transition cursor-pointer"
                    title="Delete Job Post"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Ultra-compact Data Table (Desktop md+) */}
      <div className="hidden md:block bg-white rounded-xl border border-gray-200/80 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[850px] text-left text-xs text-gray-700 border-collapse">
            <thead>
              <tr className="bg-gray-50/90 border-b border-gray-200">
                <th className="px-3 py-2 text-[11px] uppercase font-bold text-gray-500 whitespace-nowrap">
                  Designation / Post
                </th>
                <th className="px-3 py-2 text-[11px] uppercase font-bold text-gray-500 whitespace-nowrap">
                  Category
                </th>
                <th className="px-3 py-2 text-[11px] uppercase font-bold text-gray-500 whitespace-nowrap">
                  Employer / Company
                </th>
                <th className="px-3 py-2 text-[11px] uppercase font-bold text-gray-500 whitespace-nowrap">
                  Nature
                </th>
                <th className="px-3 py-2 text-[11px] uppercase font-bold text-gray-500 whitespace-nowrap">
                  Deadline
                </th>
                <th className="px-3 py-2 text-[11px] uppercase font-bold text-gray-500 whitespace-nowrap text-center">
                  Approval
                </th>
                <th className="px-3 py-2 text-[11px] uppercase font-bold text-gray-500 whitespace-nowrap text-center">
                  Active
                </th>
                <th className="px-3 py-2 text-[11px] uppercase font-bold text-gray-500 whitespace-nowrap text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-3 py-10 text-center text-xs text-gray-400">
                    <div className="inline-flex items-center gap-2">
                      <RefreshCw size={14} className="animate-spin text-emerald-600" />
                      <span>Loading job postings...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredJobs.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-3 py-12 text-center text-xs text-gray-400">
                    <Briefcase size={32} className="mx-auto mb-2 text-gray-300" />
                    <p className="font-semibold text-gray-600">No job postings found</p>
                    <p className="text-[11px] text-gray-400 mt-0.5">Click "Post a New Job" to list your first vacancy.</p>
                  </td>
                </tr>
              ) : (
                filteredJobs.map((job) => {
                  const deadline = job.applicationInfo?.applicationDeadline;

                  return (
                    <tr key={job.id} className="hover:bg-gray-50/70 transition-colors">
                      {/* 1. Designation */}
                      <td className="px-3 py-1.5 whitespace-nowrap">
                        <div className="flex items-center gap-2 max-w-xs">
                          <div className="w-7 h-7 rounded bg-blue-50 text-blue-700 border border-blue-200 flex items-center justify-center shrink-0">
                            <Briefcase size={13} />
                          </div>
                          <div className="overflow-hidden min-w-0">
                            <span className="font-semibold text-gray-900 truncate text-xs block" title={job.designation}>
                              {job.designation}
                            </span>
                            <span className="text-[10px] text-gray-400 truncate block">
                              {job.designationSi || ''}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* 2. Category */}
                      <td className="px-3 py-1.5 whitespace-nowrap text-gray-600 text-[11px]">
                        {job.jobCategory?.name || '—'}
                      </td>

                      {/* 3. Company */}
                      <td className="px-3 py-1.5 whitespace-nowrap text-gray-800 text-[11px] font-medium">
                        {job.companyName || job.institution?.name || 'Private Employer'}
                      </td>

                      {/* 4. Nature */}
                      <td className="px-3 py-1.5 whitespace-nowrap">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-gray-100 text-gray-700">
                          {job.jobNature || 'Full-Time'}
                        </span>
                      </td>

                      {/* 5. Deadline */}
                      <td className="px-3 py-1.5 whitespace-nowrap text-gray-600 text-[11px]">
                        {deadline ? (
                          <div className="flex items-center gap-1">
                            <Calendar size={11} className="text-gray-400" />
                            <span>{new Date(deadline).toLocaleDateString()}</span>
                          </div>
                        ) : (
                          'Open until filled'
                        )}
                      </td>

                      {/* 6. Approval */}
                      <td className="px-3 py-1.5 text-center whitespace-nowrap">
                        {job.approvalStatus === 'APPROVED' ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800">
                            <CheckCircle2 size={11} />
                            <span>Approved</span>
                          </span>
                        ) : job.approvalStatus === 'REJECTED' ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-100 text-rose-800">
                            <XCircle size={11} />
                            <span>Rejected</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-100 text-amber-800">
                            <Clock size={11} />
                            <span>Pending</span>
                          </span>
                        )}
                      </td>

                      {/* 7. Active State */}
                      <td className="px-3 py-1.5 text-center whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(job.id)}
                          title={job.isActive ? 'Click to deactivate' : 'Click to activate'}
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold transition cursor-pointer ${
                            job.isActive
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-gray-100 text-gray-500 border border-gray-200'
                          }`}
                        >
                          {job.isActive ? <Check size={10} /> : <X size={10} />}
                          <span>{job.isActive ? 'Active' : 'Hidden'}</span>
                        </button>
                      </td>

                      {/* 8. Actions */}
                      <td className="px-3 py-1.5 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedJob(job);
                              setIsViewOpen(true);
                            }}
                            title="View Job Details"
                            className="p-1 hover:bg-emerald-50 text-gray-500 hover:text-emerald-700 rounded transition-colors cursor-pointer"
                          >
                            <Eye size={14} />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedJob(job);
                              setIsFormOpen(true);
                            }}
                            title="Edit Job Post"
                            className="p-1 hover:bg-blue-50 text-gray-500 hover:text-blue-700 rounded transition-colors cursor-pointer"
                          >
                            <Edit size={14} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(job.id, job.designation)}
                            title="Delete Job Post"
                            className="p-1 hover:bg-rose-50 text-gray-500 hover:text-rose-700 rounded transition-colors cursor-pointer"
                          >
                            <Trash2 size={14} />
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
      </div>

      {/* Modals */}
      {isFormOpen && (
        <UserJobModal
          isOpen={isFormOpen}
          onClose={() => setIsFormOpen(false)}
          onSuccess={() => {
            setIsFormOpen(false);
            fetchJobs();
          }}
          jobToEdit={selectedJob}
          categories={categories}
          institutions={institutions}
        />
      )}

      {isViewOpen && (
        <UserJobViewModal
          isOpen={isViewOpen}
          onClose={() => setIsViewOpen(false)}
          job={selectedJob}
        />
      )}
    </div>
  );
};

export default UserJobManagement;

