import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, X, Search, Package, Upload } from 'lucide-react';
import Pagination from '../../components/admin/Pagination';
import RichTextEditor from '../components/RichTextEditor';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

interface Category { id: string; name: string; }
interface DistrictShare { districtName: string; sinhalaDistrictName: string; percentage: number; }
interface SriLankaAgriData { cultivationArea: string; sinhalaCultivationArea: string; annualProduction: string; sinhalaAnnualProduction: string; averageYield: string; sinhalaAverageYield: string; districts: DistrictShare[]; }
interface GlobalAgriData { rank: number; countryName: string; sinhalaCountryName: string; production: string; cultivationArea: string; }

interface Item {
  id: string; name: string; sinhalaName?: string; slug: string; description?: string;
  sinhalaDescription?: string; scientificName?: string; location?: string; sinhalaLocation?: string;
  status?: string; images?: string | string[]; categoryId?: string; category?: Category; order?: number;
  slAgriData?: SriLankaAgriData; globalAgriData?: GlobalAgriData[];
}

const defaultForm = {
  name: '', sinhalaName: '', slug: '', scientificName: '', location: '', sinhalaLocation: '', status: 'AVAILABLE',
  description: '', sinhalaDescription: '', categoryId: '', order: '0',
  slAgriData: { cultivationArea: '', sinhalaCultivationArea: '', annualProduction: '', sinhalaAnnualProduction: '', averageYield: '', sinhalaAverageYield: '', districts: [] as DistrictShare[] },
  globalAgriData: [] as GlobalAgriData[]
};

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
  const [imageFile1, setImageFile1] = useState<File | null>(null);
  const [imageFile2, setImageFile2] = useState<File | null>(null);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<'EN' | 'SI' | 'SL_DATA' | 'GLOBAL_DATA'>('EN');
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const token = localStorage.getItem('admin_token');
  const authHeaders = { Authorization: `Bearer ${token}` };

  const fetchItems = async (page = 1) => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/items?page=${page}&limit=15`, { headers: authHeaders });
      if (res.ok) { const data = await res.json(); setItems(data.data || []); if (data.meta) setTotalPages(data.meta.totalPages); }
    } finally { setIsLoading(false); }
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/categories?limit=100`, { headers: authHeaders });
      if (res.ok) { const data = await res.json(); setCategories(data.data || []); }
    } catch (_) {}
  };

  useEffect(() => { fetchItems(currentPage); }, [currentPage]);
  useEffect(() => { fetchCategories(); }, []);

  const openCreate = () => { setForm({ ...defaultForm }); setImageFile1(null); setImageFile2(null); setExistingImages([]); setEditingId(null); setActiveTab('EN'); setSaveError(null); setIsModalOpen(true); };
  const openEdit = (item: Item) => {
    setForm({ name: item.name, sinhalaName: item.sinhalaName || '', slug: item.slug, scientificName: item.scientificName || '', location: item.location || '', sinhalaLocation: item.sinhalaLocation || '', status: item.status || 'AVAILABLE', description: item.description || '', sinhalaDescription: item.sinhalaDescription || '', categoryId: item.categoryId || '', order: String(item.order ?? 0), slAgriData: item.slAgriData || { cultivationArea: '', sinhalaCultivationArea: '', annualProduction: '', sinhalaAnnualProduction: '', averageYield: '', sinhalaAverageYield: '', districts: [] }, globalAgriData: item.globalAgriData || [] });
    const imgs = Array.isArray(item.images) ? item.images : (item.images ? [item.images as string] : []);
    setExistingImages(imgs); setImageFile1(null); setImageFile2(null); setEditingId(item.id); setActiveTab('EN'); setSaveError(null); setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setIsSaving(true); setSaveError(null);
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => { if (k === 'slAgriData' || k === 'globalAgriData') { fd.append(k, JSON.stringify(v)); } else { fd.append(k, String(v)); } });
    const finalImagesOrder: string[] = [];
    if (imageFile1) { fd.append('images', imageFile1); finalImagesOrder.push('NEW_FILE'); } else if (existingImages[0]) { finalImagesOrder.push(existingImages[0]); } else { finalImagesOrder.push(''); }
    if (imageFile2) { fd.append('images', imageFile2); finalImagesOrder.push('NEW_FILE'); } else if (existingImages[1]) { finalImagesOrder.push(existingImages[1]); } else { finalImagesOrder.push(''); }
    fd.append('imagesOrder', JSON.stringify(finalImagesOrder));
    try {
      const method = editingId ? 'PUT' : 'POST';
      const url = editingId ? `${API_BASE_URL}/items/${editingId}` : `${API_BASE_URL}/items`;
      const res = await fetch(url, { method, headers: authHeaders, body: fd });
      if (res.ok) { setIsModalOpen(false); fetchItems(currentPage); }
      else { const errData = await res.json().catch(() => ({})); setSaveError(errData.error || `Failed to save item (${res.status}).`); }
    } catch { setSaveError('Network error. Please check your connection.'); } finally { setIsSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this item?')) return;
    await fetch(`${API_BASE_URL}/items/${id}`, { method: 'DELETE', headers: authHeaders });
    fetchItems(currentPage);
  };

  const filteredItems = items.filter(i => i.name.toLowerCase().includes(search.toLowerCase()));
  const editorHeight = 'calc(95vh - 200px)';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-gray-800">Item Management</h1><p className="text-sm text-gray-500 mt-1">Manage agro information items</p></div>
        <button onClick={openCreate} className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"><Plus size={18} /> Add Item</button>
      </div>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="relative max-w-md">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" placeholder="Search items..." value={search} onChange={e => setSearch(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/50" />
        </div>
      </div>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {isLoading ? (<div className="flex justify-center items-center py-20"><div className="w-8 h-8 border-4 border-green-200 border-t-green-600 rounded-full animate-spin" /></div>) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100"><tr><th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Item</th><th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Category</th><th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Slug</th><th className="px-6 py-3" /></tr></thead>
            <tbody className="divide-y divide-gray-50">
              {filteredItems.length === 0 ? (<tr><td colSpan={4} className="text-center py-12 text-gray-400"><Package className="mx-auto mb-2" size={32} /><p>No items found</p></td></tr>) : filteredItems.map(item => (
                <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4"><div className="flex items-center gap-3">{item.images && (Array.isArray(item.images) ? item.images[0] : item.images) && <img src={Array.isArray(item.images) ? item.images[0] : (item.images as string)} alt="" className="w-10 h-10 rounded-lg object-cover shrink-0" />}<div><p className="font-medium text-gray-800">{item.name}</p>{item.sinhalaName && <p className="text-xs text-gray-500">{item.sinhalaName}</p>}</div></div></td>
                  <td className="px-6 py-4 text-gray-600">{item.category?.name || '-'}</td>
                  <td className="px-6 py-4 text-gray-500 font-mono text-xs">{item.slug}</td>
                  <td className="px-6 py-4"><div className="flex items-center gap-2 justify-end"><button onClick={() => openEdit(item)} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"><Edit size={16} /></button><button onClick={() => handleDelete(item.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={16} /></button></div></td>
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
          <div className="bg-white rounded-2xl w-[95vw] max-w-[1500px] relative z-10 shadow-2xl flex flex-col" style={{ height: '95vh' }}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
              <div><h2 className="text-xl font-bold text-gray-800">{editingId ? 'Edit Item' : 'Add Item'}</h2><p className="text-xs text-gray-400 mt-0.5">Fill in all details below. Required fields are marked with *</p></div>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-500"><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
              <div className="flex flex-1 min-h-0">
                {/* Left Sidebar */}
                <div className="w-[420px] shrink-0 border-r border-gray-100 overflow-y-auto p-5 space-y-4 bg-gray-50/50">
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider">Basic Info</label>
                  <div><label className="block text-sm font-medium text-gray-700 mb-1">Name (EN) *</label><input required value={form.name} onChange={e => {
                    const val = e.target.value;
                    if (!editingId) {
                      setForm({ ...form, name: val, slug: val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') });
                    } else {
                      setForm({ ...form, name: val });
                    }
                  }} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500/50 bg-white" /></div>
                  <div><label className="block text-sm font-medium text-gray-700 mb-1">Name (SI)</label><input value={form.sinhalaName} onChange={e => setForm({ ...form, sinhalaName: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500/50 bg-white" /></div>
                  <div><label className="block text-sm font-medium text-gray-700 mb-1">Scientific Name</label><input value={form.scientificName} onChange={e => setForm({ ...form, scientificName: e.target.value })} placeholder="e.g. Oryza sativa" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500/50 bg-white italic placeholder:not-italic placeholder:text-gray-400" /></div>
                  <div><label className="block text-sm font-medium text-gray-700 mb-1">Slug *</label><input required value={form.slug} onChange={e => setForm({ ...form, slug: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500/50 bg-white font-mono" /></div>
                  <div><label className="block text-sm font-medium text-gray-700 mb-1">Category</label><select value={form.categoryId} onChange={e => setForm({ ...form, categoryId: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500/50 bg-white"><option value="">Select Category</option>{categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
                  <div className="grid grid-cols-2 gap-2">
                    <div><label className="block text-sm font-medium text-gray-700 mb-1">Location (EN)</label><input value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500/50 bg-white" /></div>
                    <div><label className="block text-sm font-medium text-gray-700 mb-1">Location (SI)</label><input value={form.sinhalaLocation} onChange={e => setForm({ ...form, sinhalaLocation: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500/50 bg-white" /></div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div><label className="block text-sm font-medium text-gray-700 mb-1">Order</label><input type="number" value={form.order} onChange={e => setForm({ ...form, order: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500/50 bg-white" /></div>
                    <div><label className="block text-sm font-medium text-gray-700 mb-1">Status</label><select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500/50 bg-white"><option value="AVAILABLE">Available</option><option value="UNAVAILABLE">Unavailable</option></select></div>
                  </div>
                  <div className="space-y-3">
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider">Images</label>

                    {/* Card Image */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Card Image</label>
                      {(imageFile1 || existingImages[0]) ? (
                        <div className="relative group rounded-xl overflow-hidden border border-gray-200 bg-gray-100" style={{aspectRatio:'16/7'}}>
                          <img
                            src={imageFile1 ? URL.createObjectURL(imageFile1) : existingImages[0]}
                            alt="Card preview"
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                            <label className="flex items-center gap-1.5 bg-white text-gray-800 text-xs font-medium px-3 py-1.5 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
                              <Upload size={13} /> Change
                              <input type="file" accept="image/*" className="hidden" onChange={e => setImageFile1(e.target.files?.[0] || null)} />
                            </label>
                            <button type="button" onClick={() => { setImageFile1(null); setExistingImages(prev => { const n = [...prev]; n[0] = ''; return n; }); }} className="flex items-center gap-1.5 bg-red-500 text-white text-xs font-medium px-3 py-1.5 rounded-lg hover:bg-red-600 transition-colors">
                              <X size={13} /> Remove
                            </button>
                          </div>
                        </div>
                      ) : (
                        <label className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-gray-200 rounded-xl cursor-pointer hover:border-green-400 hover:bg-green-50/30 transition-colors bg-white" style={{aspectRatio:'16/7'}}>
                          <Upload size={20} className="text-gray-300" />
                          <span className="text-xs text-gray-400">Click to upload card image</span>
                          <input type="file" accept="image/*" className="hidden" onChange={e => setImageFile1(e.target.files?.[0] || null)} />
                        </label>
                      )}
                    </div>

                    {/* Header Image */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Header Image</label>
                      {(imageFile2 || existingImages[1]) ? (
                        <div className="relative group rounded-xl overflow-hidden border border-gray-200 bg-gray-100" style={{aspectRatio:'16/7'}}>
                          <img
                            src={imageFile2 ? URL.createObjectURL(imageFile2) : existingImages[1]}
                            alt="Header preview"
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                            <label className="flex items-center gap-1.5 bg-white text-gray-800 text-xs font-medium px-3 py-1.5 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
                              <Upload size={13} /> Change
                              <input type="file" accept="image/*" className="hidden" onChange={e => setImageFile2(e.target.files?.[0] || null)} />
                            </label>
                            <button type="button" onClick={() => { setImageFile2(null); setExistingImages(prev => { const n = [...prev]; n[1] = ''; return n; }); }} className="flex items-center gap-1.5 bg-red-500 text-white text-xs font-medium px-3 py-1.5 rounded-lg hover:bg-red-600 transition-colors">
                              <X size={13} /> Remove
                            </button>
                          </div>
                        </div>
                      ) : (
                        <label className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-gray-200 rounded-xl cursor-pointer hover:border-green-400 hover:bg-green-50/30 transition-colors bg-white" style={{aspectRatio:'16/7'}}>
                          <Upload size={20} className="text-gray-300" />
                          <span className="text-xs text-gray-400">Click to upload header image</span>
                          <input type="file" accept="image/*" className="hidden" onChange={e => setImageFile2(e.target.files?.[0] || null)} />
                        </label>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right Panel */}
                <div className="flex-1 flex flex-col min-w-0 min-h-0">
                  <div className="flex border-b border-gray-200 px-6 shrink-0 bg-white">
                    {(['EN', 'SI', 'SL_DATA', 'GLOBAL_DATA'] as const).map(tab => (
                      <button key={tab} type="button" onClick={() => setActiveTab(tab)} className={`py-3 px-5 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${activeTab === tab ? 'border-green-500 text-green-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
                        {tab === 'EN' ? 'English Details' : tab === 'SI' ? 'Sinhala Details' : tab === 'SL_DATA' ? 'SL Data' : 'Global Data'}
                      </button>
                    ))}
                  </div>
                  <div className="flex-1 min-h-0 overflow-hidden">
                    {/* EN Tab */}
                    <div className={`h-full flex flex-col p-6 ${activeTab === 'EN' ? 'flex' : 'hidden'}`}>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Description (EN)</label>
                      <div className="flex-1 min-h-0">
                        <RichTextEditor value={form.description} onChange={value => setForm({ ...form, description: value })} placeholder="Enter item description in English..." height={editorHeight} />
                      </div>
                    </div>
                    {/* SI Tab */}
                    <div className={`h-full flex flex-col p-6 ${activeTab === 'SI' ? 'flex' : 'hidden'}`}>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Description (SI)</label>
                      <div className="flex-1 min-h-0">
                        <RichTextEditor value={form.sinhalaDescription} onChange={value => setForm({ ...form, sinhalaDescription: value })} placeholder="Enter item description in Sinhala..." height={editorHeight} />
                      </div>
                    </div>
                    {/* SL Data Tab */}
                    <div className={`h-full overflow-y-auto p-6 space-y-5 ${activeTab === 'SL_DATA' ? 'block' : 'hidden'}`}>
                      <div className="grid grid-cols-2 gap-4">
                        <div><label className="block text-sm font-medium text-gray-700 mb-1">Cultivation Area</label><input value={form.slAgriData.cultivationArea} onChange={e => setForm({ ...form, slAgriData: { ...form.slAgriData, cultivationArea: e.target.value } })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-green-500/50" /></div>
                        <div><label className="block text-sm font-medium text-gray-700 mb-1">Cultivation Area (SI)</label><input value={form.slAgriData.sinhalaCultivationArea} onChange={e => setForm({ ...form, slAgriData: { ...form.slAgriData, sinhalaCultivationArea: e.target.value } })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-green-500/50" /></div>
                        <div><label className="block text-sm font-medium text-gray-700 mb-1">Annual Production</label><input value={form.slAgriData.annualProduction} onChange={e => setForm({ ...form, slAgriData: { ...form.slAgriData, annualProduction: e.target.value } })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-green-500/50" /></div>
                        <div><label className="block text-sm font-medium text-gray-700 mb-1">Annual Production (SI)</label><input value={form.slAgriData.sinhalaAnnualProduction} onChange={e => setForm({ ...form, slAgriData: { ...form.slAgriData, sinhalaAnnualProduction: e.target.value } })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-green-500/50" /></div>
                        <div><label className="block text-sm font-medium text-gray-700 mb-1">Average Yield</label><input value={form.slAgriData.averageYield} onChange={e => setForm({ ...form, slAgriData: { ...form.slAgriData, averageYield: e.target.value } })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-green-500/50" /></div>
                        <div><label className="block text-sm font-medium text-gray-700 mb-1">Average Yield (SI)</label><input value={form.slAgriData.sinhalaAverageYield} onChange={e => setForm({ ...form, slAgriData: { ...form.slAgriData, sinhalaAverageYield: e.target.value } })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-green-500/50" /></div>
                      </div>
                      <div>
                        <div className="flex justify-between items-center mb-3"><h4 className="font-semibold text-sm text-gray-700">District Shares</h4><button type="button" onClick={() => setForm({ ...form, slAgriData: { ...form.slAgriData, districts: [...form.slAgriData.districts, { districtName: '', sinhalaDistrictName: '', percentage: 0 }] } })} className="text-xs bg-green-100 text-green-700 px-3 py-1.5 rounded-lg hover:bg-green-200 font-medium">+ Add District</button></div>
                        <div className="space-y-2">
                          {form.slAgriData.districts.map((d, idx) => (
                            <div key={idx} className="flex gap-2 items-center bg-gray-50 p-2.5 rounded-lg border border-gray-200">
                              <input placeholder="District (EN)" value={d.districtName} onChange={e => { const newD = [...form.slAgriData.districts]; newD[idx].districtName = e.target.value; setForm({ ...form, slAgriData: { ...form.slAgriData, districts: newD } }); }} className="flex-1 rounded-lg border border-gray-300 px-2.5 py-1.5 text-sm focus:ring-2 focus:ring-green-500/50" />
                              <input placeholder="District (SI)" value={d.sinhalaDistrictName} onChange={e => { const newD = [...form.slAgriData.districts]; newD[idx].sinhalaDistrictName = e.target.value; setForm({ ...form, slAgriData: { ...form.slAgriData, districts: newD } }); }} className="flex-1 rounded-lg border border-gray-300 px-2.5 py-1.5 text-sm focus:ring-2 focus:ring-green-500/50" />
                              <input type="number" placeholder="%" value={d.percentage} onChange={e => { const newD = [...form.slAgriData.districts]; newD[idx].percentage = parseFloat(e.target.value) || 0; setForm({ ...form, slAgriData: { ...form.slAgriData, districts: newD } }); }} className="w-20 rounded-lg border border-gray-300 px-2.5 py-1.5 text-sm focus:ring-2 focus:ring-green-500/50" />
                              <button type="button" onClick={() => { const newD = form.slAgriData.districts.filter((_, i) => i !== idx); setForm({ ...form, slAgriData: { ...form.slAgriData, districts: newD } }); }} className="text-red-400 hover:text-red-600 p-1 hover:bg-red-50 rounded"><X size={15} /></button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                    {/* Global Data Tab */}
                    <div className={`h-full overflow-y-auto p-6 space-y-4 ${activeTab === 'GLOBAL_DATA' ? 'block' : 'hidden'}`}>
                      <div className="flex justify-between items-center"><h4 className="font-semibold text-sm text-gray-700">Global Production Data</h4><button type="button" onClick={() => setForm({ ...form, globalAgriData: [...form.globalAgriData, { rank: form.globalAgriData.length + 1, countryName: '', sinhalaCountryName: '', production: '', cultivationArea: '' }] })} className="text-xs bg-green-100 text-green-700 px-3 py-1.5 rounded-lg hover:bg-green-200 font-medium">+ Add Country</button></div>
                      <div className="space-y-3">
                        {form.globalAgriData.map((g, idx) => (
                          <div key={idx} className="bg-gray-50 p-4 rounded-xl border border-gray-200 relative">
                            <button type="button" onClick={() => { const newG = form.globalAgriData.filter((_, i) => i !== idx); setForm({ ...form, globalAgriData: newG }); }} className="absolute top-3 right-3 text-red-400 hover:text-red-600 p-1 hover:bg-red-50 rounded"><X size={15} /></button>
                            <div className="grid grid-cols-2 gap-3 pr-8">
                              <div><label className="block text-xs font-medium text-gray-500 mb-1">Rank</label><input type="number" value={g.rank} onChange={e => { const newG = [...form.globalAgriData]; newG[idx].rank = parseInt(e.target.value) || 0; setForm({ ...form, globalAgriData: newG }); }} className="w-full rounded-lg border border-gray-300 px-2.5 py-1.5 text-sm focus:ring-2 focus:ring-green-500/50" /></div>
                              <div><label className="block text-xs font-medium text-gray-500 mb-1">Production</label><input value={g.production} onChange={e => { const newG = [...form.globalAgriData]; newG[idx].production = e.target.value; setForm({ ...form, globalAgriData: newG }); }} className="w-full rounded-lg border border-gray-300 px-2.5 py-1.5 text-sm focus:ring-2 focus:ring-green-500/50" /></div>
                              <div><label className="block text-xs font-medium text-gray-500 mb-1">Country Name (EN)</label><input value={g.countryName} onChange={e => { const newG = [...form.globalAgriData]; newG[idx].countryName = e.target.value; setForm({ ...form, globalAgriData: newG }); }} className="w-full rounded-lg border border-gray-300 px-2.5 py-1.5 text-sm focus:ring-2 focus:ring-green-500/50" /></div>
                              <div><label className="block text-xs font-medium text-gray-500 mb-1">Country Name (SI)</label><input value={g.sinhalaCountryName} onChange={e => { const newG = [...form.globalAgriData]; newG[idx].sinhalaCountryName = e.target.value; setForm({ ...form, globalAgriData: newG }); }} className="w-full rounded-lg border border-gray-300 px-2.5 py-1.5 text-sm focus:ring-2 focus:ring-green-500/50" /></div>
                              <div className="col-span-2"><label className="block text-xs font-medium text-gray-500 mb-1">Cultivation Area</label><input value={g.cultivationArea} onChange={e => { const newG = [...form.globalAgriData]; newG[idx].cultivationArea = e.target.value; setForm({ ...form, globalAgriData: newG }); }} className="w-full rounded-lg border border-gray-300 px-2.5 py-1.5 text-sm focus:ring-2 focus:ring-green-500/50" /></div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 shrink-0 space-y-3">
                {saveError && (<div className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg"><span className="mt-0.5">⚠️</span><span>{saveError}</span></div>)}
                <div className="flex gap-3">
                  <button type="button" onClick={() => setIsModalOpen(false)} disabled={isSaving} className="px-6 py-2.5 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-100 bg-white font-medium transition-colors disabled:opacity-50 text-sm">Cancel</button>
                  <button type="submit" disabled={isSaving} className="flex-1 py-2.5 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white rounded-xl font-semibold transition-colors flex items-center justify-center gap-2 text-sm">
                    {isSaving ? (<><div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />{editingId ? 'Updating...' : 'Saving...'}</>) : (editingId ? 'Update Item' : 'Add Item')}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
