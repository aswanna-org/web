import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, X, AlertCircle, Search, Image as ImageIcon, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import RichTextEditor from '../components/RichTextEditor';

interface Category {
  id: string;
  name: string;
  parentId: string | null;
}

interface Item {
  id: string;
  name: string;
  sinhalaName: string | null;
  slug: string;
  description: string | null;
  sinhalaDescription: string | null;
  farmingGuide: string | null;
  sinhalaFarmingGuide: string | null;
  diseasesInfo: string | null;
  sinhalaDiseasesInfo: string | null;
  price: number | null;
  unit: string | null;
  location: string | null;
  sinhalaLocation: string | null;
  status: string;
  images: string[] | null;
  categoryId: string;
  order: number;
  category?: Category;
}

const ItemManagement = () => {
  const [items, setItems] = useState<Item[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Search and Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategoryId, setFilterCategoryId] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentItem, setCurrentItem] = useState<Partial<Item>>({});
  const [selectedMainCategoryId, setSelectedMainCategoryId] = useState('');

  const handleDescriptionChange = (val: string) => {
    if (currentItem.description !== val) {
      setCurrentItem(prev => ({ ...prev, description: val }));
    }
  };

  const handleFarmingGuideChange = (val: string) => {
    if (currentItem.farmingGuide !== val) {
      setCurrentItem(prev => ({ ...prev, farmingGuide: val }));
    }
  };

  const handleSinhalaDescriptionChange = (val: string) => {
    if (currentItem.sinhalaDescription !== val) {
      setCurrentItem(prev => ({ ...prev, sinhalaDescription: val }));
    }
  };

  const handleSinhalaFarmingGuideChange = (val: string) => {
    if (currentItem.sinhalaFarmingGuide !== val) {
      setCurrentItem(prev => ({ ...prev, sinhalaFarmingGuide: val }));
    }
  };

  const [activeTab, setActiveTab] = useState<'EN' | 'SI'>('EN');
  
  // Image handling
  const [newImages, setNewImages] = useState<File[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  // Delete State
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<Item | null>(null);

  const { token } = useAuth();
  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    fetchCategories();
    fetchItems();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/categories`);
      if (response.ok) {
        setCategories(await response.json());
      }
    } catch (err) {
      console.error('Failed to fetch categories');
    }
  };

  const fetchItems = async () => {
    try {
      setIsLoading(true);
      // Fetching all for admin (might need pagination later if huge)
      const response = await fetch(`${API_BASE_URL}/items?limit=1000`);
      if (!response.ok) throw new Error('Failed to fetch items');
      const data = await response.json();
      setItems(data.data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const mainCategories = categories.filter(c => !c.parentId);
  const subCategories = categories.filter(c => c.parentId);

  // Form specific sub-categories based on selected main category
  const formSubCategories = categories.filter(c => c.parentId === selectedMainCategoryId);

  let displayItems = items;
  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase();
    displayItems = displayItems.filter(i =>
      i.name.toLowerCase().includes(q) ||
      (i.sinhalaName && i.sinhalaName.toLowerCase().includes(q)) ||
      i.slug.toLowerCase().includes(q)
    );
  }
  if (filterCategoryId) {
    displayItems = displayItems.filter(i => i.categoryId === filterCategoryId);
  }

  const handleOpenAddModal = () => {
    setCurrentItem({
      name: '',
      sinhalaName: '',
      slug: '',
      description: '',
      farmingGuide: '',
      status: 'AVAILABLE',
      order: 99
    });
    setSelectedMainCategoryId('');
    setNewImages([]);
    setExistingImages([]);
    setIsEditMode(false);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (item: Item) => {
    setCurrentItem(item);

    // Find parent main category to set the dropdown correctly
    const subCat = categories.find(c => c.id === item.categoryId);
    if (subCat && subCat.parentId) {
      setSelectedMainCategoryId(subCat.parentId);
    }

    setExistingImages(Array.isArray(item.images) ? item.images : []);
    setNewImages([]);
    setIsEditMode(true);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentItem({});
    setNewImages([]);
    setExistingImages([]);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setNewImages(Array.from(e.target.files));
    }
  };

  const removeExistingImage = (urlToRemove: string) => {
    setExistingImages(prev => prev.filter(url => url !== urlToRemove));
  };

  const handleSaveItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentItem.categoryId) {
      alert("Please select a sub-category.");
      return;
    }

    setIsSaving(true);
    try {
      const url = isEditMode
        ? `${API_BASE_URL}/items/${currentItem.id}`
        : `${API_BASE_URL}/items`;

      const method = isEditMode ? 'PUT' : 'POST';

      const formData = new FormData();
      Object.keys(currentItem).forEach(key => {
        const val = (currentItem as any)[key];
        if (val !== null && val !== undefined && key !== 'images' && key !== 'category') {
          formData.append(key, val.toString());
        }
      });

      // Append kept existing images
      formData.append('images', JSON.stringify(existingImages));

      // Append new files
      newImages.forEach(file => {
        formData.append('images', file);
      });

      const response = await fetch(url, {
        method,
        headers: {
          ...(token && { 'Authorization': `Bearer ${token}` })
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save item');
      }

      fetchItems();
      handleCloseModal();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const confirmDelete = (item: Item) => {
    setItemToDelete(item);
    setIsDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!itemToDelete) return;
    try {
      const response = await fetch(`${API_BASE_URL}/items/${itemToDelete.id}`, {
        method: 'DELETE',
        headers: {
          ...(token && { 'Authorization': `Bearer ${token}` })
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete item');
      }

      fetchItems();
      setIsDeleteDialogOpen(false);
      setItemToDelete(null);
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-6 w-full mx-auto pb-10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Item Management</h1>
          <p className="mt-1 text-sm text-gray-500">Manage products, crops, and content items across all categories.</p>
        </div>
        <button
          onClick={handleOpenAddModal}
          className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2.5 rounded-lg font-medium transition-colors shadow-sm whitespace-nowrap"
        >
          <Plus size={18} />
          Add New Item
        </button>
      </div>

      {/* Filters and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-gray-200">
        <div className="relative w-full sm:max-w-md">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
            <Search size={18} />
          </span>
          <input
            type="text"
            placeholder="Search items by name or slug..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-gray-300 bg-gray-50 py-2.5 pl-10 pr-4 text-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500 transition-colors"
          />
        </div>

        <div className="w-full sm:w-64">
          <select
            value={filterCategoryId}
            onChange={(e) => setFilterCategoryId(e.target.value)}
            className="w-full rounded-lg border border-gray-300 bg-gray-50 py-2.5 px-3 text-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500 transition-colors"
          >
            <option value="">All Categories</option>
            {subCategories.map(category => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg flex items-center gap-2">
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      {/* Data Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-16">Order</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Image</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-gray-500">Loading items...</td>
                </tr>
              ) : displayItems.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-gray-500">No items found matching your filters.</td>
                </tr>
              ) : (
                displayItems.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-600 bg-gray-50/50">
                      {item.order}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {item.images && item.images.length > 0 ? (
                        <img src={item.images[0]} alt={item.name} className="w-12 h-12 object-cover rounded-md border border-gray-200" />
                      ) : (
                        <div className="w-12 h-12 bg-gray-100 rounded-md border border-gray-200 flex items-center justify-center text-gray-400">
                          <ImageIcon size={20} />
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{item.name}</div>
                      <div className="text-sm text-gray-500">{item.slug}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {item.category?.name || 'Unknown'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${item.status === 'AVAILABLE' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleOpenEditModal(item)}
                        className="text-blue-600 hover:text-blue-900 mr-4"
                        title="Edit"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => confirmDelete(item)}
                        className="text-red-600 hover:text-red-900"
                        title="Delete"
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
          <div className="bg-white rounded-xl shadow-xl w-full max-w-7xl max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                {isEditMode ? 'Edit Item' : 'Add New Item'}
              </h2>
              <button onClick={handleCloseModal} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveItem} className="p-6 overflow-y-auto flex-1">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* Left Column: Basic Details */}
                <div className="space-y-4">
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-4">
                    <h3 className="font-medium text-gray-900 border-b border-gray-200 pb-2">Category Assignment</h3>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Main Category</label>
                      <select
                        value={selectedMainCategoryId}
                        onChange={(e) => {
                          setSelectedMainCategoryId(e.target.value);
                          setCurrentItem({ ...currentItem, categoryId: '' }); // reset sub category
                        }}
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-green-500 focus:border-green-500"
                      >
                        <option value="">Select Main Category...</option>
                        {mainCategories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Sub Category *</label>
                      <select
                        required
                        value={currentItem.categoryId || ''}
                        onChange={(e) => setCurrentItem({ ...currentItem, categoryId: e.target.value })}
                        disabled={!selectedMainCategoryId && !isEditMode}
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-green-500 focus:border-green-500 disabled:bg-gray-100"
                      >
                        <option value="" disabled>Select Sub Category...</option>
                        {formSubCategories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Item Name *</label>
                    <input
                      type="text"
                      required
                      value={currentItem.name || ''}
                      onChange={(e) => setCurrentItem({ ...currentItem, name: e.target.value })}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-green-500 focus:border-green-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Sinhala Name</label>
                    <input
                      type="text"
                      value={currentItem.sinhalaName || ''}
                      onChange={(e) => setCurrentItem({ ...currentItem, sinhalaName: e.target.value })}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-green-500 focus:border-green-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">URL Slug *</label>
                    <input
                      type="text"
                      required
                      value={currentItem.slug || ''}
                      onChange={(e) => setCurrentItem({ ...currentItem, slug: e.target.value })}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-green-500 focus:border-green-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Price</label>
                      <input
                        type="number"
                        step="0.01"
                        value={currentItem.price || ''}
                        onChange={(e) => setCurrentItem({ ...currentItem, price: parseFloat(e.target.value) })}
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-green-500 focus:border-green-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Unit (e.g. kg, per plant)</label>
                      <input
                        type="text"
                        value={currentItem.unit || ''}
                        onChange={(e) => setCurrentItem({ ...currentItem, unit: e.target.value })}
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-green-500 focus:border-green-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                      <select
                        value={currentItem.status || 'AVAILABLE'}
                        onChange={(e) => setCurrentItem({ ...currentItem, status: e.target.value })}
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-green-500 focus:border-green-500"
                      >
                        <option value="AVAILABLE">AVAILABLE</option>
                        <option value="OUT_OF_STOCK">OUT OF STOCK</option>
                        <option value="HIDDEN">HIDDEN</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Display Order</label>
                      <input
                        type="number"
                        required
                        value={currentItem.order ?? 99}
                        onChange={(e) => setCurrentItem({ ...currentItem, order: parseInt(e.target.value) || 0 })}
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-green-500 focus:border-green-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Item Images</label>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageChange}
                      className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
                    />

                    {/* Image Previews */}
                    <div className="mt-4 flex flex-wrap gap-2">
                      {existingImages.map((url, idx) => (
                        <div key={`exist-${idx}`} className="relative group">
                          <img src={url} className="w-16 h-16 object-cover rounded-lg border" alt="Existing" />
                          <button
                            type="button"
                            onClick={() => removeExistingImage(url)}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X size={12} />
                          </button>
                        </div>
                      ))}
                      {newImages.map((file, idx) => (
                        <div key={`new-${idx}`} className="relative">
                          <img src={URL.createObjectURL(file)} className="w-16 h-16 object-cover rounded-lg border border-green-500" alt="New" />
                          <span className="absolute bottom-0 right-0 bg-green-500 text-white text-[10px] px-1 rounded-tl">New</span>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>

                {/* Right Column: Rich Text */}
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
                      English Details
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
                      සිංහල Details (Sinhala)
                    </button>
                  </div>

                  <div className={activeTab === 'EN' ? 'block space-y-8' : 'hidden'}>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Main Description (English)</label>
                      <RichTextEditor
                        value={currentItem.description || ''}
                        onChange={handleDescriptionChange}
                        placeholder="Write a detailed description here..."
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Farming Guide / Details (English)</label>
                      <RichTextEditor
                        value={currentItem.farmingGuide || ''}
                        onChange={handleFarmingGuideChange}
                        placeholder="Step by step guide or additional details..."
                      />
                    </div>
                  </div>

                  <div className={activeTab === 'SI' ? 'block space-y-8' : 'hidden'}>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Main Description (Sinhala) - ප්‍රධාන විස්තරය</label>
                      <RichTextEditor
                        value={currentItem.sinhalaDescription || ''}
                        onChange={handleSinhalaDescriptionChange}
                        placeholder="සිංහලෙන් විස්තරය ඇතුලත් කරන්න..."
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Farming Guide (Sinhala) - වගා උපදෙස්</label>
                      <RichTextEditor
                        value={currentItem.sinhalaFarmingGuide || ''}
                        onChange={handleSinhalaFarmingGuideChange}
                        placeholder="පියවරෙන් පියවර වගා උපදෙස්..."
                      />
                    </div>
                  </div>
                </div>

              </div>

              {/* Fixed Footer */}
              <div className="mt-8 pt-4 border-t border-gray-200 flex justify-end gap-3 sticky bottom-0 bg-white">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                  disabled={isSaving}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-6 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:bg-green-400 flex items-center gap-2"
                >
                  {isSaving && <Loader2 size={16} className="animate-spin" />}
                  {isEditMode ? 'Save Changes' : 'Create Item'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteDialogOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm overflow-hidden p-6 text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
              <AlertCircle className="h-6 w-6 text-red-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Delete Item?</h3>
            <p className="text-sm text-gray-500 mb-6">
              Are you sure you want to delete "{itemToDelete?.name}"?
              This action cannot be undone and will permanently remove all associated images.
            </p>
            <div className="flex justify-center gap-3">
              <button
                onClick={() => setIsDeleteDialogOpen(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 w-full"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 w-full"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ItemManagement;
