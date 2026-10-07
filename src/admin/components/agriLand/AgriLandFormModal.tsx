import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Save,
  AlertCircle,
  MapPin,
  Layers,
  Info,
  Home,
  TreePine,
  Image as ImageIcon,
  Upload,
  Star,
  Trash2,
  Plus,
  CheckCircle2,
  Check,
  Compass
} from 'lucide-react';
import type {
  AgriLand,
  AgriLandDealType,
  AgriLandLocation,
  AgriLandDeedType,
  AgriLandCategory,
  AgriLandTerrain,
  AgriLandElephantFence,
  AgriLandWildlifeThreat,
  AgriLandBoundaryFencing,
  AgriLandFarmBuilding,
  AgriLandIrrigationTech,
  AgriLandMachineryAccess,
  AgriLandCrop,
  AgriLandAccessRoad,
  AgriLandElectricity,
  AgriLandWaterSource
} from './types';
import {
  SRI_LANKA_PROVINCES,
  getDistrictsForProvince,
  getDSDsForDistrict,
  getGNDsForDSD
} from '../../../data/sriLankaLocations';

interface FormImageSlot {
  id?: string;
  imageUrl: string;
  isPrimary: boolean;
  uploading?: boolean;
}

interface AgriLandFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  landToEdit?: AgriLand | null;
  dealTypes: AgriLandDealType[];
  locations: AgriLandLocation[];
  deedTypes: AgriLandDeedType[];
  categories: AgriLandCategory[];
  terrains: AgriLandTerrain[];
  elephantFences: AgriLandElephantFence[];
  wildlifeThreats: AgriLandWildlifeThreat[];
  boundaryFencings: AgriLandBoundaryFencing[];
  farmBuildings: AgriLandFarmBuilding[];
  irrigationTechs: AgriLandIrrigationTech[];
  machineryAccesses: AgriLandMachineryAccess[];
  crops: AgriLandCrop[];
  accessRoads: AgriLandAccessRoad[];
  electricities: AgriLandElectricity[];
  waterSources: AgriLandWaterSource[];
  apiBaseUrl: string;
  token: string | null;
  onRefreshLookups?: () => void;
}

