import { useState, useEffect, useMemo, useRef } from 'react';
import {
  Calendar,
  Plus,
  Search,
  RefreshCw,
  Eye,
  Edit,
  Trash2,
  ExternalLink,
  Upload,
  X,
  CheckCircle,
  AlertCircle,
  Image as ImageIcon,
  Link as LinkIcon,
  Loader2
} from 'lucide-react';
import { useConfirm } from '../components/ConfirmDialog';
import Pagination from '../../components/admin/Pagination';
import AgroLoader from '../../components/common/AgroLoader';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export interface ImportantEvent {
  id: string;
  imageUrl: string;
  hyperlink?: string | null;
  startDate: string;
  expiryDate?: string | null;
  activeState: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
}

interface FormState {
  imageUrl: string;
  hyperlink: string;
  startDate: string;
  expiryDate: string;
  activeState: boolean;
  order: number;
}

const getTodayDateString = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const formatDateForInput = (dateStr?: string | null) => {
  if (!dateStr) return '';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return '';
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  } catch {
    return '';
  }
};

const formatDisplayDate = (dateStr?: string | null) => {
  if (!dateStr) return 'None';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return 'Invalid';
    return d.toLocaleDateString('en-CA'); // YYYY-MM-DD
  } catch {
    return 'Invalid';
  }
};

