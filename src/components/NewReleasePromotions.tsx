import React, { useState } from 'react';
import { 
  Sparkles, 
  Plus, 
  MessageCircle, 
  Phone, 
  CheckCircle2, 
  Building2, 
  Calendar, 
  FileCheck, 
  Stethoscope,
  Send,
  ExternalLink
} from 'lucide-react';
import type { Promotion, Agency, Product } from '../types/pharmacy';
import { createPromotion } from '../services/api';

interface NewReleasePromotionsProps {
  promotions: Promotion[];
  agencies: Agency[];
  onPromotionCreated: () => void;
  onOpenSampleInquiry: (productName: string, agencyName: string, mrPhone: string) => void;
}

export const NewReleasePromotions: React.FC<NewReleasePromotionsProps> = ({
  promotions,
  agencies,
  onPromotionCreated,
  onOpenSampleInquiry,
}) => {
  const [showLaunchModal, setShowLaunchModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successBanner, setSuccessBanner] = useState<string | null>(null);

  // Form State for new tablet launch
  const [tabletName, setTabletName] = useState('');
  const [genericComposition, setGenericComposition] = useState('');
  const [company, setCompany] = useState('');
  const [launchedBy, setLaunchedBy] = useState(agencies[0]?.contactPerson || 'Pooja Deshmukh (MR)');
  const [role, setRole] = useState<'MR' | 'Agency'>('MR');
  const [contactPhone, setContactPhone] = useState(agencies[0]?.phone || '+91 98450 11982');
  const [contactWhatsapp, setContactWhatsapp] = useState(agencies[0]?.whatsapp || '919845011982');
  const [launchHeadline, setLaunchHeadline] = useState('');
  const [keyIndications, setKeyIndications] = useState('');
  const [introOffer, setIntroOffer] = useState('');
  const [ptr, setPtr] = useState<number>(140);
  const [mrp, setMrp] = useState<number>(200);
  const [sampleAvailable, setSampleAvailable] = useState(true);
  const [sampleStock, setSampleStock] = useState<number>(50);
  const [brochureSummary, setBrochureSummary] = useState('');
  const [targetDoctors, setTargetDoctors] = useState('');
  const [territory, setTerritory] = useState('Mumbai, Pune, Western Maharashtra');

  const handleLaunchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tabletName || !genericComposition || !launchHeadline) return;

    try {
      setIsSubmitting(true);
      const indicationsList = keyIndications
        .split(',')
        .map(i => i.trim())
        .filter(Boolean);

      await createPromotion({
        tabletName: tabletName.trim(),
        genericComposition: genericComposition.trim(),
        company: company.trim() || 'Verified Pharma',
        launchedBy: launchedBy.trim(),
        role,
        contactPhone: contactPhone.trim(),
        contactWhatsapp: contactWhatsapp.replace(/[^0-9]/g, ''),
        launchHeadline: launchHeadline.trim(),
        keyIndications: indicationsList.length > 0 ? indicationsList : ['Standard Clinical Indication'],
        introOffer: introOffer.trim() || 'Special Launch Margin 30% + Free Doctor Samples',
        ptr: Number(ptr) || 100,
        mrp: Number(mrp) || 150,
        sampleAvailable,
        sampleStock: Number(sampleStock) || 50,
        brochureSummary: brochureSummary.trim() || 'High bio-availability advanced formulation.',
        targetDoctors: targetDoctors.trim() || 'General Physicians & Consultants',
        territory: territory.trim() || 'Regional Territory',
      });

      setSuccessBanner(`Successfully launched promotional campaign for "${tabletName}"!`);
      setShowLaunchModal(false);
      resetForm();
      onPromotionCreated();
    } catch (err: any) {
      alert('Error launching promotion: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setTabletName('');
    setGenericComposition('');
    setCompany('');
    setLaunchHeadline('');
    setKeyIndications('');
    setIntroOffer('');
    setBrochureSummary('');
    setTargetDoctors('');
  };

  return (
    <div className="space-y-6">
      {/* Page Title & Context */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-indigo-700 mb-1">
            <Sparkles className="w-4 h-4" />
            <span>New Releases & MR Campaigns</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Promote New Tablet Releases & Discover Latest Formulations
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            MRs and wholesale agencies can publish new medicine launches, doctor sample offers, and retailer introduction schemes visible to all medical stores.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowLaunchModal(true)}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 sm:py-2 text-xs font-bold text-white bg-indigo-700 hover:bg-indigo-800 rounded-md shadow-xs transition-colors whitespace-nowrap w-full sm:w-auto shrink-0 min-h-[40px]"
        >
          <Plus className="w-4 h-4" />
          <span>Launch New Tablet Promotion</span>
        </button>
      </div>

      {/* Success Banner */}
      {successBanner && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center justify-between gap-3 text-emerald-900 text-sm">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{successBanner}</span>
          </div>
          <button
            onClick={() => setSuccessBanner(null)}
            className="text-xs text-emerald-700 hover:text-emerald-900 font-semibold"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Promotions List */}
      <div className="space-y-6">
        {promotions.map((promo) => {
          const cleanPhone = promo.contactWhatsapp || promo.contactPhone.replace(/[^0-9]/g, '');
          const waLink = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(
            `Hello ${promo.launchedBy},\n\nI am contacting from my Medical Store regarding your newly launched tablet *${promo.tabletName}* promoted on PharmaBridge.\n\nIntro Scheme: ${promo.introOffer}\nPTR: ₹${promo.ptr} | MRP: ₹${promo.mrp}\n\nWe would like to request doctor trial samples and place a test order. Please share details.`
          )}`;

          return (
            <div
              key={promo.id}
              className="bg-white rounded-lg border border-slate-200 hover:border-indigo-300 transition-all p-4 sm:p-6 shadow-2xs space-y-4"
            >
              {/* Header: Brand name + Headline */}
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                      New Release
                    </span>
                    <span className="text-xs text-slate-500 font-semibold">
                      {promo.company}
                    </span>
                    <span aria-hidden="true" className="text-slate-300 hidden sm:inline">·</span>
                    <span className="text-xs text-slate-500">
                      Territory: {promo.territory}
                    </span>
                  </div>

                  <h2 className="text-lg sm:text-xl font-bold text-slate-900 mt-1.5">
                    {promo.tabletName}
                  </h2>
                  <p className="text-xs font-semibold text-slate-600 mt-0.5">
                    Salt: <span className="text-slate-800">{promo.genericComposition}</span>
                  </p>

                  <h3 className="text-xs sm:text-sm font-semibold text-indigo-900 mt-2 bg-indigo-50/60 p-2.5 rounded-md border border-indigo-100/80">
                    &ldquo;{promo.launchHeadline}&rdquo;
                  </h3>
                </div>

                {/* Pricing & Margin Card */}
                <div className="flex items-center justify-around sm:justify-center gap-2 sm:gap-3 shrink-0 bg-slate-50 p-2.5 sm:p-3 rounded-lg border border-slate-200 w-full lg:w-auto">
                  <div className="text-center px-1.5 sm:px-2">
                    <span className="block text-[10px] uppercase font-semibold text-slate-400">PTR Rate</span>
                    <span className="text-sm sm:text-base font-bold text-teal-800 font-mono tabular-nums">
                      ₹{promo.ptr.toFixed(2)}
                    </span>
                  </div>
                  <div className="h-8 w-px bg-slate-200" />
                  <div className="text-center px-1.5 sm:px-2">
                    <span className="block text-[10px] uppercase font-semibold text-slate-400">MRP</span>
                    <span className="text-sm sm:text-base font-medium text-slate-500 font-mono tabular-nums">
                      ₹{promo.mrp.toFixed(2)}
                    </span>
                  </div>
                  <div className="h-8 w-px bg-slate-200" />
                  <div className="text-center px-1.5 sm:px-2">
                    <span className="block text-[10px] uppercase font-semibold text-indigo-600">Sample Stock</span>
                    <span className="text-sm sm:text-base font-bold text-indigo-950 font-mono tabular-nums">
                      {promo.sampleAvailable ? `${promo.sampleStock || 'Available'}` : 'On Request'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Middle Grid: Clinical indications & Brochure */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                {/* Clinical indications */}
                <div className="space-y-1.5">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                    <Stethoscope className="w-3.5 h-3.5 text-indigo-600" />
                    Key Clinical Indications
                  </h4>
                  <ul className="text-xs text-slate-700 space-y-1 pl-1">
                    {promo.keyIndications.map((ind, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-indigo-600 font-bold">›</span>
                        <span>{ind}</span>
                      </li>
                    ))}
                  </ul>
                  <p className="text-[11px] text-slate-500 pt-1">
                    Target Doctors: <strong>{promo.targetDoctors}</strong>
                  </p>
                </div>

                {/* Scheme & Brochure */}
                <div className="space-y-2">
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                      <FileCheck className="w-3.5 h-3.5 text-emerald-600" />
                      Retailer Launch Incentive / Scheme
                    </h4>
                    <p className="text-xs font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-1.5 rounded border border-emerald-100 mt-1">
                      {promo.introOffer}
                    </p>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed">
                    {promo.brochureSummary}
                  </p>
                </div>
              </div>

              {/* Bottom: Contact MR & Request Trial */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-3 border-t border-slate-100 text-xs">
                <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-slate-600">
                  <span>Promoted by: <strong className="text-slate-900">{promo.launchedBy}</strong> ({promo.role})</span>
                  <span aria-hidden="true" className="hidden sm:inline">·</span>
                  <span className="font-mono">{promo.contactPhone}</span>
                </div>

                <div className="grid grid-cols-2 sm:flex sm:items-center gap-2 w-full sm:w-auto shrink-0">
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
                    href={`tel:${promo.contactPhone}`}
                    className="inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors min-h-[40px]"
                  >
                    <Phone className="w-4 h-4 text-slate-600" />
                    <span>Call</span>
                  </a>

                  <button
                    type="button"
                    onClick={() => onOpenSampleInquiry(promo.tabletName, promo.launchedBy, promo.contactPhone)}
                    className="col-span-2 sm:col-span-1 inline-flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-indigo-700 hover:bg-indigo-800 rounded-md transition-colors shadow-2xs min-h-[40px]"
                  >
                    <Send className="w-4 h-4" />
                    <span>Request Doctor Samples</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Launch New Tablet Modal */}
      {showLaunchModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-2xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-slate-200 max-w-2xl w-full p-6 shadow-xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between pb-3 border-b border-slate-200">
              <div>
                <span className="text-xs font-bold text-indigo-700 uppercase tracking-wider">
                  MR & Agency Promotion Center
                </span>
                <h3 className="text-lg font-bold text-slate-900 mt-0.5">
                  Launch New Release Tablet Campaign
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Fill in the molecule details, doctor indications, and introductory retail scheme to broadcast to all pharmacies.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowLaunchModal(false)}
                className="text-slate-400 hover:text-slate-700 font-semibold p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleLaunchSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Tablet Brand Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={tabletName}
                    onChange={(e) => setTabletName(e.target.value)}
                    placeholder="e.g. Nexetra 10mg SR"
                    className="w-full p-2 border border-slate-200 rounded-md focus:outline-indigo-600"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Pharma Manufacturer / Company *
                  </label>
                  <input
                    type="text"
                    required
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    placeholder="e.g. Sun Pharma Industries"
                    className="w-full p-2 border border-slate-200 rounded-md focus:outline-indigo-600"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Generic Salt & Strength *
                </label>
                <input
                  type="text"
                  required
                  value={genericComposition}
                  onChange={(e) => setGenericComposition(e.target.value)}
                  placeholder="e.g. Vonoprazan Fumarate Sustained Release (10mg)"
                  className="w-full p-2 border border-slate-200 rounded-md focus:outline-indigo-600"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Launch Headline / Key Value Proposition *
                </label>
                <input
                  type="text"
                  required
                  value={launchHeadline}
                  onChange={(e) => setLaunchHeadline(e.target.value)}
                  placeholder="e.g. Next-Gen P-CAB Acid Relief: Faster Onset than Conventional PPIs"
                  className="w-full p-2 border border-slate-200 rounded-md focus:outline-indigo-600"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Clinical Indications (comma separated)
                </label>
                <input
                  type="text"
                  value={keyIndications}
                  onChange={(e) => setKeyIndications(e.target.value)}
                  placeholder="e.g. Refractory GERD, Erosive Esophagitis, H. Pylori Regimen"
                  className="w-full p-2 border border-slate-200 rounded-md focus:outline-indigo-600"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Introductory Retail Scheme / Offer
                  </label>
                  <input
                    type="text"
                    value={introOffer}
                    onChange={(e) => setIntroOffer(e.target.value)}
                    placeholder="e.g. 10 + 2 Free Strips + Free Standee"
                    className="w-full p-2 border border-slate-200 rounded-md focus:outline-indigo-600"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Target Doctor Specialty
                  </label>
                  <input
                    type="text"
                    value={targetDoctors}
                    onChange={(e) => setTargetDoctors(e.target.value)}
                    placeholder="e.g. Gastroenterologists, General Physicians"
                    className="w-full p-2 border border-slate-200 rounded-md focus:outline-indigo-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">PTR (₹)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={ptr}
                    onChange={(e) => setPtr(parseFloat(e.target.value) || 0)}
                    className="w-full p-2 border border-slate-200 rounded-md font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">MRP (₹)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={mrp}
                    onChange={(e) => setMrp(parseFloat(e.target.value) || 0)}
                    className="w-full p-2 border border-slate-200 rounded-md font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Doctor Samples</label>
                  <select
                    value={sampleAvailable ? 'yes' : 'no'}
                    onChange={(e) => setSampleAvailable(e.target.value === 'yes')}
                    className="w-full p-2 border border-slate-200 rounded-md"
                  >
                    <option value="yes">Available</option>
                    <option value="no">Not Available</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Sample Stock</label>
                  <input
                    type="number"
                    disabled={!sampleAvailable}
                    value={sampleStock}
                    onChange={(e) => setSampleStock(parseInt(e.target.value, 10) || 0)}
                    className="w-full p-2 border border-slate-200 rounded-md font-mono disabled:opacity-50"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Clinical Summary / Detailing Highlights
                </label>
                <textarea
                  rows={2}
                  value={brochureSummary}
                  onChange={(e) => setBrochureSummary(e.target.value)}
                  placeholder="Key pharmacokinetic advantages, patient compliance highlights, dosing schedule..."
                  className="w-full p-2 border border-slate-200 rounded-md focus:outline-indigo-600"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-100">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Your Name (MR/Agency)</label>
                  <input
                    type="text"
                    value={launchedBy}
                    onChange={(e) => setLaunchedBy(e.target.value)}
                    className="w-full p-2 border border-slate-200 rounded-md"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    className="w-full p-2 border border-slate-200 rounded-md font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">WhatsApp Number</label>
                  <input
                    type="text"
                    value={contactWhatsapp}
                    onChange={(e) => setContactWhatsapp(e.target.value)}
                    className="w-full p-2 border border-slate-200 rounded-md font-mono"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowLaunchModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 text-xs font-bold text-white bg-indigo-700 hover:bg-indigo-800 disabled:opacity-50 rounded-md transition-colors"
                >
                  {isSubmitting ? 'Publishing Launch...' : 'Publish New Tablet Promotion'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
