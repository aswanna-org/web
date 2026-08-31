import React, { useState, useEffect } from 'react';

// Define the shape of our category tree node
interface CategoryNode {
  id: string;
  name: string;
  children: CategoryNode[];
}

interface CategorySelectorProps {
  onCategoryChange: (categoryId: string) => void;
}

export default function CategorySelector({ onCategoryChange }: CategorySelectorProps) {
  const [categories, setCategories] = useState<CategoryNode[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Selected IDs
  const [mainCatId, setMainCatId] = useState('');
  const [subCatId, setSubCatId] = useState('');

  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    // 1. Fetch the full Category Tree from the API
    const fetchTree = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/categories/tree`);
        if (response.ok) {
          const data = await response.json();
          setCategories(data);
        }
      } catch (error) {
        console.error('Failed to fetch category tree:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTree();
  }, []);

  // Effect to notify parent component of the selected ID
  useEffect(() => {
    const finalId = subCatId || mainCatId;
    onCategoryChange(finalId);
  }, [mainCatId, subCatId, onCategoryChange]);

  // 2. Find the selected Main Category data to get its children
  const selectedMainCat = categories.find(c => c.id === mainCatId);

  if (isLoading) {
    return <div className="text-sm text-gray-500 animate-pulse">Loading categories...</div>;
  }

  return (
    <div className="flex flex-col gap-4 w-full">
      
      {/* Main Category Dropdown */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Main Category</label>
        <select 
          className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
          value={mainCatId} 
          onChange={(e) => {
            setMainCatId(e.target.value);
            setSubCatId(''); // Clear sub category when main changes
          }}
        >
          <option value="">Select Main Category...</option>
          {categories.map(cat => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </select>
      </div>

      {/* Sub Category Dropdown (Only shows if a Main category with children is selected) */}
      {selectedMainCat && selectedMainCat.children && selectedMainCat.children.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1 mt-2">Sub Category</label>
          <select 
            className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
            value={subCatId} 
            onChange={(e) => setSubCatId(e.target.value)}
          >
            <option value="">Select Sub Category...</option>
            {selectedMainCat.children.map(subCat => (
              <option key={subCat.id} value={subCat.id}>{subCat.name}</option>
            ))}
          </select>
        </div>
      )}

    </div>
  );
}
