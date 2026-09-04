import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, X, Search, BookOpen, Clock, PlusCircle, MinusCircle, Image as ImageIcon } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface Course {
  id: string;
  courseCode: string;
  title: string;
  slug: string;
  categoryId: string;
  instructorId: string | null;
  courseLevel: string;
  deliveryMode: string;
  mediums: string[];
  description: string;
  durationValue: number;
  durationUnit: string;
  startDate: string | null;
  deadlineDate: string | null;
  classSchedule: string;
  venueLocation: string;
  entryRequirements: string;
  certificateType: string;
  accreditedBy: string;
  courseFee: number;
  maxIntake: number;
  applyUrl: string;
  bannerImageUrl: string | null;
  status: string;
  internalNotes: string;
  category?: { id: string; categoryNameEn: string; categoryNameSi: string };
  modules?: { id?: string; moduleTitle: string; moduleDescription: string }[];
}

const CourseManagement = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [instructors, setInstructors] = useState<any[]>([]);
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Search
  const [searchQuery, setSearchQuery] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentCourse, setCurrentCourse] = useState<Partial<Course>>({ mediums: ['සිංහල'], modules: [] });
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);

  // Delete State
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [courseToDelete, setCourseToDelete] = useState<Course | null>(null);

  const { token } = useAuth();
  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      
      const [coursesRes, catRes, insRes] = await Promise.all([
        fetch(`${API_BASE_URL}/courses/admin/all`, { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch(`${API_BASE_URL}/courses/categories`),
        fetch(`${API_BASE_URL}/courses/instructors`)
      ]);

      if (!coursesRes.ok) throw new Error('Failed to fetch courses');
      
      const [coursesData, catData, insData] = await Promise.all([
        coursesRes.json(),
        catRes.ok ? catRes.json() : [],
        insRes.ok ? insRes.json() : []
      ]);

      setCourses(coursesData);
      setCategories(catData);
      setInstructors(insData);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  let displayCourses = courses;
  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase();
    displayCourses = displayCourses.filter(c =>
      c.title.toLowerCase().includes(q) ||
      c.courseCode.toLowerCase().includes(q) ||
      c.slug.toLowerCase().includes(q)
    );
  }

  const handleOpenAddModal = () => {
    setCurrentCourse({
      courseCode: '',
      title: '',
      slug: '',
      categoryId: categories[0]?.id || '',
      instructorId: '',
      courseLevel: 'NVQ_Level_4',
      deliveryMode: 'Physical_Farm',
      mediums: ['සිංහල'],
      durationValue: 3,
      durationUnit: 'Months',
      courseFee: 0,
      maxIntake: 30,
      status: 'Published',
      modules: [{ moduleTitle: '', moduleDescription: '' }]
    });
    setSelectedImage(null);
    setImagePreviewUrl(null);
    setIsEditMode(false);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = async (course: Course) => {
    try {
      // Fetch full course details to get modules
      const res = await fetch(`${API_BASE_URL}/courses/${course.slug}`);
      const fullCourse = await res.json();
      setCurrentCourse(fullCourse);
      setSelectedImage(null);
      setImagePreviewUrl(fullCourse.bannerImageUrl || null);
      setIsEditMode(true);
      setIsModalOpen(true);
    } catch (e) {
      console.error(e);
      // Fallback
      setCurrentCourse(course);
      setIsEditMode(true);
      setIsModalOpen(true);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentCourse({ mediums: [], modules: [] });
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

  const handleAddModule = () => {
    setCurrentCourse(prev => ({
      ...prev,
      modules: [...(prev.modules || []), { moduleTitle: '', moduleDescription: '' }]
    }));
  };

  const handleRemoveModule = (index: number) => {
    setCurrentCourse(prev => {
      const newModules = [...(prev.modules || [])];
      newModules.splice(index, 1);
      return { ...prev, modules: newModules };
    });
  };

  const handleModuleChange = (index: number, field: string, value: string) => {
    setCurrentCourse(prev => {
      const newModules = [...(prev.modules || [])];
      newModules[index] = { ...newModules[index], [field]: value };
      return { ...prev, modules: newModules };
    });
  };

  const handleSaveCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = isEditMode
        ? `${API_BASE_URL}/courses/${currentCourse.id}`
        : `${API_BASE_URL}/courses`;
      const method = isEditMode ? 'PUT' : 'POST';

      const formData = new FormData();
      Object.keys(currentCourse).forEach(key => {
        if (key === 'modules' || key === 'mediums') {
          formData.append(key, JSON.stringify(currentCourse[key as keyof Course]));
        } else if (key !== 'category' && key !== 'bannerImageUrl') {
          const val = currentCourse[key as keyof Course];
          if (val !== null && val !== undefined) {
            formData.append(key, val.toString());
          }
        }
      });

      if (selectedImage) {
        formData.append('image', selectedImage);
      }

      const response = await fetch(url, {
        method,
        headers: {
          ...(token && { 'Authorization': `Bearer ${token}` })
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save course');
      }

      fetchData();
      handleCloseModal();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const confirmDelete = (course: Course) => {
    setCourseToDelete(course);
    setIsDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!courseToDelete) return;
    try {
      const response = await fetch(`${API_BASE_URL}/courses/${courseToDelete.id}`, {
        method: 'DELETE',
        headers: {
          ...(token && { 'Authorization': `Bearer ${token}` })
        }
      });

      if (!response.ok) throw new Error('Failed to delete course');

      fetchData();
      setIsDeleteDialogOpen(false);
      setCourseToDelete(null);
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-6 w-full mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Course Management</h1>
          <p className="mt-1 text-sm text-gray-500">Manage educational courses, syllabus modules, and requirements.</p>
        </div>
        <button
          onClick={handleOpenAddModal}
          className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2.5 rounded-lg font-medium transition-colors shadow-sm whitespace-nowrap"
        >
          <Plus size={18} />
          Add Course
        </button>
      </div>

      {/* Search */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-gray-200">
        <div className="relative w-full sm:max-w-md">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
            <Search size={18} />
          </span>
          <input
            type="text"
            placeholder="Search courses by title, code, or slug..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-gray-300 bg-gray-50 py-2.5 pl-10 pr-4 text-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500 transition-colors"
          />
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-gray-500">Loading courses...</div>
        ) : error ? (
          <div className="p-8 text-center text-red-500">{error}</div>
        ) : displayCourses.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center justify-center">
            <BookOpen className="w-12 h-12 text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900">No courses found</h3>
            <p className="text-gray-500 mt-1">Get started by adding a new course.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px]">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  <th className="p-4">Course Info</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Duration & Fee</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {displayCourses.map((course) => (
                  <tr key={course.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0">
                          {course.bannerImageUrl ? (
                            <img src={course.bannerImageUrl} alt={course.title} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <BookOpen className="w-5 h-5 text-gray-400" />
                            </div>
                          )}
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{course.title}</div>
                          <div className="text-xs text-gray-500 mt-0.5">{course.courseCode} • {course.slug}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-sm text-gray-600">
                      <span className="bg-green-50 text-green-700 px-2.5 py-1 rounded-md text-xs font-medium border border-green-100">
                        {course.category?.categoryNameEn || 'Unknown'}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="text-sm text-gray-900 font-medium">Rs. {course.courseFee}</div>
                      <div className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                        <Clock size={12} />
                        {course.durationValue} {course.durationUnit}
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                        course.status === 'Published' ? 'bg-green-100 text-green-800' : 
                        course.status === 'Draft' ? 'bg-amber-100 text-amber-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {course.status}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleOpenEditModal(course)}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => confirmDelete(course)}
                          className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col my-8">
            <div className="flex justify-between items-center p-6 border-b border-gray-100 flex-shrink-0">
              <h2 className="text-xl font-bold text-gray-900">
                {isEditMode ? 'Edit Course' : 'Add New Course'}
              </h2>
              <button
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-2 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1">
              <form id="courseForm" onSubmit={handleSaveCourse} className="space-y-6">
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Course Code *</label>
                    <input
                      type="text"
                      required
                      value={currentCourse.courseCode || ''}
                      onChange={(e) => setCurrentCourse({ ...currentCourse, courseCode: e.target.value })}
                      className="w-full rounded-lg border border-gray-300 p-2.5 text-sm focus:border-green-500 focus:ring-1 focus:ring-green-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                    <input
                      type="text"
                      required
                      value={currentCourse.title || ''}
                      onChange={(e) => {
                        const title = e.target.value;
                        const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
                        setCurrentCourse({ ...currentCourse, title, slug: isEditMode ? currentCourse.slug : slug });
                      }}
                      className="w-full rounded-lg border border-gray-300 p-2.5 text-sm focus:border-green-500 focus:ring-1 focus:ring-green-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">URL Slug *</label>
                    <input
                      type="text"
                      required
                      value={currentCourse.slug || ''}
                      onChange={(e) => setCurrentCourse({ ...currentCourse, slug: e.target.value })}
                      className="w-full rounded-lg border border-gray-300 p-2.5 text-sm focus:border-green-500 focus:ring-1 focus:ring-green-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                    <select
                      required
                      value={currentCourse.categoryId || ''}
                      onChange={(e) => setCurrentCourse({ ...currentCourse, categoryId: e.target.value })}
                      className="w-full rounded-lg border border-gray-300 p-2.5 text-sm focus:border-green-500 focus:ring-1 focus:ring-green-500"
                    >
                      <option value="">Select Category</option>
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>{c.categoryNameEn} - {c.categoryNameSi}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Course Fee (LKR) *</label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={currentCourse.courseFee || 0}
                      onChange={(e) => setCurrentCourse({ ...currentCourse, courseFee: parseFloat(e.target.value) })}
                      className="w-full rounded-lg border border-gray-300 p-2.5 text-sm focus:border-green-500 focus:ring-1 focus:ring-green-500"
                    />
                  </div>
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Duration *</label>
                      <input
                        type="number"
                        required
                        min="1"
                        value={currentCourse.durationValue || ''}
                        onChange={(e) => setCurrentCourse({ ...currentCourse, durationValue: parseInt(e.target.value) })}
                        className="w-full rounded-lg border border-gray-300 p-2.5 text-sm focus:border-green-500 focus:ring-1 focus:ring-green-500"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Unit *</label>
                      <select
                        value={currentCourse.durationUnit || 'Months'}
                        onChange={(e) => setCurrentCourse({ ...currentCourse, durationUnit: e.target.value })}
                        className="w-full rounded-lg border border-gray-300 p-2.5 text-sm focus:border-green-500 focus:ring-1 focus:ring-green-500"
                      >
                        <option value="Days">Days</option>
                        <option value="Weeks">Weeks</option>
                        <option value="Months">Months</option>
                        <option value="Years">Years</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Level</label>
                    <select
                      value={currentCourse.courseLevel || 'NVQ_Level_4'}
                      onChange={(e) => setCurrentCourse({ ...currentCourse, courseLevel: e.target.value })}
                      className="w-full rounded-lg border border-gray-300 p-2.5 text-sm focus:border-green-500 focus:ring-1 focus:ring-green-500"
                    >
                      <option value="Beginner">Beginner</option>
                      <option value="Certificate">Certificate</option>
                      <option value="Diploma">Diploma</option>
                      <option value="NVQ_Level_3">NVQ Level 3</option>
                      <option value="NVQ_Level_4">NVQ Level 4</option>
                      <option value="NVQ_Level_5">NVQ Level 5</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Mode</label>
                    <select
                      value={currentCourse.deliveryMode || 'Physical_Farm'}
                      onChange={(e) => setCurrentCourse({ ...currentCourse, deliveryMode: e.target.value })}
                      className="w-full rounded-lg border border-gray-300 p-2.5 text-sm focus:border-green-500 focus:ring-1 focus:ring-green-500"
                    >
                      <option value="Physical_Farm">Physical (Farm/Center)</option>
                      <option value="Online">Online</option>
                      <option value="Hybrid_Blended">Hybrid / Blended</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <select
                      value={currentCourse.status || 'Draft'}
                      onChange={(e) => setCurrentCourse({ ...currentCourse, status: e.target.value })}
                      className="w-full rounded-lg border border-gray-300 p-2.5 text-sm focus:border-green-500 focus:ring-1 focus:ring-green-500"
                    >
                      <option value="Draft">Draft</option>
                      <option value="Published">Published</option>
                      <option value="Archived">Archived</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Instructor</label>
                    <select
                      value={currentCourse.instructorId || ''}
                      onChange={(e) => setCurrentCourse({ ...currentCourse, instructorId: e.target.value })}
                      className="w-full rounded-lg border border-gray-300 p-2.5 text-sm focus:border-green-500 focus:ring-1 focus:ring-green-500"
                    >
                      <option value="">No Instructor</option>
                      {instructors.map((ins) => (
                        <option key={ins.id} value={ins.id}>{ins.fullName}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="col-span-full">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea
                      rows={3}
                      value={currentCourse.description || ''}
                      onChange={(e) => setCurrentCourse({ ...currentCourse, description: e.target.value })}
                      className="w-full rounded-lg border border-gray-300 p-2.5 text-sm focus:border-green-500 focus:ring-1 focus:ring-green-500"
                    />
                  </div>
                </div>

                {/* Modules Array */}
                <div className="border border-gray-200 rounded-xl p-4 bg-gray-50">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-md font-semibold text-gray-800">Syllabus Modules</h3>
                    <button
                      type="button"
                      onClick={handleAddModule}
                      className="flex items-center gap-1 text-sm text-green-600 hover:text-green-700 font-medium"
                    >
                      <PlusCircle size={16} /> Add Module
                    </button>
                  </div>
                  <div className="space-y-4">
                    {currentCourse.modules?.map((mod, index) => (
                      <div key={index} className="flex gap-4 items-start bg-white p-4 rounded-lg border border-gray-200 shadow-sm relative">
                        <div className="absolute top-2 right-2">
                          <button
                            type="button"
                            onClick={() => handleRemoveModule(index)}
                            className="text-red-400 hover:text-red-600 p-1"
                          >
                            <MinusCircle size={18} />
                          </button>
                        </div>
                        <div className="flex-1 space-y-3 pt-2">
                          <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Module Title *</label>
                            <input
                              type="text"
                              required
                              value={mod.moduleTitle}
                              onChange={(e) => handleModuleChange(index, 'moduleTitle', e.target.value)}
                              className="w-full rounded-md border border-gray-300 p-2 text-sm focus:border-green-500 focus:ring-1 focus:ring-green-500"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Description</label>
                            <textarea
                              rows={2}
                              value={mod.moduleDescription}
                              onChange={(e) => handleModuleChange(index, 'moduleDescription', e.target.value)}
                              className="w-full rounded-md border border-gray-300 p-2 text-sm focus:border-green-500 focus:ring-1 focus:ring-green-500"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                    {(!currentCourse.modules || currentCourse.modules.length === 0) && (
                      <div className="text-sm text-gray-500 text-center py-4">No modules added yet.</div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Banner Image</label>
                  <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-xl hover:border-green-500 transition-colors bg-gray-50">
                    <div className="space-y-2 text-center w-full">
                      {imagePreviewUrl ? (
                        <div className="relative mx-auto w-full max-w-sm h-48 rounded-lg overflow-hidden group">
                          <img src={imagePreviewUrl} alt="Preview" className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                            <label className="cursor-pointer bg-white text-gray-900 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-100">
                              Change Image
                              <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                            </label>
                          </div>
                        </div>
                      ) : (
                        <label className="flex flex-col items-center cursor-pointer">
                          <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
                          <div className="flex text-sm text-gray-600 mt-2">
                            <span className="relative rounded-md font-medium text-green-600 hover:text-green-500">
                              Upload a file
                            </span>
                            <p className="pl-1">or drag and drop</p>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">PNG, JPG, WebP up to 5MB</p>
                          <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                        </label>
                      )}
                    </div>
                  </div>
                </div>
              </form>
            </div>

            <div className="p-6 border-t border-gray-100 flex justify-end gap-3 flex-shrink-0 bg-gray-50 rounded-b-2xl">
              <button
                type="button"
                onClick={handleCloseModal}
                className="px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-200 bg-gray-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="courseForm"
                className="px-5 py-2.5 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors shadow-sm"
              >
                {isEditMode ? 'Update Course' : 'Save Course'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Delete Course</h3>
            <p className="text-gray-600 text-sm mb-6">
              Are you sure you want to delete <span className="font-semibold text-gray-900">"{courseToDelete?.title}"</span>? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setIsDeleteDialogOpen(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
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

export default CourseManagement;
