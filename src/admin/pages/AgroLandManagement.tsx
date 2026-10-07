import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, X, Search, MapPin, Eye, Phone } from 'lucide-react';
import Pagination from '../../components/admin/Pagination';
import AgroLoader from '../../components/common/AgroLoader';
import { useConfirm } from '../components/ConfirmDialog';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

interface AgroLandType { id: string; name: string; }
interface AgroLand {
  id: string; title: string; titleSi?: string; description?: string; descriptionSi?: string;
  location: string; locationSi?: string; size?: string; sizeSi?: string; price: number;
  contactNumber: string; image?: string; status: string; typeId: string; type?: AgroLandType;
}

const STATUSES = ['Available', 'Sold', 'Pending'];

const defaultForm = {
  title: '', titleSi: '', description: '', descriptionSi: '',
  location: '', locationSi: '', size: '', sizeSi: '',
  price: '', contactNumber: '', image: '', status: 'Available', typeId: ''
};

export default function AgroLandManagement() {
  const { confirm } = useConfirm();
  const [lands, setLands] = useState<AgroLand[]>([]);
  const [types, setTypes] = useState<AgroLandType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [viewingLand, setViewingLand] = useState<AgroLand | null>(null);
  const [form, setForm] = useState({ ...defaultForm });
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const token = localStorage.getItem('admin_token');
  const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };

  const fetchLands = async (page = 1) => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/agrolands?page=${page}&limit=15&search=${search}`, { headers });
      if (res.ok) {
        const data = await res.json();
        setLands(data.data || []);
        if (data.meta) setTotalPages(data.meta.totalPages);
      }
    } finally { setIsLoading(false); }
  };

  const fetchTypes = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/agrolands/types`, { headers });
      if (res.ok) setTypes(await res.json());
    } catch (_) {}
  };

  useEffect(() => { fetchLands(currentPage); }, [currentPage, search]);
  useEffect(() => { fetchTypes(); }, []);

  const openCreate = () => { setForm({ ...defaultForm }); setEditingId(null); setIsModalOpen(true); };
  const openEdit = (land: AgroLand) => {
    setForm({
      title: land.title, titleSi: land.titleSi || '', description: land.description || '',
      descriptionSi: land.descriptionSi || '', location: land.location,
      locationSi: land.locationSi || '', size: land.size || '', sizeSi: land.sizeSi || '',
      price: String(land.price), contactNumber: land.contactNumber,
      image: land.image || '', status: land.status, typeId: land.typeId
    });
    setEditingId(land.id); setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const method = editingId ? 'PUT' : 'POST';
    const url = editingId ? `${API_BASE_URL}/agrolands/${editingId}` : `${API_BASE_URL}/agrolands`;
    const res = await fetch(url, { method, headers, body: JSON.stringify(form) });
    if (res.ok) { setIsModalOpen(false); fetchLands(currentPage); }
  };

  const handleDelete = async (id: string) => {
    if (!await confirm({
      title: 'Delete Agro Land',
      subtitle: 'කෘෂිකාර්මික ඉඩම ස්ථිරවම ඉවත් කිරීම',
      message: 'Are you sure you want to delete this land listing? This action cannot be undone.',
      confirmText: 'Delete Land'
    })) return;
    await fetch(`${API_BASE_URL}/agrolands/${id}`, { method: 'DELETE', headers });
    fetchLands(currentPage);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Agro Land Management</h1>
          <p className="text-sm text-gray-500 mt-1">Manage agricultural land listings</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">
          <Plus size={18} /> Add Land
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="relative max-w-md">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" placeholder="Search lands..." value={search} onChange={e => { setSearch(e.target.value); setCurrentPage(1); }}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/50" />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center items-center py-20"><AgroLoader message="Loading agro lands..." /></div>
        ) : (
          <table className="w-full text-left text-xs text-gray-700">
            <thead className="bg-gray-50/90 border-b border-gray-200 text-[11px] uppercase font-bold text-gray-500 whitespace-nowrap">
              <tr>
                <th className="px-3 py-2">Title</th>
                <th className="px-3 py-2">Location</th>
                <th className="px-3 py-2">Price</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2">Type</th>
                <th className="px-3 py-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {lands.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-12 text-gray-400"><MapPin className="mx-auto mb-2" size={32} /><p>No land listings found</p></td></tr>
              ) : lands.map(land => (
                <tr key={land.id} className="hover:bg-gray-50/70 transition-colors">
                  <td className="px-3 py-1.5 whitespace-nowrap font-semibold text-gray-900 truncate max-w-xs" title={land.title}>{land.title}</td>
                  <td className="px-3 py-1.5 whitespace-nowrap text-gray-600">{land.location}</td>
                  <td className="px-3 py-1.5 whitespace-nowrap font-bold text-emerald-700">Rs. {land.price?.toLocaleString()}</td>
                  <td className="px-3 py-1.5 whitespace-nowrap">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${land.status === 'Available' ? 'bg-emerald-100 text-emerald-700' : land.status === 'Sold' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'}`}>{land.status}</span>
                  </td>
                  <td className="px-3 py-1.5 whitespace-nowrap text-gray-600">{land.type?.name || '-'}</td>
                  <td className="px-3 py-1.5 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => setViewingLand(land)} title="View Land Details" className="p-1 text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 rounded transition-colors cursor-pointer"><Eye size={15} /></button>
                      <button onClick={() => openEdit(land)} title="Edit Land" className="p-1 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors cursor-pointer"><Edit size={15} /></button>
                      <button onClick={() => handleDelete(land.id)} title="Delete Land" className="p-1 text-gray-500 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors cursor-pointer"><Trash2 size={15} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {totalPages > 1 && <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
          <div className="bg-white rounded-2xl w-full max-w-2xl relative z-10 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-800">{editingId ? 'Edit Land' : 'Add New Land'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors"><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Title (EN) *</label><input required value={form.title} onChange={e => setForm({...form, title: e.target.value})} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/50" /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Title (SI)</label><input value={form.titleSi} onChange={e => setForm({...form, titleSi: e.target.value})} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/50" /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Location (EN) *</label><input required value={form.location} onChange={e => setForm({...form, location: e.target.value})} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/50" /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Location (SI)</label><input value={form.locationSi} onChange={e => setForm({...form, locationSi: e.target.value})} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/50" /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Size (EN)</label><input value={form.size} onChange={e => setForm({...form, size: e.target.value})} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/50" /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Size (SI)</label><input value={form.sizeSi} onChange={e => setForm({...form, sizeSi: e.target.value})} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/50" /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Price (Rs.) *</label><input required type="number" value={form.price} onChange={e => setForm({...form, price: e.target.value})} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/50" /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Contact Number *</label><input required value={form.contactNumber} onChange={e => setForm({...form, contactNumber: e.target.value})} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/50" /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select value={form.status} onChange={e => setForm({...form, status: e.target.value})} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/50">
                    {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                  <select value={form.typeId} onChange={e => setForm({...form, typeId: e.target.value})} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/50">
                    <option value="">Select Type</option>
                    {types.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                  </select>
                </div>
              </div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Description (EN)</label><textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} rows={3} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/50" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Description (SI)</label><textarea value={form.descriptionSi} onChange={e => setForm({...form, descriptionSi: e.target.value})} rows={3} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/50" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label><input value={form.image} onChange={e => setForm({...form, image: e.target.value})} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/50" /></div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 font-medium transition-colors">Cancel</button>
                <button type="submit" className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors">{editingId ? 'Update' : 'Create'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Agro Land Details Preview Modal */}
      {viewingLand && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setViewingLand(null)} />
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl relative z-10 overflow-hidden border border-gray-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between p-4 sm:p-5 border-b border-gray-100 bg-gray-50/70 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center border border-emerald-200 shrink-0">
                  <MapPin size={16} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-sm sm:text-base leading-tight">Agro Land Details</h3>
                  <p className="text-[11px] text-gray-500">කෘෂිකාර්මික ඉඩමේ සම්පූර්ණ විස්තරය</p>
                </div>
              </div>
              <button
                onClick={() => setViewingLand(null)}
                className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-5 sm:p-6 overflow-y-auto space-y-4">
              {viewingLand.image && (
                <div className="w-full h-48 sm:h-56 rounded-xl overflow-hidden border border-gray-200 bg-gray-100">
                  <img src={viewingLand.image} alt={viewingLand.title} className="w-full h-full object-cover" />
                </div>
              )}

              <div>
                <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                    viewingLand.status === 'Available' ? 'bg-emerald-100 text-emerald-700' : viewingLand.status === 'Sold' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'
                  }`}>
                    {viewingLand.status}
                  </span>
                  {viewingLand.type?.name && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-blue-50 text-blue-700 border border-blue-200">
                      {viewingLand.type.name}
                    </span>
                  )}
                </div>
                <h2 className="text-lg font-bold text-gray-900">{viewingLand.title}</h2>
                {viewingLand.titleSi && <h3 className="text-sm font-semibold text-emerald-800 mt-0.5">{viewingLand.titleSi}</h3>}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-gray-50 p-4 rounded-xl border border-gray-100 text-xs">
                <div>
                  <span className="text-gray-400 block mb-0.5">Price</span>
                  <span className="font-bold text-emerald-700 text-sm">Rs. {viewingLand.price?.toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-gray-400 block mb-0.5">Location</span>
                  <span className="font-medium text-gray-800">{viewingLand.location} {viewingLand.locationSi ? `(${viewingLand.locationSi})` : ''}</span>
                </div>
                <div>
                  <span className="text-gray-400 block mb-0.5">Land Size</span>
                  <span className="font-medium text-gray-800">{viewingLand.size || '-'} {viewingLand.sizeSi ? `(${viewingLand.sizeSi})` : ''}</span>
                </div>
                <div>
                  <span className="text-gray-400 block mb-0.5">Contact Number</span>
                  <a href={`tel:${viewingLand.contactNumber}`} className="font-medium text-emerald-700 hover:underline flex items-center gap-1">
                    <Phone size={12} /> {viewingLand.contactNumber}
                  </a>
                </div>
              </div>

              {viewingLand.description && (
                <div>
                  <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Description (English)</h4>
                  <p className="text-xs text-gray-700 leading-relaxed bg-white p-3 rounded-lg border border-gray-100 whitespace-pre-wrap">{viewingLand.description}</p>
                </div>
              )}

              {viewingLand.descriptionSi && (
                <div>
                  <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">විස්තරය (Sinhala)</h4>
                  <p className="text-xs text-gray-700 leading-relaxed bg-white p-3 rounded-lg border border-gray-100 whitespace-pre-wrap">{viewingLand.descriptionSi}</p>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-gray-100 bg-gray-50/70 flex justify-end gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setViewingLand(null)}
                className="px-4 py-1.5 border border-gray-200 rounded-lg text-xs font-medium text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  const land = viewingLand;
                  setViewingLand(null);
                  openEdit(land);
                }}
                className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer"
              >
                Edit Land
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
