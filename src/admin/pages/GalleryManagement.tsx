import { useState, useEffect } from 'react';
import { 
  Plus, Edit, Trash2, X, Search, Image as ImageIcon, Video, Upload, 
  Layers, ExternalLink, RefreshCw, CheckCircle2, AlertCircle 
} from 'lucide-react';
import Pagination from '../../components/admin/Pagination';
import AgroLoader from '../../components/common/AgroLoader';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

interface GalleryItem {
  id: string;
  title: string;
  sinhalaTitle?: string;
  slug: string;
  type: 'IMAGE' | 'VIDEO';
  url: string;
  images?: string[];
  description?: string;
  sinhalaDescription?: string;
  createdAt: string;
}

const defaultForm = {
  title: '',
  sinhalaTitle: '',
  slug: '',
  type: 'IMAGE' as 'IMAGE' | 'VIDEO',
  url: '',
  description: '',
  sinhalaDescription: '',
};

export default function GalleryManagement() {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<typeof defaultForm>({ ...defaultForm });
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);

  // Images state
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [newImageFiles, setNewImageFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const token = localStorage.getItem('admin_token');
  const authHeaders = { Authorization: `Bearer ${token}` };

  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
  };

  const fetchItems = async (page = 1) => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/gallery?page=${page}&limit=15`, { headers: authHeaders });
      if (res.ok) {
        const data = await res.json();
        setItems(data.data || []);
        if (data.meta) setTotalPages(data.meta.totalPages);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchItems(currentPage);
  }, [currentPage]);

  // Clean up object URLs when previews change or unmount
  useEffect(() => {
    const urls = newImageFiles.map(file => URL.createObjectURL(file));
    setPreviewUrls(urls);
    return () => {
      urls.forEach(url => URL.revokeObjectURL(url));
    };
  }, [newImageFiles]);

  const openCreate = () => {
    setForm({ ...defaultForm });
    setExistingImages([]);
    setNewImageFiles([]);
    setSlugManuallyEdited(false);
    setEditingId(null);
    setErrorMessage(null);
    setIsModalOpen(true);
  };

  const openEdit = (item: GalleryItem) => {
    setForm({
      title: item.title,
      sinhalaTitle: item.sinhalaTitle || '',
      slug: item.slug || '',
      type: item.type,
      url: item.url,
      description: item.description || '',
      sinhalaDescription: item.sinhalaDescription || '',
    });
    const currentImgs = (item.images && item.images.length > 0)
      ? [...item.images]
      : (item.url && item.type !== 'VIDEO' ? [item.url] : []);
    setExistingImages(currentImgs);
    setNewImageFiles([]);
    setSlugManuallyEdited(true);
    setEditingId(item.id);
    setErrorMessage(null);
    setIsModalOpen(true);
  };

  const handleTitleChange = (val: string) => {
    setForm(prev => {
      const updated = { ...prev, title: val };
      if (!slugManuallyEdited) {
        updated.slug = generateSlug(val);
      }
      return updated;
    });
  };

  const handleFilesSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const selected = Array.from(e.target.files);
    setNewImageFiles(prev => [...prev, ...selected]);
    e.target.value = ''; // Reset input to allow selecting same files again if needed
  };

  const removeNewFile = (index: number) => {
    setNewImageFiles(prev => prev.filter((_, idx) => idx !== index));
  };

  const removeExistingImage = (urlToRemove: string) => {
    setExistingImages(prev => prev.filter(url => url !== urlToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (form.type === 'IMAGE' && existingImages.length === 0 && newImageFiles.length === 0 && !form.url) {
      setErrorMessage('Please select at least one image file (single or bulk upload).');
      return;
    }

    if (form.type === 'VIDEO' && !form.url.trim()) {
      setErrorMessage('Please enter a YouTube video URL.');
      return;
    }

    setIsSubmitting(true);
    try {
      const fd = new FormData();
      fd.append('title', form.title.trim());
      fd.append('sinhalaTitle', form.sinhalaTitle.trim());
      fd.append('slug', (form.slug || generateSlug(form.title)).trim());
      fd.append('type', form.type);
      fd.append('description', form.description.trim());
      fd.append('sinhalaDescription', form.sinhalaDescription.trim());

      if (form.type === 'VIDEO') {
        fd.append('url', form.url.trim());
      } else {
        // Send retained existing image URLs
        fd.append('retainedImages', JSON.stringify(existingImages));
        if (form.url && !existingImages.includes(form.url)) {
          fd.append('url', form.url.trim());
        }
        // Send all newly selected image files
        newImageFiles.forEach(file => {
          fd.append('images', file);
        });
      }

      const method = editingId ? 'PUT' : 'POST';
      const endpoint = editingId ? `${API_BASE_URL}/gallery/${editingId}` : `${API_BASE_URL}/gallery`;
      const res = await fetch(endpoint, { method, headers: authHeaders, body: fd });

      if (res.ok) {
        setIsModalOpen(false);
        fetchItems(currentPage);
      } else {
        const errData = await res.json().catch(() => ({}));
        setErrorMessage(errData.error || 'Failed to save gallery item.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Error occurred while saving gallery item.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this gallery item? All associated images will be permanently deleted.')) return;
    try {
      const res = await fetch(`${API_BASE_URL}/gallery/${id}`, { method: 'DELETE', headers: authHeaders });
      if (res.ok) {
        fetchItems(currentPage);
      } else {
        alert('Failed to delete gallery item.');
      }
    } catch {
      alert('Error connecting to server.');
    }
  };

  const filteredItems = items.filter(i => 
    i.title.toLowerCase().includes(search.toLowerCase()) ||
    (i.slug && i.slug.toLowerCase().includes(search.toLowerCase())) ||
    (i.sinhalaTitle && i.sinhalaTitle.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Gallery Management</h1>
          <p className="text-sm text-gray-500 mt-1">Manage single photos, bulk albums, and videos with unified titles & slugs</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2.5 rounded-xl font-medium shadow-sm transition-all hover:shadow"
        >
          <Plus size={18} /> Add Media / Album
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="relative max-w-md">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by title or slug..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/50"
          />
        </div>
      </div>

      {/* Table List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center items-center py-20"><AgroLoader message="Loading gallery..." /></div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Preview</th>
                <th className="text-left px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Title & Slug</th>
                <th className="text-left px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Type</th>
                <th className="text-left px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Media Count</th>
                <th className="text-right px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-16 text-gray-400">
                    <ImageIcon className="mx-auto mb-2 text-gray-300" size={36} />
                    <p className="font-medium">No gallery items found</p>
                  </td>
                </tr>
              ) : filteredItems.map(item => {
                const imgCount = item.type === 'IMAGE' 
                  ? ((item.images && item.images.length > 0) ? item.images.length : (item.url ? 1 : 0))
                  : 1;

                return (
                  <tr key={item.id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="px-6 py-4">
                      <div className="relative w-16 h-12 rounded-lg overflow-hidden bg-gray-100 border border-gray-200 shadow-sm flex items-center justify-center">
                        {item.type === 'IMAGE' ? (
                          item.url ? (
                            <>
                              <img src={item.url} alt={item.title} className="w-full h-full object-cover" />
                              {imgCount > 1 && (
                                <span className="absolute bottom-1 right-1 bg-black/75 text-white text-[10px] px-1.5 py-0.5 rounded font-bold backdrop-blur-xs">
                                  +{imgCount - 1}
                                </span>
                              )}
                            </>
                          ) : (
                            <ImageIcon size={20} className="text-gray-400" />
                          )
                        ) : (
                          <div className="bg-purple-100 w-full h-full flex items-center justify-center text-purple-600">
                            <Video size={20} />
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-gray-900 leading-snug">{item.title}</div>
                      {item.sinhalaTitle && (
                        <div className="text-xs text-gray-500 font-normal mt-0.5">{item.sinhalaTitle}</div>
                      )}
                      {item.slug && (
                        <div className="mt-1 flex items-center gap-1 text-[11px] text-gray-400 font-mono">
                          <span className="bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">
                            slug: {item.slug}
                          </span>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${
                        item.type === 'IMAGE' 
                          ? 'bg-blue-50 text-blue-700 border border-blue-200' 
                          : 'bg-purple-50 text-purple-700 border border-purple-200'
                      }`}>
                        {item.type === 'IMAGE' ? <ImageIcon size={12} /> : <Video size={12} />}
                        {item.type === 'IMAGE' ? (imgCount > 1 ? 'ALBUM' : 'PHOTO') : 'VIDEO'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {item.type === 'IMAGE' ? (
                        <div className="flex items-center gap-1.5 text-xs font-medium text-gray-700">
                          <Layers size={14} className="text-blue-500" />
                          <span>{imgCount} {imgCount === 1 ? 'Photo' : 'Photos'}</span>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-500">1 Video</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center gap-1.5 justify-end">
                        {item.slug && (
                          <a
                            href={`/gallery/${item.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            title="View on website"
                            className="p-2 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                          >
                            <ExternalLink size={16} />
                          </a>
                        )}
                        <button
                          onClick={() => openEdit(item)}
                          title="Edit"
                          className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          title="Delete"
                          className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
        {totalPages > 1 && <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />}
      </div>

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-xs transition-opacity" onClick={() => !isSubmitting && setIsModalOpen(false)} />
          <div className="bg-white rounded-2xl w-full max-w-2xl relative z-10 shadow-2xl max-h-[92vh] flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/50">
              <div>
                <h2 className="text-lg font-bold text-gray-800">
                  {editingId ? 'Edit Media / Album' : 'Add Media / Album (Single or Bulk)'}
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">Upload single or bulk photos under a single title and custom slug</p>
              </div>
              <button 
                onClick={() => !isSubmitting && setIsModalOpen(false)} 
                className="p-1.5 hover:bg-gray-200/80 rounded-lg text-gray-500 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 flex-1">
              {errorMessage && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-sm text-red-700">
                  <AlertCircle size={16} className="shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Title row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                    Title (EN) <span className="text-red-500">*</span>
                  </label>
                  <input
                    required
                    value={form.title}
                    onChange={e => handleTitleChange(e.target.value)}
                    placeholder="e.g. Mahaweli Paddy Harvest 2026"
                    className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                    Title (SI)
                  </label>
                  <input
                    value={form.sinhalaTitle}
                    onChange={e => setForm({ ...form, sinhalaTitle: e.target.value })}
                    placeholder="උදා: මහවැලි වී අස්වැන්න 2026"
                    className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500 transition-all"
                  />
                </div>
              </div>

              {/* Slug Input */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    URL Slug <span className="text-gray-400 font-normal normal-case">(Auto-generated, unique identifier)</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setForm(prev => ({ ...prev, slug: generateSlug(prev.title) }));
                      setSlugManuallyEdited(false);
                    }}
                    className="text-[11px] text-green-600 hover:text-green-700 flex items-center gap-1 font-medium hover:underline"
                  >
                    <RefreshCw size={11} /> Auto-generate from Title
                  </button>
                </div>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-mono text-gray-400 select-none">
                    /gallery/
                  </span>
                  <input
                    required
                    value={form.slug}
                    onChange={e => {
                      setForm({ ...form, slug: e.target.value });
                      setSlugManuallyEdited(true);
                    }}
                    placeholder="mahaweli-paddy-harvest-2026"
                    className="w-full pl-20 pr-3.5 py-2.5 text-sm font-mono border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500 transition-all"
                  />
                </div>
              </div>

              {/* Media Type */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                  Media Type
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, type: 'IMAGE' })}
                    className={`flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border text-sm font-medium transition-all ${
                      form.type === 'IMAGE'
                        ? 'border-green-600 bg-green-50 text-green-700 ring-2 ring-green-600/20'
                        : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <ImageIcon size={16} /> Photo / Bulk Album
                  </button>
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, type: 'VIDEO' })}
                    className={`flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border text-sm font-medium transition-all ${
                      form.type === 'VIDEO'
                        ? 'border-purple-600 bg-purple-50 text-purple-700 ring-2 ring-purple-600/20'
                        : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <Video size={16} /> YouTube Video
                  </button>
                </div>
              </div>

              {/* IMAGE UPLOAD SECTION (Bulk & Single) */}
              {form.type === 'IMAGE' && (
                <div className="space-y-4 pt-1">
                  {/* File input box */}
                  <div className="border-2 border-dashed border-gray-200 hover:border-green-500 rounded-2xl p-6 text-center transition-colors bg-gray-50/50 hover:bg-green-50/30">
                    <input
                      type="file"
                      id="bulk-image-upload"
                      multiple
                      accept="image/*"
                      onChange={handleFilesSelected}
                      className="hidden"
                    />
                    <label htmlFor="bulk-image-upload" className="cursor-pointer flex flex-col items-center">
                      <div className="w-12 h-12 rounded-full bg-green-100 text-green-600 flex items-center justify-center mb-3 shadow-inner">
                        <Upload size={22} />
                      </div>
                      <span className="text-sm font-semibold text-gray-800">
                        Click to select images (Single or Bulk)
                      </span>
                      <span className="text-xs text-gray-500 mt-1 max-w-sm">
                        You can select multiple photos at once. They will all be grouped together under this single title and slug.
                      </span>
                      <span className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-gray-200 rounded-lg text-xs font-medium text-gray-700 shadow-2xs">
                        <Layers size={13} className="text-green-600" /> Multi-select enabled
                      </span>
                    </label>
                  </div>

                  {/* Existing Images (Edit mode) */}
                  {existingImages.length > 0 && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          Existing Album Images ({existingImages.length})
                        </span>
                        <span className="text-[11px] text-gray-400">First image serves as the cover photo</span>
                      </div>
                      <div className="grid grid-cols-4 sm:grid-cols-6 gap-2.5 max-h-48 overflow-y-auto p-2 bg-gray-50 rounded-xl border border-gray-200">
                        {existingImages.map((url, idx) => (
                          <div key={url} className="relative group rounded-lg overflow-hidden aspect-square bg-gray-200 border border-gray-300">
                            <img src={url} alt={`Existing ${idx}`} className="w-full h-full object-cover" />
                            {idx === 0 && (
                              <span className="absolute top-1 left-1 bg-green-600 text-white text-[9px] px-1 py-0.5 rounded font-bold">
                                Cover
                              </span>
                            )}
                            <button
                              type="button"
                              onClick={() => removeExistingImage(url)}
                              className="absolute top-1 right-1 w-6 h-6 bg-red-600 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-md hover:bg-red-700"
                              title="Remove photo from album"
                            >
                              <X size={13} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Newly selected images preview */}
                  {newImageFiles.length > 0 && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-green-700 uppercase tracking-wider flex items-center gap-1">
                          <CheckCircle2 size={13} /> Newly Selected Images to Upload ({newImageFiles.length})
                        </span>
                        <button
                          type="button"
                          onClick={() => setNewImageFiles([])}
                          className="text-xs text-red-500 hover:underline"
                        >
                          Clear all new
                        </button>
                      </div>
                      <div className="grid grid-cols-4 sm:grid-cols-6 gap-2.5 max-h-48 overflow-y-auto p-2 bg-green-50/40 rounded-xl border border-green-200">
                        {previewUrls.map((previewUrl, idx) => (
                          <div key={idx} className="relative group rounded-lg overflow-hidden aspect-square bg-gray-200 border border-green-300">
                            <img src={previewUrl} alt={`New preview ${idx}`} className="w-full h-full object-cover" />
                            <button
                              type="button"
                              onClick={() => removeNewFile(idx)}
                              className="absolute top-1 right-1 w-6 h-6 bg-red-600 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-md hover:bg-red-700"
                              title="Remove from upload list"
                            >
                              <X size={13} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* VIDEO URL INPUT */}
              {form.type === 'VIDEO' && (
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                    YouTube URL <span className="text-red-500">*</span>
                  </label>
                  <input
                    required
                    value={form.url}
                    onChange={e => setForm({ ...form, url: e.target.value })}
                    placeholder="https://www.youtube.com/watch?v=..."
                    className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500 transition-all font-mono"
                  />
                </div>
              )}

              {/* Descriptions */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                    Description (EN)
                  </label>
                  <textarea
                    value={form.description}
                    onChange={e => setForm({ ...form, description: e.target.value })}
                    rows={3}
                    placeholder="Brief description of this album / photo..."
                    className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500 transition-all resize-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                    Description (SI)
                  </label>
                  <textarea
                    value={form.sinhalaDescription}
                    onChange={e => setForm({ ...form, sinhalaDescription: e.target.value })}
                    rows={3}
                    placeholder="කෙටි විස්තරය..."
                    className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500 transition-all resize-none"
                  />
                </div>
              </div>

              {/* Modal Footer Actions */}
              <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-gray-700 hover:bg-gray-50 font-medium transition-colors text-sm disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-xl font-medium shadow-sm transition-all hover:shadow text-sm disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>{newImageFiles.length > 0 ? `Uploading (${newImageFiles.length} photos)...` : 'Saving...'}</span>
                    </>
                  ) : (
                    <span>{editingId ? 'Save Changes' : (newImageFiles.length > 1 ? `Add Album (${newImageFiles.length} photos)` : 'Add Media')}</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
