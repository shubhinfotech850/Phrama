import React, { useState, useRef, useEffect } from 'react';
import { 
  ScanLine, 
  Upload, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  FileText, 
  Trash2, 
  Plus, 
  Layers, 
  ExternalLink,
  Sparkles,
  ArrowRight,
  Camera,
  Image as ImageIcon,
  SwitchCamera,
  X,
  Maximize2
} from 'lucide-react';
import type { Agency, BillScanResult, Product } from '../types/pharmacy';
import { scanBillWithGemini, saveBatchProducts } from '../services/api';

interface BillScannerProps {
  agencies: Agency[];
  onUploadSuccess: () => void;
  onNavigateToStock: () => void;
}

interface EditableBillItem {
  id: string;
  name: string;
  genericName: string;
  category: string;
  dosageForm: string;
  batchNo: string;
  expDate: string;
  packSize: string;
  mrp: number;
  ptr: number;
  qty: number;
  scheme: string;
  company: string;
  included: boolean;
}

export const BillScanner: React.FC<BillScannerProps> = ({
  agencies,
  onUploadSuccess,
  onNavigateToStock,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanStep, setScanStep] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [successCount, setSuccessCount] = useState<number | null>(null);

  // Live in-browser Camera Viewfinder State
  const [isLiveCameraOpen, setIsLiveCameraOpen] = useState(false);
  const [cameraFacing, setCameraFacing] = useState<'environment' | 'user'>('environment');
  const [cameraError, setCameraError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cameraStreamRef = useRef<MediaStream | null>(null);

  // Dual Hidden Inputs: Camera capture & Gallery selection
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  // Extracted Bill Meta
  const [distributorName, setDistributorName] = useState('');
  const [invoiceNo, setInvoiceNo] = useState('');
  const [invoiceDate, setInvoiceDate] = useState('');
  const [gstin, setGstin] = useState('');

  // Target Agency for inventory update
  const [selectedAgencyId, setSelectedAgencyId] = useState<string>(agencies[0]?.id || 'ag-1');

  // Extracted Items
  const [items, setItems] = useState<EditableBillItem[]>([]);
  const [isCommitting, setIsCommitting] = useState(false);

  // Cleanup camera stream on unmount
  useEffect(() => {
    return () => {
      stopLiveCameraStream();
    };
  }, []);

  const stopLiveCameraStream = () => {
    if (cameraStreamRef.current) {
      cameraStreamRef.current.getTracks().forEach(track => track.stop());
      cameraStreamRef.current = null;
    }
  };

  const startLiveCamera = async (facing: 'environment' | 'user' = 'environment') => {
    stopLiveCameraStream();
    setCameraError(null);
    setIsLiveCameraOpen(true);

    try {
      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: { ideal: facing },
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        },
        audio: false
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      cameraStreamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (err: any) {
      console.warn('Live camera access error, falling back to native camera input:', err);
      setCameraError('Unable to open live webcam viewfinder. You can use your device native camera.');
      // Auto fallback to native device camera file picker
      stopLiveCameraStream();
      setIsLiveCameraOpen(false);
      cameraInputRef.current?.click();
    }
  };

  const toggleCameraFacing = () => {
    const nextFacing = cameraFacing === 'environment' ? 'user' : 'environment';
    setCameraFacing(nextFacing);
    startLiveCamera(nextFacing);
  };

  const capturePhotoFromLiveCamera = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current || document.createElement('canvas');

    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.92);

    // Stop camera and set captured photo
    stopLiveCameraStream();
    setIsLiveCameraOpen(false);
    setFile(null);
    setPreviewUrl(dataUrl);
    setError(null);
    setSuccessCount(null);

    // Trigger auto-scan
    triggerScanFromDataUrl(dataUrl);
  };

  const triggerScanFromDataUrl = async (dataUrl: string) => {
    try {
      setIsScanning(true);
      setError(null);
      setSuccessCount(null);
      setScanStep('Gemini 3.8 Flash Vision analyzing captured bill...');

      const base64Data = dataUrl.replace(/^data:image\/\w+;base64,/, '');
      const result = await scanBillWithGemini(base64Data, 'image/jpeg');
      processExtractedData(result);
    } catch (err: any) {
      setError(err.message || 'Failed to scan captured invoice');
    } finally {
      setIsScanning(false);
      setScanStep('');
    }
  };

  // Load sample invoice from generated assets
  const handleLoadSampleBill = async () => {
    try {
      setIsScanning(true);
      setError(null);
      setSuccessCount(null);
      setScanStep('Loading high-resolution sample distributor invoice...');

      const samplePath = '/src/assets/images/pharma_sample_invoice_1792862742662.jpg';
      setPreviewUrl(samplePath);

      // Fetch the sample image and convert to base64
      const response = await fetch(samplePath);
      const blob = await response.blob();
      const reader = new FileReader();

      reader.onloadend = async () => {
        try {
          const base64data = reader.result as string;
          setScanStep('Sending invoice to Gemini 3.8 Flash Vision OCR...');
          
          const result = await scanBillWithGemini(base64data, blob.type || 'image/jpeg');
          processExtractedData(result);
        } catch (scanErr: any) {
          setError(scanErr.message || 'Error scanning bill');
        } finally {
          setIsScanning(false);
          setScanStep('');
        }
      };

      reader.readAsDataURL(blob);
    } catch (err: any) {
      setError('Could not load sample bill: ' + err.message);
      setIsScanning(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      setFile(selected);
      setError(null);
      setSuccessCount(null);

      const objectUrl = URL.createObjectURL(selected);
      setPreviewUrl(objectUrl);
    }
  };

  const handleStartScan = async () => {
    if (!previewUrl) return;

    try {
      setIsScanning(true);
      setError(null);
      setSuccessCount(null);
      setScanStep('Encoding invoice document...');

      let base64String = '';
      let mimeType = 'image/jpeg';

      if (file) {
        mimeType = file.type || 'image/jpeg';
        const reader = new FileReader();
        base64String = await new Promise((resolve, reject) => {
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
      } else if (previewUrl) {
        // Sample bill path
        const res = await fetch(previewUrl);
        const blob = await res.blob();
        mimeType = blob.type || 'image/jpeg';
        const reader = new FileReader();
        base64String = await new Promise((resolve, reject) => {
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        });
      }

      setScanStep('Gemini 3.8 Flash Vision analyzing tax invoice line items...');
      const result = await scanBillWithGemini(base64String, mimeType);
      processExtractedData(result);
    } catch (err: any) {
      setError(err.message || 'Failed to scan invoice document');
    } finally {
      setIsScanning(false);
      setScanStep('');
    }
  };

  const processExtractedData = (result: BillScanResult) => {
    setDistributorName(result.distributorName || 'Apex Pharmaceutical Distributors Pvt. Ltd.');
    setInvoiceNo(result.invoiceNo || `AP-INV-${Math.floor(1000 + Math.random() * 9000)}`);
    setInvoiceDate(result.invoiceDate || new Date().toISOString().split('T')[0]);
    setGstin(result.gstin || '07AAACW567881Z0');

    const mappedItems: EditableBillItem[] = (result.items || []).map((it, idx) => ({
      id: `scanned-${idx}-${Date.now()}`,
      name: it.name,
      genericName: it.genericName || it.name,
      category: inferCategory(it.name),
      dosageForm: inferDosage(it.name),
      batchNo: it.batchNo || `BT-${Math.floor(1000 + Math.random() * 9000)}`,
      expDate: it.expDate || '2027-12',
      packSize: it.packSize || '1 x 10 Tablets (Strip)',
      mrp: Number(it.mrp) || 100,
      ptr: Number(it.ptr) || 70,
      qty: Number(it.qty) || 50,
      scheme: it.scheme || 'Regular Rate',
      company: it.company || 'Standard Pharma Corp',
      included: true,
    }));

    setItems(mappedItems);
  };

  const inferCategory = (name: string): string => {
    const n = name.toLowerCase();
    if (n.includes('paracetamol') || n.includes('dolo') || n.includes('aceclo') || n.includes('apenasin')) return 'Analgesic & Antipyretic';
    if (n.includes('amoxicillin') || n.includes('augmentin') || n.includes('biostein') || n.includes('cef')) return 'Antibiotic';
    if (n.includes('atorva') || n.includes('telma') || n.includes('statin')) return 'Cardiovascular';
    if (n.includes('pan') || n.includes('panto') || n.includes('omeprazole')) return 'Antacid / PPI';
    return 'General Medicine';
  };

  const inferDosage = (name: string): string => {
    const n = name.toLowerCase();
    if (n.includes('cap')) return 'Capsule';
    if (n.includes('syr') || n.includes('liquid')) return 'Syrup';
    if (n.includes('inj')) return 'Injection';
    return 'Tablet';
  };

  const handleItemChange = (id: string, field: keyof EditableBillItem, value: any) => {
    setItems(prev => prev.map(item => {
      if (item.id === id) {
        return { ...item, [field]: value };
      }
      return item;
    }));
  };

  const handleAddItemRow = () => {
    const newItem: EditableBillItem = {
      id: `manual-row-${Date.now()}`,
      name: '',
      genericName: '',
      category: 'General Medicine',
      dosageForm: 'Tablet',
      batchNo: `BT-${Math.floor(1000 + Math.random() * 9000)}`,
      expDate: '2027-12',
      packSize: '1 x 10 Tablets (Strip)',
      mrp: 100,
      ptr: 70,
      qty: 50,
      scheme: '10 + 1 Free',
      company: 'Cipla Ltd.',
      included: true,
    };
    setItems(prev => [...prev, newItem]);
  };

  const handleDeleteItem = (id: string) => {
    setItems(prev => prev.filter(i => i.id !== id));
  };

  // Commit verified extracted items to database
  const handleCommitToDatabase = async () => {
    const itemsToSave = items.filter(i => i.included && i.name.trim());
    if (itemsToSave.length === 0) {
      setError('Please select at least one valid medicine row to add to inventory.');
      return;
    }

    try {
      setIsCommitting(true);
      setError(null);

      const targetAgency = agencies.find(a => a.id === selectedAgencyId) || agencies[0];

      const productsToCreate: Array<Omit<Product, 'id' | 'updatedAt'>> = itemsToSave.map(item => {
        const mrp = Number(item.mrp) || 1;
        const ptr = Number(item.ptr) || 1;
        const margin = mrp > ptr ? Math.round(((mrp - ptr) / mrp) * 100 * 10) / 10 : 25;

        return {
          name: item.name.trim(),
          genericName: item.genericName.trim() || item.name.trim(),
          category: item.category,
          dosageForm: item.dosageForm,
          packSize: item.packSize,
          batchNo: item.batchNo,
          mfgDate: new Date().toISOString().split('T')[0],
          expDate: item.expDate.length === 5 ? `20${item.expDate.split('/')[1]}-${item.expDate.split('/')[0]}-01` : item.expDate,
          mrp,
          ptr,
          marginPercent: margin,
          stockQty: Number(item.qty) || 50,
          minOrderQty: 10,
          agencyId: targetAgency.id,
          agencyName: targetAgency.name,
          agencyCity: targetAgency.city,
          agencyAddress: `${targetAgency.city} Central Stockist Hub`,
          mrName: targetAgency.contactPerson,
          mrPhone: targetAgency.phone,
          company: item.company || 'Verified Pharma',
          scheme: item.scheme,
          isNewRelease: false,
          verified: true,
          source: 'bill_scan',
          billReference: invoiceNo || `INV-${Date.now()}`
        };
      });

      const saved = await saveBatchProducts(productsToCreate);
      setSuccessCount(saved.length);
      onUploadSuccess();
    } catch (err: any) {
      setError(err.message || 'Failed to update database with scanned products');
    } finally {
      setIsCommitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Title & Context */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Scan Distributor Bill & Auto-Update Database
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            MRs and Agencies can upload any wholesale tax invoice or stock receipt. Gemini Vision AI automatically parses medicine rows, PTR, MRP, batches, and syncs your live stock.
          </p>
        </div>

        {/* Action button to test sample invoice */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleLoadSampleBill}
            disabled={isScanning}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-teal-800 bg-teal-50 hover:bg-teal-100 border border-teal-200 rounded-md transition-colors"
          >
            <Sparkles className="w-4 h-4 text-teal-600" />
            <span>Load Sample Distributor Bill</span>
          </button>
        </div>
      </div>

      {/* Success Banner */}
      {successCount !== null && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg flex items-start justify-between gap-4 animate-in fade-in">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-semibold text-emerald-900">
                Successfully Added {successCount} Medicine Items to Live Database!
              </h4>
              <p className="text-xs text-emerald-700 mt-0.5">
                All retail chemists and medical stores can now search, discover, and order these products directly from your stock.
              </p>
            </div>
          </div>
          <button
            onClick={onNavigateToStock}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-md whitespace-nowrap shrink-0 transition-colors"
          >
            <span>View in Stock List</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Error Banner */}
      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-lg flex items-start gap-3 text-rose-800 text-sm">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-semibold text-rose-900">Scan Error</p>
            <p className="text-xs text-rose-700 mt-0.5">{error}</p>
          </div>
        </div>
      )}

      {/* Upload Zone & Document Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Bill Dropzone / Preview */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white p-5 rounded-lg border border-slate-200 space-y-4">
            <h3 className="text-sm font-semibold text-slate-900 flex items-center justify-between">
              <span>Invoice Document</span>
              {previewUrl && (
                <button
                  onClick={() => {
                    setFile(null);
                    setPreviewUrl(null);
                    setItems([]);
                    setSuccessCount(null);
                  }}
                  className="text-xs text-slate-500 hover:text-slate-800"
                >
                  Clear
                </button>
              )}
            </h3>

            {previewUrl ? (
              <div className="space-y-3">
                <div className="relative rounded-lg overflow-hidden border border-slate-200 bg-slate-100 max-h-80 flex items-center justify-center">
                  <img
                    src={previewUrl}
                    alt="Uploaded pharmacy bill"
                    className="w-full h-auto object-contain max-h-72"
                    referrerPolicy="no-referrer"
                  />
                  {isScanning && (
                    <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-xs flex flex-col items-center justify-center p-4 text-center">
                      <RefreshCw className="w-8 h-8 text-teal-400 animate-spin mb-3" />
                      <p className="text-sm font-semibold text-white">Analyzing Invoice</p>
                      <p className="text-xs text-slate-300 mt-1 max-w-xs">{scanStep}</p>
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={handleStartScan}
                    disabled={isScanning}
                    className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 disabled:opacity-50 rounded-md transition-colors shadow-xs min-h-[42px]"
                  >
                    <ScanLine className="w-4 h-4" />
                    <span>{isScanning ? 'Extracting Rows...' : 'Re-Scan This Bill'}</span>
                  </button>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        // On mobile, native camera is best; on desktop, offer live viewfinder
                        if (/Mobi|Android|iPhone/i.test(navigator.userAgent)) {
                          cameraInputRef.current?.click();
                        } else {
                          startLiveCamera('environment');
                        }
                      }}
                      className="inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors min-h-[40px]"
                    >
                      <Camera className="w-4 h-4 text-slate-600" />
                      <span>Retake Photo</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => galleryInputRef.current?.click()}
                      className="inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors min-h-[40px]"
                    >
                      <ImageIcon className="w-4 h-4 text-slate-600" />
                      <span>From Gallery</span>
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="border-2 border-dashed border-slate-300 rounded-lg p-5 text-center bg-slate-50/60 flex flex-col items-center justify-center">
                  <div className="w-12 h-12 rounded-full bg-teal-100 flex items-center justify-center text-teal-700 mb-2.5">
                    <ScanLine className="w-6 h-6" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-800">
                    Upload or Snap Pharmacy Bill
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5 max-w-xs">
                    कॅमेऱ्याने फोटो काढा किंवा गॅलरीमधून बिल निवडा
                  </p>

                  {/* Dual Action Buttons: Camera Photo + Gallery */}
                  <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-2.5 mt-4">
                    {/* Option 1: Take Photo with Camera */}
                    <button
                      type="button"
                      onClick={() => {
                        // Detect mobile vs desktop: mobile opens native camera directly, desktop can launch live viewfinder
                        if (/Mobi|Android|iPhone/i.test(navigator.userAgent)) {
                          cameraInputRef.current?.click();
                        } else {
                          startLiveCamera('environment');
                        }
                      }}
                      className="w-full inline-flex items-center justify-center gap-2 px-3.5 py-2.5 text-xs font-bold text-white bg-teal-700 hover:bg-teal-800 rounded-lg transition-colors shadow-xs min-h-[44px]"
                    >
                      <Camera className="w-4 h-4" />
                      <div className="text-left">
                        <span className="block leading-tight">Take Photo (Camera)</span>
                        <span className="text-[10px] font-normal opacity-90 block">फोटो काढा</span>
                      </div>
                    </button>

                    {/* Option 2: Choose from Gallery / Files */}
                    <button
                      type="button"
                      onClick={() => galleryInputRef.current?.click()}
                      className="w-full inline-flex items-center justify-center gap-2 px-3.5 py-2.5 text-xs font-bold text-slate-800 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg transition-colors shadow-2xs min-h-[44px]"
                    >
                      <ImageIcon className="w-4 h-4 text-teal-700" />
                      <div className="text-left">
                        <span className="block leading-tight">Select from Gallery</span>
                        <span className="text-[10px] font-normal text-slate-500 block">गॅलरीमधून निवडा</span>
                      </div>
                    </button>
                  </div>

                  {/* Secondary Quick Option: Live in-browser webcam toggle */}
                  <div className="mt-3 pt-3 border-t border-slate-200/70 w-full flex items-center justify-between text-xs">
                    <button
                      type="button"
                      onClick={() => startLiveCamera('environment')}
                      className="text-teal-700 hover:text-teal-900 font-semibold flex items-center gap-1 text-[11px]"
                    >
                      <Maximize2 className="w-3.5 h-3.5" />
                      <span>Open Live Camera Viewfinder</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleLoadSampleBill}
                      className="text-slate-500 hover:text-slate-800 font-medium text-[11px]"
                    >
                      Try Sample Bill
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Hidden Input 1: Native Mobile Camera Capture (opens camera directly on smartphones) */}
            <input
              ref={cameraInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleFileChange}
              className="hidden"
            />

            {/* Hidden Input 2: Gallery / Files Picker */}
            <input
              ref={galleryInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />

            {/* Target Agency Assignment */}
            <div className="pt-2 border-t border-slate-100">
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Assign Stock To Agency / MR
              </label>
              <select
                value={selectedAgencyId}
                onChange={e => setSelectedAgencyId(e.target.value)}
                className="w-full text-xs bg-white border border-slate-200 rounded-md px-3 py-2 text-slate-800 focus:outline-teal-600"
              >
                {agencies.map(ag => (
                  <option key={ag.id} value={ag.id}>
                    {ag.name} ({ag.role} - {ag.city})
                  </option>
                ))}
              </select>
              <p className="text-[11px] text-slate-400 mt-1">
                Medical stores ordering these medicines will contact this selected stockist.
              </p>
            </div>
          </div>
        </div>

        {/* Right: Extracted Data Review Matrix */}
        <div className="lg:col-span-8 space-y-4">
          <div className="bg-white p-5 rounded-lg border border-slate-200 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-teal-600" />
                  <span>Extracted Invoice Line Items</span>
                  <span className="text-xs font-medium text-slate-500">
                    ({items.length} items detected)
                  </span>
                </h3>
                {distributorName && (
                  <p className="text-xs text-slate-500 mt-0.5">
                    Supplier: <strong className="text-slate-800">{distributorName}</strong> · Inv: {invoiceNo} · Date: {invoiceDate}
                  </p>
                )}
              </div>

              {items.length > 0 && (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleAddItemRow}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Item</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleCommitToDatabase}
                    disabled={isCommitting}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 disabled:opacity-50 rounded-md shadow-xs transition-colors"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{isCommitting ? 'Updating Database...' : 'Auto-Update in DB'}</span>
                  </button>
                </div>
              )}
            </div>

            {/* Extracted items: Responsive Desktop Table + Mobile Touch Cards */}
            {items.length > 0 ? (
              <div className="space-y-3">
                {/* Mobile View Notice / Scroll Hint */}
                <div className="md:hidden flex items-center justify-between text-[11px] text-slate-500 pb-1">
                  <span>Review and edit items below before updating database:</span>
                  <span className="font-semibold text-teal-700">{items.filter(i => i.included).length} active</span>
                </div>

                {/* Mobile Touch Cards (shown on screens < 768px) */}
                <div className="md:hidden space-y-3">
                  {items.map((item) => {
                    const mrp = Number(item.mrp) || 0;
                    const ptr = Number(item.ptr) || 0;
                    const margin = mrp > ptr && mrp > 0 ? Math.round(((mrp - ptr) / mrp) * 100 * 10) / 10 : 0;

                    return (
                      <div
                        key={item.id}
                        className={`p-3.5 rounded-lg border transition-all ${
                          item.included
                            ? 'bg-slate-50/70 border-slate-200'
                            : 'bg-slate-100/60 border-slate-200 opacity-60'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <label className="flex items-center gap-2 cursor-pointer flex-1">
                            <input
                              type="checkbox"
                              checked={item.included}
                              onChange={e => handleItemChange(item.id, 'included', e.target.checked)}
                              className="w-4 h-4 rounded text-teal-600 focus:ring-teal-500 shrink-0"
                            />
                            <div className="flex-1">
                              <input
                                type="text"
                                value={item.name}
                                onChange={e => handleItemChange(item.id, 'name', e.target.value)}
                                placeholder="Medicine name"
                                className="w-full text-xs font-bold text-slate-900 border border-slate-200 rounded px-2 py-1 bg-white focus:outline-teal-600"
                              />
                            </div>
                          </label>

                          <button
                            type="button"
                            onClick={() => handleDeleteItem(item.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 rounded shrink-0 min-h-[36px] min-w-[36px] flex items-center justify-center"
                            title="Remove"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        {/* Generic Salt Input */}
                        <div className="mt-2 pl-6">
                          <input
                            type="text"
                            value={item.genericName}
                            onChange={e => handleItemChange(item.id, 'genericName', e.target.value)}
                            placeholder="Generic composition"
                            className="w-full text-[11px] text-slate-600 border border-slate-200 rounded px-2 py-1 bg-white focus:outline-teal-600"
                          />
                        </div>

                        {/* Batch, Exp, Qty Grid */}
                        <div className="grid grid-cols-3 gap-2 mt-2.5 pl-6">
                          <div>
                            <span className="block text-[10px] uppercase font-semibold text-slate-400">Batch</span>
                            <input
                              type="text"
                              value={item.batchNo}
                              onChange={e => handleItemChange(item.id, 'batchNo', e.target.value)}
                              className="w-full text-xs font-mono border border-slate-200 rounded px-1.5 py-1 bg-white"
                            />
                          </div>

                          <div>
                            <span className="block text-[10px] uppercase font-semibold text-slate-400">Expiry</span>
                            <input
                              type="text"
                              value={item.expDate}
                              onChange={e => handleItemChange(item.id, 'expDate', e.target.value)}
                              className="w-full text-xs font-mono border border-slate-200 rounded px-1.5 py-1 bg-white"
                            />
                          </div>

                          <div>
                            <span className="block text-[10px] uppercase font-semibold text-slate-400">Stock Qty</span>
                            <input
                              type="number"
                              value={item.qty}
                              onChange={e => handleItemChange(item.id, 'qty', parseInt(e.target.value, 10) || 0)}
                              className="w-full text-xs font-mono font-bold text-slate-900 border border-slate-200 rounded px-1.5 py-1 bg-white"
                            />
                          </div>
                        </div>

                        {/* Financials & Scheme */}
                        <div className="grid grid-cols-3 gap-2 mt-2 pl-6 items-center">
                          <div>
                            <span className="block text-[10px] uppercase font-semibold text-slate-400">PTR (₹)</span>
                            <input
                              type="number"
                              step="0.1"
                              value={item.ptr}
                              onChange={e => handleItemChange(item.id, 'ptr', parseFloat(e.target.value) || 0)}
                              className="w-full text-xs font-mono font-bold text-teal-800 border border-slate-200 rounded px-1.5 py-1 bg-white"
                            />
                          </div>

                          <div>
                            <span className="block text-[10px] uppercase font-semibold text-slate-400">MRP (₹)</span>
                            <input
                              type="number"
                              step="0.1"
                              value={item.mrp}
                              onChange={e => handleItemChange(item.id, 'mrp', parseFloat(e.target.value) || 0)}
                              className="w-full text-xs font-mono text-slate-600 border border-slate-200 rounded px-1.5 py-1 bg-white"
                            />
                          </div>

                          <div className="text-center bg-teal-50/80 p-1 rounded border border-teal-100">
                            <span className="block text-[9px] uppercase font-semibold text-teal-700">Margin</span>
                            <span className="text-xs font-bold text-teal-900 font-mono">
                              {margin > 0 ? `${margin}%` : '—'}
                            </span>
                          </div>
                        </div>

                        {/* Scheme */}
                        <div className="mt-2 pl-6">
                          <input
                            type="text"
                            value={item.scheme}
                            onChange={e => handleItemChange(item.id, 'scheme', e.target.value)}
                            placeholder="Scheme (e.g. 10 + 1 Free)"
                            className="w-full text-[11px] text-emerald-800 border border-slate-200 rounded px-2 py-1 bg-white placeholder-slate-400"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Desktop High-Density Table (shown on screens >= 768px) */}
                <div className="hidden md:block overflow-x-auto -mx-5 px-5">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 font-semibold">
                        <th className="py-2.5 px-2 w-8 text-center">Inc.</th>
                        <th className="py-2.5 px-3 min-w-[180px]">Medicine / Salt Name</th>
                        <th className="py-2.5 px-2 min-w-[90px]">Batch No</th>
                        <th className="py-2.5 px-2 min-w-[70px]">Exp Date</th>
                        <th className="py-2.5 px-2 min-w-[80px] text-right">MRP (₹)</th>
                        <th className="py-2.5 px-2 min-w-[80px] text-right">PTR (₹)</th>
                        <th className="py-2.5 px-2 min-w-[70px] text-right">Margin</th>
                        <th className="py-2.5 px-2 min-w-[70px] text-right">Qty</th>
                        <th className="py-2.5 px-3 min-w-[120px]">Scheme / Offer</th>
                        <th className="py-2.5 px-2 w-10 text-center"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {items.map((item) => {
                        const mrp = Number(item.mrp) || 0;
                        const ptr = Number(item.ptr) || 0;
                        const margin = mrp > ptr && mrp > 0 ? Math.round(((mrp - ptr) / mrp) * 100 * 10) / 10 : 0;

                        return (
                          <tr
                            key={item.id}
                            className={`hover:bg-slate-50/80 transition-colors ${
                              !item.included ? 'opacity-40 bg-slate-50' : ''
                            }`}
                          >
                            <td className="py-2 px-2 text-center">
                              <input
                                type="checkbox"
                                checked={item.included}
                                onChange={e => handleItemChange(item.id, 'included', e.target.checked)}
                                className="rounded text-teal-600 focus:ring-teal-500"
                              />
                            </td>

                            {/* Name & Composition */}
                            <td className="py-2 px-3">
                              <input
                                type="text"
                                value={item.name}
                                onChange={e => handleItemChange(item.id, 'name', e.target.value)}
                                placeholder="e.g. Dolo 650"
                                className="w-full font-semibold text-slate-900 border border-transparent hover:border-slate-300 focus:border-teal-500 rounded px-1.5 py-1 bg-transparent"
                              />
                              <input
                                type="text"
                                value={item.genericName}
                                onChange={e => handleItemChange(item.id, 'genericName', e.target.value)}
                                placeholder="Generic salt composition"
                                className="w-full text-[11px] text-slate-500 border border-transparent hover:border-slate-300 focus:border-teal-500 rounded px-1.5 py-0.5 bg-transparent"
                              />
                            </td>

                            {/* Batch No */}
                            <td className="py-2 px-2 font-mono text-[11px]">
                              <input
                                type="text"
                                value={item.batchNo}
                                onChange={e => handleItemChange(item.id, 'batchNo', e.target.value)}
                                className="w-full border border-transparent hover:border-slate-300 focus:border-teal-500 rounded px-1.5 py-1 bg-transparent font-mono"
                              />
                            </td>

                            {/* Expiry */}
                            <td className="py-2 px-2 font-mono text-[11px]">
                              <input
                                type="text"
                                value={item.expDate}
                                onChange={e => handleItemChange(item.id, 'expDate', e.target.value)}
                                className="w-full border border-transparent hover:border-slate-300 focus:border-teal-500 rounded px-1.5 py-1 bg-transparent font-mono"
                              />
                            </td>

                            {/* MRP */}
                            <td className="py-2 px-2 text-right">
                              <input
                                type="number"
                                step="0.1"
                                value={item.mrp}
                                onChange={e => handleItemChange(item.id, 'mrp', parseFloat(e.target.value) || 0)}
                                className="w-full text-right border border-transparent hover:border-slate-300 focus:border-teal-500 rounded px-1.5 py-1 font-mono tabular-nums bg-transparent"
                              />
                            </td>

                            {/* PTR */}
                            <td className="py-2 px-2 text-right">
                              <input
                                type="number"
                                step="0.1"
                                value={item.ptr}
                                onChange={e => handleItemChange(item.id, 'ptr', parseFloat(e.target.value) || 0)}
                                className="w-full text-right font-semibold text-teal-700 border border-transparent hover:border-slate-300 focus:border-teal-500 rounded px-1.5 py-1 font-mono tabular-nums bg-transparent"
                              />
                            </td>

                            {/* Retailer Margin */}
                            <td className="py-2 px-2 text-right font-mono tabular-nums text-slate-700 font-semibold">
                              {margin > 0 ? `${margin}%` : '—'}
                            </td>

                            {/* Quantity */}
                            <td className="py-2 px-2 text-right">
                              <input
                                type="number"
                                value={item.qty}
                                onChange={e => handleItemChange(item.id, 'qty', parseInt(e.target.value, 10) || 0)}
                                className="w-full text-right border border-transparent hover:border-slate-300 focus:border-teal-500 rounded px-1.5 py-1 font-mono tabular-nums bg-transparent"
                              />
                            </td>

                            {/* Scheme */}
                            <td className="py-2 px-3">
                              <input
                                type="text"
                                value={item.scheme}
                                onChange={e => handleItemChange(item.id, 'scheme', e.target.value)}
                                placeholder="e.g. 10 + 1 Free"
                                className="w-full text-[11px] border border-transparent hover:border-slate-300 focus:border-teal-500 rounded px-1.5 py-1 bg-transparent"
                              />
                            </td>

                            {/* Delete */}
                            <td className="py-2 px-2 text-center">
                              <button
                                type="button"
                                onClick={() => handleDeleteItem(item.id)}
                                className="text-slate-400 hover:text-rose-600 p-1 rounded transition-colors"
                                title="Remove item"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="py-12 text-center border-2 border-dashed border-slate-200 rounded-lg bg-slate-50/50">
                <FileText className="w-10 h-10 text-slate-400 mx-auto mb-2" />
                <p className="text-sm font-semibold text-slate-800">
                  No Line Items Loaded Yet
                </p>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  Click <strong>&quot;Load Sample Distributor Bill&quot;</strong> or upload your own wholesale tax invoice photo on the left to extract stock items.
                </p>
              </div>
            )}

            {items.length > 0 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-100">
                <span className="text-xs text-slate-500">
                  Selected <strong className="text-slate-800">{items.filter(i => i.included).length}</strong> of {items.length} items to sync into database
                </span>

                <button
                  type="button"
                  onClick={handleCommitToDatabase}
                  disabled={isCommitting}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 disabled:opacity-50 rounded-md shadow-xs transition-colors"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{isCommitting ? 'Committing to Inventory...' : 'Confirm & Auto-Update Database'}</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Live Camera Viewfinder Modal (Webcam & Smartphone Camera Viewfinder) */}
      {isLiveCameraOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex flex-col items-center justify-between p-4 sm:p-6 animate-in fade-in duration-200">
          {/* Top Bar */}
          <div className="w-full max-w-2xl flex items-center justify-between text-white pb-3">
            <div className="flex items-center gap-2">
              <Camera className="w-5 h-5 text-teal-400" />
              <div>
                <h4 className="text-sm font-bold leading-tight">Live Bill Camera Scanner</h4>
                <p className="text-[11px] text-slate-300">बिल कॅमेऱ्यासमोर सरळ धरा</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={toggleCameraFacing}
                className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
                title="Switch Camera (Rear / Front)"
              >
                <SwitchCamera className="w-5 h-5" />
              </button>

              <button
                type="button"
                onClick={() => {
                  stopLiveCameraStream();
                  setIsLiveCameraOpen(false);
                }}
                className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
                title="Close Camera"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Viewfinder Video with Framing Guides */}
          <div className="relative w-full max-w-2xl flex-1 flex items-center justify-center overflow-hidden rounded-xl bg-black border border-white/20 shadow-2xl">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover max-h-[65vh]"
            />

            {/* Document Framing Box Guides */}
            <div className="absolute inset-4 sm:inset-8 border-2 border-dashed border-teal-400/80 rounded-lg pointer-events-none flex flex-col justify-between p-4 shadow-[0_0_0_9999px_rgba(0,0,0,0.4)]">
              <div className="flex justify-between">
                <div className="w-6 h-6 border-t-4 border-l-4 border-teal-400" />
                <div className="w-6 h-6 border-t-4 border-r-4 border-teal-400" />
              </div>
              <div className="text-center">
                <span className="bg-black/70 text-white text-xs px-3 py-1 rounded-full font-medium tracking-wide">
                  Hold bill steady inside the box · बिल बॉक्समध्ये ठेवा
                </span>
              </div>
              <div className="flex justify-between">
                <div className="w-6 h-6 border-b-4 border-l-4 border-teal-400" />
                <div className="w-6 h-6 border-b-4 border-r-4 border-teal-400" />
              </div>
            </div>

            {/* Hidden canvas for taking snapshot */}
            <canvas ref={canvasRef} className="hidden" />
          </div>

          {/* Shutter Capture Button */}
          <div className="w-full max-w-2xl flex items-center justify-center pt-4 pb-2">
            <button
              type="button"
              onClick={capturePhotoFromLiveCamera}
              className="w-18 h-18 rounded-full border-4 border-white bg-teal-500 hover:bg-teal-400 active:scale-95 flex items-center justify-center shadow-lg transition-transform focus:outline-none"
              title="Capture Bill Photo"
            >
              <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center">
                <Camera className="w-7 h-7 text-teal-800" />
              </div>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
