import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, X, Search, Package, Upload } from 'lucide-react';
import Pagination from '../../components/admin/Pagination';
import RichTextEditor from '../components/RichTextEditor';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

interface Category { id: string; name: string; }
interface Item {
  id: string; name: string; sinhalaName?: string; slug: string; description?: string;
  sinhalaDescription?: string; image?: string; categoryId?: string; category?: Category; order?: number;
}

const defaultForm = { name: '', sinhalaName: '', slug: '', description: '', sinhalaDescription: '', categoryId: '', order: '0' };

export default function ItemManagement() {
  const [items, setItems] = useState<Item[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ ...defaultForm });
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [imageFile, setImageFile] = useState<File | null>(null);

  const token = localStorage.getItem('token');
  const authHeaders = { Authorization: `Bearer ${token}` };

  const fetchItems = async (page = 1) => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/items?page=${page}&limit=15`, { headers: authHeaders });
      if (res.ok) {
        const data = await res.json();
        setItems(data.data || []);
        if (data.meta) setTotalPages(data.meta.totalPages);
      }
    } finally { setIsLoading(false); }
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/categories/all?limit=100`, { headers: authHeaders });
      if (res.ok) {
        const data = await res.json();
        setCategories(data.data || []);
      }
    } catch (_) {}
  };

  useEffect(() => { fetchItems(currentPage); }, [currentPage]);
  useEffect(() => { fetchCategories(); }, []);

  const openCreate = () => { setForm({ ...defaultForm }); setImageFile(null); setEditingId(null); setIsModalOpen(true); };
  const openEdit = (item: Item) => {
    setForm({ name: item.name, sinhalaName: item.sinhalaName || '', slug: item.slug, description: item.description || '', sinhalaDescription: item.sinhalaDescription || '', categoryId: item.categoryId || '', order: String(item.order ?? 0) });
    setImageFile(null); setEditingId(item.id); setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => fd.append(k, v));
    if (imageFile) fd.append('image', imageFile);
    const method = editingId ? 'PUT' : 'POST';
    const url = editingId ? `${API_BASE_URL}/items/${editingId}` : `${API_BASE_URL}/items`;
    const res = await fetch(url, { method, headers: authHeaders, body: fd });
    if (res.ok) { setIsModalOpen(false); fetchItems(currentPage); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this item?')) return;
    await fetch(`${API_BASE_URL}/items/${id}`, { method: 'DELETE', headers: authHeaders });
    fetchItems(currentPage);
  };

  const filteredItems = items.filter(i => i.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Item Management</h1>
          <p className="text-sm text-gray-500 mt-1">Manage agro information items</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">
          <Plus size={18} /> Add Item
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="relative max-w-md">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" placeholder="Search items..." value={search} onChange={e => setSearch(e.target.value)}
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
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Item</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Category</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Slug</th>
                <th className="px-6 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredItems.length === 0 ? (
                <tr><td colSpan={4} className="text-center py-12 text-gray-400"><Package className="mx-auto mb-2" size={32} /><p>No items found</p></td></tr>
              ) : filteredItems.map(item => (
                <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {item.image && <img src={item.image} alt="" className="w-10 h-10 rounded-lg object-cover shrink-0" />}
                      <div>
                        <p className="font-medium text-gray-800">{item.name}</p>
                        {item.sinhalaName && <p className="text-xs text-gray-500">{item.sinhalaName}</p>}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-600">{item.category?.name || '-'}</td>
                  <td className="px-6 py-4 text-gray-500 font-mono text-xs">{item.slug}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 justify-end">
                      <button onClick={() => openEdit(item)} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"><Edit size={16} /></button>
                      <button onClick={() => handleDelete(item.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={16} /></button>
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
          <div className="bg-white rounded-2xl w-[90vw] max-w-[1400px] relative z-10 shadow-2xl max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-800">{editingId ? 'Edit Item' : 'Add Item'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors"><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
              <div className="p-6 flex-1 overflow-y-auto">
                <div className="flex flex-col lg:flex-row gap-8">
                  
                  {/* Left Column - Basic Fields */}
                  <div className="lg:w-1/3 space-y-4">
                    <div><label className="block text-sm font-medium text-gray-700 mb-1">Name (EN) *</label><input required value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/50" /></div>
                    <div><label className="block text-sm font-medium text-gray-700 mb-1">Name (SI)</label><input value={form.sinhalaName} onChange={e => setForm({...form, sinhalaName: e.target.value})} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/50" /></div>
                    <div><label className="block text-sm font-medium text-gray-700 mb-1">Slug *</label><input required value={form.slug} onChange={e => setForm({...form, slug: e.target.value})} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/50" /></div>
                    <div><label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                      <select value={form.categoryId} onChange={e => setForm({...form, categoryId: e.target.value})} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/50 bg-white">
                        <option value="">Select Category</option>
                        {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                      </select>
                    </div>
                    <div><label className="block text-sm font-medium text-gray-700 mb-1">Order</label><input type="number" value={form.order} onChange={e => setForm({...form, order: e.target.value})} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/50" /></div>
                    <div><label className="block text-sm font-medium text-gray-700 mb-1">Image</label>
                      <label className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                        <Upload size={16} className="text-gray-400" />
                        <span className="text-sm text-gray-500 truncate">{imageFile ? imageFile.name : 'Choose image...'}</span>
                        <input type="file" accept="image/*" className="hidden" onChange={e => setImageFile(e.target.files?.[0] || null)} />
                      </label>
                    </div>
                  </div>

                  {/* Right Column - Rich Text */}
                  <div className="lg:w-2/3 space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Description (EN)</label>
                      <div className="h-[250px] mb-12">
                        <RichTextEditor value={form.description} onChange={value => setForm({...form, description: value})} placeholder="Enter item description in English..." />
                      </div>
                    </div>
                    <div className="pt-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Description (SI)</label>
                      <div className="h-[250px] mb-12">
                        <RichTextEditor value={form.sinhalaDescription} onChange={value => setForm({...form, sinhalaDescription: value})} placeholder="Enter item description in Sinhala..." />
                      </div>
                    </div>
                  </div>
                  
                </div>
              </div>
              
              {/* Footer Actions */}
              <div className="p-6 border-t border-gray-100 bg-gray-50 flex gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-100 bg-white font-medium transition-colors">Cancel</button>
                <button type="submit" className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors">{editingId ? 'Update' : 'Add'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
