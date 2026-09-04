import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, X, Search, MapPin } from 'lucide-react';
import Pagination from '../../components/admin/Pagination';

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
  const [lands, setLands] = useState<AgroLand[]>([]);
  const [types, setTypes] = useState<AgroLandType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ ...defaultForm });
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const token = localStorage.getItem('token');
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
    if (!confirm('Delete this land listing?')) return;
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
          <div className="flex justify-center items-center py-20"><div className="w-8 h-8 border-4 border-green-200 border-t-green-600 rounded-full animate-spin" /></div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Title</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Location</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Price</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Type</th>
                <th className="px-6 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {lands.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-12 text-gray-400"><MapPin className="mx-auto mb-2" size={32} /><p>No land listings found</p></td></tr>
              ) : lands.map(land => (
                <tr key={land.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-gray-800">{land.title}</td>
                  <td className="px-6 py-4 text-gray-600">{land.location}</td>
                  <td className="px-6 py-4 text-gray-600">Rs. {land.price?.toLocaleString()}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${land.status === 'Available' ? 'bg-green-100 text-green-700' : land.status === 'Sold' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>{land.status}</span>
                  </td>
                  <td className="px-6 py-4 text-gray-600">{land.type?.name || '-'}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 justify-end">
                      <button onClick={() => openEdit(land)} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"><Edit size={16} /></button>
                      <button onClick={() => handleDelete(land.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={16} /></button>
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
    </div>
  );
}
