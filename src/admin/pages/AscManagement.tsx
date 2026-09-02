import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, X, AlertCircle, Building, MapPin, Search } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getDistricts, getProvinces } from 'sl-gnd-dsd-districts';

interface ASC {
  id: string;
  ascId: string;
  name: string;
  nameSi: string | null;
  province: string;
  district: string;
  officePhone: string | null;
  mobilePhone: string | null;
  email: string | null;
  address: string | null;
  addressSi: string | null;
  googleMapsUrl: string | null;
  officerInCharge: string | null;
  officerInChargeSi: string | null;
  officerDesignation: string | null;
  officerDesignationSi: string | null;
}

const AscManagement = () => {
  const [ascs, setAscs] = useState<ASC[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Search
  const [searchQuery, setSearchQuery] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentAsc, setCurrentAsc] = useState<Partial<ASC>>({});

  // Delete State
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [ascToDelete, setAscToDelete] = useState<ASC | null>(null);

  const { token } = useAuth();
  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  // sl-gnd-dsd-districts data
  const provinces = getProvinces();
  const allDistricts = getDistricts();
  
  // Filter districts by selected province
  const availableDistricts = currentAsc.province 
    ? allDistricts.filter(d => d.provinceEn === currentAsc.province)
    : allDistricts;

  useEffect(() => {
    fetchASCs();
  }, [searchQuery]);

  const fetchASCs = async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams();
      if (searchQuery) params.append('search', searchQuery);
      
      const response = await fetch(`${API_BASE_URL}/asc?${params.toString()}`);
      if (!response.ok) throw new Error('Failed to fetch ASCs');
      const data = await response.json();
      setAscs(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenModal = (asc?: ASC) => {
    if (asc) {
      setIsEditMode(true);
      setCurrentAsc(asc);
    } else {
      setIsEditMode(false);
      setCurrentAsc({});
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentAsc({});
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!currentAsc.ascId || !currentAsc.name || !currentAsc.province || !currentAsc.district) {
        alert("ASC ID, Name, Province, and District are required.");
        return;
      }

      const method = isEditMode ? 'PUT' : 'POST';
      const url = isEditMode 
        ? `${API_BASE_URL}/asc/${currentAsc.id}` 
        : `${API_BASE_URL}/asc`;

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(currentAsc)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save ASC');
      }
      
      await fetchASCs();
      handleCloseModal();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const confirmDelete = async () => {
    if (!ascToDelete) return;
    try {
      const response = await fetch(`${API_BASE_URL}/asc/${ascToDelete.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) throw new Error('Failed to delete ASC');
      await fetchASCs();
      setIsDeleteDialogOpen(false);
      setAscToDelete(null);
    } catch (err: any) {
      alert(err.message);
    }
  };

  if (isLoading && ascs.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <h1 className="text-2xl font-bold text-gray-800">Govijana Sewa Centers (ASCs)</h1>
        <button 
          onClick={() => handleOpenModal()}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <Plus size={20} />
          Add New ASC
        </button>
      </div>

      <div className="relative max-w-md">
        <input
          type="text"
          placeholder="Search by name or ID..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
        />
        <Search className="absolute left-3 top-2.5 text-gray-400" size={20} />
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 flex items-center gap-3">
          <AlertCircle className="text-red-500" />
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* ASCs Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 text-sm font-medium text-gray-500">ID</th>
                <th className="px-6 py-4 text-sm font-medium text-gray-500">Name</th>
                <th className="px-6 py-4 text-sm font-medium text-gray-500">Location</th>
                <th className="px-6 py-4 text-sm font-medium text-gray-500">OIC</th>
                <th className="px-6 py-4 text-sm font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {ascs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                    No Agrarian Service Centers found.
                  </td>
                </tr>
              ) : (
                ascs.map((asc) => (
                  <tr key={asc.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium text-gray-800">{asc.ascId}</td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-800">{asc.name}</div>
                      <div className="text-sm text-gray-500">{asc.nameSi}</div>
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      <div className="flex items-center gap-1">
                        <MapPin size={14} className="text-gray-400"/> {asc.district}, {asc.province}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {asc.officerInCharge || '-'}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <button 
                          onClick={() => handleOpenModal(asc)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button 
                          onClick={() => {
                            setAscToDelete(asc);
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
              <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <Building className="text-green-600" />
                {isEditMode ? 'Edit ASC' : 'Add New ASC'}
              </h2>
              <button onClick={handleCloseModal} className="text-gray-400 hover:text-gray-600">
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSave} className="p-6 space-y-8">
              
              {/* Basic Info */}
              <div>
                <h3 className="text-lg font-semibold text-gray-700 mb-4 border-b pb-2">Basic Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">ASC ID *</label>
                    <input 
                      type="text" 
                      required
                      value={currentAsc.ascId || ''}
                      onChange={(e) => setCurrentAsc({...currentAsc, ascId: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="e.g. ASC-AMP-01"
                    />
                  </div>
                  <div></div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Name (EN) *</label>
                    <input 
                      type="text" 
                      required
                      value={currentAsc.name || ''}
                      onChange={(e) => setCurrentAsc({...currentAsc, name: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="e.g. Nintavur ASC"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Name (SI)</label>
                    <input 
                      type="text" 
                      value={currentAsc.nameSi || ''}
                      onChange={(e) => setCurrentAsc({...currentAsc, nameSi: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="e.g. නින්දවූර් ගොවිජන සේවා මධ්‍යස්ථානය"
                    />
                  </div>
                </div>
              </div>

              {/* Location */}
              <div>
                <h3 className="text-lg font-semibold text-gray-700 mb-4 border-b pb-2">Location</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Province *</label>
                    <select
                      required
                      value={currentAsc.province || ''}
                      onChange={(e) => setCurrentAsc({...currentAsc, province: e.target.value, district: ''})}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                      <option value="">Select Province</option>
                      {provinces.map(p => (
                        <option key={p} value={p}>{p}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">District *</label>
                    <select
                      required
                      value={currentAsc.district || ''}
                      onChange={(e) => setCurrentAsc({...currentAsc, district: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      disabled={!currentAsc.province}
                    >
                      <option value="">Select District</option>
                      {availableDistricts.map(d => (
                        <option key={d.id} value={d.nameEn}>{d.nameEn}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Google Maps URL</label>
                    <input 
                      type="url" 
                      value={currentAsc.googleMapsUrl || ''}
                      onChange={(e) => setCurrentAsc({...currentAsc, googleMapsUrl: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="https://goo.gl/maps/..."
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Address (EN)</label>
                    <textarea 
                      value={currentAsc.address || ''}
                      onChange={(e) => setCurrentAsc({...currentAsc, address: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 h-20"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Address (SI)</label>
                    <textarea 
                      value={currentAsc.addressSi || ''}
                      onChange={(e) => setCurrentAsc({...currentAsc, addressSi: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 h-20"
                    />
                  </div>
                </div>
              </div>

              {/* Contact & Personnel */}
              <div>
                <h3 className="text-lg font-semibold text-gray-700 mb-4 border-b pb-2">Contact & Personnel</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Office Phone</label>
                    <input 
                      type="text" 
                      value={currentAsc.officePhone || ''}
                      onChange={(e) => setCurrentAsc({...currentAsc, officePhone: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Mobile / WhatsApp</label>
                    <input 
                      type="text" 
                      value={currentAsc.mobilePhone || ''}
                      onChange={(e) => setCurrentAsc({...currentAsc, mobilePhone: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                    <input 
                      type="email" 
                      value={currentAsc.email || ''}
                      onChange={(e) => setCurrentAsc({...currentAsc, email: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Officer In-Charge (EN)</label>
                    <input 
                      type="text" 
                      value={currentAsc.officerInCharge || ''}
                      onChange={(e) => setCurrentAsc({...currentAsc, officerInCharge: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Officer In-Charge (SI)</label>
                    <input 
                      type="text" 
                      value={currentAsc.officerInChargeSi || ''}
                      onChange={(e) => setCurrentAsc({...currentAsc, officerInChargeSi: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Designation (EN)</label>
                    <input 
                      type="text" 
                      value={currentAsc.officerDesignation || ''}
                      onChange={(e) => setCurrentAsc({...currentAsc, officerDesignation: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="e.g. ADO"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Designation (SI)</label>
                    <input 
                      type="text" 
                      value={currentAsc.officerDesignationSi || ''}
                      onChange={(e) => setCurrentAsc({...currentAsc, officerDesignationSi: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="e.g. කෘෂිකර්ම සංවර්ධන නිලධාරී"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button 
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                >
                  Save ASC
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
              Are you sure you want to delete "{ascToDelete?.name}"? This action cannot be undone.
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

export default AscManagement;
