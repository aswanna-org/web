import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, X, Search, ShoppingBag, Upload, Eye, ExternalLink } from 'lucide-react';
import Pagination from '../../components/admin/Pagination';
import RichTextEditor from '../components/RichTextEditor';
import AgroLoader from '../../components/common/AgroLoader';
import { useConfirm } from '../components/ConfirmDialog';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

interface Product {
  id: string; name: string; sinhalaName?: string; slug: string; description?: string; sinhalaDescription?: string;
  price?: number; quantity?: number; image?: string; category?: string; categorySinhala?: string;
}

const PREDEFINED_CATEGORIES = ['Pohora', 'Upakarana', 'Bija', 'Prakashana'];
const defaultForm = { name: '', sinhalaName: '', slug: '', description: '', sinhalaDescription: '', price: '', quantity: '', image: '', category: '', categorySinhala: '' };

export default function ProductManagement() {
  const { confirm } = useConfirm();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [viewingProduct, setViewingProduct] = useState<Product | null>(null);
  const [form, setForm] = useState({ ...defaultForm });
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [imageFile, setImageFile] = useState<File | null>(null);

  const token = localStorage.getItem('admin_token');
  const authHeaders = { Authorization: `Bearer ${token}` };

  const fetchProducts = async (page = 1) => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/products?page=${page}&limit=15&search=${search}`, { headers: authHeaders });
      if (res.ok) {
        const data = await res.json();
        setProducts(data.data || data.products || []);
        if (data.meta) setTotalPages(data.meta.totalPages);
      }
    } finally { setIsLoading(false); }
  };

  useEffect(() => { fetchProducts(currentPage); }, [currentPage, search]);

  const openCreate = () => { setForm({ ...defaultForm }); setImageFile(null); setEditingId(null); setIsModalOpen(true); };
  const openEdit = (prod: Product) => {
    setForm({
      name: prod.name,
      sinhalaName: prod.sinhalaName || '',
      slug: prod.slug,
      description: prod.description || '',
      sinhalaDescription: prod.sinhalaDescription || '',
      price: String(prod.price ?? ''),
      quantity: String(prod.quantity ?? ''),
      category: prod.category || '',
      categorySinhala: prod.categorySinhala || '',
      image: ''
    });
    setImageFile(null); setEditingId(prod.id); setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const fd = new FormData();
    fd.append('name', form.name);
    fd.append('sinhalaName', form.sinhalaName);
    fd.append('slug', form.slug);
    fd.append('description', form.description);
    fd.append('sinhalaDescription', form.sinhalaDescription);
    Object.entries(form).forEach(([k, v]) => {
      if (k !== 'name' && k !== 'sinhalaName' && k !== 'slug' && k !== 'description' && k !== 'sinhalaDescription') {
        fd.append(k, v);
      }
    });
    if (imageFile) fd.append('image', imageFile);
    const method = editingId ? 'PUT' : 'POST';
    const url = editingId ? `${API_BASE_URL}/products/${editingId}` : `${API_BASE_URL}/products`;
    const res = await fetch(url, { method, headers: authHeaders, body: fd });
    if (res.ok) { setIsModalOpen(false); fetchProducts(currentPage); }
  };

  const handleDelete = async (id: string) => {
    if (!await confirm({
      title: 'Delete Product',
      subtitle: 'භාණ්ඩය ස්ථිරවම ඉවත් කිරීම',
      message: 'Are you sure you want to delete this product? This action cannot be undone.',
      confirmText: 'Delete Product'
    })) return;
    await fetch(`${API_BASE_URL}/products/${id}`, { method: 'DELETE', headers: authHeaders });
    fetchProducts(currentPage);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Product Management</h1>
          <p className="text-sm text-gray-500 mt-1">Manage marketplace products</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">
          <Plus size={18} /> Add Product
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="relative max-w-md">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" placeholder="Search products..." value={search} onChange={e => { setSearch(e.target.value); setCurrentPage(1); }}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/50" />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center items-center py-20"><AgroLoader message="Loading products..." /></div>
        ) : (
          <table className="w-full text-left text-xs text-gray-700">
            <thead className="bg-gray-50/90 border-b border-gray-200 text-[11px] uppercase font-bold text-gray-500 whitespace-nowrap">
              <tr>
                <th className="px-3 py-2">Product</th>
                <th className="px-3 py-2">Category</th>
                <th className="px-3 py-2">Price</th>
                <th className="px-3 py-2">Qty</th>
                <th className="px-3 py-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {products.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-12 text-gray-400"><ShoppingBag className="mx-auto mb-2" size={32} /><p>No products found</p></td></tr>
              ) : products.map(p => (
                <tr key={p.id} className="hover:bg-gray-50/70 transition-colors">
                  <td className="px-3 py-1.5 whitespace-nowrap">
                    <div className="flex items-center gap-2 max-w-xs">
                      {p.image && <img src={p.image} alt="" className="w-6 h-6 rounded object-cover shrink-0 border border-gray-200" />}
                      <span className="font-semibold text-gray-900 truncate" title={p.name}>{p.name}</span>
                    </div>
                  </td>
                  <td className="px-3 py-1.5 whitespace-nowrap text-gray-600">{p.category || '-'}</td>
                  <td className="px-3 py-1.5 whitespace-nowrap font-bold text-emerald-700">Rs. {p.price?.toLocaleString() || '-'}</td>
                  <td className="px-3 py-1.5 whitespace-nowrap text-gray-600">{p.quantity ?? '-'}</td>
                  <td className="px-3 py-1.5 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => setViewingProduct(p)} title="View Product Details" className="p-1 text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 rounded transition-colors cursor-pointer"><Eye size={15} /></button>
                      <button onClick={() => openEdit(p)} title="Edit Product" className="p-1 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors cursor-pointer"><Edit size={15} /></button>
                      <button onClick={() => handleDelete(p.id)} title="Delete Product" className="p-1 text-gray-500 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors cursor-pointer"><Trash2 size={15} /></button>
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
              <h2 className="text-xl font-bold text-gray-800">{editingId ? 'Edit Product' : 'Add Product'}</h2>
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
                      <select value={form.category} onChange={e => setForm({...form, category: e.target.value})} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/50 bg-white">
                        <option value="">Select Category</option>
                        {PREDEFINED_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                    <div><label className="block text-sm font-medium text-gray-700 mb-1">Category (SI)</label><input value={form.categorySinhala} onChange={e => setForm({...form, categorySinhala: e.target.value})} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/50" /></div>
                    <div className="grid grid-cols-2 gap-4">
                      <div><label className="block text-sm font-medium text-gray-700 mb-1">Price (Rs.)</label><input type="number" value={form.price} onChange={e => setForm({...form, price: e.target.value})} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/50" /></div>
                      <div><label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label><input type="number" value={form.quantity} onChange={e => setForm({...form, quantity: e.target.value})} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/50" /></div>
                    </div>
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
                        <RichTextEditor value={form.description} onChange={value => setForm({...form, description: value})} placeholder="Enter product description in English..." />
                      </div>
                    </div>
                    <div className="pt-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Description (SI)</label>
                      <div className="h-[250px] mb-12">
                        <RichTextEditor value={form.sinhalaDescription} onChange={value => setForm({...form, sinhalaDescription: value})} placeholder="Enter product description in Sinhala..." />
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
      {/* Product Details Preview Modal */}
      {viewingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setViewingProduct(null)} />
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl relative z-10 overflow-hidden border border-gray-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between p-4 sm:p-5 border-b border-gray-100 bg-gray-50/70 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center border border-emerald-200 shrink-0">
                  <ShoppingBag size={16} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-sm sm:text-base leading-tight">Product Details</h3>
                  <p className="text-[11px] text-gray-500">නිෂ්පාදනයේ සම්පූර්ණ තොරතුරු</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {viewingProduct.slug && (
                  <a
                    href={`/products/${viewingProduct.slug}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors cursor-pointer"
                  >
                    <ExternalLink size={13} />
                    <span className="hidden sm:inline">Public Page</span>
                  </a>
                )}
                <button
                  onClick={() => setViewingProduct(null)}
                  className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            <div className="p-5 sm:p-6 overflow-y-auto space-y-4">
              {viewingProduct.image && (
                <div className="w-full h-48 rounded-xl overflow-hidden border border-gray-200 bg-gray-100 flex items-center justify-center">
                  <img src={viewingProduct.image} alt={viewingProduct.name} className="w-full h-full object-contain" />
                </div>
              )}

              <div>
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  {viewingProduct.category && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                      {viewingProduct.category} {viewingProduct.categorySinhala ? `(${viewingProduct.categorySinhala})` : ''}
                    </span>
                  )}
                  {viewingProduct.slug && (
                    <span className="text-xs text-gray-400 font-mono">/{viewingProduct.slug}</span>
                  )}
                </div>
                <h2 className="text-lg font-bold text-gray-900">{viewingProduct.name}</h2>
                {viewingProduct.sinhalaName && <h3 className="text-sm font-semibold text-emerald-800 mt-0.5">{viewingProduct.sinhalaName}</h3>}
              </div>

              <div className="grid grid-cols-2 gap-3 bg-gray-50 p-4 rounded-xl border border-gray-100 text-xs">
                <div>
                  <span className="text-gray-400 block mb-0.5">Price</span>
                  <span className="font-bold text-emerald-700 text-sm">Rs. {viewingProduct.price?.toLocaleString() || '-'}</span>
                </div>
                <div>
                  <span className="text-gray-400 block mb-0.5">Available Quantity / Stock</span>
                  <span className="font-semibold text-gray-800 text-sm">{viewingProduct.quantity ?? '-'}</span>
                </div>
              </div>

              {viewingProduct.description && (
                <div>
                  <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Description (English)</h4>
                  <div className="text-xs text-gray-700 leading-relaxed bg-white p-3.5 rounded-xl border border-gray-100 rich-content" dangerouslySetInnerHTML={{ __html: viewingProduct.description }} />
                </div>
              )}

              {viewingProduct.sinhalaDescription && (
                <div>
                  <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">විස්තරය (Sinhala)</h4>
                  <div className="text-xs text-gray-700 leading-relaxed bg-white p-3.5 rounded-xl border border-gray-100 rich-content" dangerouslySetInnerHTML={{ __html: viewingProduct.sinhalaDescription }} />
                </div>
              )}
            </div>

            <div className="p-4 border-t border-gray-100 bg-gray-50/70 flex justify-end gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setViewingProduct(null)}
                className="px-4 py-1.5 border border-gray-200 rounded-lg text-xs font-medium text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  const p = viewingProduct;
                  setViewingProduct(null);
                  openEdit(p);
                }}
                className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer"
              >
                Edit Product
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
