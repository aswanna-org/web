import { useState, useEffect } from 'react';
import { Search, Plus, Edit, Trash2, Upload, Newspaper, X, MessageSquare, Calendar, Clock, Eye, ExternalLink, User } from 'lucide-react';
import Pagination from '../../components/admin/Pagination';
import RichTextEditor from '../components/RichTextEditor';
import AgroLoader from '../../components/common/AgroLoader';
import { useConfirm } from '../components/ConfirmDialog';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

interface BlogItem {
  id: string; title?: string; sinhalaTitle?: string; slug?: string;
  content?: string; sinhalaContent?: string; image?: string;
  authorName?: string; authorEmail?: string; authorAvatar?: string; createdAt: string;
}

const defaultForm = { title: '', sinhalaTitle: '', slug: '', content: '', sinhalaContent: '', image: '', authorName: '', authorEmail: '', authorAvatar: '' };

export default function BlogManagement() {
  const { confirm } = useConfirm();
  const [items, setItems] = useState<BlogItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [viewingItem, setViewingItem] = useState<BlogItem | null>(null);
  const [activePreviewLang, setActivePreviewLang] = useState<'en' | 'si'>('en');
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
    if (!await confirm({
      title: 'Delete Blog Post',
      subtitle: 'බ්ලොග් ලිපිය ස්ථිරවම ඉවත් කිරීම',
      message: 'Are you sure you want to delete this blog post? This action cannot be undone.',
      confirmText: 'Delete Blog'
    })) return;
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
    if (!await confirm({
      title: 'Delete Comment',
      subtitle: 'ප්‍රතිචාරය ස්ථිරවම ඉවත් කිරීම',
      message: 'Are you sure you want to delete this comment as Administrator? This action cannot be undone.',
      confirmText: 'Delete Comment'
    })) return;
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
          <table className="w-full text-left text-xs text-gray-700">
            <thead className="bg-gray-50/90 border-b border-gray-200 text-[11px] uppercase font-bold text-gray-500 whitespace-nowrap">
              <tr>
                <th className="px-3 py-2">Title</th>
                <th className="px-3 py-2">Author</th>
                <th className="px-3 py-2">Slug</th>
                <th className="px-3 py-2">Date</th>
                <th className="px-3 py-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredItems.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-12 text-gray-400"><Newspaper className="mx-auto mb-2" size={32} /><p>No blog posts found</p></td></tr>
              ) : filteredItems.map(item => (
                <tr key={item.id} className="hover:bg-gray-50/70 transition-colors">
                  <td className="px-3 py-1.5 whitespace-nowrap">
                    <div className="flex items-center gap-2 max-w-md">
                      {item.image && <img src={item.image} alt="" className="w-6 h-6 rounded object-cover shrink-0 border border-gray-200" />}
                      <span className="font-semibold text-gray-900 truncate" title={item.title || item.sinhalaTitle || 'Untitled'}>
                        {item.title || item.sinhalaTitle || 'Untitled'}
                      </span>
                    </div>
                  </td>
                  <td className="px-3 py-1.5 whitespace-nowrap text-gray-600">{item.authorName || '-'}</td>
                  <td className="px-3 py-1.5 whitespace-nowrap text-gray-400 font-mono text-[11px]">{item.slug || '-'}</td>
                  <td className="px-3 py-1.5 whitespace-nowrap text-gray-500">{new Date(item.createdAt).toLocaleDateString()}</td>
                  <td className="px-3 py-1.5 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => {
                          setViewingItem(item);
                          setActivePreviewLang(item.sinhalaContent && !item.content ? 'si' : 'en');
                        }}
                        title="View Blog Details"
                        className="p-1 text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 rounded transition-colors cursor-pointer"
                      >
                        <Eye size={15} />
                      </button>
                      <button onClick={() => openComments(item)} title="Manage Comments" className="p-1 text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 rounded transition-colors cursor-pointer"><MessageSquare size={15} /></button>
                      <button onClick={() => openEdit(item)} title="Edit Post" className="p-1 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors cursor-pointer"><Edit size={15} /></button>
                      <button onClick={() => handleDelete(item.id)} title="Delete Post" className="p-1 text-gray-500 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors cursor-pointer"><Trash2 size={15} /></button>
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
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Author Name</label><input list="author-names" placeholder="Select or type author" value={form.authorName} onChange={e => setForm({...form, authorName: e.target.value})} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/50" /><datalist id="author-names">{['චාමර මධුශංක','ගිහාන් වීරසුන්දර','පවිත්රා ගුණියන්ගොඩ','ධම්ම ගුණියන්ගොඩ'].map(n => <option key={n} value={n} />)}</datalist></div>
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

      {/* Blog Details Preview Modal */}
      {viewingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setViewingItem(null)} />
          <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl relative z-10 overflow-hidden border border-gray-100 animate-in fade-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="flex items-center justify-between p-4 sm:p-5 border-b border-gray-100 bg-gray-50/70 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center border border-emerald-200 shrink-0">
                  <Newspaper size={16} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-sm sm:text-base leading-tight">Blog Post Details</h3>
                  <p className="text-[11px] text-gray-500">බ්ලොග් ලිපියේ සම්පූර්ණ විස්තරය</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {viewingItem.slug && (
                  <a
                    href={`/blogs/${viewingItem.slug}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors cursor-pointer"
                    title="View on Public Page"
                  >
                    <ExternalLink size={13} />
                    <span className="hidden sm:inline">Public Page</span>
                  </a>
                )}
                <button
                  onClick={() => setViewingItem(null)}
                  className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-200/60 rounded-lg transition-colors cursor-pointer"
                  title="Close"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Scrollable Body */}
            <div className="p-5 sm:p-6 overflow-y-auto space-y-5 flex-1">
              {/* Featured Image */}
              {viewingItem.image && (
                <div className="w-full max-h-72 overflow-hidden rounded-xl border border-gray-200 bg-gray-50 shadow-2xs relative">
                  <img
                    src={viewingItem.image}
                    alt={viewingItem.title || 'Blog banner'}
                    className="w-full h-full object-cover max-h-72"
                  />
                </div>
              )}

              {/* Titles */}
              <div className="space-y-1">
                {viewingItem.title && (
                  <h2 className="text-xl sm:text-2xl font-black text-gray-900 leading-snug">
                    {viewingItem.title}
                  </h2>
                )}
                {viewingItem.sinhalaTitle && (
                  <h3 className="text-lg sm:text-xl font-bold text-emerald-800 leading-snug">
                    {viewingItem.sinhalaTitle}
                  </h3>
                )}
              </div>

              {/* Metadata Bar */}
              <div className="flex flex-wrap items-center gap-2 p-3 bg-gray-50 rounded-xl border border-gray-150 text-xs text-gray-600">
                {/* Author */}
                <div className="flex items-center gap-1.5 font-medium text-gray-800 bg-white px-2.5 py-1 rounded-lg border border-gray-200/60 shadow-2xs">
                  {viewingItem.authorAvatar ? (
                    <img src={viewingItem.authorAvatar} alt="" className="w-5 h-5 rounded-full object-cover" />
                  ) : (
                    <User size={13} className="text-emerald-600" />
                  )}
                  <span>{viewingItem.authorName || 'Official Author'}</span>
                  {viewingItem.authorEmail && (
                    <span className="text-gray-400 font-normal">({viewingItem.authorEmail})</span>
                  )}
                </div>

                {/* Published Date */}
                <div className="flex items-center gap-1.5 bg-white px-2.5 py-1 rounded-lg border border-gray-200/60 shadow-2xs">
                  <Calendar size={13} className="text-gray-400" />
                  <span>{new Date(viewingItem.createdAt).toLocaleDateString()}</span>
                  <span className="text-gray-300">•</span>
                  <Clock size={13} className="text-gray-400" />
                  <span>{new Date(viewingItem.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>

                {/* Slug */}
                {viewingItem.slug && (
                  <span className="font-mono text-[11px] bg-white px-2 py-1 rounded-lg border border-gray-200/60 text-gray-500">
                    /{viewingItem.slug}
                  </span>
                )}
              </div>

              {/* Language Selection Tabs */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between border-b border-gray-100 pb-2.5">
                  <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
                    Post Content
                  </span>
                  <div className="flex items-center gap-1.5 bg-gray-100 p-0.5 rounded-lg border border-gray-200/60">
                    <button
                      type="button"
                      onClick={() => setActivePreviewLang('en')}
                      className={`px-3 py-1 rounded-md text-xs font-bold transition-all cursor-pointer ${
                        activePreviewLang === 'en'
                          ? 'bg-white text-emerald-800 shadow-2xs'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      English
                    </button>
                    <button
                      type="button"
                      onClick={() => setActivePreviewLang('si')}
                      className={`px-3 py-1 rounded-md text-xs font-bold transition-all cursor-pointer ${
                        activePreviewLang === 'si'
                          ? 'bg-white text-emerald-800 shadow-2xs'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      සිංහල
                    </button>
                  </div>
                </div>

                {/* Render Content */}
                <div className="bg-gray-50/60 p-4 sm:p-5 rounded-xl border border-gray-200 min-h-[160px]">
                  {activePreviewLang === 'si' ? (
                    viewingItem.sinhalaContent ? (
                      <div
                        className="prose prose-sm max-w-none text-gray-800 leading-relaxed font-sans"
                        dangerouslySetInnerHTML={{ __html: viewingItem.sinhalaContent }}
                      />
                    ) : (
                      <p className="text-gray-400 italic text-sm">සිංහල අන්තර්ගතයක් ඇතුළත් කර නොමැත.</p>
                    )
                  ) : (
                    viewingItem.content ? (
                      <div
                        className="prose prose-sm max-w-none text-gray-800 leading-relaxed font-sans"
                        dangerouslySetInnerHTML={{ __html: viewingItem.content }}
                      />
                    ) : (
                      <p className="text-gray-400 italic text-sm">No English content provided.</p>
                    )
                  )}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between p-4 sm:p-5 border-t border-gray-100 bg-gray-50/70 shrink-0">
              <button
                type="button"
                onClick={() => {
                  const it = viewingItem;
                  setViewingItem(null);
                  openComments(it);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors cursor-pointer"
              >
                <MessageSquare size={14} /> Manage Comments
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const it = viewingItem;
                    setViewingItem(null);
                    openEdit(it);
                  }}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors cursor-pointer shadow-xs"
                >
                  <Edit size={14} /> Edit Post
                </button>
                <button
                  type="button"
                  onClick={() => setViewingItem(null)}
                  className="px-3.5 py-1.5 text-xs font-semibold text-gray-700 bg-white hover:bg-gray-100 border border-gray-200 rounded-lg transition-colors cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
