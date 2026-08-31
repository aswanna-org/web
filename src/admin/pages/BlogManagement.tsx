import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Search, X, Image as ImageIcon } from 'lucide-react';
import RichTextEditor from '../components/RichTextEditor';
import { useAuth } from '../../context/AuthContext';

interface Blog {
  id: string;
  title: string;
  sinhalaTitle: string | null;
  slug: string;
  content: string;
  sinhalaContent: string | null;
  image: string | null;
  authorName: string;
  authorEmail: string | null;
  authorAvatar: string | null;
  createdAt: string;
}

export default function BlogManagement() {
  const [blogList, setBlogList] = useState<Blog[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentBlog, setCurrentBlog] = useState<Partial<Blog>>({});
  
  const { token } = useAuth();

  const handleContentChange = (val: string) => {
    if (currentBlog.content !== val) {
      setCurrentBlog(prev => ({ ...prev, content: val }));
    }
  };

  const handleSinhalaContentChange = (val: string) => {
    if (currentBlog.sinhalaContent !== val) {
      setCurrentBlog(prev => ({ ...prev, sinhalaContent: val }));
    }
  };
  
  const [activeTab, setActiveTab] = useState<'EN' | 'SI'>('EN');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/blogs`);
      const data = await res.json();
      setBlogList(data.data || data); 
    } catch (error) {
      console.error('Failed to fetch blogs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenAddModal = () => {
    setCurrentBlog({
      authorName: 'Admin', // Default author
    });
    setImageFile(null);
    setAvatarFile(null);
    setIsEditMode(false);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (blog: Blog) => {
    setCurrentBlog(blog);
    setImageFile(null);
    setAvatarFile(null);
    setIsEditMode(true);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentBlog({});
    setImageFile(null);
    setAvatarFile(null);
  };

  const generateSlug = (text: string) => {
    return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
  };

  const handleSaveBlog = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentBlog.title || !currentBlog.content || !currentBlog.authorName) {
      alert("Title, content, and author name are required.");
      return;
    }

    setIsSaving(true);
    try {
      const url = isEditMode
        ? `${API_BASE_URL}/blogs/${currentBlog.id}`
        : `${API_BASE_URL}/blogs`;
      const method = isEditMode ? 'PUT' : 'POST';

      const formData = new FormData();
      formData.append('title', currentBlog.title);
      formData.append('slug', currentBlog.slug || generateSlug(currentBlog.title));
      formData.append('content', currentBlog.content);
      formData.append('authorName', currentBlog.authorName);
      
      if (currentBlog.sinhalaTitle) formData.append('sinhalaTitle', currentBlog.sinhalaTitle);
      if (currentBlog.sinhalaContent) formData.append('sinhalaContent', currentBlog.sinhalaContent);
      if (currentBlog.authorEmail) formData.append('authorEmail', currentBlog.authorEmail);

      if (imageFile) formData.append('image', imageFile);
      if (avatarFile) formData.append('authorAvatar', avatarFile);

      const res = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData,
      });

      if (!res.ok) throw new Error('Failed to save blog');
      
      await fetchBlogs();
      handleCloseModal();
    } catch (error) {
      console.error('Error saving blog:', error);
      alert("Failed to save blog post. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this blog post?")) return;
    
    try {
      const res = await fetch(`${API_BASE_URL}/blogs/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!res.ok) throw new Error('Failed to delete');
      await fetchBlogs();
    } catch (error) {
      console.error('Error deleting blog:', error);
      alert("Failed to delete blog post.");
    }
  };

  const filteredBlogs = blogList.filter(n => 
    n.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    (n.sinhalaTitle && n.sinhalaTitle.includes(searchQuery))
  );

  return (
    <div className="p-6 h-full flex flex-col bg-gray-50">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Blog Management</h1>
          <p className="text-sm text-gray-500 mt-1">Manage public blog posts</p>
        </div>
        <button
          onClick={handleOpenAddModal}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 font-medium transition-colors"
        >
          <Plus size={20} />
          Add Post
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 flex-1 flex flex-col overflow-hidden">
        <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50/50">
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search posts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
            />
          </div>
          <div className="text-sm text-gray-500 font-medium">
            Total Posts: {blogList.length}
          </div>
        </div>

        <div className="flex-1 overflow-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50 sticky top-0 z-10 shadow-sm">
              <tr>
                <th className="px-6 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Image</th>
                <th className="px-6 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Title</th>
                <th className="px-6 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Author</th>
                <th className="px-6 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                    <div className="flex justify-center mb-2"><div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600"></div></div>
                    Loading posts...
                  </td>
                </tr>
              ) : filteredBlogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                    No blog posts found.
                  </td>
                </tr>
              ) : (
                filteredBlogs.map((blog) => (
                  <tr key={blog.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      {blog.image ? (
                        <img src={blog.image} alt={blog.title} className="w-12 h-12 rounded object-cover border border-gray-200" />
                      ) : (
                        <div className="w-12 h-12 rounded bg-gray-100 border border-gray-200 flex items-center justify-center text-gray-400">
                          <ImageIcon size={20} />
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-semibold text-gray-900">{blog.title}</div>
                      {blog.sinhalaTitle && <div className="text-xs text-gray-500 mt-1">{blog.sinhalaTitle}</div>}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {blog.authorAvatar ? (
                          <img src={blog.authorAvatar} alt={blog.authorName} className="w-6 h-6 rounded-full object-cover" />
                        ) : (
                          <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-xs text-gray-500 font-bold">
                            {blog.authorName.charAt(0)}
                          </div>
                        )}
                        <span className="text-sm text-gray-700">{blog.authorName}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(blog.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleOpenEditModal(blog)}
                        className="text-indigo-600 hover:text-indigo-900 mr-4"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(blog.id)}
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

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-6xl max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                {isEditMode ? 'Edit Blog Post' : 'Add Blog Post'}
              </h2>
              <button onClick={handleCloseModal} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveBlog} className="p-6 overflow-y-auto flex-1">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* Left Column: Basic Details & Author */}
                <div className="space-y-4">
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-4">
                    <h3 className="text-sm font-bold text-gray-700 border-b border-gray-200 pb-2">Post Details</h3>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                      <input
                        type="text"
                        required
                        value={currentBlog.title || ''}
                        onChange={(e) => {
                          const val = e.target.value;
                          setCurrentBlog({ ...currentBlog, title: val, slug: generateSlug(val) });
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Sinhala Title</label>
                      <input
                        type="text"
                        value={currentBlog.sinhalaTitle || ''}
                        onChange={(e) => setCurrentBlog({ ...currentBlog, sinhalaTitle: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">URL Slug *</label>
                      <input
                        type="text"
                        required
                        value={currentBlog.slug || ''}
                        onChange={(e) => setCurrentBlog({ ...currentBlog, slug: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-gray-100"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Main Cover Image</label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => e.target.files && setImageFile(e.target.files[0])}
                        className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
                      />
                      {currentBlog.image && !imageFile && (
                        <img src={currentBlog.image} alt="Current cover" className="mt-2 h-20 rounded border border-gray-200" />
                      )}
                    </div>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-4">
                    <h3 className="text-sm font-bold text-gray-700 border-b border-gray-200 pb-2">Author Details</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Author Name *</label>
                        <input
                          type="text"
                          required
                          value={currentBlog.authorName || ''}
                          onChange={(e) => setCurrentBlog({ ...currentBlog, authorName: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Author Email</label>
                        <input
                          type="email"
                          value={currentBlog.authorEmail || ''}
                          onChange={(e) => setCurrentBlog({ ...currentBlog, authorEmail: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Author Avatar (Small)</label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => e.target.files && setAvatarFile(e.target.files[0])}
                        className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
                      />
                      {currentBlog.authorAvatar && !avatarFile && (
                        <img src={currentBlog.authorAvatar} alt="Current avatar" className="mt-2 h-10 w-10 rounded-full border border-gray-200 object-cover" />
                      )}
                    </div>
                  </div>
                </div>

                {/* Right Column: Rich Text Content */}
                <div className="space-y-4 flex flex-col h-full">
                  <div className="flex border-b border-gray-200">
                    <button
                      type="button"
                      onClick={() => setActiveTab('EN')}
                      className={`py-2 px-4 text-sm font-medium border-b-2 transition-colors ${
                        activeTab === 'EN'
                          ? 'border-green-500 text-green-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      English Content
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
                      සිංහල Content (Sinhala)
                    </button>
                  </div>

                  <div className={activeTab === 'EN' ? 'block space-y-8 flex-1' : 'hidden'}>
                    <div className="h-[400px]">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Post Body (English) *</label>
                      <RichTextEditor
                        value={currentBlog.content || ''}
                        onChange={handleContentChange}
                        placeholder="Write the full blog post here..."
                      />
                    </div>
                  </div>

                  <div className={activeTab === 'SI' ? 'block space-y-8 flex-1' : 'hidden'}>
                    <div className="h-[400px]">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Post Body (Sinhala) - ලිපිය</label>
                      <RichTextEditor
                        value={currentBlog.sinhalaContent || ''}
                        onChange={handleSinhalaContentChange}
                        placeholder="ලිපියේ විස්තරය සිංහලෙන් ඇතුලත් කරන්න..."
                      />
                    </div>
                  </div>
                </div>

              </div>

              <div className="mt-8 flex justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium shadow-sm disabled:opacity-50 flex items-center gap-2"
                >
                  {isSaving && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>}
                  {isEditMode ? 'Update Post' : 'Publish Post'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
