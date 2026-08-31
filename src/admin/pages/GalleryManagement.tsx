import React, { useState, useEffect, useRef } from 'react';
import { Plus, Edit2, Trash2, X, AlertCircle, Loader2, Image as ImageIcon, Video, Upload } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface GalleryItem {
  id: string;
  title: string;
  sinhalaTitle: string | null;
  slug: string;
  type: 'IMAGE' | 'VIDEO';
  url: string;
  description: string | null;
  sinhalaDescription: string | null;
  createdAt: string;
}

const GalleryManagement = () => {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentItem, setCurrentItem] = useState<Partial<GalleryItem>>({ type: 'IMAGE' });
  const [activeTab, setActiveTab] = useState<'EN' | 'SI'>('EN');
  const [isSaving, setIsSaving] = useState(false);
  
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<GalleryItem | null>(null);

  const { token } = useAuth();
  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${API_BASE_URL}/gallery?limit=100`);
      if (!response.ok) throw new Error('Failed to fetch gallery items');
      const data = await response.json();
      setItems(data.data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenAddModal = () => {
    setCurrentItem({
      title: '',
      sinhalaTitle: '',
      slug: '',
      type: 'IMAGE',
      url: '',
      description: '',
      sinhalaDescription: ''
    });
    setSelectedFile(null);
    setPreviewUrl(null);
    setIsEditMode(false);
    setActiveTab('EN');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (item: GalleryItem) => {
    setCurrentItem(item);
    setSelectedFile(null);
    setPreviewUrl(item.type === 'IMAGE' ? item.url : null);
    setIsEditMode(true);
    setActiveTab('EN');
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentItem({});
    setSelectedFile(null);
    setPreviewUrl(null);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentItem.title || !currentItem.slug) {
      alert("Title and slug are required.");
      return;
    }

    if (currentItem.type === 'IMAGE' && !isEditMode && !selectedFile) {
      alert("Please select an image file.");
      return;
    }

    if (currentItem.type === 'VIDEO' && !currentItem.url) {
      alert("Please provide a YouTube URL.");
      return;
    }

    setIsSaving(true);
    try {
      const formData = new FormData();
      formData.append('title', currentItem.title || '');
      formData.append('slug', currentItem.slug || '');
      formData.append('type', currentItem.type || 'IMAGE');
      
      if (currentItem.sinhalaTitle) formData.append('sinhalaTitle', currentItem.sinhalaTitle);
      if (currentItem.description) formData.append('description', currentItem.description);
      if (currentItem.sinhalaDescription) formData.append('sinhalaDescription', currentItem.sinhalaDescription);
      
      if (currentItem.type === 'VIDEO' && currentItem.url) {
        formData.append('url', currentItem.url);
      } else if (selectedFile) {
        formData.append('file', selectedFile);
      }

      const url = isEditMode
        ? `${API_BASE_URL}/gallery/${currentItem.id}`
        : `${API_BASE_URL}/gallery`;

      const method = isEditMode ? 'PUT' : 'POST';

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

  const confirmDelete = (item: GalleryItem) => {
    setItemToDelete(item);
    setIsDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!itemToDelete) return;
    try {
      const response = await fetch(`${API_BASE_URL}/gallery/${itemToDelete.id}`, {
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
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gallery Management</h1>
          <p className="mt-1 text-sm text-gray-500">Manage photos and YouTube videos for your gallery.</p>
        </div>
        <button
          onClick={handleOpenAddModal}
          className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2.5 rounded-lg font-medium transition-colors"
        >
          <Plus size={18} />
          Add Media
        </button>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg flex items-center gap-2">
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Media</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title & Slug</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-gray-500">Loading gallery items...</td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-gray-500">No media in gallery yet.</td>
                </tr>
              ) : (
                items.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      {item.type === 'IMAGE' ? (
                        <img src={item.url} alt={item.title} className="w-16 h-16 object-cover rounded-lg" />
                      ) : (
                        <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                          <Video className="text-gray-500 w-8 h-8" />
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{item.title}</div>
                      <div className="text-xs text-gray-500">/{item.slug}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${
                        item.type === 'IMAGE' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
                      }`}>
                        {item.type === 'IMAGE' ? <ImageIcon size={12} /> : <Video size={12} />}
                        {item.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(item.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right text-sm font-medium">
                      <button
                        onClick={() => handleOpenEditModal(item)}
                        className="text-blue-600 hover:text-blue-900 mr-4"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => confirmDelete(item)}
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

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                {isEditMode ? 'Edit Media' : 'Add New Media'}
              </h2>
              <button onClick={handleCloseModal} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveItem} className="p-6 overflow-y-auto flex-1">
              
              <div className="mb-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Media Type *</label>
                  <select
                    value={currentItem.type}
                    onChange={(e) => setCurrentItem({ ...currentItem, type: e.target.value as 'IMAGE'|'VIDEO' })}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-green-500 focus:border-green-500"
                  >
                    <option value="IMAGE">Image (Upload File)</option>
                    <option value="VIDEO">Video (YouTube Link)</option>
                  </select>
                </div>

                {currentItem.type === 'VIDEO' ? (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">YouTube URL *</label>
                    <input
                      type="url"
                      required
                      value={currentItem.url || ''}
                      onChange={(e) => setCurrentItem({ ...currentItem, url: e.target.value })}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-green-500 focus:border-green-500"
                      placeholder="https://www.youtube.com/watch?v=..."
                    />
                  </div>
                ) : (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Image File {!isEditMode && '*'}</label>
                    <div 
                      onClick={() => fileInputRef.current?.click()}
                      className="border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors"
                    >
                      {previewUrl ? (
                        <img src={previewUrl} alt="Preview" className="h-40 object-contain mb-2" />
                      ) : (
                        <div className="flex flex-col items-center text-gray-500">
                          <Upload className="w-8 h-8 mb-2 text-gray-400" />
                          <span className="text-sm">Click to select an image</span>
                        </div>
                      )}
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileSelect}
                        accept="image/*"
                        className="hidden"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="flex border-b border-gray-200 mb-6">
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

              <div className={activeTab === 'EN' ? 'space-y-4 block' : 'hidden'}>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                  <input
                    type="text"
                    required
                    value={currentItem.title || ''}
                    onChange={(e) => setCurrentItem({ 
                      ...currentItem, 
                      title: e.target.value,
                      slug: !isEditMode ? e.target.value.toLowerCase().replace(/[\s\W-]+/g, '-') : currentItem.slug
                    })}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Slug *</label>
                  <input
                    type="text"
                    required
                    value={currentItem.slug || ''}
                    onChange={(e) => setCurrentItem({ ...currentItem, slug: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 bg-gray-50 text-gray-500 focus:ring-green-500 focus:border-green-500"
                  />
                </div>
              </div>

              <div className={activeTab === 'SI' ? 'space-y-4 block' : 'hidden'}>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title (Sinhala)</label>
                  <input
                    type="text"
                    value={currentItem.sinhalaTitle || ''}
                    onChange={(e) => setCurrentItem({ ...currentItem, sinhalaTitle: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>
              </div>

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
                  {isEditMode ? 'Save Changes' : 'Add Media'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isDeleteDialogOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm overflow-hidden p-6 text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
              <AlertCircle className="h-6 w-6 text-red-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Delete Media?</h3>
            <p className="text-sm text-gray-500 mb-6">
              Are you sure you want to delete "{itemToDelete?.title}"? This action cannot be undone.
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

export default GalleryManagement;
