import React, { useState, useMemo, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { CROP_PRESETS, CROP_CATEGORIES, CropPreset } from '../data/cropCatalogue';
import { Crop3DModel } from './three/models/Crop3DModels';

export interface Crop3DSelectorProps {
  selectedName: string;
  selectedCategory: string;
  onSelect: (preset: CropPreset) => void;
  onCustomToggle?: () => void;
}

export const Crop3DSelector: React.FC<Crop3DSelectorProps> = ({
  selectedName,
  selectedCategory,
  onSelect,
}) => {
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isRotating, setIsRotating] = useState(true);

  // Find currently active preset or default to first match
  const activePreset = useMemo(() => {
    const found = CROP_PRESETS.find(
      (p: CropPreset) => p.name.toLowerCase() === selectedName.toLowerCase()
    );
    return found || CROP_PRESETS[0];
  }, [selectedName]);

  // Filter presets based on category and search query
  const filteredPresets = useMemo(() => {
    let list: CropPreset[] = CROP_PRESETS;

    if (activeCategory !== 'All') {
      const catConfig = CROP_CATEGORIES.find((c) => c.id === activeCategory);
      const matchValues = catConfig ? catConfig.matchValues : [activeCategory];
      list = list.filter((p: CropPreset) =>
        matchValues.some((val) => val.toLowerCase() === p.category.toLowerCase())
      );
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (p: CropPreset) =>
          p.name.toLowerCase().includes(q) ||
          p.vernacularName.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q)
      );
    }

    return list;
  }, [activeCategory, searchQuery]);

  return (
    <div className="space-y-4">
      {/* ================= 3D ACTIVE CROP PREVIEW BANNER ================= */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#012d1d] via-[#116c4a] to-[#1b4332] p-4 text-white shadow-xl border border-white/20">
        <div className="flex flex-col sm:flex-row items-center gap-4">
          {/* Interactive 3D Canvas Box */}
          <div className="relative w-36 h-36 flex-shrink-0 rounded-2xl bg-black/25 backdrop-blur-md border border-white/20 shadow-inner overflow-hidden">
            <Suspense
              fallback={
                <div className="w-full h-full flex items-center justify-center">
                  <span className="material-symbols-outlined text-emerald-400 text-3xl animate-spin">eco</span>
                </div>
              }
            >
              <Canvas
                dpr={[1, 1.5]}
                camera={{ position: [0, 0, 2.5], fov: 45 }}
                gl={{ antialias: true, alpha: true }}
                className="w-full h-full"
              >
                <ambientLight intensity={1.0} color="#ffffff" />
                <directionalLight position={[3, 5, 4]} intensity={2.2} color="#fff8e7" />
                <directionalLight position={[-3, -2, -2]} intensity={0.5} color="#a7f3d0" />
                <Crop3DModel
                  modelType={activePreset.modelType}
                  scale={1.05}
                  autoRotate={isRotating}
                  rotationSpeed={1.0}
                />
              </Canvas>
            </Suspense>

            {/* Auto-rotate toggle */}
            <button
              type="button"
              onClick={() => setIsRotating(!isRotating)}
              className="absolute bottom-1.5 right-1.5 p-1 rounded-lg bg-black/40 hover:bg-black/60 text-white/80 hover:text-white transition-colors"
              title={isRotating ? 'Pause 3D rotation' : 'Resume 3D rotation'}
            >
              <span className="material-symbols-outlined text-[16px]">
                {isRotating ? 'pause' : '360'}
              </span>
            </button>
          </div>

          {/* Active Preset Information */}
          <div className="flex-1 text-center sm:text-left">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-400/20 text-emerald-200 border border-emerald-400/30 mb-1.5">
              <span className="material-symbols-outlined text-[13px]">verified</span>
              {activePreset.category}
            </div>
            <h4 className="text-xl font-bold tracking-tight text-white flex items-center justify-center sm:justify-start gap-2">
              {activePreset.name}
            </h4>
            <p className="text-sm text-emerald-200/90 font-medium">
              {activePreset.vernacularName}
            </p>
            <div className="mt-2.5 flex flex-wrap items-center justify-center sm:justify-start gap-2 text-xs">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/10 text-emerald-100 backdrop-blur-sm">
                <span className="material-symbols-outlined text-[14px]">schedule</span>
                Default Duration: <strong>{activePreset.defaultDurationDays} Days</strong>
              </span>
              <span className="text-white/60 text-[11px]">
                (Click any crop card below to switch)
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ================= SEARCH & CATEGORY FILTER TABS ================= */}
      <div className="space-y-2.5">
        {/* Search Input */}
        <div className="relative">
          <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">
            search
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search crop in English or Hindi/Marathi (e.g., Kesar Mango, Tamatar, Gehun, Sugarcane)..."
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200/80 bg-white/80 backdrop-blur-md text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-600/30 shadow-xs"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <span className="material-symbols-outlined text-[16px]">close</span>
            </button>
          )}
        </div>

        {/* Category Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          <button
            type="button"
            onClick={() => setActiveCategory('All')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              activeCategory === 'All'
                ? 'bg-[#012d1d] text-white shadow-sm'
                : 'bg-slate-100/80 hover:bg-slate-200/80 text-slate-700'
            }`}
          >
            All Crops ({CROP_PRESETS.length})
          </button>
          {CROP_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setActiveCategory(cat.id)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                activeCategory === cat.id
                  ? 'bg-[#116c4a] text-white shadow-sm'
                  : 'bg-slate-100/80 hover:bg-slate-200/80 text-slate-700'
              }`}
            >
              <span className="material-symbols-outlined text-[14px]">{cat.icon}</span>
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* ================= PRESET CARDS SCROLLABLE GRID ================= */}
      <div className="max-h-56 overflow-y-auto pr-1 space-y-1.5 rounded-2xl border border-slate-200/70 p-2 bg-slate-50/50 backdrop-blur-sm">
        {filteredPresets.length === 0 ? (
          <div className="py-8 text-center text-slate-500 text-xs">
            <span className="material-symbols-outlined text-slate-400 text-3xl mb-1">sentiment_dissatisfied</span>
            <p>No matching crops found for &ldquo;{searchQuery}&rdquo;.</p>
            <p className="mt-1 text-slate-400">You can type any custom variety name in the input box below.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {filteredPresets.map((preset: CropPreset) => {
              const isSelected = preset.name.toLowerCase() === selectedName.toLowerCase();
              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => onSelect(preset)}
                  className={`flex items-center justify-between p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-emerald-50/90 border-emerald-500 ring-2 ring-emerald-500/20 shadow-xs'
                      : 'bg-white/90 hover:bg-white border-slate-200/80 hover:border-emerald-300'
                  }`}
                >
                  <div className="min-w-0 pr-2">
                    <div className="flex items-center gap-1.5">
                      <span className="font-semibold text-xs text-slate-900 truncate">
                        {preset.name}
                      </span>
                      {isSelected && (
                        <span className="material-symbols-outlined text-emerald-600 text-[14px]">
                          check_circle
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 font-medium truncate">
                      {preset.vernacularName}
                    </p>
                  </div>

                  <div className="flex-shrink-0 text-right">
                    <span className="inline-block px-2 py-0.5 rounded-md bg-emerald-100/70 text-emerald-800 text-[10px] font-bold">
                      {preset.defaultDurationDays}d
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Crop3DSelector;
