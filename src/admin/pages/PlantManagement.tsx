import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, X, Search, Sprout } from 'lucide-react';
import Pagination from '../../components/admin/Pagination';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

interface Lookup { id: string; name: string; nameSi?: string; }
interface Plant {
  id: string; name: string; sinhalaName?: string; slug: string; description?: string;
  sinhalaDescription?: string; climaticZoneId?: string; soilTypeId?: string; harvestTimeId?: string; image?: string;
  climaticZone?: Lookup; soilType?: Lookup; harvestTime?: Lookup;
}

const defaultForm = { name: '', sinhalaName: '', description: '', sinhalaDescription: '', climaticZoneId: '', soilTypeId: '', harvestTimeId: '', image: '' };

export default function PlantManagement() {
  const [plants, setPlants] = useState<Plant[]>([]);
  const [filters, setFilters] = useState<{ climaticZones: Lookup[]; soilTypes: Lookup[]; harvestTimes: Lookup[] }>({ climaticZones: [], soilTypes: [], harvestTimes: [] });
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ ...defaultForm });
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const token = localStorage.getItem('token');
  const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };

  const fetchPlants = async (page = 1) => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/plants?page=${page}&limit=15&search=${search}`, { headers });
      if (res.ok) {
        const data = await res.json();
        setPlants(data.data || []);
        if (data.filters) setFilters(data.filters);
        if (data.meta) setTotalPages(data.meta.totalPages);
      }
    } finally { setIsLoading(false); }
  };

  useEffect(() => { fetchPlants(currentPage); }, [currentPage, search]);

  const openCreate = () => { setForm({ ...defaultForm }); setEditingId(null); setIsModalOpen(true); };
  const openEdit = (p: Plant) => {
    setForm({ name: p.name, sinhalaName: p.sinhalaName || '', description: p.description || '', sinhalaDescription: p.sinhalaDescription || '', climaticZoneId: p.climaticZoneId || '', soilTypeId: p.soilTypeId || '', harvestTimeId: p.harvestTimeId || '', image: p.image || '' });
    setEditingId(p.id); setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const method = editingId ? 'PUT' : 'POST';
    const url = editingId ? `${API_BASE_URL}/plants/${editingId}` : `${API_BASE_URL}/plants`;
    const res = await fetch(url, { method, headers, body: JSON.stringify(form) });
    if (res.ok) { setIsModalOpen(false); fetchPlants(currentPage); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this plant?')) return;
    await fetch(`${API_BASE_URL}/plants/${id}`, { method: 'DELETE', headers });
    fetchPlants(currentPage);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Plant Management</h1>
          <p className="text-sm text-gray-500 mt-1">Manage plant finder database</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">
          <Plus size={18} /> Add Plant
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="relative max-w-md">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" placeholder="Search plants..." value={search} onChange={e => { setSearch(e.target.value); setCurrentPage(1); }}
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
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Plant</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Climatic Zone</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Soil Type</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Harvest Time</th>
                <th className="px-6 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {plants.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-12 text-gray-400"><Sprout className="mx-auto mb-2" size={32} /><p>No plants found</p></td></tr>
              ) : plants.map(p => (
                <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {p.image && <img src={p.image} alt="" className="w-10 h-10 rounded-lg object-cover shrink-0" />}
                      <div>
                        <p className="font-medium text-gray-800">{p.name}</p>
                        {p.sinhalaName && <p className="text-xs text-gray-500">{p.sinhalaName}</p>}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-600">{p.climaticZone?.name || '-'}</td>
                  <td className="px-6 py-4 text-gray-600">{p.soilType?.name || '-'}</td>
                  <td className="px-6 py-4 text-gray-600">{p.harvestTime?.name || '-'}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 justify-end">
                      <button onClick={() => openEdit(p)} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"><Edit size={16} /></button>
                      <button onClick={() => handleDelete(p.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={16} /></button>
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
          <div className="bg-white rounded-2xl w-full max-w-lg relative z-10 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-800">{editingId ? 'Edit Plant' : 'Add Plant'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors"><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Name (EN) *</label><input required value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/50" /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Name (SI)</label><input value={form.sinhalaName} onChange={e => setForm({...form, sinhalaName: e.target.value})} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/50" /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Climatic Zone</label>
                  <select value={form.climaticZoneId} onChange={e => setForm({...form, climaticZoneId: e.target.value})} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/50">
                    <option value="">Select Zone</option>
                    {filters.climaticZones.map(z => <option key={z.id} value={z.id}>{z.name}</option>)}
                  </select>
                </div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Soil Type</label>
                  <select value={form.soilTypeId} onChange={e => setForm({...form, soilTypeId: e.target.value})} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/50">
                    <option value="">Select Soil</option>
                    {filters.soilTypes.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Harvest Time</label>
                  <select value={form.harvestTimeId} onChange={e => setForm({...form, harvestTimeId: e.target.value})} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/50">
                    <option value="">Select Time</option>
                    {filters.harvestTimes.map(h => <option key={h.id} value={h.id}>{h.name}</option>)}
                  </select>
                </div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label><input value={form.image} onChange={e => setForm({...form, image: e.target.value})} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/50" /></div>
              </div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Description (EN)</label><textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} rows={3} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/50" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Description (SI)</label><textarea value={form.sinhalaDescription} onChange={e => setForm({...form, sinhalaDescription: e.target.value})} rows={3} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/50" /></div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 font-medium transition-colors">Cancel</button>
                <button type="submit" className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors">{editingId ? 'Update' : 'Add'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