export default function ImportantEventManagement() {
  const { confirm } = useConfirm();

  // Data & loading states
  const [events, setEvents] = useState<ImportantEvent[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive' | 'expired'>('all');

  // Pagination
  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 15;

  // Modal states
  const [isFormModalOpen, setIsFormModalOpen] = useState<boolean>(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [previewEvent, setPreviewEvent] = useState<ImportantEvent | null>(null);

  // Form states
  const [form, setForm] = useState<FormState>({
    imageUrl: '',
    hyperlink: '',
    startDate: getTodayDateString(),
    expiryDate: '',
    activeState: true,
    order: 0
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const token = localStorage.getItem('admin_token') || localStorage.getItem('token');
  const authHeaders = {
    Authorization: token ? `Bearer ${token}` : ''
  };

  // Fetch all events
  const fetchEvents = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const res = await fetch(`${API_BASE_URL}/important-events`, {
        headers: authHeaders
      });
      const json = await res.json();
      // Ensure rule compliance: check both data and items
      const list = json?.data || json?.items || (Array.isArray(json) ? json : []);
      setEvents(list);
    } catch (err: any) {
      console.error('Failed to load important events:', err);
      setErrorMessage(err.message || 'Failed to load events');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  // Filter events
  const filteredEvents = useMemo(() => {
    const now = new Date();
    return events.filter(item => {
      // Check expiry
      const isExpired = item.expiryDate ? new Date(item.expiryDate) < now : false;

      // Status filter
      if (statusFilter === 'active' && (!item.activeState || isExpired)) return false;
      if (statusFilter === 'inactive' && (item.activeState || isExpired)) return false;
      if (statusFilter === 'expired' && !isExpired) return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesLink = item.hyperlink?.toLowerCase().includes(q);
        const matchesStart = formatDisplayDate(item.startDate).includes(q);
        const matchesExpiry = formatDisplayDate(item.expiryDate).includes(q);
        const matchesOrder = String(item.order).includes(q);
        if (!matchesLink && !matchesStart && !matchesExpiry && !matchesOrder) {
          return false;
        }
      }

      return true;
    });
  }, [events, searchQuery, statusFilter]);

  // Pagination calculation
  const totalPages = Math.ceil(filteredEvents.length / pageSize) || 1;
  const paginatedEvents = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredEvents.slice(start, start + pageSize);
  }, [filteredEvents, currentPage, pageSize]);

  // Open Create Modal
  const openCreateModal = () => {
    if (events.length >= 2) {
      alert('Maximum limit of 2 important events reached. Please edit or delete an existing event.');
      return;
    }
    setEditingId(null);
    setForm({
      imageUrl: '',
      hyperlink: '',
      startDate: getTodayDateString(), // Defaults to current date if not specified
      expiryDate: '',
      activeState: true,
      order: 0
    });
    setImageFile(null);
    setImagePreviewUrl(null);
    setIsFormModalOpen(true);
  };

  // Open Edit Modal
  const openEditModal = (item: ImportantEvent) => {
    setEditingId(item.id);
    setForm({
      imageUrl: item.imageUrl || '',
      hyperlink: item.hyperlink || '',
      startDate: formatDateForInput(item.startDate) || getTodayDateString(),
      expiryDate: formatDateForInput(item.expiryDate),
      activeState: item.activeState,
      order: item.order ?? 0
    });
    setImageFile(null);
    setImagePreviewUrl(item.imageUrl || null);
    setIsFormModalOpen(true);
  };

  // Handle Image Selection
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const objectUrl = URL.createObjectURL(file);
      setImagePreviewUrl(objectUrl);
    }
  };

  // Submit Save
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!editingId && events.length >= 2) {
      alert('Maximum limit of 2 important events reached. Please edit or delete an existing event.');
      return;
    }

    if (!imageFile && !form.imageUrl.trim()) {
      alert('Please upload an image or provide an image URL');
      return;
    }

    setIsSaving(true);
    try {
      const formData = new FormData();
      if (imageFile) {
        formData.append('image', imageFile);
      } else {
        formData.append('imageUrl', form.imageUrl.trim());
      }

      if (form.hyperlink.trim()) {
        formData.append('hyperlink', form.hyperlink.trim());
      } else {
        formData.append('hyperlink', '');
      }

      // If startDate is set, append; otherwise defaults to now
      if (form.startDate) {
        formData.append('startDate', form.startDate);
      }

      if (form.expiryDate) {
        formData.append('expiryDate', form.expiryDate);
      } else {
        formData.append('expiryDate', '');
      }

      formData.append('order', String(form.order || 0));
      formData.append('activeState', String(form.activeState));

      const url = editingId
        ? `${API_BASE_URL}/important-events/${editingId}`
        : `${API_BASE_URL}/important-events`;
      const method = editingId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: authHeaders,
        body: formData
      });

      const resData = await res.json();
      if (!res.ok) {
        throw new Error(resData?.error || 'Failed to save important event');
      }

      setIsFormModalOpen(false);
      await fetchEvents();
    } catch (err: any) {
      console.error('Error saving important event:', err);
      alert(err.message || 'Error occurred while saving');
    } finally {
      setIsSaving(false);
    }
  };

  // Toggle Active Status
  const handleToggleStatus = async (item: ImportantEvent) => {
    const now = new Date();
    const isExpired = item.expiryDate ? new Date(item.expiryDate) < now : false;

    if (!item.activeState && isExpired) {
      alert('Cannot activate an expired event. Please edit and extend the expiry date first.');
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/important-events/${item.id}/status`, {
        method: 'PATCH',
        headers: {
          ...authHeaders,
          'Content-Type': 'application/json'
        }
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error || 'Failed to toggle status');
      }
      setEvents(prev =>
        prev.map(ev => (ev.id === item.id ? { ...ev, activeState: !ev.activeState } : ev))
      );
    } catch (err: any) {
      alert(err.message || 'Failed to update status');
    }
  };

  // Delete Event
  const handleDelete = async (item: ImportantEvent) => {
    const isConfirmed = await confirm({
      title: 'Delete Important Event',
      message: 'Are you sure you want to delete this important event banner? This action cannot be undone.',
      confirmText: 'Delete',
      type: 'danger'
    });

    if (!isConfirmed) return;

    try {
      const res = await fetch(`${API_BASE_URL}/important-events/${item.id}`, {
        method: 'DELETE',
        headers: authHeaders
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data?.error || 'Failed to delete event');
      }
      setEvents(prev => prev.filter(ev => ev.id !== item.id));
    } catch (err: any) {
      alert(err.message || 'Failed to delete event');
    }
  };

  // Stats calculation
  const now = new Date();
  const totalCount = events.length;
  const activeCount = events.filter(e => e.activeState && (!e.expiryDate || new Date(e.expiryDate) >= now)).length;
  const expiredCount = events.filter(e => e.expiryDate && new Date(e.expiryDate) < now).length;
  const linkCount = events.filter(e => e.hyperlink && e.hyperlink.trim() !== '').length;

  return (
    <div className="space-y-4">
      {/* Top Header & Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white p-4 rounded-xl border border-gray-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <Calendar size={18} />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900 tracking-tight leading-none">
                Important Events Management
              </h1>
              <p className="text-xs text-gray-500 mt-1">
                Manage promotional events, banners, start dates, automatic expiry dates, and hyperlinks.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchEvents}
            disabled={isLoading}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 text-xs font-semibold text-gray-700 transition-colors shadow-2xs cursor-pointer disabled:opacity-50"
            title="Refresh list"
          >
            <RefreshCw size={13} className={isLoading ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </button>

          <button
            onClick={openCreateModal}
            disabled={events.length >= 2}
            className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold shadow-xs transition-all ${
              events.length >= 2
                ? 'bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed'
                : 'bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer hover:shadow-sm'
            }`}
            title={events.length >= 2 ? 'Maximum of 2 events reached. Edit or delete an existing event.' : 'Add Event'}
          >
            <Plus size={15} />
            <span>Add Event {events.length >= 2 ? '(2/2 Max)' : `(${events.length}/2)`}</span>
          </button>
        </div>
      </div>

      {/* Info Notice when Maximum 2 limit is reached */}
      {events.length >= 2 && (
        <div className="flex items-center gap-2 p-2.5 bg-amber-50/90 border border-amber-200/90 text-amber-900 text-xs rounded-lg">
          <AlertCircle size={15} className="shrink-0 text-amber-600" />
          <span>
            <strong>Maximum Limit Reached (2 of 2):</strong> You can have a maximum of two important events. To add or change banners, please edit or delete one of the existing events below.
          </span>
        </div>
      )}

      {/* Stats Summary Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-3 rounded-lg border border-gray-200/80 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider block">Total Events</span>
            <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-xs bg-gray-100 text-gray-600">Max 2</span>
          </div>
          <span className="text-xl font-bold text-gray-900 mt-0.5 block">{totalCount} / 2</span>
        </div>
        <div className="bg-white p-3 rounded-lg border border-gray-200/80 shadow-2xs">
          <span className="text-[11px] font-semibold text-emerald-600 uppercase tracking-wider block">Active & Live</span>
          <span className="text-xl font-bold text-emerald-700 mt-0.5 block">{activeCount}</span>
        </div>
        <div className="bg-white p-3 rounded-lg border border-gray-200/80 shadow-2xs">
          <span className="text-[11px] font-semibold text-amber-600 uppercase tracking-wider block">Expired / Passed</span>
          <span className="text-xl font-bold text-amber-700 mt-0.5 block">{expiredCount}</span>
        </div>
        <div className="bg-white p-3 rounded-lg border border-gray-200/80 shadow-2xs">
          <span className="text-[11px] font-semibold text-blue-600 uppercase tracking-wider block">With Hyperlinks</span>
          <span className="text-xl font-bold text-blue-700 mt-0.5 block">{linkCount}</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 bg-white p-3 rounded-lg border border-gray-200/80 shadow-2xs">
        <div className="relative flex-1 max-w-sm">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search by hyperlink or date..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:bg-white transition-all placeholder:text-gray-400"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X size={12} />
            </button>
          )}
        </div>

        {/* Status Filter Buttons */}
        <div className="flex items-center gap-1 overflow-x-auto">
          {(['all', 'active', 'inactive', 'expired'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => {
                setStatusFilter(tab);
                setCurrentPage(1);
              }}
              className={`px-2.5 py-1 text-[11px] font-semibold rounded-md capitalize transition-colors cursor-pointer ${
                statusFilter === tab
                  ? 'bg-emerald-600 text-white shadow-2xs'
                  : 'bg-gray-100/80 hover:bg-gray-200/70 text-gray-600'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Error alert */}
      {errorMessage && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg">
          <AlertCircle size={15} />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Ultra-Compact Admin Data Table */}
      <div className="bg-white rounded-xl border border-gray-200/80 shadow-xs overflow-hidden">
        {isLoading ? (
          <div className="py-16 flex flex-col items-center justify-center">
            <AgroLoader />
            <p className="text-xs text-gray-500 mt-2">Loading important events...</p>
          </div>
        ) : paginatedEvents.length === 0 ? (
          <div className="py-14 text-center">
            <div className="w-12 h-12 mx-auto rounded-full bg-gray-100 flex items-center justify-center text-gray-400 mb-2">
              <Calendar size={22} />
            </div>
            <p className="text-xs font-semibold text-gray-800">No important events found</p>
            <p className="text-[11px] text-gray-400 mt-0.5">
              {searchQuery || statusFilter !== 'all'
                ? 'Try adjusting your search terms or filters.'
                : 'Click "Add Event" to create your first event banner.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-700 border-collapse">
              <thead>
                <tr className="bg-gray-50/90 border-b border-gray-200">
                  <th className="px-3 py-2 text-[11px] uppercase font-bold text-gray-500 whitespace-nowrap w-12 text-center">
                    #
                  </th>
                  <th className="px-3 py-2 text-[11px] uppercase font-bold text-gray-500 whitespace-nowrap w-14">
                    Image
                  </th>
                  <th className="px-3 py-2 text-[11px] uppercase font-bold text-gray-500 whitespace-nowrap">
                    Hyperlink
                  </th>
                  <th className="px-3 py-2 text-[11px] uppercase font-bold text-gray-500 whitespace-nowrap">
                    Start Date
                  </th>
                  <th className="px-3 py-2 text-[11px] uppercase font-bold text-gray-500 whitespace-nowrap">
                    End / Expiry Date
                  </th>
                  <th className="px-3 py-2 text-[11px] uppercase font-bold text-gray-500 whitespace-nowrap text-center">
                    Status
                  </th>
                  <th className="px-3 py-2 text-[11px] uppercase font-bold text-gray-500 whitespace-nowrap">
                    Created At
                  </th>
                  <th className="px-3 py-2 text-[11px] uppercase font-bold text-gray-500 whitespace-nowrap text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {paginatedEvents.map(item => {
                  const isExpired = item.expiryDate ? new Date(item.expiryDate) < now : false;

                  return (
                    <tr key={item.id} className="hover:bg-gray-50/70 transition-colors">
                      {/* Order */}
                      <td className="px-3 py-1.5 text-center font-mono text-[11px] text-gray-500 whitespace-nowrap">
                        {item.order ?? 0}
                      </td>

                      {/* Image Thumbnail (Ultra-compact: w-7 h-7) */}
                      <td className="px-3 py-1.5 whitespace-nowrap">
                        {item.imageUrl ? (
                          <img
                            src={item.imageUrl}
                            alt="Event Banner"
                            onClick={() => setPreviewEvent(item)}
                            className="w-7 h-7 rounded object-cover border border-gray-200 shrink-0 cursor-pointer hover:opacity-80 transition-opacity"
                            title="Click to preview"
                          />
                        ) : (
                          <div className="w-7 h-7 rounded bg-gray-100 border border-gray-200 flex items-center justify-center text-gray-400">
                            <ImageIcon size={13} />
                          </div>
                        )}
                      </td>

                      {/* Hyperlink */}
                      <td className="px-3 py-1.5 max-w-xs">
                        {item.hyperlink ? (
                          <a
                            href={item.hyperlink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-emerald-600 hover:text-emerald-700 hover:underline truncate max-w-[220px]"
                            title={item.hyperlink}
                          >
                            <ExternalLink size={11} className="shrink-0" />
                            <span className="truncate">{item.hyperlink}</span>
                          </a>
                        ) : (
                          <span className="text-[11px] text-gray-400 italic">No link</span>
                        )}
                      </td>

                      {/* Start Date */}
                      <td className="px-3 py-1.5 whitespace-nowrap text-gray-700">
                        <span className="font-mono text-[11px]">{formatDisplayDate(item.startDate)}</span>
                      </td>

                      {/* End / Expiry Date */}
                      <td className="px-3 py-1.5 whitespace-nowrap">
                        {item.expiryDate ? (
                          <div className="flex items-center gap-1.5">
                            <span
                              className={`font-mono text-[11px] ${
                                isExpired ? 'text-amber-600 font-semibold line-through' : 'text-gray-700'
                              }`}
                            >
                              {formatDisplayDate(item.expiryDate)}
                            </span>
                            {isExpired && (
                              <span className="text-[9px] px-1.5 py-0.2 bg-amber-100 text-amber-800 rounded font-bold uppercase tracking-wider">
                                Expired
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-[11px] text-gray-400">No Expiry</span>
                        )}
                      </td>

                      {/* Active / Publish Status Badge */}
                      <td className="px-3 py-1.5 text-center whitespace-nowrap">
                        <button
                          onClick={() => handleToggleStatus(item)}
                          title="Click to toggle publish status"
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold cursor-pointer transition-colors ${
                            isExpired
                              ? 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                              : item.activeState
                              ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              isExpired
                                ? 'bg-amber-600'
                                : item.activeState
                                ? 'bg-emerald-600'
                                : 'bg-gray-400'
                            }`}
                          />
                          <span>
                            {isExpired ? 'Unpublished (Expired)' : item.activeState ? 'Published' : 'Unpublished'}
                          </span>
                        </button>
                      </td>

                      {/* Created At */}
                      <td className="px-3 py-1.5 whitespace-nowrap text-gray-400 font-mono text-[10px]">
                        {formatDisplayDate(item.createdAt)}
                      </td>

                      {/* Action Buttons (Strict rule: size={14} or size={15}, p-1) */}
                      <td className="px-3 py-1.5 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => setPreviewEvent(item)}
                            title="Preview Event Banner"
                            className="p-1 text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 rounded transition-colors cursor-pointer"
                          >
                            <Eye size={14} />
                          </button>
                          <button
                            onClick={() => openEditModal(item)}
                            title="Edit Event"
                            className="p-1 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors cursor-pointer"
                          >
                            <Edit size={14} />
                          </button>
                          <button
                            onClick={() => handleDelete(item)}
                            title="Delete Event"
                            className="p-1 text-gray-500 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors cursor-pointer"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={page => setCurrentPage(page)}
          totalItems={filteredEvents.length}
          pageSize={pageSize}
        />
      </div>

      {/* Create / Edit Modal */}
      {isFormModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-xl border border-gray-200 w-full max-w-lg overflow-hidden my-8">
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100 bg-gray-50/60">
              <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                <Calendar size={16} className="text-emerald-600" />
                <span>{editingId ? 'Edit Important Event' : 'Add New Important Event'}</span>
              </h2>
              <button
                onClick={() => setIsFormModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-md hover:bg-gray-100 transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-5 space-y-4 text-xs">
              {/* Image Upload Zone */}
              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  Event Banner Image <span className="text-rose-500">*</span>
                </label>

                {imagePreviewUrl ? (
                  <div className="relative rounded-lg overflow-hidden border border-gray-200 bg-gray-50 max-h-48 flex items-center justify-center group mb-2">
                    <img
                      src={imagePreviewUrl}
                      alt="Banner Preview"
                      className="w-full max-h-44 object-contain"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-2 transition-opacity">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="px-2.5 py-1 bg-white text-gray-800 text-[11px] font-semibold rounded-md shadow-xs hover:bg-gray-50 cursor-pointer"
                      >
                        Change Image
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setImageFile(null);
                          setImagePreviewUrl(null);
                          setForm(prev => ({ ...prev, imageUrl: '' }));
                        }}
                        className="px-2.5 py-1 bg-rose-600 text-white text-[11px] font-semibold rounded-md shadow-xs hover:bg-rose-700 cursor-pointer"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ) : (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-gray-300 hover:border-emerald-500 rounded-lg p-5 text-center cursor-pointer bg-gray-50/50 hover:bg-emerald-50/20 transition-all"
                  >
                    <Upload size={22} className="mx-auto text-gray-400 mb-1" />
                    <p className="font-semibold text-gray-700">Click to upload banner image</p>
                    <p className="text-[11px] text-gray-400 mt-0.5">PNG, JPG, WEBP recommended</p>
                  </div>
                )}

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />

                {/* Option to paste image URL */}
                <div className="mt-2">
                  <div className="relative">
                    <input
                      type="url"
                      placeholder="Or enter direct Image URL (https://...)"
                      value={form.imageUrl}
                      onChange={e => {
                        const url = e.target.value;
                        setForm(prev => ({ ...prev, imageUrl: url }));
                        if (!imageFile && url.trim()) {
                          setImagePreviewUrl(url.trim());
                        }
                      }}
                      className="w-full px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-emerald-500 text-xs placeholder:text-gray-400"
                    />
                  </div>
                </div>
              </div>

              {/* Hyperlink */}
              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  Hyperlink (Optional)
                </label>
                <div className="relative">
                  <LinkIcon size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="url"
                    placeholder="https://example.com/promotion"
                    value={form.hyperlink}
                    onChange={e => setForm(prev => ({ ...prev, hyperlink: e.target.value }))}
                    className="w-full pl-9 pr-3 py-1.5 bg-gray-50 border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-emerald-500 text-xs placeholder:text-gray-400"
                  />
                </div>
                <p className="text-[10px] text-gray-400 mt-0.5">
                  When users click on the banner, they will be navigated to this link.
                </p>
              </div>

              {/* Start Date & Expiry Date Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Start Date */}
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={form.startDate}
                    onChange={e => setForm(prev => ({ ...prev, startDate: e.target.value }))}
                    className="w-full px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-emerald-500 text-xs"
                  />
                  <p className="text-[10px] text-gray-400 mt-0.5">
                    Defaults to today's date if not specified.
                  </p>
                </div>

                {/* Expiry / End Date */}
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">
                    End / Expiry Date (Optional)
                  </label>
                  <input
                    type="date"
                    value={form.expiryDate}
                    onChange={e => setForm(prev => ({ ...prev, expiryDate: e.target.value }))}
                    className="w-full px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-emerald-500 text-xs"
                  />
                  <p className="text-[10px] text-amber-600 mt-0.5">
                    Automatically unpublishes when this date passes.
                  </p>
                </div>
              </div>

              {/* Order and Active State */}
              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-gray-100">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">
                    Display Order
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={form.order}
                    onChange={e => setForm(prev => ({ ...prev, order: parseInt(e.target.value) || 0 }))}
                    className="w-full px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-emerald-500 text-xs"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">
                    Publish Status
                  </label>
                  <label className="inline-flex items-center gap-2 mt-1 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.activeState}
                      onChange={e => setForm(prev => ({ ...prev, activeState: e.target.checked }))}
                      className="w-4 h-4 text-emerald-600 rounded border-gray-300 focus:ring-emerald-500"
                    />
                    <span className="font-semibold text-gray-800">
                      {form.activeState ? 'Published (Active)' : 'Unpublished (Inactive)'}
                    </span>
                  </label>
                </div>
              </div>

              {/* Modal Buttons */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsFormModalOpen(false)}
                  disabled={isSaving}
                  className="px-3.5 py-1.5 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 font-semibold cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {isSaving ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle size={14} />}
                  <span>{editingId ? 'Update Event' : 'Save Event'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {previewEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-2xl border border-gray-200 w-full max-w-lg overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gray-50/70">
              <h3 className="text-xs font-bold text-gray-900 flex items-center gap-1.5">
                <Eye size={15} className="text-emerald-600" />
                <span>Event Banner Preview</span>
              </h3>
              <button
                onClick={() => setPreviewEvent(null)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-md hover:bg-gray-100 transition-colors"
              >
                <X size={15} />
              </button>
            </div>

            <div className="p-4 space-y-3 text-xs">
              <div className="rounded-lg overflow-hidden border border-gray-200 bg-gray-900 max-h-64 flex items-center justify-center">
                <img
                  src={previewEvent.imageUrl}
                  alt="Banner Full View"
                  className="w-full max-h-64 object-contain"
                />
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs bg-gray-50 p-3 rounded-lg border border-gray-200/70">
                <div>
                  <span className="text-[10px] uppercase font-bold text-gray-400 block">Start Date</span>
                  <span className="font-semibold text-gray-800">{formatDisplayDate(previewEvent.startDate)}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-gray-400 block">End / Expiry Date</span>
                  <span className="font-semibold text-gray-800">{formatDisplayDate(previewEvent.expiryDate)}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-gray-400 block">Display Order</span>
                  <span className="font-semibold text-gray-800">#{previewEvent.order}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-gray-400 block">Status</span>
                  <span
                    className={`inline-block font-semibold ${
                      previewEvent.expiryDate && new Date(previewEvent.expiryDate) < new Date()
                        ? 'text-amber-600'
                        : previewEvent.activeState
                        ? 'text-emerald-600'
                        : 'text-gray-500'
                    }`}
                  >
                    {previewEvent.expiryDate && new Date(previewEvent.expiryDate) < new Date()
                      ? 'Expired (Unpublished)'
                      : previewEvent.activeState
                      ? 'Active (Published)'
                      : 'Inactive (Unpublished)'}
                  </span>
                </div>
              </div>

              {previewEvent.hyperlink && (
                <div className="pt-1">
                  <a
                    href={previewEvent.hyperlink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-1.5 w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold text-xs transition-colors"
                  >
                    <ExternalLink size={13} />
                    <span>Open Hyperlink</span>
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
