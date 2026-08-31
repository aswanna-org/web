import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, X, AlertCircle, Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import RichTextEditor from '../components/RichTextEditor';

interface JobOpening {
  id: string;
  title: string;
  sinhalaTitle: string | null;
  description: string;
  sinhalaDescription: string | null;
  location: string | null;
  sinhalaLocation: string | null;
  isActive: boolean;
  createdAt: string;
  _count?: {
    applications: number;
  };
}

const CareerManagement = () => {
  const [jobs, setJobs] = useState<JobOpening[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentJob, setCurrentJob] = useState<Partial<JobOpening>>({});
  const [activeTab, setActiveTab] = useState<'EN' | 'SI'>('EN');
  const [isSaving, setIsSaving] = useState(false);

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [jobToDelete, setJobToDelete] = useState<JobOpening | null>(null);

  const { token } = useAuth();
  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${API_BASE_URL}/careers/openings?limit=100`);
      if (!response.ok) throw new Error('Failed to fetch jobs');
      const data = await response.json();
      setJobs(data.data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenAddModal = () => {
    setCurrentJob({
      title: '',
      sinhalaTitle: '',
      description: '',
      sinhalaDescription: '',
      location: '',
      sinhalaLocation: '',
      isActive: true
    });
    setIsEditMode(false);
    setActiveTab('EN');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (job: JobOpening) => {
    setCurrentJob(job);
    setIsEditMode(true);
    setActiveTab('EN');
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentJob({});
  };

  const handleDescriptionChange = (val: string) => {
    if (currentJob.description !== val) {
      setCurrentJob(prev => ({ ...prev, description: val }));
    }
  };

  const handleSinhalaDescriptionChange = (val: string) => {
    if (currentJob.sinhalaDescription !== val) {
      setCurrentJob(prev => ({ ...prev, sinhalaDescription: val }));
    }
  };

  const handleSaveJob = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentJob.title || !currentJob.description) {
      alert("Title and description are required.");
      return;
    }

    setIsSaving(true);
    try {
      const url = isEditMode
        ? `${API_BASE_URL}/careers/openings/${currentJob.id}`
        : `${API_BASE_URL}/careers/openings`;

      const method = isEditMode ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        },
        body: JSON.stringify(currentJob),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save job');
      }

      fetchJobs();
      handleCloseModal();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const confirmDelete = (job: JobOpening) => {
    setJobToDelete(job);
    setIsDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!jobToDelete) return;
    try {
      const response = await fetch(`${API_BASE_URL}/careers/openings/${jobToDelete.id}`, {
        method: 'DELETE',
        headers: {
          ...(token && { 'Authorization': `Bearer ${token}` })
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete job');
      }

      fetchJobs();
      setIsDeleteDialogOpen(false);
      setJobToDelete(null);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const toggleJobStatus = async (job: JobOpening) => {
    try {
      const response = await fetch(`${API_BASE_URL}/careers/openings/${job.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        },
        body: JSON.stringify({ ...job, isActive: !job.isActive }),
      });

      if (!response.ok) throw new Error('Failed to update status');
      fetchJobs();
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-6 w-full mx-auto pb-10">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Career Management</h1>
          <p className="mt-1 text-sm text-gray-500">Manage job postings and review submissions.</p>
        </div>
        <button
          onClick={handleOpenAddModal}
          className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2.5 rounded-lg font-medium transition-colors"
        >
          <Plus size={18} />
          Post New Job
        </button>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg flex items-center gap-2">
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Location</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-gray-500">Loading jobs...</td>
                </tr>
              ) : jobs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-gray-500">No jobs posted yet.</td>
                </tr>
              ) : (
                jobs.map((job) => (
                  <tr key={job.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{job.title}</div>
                      {job.sinhalaTitle && <div className="text-xs text-gray-500">{job.sinhalaTitle}</div>}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {job.location || 'Anywhere'}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => toggleJobStatus(job)}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                          job.isActive 
                            ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                            : 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                        }`}
                        title={job.isActive ? "Click to disable" : "Click to approve/enable"}
                      >
                        {job.isActive ? <CheckCircle2 size={12} /> : <AlertCircle size={12} />}
                        {job.isActive ? 'Active' : 'Pending Review'}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(job.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right text-sm font-medium">
                      <button
                        onClick={() => handleOpenEditModal(job)}
                        className="text-blue-600 hover:text-blue-900 mr-4"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => confirmDelete(job)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-5xl max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                {isEditMode ? 'Edit Job' : 'Post New Job'}
              </h2>
              <button onClick={handleCloseModal} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveJob} className="p-6 overflow-y-auto flex-1">
              <div className="flex border-b border-gray-200 mb-6">
                <button
                  type="button"
                  onClick={() => setActiveTab('EN')}
                  className={`py-2 px-4 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === 'EN'
                      ? 'border-green-500 text-green-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  English Details
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('SI')}
                  className={`py-2 px-4 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === 'SI'
                      ? 'border-green-500 text-green-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  සිංහල Details (Sinhala)
                </button>
              </div>

              <div className={activeTab === 'EN' ? 'space-y-6 block' : 'hidden'}>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Job Title *</label>
                  <input
                    type="text"
                    required
                    value={currentJob.title || ''}
                    onChange={(e) => setCurrentJob({ ...currentJob, title: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                  <input
                    type="text"
                    value={currentJob.location || ''}
                    onChange={(e) => setCurrentJob({ ...currentJob, location: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-green-500 focus:border-green-500"
                    placeholder="e.g. Colombo, Sri Lanka"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Job Description *</label>
                  <RichTextEditor
                    value={currentJob.description || ''}
                    onChange={handleDescriptionChange}
                  />
                </div>
              </div>

              <div className={activeTab === 'SI' ? 'space-y-6 block' : 'hidden'}>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Job Title (Sinhala)</label>
                  <input
                    type="text"
                    value={currentJob.sinhalaTitle || ''}
                    onChange={(e) => setCurrentJob({ ...currentJob, sinhalaTitle: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Location (Sinhala)</label>
                  <input
                    type="text"
                    value={currentJob.sinhalaLocation || ''}
                    onChange={(e) => setCurrentJob({ ...currentJob, sinhalaLocation: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Job Description (Sinhala)</label>
                  <RichTextEditor
                    value={currentJob.sinhalaDescription || ''}
                    onChange={handleSinhalaDescriptionChange}
                  />
                </div>
              </div>

              <div className="mt-8 pt-4 border-t border-gray-200 flex justify-end gap-3 sticky bottom-0 bg-white">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                  disabled={isSaving}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-6 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:bg-green-400 flex items-center gap-2"
                >
                  {isSaving && <Loader2 size={16} className="animate-spin" />}
                  {isEditMode ? 'Save Changes' : 'Post Job'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isDeleteDialogOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm overflow-hidden p-6 text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
              <AlertCircle className="h-6 w-6 text-red-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Delete Job?</h3>
            <p className="text-sm text-gray-500 mb-6">
              Are you sure you want to delete "{jobToDelete?.title}"? This action cannot be undone.
            </p>
            <div className="flex justify-center gap-3">
              <button
                onClick={() => setIsDeleteDialogOpen(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 w-full"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 w-full"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CareerManagement;
