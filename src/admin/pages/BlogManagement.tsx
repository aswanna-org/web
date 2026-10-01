import { useState, useEffect } from 'react';
import { Search, Plus, Edit, Trash2, Upload, Newspaper, X, MessageSquare, Calendar, Clock } from 'lucide-react';
import Pagination from '../../components/admin/Pagination';
import RichTextEditor from '../components/RichTextEditor';
import AgroLoader from '../../components/common/AgroLoader';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

interface BlogItem {
  id: string; title?: string; sinhalaTitle?: string; slug?: string;
  content?: string; sinhalaContent?: string; image?: string;
  authorName?: string; authorEmail?: string; authorAvatar?: string; createdAt: string;
}

const defaultForm = { title: '', sinhalaTitle: '', slug: '', content: '', sinhalaContent: '', image: '', authorName: '', authorEmail: '', authorAvatar: '' };

export default function BlogManagement() {
  const [items, setItems] = useState<BlogItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ ...defaultForm });
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [commentsModalItem, setCommentsModalItem] = useState<BlogItem | null>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [isLoadingComments, setIsLoadingComments] = useState(false);

  const token = localStorage.getItem('admin_token');
  const authHeaders = { Authorization: `Bearer ${token}` };

  const fetchItems = async (page = 1) => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/blogs?page=${page}&limit=15`, { headers: authHeaders });
      if (res.ok) {
        const data = await res.json();
        setItems(data.data || []);
        if (data.meta) setTotalPages(data.meta.totalPages);
      }
    } finally { setIsLoading(false); }
  };

  useEffect(() => { fetchItems(currentPage); }, [currentPage]);

  const openCreate = () => { setForm({ ...defaultForm }); setImageFile(null); setEditingId(null); setIsModalOpen(true); };
  const openEdit = (item: BlogItem) => {
    setForm({
      title: item.title || '',
      sinhalaTitle: item.sinhalaTitle || '',
      slug: item.slug || '',
      content: item.content || '',
      sinhalaContent: item.sinhalaContent || '',
      image: item.image || '',
      authorName: item.authorName || '',
      authorEmail: item.authorEmail || '',
      authorAvatar: item.authorAvatar || ''
    });
    setImageFile(null); setEditingId(item.id); setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => {
      if (v !== undefined && v !== null) {
        fd.append(k, v);
      }
    });
    if (imageFile) fd.append('image', imageFile);
    const method = editingId ? 'PUT' : 'POST';
    const url = editingId ? `${API_BASE_URL}/blogs/${editingId}` : `${API_BASE_URL}/blogs`;
    try {
      const res = await fetch(url, { method, headers: authHeaders, body: fd });
      if (res.ok) { setIsModalOpen(false); fetchItems(currentPage); }
      else {
        const errorData = await res.json();
        alert(`Error: ${errorData.error || 'Failed to save blog'}`);
      }
    } catch (err) {
      console.error(err);
      alert('Network error occurred while saving.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this blog post?')) return;
    await fetch(`${API_BASE_URL}/blogs/${id}`, { method: 'DELETE', headers: authHeaders });
    fetchItems(currentPage);
  };

  const openComments = async (item: BlogItem) => {
    setCommentsModalItem(item);
    setIsLoadingComments(true);
    try {
      const res = await fetch(`${API_BASE_URL}/blogs/${item.id}/comments`);
      if (res.ok) {
        const data = await res.json();
        setComments(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoadingComments(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!confirm('Are you sure you want to delete this comment as Administrator?')) return;
    try {
      const res = await fetch(`${API_BASE_URL}/blogs/comments/${commentId}`, {
        method: 'DELETE',
        headers: authHeaders,
      });
      if (res.ok) {
        setComments(prev => prev.filter(c => c.id !== commentId));
      } else {
        alert('Failed to delete comment.');
      }
    } catch (err) {
      console.error(err);
      alert('Error deleting comment.');
    }
  };

  const filteredItems = items.filter(i => (i.title || i.sinhalaTitle || '').toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Blog Management</h1>
          <p className="text-sm text-gray-500 mt-1">Manage blog posts and articles</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">
          <Plus size={18} /> Add Post
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="relative max-w-md">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" placeholder="Search posts..." value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/50" />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center items-center py-20"><AgroLoader message="Loading blogs..." /></div>
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
                <tr><td colSpan={5} className="text-center py-12 text-gray-400"><Newspaper className="mx-auto mb-2" size={32} /><p>No blog posts found</p></td></tr>
              ) : filteredItems.map(item => (
                <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {item.image && <img src={item.image} alt="" className="w-10 h-10 rounded-lg object-cover shrink-0" />}
                      <span className="font-medium text-gray-800 line-clamp-1">{item.title || item.sinhalaTitle || 'Untitled'}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-600">{item.authorName || '-'}</td>
                  <td className="px-6 py-4 text-gray-500 font-mono text-xs">{item.slug || '-'}</td>
                  <td className="px-6 py-4 text-gray-500">{new Date(item.createdAt).toLocaleDateString()}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 justify-end">
                      <button onClick={() => openComments(item)} title="Manage Comments" className="p-2 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"><MessageSquare size={16} /></button>
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
          <div className="bg-white rounded-2xl w-full max-w-6xl relative z-10 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-800">{editingId ? 'Edit Post' : 'Add New Post'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors"><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Title (EN)</label><input value={form.title} onChange={e => {
                  const val = e.target.value;
                  if (!editingId) {
                    setForm({...form, title: val, slug: val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')});
                  } else {
                    setForm({...form, title: val});
                  }
                }} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/50" /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Title (SI)</label><input value={form.sinhalaTitle} onChange={e => setForm({...form, sinhalaTitle: e.target.value})} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/50" /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Slug</label><input value={form.slug} onChange={e => setForm({...form, slug: e.target.value})} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/50" /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Author Name</label><input value={form.authorName} onChange={e => setForm({...form, authorName: e.target.value})} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/50" /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Author Email</label><input type="email" value={form.authorEmail} onChange={e => setForm({...form, authorEmail: e.target.value})} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/50" /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Image</label>
                  <label className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 h-[42px]">
                    <Upload size={16} className="text-gray-400 shrink-0" />
                    <span className="text-sm text-gray-500 line-clamp-1">{imageFile ? imageFile.name : 'Choose image...'}</span>
                    <input type="file" accept="image/*" className="hidden" onChange={e => setImageFile(e.target.files?.[0] || null)} />
                  </label>
                </div>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="flex flex-col">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Content (EN)</label>
                  <div className="flex-1 min-h-[300px]">
                    <RichTextEditor value={form.content} onChange={value => setForm({...form, content: value})} placeholder="Write blog content in English..." />
                  </div>
                </div>
                <div className="flex flex-col">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Content (SI)</label>
                  <div className="flex-1 min-h-[300px]">
                    <RichTextEditor value={form.sinhalaContent} onChange={value => setForm({...form, sinhalaContent: value})} placeholder="Write blog content in Sinhala..." />
                  </div>
                </div>
              </div>
              <div className="flex gap-3 pt-4 mt-8 border-t border-gray-100">
                <button type="button" onClick={() => setIsModalOpen(false)} disabled={isSaving} className="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 font-medium transition-colors disabled:opacity-50">Cancel</button>
                <button type="submit" disabled={isSaving} className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors flex justify-center items-center gap-2 disabled:opacity-50">
                  {isSaving ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : null}
                  {isSaving ? 'Saving...' : (editingId ? 'Update' : 'Publish')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Comments Moderation Modal */}
      {commentsModalItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setCommentsModalItem(null)} />
          <div className="bg-white rounded-2xl w-full max-w-2xl relative z-10 shadow-2xl max-h-[85vh] flex flex-col overflow-hidden animate-card-pop">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <div>
                <h2 className="text-xl font-bold text-gray-800">Comments Moderation</h2>
                <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">Post: {commentsModalItem.title || commentsModalItem.sinhalaTitle}</p>
              </div>
              <button onClick={() => setCommentsModalItem(null)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors"><X size={20} /></button>
            </div>
            <div className="p-6 overflow-y-auto space-y-3 flex-1">
              {isLoadingComments ? (
                <div className="py-12 flex justify-center"><AgroLoader message="Loading comments..." /></div>
              ) : comments.length === 0 ? (
                <div className="py-12 text-center text-sm text-gray-400">No comments posted on this article yet.</div>
              ) : (
                comments.map((comment) => (
                  <div key={comment.id} className="p-4 rounded-xl bg-gray-50 border border-gray-100 flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="font-bold text-sm text-gray-800">{comment.user?.name || 'User'}</span>
                        <span className="text-xs text-gray-400">({comment.user?.email})</span>
                        <span className="text-[11px] text-gray-500 ml-auto flex items-center gap-1.5 bg-white px-2 py-0.5 rounded-md border border-gray-200/60 shadow-2xs">
                          <Calendar size={12} className="text-gray-400" />
                          <span>{new Date(comment.createdAt).toLocaleDateString()}</span>
                          <span className="text-gray-300">•</span>
                          <Clock size={12} className="text-gray-400" />
                          <span>{new Date(comment.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </span>
                      </div>
                      <p className="text-sm text-gray-700 whitespace-pre-wrap">{comment.content}</p>
                    </div>
                    <button
                      onClick={() => handleDeleteComment(comment.id)}
                      title="Delete Comment (Admin)"
                      className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer shrink-0"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
