import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, X, AlertCircle, Image as ImageIcon, Upload } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface Lookup {
  id: string;
  name: string;
  nameSi: string | null;
}

interface Plant {
  id: string;
  name: string;
  sinhalaName: string | null;
  slug: string;
  description: string | null;
  sinhalaDescription: string | null;
  climaticZoneId: string | null;
  climaticZone?: Lookup;
  soilTypeId: string | null;
  soilType?: Lookup;
  harvestTimeId: string | null;
  harvestTime?: Lookup;
  image: string | null;
}

const PlantManagement = () => {
  const [plants, setPlants] = useState<Plant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Lookups
  const [climaticZones, setClimaticZones] = useState<Lookup[]>([]);
  const [soilTypes, setSoilTypes] = useState<Lookup[]>([]);
  const [harvestTimes, setHarvestTimes] = useState<Lookup[]>([]);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentPlant, setCurrentPlant] = useState<Partial<Plant>>({});
  
  // Image Upload State
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Delete State
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [plantToDelete, setPlantToDelete] = useState<Plant | null>(null);

  const { token } = useAuth();
  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    fetchPlants();
  }, []);

  const fetchPlants = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${API_BASE_URL}/plants`);
      if (!response.ok) throw new Error('Failed to fetch plants');
      const data = await response.json();
      setPlants(data.plants || []);
      if (data.filters) {
        setClimaticZones(data.filters.climaticZones || []);
        setSoilTypes(data.filters.soilTypes || []);
        setHarvestTimes(data.filters.harvestTimes || []);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenModal = (plant?: Plant) => {
    if (plant) {
      setIsEditMode(true);
      setCurrentPlant(plant);
    } else {
      setIsEditMode(false);
      setCurrentPlant({});
    }
    setImageFile(null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentPlant({});
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
      if (!currentPlant.name) {
        alert("English name is required.");
        return;
      }

      setIsUploading(true);
      let imageUrl = currentPlant.image;

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
        ...currentPlant,
        image: imageUrl
      };

      const method = isEditMode ? 'PUT' : 'POST';
      const url = isEditMode 
        ? `${API_BASE_URL}/plants/${currentPlant.id}` 
        : `${API_BASE_URL}/plants`;

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) throw new Error('Failed to save plant');
      
      await fetchPlants();
      handleCloseModal();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsUploading(false);
    }
  };

  const confirmDelete = async () => {
    if (!plantToDelete) return;
    try {
      const response = await fetch(`${API_BASE_URL}/plants/${plantToDelete.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) throw new Error('Failed to delete plant');
      await fetchPlants();
      setIsDeleteDialogOpen(false);
      setPlantToDelete(null);
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
        <h1 className="text-2xl font-bold text-gray-800">Plant Management (Plant Finder)</h1>
        <button 
          onClick={() => handleOpenModal()}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <Plus size={20} />
          Add New Plant
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 flex items-center gap-3">
          <AlertCircle className="text-red-500" />
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* Plants Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 text-sm font-medium text-gray-500">Image</th>
                <th className="px-6 py-4 text-sm font-medium text-gray-500">Name (EN)</th>
                <th className="px-6 py-4 text-sm font-medium text-gray-500">Name (SI)</th>
                <th className="px-6 py-4 text-sm font-medium text-gray-500">Climatic Zone</th>
                <th className="px-6 py-4 text-sm font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {plants.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                    No plants found. Click "Add New Plant" to create one.
                  </td>
                </tr>
              ) : (
                plants.map((plant) => (
                  <tr key={plant.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      {plant.image ? (
                        <img src={plant.image} alt={plant.name} className="w-12 h-12 rounded-lg object-cover" />
                      ) : (
                        <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400">
                          <ImageIcon size={20} />
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-800">{plant.name}</td>
                    <td className="px-6 py-4 text-gray-600">{plant.sinhalaName || '-'}</td>
                    <td className="px-6 py-4 text-gray-600">{plant.climaticZone?.name || '-'}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <button 
                          onClick={() => handleOpenModal(plant)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button 
                          onClick={() => {
                            setPlantToDelete(plant);
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
          <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-800">
                {isEditMode ? 'Edit Plant' : 'Add New Plant'}
              </h2>
              <button onClick={handleCloseModal} className="text-gray-400 hover:text-gray-600">
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSave} className="p-6 space-y-6">
              
              {/* Image Upload Area */}
              <div className="flex justify-center">
                <div className="relative w-40 h-40 border-2 border-dashed border-gray-300 rounded-xl flex items-center justify-center overflow-hidden bg-gray-50 group hover:border-green-500 transition-colors">
                  {(imageFile || currentPlant.image) ? (
                    <img 
                      src={imageFile ? URL.createObjectURL(imageFile) : currentPlant.image!} 
                      alt="Preview" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-center text-gray-400">
                      <ImageIcon className="mx-auto mb-2" size={32} />
                      <span className="text-sm">Upload Image</span>
                    </div>
                  )}
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={handleImageChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  
                  {/* Hover overlay for changing image */}
                  {(imageFile || currentPlant.image) && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer pointer-events-none">
                      <div className="text-white text-center">
                        <Upload size={24} className="mx-auto mb-1" />
                        <span className="text-xs font-medium">Change</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">English Name *</label>
                  <input 
                    type="text" 
                    required
                    value={currentPlant.name || ''}
                    onChange={(e) => setCurrentPlant({...currentPlant, name: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="e.g. Carrot"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Sinhala Name</label>
                  <input 
                    type="text" 
                    value={currentPlant.sinhalaName || ''}
                    onChange={(e) => setCurrentPlant({...currentPlant, sinhalaName: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="e.g. කැරට්"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Climatic Zone</label>
                  <select 
                    value={currentPlant.climaticZoneId || ''}
                    onChange={(e) => setCurrentPlant({...currentPlant, climaticZoneId: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="">Select Zone</option>
                    {climaticZones.map(z => (
                      <option key={z.id} value={z.id}>{z.name} ({z.nameSi})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Soil Type</label>
                  <select 
                    value={currentPlant.soilTypeId || ''}
                    onChange={(e) => setCurrentPlant({...currentPlant, soilTypeId: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="">Select Soil Type</option>
                    {soilTypes.map(s => (
                      <option key={s.id} value={s.id}>{s.name} ({s.nameSi})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Harvest Time</label>
                  <select 
                    value={currentPlant.harvestTimeId || ''}
                    onChange={(e) => setCurrentPlant({...currentPlant, harvestTimeId: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="">Select Harvest Time</option>
                    {harvestTimes.map(h => (
                      <option key={h.id} value={h.id}>{h.name} ({h.nameSi})</option>
                    ))}
                  </select>
                </div>
                <div></div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">English Description</label>
                  <textarea 
                    value={currentPlant.description || ''}
                    onChange={(e) => setCurrentPlant({...currentPlant, description: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 h-24"
                    placeholder="Enter english description..."
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Sinhala Description</label>
                  <textarea 
                    value={currentPlant.sinhalaDescription || ''}
                    onChange={(e) => setCurrentPlant({...currentPlant, sinhalaDescription: e.target.value})}
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
                    'Save Plant'
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
              Are you sure you want to delete "{plantToDelete?.name}"? This action cannot be undone.
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

export default PlantManagement;