export const AgriLandFormModal: React.FC<AgriLandFormModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  landToEdit,
  dealTypes,
  locations,
  deedTypes,
  categories,
  terrains,
  elephantFences,
  wildlifeThreats,
  boundaryFencings,
  farmBuildings,
  irrigationTechs,
  machineryAccesses,
  crops,
  accessRoads,
  electricities,
  waterSources,
  apiBaseUrl,
  token,
  onRefreshLookups
}) => {
  const [activeTab, setActiveTab] = useState<'basic' | 'location' | 'images' | 'area' | 'facilities' | 'crops'>('basic');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ── Basic Info & Pricing ──
  const [titleEn, setTitleEn] = useState('');
  const [titleSi, setTitleSi] = useState('');
  const [dealTypeId, setDealTypeId] = useState('');
  const [landCategoryId, setLandCategoryId] = useState('');
  const [priceEn, setPriceEn] = useState('');
  const [priceSi, setPriceSi] = useState('');
  const [activeState, setActiveState] = useState(true);

  // ── Location State & sl-gnd ──
  const [locationId, setLocationId] = useState('');
  const [locationUrl, setLocationUrl] = useState('');
  const [slProvince, setSlProvince] = useState('Western');
  const [slDistrict, setSlDistrict] = useState('Colombo');
  const [slDsd, setSlDsd] = useState('');
  const [slGnd, setSlGnd] = useState('');
  const [isCreatingLoc, setIsCreatingLoc] = useState(false);
  const [locCreateMsg, setLocCreateMsg] = useState<string | null>(null);

  // ── Images State (Up to 6 images, 1 Primary) ──
  const [imagesList, setImagesList] = useState<FormImageSlot[]>([]);
  const [directImageUrl, setDirectImageUrl] = useState('');
  const [uploadingFiles, setUploadingFiles] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // ── Area & Deed ──
  const [acres, setAcres] = useState<string>('');
  const [roods, setRoods] = useState<string>('');
  const [perches, setPerches] = useState<string>('');
  const [totalPerches, setTotalPerches] = useState<string>('');
  const [deedTypeId, setDeedTypeId] = useState('');

  // ── Environment & Facilities ──
  const [terrainId, setTerrainId] = useState('');
  const [elephantFenceId, setElephantFenceId] = useState('');
  const [wildlifeThreatId, setWildlifeThreatId] = useState('');
  const [boundaryFencingId, setBoundaryFencingId] = useState('');
  const [farmBuildingId, setFarmBuildingId] = useState('');
  const [irrigationTechId, setIrrigationTechId] = useState('');
  const [machineryAccessId, setMachineryAccessId] = useState('');
  const [accessRoadId, setAccessRoadId] = useState('');
  const [electricityId, setElectricityId] = useState('');
  const [waterSourceId, setWaterSourceId] = useState('');

  // ── Cultivation & Crops ──
  const [isCultivated, setIsCultivated] = useState(false);
  const [selectedCropIds, setSelectedCropIds] = useState<string[]>([]);

  // ── Owner & Contact ──
  const [ownerNameEn, setOwnerNameEn] = useState('');
  const [ownerNameSi, setOwnerNameSi] = useState('');
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [additionalDetailsEn, setAdditionalDetailsEn] = useState('');
  const [additionalDetailsSi, setAdditionalDetailsSi] = useState('');

  // Available sl-gnd options
  const availableDistricts = getDistrictsForProvince(slProvince);
  const availableDsds = getDSDsForDistrict(slDistrict);
  const availableGnds = getGNDsForDSD(slDsd, slDistrict);

  // Auto calculate total perches
  useEffect(() => {
    const a = parseFloat(acres) || 0;
    const r = parseFloat(roods) || 0;
    const p = parseFloat(perches) || 0;
    if (a > 0 || r > 0 || p > 0) {
      setTotalPerches(String(a * 160 + r * 40 + p));
    }
  }, [acres, roods, perches]);

  useEffect(() => {
    if (landToEdit) {
      setTitleEn(landToEdit.titleEn || '');
      setTitleSi(landToEdit.titleSi || '');
      setDealTypeId(landToEdit.dealTypeId || (dealTypes[0]?.id ?? ''));
      setLandCategoryId(landToEdit.landCategoryId || '');
      setLocationId(landToEdit.locationId || (locations[0]?.id ?? ''));
      setLocationUrl(landToEdit.locationUrl || '');

      setPriceEn(landToEdit.priceEn || '');
      setPriceSi(landToEdit.priceSi || '');

      setAcres(landToEdit.acres !== null && landToEdit.acres !== undefined ? String(landToEdit.acres) : '');
      setRoods(landToEdit.roods !== null && landToEdit.roods !== undefined ? String(landToEdit.roods) : '');
      setPerches(landToEdit.perches !== null && landToEdit.perches !== undefined ? String(landToEdit.perches) : '');
      setTotalPerches(landToEdit.totalPerches !== null && landToEdit.totalPerches !== undefined ? String(landToEdit.totalPerches) : '');
      setDeedTypeId(landToEdit.deedTypeId || '');

      setTerrainId(landToEdit.terrainId || '');
      setElephantFenceId(landToEdit.elephantFenceId || '');
      setWildlifeThreatId(landToEdit.wildlifeThreatId || '');
      setBoundaryFencingId(landToEdit.boundaryFencingId || '');
      setFarmBuildingId(landToEdit.farmBuildingId || '');
      setIrrigationTechId(landToEdit.irrigationTechId || '');
      setMachineryAccessId(landToEdit.machineryAccessId || '');
      setAccessRoadId(landToEdit.accessRoadId || '');
      setElectricityId(landToEdit.electricityId || '');
      setWaterSourceId(landToEdit.waterSourceId || '');

      setIsCultivated(Boolean(landToEdit.isCultivated));
      setSelectedCropIds(landToEdit.cultivatedCrops?.map((c) => c.id) || []);

      setOwnerNameEn(landToEdit.ownerNameEn || '');
      setOwnerNameSi(landToEdit.ownerNameSi || '');
      setWhatsappNumber(landToEdit.whatsappNumber || '');
      setAdditionalDetailsEn(landToEdit.additionalDetailsEn || '');
      setAdditionalDetailsSi(landToEdit.additionalDetailsSi || '');
      setActiveState(landToEdit.activeState !== false);

      // Populate existing images (up to 6)
      if (landToEdit.images && landToEdit.images.length > 0) {
        setImagesList(
          landToEdit.images.slice(0, 6).map((img, idx) => ({
            id: img.id,
            imageUrl: img.imageUrl,
            isPrimary: img.isPrimary !== undefined ? Boolean(img.isPrimary) : idx === 0
          }))
        );
      } else {
        setImagesList([]);
      }

      // Sync sl-gnd preview from location if available
      if (landToEdit.location) {
        setSlProvince(landToEdit.location.provinceEn?.replace(' Province', '') || 'Western');
        setSlDistrict(landToEdit.location.districtEn || 'Colombo');
        setSlDsd(landToEdit.location.divisionalSecretariatEn || '');
        setSlGnd(landToEdit.location.gramaNiladhariDivisionEn || '');
      }
    } else {
      setTitleEn('');
      setTitleSi('');
      setDealTypeId(dealTypes[0]?.id ?? '');
      setLandCategoryId(categories[0]?.id ?? '');
      setLocationId(locations[0]?.id ?? '');
      setLocationUrl('');

      setPriceEn('');
      setPriceSi('');

      setAcres('');
      setRoods('');
      setPerches('');
      setTotalPerches('');
      setDeedTypeId(deedTypes[0]?.id ?? '');

      setTerrainId('');
      setElephantFenceId('');
      setWildlifeThreatId('');
      setBoundaryFencingId('');
      setFarmBuildingId('');
      setIrrigationTechId('');
      setMachineryAccessId('');
      setAccessRoadId('');
      setElectricityId('');
      setWaterSourceId('');

      setIsCultivated(false);
      setSelectedCropIds([]);

      setOwnerNameEn('');
      setOwnerNameSi('');
      setWhatsappNumber('');
      setAdditionalDetailsEn('');
      setAdditionalDetailsSi('');
      setActiveState(true);

      setImagesList([]);
      setSlProvince('Western');
      setSlDistrict('Colombo');
      setSlDsd('');
      setSlGnd('');
    }
    setError(null);
    setLocCreateMsg(null);
  }, [landToEdit, isOpen, dealTypes, categories, locations, deedTypes]);

  if (!isOpen) return null;

  // ── Image Handlers (Max 6, 1 Primary) ──
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const availableSlots = 6 - imagesList.length;
    if (availableSlots <= 0) {
      setError('You have already uploaded the maximum of 6 images (උපරිම ඡායාරූප 6ක් සම්පූර්ණයි).');
      return;
    }

    const filesToUpload = Array.from(files).slice(0, availableSlots);
    setUploadingFiles(true);
    setError(null);

    try {
      const newUploaded: FormImageSlot[] = [];

      for (let i = 0; i < filesToUpload.length; i++) {
        const file = filesToUpload[i];
        const formData = new FormData();
        formData.append('image', file);

        const res = await fetch(`${apiBaseUrl}/agri-land-images/upload`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
          body: formData
        });

        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || `Failed to upload ${file.name}`);
        }

        const uploadedUrl = data.url || data.imageUrl || data.data?.imageUrl;
        if (uploadedUrl) {
          const isFirstEver = imagesList.length === 0 && newUploaded.length === 0;
          newUploaded.push({
            imageUrl: uploadedUrl,
            isPrimary: isFirstEver
          });
        }
      }

      setImagesList((prev) => {
        const combined = [...prev, ...newUploaded];
        // Ensure at least one image is primary
        if (!combined.some((img) => img.isPrimary) && combined.length > 0) {
          combined[0].isPrimary = true;
        }
        return combined.slice(0, 6);
      });
    } catch (err: any) {
      setError(err.message || 'Image upload failed');
    } finally {
      setUploadingFiles(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleAddDirectUrl = () => {
    if (!directImageUrl.trim()) return;
    if (imagesList.length >= 6) {
      setError('Maximum 6 images reached (උපරිම ඡායාරූප 6ක් සම්පූර්ණයි).');
      return;
    }
    const isFirst = imagesList.length === 0;
    setImagesList((prev) => [
      ...prev,
      {
        imageUrl: directImageUrl.trim(),
        isPrimary: isFirst
      }
    ]);
    setDirectImageUrl('');
    setError(null);
  };

  const handleSetPrimary = (index: number) => {
    setImagesList((prev) =>
      prev.map((img, idx) => ({
        ...img,
        isPrimary: idx === index
      }))
    );
  };

  const handleRemoveImage = (index: number) => {
    setImagesList((prev) => {
      const updated = prev.filter((_, idx) => idx !== index);
      // If we removed the primary image, make the first one primary
      if (updated.length > 0 && !updated.some((img) => img.isPrimary)) {
        updated[0].isPrimary = true;
      }
      return updated;
    });
  };

  // ── sl-gnd Quick Location Creation / Match ──
  const handleCreateLocationFromSlGnd = async () => {
    setIsCreatingLoc(true);
    setLocCreateMsg(null);
    setError(null);

    const prov = SRI_LANKA_PROVINCES.find(
      (p) => p.en.toLowerCase().replace(' province', '').trim() === slProvince.toLowerCase().replace(' province', '').trim()
    );
    const dist = availableDistricts.find((d) => d.en.toLowerCase() === slDistrict.toLowerCase());
    const dsd = availableDsds.find((d) => d.nameEn === slDsd);
    const gnd = availableGnds.find((g) => g.nameEn === slGnd);

    try {
      const res = await fetch(`${apiBaseUrl}/agri-land-locations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          provinceEn: slProvince,
          provinceSi: prov?.si || `${slProvince} පළාත`,
          districtEn: slDistrict,
          districtSi: dist?.si || slDistrict,
          divisionalSecretariatEn: dsd?.nameEn || slDsd || null,
          divisionalSecretariatSi: dsd?.nameSi || dsd?.nameEn || slDsd || null,
          gramaNiladhariDivisionEn: gnd?.nameEn || slGnd || null,
          gramaNiladhariDivisionSi: gnd?.nameSi || gnd?.nameEn || slGnd || null,
          activeState: true
        })
      });

      const resData = await res.json();
      if (!res.ok) {
        throw new Error(resData.error || 'Failed to register location');
      }

      if (resData.data?.id) {
        setLocationId(resData.data.id);
        setLocCreateMsg(`Location "${slDistrict} (${dist?.si || ''})" registered and selected successfully!`);
        if (onRefreshLookups) onRefreshLookups();
      }
    } catch (err: any) {
      setError(err.message || 'Error creating location with sl-gnd');
    } finally {
      setIsCreatingLoc(false);
    }
  };

  // Toggle Crop Selection
  const toggleCrop = (cId: string) => {
    setSelectedCropIds((prev) =>
      prev.includes(cId) ? prev.filter((id) => id !== cId) : [...prev, cId]
    );
  };

  // ── Submit Complete Form ──
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!titleSi.trim() || !titleEn.trim() || !dealTypeId || !locationId) {
      setError('Please fill required fields: English Title, Sinhala Title, Deal Type, and Location.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Ensure primary image flag is properly assigned if images exist
      const finalImages = imagesList.map((img, idx) => ({
        id: img.id,
        imageUrl: img.imageUrl,
        isPrimary: imagesList.some((m) => m.isPrimary) ? img.isPrimary : idx === 0
      }));

      const payload = {
        titleEn: titleEn.trim(),
        titleSi: titleSi.trim(),
        dealTypeId,
        landCategoryId: landCategoryId || null,
        locationId,
        locationUrl: locationUrl.trim() || null,
        priceEn: priceEn.trim() || null,
        priceSi: priceSi.trim() || null,
        acres: acres ? parseFloat(acres) : null,
        roods: roods ? parseFloat(roods) : null,
        perches: perches ? parseFloat(perches) : null,
        totalPerches: totalPerches ? parseFloat(totalPerches) : null,
        deedTypeId: deedTypeId || null,
        terrainId: terrainId || null,
        elephantFenceId: elephantFenceId || null,
        wildlifeThreatId: wildlifeThreatId || null,
        boundaryFencingId: boundaryFencingId || null,
        farmBuildingId: farmBuildingId || null,
        irrigationTechId: irrigationTechId || null,
        machineryAccessId: machineryAccessId || null,
        accessRoadId: accessRoadId || null,
        electricityId: electricityId || null,
        waterSourceId: waterSourceId || null,
        isCultivated,
        cultivatedCropIds: isCultivated ? selectedCropIds : [],
        ownerNameEn: ownerNameEn.trim() || null,
        ownerNameSi: ownerNameSi.trim() || null,
        whatsappNumber: whatsappNumber.trim() || null,
        additionalDetailsEn: additionalDetailsEn.trim() || null,
        additionalDetailsSi: additionalDetailsSi.trim() || null,
        activeState,
        images: finalImages
      };

      const url = landToEdit
        ? `${apiBaseUrl}/agri-lands/${landToEdit.id}`
        : `${apiBaseUrl}/agri-lands`;
      const method = landToEdit ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to save agri land listing');
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-3 md:p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
      {/* Spacious Grand Modal Container */}
      <div className="relative w-full max-w-[96vw] 2xl:max-w-[1650px] max-h-[88vh] bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200/80 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-500/20 text-emerald-400 rounded-xl">
              <Compass className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold">
                {landToEdit ? 'Edit Agri Land Listing' : 'Create New Agri Land Listing'}
              </h3>
              <p className="text-xs text-slate-300 mt-0.5">
                {landToEdit
                  ? 'කෘෂිකාර්මික ඉඩම, ඡායාරූප (6ක් දක්වා) සහ ආශ්‍රිත සියලු තොරතුරු සංස්කරණය කිරීම'
                  : 'නව කෘෂිකාර්මික ඉඩමක්, ඡායාරූප (6ක් දක්වා) සහ ආශ්‍රිත සියලු තොරතුරු ඇතුළත් කිරීම'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-6 gap-2 overflow-x-auto shrink-0 py-1">
          <button
            type="button"
            onClick={() => setActiveTab('basic')}
            className={`flex items-center gap-2 py-3 px-4 text-xs sm:text-sm font-bold border-b-2 transition whitespace-nowrap rounded-t-xl ${
              activeTab === 'basic'
                ? 'border-emerald-600 text-emerald-700 bg-white shadow-2xs'
                : 'border-transparent text-slate-500 hover:text-slate-900 hover:bg-slate-100/60'
            }`}
          >
            <Info className="w-4 h-4" />
            <span>1. Basic & Pricing</span>
            <span className="text-xs text-slate-400 font-normal">(මූලික තොරතුරු)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('location')}
            className={`flex items-center gap-2 py-3 px-4 text-xs sm:text-sm font-bold border-b-2 transition whitespace-nowrap rounded-t-xl ${
              activeTab === 'location'
                ? 'border-emerald-600 text-emerald-700 bg-white shadow-2xs'
                : 'border-transparent text-slate-500 hover:text-slate-900 hover:bg-slate-100/60'
            }`}
          >
            <MapPin className="w-4 h-4" />
            <span>2. Location & sl-gnd</span>
            <span className="text-xs text-slate-400 font-normal">(ස්ථානය)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('images')}
            className={`flex items-center gap-2 py-3 px-4 text-xs sm:text-sm font-bold border-b-2 transition whitespace-nowrap rounded-t-xl ${
              activeTab === 'images'
                ? 'border-emerald-600 text-emerald-700 bg-white shadow-2xs'
                : 'border-transparent text-slate-500 hover:text-slate-900 hover:bg-slate-100/60'
            }`}
          >
            <ImageIcon className="w-4 h-4" />
            <span>3. Photos ({imagesList.length}/6)</span>
            <span className="text-xs text-slate-400 font-normal">(ප්‍රධාන හා අමතර ඡායාරූප)</span>
            {imagesList.length > 0 && (
              <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-emerald-100 text-emerald-800 ml-1">
                {imagesList.length}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('area')}
            className={`flex items-center gap-2 py-3 px-4 text-xs sm:text-sm font-bold border-b-2 transition whitespace-nowrap rounded-t-xl ${
              activeTab === 'area'
                ? 'border-emerald-600 text-emerald-700 bg-white shadow-2xs'
                : 'border-transparent text-slate-500 hover:text-slate-900 hover:bg-slate-100/60'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>4. Area & Deed</span>
            <span className="text-xs text-slate-400 font-normal">(ප්‍රමාණය සහ ඔප්පු)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('facilities')}
            className={`flex items-center gap-2 py-3 px-4 text-xs sm:text-sm font-bold border-b-2 transition whitespace-nowrap rounded-t-xl ${
              activeTab === 'facilities'
                ? 'border-emerald-600 text-emerald-700 bg-white shadow-2xs'
                : 'border-transparent text-slate-500 hover:text-slate-900 hover:bg-slate-100/60'
            }`}
          >
            <Home className="w-4 h-4" />
            <span>5. Facilities & Nature</span>
            <span className="text-xs text-slate-400 font-normal">(පහසුකම්)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('crops')}
            className={`flex items-center gap-2 py-3 px-4 text-xs sm:text-sm font-bold border-b-2 transition whitespace-nowrap rounded-t-xl ${
              activeTab === 'crops'
                ? 'border-emerald-600 text-emerald-700 bg-white shadow-2xs'
                : 'border-transparent text-slate-500 hover:text-slate-900 hover:bg-slate-100/60'
            }`}
          >
            <TreePine className="w-4 h-4" />
            <span>6. Crops & Owner</span>
            <span className="text-xs text-slate-400 font-normal">(වගාවන් සහ හිමිකරු)</span>
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {error && (
            <div className="flex items-start gap-2 p-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-2xl">
              <AlertCircle className="w-5 h-5 mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════
              TAB 1: BASIC INFO & PRICING
          ══════════════════════════════════════════════════════ */}
          {activeTab === 'basic' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Land Title (English) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 5-Acre Fertile Coconut & Cinnamon Land in Kurunegala"
                    value={titleEn}
                    onChange={(e) => setTitleEn(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    ඉඩමේ නම / සිරස්තලය (සිංහල) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="උදා: කුරුණෑගල අක්කර 5ක සරුසාර පොල් සහ කුරුඳු ඉඩම"
                    value={titleSi}
                    onChange={(e) => setTitleSi(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Deal Type (ගනුදෙනු වර්ගය) <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={dealTypeId}
                    onChange={(e) => setDealTypeId(e.target.value)}
                    required
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-medium"
                  >
                    <option value="">-- Select Deal Type --</option>
                    {dealTypes.map((dt) => (
                      <option key={dt.id} value={dt.id}>
                        {dt.nameEn} ({dt.nameSi})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Land Category (ඉඩම් කාණ්ඩය)
                  </label>
                  <select
                    value={landCategoryId}
                    onChange={(e) => setLandCategoryId(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-medium"
                  >
                    <option value="">-- Select Category --</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.nameEn} ({c.nameSi})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Price Description (English)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. LKR 2,500,000 / Per Acre (Negotiable)"
                    value={priceEn}
                    onChange={(e) => setPriceEn(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    මිල විස්තරය (සිංහල)
                  </label>
                  <input
                    type="text"
                    placeholder="උදා: රු. 2,500,000 / අක්කරයකට (මිල ගණන් සාකච්ඡා කරගත හැක)"
                    value={priceSi}
                    onChange={(e) => setPriceSi(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-medium"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-2xl">
                <div>
                  <span className="text-sm font-bold text-slate-800">Listing Status Active (ප්‍රසිද්ධ කර තබන්න)</span>
                  <p className="text-xs text-slate-500">මෙම ඉඩම ප්‍රසිද්ධ ලැයිස්තුවේ සක්‍රීයව පෙන්වීමට සක්‍රීය කරන්න</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={activeState}
                    onChange={(e) => setActiveState(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                </label>
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════
              TAB 2: LOCATION & SL-GND INTEGRATION
          ══════════════════════════════════════════════════════ */}
          {activeTab === 'location' && (
            <div className="space-y-6 animate-fadeIn">
              {/* Primary Location Selection */}
              <div className="p-5 bg-white border border-slate-200 rounded-3xl space-y-3">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Select Registered Master Location (ප්‍රධාන ස්ථානය තෝරන්න) <span className="text-red-500">*</span>
                </label>
                <select
                  value={locationId}
                  onChange={(e) => setLocationId(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-medium"
                >
                  <option value="">-- Select Location --</option>
                  {locations.map((loc) => (
                    <option key={loc.id} value={loc.id}>
                      {loc.districtEn} ({loc.districtSi}) - {loc.provinceEn} Province
                      {loc.divisionalSecretariatEn ? ` [DS: ${loc.divisionalSecretariatEn}]` : ''}
                      {loc.gramaNiladhariDivisionEn ? ` [GN: ${loc.gramaNiladhariDivisionEn}]` : ''}
                    </option>
                  ))}
                </select>
              </div>

              {/* sl-gnd Administrative Units Picker Card */}
              <div className="p-6 bg-gradient-to-br from-emerald-50/50 to-teal-50/30 border border-emerald-200/80 rounded-3xl space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-emerald-600" />
                    <h4 className="text-sm font-bold text-emerald-950">
                      sl-gnd Administrative Units Explorer (ශ්‍රී ලංකා පළාත්, දිස්ත්‍රික්ක සහ ප්‍රාදේශීය ලේකම් කොට්ඨාස)
                    </h4>
                  </div>
                  <span className="text-xs bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full font-bold">
                    Powered by sl-gnd-dsd-districts
                  </span>
                </div>

                <p className="text-xs text-slate-600">
                  පහතින් නිවැරදි පළාත, දිස්ත්‍රික්කය සහ ප්‍රාදේශීය ලේකම් කොට්ඨාසය තෝරා ක්ෂණිකව ස්ථානය ලියාපදිංචි කර තෝරාගන්න:
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Province */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                      1. Province (පළාත)
                    </label>
                    <select
                      value={slProvince}
                      onChange={(e) => {
                        const newProv = e.target.value;
                        setSlProvince(newProv);
                        const dists = getDistrictsForProvince(newProv);
                        if (dists.length > 0) setSlDistrict(dists[0].en);
                        setSlDsd('');
                        setSlGnd('');
                      }}
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-medium"
                    >
                      {SRI_LANKA_PROVINCES.map((p) => {
                        const clean = p.en.replace(' Province', '');
                        return (
                          <option key={clean} value={clean}>
                            {clean} ({p.si})
                          </option>
                        );
                      })}
                    </select>
                  </div>

                  {/* District */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                      2. District (දිස්ත්‍රික්කය)
                    </label>
                    <select
                      value={slDistrict}
                      onChange={(e) => {
                        setSlDistrict(e.target.value);
                        setSlDsd('');
                        setSlGnd('');
                      }}
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-medium"
                    >
                      {availableDistricts.map((d) => (
                        <option key={d.en} value={d.en}>
                          {d.en} ({d.si})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* DSD */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                      3. Divisional Secretariat ({availableDsds.length} DSDs in {slDistrict})
                    </label>
                    <select
                      value={slDsd}
                      onChange={(e) => {
                        setSlDsd(e.target.value);
                        setSlGnd('');
                      }}
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-medium"
                    >
                      <option value="">-- Select DSD --</option>
                      {availableDsds.map((d) => (
                        <option key={d.id} value={d.nameEn}>
                          {d.nameEn} ({d.nameSi})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* GND */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                      4. Grama Niladhari Division ({availableGnds.length} GNDs available)
                    </label>
                    <select
                      value={slGnd}
                      onChange={(e) => setSlGnd(e.target.value)}
                      disabled={availableGnds.length === 0}
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-medium disabled:opacity-50"
                    >
                      <option value="">-- Select GND (Optional) --</option>
                      {availableGnds.map((g) => (
                        <option key={g.id} value={g.nameEn}>
                          {g.nameEn} ({g.nameSi}) {g.gnCode ? `[${g.gnCode}]` : ''}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                  <button
                    type="button"
                    onClick={handleCreateLocationFromSlGnd}
                    disabled={isCreatingLoc}
                    className="flex items-center gap-2 bg-emerald-700 hover:bg-emerald-800 text-white px-5 py-2.5 rounded-xl font-bold text-xs shadow-xs transition cursor-pointer disabled:opacity-50"
                  >
                    <Plus className="w-4 h-4" />
                    <span>{isCreatingLoc ? 'Registering...' : '+ Register & Select this Location from sl-gnd'}</span>
                  </button>

                  {locCreateMsg && (
                    <span className="text-xs font-bold text-emerald-700 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4" />
                      {locCreateMsg}
                    </span>
                  )}
                </div>
              </div>

              {/* Google Maps Link */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Google Maps Location Link (ගූගල් සිතියම් සබැඳිය)
                </label>
                <input
                  type="url"
                  placeholder="https://maps.google.com/?q=6.9271,79.8612"
                  value={locationUrl}
                  onChange={(e) => setLocationUrl(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-medium"
                />
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════
              TAB 3: PHOTOS & GALLERY (UP TO 6, 1 PRIMARY)
          ══════════════════════════════════════════════════════ */}
          {activeTab === 'images' && (
            <div className="space-y-6 animate-fadeIn">
              {/* Header & Upload Controls */}
              <div className="p-6 bg-slate-50 border border-slate-200 rounded-3xl space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h4 className="text-base font-bold text-slate-800 flex items-center gap-2">
                      <ImageIcon className="w-5 h-5 text-emerald-600" />
                      <span>Agri Land Photos (ඡායාරූප උපරිම 6ක්)</span>
                      <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                        {imagesList.length} / 6 Uploaded
                      </span>
                    </h4>
                    <p className="text-xs text-slate-500 mt-1">
                      ඉඩම සඳහා ඡායාරූප 6ක් දක්වා එක් කළ හැක. ඉන් එකක් <strong>Primary Image (ප්‍රධාන ඡායාරූපය)</strong> ලෙස තෝරන්න.
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleFileUpload}
                      className="hidden"
                      id="agri-land-image-upload"
                      disabled={uploadingFiles || imagesList.length >= 6}
                    />
                    <label
                      htmlFor="agri-land-image-upload"
                      className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white transition shadow-xs cursor-pointer ${
                        imagesList.length >= 6 || uploadingFiles
                          ? 'bg-slate-400 cursor-not-allowed'
                          : 'bg-emerald-600 hover:bg-emerald-700'
                      }`}
                    >
                      <Upload className="w-4 h-4" />
                      <span>{uploadingFiles ? 'Uploading to S3...' : '+ Upload Photo(s)'}</span>
                    </label>
                  </div>
                </div>

                {/* Direct URL input option */}
                <div className="flex gap-2 pt-2 border-t border-slate-200/80">
                  <input
                    type="url"
                    placeholder="හෝ ඡායාරූපයේ Direct Web URL එක ඇතුළත් කරන්න (https://...)"
                    value={directImageUrl}
                    onChange={(e) => setDirectImageUrl(e.target.value)}
                    disabled={imagesList.length >= 6}
                    className="flex-1 px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  />
                  <button
                    type="button"
                    onClick={handleAddDirectUrl}
                    disabled={!directImageUrl.trim() || imagesList.length >= 6}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold transition disabled:opacity-50 cursor-pointer"
                  >
                    Add URL
                  </button>
                </div>
              </div>

              {/* 6 Photo Slots Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
                {[0, 1, 2, 3, 4, 5].map((slotIndex) => {
                  const imageItem = imagesList[slotIndex];

                  if (imageItem) {
                    return (
                      <div
                        key={slotIndex}
                        className={`relative rounded-2xl overflow-hidden border-2 bg-white shadow-xs group transition-all flex flex-col ${
                          imageItem.isPrimary
                            ? 'border-emerald-500 ring-2 ring-emerald-500/20'
                            : 'border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        {/* Slot Badge */}
                        <div className="absolute top-2 left-2 z-10 flex items-center gap-1">
                          {imageItem.isPrimary ? (
                            <span className="flex items-center gap-1 px-2 py-0.5 bg-emerald-600 text-white rounded-full text-[10px] font-bold shadow-md">
                              <Star className="w-3 h-3 fill-current" />
                              PRIMARY
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 bg-slate-900/80 backdrop-blur-xs text-white rounded-full text-[10px] font-semibold">
                              #{slotIndex + 1}
                            </span>
                          )}
                        </div>

                        {/* Remove Action */}
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(slotIndex)}
                          className="absolute top-2 right-2 z-10 p-1.5 bg-red-600/90 hover:bg-red-700 text-white rounded-lg shadow-md transition"
                          title="Remove image"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>

                        {/* Thumbnail */}
                        <div className="h-36 w-full bg-slate-100 overflow-hidden flex items-center justify-center">
                          <img
                            src={imageItem.imageUrl}
                            alt={`Land Photo ${slotIndex + 1}`}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            onError={(e) => {
                              (e.target as HTMLElement).style.display = 'none';
                            }}
                          />
                        </div>

                        {/* Card Footer Actions */}
                        <div className="p-2 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                          <span className="text-[10px] text-slate-500 truncate max-w-[100px]">
                            {imageItem.imageUrl}
                          </span>
                          {!imageItem.isPrimary ? (
                            <button
                              type="button"
                              onClick={() => handleSetPrimary(slotIndex)}
                              className="flex items-center gap-1 px-2 py-0.5 bg-white hover:bg-emerald-50 text-emerald-700 border border-emerald-300 rounded-md text-[10px] font-bold transition cursor-pointer"
                            >
                              <Star className="w-2.5 h-2.5" />
                              <span>Set Primary</span>
                            </button>
                          ) : (
                            <span className="text-[10px] text-emerald-700 font-bold flex items-center gap-0.5">
                              <Check className="w-3 h-3" />
                              Primary
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  }

                  // Empty Slot Placeholder
                  return (
                    <div
                      key={slotIndex}
                      onClick={() => {
                        if (fileInputRef.current) fileInputRef.current.click();
                      }}
                      className="h-48 rounded-2xl border-2 border-dashed border-slate-200 hover:border-emerald-400 bg-slate-50/50 hover:bg-emerald-50/20 flex flex-col items-center justify-center gap-1.5 text-slate-400 hover:text-emerald-700 transition cursor-pointer p-3 text-center"
                    >
                      <div className="p-2.5 bg-white rounded-xl shadow-2xs border border-slate-200">
                        {slotIndex === 0 ? (
                          <Star className="w-5 h-5 text-amber-500" />
                        ) : (
                          <ImageIcon className="w-5 h-5 text-slate-400" />
                        )}
                      </div>
                      <span className="text-[11px] font-bold text-slate-700 leading-tight">
                        {slotIndex === 0 ? 'Slot 1: Primary' : `Slot ${slotIndex + 1}: Photo`}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        Click to upload
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════
              TAB 4: AREA & DEED
          ══════════════════════════════════════════════════════ */}
          {activeTab === 'area' && (
            <div className="space-y-6 animate-fadeIn">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Deed Type (ඔප්පු වර්ගය)
                </label>
                <select
                  value={deedTypeId}
                  onChange={(e) => setDeedTypeId(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-medium"
                >
                  <option value="">-- Select Deed Type --</option>
                  {deedTypes.map((dt) => (
                    <option key={dt.id} value={dt.id}>
                      {dt.nameEn} ({dt.nameSi})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-5 bg-slate-50 border border-slate-200 rounded-3xl">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Acres (අක්කර)
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="0"
                    value={acres}
                    onChange={(e) => setAcres(e.target.value)}
                    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-800 text-sm font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Roods (රූඩ්)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="3"
                    placeholder="0"
                    value={roods}
                    onChange={(e) => setRoods(e.target.value)}
                    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-800 text-sm font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Perches (පර්චස්)
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="0"
                    value={perches}
                    onChange={(e) => setPerches(e.target.value)}
                    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-800 text-sm font-semibold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Total Perches (ස්වයංක්‍රීයව ගණනය වූ සම්පූර්ණ පර්චස් ප්‍රමාණය)
                </label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="Auto-calculated (1 Acre = 160 Perches, 1 Rood = 40 Perches)"
                  value={totalPerches}
                  onChange={(e) => setTotalPerches(e.target.value)}
                  className="w-full px-4 py-3 bg-emerald-50/60 border border-emerald-300 rounded-2xl text-emerald-900 font-bold text-base"
                />
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════
              TAB 5: FACILITIES & ENVIRONMENT
          ══════════════════════════════════════════════════════ */}
          {activeTab === 'facilities' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Terrain (භූමි පිහිටීම)
                  </label>
                  <select
                    value={terrainId}
                    onChange={(e) => setTerrainId(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-medium"
                  >
                    <option value="">-- Select Terrain --</option>
                    {terrains.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.nameEn} ({t.nameSi})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Elephant Fence (අලි වැටවල්)
                  </label>
                  <select
                    value={elephantFenceId}
                    onChange={(e) => setElephantFenceId(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-medium"
                  >
                    <option value="">-- Select Elephant Fence --</option>
                    {elephantFences.map((ef) => (
                      <option key={ef.id} value={ef.id}>
                        {ef.nameEn} ({ef.nameSi})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Wildlife Threats (වනජීවී තර්ජන)
                  </label>
                  <select
                    value={wildlifeThreatId}
                    onChange={(e) => setWildlifeThreatId(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-medium"
                  >
                    <option value="">-- Select Wildlife Threat --</option>
                    {wildlifeThreats.map((wt) => (
                      <option key={wt.id} value={wt.id}>
                        {wt.nameEn} ({wt.nameSi})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Boundary Fencing (මායිම් වැටවල්)
                  </label>
                  <select
                    value={boundaryFencingId}
                    onChange={(e) => setBoundaryFencingId(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-medium"
                  >
                    <option value="">-- Select Boundary Fencing --</option>
                    {boundaryFencings.map((bf) => (
                      <option key={bf.id} value={bf.id}>
                        {bf.nameEn} ({bf.nameSi})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Farm Buildings (ගොවිපළ ගොඩනැගිලි)
                  </label>
                  <select
                    value={farmBuildingId}
                    onChange={(e) => setFarmBuildingId(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-medium"
                  >
                    <option value="">-- Select Farm Building --</option>
                    {farmBuildings.map((fb) => (
                      <option key={fb.id} value={fb.id}>
                        {fb.nameEn} ({fb.nameSi})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Irrigation Technology (වාරි තාක්ෂණය)
                  </label>
                  <select
                    value={irrigationTechId}
                    onChange={(e) => setIrrigationTechId(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-medium"
                  >
                    <option value="">-- Select Irrigation Tech --</option>
                    {irrigationTechs.map((it) => (
                      <option key={it.id} value={it.id}>
                        {it.nameEn} ({it.nameSi})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Machinery Access (යන්ත්‍රෝපකරණ ප්‍රවේශය)
                  </label>
                  <select
                    value={machineryAccessId}
                    onChange={(e) => setMachineryAccessId(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-medium"
                  >
                    <option value="">-- Select Machinery Access --</option>
                    {machineryAccesses.map((ma) => (
                      <option key={ma.id} value={ma.id}>
                        {ma.nameEn} ({ma.nameSi})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Access Road (ප්‍රවේශ මාර්ගය)
                  </label>
                  <select
                    value={accessRoadId}
                    onChange={(e) => setAccessRoadId(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-medium"
                  >
                    <option value="">-- Select Access Road --</option>
                    {accessRoads.map((ar) => (
                      <option key={ar.id} value={ar.id}>
                        {ar.nameEn} ({ar.nameSi})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Electricity (විදුලි පහසුකම්)
                  </label>
                  <select
                    value={electricityId}
                    onChange={(e) => setElectricityId(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-medium"
                  >
                    <option value="">-- Select Electricity --</option>
                    {electricities.map((el) => (
                      <option key={el.id} value={el.id}>
                        {el.nameEn} ({el.nameSi})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Water Source (ජල මූලාශ්‍ර)
                  </label>
                  <select
                    value={waterSourceId}
                    onChange={(e) => setWaterSourceId(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-medium"
                  >
                    <option value="">-- Select Water Source --</option>
                    {waterSources.map((ws) => (
                      <option key={ws.id} value={ws.id}>
                        {ws.nameEn} ({ws.nameSi})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════
              TAB 6: CROPS, OWNER & DETAILS
          ══════════════════════════════════════════════════════ */}
          {activeTab === 'crops' && (
            <div className="space-y-6 animate-fadeIn">
              {/* Cultivated Status */}
              <div className="p-5 bg-slate-50 border border-slate-200 rounded-3xl space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-sm font-bold text-slate-800">Cultivated Land (වගා කළ ඉඩමක්ද?)</span>
                    <p className="text-xs text-slate-500">මෙම ඉඩමේ දැනටමත් බෝග වගා කර ඇත්නම් සක්‍රීය කරන්න</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isCultivated}
                      onChange={(e) => setIsCultivated(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                  </label>
                </div>

                {isCultivated && (
                  <div className="pt-3 border-t border-slate-200 space-y-2">
                    <span className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Select Cultivated Crops (වගා කර ඇති බෝග වර්ග තෝරන්න)
                    </span>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
                      {crops.map((c) => {
                        const isSelected = selectedCropIds.includes(c.id);
                        return (
                          <button
                            key={c.id}
                            type="button"
                            onClick={() => toggleCrop(c.id)}
                            className={`flex items-center justify-between px-3 py-2.5 rounded-xl border text-xs font-semibold transition ${
                              isSelected
                                ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs'
                                : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                            }`}
                          >
                            <span>{c.nameEn} ({c.nameSi})</span>
                            {isSelected && <Check className="w-3.5 h-3.5 shrink-0 ml-1" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Owner & Contact */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Owner Name (English)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Mr. Bandara"
                    value={ownerNameEn}
                    onChange={(e) => setOwnerNameEn(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    හිමිකරුගේ නම (සිංහල)
                  </label>
                  <input
                    type="text"
                    placeholder="උදා: බණ්ඩාර මහතා"
                    value={ownerNameSi}
                    onChange={(e) => setOwnerNameSi(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    WhatsApp / Contact Number
                  </label>
                  <input
                    type="tel"
                    placeholder="e.g. 0771234567"
                    value={whatsappNumber}
                    onChange={(e) => setWhatsappNumber(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-medium"
                  />
                </div>
              </div>

              {/* Additional Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Additional Details / Description (English)
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Provide additional details regarding land condition, yield, nearby landmarks..."
                    value={additionalDetailsEn}
                    onChange={(e) => setAdditionalDetailsEn(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-medium resize-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    අමතර තොරතුරු සහ විස්තර (සිංහල)
                  </label>
                  <textarea
                    rows={4}
                    placeholder="ඉඩමේ තත්ත්වය, අස්වැන්න, ආසන්න වැදගත් ස්ථාන ආදී වැඩිදුර විස්තර ඇතුළත් කරන්න..."
                    value={additionalDetailsSi}
                    onChange={(e) => setAdditionalDetailsSi(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-medium resize-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Footer Actions */}
          <div className="flex items-center justify-between pt-6 border-t border-slate-200 shrink-0">
            <span className="text-xs text-slate-400">
              * අනිවාර්ය ක්ෂේත්‍ර පුරවා අවසන් වූ පසු සුරකින්න
            </span>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="px-5 py-2.5 text-sm font-bold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-2xl transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 px-6 py-2.5 text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-2xl shadow-xs hover:shadow transition disabled:opacity-50 cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>
                  {loading
                    ? 'Saving...'
                    : landToEdit
                    ? 'Update Agri Land Listing'
                    : 'Create Agri Land Listing'}
                </span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
