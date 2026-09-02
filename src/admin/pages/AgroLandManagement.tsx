import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, X, AlertCircle, Image as ImageIcon, Upload, MapPin } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface Lookup {
  id: string;
  name: string;
  nameSi: string | null;
}

interface AgroLand {
  id: string;
  title: string;
  titleSi: string | null;
  slug: string;
  description: string | null;
  descriptionSi: string | null;
  location: string;
  locationSi: string | null;
  size: string;
  sizeSi: string | null;
  price: number;
  typeId: string;
  type?: Lookup;
  contactNumber: string;
  image: string | null;
  status: string;
}

const AgroLandManagement = () => {
  const [lands, setLands] = useState<AgroLand[]>([]);
  const [types, setTypes] = useState<Lookup[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentLand, setCurrentLand] = useState<Partial<AgroLand>>({});
  
  // Image Upload State
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Delete State
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [landToDelete, setLandToDelete] = useState<AgroLand | null>(null);

  const { token } = useAuth();
  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    fetchLands();
  }, []);

  const fetchLands = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${API_BASE_URL}/agrolands`);
      if (!response.ok) throw new Error('Failed to fetch lands');
      const data = await response.json();
      setLands(data.lands || []);
      if (data.filters && data.filters.types) {
        setTypes(data.filters.types);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenModal = (land?: AgroLand) => {
    if (land) {
      setIsEditMode(true);
      setCurrentLand(land);
    } else {
      setIsEditMode(false);
      setCurrentLand({ status: 'Available' });
    }
    setImageFile(null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentLand({});
    setImageFile(null);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!currentLand.title || !currentLand.location || !currentLand.price || !currentLand.typeId || !currentLand.contactNumber) {
        alert("Title, Location, Price, Type, and Contact Number are required.");
        return;
      }

      setIsUploading(true);
      let imageUrl = currentLand.image;

      // Handle image upload if a new file is selected
      if (imageFile) {
        const formData = new FormData();
        formData.append('image', imageFile);

        const uploadRes = await fetch(`${API_BASE_URL}/upload/image`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: formData
        });

        if (!uploadRes.ok) throw new Error('Image upload failed');
        const uploadData = await uploadRes.json();
        imageUrl = uploadData.url;
      }

      const payload = {
        ...currentLand,
        image: imageUrl
      };

      const method = isEditMode ? 'PUT' : 'POST';
      const url = isEditMode 
        ? `${API_BASE_URL}/agrolands/${currentLand.id}` 
        : `${API_BASE_URL}/agrolands`;

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) throw new Error('Failed to save land');
      
      await fetchLands();
      handleCloseModal();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsUploading(false);
    }
  };

  const confirmDelete = async () => {
    if (!landToDelete) return;
    try {
      const response = await fetch(`${API_BASE_URL}/agrolands/${landToDelete.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) throw new Error('Failed to delete land');
      await fetchLands();
      setIsDeleteDialogOpen(false);
      setLandToDelete(null);
    } catch (err: any) {
      alert(err.message);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Agro Lands Management</h1>
        <button 
          onClick={() => handleOpenModal()}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <Plus size={20} />
          Add New Land
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 flex items-center gap-3">
          <AlertCircle className="text-red-500" />
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* Lands Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 text-sm font-medium text-gray-500">Image</th>
                <th className="px-6 py-4 text-sm font-medium text-gray-500">Title</th>
                <th className="px-6 py-4 text-sm font-medium text-gray-500">Location</th>
                <th className="px-6 py-4 text-sm font-medium text-gray-500">Price (LKR)</th>
                <th className="px-6 py-4 text-sm font-medium text-gray-500">Type</th>
                <th className="px-6 py-4 text-sm font-medium text-gray-500">Status</th>
                <th className="px-6 py-4 text-sm font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {lands.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                    No agricultural lands found. Click "Add New Land" to create one.
                  </td>
                </tr>
              ) : (
                lands.map((land) => (
                  <tr key={land.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      {land.image ? (
                        <img src={land.image} alt={land.title} className="w-12 h-12 rounded-lg object-cover" />
                      ) : (
                        <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400">
                          <ImageIcon size={20} />
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-800">{land.title}</td>
                    <td className="px-6 py-4 text-gray-600 flex items-center gap-1">
                      <MapPin size={14} className="text-gray-400"/> {land.location}
                    </td>
                    <td className="px-6 py-4 font-medium text-green-700">Rs. {land.price.toLocaleString()}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800`}>
                        {land.type?.name || '-'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        land.status === 'Available' ? 'bg-green-100 text-green-800' : 
                        land.status === 'Sold' ? 'bg-red-100 text-red-800' : 'bg-orange-100 text-orange-800'
                      }`}>
                        {land.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <button 
                          onClick={() => handleOpenModal(land)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button 
                          onClick={() => {
                            setLandToDelete(land);
                            setIsDeleteDialogOpen(true);
                          }}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
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
          <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-800">
                {isEditMode ? 'Edit Agro Land' : 'Add New Agro Land'}
              </h2>
              <button onClick={handleCloseModal} className="text-gray-400 hover:text-gray-600">
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSave} className="p-6 space-y-6">
              
              {/* Image Upload Area */}
              <div className="flex justify-center">
                <div className="relative w-full max-w-md h-48 border-2 border-dashed border-gray-300 rounded-xl flex items-center justify-center overflow-hidden bg-gray-50 group hover:border-green-500 transition-colors">
                  {(imageFile || currentLand.image) ? (
                    <img 
                      src={imageFile ? URL.createObjectURL(imageFile) : currentLand.image!} 
                      alt="Preview" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-center text-gray-400">
                      <ImageIcon className="mx-auto mb-2" size={32} />
                      <span className="text-sm">Upload Cover Image</span>
                    </div>
                  )}
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={handleImageChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  
                  {/* Hover overlay for changing image */}
                  {(imageFile || currentLand.image) && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer pointer-events-none">
                      <div className="text-white text-center">
                        <Upload size={24} className="mx-auto mb-1" />
                        <span className="text-xs font-medium">Change Image</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Title (EN) *</label>
                  <input 
                    type="text" 
                    required
                    value={currentLand.title || ''}
                    onChange={(e) => setCurrentLand({...currentLand, title: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="e.g. 5 Acre Land for Sale"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Title (SI)</label>
                  <input 
                    type="text" 
                    value={currentLand.titleSi || ''}
                    onChange={(e) => setCurrentLand({...currentLand, titleSi: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="e.g. අක්කර 5 ක ඉඩමක් විකිණීමට"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Location (EN) *</label>
                  <input 
                    type="text" 
                    required
                    value={currentLand.location || ''}
                    onChange={(e) => setCurrentLand({...currentLand, location: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="e.g. Kurunegala"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Location (SI)</label>
                  <input 
                    type="text" 
                    value={currentLand.locationSi || ''}
                    onChange={(e) => setCurrentLand({...currentLand, locationSi: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="e.g. කුරුණෑගල"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Size (EN)</label>
                  <input 
                    type="text" 
                    value={currentLand.size || ''}
                    onChange={(e) => setCurrentLand({...currentLand, size: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="e.g. 5 Acres"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Size (SI)</label>
                  <input 
                    type="text" 
                    value={currentLand.sizeSi || ''}
                    onChange={(e) => setCurrentLand({...currentLand, sizeSi: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="e.g. අක්කර 5"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Price (LKR) *</label>
                  <input 
                    type="number" 
                    required
                    value={currentLand.price || ''}
                    onChange={(e) => setCurrentLand({...currentLand, price: parseFloat(e.target.value)})}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="e.g. 1500000"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Contact Number *</label>
                  <input 
                    type="text" 
                    required
                    value={currentLand.contactNumber || ''}
                    onChange={(e) => setCurrentLand({...currentLand, contactNumber: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="e.g. 0712345678"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Type *</label>
                  <select
                    required
                    value={currentLand.typeId || ''}
                    onChange={(e) => setCurrentLand({...currentLand, typeId: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="">Select Type</option>
                    {types.map(t => (
                      <option key={t.id} value={t.id}>{t.name} ({t.nameSi})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                  <select
                    required
                    value={currentLand.status || 'Available'}
                    onChange={(e) => setCurrentLand({...currentLand, status: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="Available">Available</option>
                    <option value="Sold">Sold</option>
                    <option value="Leased">Leased</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description (EN)</label>
                  <textarea 
                    value={currentLand.description || ''}
                    onChange={(e) => setCurrentLand({...currentLand, description: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 h-24"
                    placeholder="Enter english description..."
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description (SI)</label>
                  <textarea 
                    value={currentLand.descriptionSi || ''}
                    onChange={(e) => setCurrentLand({...currentLand, descriptionSi: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 h-24"
                    placeholder="Enter sinhala description..."
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button 
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                  disabled={isUploading}
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors flex items-center gap-2"
                  disabled={isUploading}
                >
                  {isUploading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Saving...
                    </>
                  ) : (
                    'Save Agro Land'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteDialogOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-2">Confirm Delete</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete "{landToDelete?.title}"? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button 
                onClick={() => setIsDeleteDialogOpen(false)}
                className="px-4 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
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

export default AgroLandManagement;
