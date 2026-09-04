import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, X, FolderOpen, Upload, Sprout } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

interface Category {
  id: string; 
  name: string; 
  sinhalaName?: string; 
  slug: string;
  parentId?: string; 
  order?: number; 
  image?: string;
  children?: Category[];
}

const defaultForm = { name: '', sinhalaName: '', slug: '', parentId: '', order: '0' };

export default function CategoryManagement() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ ...defaultForm });
  const [imageFile, setImageFile] = useState<File | null>(null);

  const token = localStorage.getItem('token');
  const authHeaders = { Authorization: `Bearer ${token}` };

  const fetchCategories = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/categories/tree`, { headers: authHeaders });
      if (res.ok) {
        const data = await res.json();
        setCategories(data || []);
      }
    } finally { setIsLoading(false); }
  };

  useEffect(() => { fetchCategories(); }, []);

  const openCreate = (parentId = '') => { 
    setForm({ ...defaultForm, parentId }); 
    setImageFile(null); 
    setEditingId(null); 
    setIsModalOpen(true); 
  };
  
  const openEdit = (cat: Category) => {
    setForm({ 
      name: cat.name, 
      sinhalaName: cat.sinhalaName || '', 
      slug: cat.slug, 
      parentId: cat.parentId || '', 
      order: String(cat.order ?? 0) 
    });
    setImageFile(null); 
    setEditingId(cat.id); 
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const fd = new FormData();
    fd.append('name', form.name);
    fd.append('sinhalaName', form.sinhalaName);
    fd.append('slug', form.slug);
    fd.append('parentId', form.parentId);
    fd.append('order', form.order);
    if (imageFile) fd.append('image', imageFile);
    
    const method = editingId ? 'PUT' : 'POST';
    const url = editingId ? `${API_BASE_URL}/categories/${editingId}` : `${API_BASE_URL}/categories`;
    const res = await fetch(url, { method, headers: authHeaders, body: fd });
    
    if (res.ok) { 
      setIsModalOpen(false); 
      fetchCategories(); 
    } else { 
      const err = await res.json(); 
      alert(err.error || 'Failed to save category'); 
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this category and all its sub-categories?')) return;
    const res = await fetch(`${API_BASE_URL}/categories/${id}`, { method: 'DELETE', headers: authHeaders });
    if (res.ok) fetchCategories();
    else { const err = await res.json(); alert(err.error || 'Failed to delete'); }
  };

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
                      <img src={mainCat.image} alt="" className="w-12 h-12 rounded-lg object-cover shadow-sm" />
                    ) : (
                      <div className="w-12 h-12 bg-green-100 text-green-600 rounded-lg flex items-center justify-center">
                        <FolderOpen size={24} />
                      </div>
                    )}
                    <div>
                      <h3 className="font-bold text-gray-800 text-lg">{mainCat.name}</h3>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-sm text-gray-500 font-mono">{mainCat.slug}</span>
                        <span className="text-sm text-gray-400">|</span>
                        <span className="text-sm text-gray-500">{mainCat.sinhalaName || 'No Sinhala Name'}</span>
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
                          <Sprout size={16} className="text-gray-400" />
                          <div>
                            <p className="font-medium text-gray-800">{subCat.name}</p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-xs text-gray-500 font-mono">{subCat.slug}</span>
                              <span className="text-xs text-gray-400">|</span>
                              <span className="text-xs text-gray-500">{subCat.sinhalaName || 'No Sinhala Name'}</span>
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
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
          <div className="bg-white rounded-2xl w-full max-w-lg relative z-10 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-800">{editingId ? 'Edit Category' : (form.parentId ? 'Add Sub Category' : 'Add Main Category')}</h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors"><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Name (EN) *</label><input required value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/50" /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Name (SI)</label><input value={form.sinhalaName} onChange={e => setForm({...form, sinhalaName: e.target.value})} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/50" /></div>
                <div className="col-span-2"><label className="block text-sm font-medium text-gray-700 mb-1">Slug *</label><input required value={form.slug} onChange={e => setForm({...form, slug: e.target.value})} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/50" /></div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Parent Category</label>
                  <select 
                    value={form.parentId} 
                    onChange={e => setForm({...form, parentId: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/50 bg-white"
                  >
                    <option value="">None (Top-level Category)</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
                <div className="col-span-2"><label className="block text-sm font-medium text-gray-700 mb-1">Order</label><input type="number" value={form.order} onChange={e => setForm({...form, order: e.target.value})} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/50" /></div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Image (Main categories usually)</label>
                <label className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                  <Upload size={16} className="text-gray-400" />
                  <span className="text-sm text-gray-500">{imageFile ? imageFile.name : 'Choose image...'}</span>
                  <input type="file" accept="image/*" className="hidden" onChange={e => setImageFile(e.target.files?.[0] || null)} />
                </label>
              </div>
              
              <div className="flex gap-3 pt-4">
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
