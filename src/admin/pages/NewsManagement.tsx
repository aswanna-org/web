import { useState, useEffect } from 'react';
import { Search, Plus, Edit, Trash2, Upload, X, Newspaper } from 'lucide-react';
import Pagination from '../../components/admin/Pagination';
import RichTextEditor from '../components/RichTextEditor';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

interface NewsItem {
  id: string; title: string; sinhalaTitle?: string; slug: string;
  content: string; sinhalaContent?: string; image?: string;
  authorName: string; authorEmail?: string; authorAvatar?: string; createdAt: string;
}

const defaultForm = { title: '', sinhalaTitle: '', slug: '', content: '', sinhalaContent: '', image: '', authorName: '', authorEmail: '', authorAvatar: '' };

export default function NewsManagement() {
  const [items, setItems] = useState<NewsItem[]>([]);
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
      const res = await fetch(`${API_BASE_URL}/news?page=${page}&limit=15`, { headers: authHeaders });
      if (res.ok) {
        const data = await res.json();
        setItems(data.data || []);
        if (data.meta) setTotalPages(data.meta.totalPages);
      }
    } finally { setIsLoading(false); }
  };

  useEffect(() => { fetchItems(currentPage); }, [currentPage]);

  const openCreate = () => { setForm({ ...defaultForm }); setImageFile(null); setEditingId(null); setIsModalOpen(true); };
  const openEdit = (item: NewsItem) => {
    setForm({ title: item.title, sinhalaTitle: item.sinhalaTitle || '', slug: item.slug, content: item.content, sinhalaContent: item.sinhalaContent || '', image: item.image || '', authorName: item.authorName, authorEmail: item.authorEmail || '', authorAvatar: item.authorAvatar || '' });
    setImageFile(null); setEditingId(item.id); setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => fd.append(k, v));
    if (imageFile) fd.append('image', imageFile);
    const method = editingId ? 'PUT' : 'POST';
    const url = editingId ? `${API_BASE_URL}/news/${editingId}` : `${API_BASE_URL}/news`;
    const res = await fetch(url, { method, headers: authHeaders, body: fd });
    if (res.ok) { setIsModalOpen(false); fetchItems(currentPage); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this news article?')) return;
    await fetch(`${API_BASE_URL}/news/${id}`, { method: 'DELETE', headers: authHeaders });
    fetchItems(currentPage);
  };

  const filteredItems = items.filter(i => i.title.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">News Management</h1>
          <p className="text-sm text-gray-500 mt-1">Manage news articles and announcements</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">
          <Plus size={18} /> Add Article
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="relative max-w-md">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" placeholder="Search news..." value={search} onChange={e => setSearch(e.target.value)}
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
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Author</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Slug</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredItems.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-12 text-gray-400"><Newspaper className="mx-auto mb-2" size={32} /><p>No news articles found</p></td></tr>
              ) : filteredItems.map(item => (
                <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {item.image && <img src={item.image} alt="" className="w-10 h-10 rounded-lg object-cover shrink-0" />}
                      <span className="font-medium text-gray-800 line-clamp-1">{item.title}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-600">{item.authorName}</td>
                  <td className="px-6 py-4 text-gray-500 font-mono text-xs">{item.slug}</td>
                  <td className="px-6 py-4 text-gray-500">{new Date(item.createdAt).toLocaleDateString()}</td>
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
          <div className="bg-white rounded-2xl w-full max-w-2xl relative z-10 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-800">{editingId ? 'Edit Article' : 'Add New Article'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors"><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Title (EN) *</label><input required value={form.title} onChange={e => setForm({...form, title: e.target.value})} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/50" /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Title (SI)</label><input value={form.sinhalaTitle} onChange={e => setForm({...form, sinhalaTitle: e.target.value})} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/50" /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Slug *</label><input required value={form.slug} onChange={e => setForm({...form, slug: e.target.value})} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/50" /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Author Name *</label><input required value={form.authorName} onChange={e => setForm({...form, authorName: e.target.value})} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/50" /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Author Email</label><input type="email" value={form.authorEmail} onChange={e => setForm({...form, authorEmail: e.target.value})} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/50" /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Image</label>
                  <label className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                    <Upload size={16} className="text-gray-400" />
                    <span className="text-sm text-gray-500">{imageFile ? imageFile.name : 'Choose image...'}</span>
                    <input type="file" accept="image/*" className="hidden" onChange={e => setImageFile(e.target.files?.[0] || null)} />
                  </label>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Content (EN) *</label>
                <div className={editingId ? '' : 'h-64 mb-16'}>
                  <RichTextEditor value={form.content} onChange={value => setForm({...form, content: value})} placeholder="Write news content in English..." />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Content (SI)</label>
                <div className={editingId ? '' : 'h-64 mb-16'}>
                  <RichTextEditor value={form.sinhalaContent} onChange={value => setForm({...form, sinhalaContent: value})} placeholder="Write news content in Sinhala..." />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 font-medium transition-colors">Cancel</button>
                <button type="submit" className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors">{editingId ? 'Update' : 'Publish'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
