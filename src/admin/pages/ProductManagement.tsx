import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, X, AlertCircle, Image as ImageIcon, Upload } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface Product {
  id: string;
  name: string;
  sinhalaName: string | null;
  slug: string;
  description: string | null;
  sinhalaDescription: string | null;
  price: number | null;
  quantity: number | null;
  image: string | null;
  category: string;
  categorySinhala: string | null;
}

const PREDEFINED_CATEGORIES = [
  { en: "Pohora", si: "පොහොර" },
  { en: "Upakarana", si: "උපකරණ" },
  { en: "Bija", si: "බීජ" },
  { en: "Prakashana", si: "ප්‍රකාශන" }
];

const ProductManagement = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentProduct, setCurrentProduct] = useState<Partial<Product>>({});
  
  // Image Upload State
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Delete State
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);

  const { token } = useAuth();
  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${API_BASE_URL}/products`);
      if (!response.ok) throw new Error('Failed to fetch products');
      const data = await response.json();
      setProducts(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };



  const handleOpenModal = (product?: Product) => {
    if (product) {
      setIsEditMode(true);
      setCurrentProduct(product);
    } else {
      setIsEditMode(false);
      setCurrentProduct({ category: '' });
    }
    setImageFile(null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentProduct({});
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
      if (!currentProduct.name || !currentProduct.slug || !currentProduct.category) {
        alert("Name, slug, and category are required.");
        return;
      }

      setIsUploading(true);
      let imageUrl = currentProduct.image;

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
        ...currentProduct,
        image: imageUrl
      };

      const method = isEditMode ? 'PUT' : 'POST';
      const url = isEditMode 
        ? `${API_BASE_URL}/products/${currentProduct.id}` 
        : `${API_BASE_URL}/products`;

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) throw new Error('Failed to save product');
      
      await fetchProducts();
      handleCloseModal();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsUploading(false);
    }
  };

  const confirmDelete = async () => {
    if (!productToDelete) return;
    try {
      const response = await fetch(`${API_BASE_URL}/products/${productToDelete.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) throw new Error('Failed to delete product');
      await fetchProducts();
      setIsDeleteDialogOpen(false);
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-800">Products</h1>
        <button 
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md transition-colors"
        >
          <Plus size={18} />
          Add Product
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-md flex items-start gap-3">
          <AlertCircle size={20} className="mt-0.5 flex-shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Image</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price/Qty</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-gray-500">Loading...</td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-gray-500">No products found.</td>
                </tr>
              ) : (
                products.map((product) => (
                  <tr key={product.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {product.image ? (
                        <img src={product.image} alt={product.name} className="h-10 w-10 object-cover rounded-md" />
                      ) : (
                        <div className="h-10 w-10 bg-gray-100 flex items-center justify-center rounded-md text-gray-400">
                          <ImageIcon size={20} />
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{product.name}</div>
                      <div className="text-sm text-gray-500">{product.slug}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <span className="bg-gray-100 px-2.5 py-0.5 rounded text-gray-700">{product.category}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">Rs. {product.price || 0}</div>
                      <div className="text-sm text-gray-500">Qty: {product.quantity || 0}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => handleOpenModal(product)} className="text-blue-600 hover:text-blue-900 bg-blue-50 p-1.5 rounded">
                          <Edit2 size={16} />
                        </button>
                        <button onClick={() => { setProductToDelete(product); setIsDeleteDialogOpen(true); }} className="text-red-600 hover:text-red-900 bg-red-50 p-1.5 rounded">
                          <Trash2 size={16} />
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

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b border-gray-100">
              <h2 className="text-xl font-semibold text-gray-800">{isEditMode ? 'Edit Product' : 'Add Product'}</h2>
              <button onClick={handleCloseModal} className="text-gray-400 hover:text-gray-600"><X size={24} /></button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name (English) *</label>
                  <input type="text" required value={currentProduct.name || ''} onChange={(e) => setCurrentProduct({...currentProduct, name: e.target.value})} className="w-full px-4 py-2 border rounded-md" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name (Sinhala)</label>
                  <input type="text" value={currentProduct.sinhalaName || ''} onChange={(e) => setCurrentProduct({...currentProduct, sinhalaName: e.target.value})} className="w-full px-4 py-2 border rounded-md" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Slug *</label>
                  <input type="text" required value={currentProduct.slug || ''} onChange={(e) => setCurrentProduct({...currentProduct, slug: e.target.value})} className="w-full px-4 py-2 border rounded-md" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                  <select
                    required
                    value={currentProduct.category || ''}
                    onChange={(e) => {
                      const selected = PREDEFINED_CATEGORIES.find(c => c.en === e.target.value);
                      if (selected) {
                        setCurrentProduct({
                          ...currentProduct,
                          category: selected.en,
                          categorySinhala: selected.si
                        });
                      } else {
                        setCurrentProduct({ ...currentProduct, category: '', categorySinhala: '' });
                      }
                    }}
                    className="w-full px-4 py-2 border rounded-md"
                  >
                    <option value="" disabled>Select a category</option>
                    {PREDEFINED_CATEGORIES.map(cat => (
                      <option key={cat.en} value={cat.en}>
                        {cat.en} / {cat.si}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price (Rs.)</label>
                  <input type="number" step="0.01" value={currentProduct.price || ''} onChange={(e) => setCurrentProduct({...currentProduct, price: parseFloat(e.target.value)})} className="w-full px-4 py-2 border rounded-md" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                  <input type="number" value={currentProduct.quantity || ''} onChange={(e) => setCurrentProduct({...currentProduct, quantity: parseInt(e.target.value, 10)})} className="w-full px-4 py-2 border rounded-md" />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description (English)</label>
                  <textarea rows={3} value={currentProduct.description || ''} onChange={(e) => setCurrentProduct({...currentProduct, description: e.target.value})} className="w-full px-4 py-2 border rounded-md"></textarea>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description (Sinhala)</label>
                  <textarea rows={3} value={currentProduct.sinhalaDescription || ''} onChange={(e) => setCurrentProduct({...currentProduct, sinhalaDescription: e.target.value})} className="w-full px-4 py-2 border rounded-md"></textarea>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Product Image</label>
                <div className="flex items-center gap-4">
                  {currentProduct.image && !imageFile && (
                    <img src={currentProduct.image} alt="Preview" className="h-16 w-16 object-cover rounded-md border" />
                  )}
                  {imageFile && (
                    <div className="h-16 w-16 bg-green-50 flex items-center justify-center rounded-md border border-green-200 text-green-600">
                      <ImageIcon size={24} />
                    </div>
                  )}
                  <label className="cursor-pointer bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-md transition-colors flex items-center gap-2">
                    <Upload size={18} />
                    {currentProduct.image || imageFile ? 'Change Image' : 'Upload Image'}
                    <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                  </label>
                  {imageFile && <span className="text-sm text-gray-500">{imageFile.name}</span>}
                </div>
              </div>
              
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button type="button" onClick={handleCloseModal} className="px-4 py-2 border text-gray-700 rounded-md">Cancel</button>
                <button type="submit" disabled={isUploading} className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md disabled:opacity-70 disabled:cursor-not-allowed">
                  {isUploading ? 'Saving...' : 'Save Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteDialogOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Delete Product</h3>
            <p className="text-gray-500 mb-6">Are you sure you want to delete "{productToDelete?.name}"? This action cannot be undone.</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setIsDeleteDialogOpen(false)} className="px-4 py-2 border text-gray-700 rounded-md">Cancel</button>
              <button onClick={confirmDelete} className="px-4 py-2 bg-red-600 text-white rounded-md">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductManagement;
