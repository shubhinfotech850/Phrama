import React, { useState } from 'react';
import { 
  Pill, 
  ScanLine, 
  Sparkles, 
  Building2, 
  PackageCheck, 
  Store, 
  Menu, 
  X,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';
import type { UserRole } from '../types/pharmacy';

interface HeaderProps {
  activeTab: 'medical_search' | 'bill_scanner' | 'new_releases' | 'agency_portal' | 'directory';
  setActiveTab: (tab: 'medical_search' | 'bill_scanner' | 'new_releases' | 'agency_portal' | 'directory') => void;
  userRole: UserRole;
  setUserRole: (role: UserRole) => void;
  pendingInquiriesCount?: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  userRole,
  setUserRole,
  pendingInquiriesCount = 0,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNavClick = (tab: 'medical_search' | 'bill_scanner' | 'new_releases' | 'agency_portal' | 'directory') => {
    setActiveTab(tab);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-2 sm:gap-4 md:gap-8 h-14 sm:h-16">
          
          {/* Zone 1: Brand Wordmark */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <button
              onClick={() => handleNavClick('medical_search')}
              className="flex items-center gap-2 text-left focus:outline-none group"
            >
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-teal-600 flex items-center justify-center text-white shadow-xs group-hover:bg-teal-700 transition-colors">
                <Pill className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-base sm:text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap leading-none">
                  PharmaBridge
                </span>
                <span className="hidden sm:block text-[11px] font-medium text-slate-500 whitespace-nowrap mt-0.5">
                  MR & Agency Stock Network
                </span>
              </div>
            </button>
          </div>

          {/* Zone 2: Desktop 4-5 Concise Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1 sm:gap-1.5">
            <button
              onClick={() => handleNavClick('medical_search')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                activeTab === 'medical_search'
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Store className="w-3.5 h-3.5" />
              <span>Search Medicines</span>
            </button>

            <button
              onClick={() => handleNavClick('bill_scanner')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                activeTab === 'bill_scanner'
                  ? 'bg-teal-700 text-white'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <ScanLine className="w-3.5 h-3.5" />
              <span>Scan Bill & Upload</span>
            </button>

            <button
              onClick={() => handleNavClick('new_releases')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                activeTab === 'new_releases'
                  ? 'bg-indigo-700 text-white'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>New Release Tabs</span>
            </button>

            <button
              onClick={() => handleNavClick('agency_portal')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                activeTab === 'agency_portal'
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <PackageCheck className="w-3.5 h-3.5" />
              <span>MR & Agency Stock</span>
              {pendingInquiriesCount > 0 && (
                <span className="w-4 h-4 text-[10px] font-bold bg-amber-500 text-slate-900 rounded-full flex items-center justify-center">
                  {pendingInquiriesCount}
                </span>
              )}
            </button>

            <button
              onClick={() => handleNavClick('directory')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                activeTab === 'directory'
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>Stockist Directory</span>
            </button>
          </nav>

          {/* Zone 3: Role Switcher & Mobile Menu Toggle */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Responsive Workspace Switcher */}
            <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200">
              <button
                type="button"
                onClick={() => setUserRole('medical_store')}
                className={`px-2 sm:px-2.5 py-1 text-[11px] sm:text-xs font-semibold rounded-md whitespace-nowrap transition-all ${
                  userRole === 'medical_store'
                    ? 'bg-white text-slate-900 shadow-xs font-bold'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
                title="Switch to Retail Medical Store"
              >
                <span className="hidden sm:inline">Medical Store</span>
                <span className="sm:hidden">Chemist</span>
              </button>

              <button
                type="button"
                onClick={() => setUserRole('mr_agency')}
                className={`px-2 sm:px-2.5 py-1 text-[11px] sm:text-xs font-semibold rounded-md whitespace-nowrap transition-all ${
                  userRole === 'mr_agency'
                    ? 'bg-white text-slate-900 shadow-xs font-bold'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
                title="Switch to MR & Agency Hub"
              >
                <span className="hidden sm:inline">MR / Agency</span>
                <span className="sm:hidden">MR/Agency</span>
              </button>
            </div>

            {/* Quick Action Button on desktop */}
            {userRole === 'mr_agency' ? (
              <button
                onClick={() => handleNavClick('bill_scanner')}
                className="hidden xl:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-md transition-colors whitespace-nowrap shadow-xs"
              >
                <ScanLine className="w-3.5 h-3.5" />
                <span>Scan Bill</span>
              </button>
            ) : (
              <button
                onClick={() => handleNavClick('medical_search')}
                className="hidden xl:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-md transition-colors whitespace-nowrap shadow-xs"
              >
                <Store className="w-3.5 h-3.5" />
                <span>Order Stock</span>
              </button>
            )}

            {/* Mobile Hamburger Toggle Button (shown on < 1024px) */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-md text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors focus:outline-none min-h-[40px] min-w-[40px] flex items-center justify-center"
              aria-label="Toggle mobile menu"
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5 text-slate-900" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Animated Dropdown Drawer (Top Header Menu) */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-slate-200 px-4 pt-3 pb-4 shadow-xl space-y-2 animate-in slide-in-from-top-2 duration-150">
          <div className="pb-2 border-b border-slate-100 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Navigation Menu
            </span>
            <span className="text-[11px] font-semibold text-teal-700 bg-teal-50 px-2 py-0.5 rounded">
              {userRole === 'medical_store' ? 'Medical Store View' : 'MR & Agency View'}
            </span>
          </div>

          <nav className="space-y-1">
            <button
              onClick={() => handleNavClick('medical_search')}
              className={`w-full flex items-center justify-between p-2.5 rounded-lg text-xs font-semibold transition-colors ${
                activeTab === 'medical_search'
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Store className="w-4 h-4" />
                <span>Search Medicines & Salt Directory</span>
              </div>
              <ChevronRight className="w-4 h-4 opacity-70" />
            </button>

            <button
              onClick={() => handleNavClick('bill_scanner')}
              className={`w-full flex items-center justify-between p-2.5 rounded-lg text-xs font-semibold transition-colors ${
                activeTab === 'bill_scanner'
                  ? 'bg-teal-700 text-white'
                  : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <ScanLine className="w-4 h-4" />
                <span>Scan Distributor Bill (Gemini OCR)</span>
              </div>
              <ChevronRight className="w-4 h-4 opacity-70" />
            </button>

            <button
              onClick={() => handleNavClick('new_releases')}
              className={`w-full flex items-center justify-between p-2.5 rounded-lg text-xs font-semibold transition-colors ${
                activeTab === 'new_releases'
                  ? 'bg-indigo-700 text-white'
                  : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Sparkles className="w-4 h-4" />
                <span>New Release Tabs & MR Campaigns</span>
              </div>
              <ChevronRight className="w-4 h-4 opacity-70" />
            </button>

            <button
              onClick={() => handleNavClick('agency_portal')}
              className={`w-full flex items-center justify-between p-2.5 rounded-lg text-xs font-semibold transition-colors ${
                activeTab === 'agency_portal'
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <PackageCheck className="w-4 h-4" />
                <span>MR & Agency Stock Management</span>
              </div>
              <div className="flex items-center gap-1.5">
                {pendingInquiriesCount > 0 && (
                  <span className="w-5 h-5 text-[10px] font-bold bg-amber-500 text-slate-900 rounded-full flex items-center justify-center">
                    {pendingInquiriesCount}
                  </span>
                )}
                <ChevronRight className="w-4 h-4 opacity-70" />
              </div>
            </button>

            <button
              onClick={() => handleNavClick('directory')}
              className={`w-full flex items-center justify-between p-2.5 rounded-lg text-xs font-semibold transition-colors ${
                activeTab === 'directory'
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Building2 className="w-4 h-4" />
                <span>Verified Stockist & MR Directory</span>
              </div>
              <ChevronRight className="w-4 h-4 opacity-70" />
            </button>
          </nav>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
              Drug License & GSTIN Verified Network
            </span>
          </div>
        </div>
      )}

      {/* Mobile Bottom Navigation Bar (Persistent quick touch bar on mobile) */}
      <div className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 shadow-lg px-2 py-1 safe-area-bottom">
        <div className="grid grid-cols-5 gap-1">
          <button
            type="button"
            onClick={() => handleNavClick('medical_search')}
            className={`flex flex-col items-center justify-center py-1.5 px-1 rounded-lg transition-colors min-h-[48px] ${
              activeTab === 'medical_search'
                ? 'text-teal-700 font-bold bg-teal-50/80'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Store className="w-5 h-5 mb-0.5" />
            <span className="text-[10px] leading-tight truncate">Search</span>
          </button>

          <button
            type="button"
            onClick={() => handleNavClick('bill_scanner')}
            className={`flex flex-col items-center justify-center py-1.5 px-1 rounded-lg transition-colors min-h-[48px] ${
              activeTab === 'bill_scanner'
                ? 'text-teal-700 font-bold bg-teal-50/80'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <ScanLine className="w-5 h-5 mb-0.5" />
            <span className="text-[10px] leading-tight truncate">Scan</span>
          </button>

          <button
            type="button"
            onClick={() => handleNavClick('new_releases')}
            className={`flex flex-col items-center justify-center py-1.5 px-1 rounded-lg transition-colors min-h-[48px] ${
              activeTab === 'new_releases'
                ? 'text-indigo-700 font-bold bg-indigo-50/80'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Sparkles className="w-5 h-5 mb-0.5" />
            <span className="text-[10px] leading-tight truncate">New Tabs</span>
          </button>

          <button
            type="button"
            onClick={() => handleNavClick('agency_portal')}
            className={`flex flex-col items-center justify-center py-1.5 px-1 rounded-lg transition-colors min-h-[48px] relative ${
              activeTab === 'agency_portal'
                ? 'text-slate-900 font-bold bg-slate-100'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <PackageCheck className="w-5 h-5 mb-0.5" />
            <span className="text-[10px] leading-tight truncate">Stock</span>
            {pendingInquiriesCount > 0 && (
              <span className="absolute top-1 right-2.5 w-4 h-4 text-[9px] font-bold bg-amber-500 text-slate-900 rounded-full flex items-center justify-center">
                {pendingInquiriesCount}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => handleNavClick('directory')}
            className={`flex flex-col items-center justify-center py-1.5 px-1 rounded-lg transition-colors min-h-[48px] ${
              activeTab === 'directory'
                ? 'text-slate-900 font-bold bg-slate-100'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Building2 className="w-5 h-5 mb-0.5" />
            <span className="text-[10px] leading-tight truncate">Directory</span>
          </button>
        </div>
      </div>
    </header>
  );
};
