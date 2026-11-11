import React, { useState, useEffect } from 'react';
import { X, Briefcase, Calendar, FileText, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export interface UserJobItem {
  id: string;
  slug?: string;
  designation: string;
  designationSi?: string | null;
  jobCategoryId: string;
  jobCategory?: { id: string; name: string; sinhalaName?: string };
  institutionId?: string | null;
  institution?: { id: string; name: string };
  companyName?: string | null;
  companyNameSi?: string | null;
  jobNature?: string | null;
  jobNatureSi?: string | null;
  serviceCategory?: string | null;
  serviceCategorySi?: string | null;
  country?: string | null;
  approvalStatus?: string;
  isActive?: boolean;
  applicationInfo?: {
    applicationDeadline?: string | null;
    applicationEmail?: string | null;
    contactPhone?: string | null;
    applicationUrl?: string | null;
    postalAddress?: string | null;
    gazetteUrl?: string | null;
    specimenAppUrl?: string | null;
  } | null;
  eligibility?: {
    educationalQualifications?: string | null;
    educationalQualificationsSi?: string | null;
    professionalQualifications?: string | null;
    professionalQualificationsSi?: string | null;
    ageLimit?: string | null;
    experience?: string | null;
  } | null;
  createdAt: string;
}

interface UserJobModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  jobToEdit?: UserJobItem | null;
  categories: { id: string; name: string; sinhalaName?: string }[];
  institutions: { id: string; name: string }[];
}

