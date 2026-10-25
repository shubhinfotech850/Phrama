import React, { useState } from 'react';
import { Building2, User, Phone, MessageCircle, MapPin, ShieldCheck, Clock, CheckCircle } from 'lucide-react';
import type { Agency } from '../types/pharmacy';

interface AgencyDirectoryProps {
  agencies: Agency[];
  onSelectAgencyProducts: (agencyId: string) => void;
}

export const AgencyDirectory: React.FC<AgencyDirectoryProps> = ({
  agencies,
  onSelectAgencyProducts,
}) => {
  const [roleFilter, setRoleFilter] = useState<'All' | 'Agency Stockist' | 'Medical Representative (MR)'>('All');

  const filtered = agencies.filter(a => {
    if (roleFilter !== 'All' && a.role !== roleFilter) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-teal-700 mb-1">
            <Building2 className="w-4 h-4" />
            <span>Verified Wholesale Network</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Wholesale Agencies & Medical Representatives Directory
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Authorized pharmaceutical distributors, C&F agents, and field MRs registered on PharmaBridge. Contact directly for wholesale agency accounts.
          </p>
        </div>

        {/* Filter buttons (responsive horizontal scroll on mobile) */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg overflow-x-auto max-w-full scrollbar-none w-full sm:w-auto shrink-0">
          <button
            onClick={() => setRoleFilter('All')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors flex-1 sm:flex-initial text-center ${
              roleFilter === 'All' ? 'bg-white text-slate-900 shadow-2xs font-bold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All ({agencies.length})
          </button>
          <button
            onClick={() => setRoleFilter('Agency Stockist')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors flex-1 sm:flex-initial text-center ${
              roleFilter === 'Agency Stockist' ? 'bg-white text-slate-900 shadow-2xs font-bold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Stockist Agencies
          </button>
          <button
            onClick={() => setRoleFilter('Medical Representative (MR)')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors flex-1 sm:flex-initial text-center ${
              roleFilter === 'Medical Representative (MR)' ? 'bg-white text-slate-900 shadow-2xs font-bold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Field MRs
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((agency) => {
          const waLink = `https://wa.me/${agency.whatsapp}?text=${encodeURIComponent(
            `Hello ${agency.contactPerson} (${agency.name}),\n\nI am contacting from my Pharmacy regarding distributor supply partnership and medicine orders on PharmaBridge.`
          )}`;

          return (
            <div
              key={agency.id}
              className="bg-white rounded-lg border border-slate-200 p-5 shadow-2xs hover:border-teal-300 transition-all space-y-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                      agency.role === 'Agency Stockist'
                        ? 'bg-teal-50 text-teal-800 border border-teal-100'
                        : 'bg-indigo-50 text-indigo-800 border border-indigo-100'
                    }`}>
                      {agency.role}
                    </span>
                    <span className="text-xs text-slate-500 font-medium">
                      Rating: ★ {agency.rating.toFixed(1)}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900">
                    {agency.name}
                  </h3>

                  <div className="flex items-center gap-2 text-xs text-slate-600">
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    <span>Contact: <strong>{agency.contactPerson}</strong></span>
                  </div>
                </div>

                <div className="text-right text-xs text-slate-500">
                  <span className="flex items-center gap-1 text-slate-700 font-semibold justify-end">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    {agency.city}, {agency.state}
                  </span>
                  <span className="text-[11px] block mt-0.5 text-teal-700 font-medium">
                    {agency.deliveryEta}
                  </span>
                </div>
              </div>

              {/* Compliance & Representation */}
              <div className="p-3 bg-slate-50 rounded-md border border-slate-100 space-y-1.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Drug License No:</span>
                  <span className="font-mono font-semibold text-slate-800">{agency.drugLicenseNo}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">GSTIN:</span>
                  <span className="font-mono text-slate-700">{agency.gstin}</span>
                </div>
                <div className="pt-1 border-t border-slate-200/60">
                  <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Pharma Companies Represented
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {agency.companiesRepresented.map((c, i) => (
                      <span key={i} className="text-[11px] bg-white border border-slate-200 px-2 py-0.5 rounded text-slate-700 font-medium">
                        {c}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Buttons (responsive for mobile touch) */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 pt-2 border-t border-slate-100">
                <div className="grid grid-cols-2 gap-2">
                  <a
                    href={waLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-md transition-colors min-h-[40px]"
                  >
                    <MessageCircle className="w-4 h-4 text-emerald-600" />
                    <span>WhatsApp</span>
                  </a>

                  <a
                    href={`tel:${agency.phone}`}
                    className="inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors min-h-[40px]"
                  >
                    <Phone className="w-4 h-4 text-slate-600" />
                    <span>Call</span>
                  </a>
                </div>

                <button
                  type="button"
                  onClick={() => onSelectAgencyProducts(agency.id)}
                  className="w-full sm:w-auto px-4 py-2 text-xs font-bold text-slate-900 hover:text-white hover:bg-slate-900 border border-slate-300 rounded-md transition-colors min-h-[40px] flex items-center justify-center"
                >
                  View Stock Catalog
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
