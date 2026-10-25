import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  Phone, 
  MessageCircle, 
  Package, 
  Building2, 
  User, 
  CheckCircle, 
  Sparkles, 
  Tag, 
  Clock, 
  Layers, 
  SendHorizontal,
  ChevronRight,
  Info
} from 'lucide-react';
import type { Product, Agency } from '../types/pharmacy';

interface MedicalStoreViewProps {
  products: Product[];
  agencies: Agency[];
  onOpenInquiry: (product: Product) => void;
  onSelectNewReleasesTab: () => void;
}

export const MedicalStoreView: React.FC<MedicalStoreViewProps> = ({
  products,
  agencies,
  onOpenInquiry,
  onSelectNewReleasesTab,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedCity, setSelectedCity] = useState('All');
  const [onlyInStock, setOnlyInStock] = useState(false);
  const [activeSubstituteModal, setActiveSubstituteModal] = useState<Product | null>(null);

  const categories = [
    'All',
    'Antibiotic',
    'Analgesic & Antipyretic',
    'Antacid / PPI',
    'Cardiovascular',
    'Antiallergic & Respiratory',
    'New Release / Specialty'
  ];

  // Distinct cities from products
  const cities = useMemo(() => {
    const list = Array.from(new Set(products.map(p => p.agencyCity).filter(Boolean)));
    return ['All', ...list];
  }, [products]);

  // Filter products
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      if (onlyInStock && p.stockQty <= 0) return false;
      if (selectedCity !== 'All' && p.agencyCity !== selectedCity) return false;
      if (selectedCategory !== 'All' && !p.category.toLowerCase().includes(selectedCategory.toLowerCase())) return false;

      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase().trim();
      return (
        p.name.toLowerCase().includes(q) ||
        p.genericName.toLowerCase().includes(q) ||
        p.company.toLowerCase().includes(q) ||
        p.agencyName.toLowerCase().includes(q) ||
        p.mrName.toLowerCase().includes(q) ||
        p.batchNo.toLowerCase().includes(q)
      );
    });
  }, [products, searchQuery, selectedCategory, selectedCity, onlyInStock]);

  // Find generic substitutes (products with similar salt composition)
  const getSubstitutes = (targetProduct: Product) => {
    const saltTerms = targetProduct.genericName.toLowerCase().split(/[+(),]/).map(s => s.trim()).filter(s => s.length > 3);
    return products.filter(p => {
      if (p.id === targetProduct.id) return false;
      const otherGeneric = p.genericName.toLowerCase();
      return saltTerms.some(term => otherGeneric.includes(term));
    });
  };

  // Build pre-formatted WhatsApp order draft
  const getWhatsAppLink = (product: Product) => {
    const cleanPhone = (product.mrPhone || '').replace(/[^0-9]/g, '');
    const message = encodeURIComponent(
      `Hello ${product.mrName} (${product.agencyName}),\n\nI am contacting from my Medical Store regarding tablet stock availability on PharmaBridge.\n\nMedicine: *${product.name}*\nSalt: ${product.genericName}\nPack: ${product.packSize}\nPTR Rate: ₹${product.ptr}\nScheme: ${product.scheme || 'Standard'}\n\nPlease share your current dispatch ETA and minimum delivery slot for 20-50 strips.\n\nThank you!`
    );
    return `https://wa.me/${cleanPhone}?text=${message}`;
  };

  return (
    <div className="space-y-6">
      {/* Search Header Banner */}
      <div className="bg-white rounded-lg border border-slate-200 p-5 sm:p-6 shadow-2xs">
        <div className="max-w-3xl">
          <div className="flex items-center gap-2 text-xs font-semibold text-teal-700 mb-1">
            <Building2 className="w-4 h-4" />
            <span>Retail Chemist & Pharmacy Stock Discovery</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Search Tablets, Check Agency Stock & Connect Directly with MRs
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Find which pharmaceutical agencies and medical representatives have your requested tablets in stock, compare PTR rates & schemes, and place orders directly.
          </p>
        </div>

        {/* Search Bar Input */}
        <div className="mt-5 relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Search className="w-5 h-5" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search tablet brand (e.g. Augmentin, Dolo, Pan, Telma) or generic salt (Paracetamol, Amoxicillin)..."
            className="w-full pl-11 pr-24 py-3 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-teal-600 transition-all font-medium"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-xs text-slate-400 hover:text-slate-600 font-medium"
            >
              Clear
            </button>
          )}
        </div>

        {/* Filter Bar (Responsive for mobile horizontal touch scrolling) */}
        <div className="mt-4 pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          {/* Category Filter Buttons */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 sm:pb-0 max-w-full scrollbar-none">
            <span className="text-slate-400 font-semibold mr-1 shrink-0 flex items-center gap-1 text-[11px] uppercase tracking-wider">
              <Filter className="w-3.5 h-3.5" />
              Category:
            </span>
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-md font-medium whitespace-nowrap transition-colors shrink-0 min-h-[36px] sm:min-h-0 flex items-center ${
                  selectedCategory === cat
                    ? 'bg-slate-900 text-white shadow-2xs font-bold'
                    : 'text-slate-600 bg-slate-100 hover:bg-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* City & Stock Filter */}
          <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
            <div className="flex items-center gap-1.5">
              <label className="text-slate-500 font-medium">Territory:</label>
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-md px-2.5 py-1.5 text-slate-800 text-xs focus:outline-teal-600 min-h-[36px] sm:min-h-0"
              >
                {cities.map((city) => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
            </div>

            <label className="flex items-center gap-1.5 cursor-pointer text-slate-700 font-medium select-none min-h-[36px] sm:min-h-0">
              <input
                type="checkbox"
                checked={onlyInStock}
                onChange={(e) => setOnlyInStock(e.target.checked)}
                className="w-4 h-4 rounded text-teal-600 focus:ring-teal-500"
              />
              <span>In Stock Only</span>
            </label>
          </div>
        </div>
      </div>

      {/* Promoted New Release Banner Kicker */}
      <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white shrink-0 mt-0.5">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-indigo-950">
              New Releases & Doctor Sample Campaigns
            </h4>
            <p className="text-xs text-indigo-800 mt-0.5">
              Pharma MRs and agencies have launched 3 newly approved molecules with introductory retailer schemes and free physician trial kits.
            </p>
          </div>
        </div>
        <button
          onClick={onSelectNewReleasesTab}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-indigo-700 hover:bg-indigo-800 rounded-md whitespace-nowrap shrink-0 transition-colors shadow-2xs"
        >
          <span>View New Releases</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Results Count & Density Indicator */}
      <div className="flex items-center justify-between text-xs text-slate-500 px-1">
        <span>
          Showing <strong className="text-slate-800">{filteredProducts.length}</strong> available medicine stock listings
        </span>
        <span className="hidden sm:inline">
          Prices shown in Indian Rupee (₹) · PTR (Price to Retailer) · MRP
        </span>
      </div>

      {/* Product Stock Cards Grid */}
      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProducts.map((product) => {
            const margin = product.marginPercent || (product.mrp > product.ptr ? Math.round(((product.mrp - product.ptr) / product.mrp) * 100 * 10) / 10 : 25);
            const inStock = product.stockQty > 0;

            return (
              <div
                key={product.id}
                className="bg-white rounded-lg border border-slate-200 hover:border-slate-300 p-5 flex flex-col justify-between transition-all hover:shadow-xs group"
              >
                {/* Upper Details */}
                <div className="space-y-3">
                  {/* Brand Name & Category */}
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-base font-bold text-slate-900 group-hover:text-teal-700 transition-colors">
                        {product.name}
                      </h3>
                      {product.isNewRelease && (
                        <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700 bg-indigo-50 border border-indigo-200 px-1.5 py-0.5 rounded">
                          New Release
                        </span>
                      )}
                    </div>
                    {/* Unboxed Metadata with clean typographic separators */}
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1">
                      <span>{product.dosageForm}</span>
                      <span aria-hidden="true">·</span>
                      <span>{product.packSize}</span>
                      <span aria-hidden="true">·</span>
                      <span className="font-semibold text-slate-700">{product.company}</span>
                    </div>
                  </div>

                  {/* Salt / Generic Composition */}
                  <div className="p-2.5 bg-slate-50 rounded-md border border-slate-100">
                    <span className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                      Generic Composition / Salt
                    </span>
                    <p className="text-xs font-medium text-slate-800 mt-0.5 line-clamp-2">
                      {product.genericName}
                    </p>
                  </div>

                  {/* Stockist & MR Contact Block */}
                  <div className="space-y-1.5 text-xs">
                    <div className="flex items-start gap-2 text-slate-700">
                      <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                      <div>
                        <strong className="font-semibold text-slate-900">{product.agencyName}</strong>
                        <span className="text-slate-500 text-[11px] block">{product.agencyCity}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-slate-600">
                      <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>MR: <strong>{product.mrName}</strong> ({product.mrPhone})</span>
                    </div>

                    <div className="flex items-center gap-2 text-slate-600">
                      <Package className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>
                        Batch: <span className="font-mono">{product.batchNo}</span> · Exp: <span className="font-mono">{product.expDate}</span>
                      </span>
                    </div>
                  </div>

                  {/* Scheme if available */}
                  {product.scheme && (
                    <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-medium bg-emerald-50/70 px-2.5 py-1.5 rounded-md border border-emerald-100">
                      <Tag className="w-3.5 h-3.5 shrink-0 text-emerald-600" />
                      <span className="truncate">{product.scheme}</span>
                    </div>
                  )}

                  {/* Pricing Matrix */}
                  <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100 text-center">
                    <div className="bg-slate-50 p-2 rounded">
                      <span className="block text-[10px] uppercase font-semibold text-slate-500">PTR Rate</span>
                      <span className="text-sm font-bold text-teal-800 font-mono tabular-nums">
                        ₹{product.ptr.toFixed(2)}
                      </span>
                    </div>

                    <div className="bg-slate-50 p-2 rounded">
                      <span className="block text-[10px] uppercase font-semibold text-slate-500">MRP</span>
                      <span className="text-sm font-medium text-slate-600 font-mono tabular-nums line-through">
                        ₹{product.mrp.toFixed(2)}
                      </span>
                    </div>

                    <div className="bg-teal-50 p-2 rounded border border-teal-100">
                      <span className="block text-[10px] uppercase font-semibold text-teal-700">Margin</span>
                      <span className="text-sm font-bold text-teal-900 font-mono tabular-nums">
                        {margin}%
                      </span>
                    </div>
                  </div>

                  {/* Stock Status indicator */}
                  <div className="flex items-center justify-between text-xs pt-1">
                    <span className="text-slate-500">
                      Available Stock:
                    </span>
                    <span className={`font-mono font-semibold ${inStock ? 'text-emerald-700' : 'text-rose-600'}`}>
                      {inStock ? `${product.stockQty} Units Available` : 'Temporarily Out of Stock'}
                    </span>
                  </div>
                </div>

                {/* Direct Action Contacts (Responsive touch ergonomics on mobile) */}
                <div className="mt-4 pt-3 border-t border-slate-100 space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    {/* 1-Click WhatsApp Order */}
                    <a
                      href={getWhatsAppLink(product)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-md transition-colors min-h-[42px]"
                      title="Send pre-filled WhatsApp stock order"
                    >
                      <MessageCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>WhatsApp MR</span>
                    </a>

                    {/* Direct Call */}
                    <a
                      href={`tel:${product.mrPhone}`}
                      className="inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors min-h-[42px]"
                      title="Call Medical Rep / Agency"
                    >
                      <Phone className="w-4 h-4 text-slate-600 shrink-0" />
                      <span>Call MR</span>
                    </a>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* In-App Order Inquiry Request */}
                    <button
                      type="button"
                      onClick={() => onOpenInquiry(product)}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-md transition-colors shadow-2xs min-h-[42px]"
                    >
                      <SendHorizontal className="w-4 h-4 shrink-0" />
                      <span>Send Stock PO / Inquiry</span>
                    </button>

                    {/* Find Equivalent Salt Substitutes */}
                    <button
                      type="button"
                      onClick={() => setActiveSubstituteModal(product)}
                      className="px-3 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-md transition-colors min-h-[42px] flex items-center justify-center"
                      title="Find other agency brands with same chemical formula"
                    >
                      <Layers className="w-4 h-4 shrink-0" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-slate-200 p-12 text-center space-y-3">
          <Package className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">
            No Medicines Match &quot;{searchQuery || selectedCategory}&quot;
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Try searching by the generic salt name (e.g. Paracetamol, Amoxicillin, Pantoprazole) or clear category filters.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('All');
              setSelectedCity('All');
              setOnlyInStock(false);
            }}
            className="px-3.5 py-1.5 text-xs font-semibold text-teal-700 bg-teal-50 hover:bg-teal-100 rounded-md transition-colors"
          >
            Reset All Filters
          </button>
        </div>
      )}

      {/* Generic Salt Substitutes Modal Drawer */}
      {activeSubstituteModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-2xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-slate-200 max-w-2xl w-full p-6 shadow-xl space-y-4 max-h-[85vh] flex flex-col">
            <div className="flex items-start justify-between pb-3 border-b border-slate-200">
              <div>
                <span className="text-xs font-semibold text-teal-700 uppercase tracking-wider">
                  Salt Composition Equivalents
                </span>
                <h3 className="text-lg font-bold text-slate-900 mt-0.5">
                  Available Substitutes for {activeSubstituteModal.name}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5 font-medium">
                  Formula: {activeSubstituteModal.genericName}
                </p>
              </div>
              <button
                onClick={() => setActiveSubstituteModal(null)}
                className="text-slate-400 hover:text-slate-700 text-sm font-semibold p-1"
              >
                ✕
              </button>
            </div>

            <div className="overflow-y-auto flex-1 space-y-3 pr-1">
              {getSubstitutes(activeSubstituteModal).length > 0 ? (
                getSubstitutes(activeSubstituteModal).map((sub) => (
                  <div
                    key={sub.id}
                    className="p-3.5 rounded-lg border border-slate-200 bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-teal-300 transition-colors"
                  >
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">{sub.name}</h4>
                      <p className="text-xs text-slate-600 mt-0.5 font-medium">{sub.company}</p>
                      <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                        <span>Stockist: <strong>{sub.agencyName}</strong> ({sub.agencyCity})</span>
                        <span aria-hidden="true">·</span>
                        <span className="font-mono text-emerald-700 font-semibold">{sub.stockQty} in stock</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <div className="text-right">
                        <span className="text-xs text-slate-400 block">PTR Rate</span>
                        <span className="text-sm font-bold text-teal-800 font-mono tabular-nums">
                          ₹{sub.ptr.toFixed(2)}
                        </span>
                      </div>
                      <button
                        onClick={() => {
                          setActiveSubstituteModal(null);
                          onOpenInquiry(sub);
                        }}
                        className="px-3 py-1.5 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-md transition-colors"
                      >
                        Order This
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-8 text-center text-xs text-slate-500">
                  <Info className="w-6 h-6 text-slate-300 mx-auto mb-2" />
                  No other stockist currently lists an exact equivalent for this formulation.
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-slate-200 text-right">
              <button
                onClick={() => setActiveSubstituteModal(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors"
              >
                Close Window
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
