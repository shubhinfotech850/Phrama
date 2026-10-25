import React, { useState } from 'react';
import { Send, CheckCircle2, Building2, Package, Tag, Phone } from 'lucide-react';
import type { Product } from '../types/pharmacy';
import { submitOrderInquiry } from '../services/api';

interface InquiryModalProps {
  product: Product | null;
  onClose: () => void;
  onSuccess: () => void;
}

export const InquiryModal: React.FC<InquiryModalProps> = ({
  product,
  onClose,
  onSuccess,
}) => {
  if (!product) return null;

  const [medicalStoreName, setMedicalStoreName] = useState('Sanjivani Chemist & Druggist');
  const [pharmacistName, setPharmacistName] = useState('Kailash Mehta');
  const [phone, setPhone] = useState('+91 98221 00412');
  const [city, setCity] = useState('Mumbai');
  const [requestedQty, setRequestedQty] = useState(25);
  const [notes, setNotes] = useState('Please apply 10+1 scheme if eligible and confirm evening delivery slot.');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const estimatedTotal = (requestedQty * product.ptr);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      await submitOrderInquiry({
        medicalStoreName: medicalStoreName.trim(),
        pharmacistName: pharmacistName.trim(),
        phone: phone.trim(),
        city: city.trim(),
        productId: product.id,
        productName: product.name,
        requestedQty: Number(requestedQty),
        agencyId: product.agencyId,
        agencyName: product.agencyName,
        mrName: product.mrName,
        mrPhone: product.mrPhone,
        notes: notes.trim(),
      });
      setSubmitted(true);
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1500);
    } catch (err: any) {
      alert('Failed to submit order inquiry: ' + err.message);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-2xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-xl border border-slate-200 max-w-lg w-full p-4 sm:p-6 shadow-xl space-y-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-start justify-between pb-3 border-b border-slate-200">
          <div>
            <span className="text-xs font-bold text-teal-700 uppercase tracking-wider">
              Purchase Order Inquiry
            </span>
            <h3 className="text-base sm:text-lg font-bold text-slate-900 mt-0.5">
              Order {product.name}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Stockist: <strong>{product.agencyName}</strong> (MR: {product.mrName})
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 font-semibold p-1.5 rounded-md min-h-[36px] min-w-[36px] flex items-center justify-center"
          >
            ✕
          </button>
        </div>

        {submitted ? (
          <div className="py-8 text-center space-y-2 animate-in fade-in">
            <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
            <h4 className="text-base font-bold text-slate-900">
              Inquiry Sent to Agency!
            </h4>
            <p className="text-xs text-slate-500 max-w-xs mx-auto">
              {product.agencyName} and MR {product.mrName} have received your order request and will contact you via WhatsApp / phone to confirm dispatch.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            {/* Product summary strip */}
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1.5">
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Formulation:</span>
                <span className="font-medium text-slate-800 text-right truncate max-w-[200px]">{product.genericName}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Pack Size:</span>
                <span className="font-medium text-slate-800">{product.packSize}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">PTR (Price to Retailer):</span>
                <span className="font-bold text-teal-800 font-mono">₹{product.ptr.toFixed(2)}</span>
              </div>
              {product.scheme && (
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Applicable Scheme:</span>
                  <span className="font-bold text-emerald-700 text-right">{product.scheme}</span>
                </div>
              )}
            </div>

            {/* Chemist / Pharmacy Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Medical Store / Chemist Name *
                </label>
                <input
                  type="text"
                  required
                  value={medicalStoreName}
                  onChange={(e) => setMedicalStoreName(e.target.value)}
                  className="w-full p-2.5 border border-slate-200 rounded-md focus:outline-teal-600 text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Pharmacist Contact Name *
                </label>
                <input
                  type="text"
                  required
                  value={pharmacistName}
                  onChange={(e) => setPharmacistName(e.target.value)}
                  className="w-full p-2.5 border border-slate-200 rounded-md focus:outline-teal-600 text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Phone / WhatsApp Number *
                </label>
                <input
                  type="text"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full p-2.5 border border-slate-200 rounded-md font-mono focus:outline-teal-600 text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Pharmacy City / Location *
                </label>
                <input
                  type="text"
                  required
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full p-2.5 border border-slate-200 rounded-md focus:outline-teal-600 text-xs"
                />
              </div>
            </div>

            {/* Requested Quantity */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center p-3 bg-teal-50/60 rounded-lg border border-teal-100">
              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  Requested Quantity (Units/Strips)
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={requestedQty}
                  onChange={(e) => setRequestedQty(parseInt(e.target.value, 10) || 1)}
                  className="w-full p-2 border border-teal-200 bg-white rounded-md font-mono text-sm font-bold text-teal-900 focus:outline-teal-600 min-h-[40px]"
                />
              </div>

              <div className="sm:text-right">
                <span className="block text-[11px] text-slate-500 font-semibold uppercase">Est. Order Value</span>
                <span className="text-lg font-bold text-teal-900 font-mono tabular-nums">
                  ₹{estimatedTotal.toFixed(2)}
                </span>
                <span className="text-[10px] text-slate-400 block">+ GST & Scheme deduction</span>
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Notes / Instructions for MR
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full p-2.5 border border-slate-200 rounded-md focus:outline-teal-600 text-xs"
              />
            </div>

            <div className="pt-3 border-t border-slate-200 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2 sm:gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:text-slate-800 min-h-[42px] flex items-center justify-center"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center justify-center gap-1.5 px-5 py-2.5 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 disabled:opacity-50 rounded-md transition-colors min-h-[42px]"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isSubmitting ? 'Sending Request...' : 'Send Order Inquiry'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
