import { useState, useEffect } from 'react';
import { 
  Search, 
  Trash2, 
  Mail, 
  Phone, 
  Eye, 
  X, 
  CheckCircle, 
  Inbox, 
  MessageSquare,
  RefreshCw,
  Archive,
  Send
} from 'lucide-react';
import Pagination from '../../components/admin/Pagination';
import AgroLoader from '../../components/common/AgroLoader';
import { useConfirm } from '../components/ConfirmDialog';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

interface ContactInquiry {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  service: string | null;
  message: string;
  status: 'PENDING' | 'READ' | 'RESPONDED' | 'ARCHIVED';
  createdAt: string;
  updatedAt: string;
}

const SERVICE_LABELS: Record<string, string> = {
  crop: 'Crop Farming Advisory',
  pest: 'Pest & Disease Control',
  market: 'Marketplace & Products',
  govijana: 'Agrarian Service Centers',
  education: 'Agro Education & Courses',
  other: 'General Inquiries'
};

const STATUS_CONFIG: Record<string, { label: string; badge: string; dot: string }> = {
  PENDING: {
    label: 'Pending',
    badge: 'bg-amber-50 text-amber-700 border border-amber-200/80',
    dot: 'bg-amber-500'
  },
  READ: {
    label: 'Read',
    badge: 'bg-blue-50 text-blue-700 border border-blue-200/80',
    dot: 'bg-blue-500'
  },
  RESPONDED: {
    label: 'Responded',
    badge: 'bg-emerald-50 text-emerald-700 border border-emerald-200/80',
    dot: 'bg-emerald-500'
  },
  ARCHIVED: {
    label: 'Archived',
    badge: 'bg-slate-100 text-slate-600 border border-slate-200/80',
    dot: 'bg-slate-400'
  }
};

