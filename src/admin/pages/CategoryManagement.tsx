import { useState, useEffect, useRef } from 'react';
import { Plus, Edit, Trash2, X, FolderOpen, Upload, Sprout } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

interface Category {
  id: string; 
  name: string; 
  sinhalaName?: string | null; 
  slug: string;
  parentId?: string | null; 
  order?: number; 
  image?: string | null;
  headerImage?: string | null;
  children?: Category[];
}

const defaultForm = { name: '', sinhalaName: '', slug: '', parentId: '', order: '0' };

export default function CategoryManagement() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ ...defaultForm });
  
  // Card / Icon Image states
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [existingImageUrl, setExistingImageUrl] = useState<string | null>(null);
  const [removeImageFlag, setRemoveImageFlag] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Header / Hero Banner Image states
  const [headerImageFile, setHeaderImageFile] = useState<File | null>(null);
  const [headerPreviewUrl, setHeaderPreviewUrl] = useState<string | null>(null);
  const [existingHeaderImageUrl, setExistingHeaderImageUrl] = useState<string | null>(null);
  const [removeHeaderImageFlag, setRemoveHeaderImageFlag] = useState(false);
  const headerFileInputRef = useRef<HTMLInputElement | null>(null);

  const [isSaving, setIsSaving] = useState(false);

  const token = localStorage.getItem('admin_token');
  const authHeaders = { Authorization: `Bearer ${token}` };

  const fetchCategories = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/categories/tree`, { headers: authHeaders });
      if (res.ok) {
        const data = await res.json();
        setCategories(data || []);
      }
    } finally { 
      setIsLoading(false); 
    }
  };

  useEffect(() => { 
    fetchCategories(); 
  }, []);

  const handleCardFileChange = (file: File | null) => {
    if (!file) return;
    setImageFile(file);
    setRemoveImageFlag(false);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleRemoveCardImage = () => {
    setImageFile(null);
    setPreviewUrl(null);
    setExistingImageUrl(null);
    setRemoveImageFlag(true);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleHeaderFileChange = (file: File | null) => {
    if (!file) return;
    setHeaderImageFile(file);
    setRemoveHeaderImageFlag(false);
    setHeaderPreviewUrl(URL.createObjectURL(file));
  };

  const handleRemoveHeaderImage = () => {
    setHeaderImageFile(null);
    setHeaderPreviewUrl(null);
    setExistingHeaderImageUrl(null);
    setRemoveHeaderImageFlag(true);
    if (headerFileInputRef.current) headerFileInputRef.current.value = '';
  };

  const openCreate = (parentId = '') => { 
    setForm({ ...defaultForm, parentId, order: '0' }); 
    setImageFile(null); 
    setPreviewUrl(null);
    setExistingImageUrl(null);
    setRemoveImageFlag(false);
    setHeaderImageFile(null);
    setHeaderPreviewUrl(null);
    setExistingHeaderImageUrl(null);
    setRemoveHeaderImageFlag(false);
    setEditingId(null); 
    setIsModalOpen(true); 
  };
  
  const openEdit = (cat: Category) => {
    setForm({ 
      name: cat.name, 
      sinhalaName: cat.sinhalaName || '', 
      slug: cat.slug, 
      parentId: cat.parentId || '', 
      order: String(cat.order !== undefined && cat.order !== null ? cat.order : 0) 
    });
    setImageFile(null); 
    setPreviewUrl(null);
    setExistingImageUrl(cat.image || null);
    setRemoveImageFlag(false);
    setHeaderImageFile(null);
    setHeaderPreviewUrl(null);
    setExistingHeaderImageUrl(cat.headerImage || null);
    setRemoveHeaderImageFlag(false);
    setEditingId(cat.id); 
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const fd = new FormData();
      fd.append('name', form.name);
      fd.append('sinhalaName', form.sinhalaName || '');
      fd.append('slug', form.slug);
      fd.append('parentId', form.parentId || '');
      fd.append('order', form.order || '0');
      
      // Card image
      if (imageFile) {
        fd.append('image', imageFile);
      } else if (removeImageFlag) {
        fd.append('removeImage', 'true');
      }

      // Header image
      if (headerImageFile) {
        fd.append('headerImage', headerImageFile);
      } else if (removeHeaderImageFlag) {
        fd.append('removeHeaderImage', 'true');
      }
      
      const method = editingId ? 'PUT' : 'POST';
      const url = editingId ? `${API_BASE_URL}/categories/${editingId}` : `${API_BASE_URL}/categories`;
      const res = await fetch(url, { method, headers: authHeaders, body: fd });
      
      if (res.ok) { 
        setIsModalOpen(false); 
        await fetchCategories(); 
      } else { 
        const err = await res.json(); 
        alert(err.error || 'Failed to save category'); 
      }
    } catch (err) {
      console.error(err);
      alert('Failed to save category.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this category and all its sub-categories?')) return;
    try {
      const res = await fetch(`${API_BASE_URL}/categories/${id}`, { method: 'DELETE', headers: authHeaders });
      if (res.ok) {
        fetchCategories();
      } else { 
        const err = await res.json(); 
        alert(err.error || 'Failed to delete'); 
      }
    } catch (err) {
      console.error(err);
      alert('Failed to delete category.');
    }
  };

  const activeCardImage = previewUrl || existingImageUrl;
  const isSvg = activeCardImage?.toLowerCase().includes('.svg') || imageFile?.name.toLowerCase().endsWith('.svg');

  const activeHeaderImage = headerPreviewUrl || existingHeaderImageUrl;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Category Management</h1>
          <p className="text-sm text-gray-500 mt-1">Manage agro item categories and sub-categories</p>
        </div>
        <button onClick={() => openCreate('')} className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">
          <Plus size={18} /> Add Main Category
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center items-center py-20"><div className="w-8 h-8 border-4 border-green-200 border-t-green-600 rounded-full animate-spin" /></div>
        ) : (
          <div className="divide-y divide-gray-100">
            {categories.length === 0 ? (
              <div className="text-center py-12 text-gray-400"><FolderOpen className="mx-auto mb-2" size={32} /><p>No categories found</p></div>
            ) : categories.map(mainCat => (
              <div key={mainCat.id} className="p-4 hover:bg-gray-50/50 transition-colors border-b border-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {mainCat.image ? (
                      <div 
                        className="w-12 h-12 rounded-lg border border-gray-100 flex items-center justify-center overflow-hidden shrink-0 bg-white shadow-xs"
                        style={{
                          backgroundImage: `linear-gradient(45deg, #f8fafc 25%, transparent 25%), linear-gradient(-45deg, #f8fafc 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #f8fafc 75%), linear-gradient(-45deg, transparent 75%, #f8fafc 75%)`,
                          backgroundSize: '8px 8px',
                          backgroundPosition: '0 0, 0 4px, 4px -4px, -4px 0px'
                        }}
                      >
                        <img src={mainCat.image} alt="" className="w-full h-full object-contain p-1" />
                      </div>
                    ) : (
                      <div className="w-12 h-12 bg-green-100 text-green-600 rounded-lg flex items-center justify-center">
                        <FolderOpen size={24} />
                      </div>
                    )}
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-gray-800 text-lg">{mainCat.name}</h3>
                        {mainCat.headerImage && (
                          <span className="text-[10px] bg-blue-50 text-blue-600 font-medium px-2 py-0.5 rounded border border-blue-200">
                            Header Banner
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-sm text-gray-500 font-mono">{mainCat.slug}</span>
                        <span className="text-sm text-gray-400">|</span>
                        <span className="text-sm text-gray-500">{mainCat.sinhalaName || 'No Sinhala Name'}</span>
                        <span className="text-sm text-gray-400">|</span>
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded font-mono">Order: {mainCat.order ?? 0}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => openCreate(mainCat.id)} className="px-3 py-1.5 text-sm bg-green-50 text-green-600 hover:bg-green-100 rounded-lg font-medium transition-colors">
                      + Sub Category
                    </button>
                    <button onClick={() => openEdit(mainCat)} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"><Edit size={16} /></button>
                    <button onClick={() => handleDelete(mainCat.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={16} /></button>
                  </div>
                </div>

                {/* Sub Categories */}
                {mainCat.children && mainCat.children.length > 0 && (
                  <div className="mt-4 ml-14 pl-4 border-l-2 border-gray-100 space-y-2">
                    {mainCat.children.map(subCat => (
                      <div key={subCat.id} className="flex items-center justify-between bg-white border border-gray-100 p-3 rounded-lg hover:border-green-200 transition-colors">
                        <div className="flex items-center gap-3">
                          {subCat.image ? (
                            <img src={subCat.image} alt="" className="w-6 h-6 object-contain rounded" />
                          ) : (
                            <Sprout size={16} className="text-gray-400" />
                          )}
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-medium text-gray-800">{subCat.name}</p>
                              {subCat.headerImage && (
                                <span className="text-[9px] bg-blue-50 text-blue-600 font-medium px-1.5 py-0.2 rounded border border-blue-200">
                                  Header
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-xs text-gray-500 font-mono">{subCat.slug}</span>
                              <span className="text-xs text-gray-400">|</span>
                              <span className="text-xs text-gray-500">{subCat.sinhalaName || 'No Sinhala Name'}</span>
                              <span className="text-xs text-gray-400">|</span>
                              <span className="text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.2 rounded font-mono">Order: {subCat.order ?? 0}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button onClick={() => openEdit(subCat)} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"><Edit size={14} /></button>
                          <button onClick={() => handleDelete(subCat.id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"><Trash2 size={14} /></button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => !isSaving && setIsModalOpen(false)} />
          <div className="bg-white rounded-2xl w-full max-w-xl relative z-10 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-800">{editingId ? 'Edit Category' : (form.parentId ? 'Add Sub Category' : 'Add Main Category')}</h2>
              <button onClick={() => setIsModalOpen(false)} disabled={isSaving} className="p-2 hover:bg-gray-100 rounded-lg transition-colors"><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name (EN) *</label>
                  <input required value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/50 text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name (SI)</label>
                  <input value={form.sinhalaName} onChange={e => setForm({...form, sinhalaName: e.target.value})} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/50 text-sm" />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Slug *</label>
                  <input required value={form.slug} onChange={e => setForm({...form, slug: e.target.value})} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/50 text-sm font-mono" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Parent Category</label>
                  <select 
                    value={form.parentId} 
                    onChange={e => setForm({...form, parentId: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/50 bg-white text-sm"
                  >
                    <option value="">None (Top-level Category)</option>
                    {categories
                      .filter(cat => cat.id !== editingId)
                      .map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Order</label>
                  <input type="number" value={form.order} onChange={e => setForm({...form, order: e.target.value})} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/50 text-sm" />
                </div>
              </div>
              
              {/* 1st Image: Card / Icon Image */}
              <div className="border-t border-gray-100 pt-4">
                <div className="flex items-center justify-between mb-1.5">
                  <div>
                    <label className="block text-sm font-semibold text-gray-800">1. Card / Icon Image</label>
                    <span className="text-xs text-gray-500">Displayed on category cards (SVG, PNG, JPG)</span>
                  </div>
                </div>

                <input 
                  id="category-card-image-input"
                  ref={fileInputRef}
                  type="file" 
                  accept="image/png, image/svg+xml, image/jpeg, image/jpg, image/webp, .svg, .png, .jpg, .jpeg, .webp" 
                  className="hidden" 
                  onChange={e => {
                    handleCardFileChange(e.target.files?.[0] || null);
                    e.target.value = '';
                  }} 
                />

                {activeCardImage ? (
                  <div className="flex items-center gap-3 p-3 border border-gray-200 rounded-xl bg-gray-50/60 mt-2">
                    <div 
                      className="w-14 h-14 rounded-lg border border-gray-200 bg-white flex items-center justify-center p-1 overflow-hidden shrink-0"
                      style={{
                        backgroundImage: `linear-gradient(45deg, #f1f5f9 25%, transparent 25%), linear-gradient(-45deg, #f1f5f9 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #f1f5f9 75%), linear-gradient(-45deg, transparent 75%, #f1f5f9 75%)`,
                        backgroundSize: '8px 8px',
                        backgroundPosition: '0 0, 0 4px, 4px -4px, -4px 0px'
                      }}
                    >
                      <img src={activeCardImage} alt="Card Icon Preview" className="max-w-full max-h-full object-contain" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${isSvg ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-green-50 text-green-700 border-green-200'}`}>
                          {isSvg ? 'SVG Icon' : 'Image'}
                        </span>
                        <p className="text-xs text-gray-600 truncate">
                          {imageFile ? imageFile.name : 'Current Card Image'}
                        </p>
                      </div>
                      <div className="flex items-center gap-3 mt-1.5">
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="text-xs font-semibold text-blue-600 hover:text-blue-700 cursor-pointer"
                        >
                          Change
                        </button>
                        <span className="text-gray-300">|</span>
                        <button
                          type="button"
                          onClick={handleRemoveCardImage}
                          className="text-xs font-semibold text-red-600 hover:text-red-700 cursor-pointer"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <label 
                    htmlFor="category-card-image-input"
                    className="flex items-center justify-center gap-2 px-4 py-3 border border-gray-200 border-dashed rounded-xl cursor-pointer hover:border-green-400 hover:bg-green-50/20 transition-all mt-2"
                  >
                    <Upload size={16} className="text-gray-400" />
                    <span className="text-xs font-medium text-gray-600">Choose Card Icon / Graphic (SVG, PNG)...</span>
                  </label>
                )}
              </div>

              {/* 2nd Image: Header / Hero Banner Image */}
              <div className="border-t border-gray-100 pt-4">
                <div className="flex items-center justify-between mb-1.5">
                  <div>
                    <label className="block text-sm font-semibold text-gray-800">2. Header / Hero Banner Image</label>
                    <span className="text-xs text-gray-500">Displayed at the top of category detail pages (JPG, PNG, WEBP)</span>
                  </div>
                </div>

                <input 
                  id="category-header-image-input"
                  ref={headerFileInputRef}
                  type="file" 
                  accept="image/png, image/jpeg, image/jpg, image/webp, .png, .jpg, .jpeg, .webp" 
                  className="hidden" 
                  onChange={e => {
                    handleHeaderFileChange(e.target.files?.[0] || null);
                    e.target.value = '';
                  }} 
                />

                {activeHeaderImage ? (
                  <div className="relative rounded-xl overflow-hidden border border-gray-200 bg-gray-900 group aspect-[16/6] mt-2">
                    <img 
                      src={activeHeaderImage} 
                      alt="Header Banner Preview" 
                      className="w-full h-full object-cover" 
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                      <button
                        type="button"
                        onClick={() => headerFileInputRef.current?.click()}
                        className="px-3 py-1.5 bg-white text-gray-800 text-xs font-semibold rounded-lg shadow hover:bg-gray-100 transition-colors"
                      >
                        Change Banner
                      </button>
                      <button
                        type="button"
                        onClick={handleRemoveHeaderImage}
                        className="px-3 py-1.5 bg-red-600 text-white text-xs font-semibold rounded-lg shadow hover:bg-red-700 transition-colors"
                      >
                        Remove Banner
                      </button>
                    </div>
                  </div>
                ) : (
                  <label 
                    htmlFor="category-header-image-input"
                    className="flex flex-col items-center justify-center gap-1.5 py-4 border border-gray-200 border-dashed rounded-xl cursor-pointer hover:border-green-400 hover:bg-green-50/20 transition-all mt-2"
                  >
                    <Upload size={18} className="text-gray-400" />
                    <span className="text-xs font-medium text-gray-600">Choose Header Banner Image (JPG, PNG, WEBP)...</span>
                    <span className="text-[11px] text-gray-400">Recommended wide aspect ratio (1920x600)</span>
                  </label>
                )}
              </div>
              
              <div className="flex gap-3 pt-4 border-t border-gray-100">
                <button type="button" disabled={isSaving} onClick={() => setIsModalOpen(false)} className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 font-medium transition-colors text-sm">Cancel</button>
                <button type="submit" disabled={isSaving} className="flex-1 px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 text-sm shadow-sm">
                  {isSaving ? 'Saving...' : (editingId ? 'Update Category' : 'Create Category')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
