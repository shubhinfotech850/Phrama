import React, { useState, useEffect } from 'react';
import {
  Pill,
  ScanLine,
  Sparkles,
  Building2,
  PackageCheck,
  Store,
  Menu,
  X,
  ShieldCheck,
  Stethoscope,
  Briefcase,
  Sun,
  Moon,
  LayoutDashboard,
  LogOut,
} from 'lucide-react';
import type { UserRole } from '../types/pharmacy';
import { useTheme } from '../services/theme';
import { useI18n } from '../services/i18n';
import { LanguageSwitcher } from './LanguageSwitcher';

type TabKey = 'medical_search' | 'bill_scanner' | 'new_releases' | 'agency_portal' | 'agency_dashboard' | 'directory';

interface HeaderProps {
  activeTab: TabKey;
  setActiveTab: (tab: TabKey) => void;
  userRole: UserRole;
  setUserRole: (role: UserRole) => void;
  pendingInquiriesCount?: number;
  onLogout?: () => void;
}

const NAV_BY_ROLE: Record<UserRole, { key: TabKey; labelKey: string; icon: React.ComponentType<{ className?: string }> }[]> = {
  medical_store: [
    { key: 'medical_search', labelKey: 'nav.search', icon: Store },
    { key: 'new_releases', labelKey: 'nav.newReleases', icon: Sparkles },
    { key: 'directory', labelKey: 'nav.stockists', icon: Building2 },
  ],
  mr_agency: [
    { key: 'agency_dashboard', labelKey: 'nav.dashboard', icon: LayoutDashboard },
    { key: 'agency_portal', labelKey: 'nav.stock', icon: PackageCheck },
    { key: 'bill_scanner', labelKey: 'nav.scanBill', icon: ScanLine },
    { key: 'new_releases', labelKey: 'nav.newReleases', icon: Sparkles },
  ],
};

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  userRole,
  setUserRole,
  pendingInquiriesCount = 0,
  onLogout,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const { t } = useI18n();

  const items = NAV_BY_ROLE[userRole];

  const handleNavClick = (tab: TabKey) => {
    setActiveTab(tab);
    setMobileMenuOpen(false);
  };

  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-slate-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-3 h-14 sm:h-16">
          {/* Brand */}
          <button
            onClick={() => handleNavClick(userRole === 'medical_store' ? 'medical_search' : 'agency_dashboard')}
            className="flex items-center gap-2 shrink-0 focus:outline-none group"
          >
            <div className="w-9 h-9 rounded-xl bg-teal-600 flex items-center justify-center text-white shadow-sm group-hover:bg-teal-700 transition-colors">
              <Pill className="w-5 h-5" />
            </div>
            <span className="text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap">
              {t('app.name')}
            </span>
          </button>

          {/* Desktop Nav — only tabs relevant to current role */}
          <nav className="hidden md:flex items-center gap-1">
            {items.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.key;
              return (
                <button
                  key={item.key}
                  onClick={() => handleNavClick(item.key)}
                  className={`px-3 py-2 text-sm font-semibold rounded-lg whitespace-nowrap transition-colors flex items-center gap-1.5 relative ${
                    isActive
                      ? 'bg-slate-900 text-white'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{t(item.labelKey)}</span>
                  {item.key === 'agency_portal' && pendingInquiriesCount > 0 && (
                    <span className="w-4 h-4 text-[10px] font-bold bg-amber-500 text-slate-900 rounded-full flex items-center justify-center">
                      {pendingInquiriesCount}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right: role switch, theme, logout, mobile toggle */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Role switcher */}
            <div className="flex items-center bg-slate-100 p-0.5 rounded-lg">
              <button
                type="button"
                onClick={() => setUserRole('medical_store')}
                className={`px-2.5 py-1 text-xs font-semibold rounded-md whitespace-nowrap transition-all flex items-center gap-1 ${
                  userRole === 'medical_store'
                    ? 'bg-white text-slate-900 shadow-sm font-bold'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <Stethoscope className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{t('role.store')}</span>
              </button>
              <button
                type="button"
                onClick={() => setUserRole('mr_agency')}
                className={`px-2.5 py-1 text-xs font-semibold rounded-md whitespace-nowrap transition-all flex items-center gap-1 ${
                  userRole === 'mr_agency'
                    ? 'bg-white text-slate-900 shadow-sm font-bold'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <Briefcase className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{t('role.mrAgency')}</span>
              </button>
            </div>

            <LanguageSwitcher />

            <button
              type="button"
              onClick={toggleTheme}
              className="hidden sm:inline-flex items-center justify-center w-9 h-9 rounded-lg border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
              aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            {onLogout && (
              <button
                type="button"
                onClick={onLogout}
                className="hidden sm:inline-flex items-center justify-center w-9 h-9 rounded-lg border border-slate-200 text-slate-600 hover:text-rose-700 hover:bg-rose-50 transition-colors"
                aria-label="Sign out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}

            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden p-2 rounded-lg text-slate-700 hover:bg-slate-100 transition-colors min-h-[40px] min-w-[40px] flex items-center justify-center border border-slate-200"
              aria-label="Open navigation menu"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile drawer */}
      <div
        className={`md:hidden fixed inset-0 z-[60] transition-opacity duration-300 ${
          mobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        aria-hidden={!mobileMenuOpen}
      >
        <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)} />
        <aside
          className={`absolute top-0 left-0 h-full w-[82%] max-w-xs bg-white shadow-2xl flex flex-col transition-transform duration-300 ${
            mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="px-5 pt-5 pb-4 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-teal-600 flex items-center justify-center text-white">
                <Pill className="w-5 h-5" />
              </div>
              <span className="text-base font-bold tracking-tight text-slate-900">{t('app.name')}</span>
            </div>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(false)}
              className="p-2 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 min-h-[40px] min-w-[40px] flex items-center justify-center"
              aria-label="Close navigation menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1.5">
            {items.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.key;
              return (
                <button
                  key={item.key}
                  onClick={() => handleNavClick(item.key)}
                  className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all ${
                    isActive ? 'bg-slate-900 text-white shadow-md' : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <span
                    className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                      isActive ? 'bg-white/15 text-white' : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    <Icon className="w-[18px] h-[18px]" />
                  </span>
                  <span className="text-sm font-semibold text-left flex-1">{t(item.labelKey)}</span>
                  {item.key === 'agency_portal' && pendingInquiriesCount > 0 && (
                    <span className="w-5 h-5 text-[10px] font-bold bg-amber-500 text-slate-900 rounded-full flex items-center justify-center">
                      {pendingInquiriesCount}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          <div className="px-5 py-4 border-t border-slate-200 space-y-3">
            <div className="flex items-center bg-slate-100 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setUserRole('medical_store')}
                className={`flex-1 flex items-center justify-center gap-1.5 px-2 py-2 text-xs font-semibold rounded-lg ${
                  userRole === 'medical_store' ? 'bg-white text-slate-900 shadow-sm font-bold' : 'text-slate-500'
                }`}
              >
                <Stethoscope className="w-3.5 h-3.5" />
                {t('role.store')}
              </button>
              <button
                type="button"
                onClick={() => setUserRole('mr_agency')}
                className={`flex-1 flex items-center justify-center gap-1.5 px-2 py-2 text-xs font-semibold rounded-lg ${
                  userRole === 'mr_agency' ? 'bg-white text-slate-900 shadow-sm font-bold' : 'text-slate-500'
                }`}
              >
                <Briefcase className="w-3.5 h-3.5" />
                {t('role.mrAgency')}
              </button>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={toggleTheme}
                className="flex-1 inline-flex items-center justify-center gap-1.5 px-2.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg border border-slate-200"
              >
                {theme === 'dark' ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
                {theme === 'dark' ? t('theme.light') : t('theme.dark')}
              </button>
              <LanguageSwitcher variant="full" className="flex-1" />
              {onLogout && (
                <button
                  type="button"
                  onClick={onLogout}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 px-2.5 py-2 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg border border-rose-200"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  {t('action.signOut')}
                </button>
              )}
            </div>
            <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-500 font-medium pt-1">
              <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
              Verified Pharma Network
            </div>
          </div>
        </aside>
      </div>

      {/* Mobile bottom bar — role-aware */}
      <div className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-2 py-1">
        <div className="grid gap-0.5" style={{ gridTemplateColumns: `repeat(${items.length}, minmax(0, 1fr))` }}>
          {items.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.key;
            return (
              <button
                key={item.key}
                type="button"
                onClick={() => handleNavClick(item.key)}
                className={`flex flex-col items-center justify-center py-1.5 px-0.5 rounded-lg transition-colors min-h-[48px] relative ${
                  isActive ? 'text-teal-700 font-bold bg-teal-50/80' : 'text-slate-500'
                }`}
              >
                <Icon className="w-5 h-5 mb-0.5" />
                <span className="text-[9px] leading-tight truncate">{t(item.labelKey).split(' ')[0]}</span>
                {item.key === 'agency_portal' && pendingInquiriesCount > 0 && (
                  <span className="absolute top-0.5 right-1 w-3.5 h-3.5 text-[8px] font-bold bg-amber-500 text-slate-900 rounded-full flex items-center justify-center">
                    {pendingInquiriesCount}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