export default function ContactManagement() {
  const { confirm } = useConfirm();
  const [inquiries, setInquiries] = useState<ContactInquiry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedInquiry, setSelectedInquiry] = useState<ContactInquiry | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);
  const pageSize = 12;

  const token = localStorage.getItem('admin_token');
  const headers = { 
    'Content-Type': 'application/json', 
    Authorization: `Bearer ${token}` 
  };

  const fetchInquiries = async (page = currentPage) => {
    setIsLoading(true);
    try {
      let query = `${API_BASE_URL}/contacts?page=${page}&limit=${pageSize}`;
      if (search.trim()) query += `&search=${encodeURIComponent(search.trim())}`;
      if (statusFilter !== 'ALL') query += `&status=${encodeURIComponent(statusFilter)}`;

      const res = await fetch(query, { headers });
      if (res.ok) {
        const data = await res.json();
        setInquiries(data.data || []);
        if (data.meta) {
          setTotalPages(data.meta.totalPages || 1);
          setTotalItems(data.meta.total || 0);
          if (data.meta.pendingCount !== undefined) {
            setPendingCount(data.meta.pendingCount);
          }
        }
      }
    } catch (err) {
      console.error('Failed to fetch inquiries:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInquiries(currentPage);
  }, [currentPage, statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchInquiries(1);
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/contacts/${id}/status`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ status: newStatus })
      });

      if (res.ok) {
        const updated = await res.json();
        setInquiries(prev => prev.map(item => item.id === id ? { ...item, status: updated.status } : item));
        if (selectedInquiry && selectedInquiry.id === id) {
          setSelectedInquiry({ ...selectedInquiry, status: updated.status });
        }
        // Update pending count if transitioning to/from PENDING
        if (newStatus !== 'PENDING' && inquiries.find(i => i.id === id)?.status === 'PENDING') {
          setPendingCount(prev => Math.max(0, prev - 1));
        }
      }
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!await confirm({
      title: 'Delete Inquiry',
      subtitle: 'විමසීම ස්ථිරවම ඉවත් කිරීම',
      message: 'Are you sure you want to delete this inquiry? This cannot be undone.',
      confirmText: 'Delete Inquiry'
    })) return;
    try {
      const res = await fetch(`${API_BASE_URL}/contacts/${id}`, {
        method: 'DELETE',
        headers
      });
      if (res.ok) {
        if (selectedInquiry?.id === id) setSelectedInquiry(null);
        fetchInquiries(currentPage);
      }
    } catch (err) {
      console.error('Failed to delete inquiry:', err);
    }
  };

  const handleOpenDetails = async (inquiry: ContactInquiry) => {
    setSelectedInquiry(inquiry);
    // If pending, mark as READ automatically
    if (inquiry.status === 'PENDING') {
      try {
        const res = await fetch(`${API_BASE_URL}/contacts/${inquiry.id}`, { headers });
        if (res.ok) {
          const updated = await res.json();
          setSelectedInquiry(updated);
          setInquiries(prev => prev.map(item => item.id === inquiry.id ? { ...item, status: 'READ' } : item));
          setPendingCount(prev => Math.max(0, prev - 1));
        }
      } catch (err) {
        console.error('Failed to mark inquiry as read:', err);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* ── Top Header with Stats ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Contact Inquiries</h1>
            {pendingCount > 0 && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200 animate-pulse">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                {pendingCount} Pending
              </span>
            )}
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Manage inquiries, messages, and consultation requests submitted from the Contact page.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => fetchInquiries(currentPage)}
            title="Refresh Inquiries"
            className="inline-flex items-center gap-2 px-3.5 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 shadow-xs transition-colors"
          >
            <RefreshCw size={15} className={isLoading ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* ── Filter Bar & Search ── */}
      <div className="bg-white rounded-xl shadow-xs border border-gray-100 p-4">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          {/* Search Bar */}
          <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-md">
            <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, email, phone, or message..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-20 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-600 transition-all"
            />
            {search && (
              <button
                type="button"
                onClick={() => {
                  setSearch('');
                  setCurrentPage(1);
                }}
                className="absolute right-10 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X size={14} />
              </button>
            )}
            <button
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-md transition-colors"
            >
              Search
            </button>
          </form>

          {/* Status Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
            {['ALL', 'PENDING', 'READ', 'RESPONDED', 'ARCHIVED'].map(status => {
              const isActive = statusFilter === status;
              return (
                <button
                  key={status}
                  onClick={() => {
                    setStatusFilter(status);
                    setCurrentPage(1);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                    isActive
                      ? 'bg-[#054a29] text-white shadow-xs'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {status === 'ALL' ? 'All Inquiries' : status.charAt(0) + status.slice(1).toLowerCase()}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Inquiries Table ── */}
      <div className="bg-white rounded-xl shadow-xs border border-gray-100 overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center items-center py-24">
            <AgroLoader message="Loading inquiries..." />
          </div>
        ) : inquiries.length === 0 ? (
          <div className="text-center py-20 px-4">
            <div className="w-16 h-16 bg-gray-50 border border-gray-200/60 rounded-2xl flex items-center justify-center mx-auto mb-4 text-gray-400">
              <Inbox size={32} strokeWidth={1.5} />
            </div>
            <h3 className="text-base font-bold text-gray-800 mb-1">No contact inquiries found</h3>
            <p className="text-sm text-gray-500 max-w-sm mx-auto">
              {search || statusFilter !== 'ALL'
                ? 'Try adjusting your search criteria or filter to see more inquiries.'
                : 'No messages have been submitted through the contact form yet.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-700">
              <thead className="bg-gray-50/90 border-b border-gray-200 text-[11px] uppercase font-bold text-gray-500 whitespace-nowrap">
                <tr>
                  <th className="px-3 py-2">Sender</th>
                  <th className="px-3 py-2">Contact</th>
                  <th className="px-3 py-2">Service</th>
                  <th className="px-3 py-2">Status</th>
                  <th className="px-3 py-2">Date</th>
                  <th className="px-3 py-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {inquiries.map((inquiry) => {
                  const statusConf = STATUS_CONFIG[inquiry.status] || STATUS_CONFIG.PENDING;
                  const isUnread = inquiry.status === 'PENDING';

                  return (
                    <tr 
                      key={inquiry.id} 
                      className={`hover:bg-gray-50/70 transition-colors ${isUnread ? 'bg-amber-50/30 font-medium' : ''}`}
                    >
                      {/* Sender */}
                      <td className="px-3 py-1.5 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 max-w-[180px]">
                          {isUnread && <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" title="New" />}
                          <span className="font-semibold text-gray-900 truncate" title={inquiry.name}>{inquiry.name}</span>
                        </div>
                      </td>

                      {/* Contact */}
                      <td className="px-3 py-1.5 whitespace-nowrap text-gray-600">
                        <span className="truncate max-w-[160px] inline-block" title={inquiry.email || inquiry.phone || '-'}>
                          {inquiry.email || inquiry.phone || '-'}
                        </span>
                      </td>

                      {/* Service */}
                      <td className="px-3 py-1.5 whitespace-nowrap">
                        <span className="text-gray-700 font-medium truncate max-w-[140px] inline-block">
                          {inquiry.service ? (SERVICE_LABELS[inquiry.service] || inquiry.service) : '-'}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="px-3 py-1.5 whitespace-nowrap">
                        <select
                          value={inquiry.status}
                          onChange={(e) => handleStatusChange(inquiry.id, e.target.value)}
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded-full cursor-pointer outline-none transition-all ${statusConf.badge}`}
                        >
                          <option value="PENDING">Pending</option>
                          <option value="READ">Read</option>
                          <option value="RESPONDED">Responded</option>
                          <option value="ARCHIVED">Archived</option>
                        </select>
                      </td>

                      {/* Date */}
                      <td className="px-3 py-1.5 whitespace-nowrap text-gray-500">
                        {new Date(inquiry.createdAt).toLocaleDateString()}
                      </td>

                      {/* Actions */}
                      <td className="px-3 py-1.5 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleOpenDetails(inquiry)}
                            title="View Full Message"
                            className="p-1 text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 rounded transition-colors cursor-pointer"
                          >
                            <Eye size={15} />
                          </button>
                          <button
                            onClick={() => handleDelete(inquiry.id)}
                            title="Delete Inquiry"
                            className="p-1 text-gray-500 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors cursor-pointer"
                          >
                            <Trash2 size={15} />
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

        {/* ── Pagination ── */}
        {!isLoading && totalPages > 1 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            totalItems={totalItems}
            pageSize={pageSize}
          />
        )}
      </div>

      {/* ── Details Modal ── */}
      {selectedInquiry && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-gray-100 overflow-hidden flex flex-col max-h-[90vh] animate-fadeIn">
            {/* Modal Header */}
            <div className="px-6 py-4 bg-gray-50/80 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#054a29] text-white flex items-center justify-center font-bold text-sm">
                  {selectedInquiry.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-base">{selectedInquiry.name}</h3>
                  <p className="text-xs text-gray-500">
                    Received on {new Date(selectedInquiry.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedInquiry(null)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6">
              {/* Contact Meta Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 rounded-xl bg-gray-50 border border-gray-100 text-xs">
                <div>
                  <span className="text-gray-400 block mb-0.5">Email Address</span>
                  <a 
                    href={`mailto:${selectedInquiry.email}`}
                    className="font-medium text-emerald-700 hover:underline flex items-center gap-1.5"
                  >
                    <Mail size={13} />
                    <span>{selectedInquiry.email}</span>
                  </a>
                </div>

                <div>
                  <span className="text-gray-400 block mb-0.5">Phone Number</span>
                  {selectedInquiry.phone ? (
                    <a 
                      href={`tel:${selectedInquiry.phone}`}
                      className="font-medium text-emerald-700 hover:underline flex items-center gap-1.5"
                    >
                      <Phone size={13} />
                      <span>{selectedInquiry.phone}</span>
                    </a>
                  ) : (
                    <span className="text-gray-400 italic">None provided</span>
                  )}
                </div>

                <div>
                  <span className="text-gray-400 block mb-0.5">Interested Service</span>
                  <span className="font-semibold text-gray-800">
                    {selectedInquiry.service ? (SERVICE_LABELS[selectedInquiry.service] || selectedInquiry.service) : 'General Inquiry'}
                  </span>
                </div>

                <div>
                  <span className="text-gray-400 block mb-0.5">Current Status</span>
                  <select
                    value={selectedInquiry.status}
                    onChange={(e) => handleStatusChange(selectedInquiry.id, e.target.value)}
                    className={`text-xs font-semibold px-2.5 py-1 rounded-full cursor-pointer outline-none ${
                      STATUS_CONFIG[selectedInquiry.status]?.badge || 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    <option value="PENDING">Pending</option>
                    <option value="READ">Read</option>
                    <option value="RESPONDED">Responded</option>
                    <option value="ARCHIVED">Archived</option>
                  </select>
                </div>
              </div>

              {/* Message Content */}
              <div>
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Message</h4>
                <div className="p-4 rounded-xl bg-white border border-gray-200 text-sm text-gray-800 leading-relaxed whitespace-pre-wrap font-sans">
                  {selectedInquiry.message}
                </div>
              </div>

              {/* Quick Communication Actions */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <a
                  href={`mailto:${selectedInquiry.email}?subject=Regarding Your Inquiry - Aswanna&body=Dear ${encodeURIComponent(selectedInquiry.name)},%0D%0A%0D%0AThank you for reaching out to Aswanna Ceylon Agro.`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
                >
                  <Send size={14} />
                  <span>Reply via Email</span>
                </a>

                {selectedInquiry.phone && (
                  <a
                    href={`https://wa.me/${selectedInquiry.phone.replace(/[^0-9]/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-[#25D366] hover:bg-[#20ba59] text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
                  >
                    <MessageSquare size={14} />
                    <span>Chat on WhatsApp</span>
                  </a>
                )}

                {selectedInquiry.status !== 'RESPONDED' && (
                  <button
                    onClick={() => handleStatusChange(selectedInquiry.id, 'RESPONDED')}
                    className="inline-flex items-center gap-1.5 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs font-semibold transition-colors"
                  >
                    <CheckCircle size={14} className="text-emerald-600" />
                    <span>Mark as Responded</span>
                  </button>
                )}

                {selectedInquiry.status !== 'ARCHIVED' && (
                  <button
                    onClick={() => handleStatusChange(selectedInquiry.id, 'ARCHIVED')}
                    className="inline-flex items-center gap-1.5 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs font-semibold transition-colors"
                  >
                    <Archive size={14} className="text-gray-500" />
                    <span>Archive</span>
                  </button>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-3 bg-gray-50/80 border-t border-gray-100 flex items-center justify-between">
              <button
                onClick={() => handleDelete(selectedInquiry.id)}
                className="text-xs font-semibold text-red-600 hover:text-red-700 flex items-center gap-1.5 py-1.5 px-2 hover:bg-red-50 rounded-lg transition-colors"
              >
                <Trash2 size={14} />
                <span>Delete Inquiry</span>
              </button>

              <button
                onClick={() => setSelectedInquiry(null)}
                className="px-4 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
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