export const UserJobModal: React.FC<UserJobModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  jobToEdit,
  categories,
  institutions
}) => {
  const { token, user } = useAuth();
  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  const [activeTab, setActiveTab] = useState<'basic' | 'requirements' | 'application'>('basic');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [designation, setDesignation] = useState('');
  const [designationSi, setDesignationSi] = useState('');
  const [jobCategoryId, setJobCategoryId] = useState('');
  const [institutionId, setInstitutionId] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [jobNature, setJobNature] = useState('Full-Time');
  const [serviceCategory, setServiceCategory] = useState('');
  
  // Qualifications & Details
  const [eduQuals, setEduQuals] = useState('');
  const [eduQualsSi, setEduQualsSi] = useState('');
  const [profQuals, setProfQuals] = useState('');
  const [experience, setExperience] = useState('');
  const [ageLimit, setAgeLimit] = useState('');

  // Application Info
  const [applicationDeadline, setApplicationDeadline] = useState('');
  const [applicationEmail, setApplicationEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [applicationUrl, setApplicationUrl] = useState('');
  const [postalAddress, setPostalAddress] = useState('');

  // File uploads
  const [specimenAppFile, setSpecimenAppFile] = useState<File | null>(null);
  const [gazetteFile, setGazetteFile] = useState<File | null>(null);

  useEffect(() => {
    if (jobToEdit) {
      setDesignation(jobToEdit.designation || '');
      setDesignationSi(jobToEdit.designationSi || '');
      setJobCategoryId(jobToEdit.jobCategoryId || (categories[0]?.id || ''));
      setInstitutionId(jobToEdit.institutionId || '');
      setCompanyName(jobToEdit.companyName || '');
      setJobNature(jobToEdit.jobNature || 'Full-Time');
      setServiceCategory(jobToEdit.serviceCategory || '');

      const elig = jobToEdit.eligibility;
      setEduQuals(elig?.educationalQualifications || '');
      setEduQualsSi(elig?.educationalQualificationsSi || '');
      setProfQuals(elig?.professionalQualifications || '');
      setExperience(elig?.experience || '');
      setAgeLimit(elig?.ageLimit || '');

      const app = jobToEdit.applicationInfo;
      if (app?.applicationDeadline) {
        try {
          const d = new Date(app.applicationDeadline);
          setApplicationDeadline(d.toISOString().split('T')[0]);
        } catch {
          setApplicationDeadline(app.applicationDeadline);
        }
      } else {
        setApplicationDeadline('');
      }
      setApplicationEmail(app?.applicationEmail || '');
      setContactPhone(app?.contactPhone || '');
      setApplicationUrl(app?.applicationUrl || '');
      setPostalAddress(app?.postalAddress || '');
    } else {
      setDesignation('');
      setDesignationSi('');
      setJobCategoryId(categories[0]?.id || '');
      setInstitutionId('');
      setCompanyName(user?.name ? `${user.name}'s Business` : '');
      setJobNature('Full-Time');
      setServiceCategory('General Agriculture');
      setEduQuals('');
      setEduQualsSi('');
      setProfQuals('');
      setExperience('');
      setAgeLimit('');
      setApplicationDeadline('');
      setApplicationEmail(user?.email || '');
      setContactPhone(user?.phone || '');
      setApplicationUrl('');
      setPostalAddress('');
    }
    setSpecimenAppFile(null);
    setGazetteFile(null);
    setError(null);
    setActiveTab('basic');
  }, [jobToEdit, categories, user, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!designation.trim()) {
      setError('Job Designation is required.');
      setActiveTab('basic');
      return;
    }
    if (!jobCategoryId) {
      setError('Please select a Job Category.');
      setActiveTab('basic');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('designation', designation.trim());
      if (designationSi.trim()) formData.append('designationSi', designationSi.trim());
      formData.append('jobCategoryId', jobCategoryId);
      if (institutionId) formData.append('institutionId', institutionId);
      if (companyName.trim()) formData.append('companyName', companyName.trim());
      formData.append('jobNature', jobNature);
      if (serviceCategory.trim()) formData.append('serviceCategory', serviceCategory.trim());

      const eligibilityObj = {
        educationalQualifications: eduQuals.trim() || null,
        educationalQualificationsSi: eduQualsSi.trim() || null,
        professionalQualifications: profQuals.trim() || null,
        experience: experience.trim() || null,
        ageLimit: ageLimit.trim() || null
      };
      formData.append('eligibility', JSON.stringify(eligibilityObj));

      const applicationInfoObj = {
        applicationDeadline: applicationDeadline ? new Date(applicationDeadline).toISOString() : null,
        applicationEmail: applicationEmail.trim() || null,
        contactPhone: contactPhone.trim() || null,
        applicationUrl: applicationUrl.trim() || null,
        postalAddress: postalAddress.trim() || null
      };
      formData.append('applicationInfo', JSON.stringify(applicationInfoObj));

      if (specimenAppFile) {
        formData.append('specimenApp', specimenAppFile);
      }
      if (gazetteFile) {
        formData.append('gazette', gazetteFile);
      }

      const url = jobToEdit
        ? `${API_BASE_URL}/careers/jobs/${jobToEdit.id}`
        : `${API_BASE_URL}/careers/jobs`;
      const method = jobToEdit ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: (token ? { Authorization: `Bearer ${token}` } : {}) as HeadersInit,
        body: formData
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || json.message || 'Failed to save job post.');
      }

      onSuccess();
    } catch (err: any) {
      console.error('Job save error:', err);
      setError(err.message || 'Network error while saving job.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden border border-gray-100">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 bg-gray-50/80">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold">
              <Briefcase size={16} />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-gray-900">
                {jobToEdit ? 'Edit Job Post' : 'Post a New Job'}
              </h3>
              <p className="text-[11px] text-gray-500">
                {jobToEdit ? 'ඔබේ රැකියා ඇබෑර්තු දැන්වීම සංස්කරණය කරන්න' : 'නව රැකියා ඇබෑර්තු දැන්වීමක් පළ කරන්න'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-200/60 rounded-lg transition cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab Headers */}
        <div className="flex border-b border-gray-200 px-5 bg-white text-xs font-semibold gap-4">
          <button
            type="button"
            onClick={() => setActiveTab('basic')}
            className={`py-2.5 border-b-2 cursor-pointer transition ${
              activeTab === 'basic'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            1. Basic Job Details
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('requirements')}
            className={`py-2.5 border-b-2 cursor-pointer transition ${
              activeTab === 'requirements'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            2. Qualifications & Experience
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('application')}
            className={`py-2.5 border-b-2 cursor-pointer transition ${
              activeTab === 'application'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            3. Application & Contact
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-4">
          {error && (
            <div className="flex items-center gap-2 p-3 text-xs bg-rose-50 text-rose-700 rounded-xl border border-rose-200">
              <AlertCircle size={15} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* TAB 1: BASIC DETAILS */}
          {activeTab === 'basic' && (
            <div className="space-y-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Job Designation (English) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Farm Supervisor / Agri Officer"
                    value={designation}
                    onChange={(e) => setDesignation(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    තනතුරේ නම (සිංහලෙන්)
                  </label>
                  <input
                    type="text"
                    placeholder="උදා: ගොවිපළ පාලක / කෘෂි නිලධාරී"
                    value={designationSi}
                    onChange={(e) => setDesignationSi(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Job Category <span className="text-rose-500">*</span>
                  </label>
                  <select
                    required
                    value={jobCategoryId}
                    onChange={(e) => setJobCategoryId(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 bg-white"
                  >
                    <option value="">Select Category</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} {c.sinhalaName ? `(${c.sinhalaName})` : ''}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Job Nature / Engagement
                  </label>
                  <select
                    value={jobNature}
                    onChange={(e) => setJobNature(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 bg-white"
                  >
                    <option value="Full-Time">Full-Time (පූර්ණ කාලීන)</option>
                    <option value="Part-Time">Part-Time (අර්ධ කාලීන)</option>
                    <option value="Contract">Contract (කොන්ත්‍රාත් පදනම)</option>
                    <option value="Seasonal">Seasonal (කන්න පදනම)</option>
                    <option value="Internship">Internship (පුහුණුලාභී)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Company or Business Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Green Valley Farm"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Institution (If applicable)
                  </label>
                  <select
                    value={institutionId}
                    onChange={(e) => setInstitutionId(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 bg-white"
                  >
                    <option value="">None / Private Employer</option>
                    {institutions.map((inst) => (
                      <option key={inst.id} value={inst.id}>
                        {inst.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Service / Sector Category
                </label>
                <input
                  type="text"
                  placeholder="e.g. Agriculture / Dairy / Nursery Production / Export"
                  value={serviceCategory}
                  onChange={(e) => setServiceCategory(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>
            </div>
          )}

          {/* TAB 2: REQUIREMENTS & EXPERIENCE */}
          {activeTab === 'requirements' && (
            <div className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Educational Qualifications (English)
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Diploma in Agriculture or GCE A/L Biosystems Technology"
                  value={eduQuals}
                  onChange={(e) => setEduQuals(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  අධ්‍යාපනික සුදුසුකම් (සිංහලෙන්)
                </label>
                <textarea
                  rows={2}
                  placeholder="උදා: කෘෂිකර්ම ඩිප්ලෝමාව හෝ උසස් පෙළ තාක්ෂණවේදය"
                  value={eduQualsSi}
                  onChange={(e) => setEduQualsSi(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Experience Required
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Minimum 1-2 years in farm operations"
                    value={experience}
                    onChange={(e) => setExperience(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Age Limit / වයස් සීමාව
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 20 - 45 years"
                    value={ageLimit}
                    onChange={(e) => setAgeLimit(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Professional / Technical Skills
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Drone spraying license, greenhouse management, tractor driving"
                  value={profQuals}
                  onChange={(e) => setProfQuals(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>
            </div>
          )}

          {/* TAB 3: APPLICATION & CONTACT */}
          {activeTab === 'application' && (
            <div className="space-y-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1 flex items-center gap-1">
                    <Calendar size={13} className="text-emerald-600" />
                    <span>Application Deadline (අවසාන දිනය)</span>
                  </label>
                  <input
                    type="date"
                    value={applicationDeadline}
                    onChange={(e) => setApplicationDeadline(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Contact Phone / WhatsApp
                  </label>
                  <input
                    type="text"
                    placeholder="077-XXXXXXX"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Application Email
                  </label>
                  <input
                    type="email"
                    placeholder="careers@myfarm.lk"
                    value={applicationEmail}
                    onChange={(e) => setApplicationEmail(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Application / Website Link (Optional)
                  </label>
                  <input
                    type="url"
                    placeholder="https://..."
                    value={applicationUrl}
                    onChange={(e) => setApplicationUrl(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Postal Address for sending CVs / Applications (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. No. 12, Farm Road, Anuradhapura"
                  value={postalAddress}
                  onChange={(e) => setPostalAddress(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              {/* PDF Documents */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2 border-t border-gray-200">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1 flex items-center gap-1">
                    <FileText size={13} className="text-blue-600" />
                    <span>Application Form (PDF)</span>
                  </label>
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={(e) => setSpecimenAppFile(e.target.files?.[0] || null)}
                    className="w-full text-xs text-gray-500 file:mr-2 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1 flex items-center gap-1">
                    <FileText size={13} className="text-emerald-600" />
                    <span>Detailed Circular / Gazette (PDF)</span>
                  </label>
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={(e) => setGazetteFile(e.target.files?.[0] || null)}
                    className="w-full text-xs text-gray-500 file:mr-2 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 cursor-pointer"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Footer Controls */}
          <div className="pt-4 border-t border-gray-200 flex items-center justify-between">
            <div className="text-[11px] text-gray-400">
              {jobToEdit ? 'Updating your listing' : 'New post will be submitted for verification'}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-1.5 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-lg transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-bold rounded-lg transition shadow-xs cursor-pointer"
              >
                <CheckCircle2 size={14} />
                <span>{isSubmitting ? 'Saving...' : jobToEdit ? 'Update Job' : 'Publish Job'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserJobModal;

