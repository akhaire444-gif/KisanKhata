import React, { useState, useMemo } from 'react';
import {
  CROP_CATEGORIES,
  CropPreset,
  getCropsByCategory,
  normalizeCategory
} from '../data/cropCatalogue';

interface CropCategorySelectorProps {
  selectedCategory: string;
  selectedCropName: string;
  onSelectCategory: (category: string) => void;
  onSelectCrop: (preset: { name: string; category: string; defaultDurationDays?: number }) => void;
  onCustomCropNameChange?: (customName: string) => void;
}

export const CropCategorySelector: React.FC<CropCategorySelectorProps> = ({
  selectedCategory,
  selectedCropName,
  onSelectCategory,
  onSelectCrop,
  onCustomCropNameChange
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isCustomMode, setIsCustomMode] = useState(false);
  const [customInput, setCustomInput] = useState('');

  // Active category normalized
  const currentCategory = useMemo(
    () => normalizeCategory(selectedCategory),
    [selectedCategory]
  );

  // Crops matching the selected category and search query
  const categoryCrops = useMemo(() => {
    const list = getCropsByCategory(currentCategory);
    if (!searchQuery.trim()) return list;
    const q = searchQuery.toLowerCase().trim();
    return list.filter(
      c =>
        c.name.toLowerCase().includes(q) ||
        c.vernacularName.toLowerCase().includes(q)
    );
  }, [currentCategory, searchQuery]);

  const handleCategoryClick = (catId: string) => {
    onSelectCategory(catId);
    setSearchQuery('');
    setIsCustomMode(false);
  };

  const handleCropClick = (preset: CropPreset) => {
    setIsCustomMode(false);
    onSelectCrop({
      name: preset.name,
      category: preset.category,
      defaultDurationDays: preset.defaultDurationDays
    });
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customInput.trim()) return;
    if (onCustomCropNameChange) {
      onCustomCropNameChange(customInput.trim());
    }
    onSelectCrop({
      name: customInput.trim(),
      category: currentCategory
    });
  };

  return (
    <div className="space-y-4">
      {/* 1. Category Selector Pills / Chips */}
      <div>
        <label className="block text-[13px] font-bold text-[#012d1d] mb-1.5">
          Select Crop Category (श्रेणी चुनें) *
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          {CROP_CATEGORIES.map(cat => {
            const isSelected = currentCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => handleCategoryClick(cat.id)}
                className={`p-2.5 rounded-2xl text-left transition-all cursor-pointer flex flex-col justify-between border ${
                  isSelected
                    ? 'border-[#012d1d] bg-[#012d1d] text-white shadow-md ring-2 ring-[#a1f4c8]/50'
                    : 'glass-subtle hover:bg-white/90 text-[#111c2d] border-emerald-500/20'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span
                    className={`material-symbols-outlined text-[20px] ${
                      isSelected ? 'text-[#a1f4c8]' : 'text-[#116c4a]'
                    }`}
                  >
                    {cat.icon}
                  </span>
                  {isSelected && (
                    <span className="w-2 h-2 rounded-full bg-[#a1f4c8]"></span>
                  )}
                </div>
                <div>
                  <div className="font-bold text-[13px] leading-tight truncate">
                    {cat.label}
                  </div>
                  <div
                    className={`text-[10px] mt-0.5 truncate ${
                      isSelected ? 'text-white/80' : 'text-[#717973]'
                    }`}
                  >
                    {cat.vernacularLabel}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Search & Context-Aware Crops Grid */}
      <div className="p-3.5 rounded-2xl glass-subtle border border-emerald-500/20">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 mb-3">
          <div className="flex items-center gap-1.5">
            <span className="text-[13px] font-bold text-[#012d1d]">
              Choose {CROP_CATEGORIES.find(c => c.id === currentCategory)?.label} Crop:
            </span>
            <span className="px-2 py-0.5 rounded-full bg-[#c1ecd4] text-[#274e3d] text-[11px] font-bold">
              {categoryCrops.length} options
            </span>
          </div>

          <div className="relative flex-1 sm:max-w-xs">
            <span className="material-symbols-outlined absolute left-2.5 top-2 text-[#717973] text-[16px]">
              search
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder={`Search ${currentCategory.toLowerCase()}...`}
              className="w-full pl-8 pr-7 py-1.5 text-[12px] glass-input rounded-xl"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-2 text-[#717973] hover:text-[#012d1d]"
              >
                <span className="material-symbols-outlined text-[14px]">close</span>
              </button>
            )}
          </div>
        </div>

        {/* Crops Selection Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-56 overflow-y-auto pr-1">
          {categoryCrops.map(preset => {
            const isSelected =
              !isCustomMode &&
              selectedCropName &&
              (selectedCropName.toLowerCase() === preset.name.toLowerCase() ||
                preset.name.toLowerCase().startsWith(selectedCropName.toLowerCase()));

            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => handleCropClick(preset)}
                className={`p-2.5 rounded-xl text-left transition-all cursor-pointer border flex flex-col justify-between ${
                  isSelected
                    ? 'border-[#116c4a] bg-emerald-500/15 shadow-sm ring-2 ring-[#116c4a]'
                    : 'bg-white/80 hover:bg-white border-emerald-500/15 hover:border-emerald-500/40'
                }`}
              >
                <div className="flex items-start justify-between gap-1 mb-1">
                  <div className="font-bold text-[13px] text-[#012d1d] leading-snug line-clamp-1" title={preset.name}>
                    {preset.name}
                  </div>
                  {isSelected && (
                    <span className="material-symbols-outlined text-[16px] text-[#116c4a] shrink-0 font-bold">
                      check_circle
                    </span>
                  )}
                </div>

                <div className="text-[11px] font-medium text-[#116c4a] mb-1.5 line-clamp-1">
                  {preset.vernacularName}
                </div>

                <div className="flex items-center justify-between text-[10px] text-[#717973] pt-1 border-t border-emerald-500/10">
                  <span>Cycle:</span>
                  <span className="font-bold text-[#012d1d]">
                    ~{preset.defaultDurationDays} days
                  </span>
                </div>
              </button>
            );
          })}

          {/* Custom / Other Crop Option Card */}
          <button
            type="button"
            onClick={() => {
              setIsCustomMode(true);
              setCustomInput(selectedCropName || '');
            }}
            className={`p-2.5 rounded-xl text-left transition-all cursor-pointer border border-dashed flex flex-col justify-between ${
              isCustomMode
                ? 'border-[#116c4a] bg-emerald-500/15 shadow-sm ring-2 ring-[#116c4a]'
                : 'bg-white/60 hover:bg-white/90 border-[#116c4a]/40'
            }`}
          >
            <div className="flex items-center gap-1.5 mb-1">
              <span className="material-symbols-outlined text-[18px] text-[#116c4a]">
                add_circle
              </span>
              <span className="font-bold text-[13px] text-[#012d1d]">
                Custom Variety
              </span>
            </div>
            <p className="text-[10px] text-[#414844] mt-0.5">
              Type any regional / unique crop name
            </p>
          </button>
        </div>

        {/* Custom Crop Input Field (Visible when Custom Mode active or no results) */}
        {(isCustomMode || categoryCrops.length === 0) && (
          <div className="mt-3 pt-3 border-t border-emerald-500/20">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={customInput}
                onChange={e => {
                  setCustomInput(e.target.value);
                  if (onCustomCropNameChange) {
                    onCustomCropNameChange(e.target.value);
                  }
                }}
                onBlur={() => {
                  if (customInput.trim()) {
                    onSelectCrop({
                      name: customInput.trim(),
                      category: currentCategory
                    });
                  }
                }}
                placeholder="Type your crop name (e.g. Dragon Fruit, Shevga / Drumstick)..."
                className="flex-1 px-3 py-2 text-[13px] glass-input rounded-xl"
              />
              <button
                type="button"
                onClick={handleCustomSubmit}
                className="px-4 py-2 rounded-xl glass-btn-primary water-shimmer text-white text-[12px] font-bold cursor-pointer shrink-0"
              >
                Apply
              </button>
            </div>
            <p className="text-[11px] text-[#717973] mt-1">
              Custom crop will be registered under <strong>{CROP_CATEGORIES.find(c => c.id === currentCategory)?.label}</strong>.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

