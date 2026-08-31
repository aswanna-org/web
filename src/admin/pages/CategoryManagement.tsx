import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, X, AlertCircle, Layers, Link as LinkIcon, Search, Image as ImageIcon } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface Category {
  id: string;
  name: string;
  sinhalaName: string | null;
  slug: string;
  parentId: string | null;
  image: string | null;
  order: number;
}

const CategoryManagement = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Tabs & Filters State
  const [activeTab, setActiveTab] = useState<'main' | 'sub'>('main');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterParentId, setFilterParentId] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentCategory, setCurrentCategory] = useState<Partial<Category>>({});
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);

  // Delete State
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);

  const { token } = useAuth();
  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${API_BASE_URL}/categories`);
      if (!response.ok) throw new Error('Failed to fetch categories');
      const data = await response.json();
      setCategories(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const mainCategories = categories.filter(c => !c.parentId);
  const subCategories = categories.filter(c => c.parentId);

  let displayCategories = activeTab === 'main' ? mainCategories : subCategories;

  // Apply search filtering
  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase();
    displayCategories = displayCategories.filter(c =>
      c.name.toLowerCase().includes(q) ||
      (c.sinhalaName && c.sinhalaName.toLowerCase().includes(q)) ||
      c.slug.toLowerCase().includes(q)
    );
  }

  // Apply parent dropdown filtering (only for sub categories)
  if (activeTab === 'sub' && filterParentId) {
    displayCategories = displayCategories.filter(c => c.parentId === filterParentId);
  }

  const handleOpenAddModal = () => {
    setCurrentCategory({
      name: '',
      sinhalaName: '',
      slug: '',
      parentId: activeTab === 'sub' ? (filterParentId || mainCategories[0]?.id || '') : null,
      order: 99
    });
    setSelectedImage(null);
    setImagePreviewUrl(null);
    setIsEditMode(false);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (category: Category) => {
    setCurrentCategory(category);
    setSelectedImage(null);
    setImagePreviewUrl(category.image || null);
    setIsEditMode(true);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentCategory({});
    setSelectedImage(null);
    setImagePreviewUrl(null);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedImage(file);
      setImagePreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = isEditMode
        ? `${API_BASE_URL}/categories/${currentCategory.id}`
        : `${API_BASE_URL}/categories`;

      const method = isEditMode ? 'PUT' : 'POST';

      let finalParentId = currentCategory.parentId;
      if (activeTab === 'main' && !isEditMode) {
        finalParentId = null;
      }

      const formData = new FormData();
      if (currentCategory.name) formData.append('name', currentCategory.name);
      if (currentCategory.slug) formData.append('slug', currentCategory.slug);
      if (currentCategory.sinhalaName) formData.append('sinhalaName', currentCategory.sinhalaName);
      if (finalParentId) formData.append('parentId', finalParentId);
      if (selectedImage) formData.append('image', selectedImage);
      if (currentCategory.order !== undefined) formData.append('order', currentCategory.order.toString());

      const response = await fetch(url, {
        method,
        headers: {
          ...(token && { 'Authorization': `Bearer ${token}` })
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save category');
      }

      fetchCategories();
      handleCloseModal();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const confirmDelete = (category: Category) => {
    setCategoryToDelete(category);
    setIsDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!categoryToDelete) return;
    try {
      const response = await fetch(`${API_BASE_URL}/categories/${categoryToDelete.id}`, {
        method: 'DELETE',
        headers: {
          ...(token && { 'Authorization': `Bearer ${token}` })
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete category');
      }

      fetchCategories();
      setIsDeleteDialogOpen(false);
      setCategoryToDelete(null);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const getParentName = (parentId: string | null) => {
    if (!parentId) return '-';
    const parent = categories.find(c => c.id === parentId);
    return parent ? parent.name : 'Unknown';
  };

  const switchTab = (tab: 'main' | 'sub') => {
    setActiveTab(tab);
    setSearchQuery('');
    setFilterParentId('');
  };

  return (
    <div className="space-y-6 w-full mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Category Management</h1>
          <p className="mt-1 text-sm text-gray-500">Manage your main categories and their sub-categories separately for clarity.</p>
        </div>
        <button
          onClick={handleOpenAddModal}
          className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2.5 rounded-lg font-medium transition-colors shadow-sm whitespace-nowrap"
        >
          <Plus size={18} />
          {activeTab === 'main' ? 'Add Main Category' : 'Add Sub Category'}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        <button
          className={`flex items-center gap-2 py-3 px-6 font-medium text-sm focus:outline-none transition-colors ${activeTab === 'main'
              ? 'border-b-2 border-green-500 text-green-700 bg-green-50/50'
              : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          onClick={() => switchTab('main')}
        >
          <Layers size={18} />
          Main Categories
          <span className="ml-2 bg-gray-100 text-gray-600 py-0.5 px-2.5 rounded-full text-xs">{mainCategories.length}</span>
        </button>
        <button
          className={`flex items-center gap-2 py-3 px-6 font-medium text-sm focus:outline-none transition-colors ${activeTab === 'sub'
              ? 'border-b-2 border-green-500 text-green-700 bg-green-50/50'
              : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          onClick={() => switchTab('sub')}
        >
          <LinkIcon size={18} />
          Sub Categories
          <span className="ml-2 bg-gray-100 text-gray-600 py-0.5 px-2.5 rounded-full text-xs">{subCategories.length}</span>
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
            placeholder={activeTab === 'main' ? 'Search main categories...' : 'Search sub categories...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-gray-300 bg-gray-50 py-2.5 pl-10 pr-4 text-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500 transition-colors"
          />
        </div>

        {activeTab === 'sub' && (
          <div className="w-full sm:w-64">
            <select
              value={filterParentId}
              onChange={(e) => setFilterParentId(e.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-gray-50 py-2.5 px-3 text-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500 transition-colors"
            >
              <option value="">All Parent Categories</option>
              {mainCategories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
        )}
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sinhala Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Slug</th>
                {activeTab === 'sub' && (
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Parent Category</th>
                )}
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {isLoading ? (
                <tr>
                  <td colSpan={activeTab === 'sub' ? 7 : 6} className="px-6 py-10 text-center text-gray-500">Loading categories...</td>
                </tr>
              ) : displayCategories.length === 0 ? (
                <tr>
                  <td colSpan={activeTab === 'sub' ? 7 : 6} className="px-6 py-10 text-center text-gray-500">
                    No {activeTab === 'main' ? 'main categories' : 'sub categories'} found matching your filters.
                  </td>
                </tr>
              ) : (
                displayCategories.map((category) => (
                  <tr key={category.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-600 bg-gray-50/50">
                      {category.order}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {category.image ? (
                        <img src={category.image} alt={category.name} className="w-10 h-10 object-cover rounded-md border border-gray-200" />
                      ) : (
                        <div className="w-10 h-10 bg-gray-100 rounded-md border border-gray-200 flex items-center justify-center text-gray-400">
                          <ImageIcon size={20} />
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{category.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{category.sinhalaName || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{category.slug}</td>
                    {activeTab === 'sub' && (
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {getParentName(category.parentId)}
                        </span>
                      </td>
                    )}
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleOpenEditModal(category)}
                        className="text-blue-600 hover:text-blue-900 mr-4"
                        title="Edit"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => confirmDelete(category)}
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
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                {isEditMode ? 'Edit' : 'Add New'} {activeTab === 'main' ? 'Main Category' : 'Sub Category'}
              </h2>
              <button onClick={handleCloseModal} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveCategory} className="p-6 space-y-4 overflow-y-auto">
              
              {/* Image Upload Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Image</label>
                <div className="flex items-center gap-4">
                  {imagePreviewUrl ? (
                    <img src={imagePreviewUrl} alt="Preview" className="w-16 h-16 object-cover rounded-lg border border-gray-300" />
                  ) : (
                    <div className="w-16 h-16 bg-gray-100 rounded-lg border border-dashed border-gray-300 flex items-center justify-center text-gray-400">
                      <ImageIcon size={24} />
                    </div>
                  )}
                  <div className="flex-1">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100 transition-colors"
                    />
                    <p className="mt-1 text-xs text-gray-500">Recommended: Square image (e.g. 400x400px)</p>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Display Order *</label>
                <input
                  type="number"
                  required
                  value={currentCategory.order ?? 99}
                  onChange={(e) => setCurrentCategory({ ...currentCategory, order: parseInt(e.target.value) || 0 })}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
                <p className="mt-1 text-xs text-gray-500">Lower numbers appear first (e.g. 0, 1, 2).</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                <input
                  type="text"
                  required
                  value={currentCategory.name || ''}
                  onChange={(e) => setCurrentCategory({ ...currentCategory, name: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sinhala Name</label>
                <input
                  type="text"
                  value={currentCategory.sinhalaName || ''}
                  onChange={(e) => setCurrentCategory({ ...currentCategory, sinhalaName: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Slug *</label>
                <input
                  type="text"
                  required
                  value={currentCategory.slug || ''}
                  onChange={(e) => setCurrentCategory({ ...currentCategory, slug: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
                <p className="mt-1 text-xs text-gray-500">Must be unique, lowercase, no spaces.</p>
              </div>

              {/* Only show Parent Category dropdown if we are in Sub Categories tab */}
              {activeTab === 'sub' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Parent Main Category *</label>
                  <select
                    required
                    value={currentCategory.parentId || ''}
                    onChange={(e) => setCurrentCategory({ ...currentCategory, parentId: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  >
                    <option value="" disabled>Select Main Category</option>
                    {mainCategories.map(category => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="pt-4 flex justify-end gap-3 pb-2">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700"
                >
                  {isEditMode ? 'Save Changes' : `Create ${activeTab === 'main' ? 'Main Category' : 'Sub Category'}`}
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
            <h3 className="text-lg font-medium text-gray-900 mb-2">Delete Category?</h3>
            <p className="text-sm text-gray-500 mb-6">
              Are you sure you want to delete the category "{categoryToDelete?.name}"?
              This action cannot be undone.
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

export default CategoryManagement;
