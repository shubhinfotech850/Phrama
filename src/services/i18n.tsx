import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';

export type Language = 'en' | 'hi' | 'mr';

interface LanguageContextValue {
  lang: Language;
  setLang: (l: Language) => void;
  t: (key: string, vars?: Record<string, string | number>) => string;
}

const LanguageContext = createContext<LanguageContextValue | undefined>(undefined);

const STORAGE_KEY = 'pharmabridge_lang';

function getInitialLang(): Language {
  if (typeof window === 'undefined') return 'en';
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'en' || stored === 'hi' || stored === 'mr') return stored;
  } catch {
    // ignore
  }
  return 'en';
}

// Translations. Keys are dot-path strings. Missing keys fall back to English,
// then to the key itself, so the UI never shows "undefined".
const translations: Record<Language, Record<string, string>> = {
  en: {
    'app.name': 'PharmaBridge',
    'app.tagline': 'Pharma Stockist Network',
    'app.footerNote': 'Verified distributors · Direct WhatsApp ordering',

    'role.store': 'Store',
    'role.storeFull': 'Medical Store',
    'role.mrAgency': 'MR / Agency',
    'role.mrAgencyFull': 'MR & Agency',

    'nav.search': 'Search',
    'nav.searchFull': 'Search Medicines',
    'nav.newReleases': 'New Releases',
    'nav.stockists': 'Stockists',
    'nav.dashboard': 'Dashboard',
    'nav.stock': 'Stock',
    'nav.scanBill': 'Scan Bill',

    'theme.light': 'Light',
    'theme.dark': 'Dark',
    'action.signOut': 'Sign Out',
    'action.retry': 'Retry',

    'load.connecting': 'Loading your pharmacy workspace…',
    'error.connectionTitle': 'Connection Error',

    'login.subtitle': 'Sign in to the MR & Agency Stock Network — your pharmaceutical discovery portal.',
    'login.title': 'Secure Sign In',
    'login.subtitle2': 'Enter your registered User ID and 4-digit PIN.',
    'login.userId': 'User ID',
    'login.userIdPlaceholder': 'Enter your User ID',
    'login.pin': '4-Digit PIN',
    'login.errorBoth': 'Please enter both your User ID and PIN.',
    'login.errorInvalid': 'Invalid User ID or PIN. Please try again.',
    'login.signingIn': 'Signing in...',
    'login.signIn': 'Sign In',
    'login.testCreds': 'Test Credentials',
    'login.autoFill': 'Auto-fill test credentials →',
    'login.compliance': 'FDA & Drug Control Compliant · Verified Wholesale Network',

    'search.title': 'Find medicines in stock',
    'search.subtitle': 'Search by brand or salt to see which agencies have stock, compare rates, and order directly.',
    'search.placeholder': 'Search brand (Dolo, Augmentin) or salt (Paracetamol, Amoxicillin)…',
    'search.clear': 'Clear',
    'search.category': 'Category:',
    'search.city': 'City:',
    'search.inStock': 'In Stock',
    'search.results': 'Showing {count} available medicine stock listings',
    'search.newReleasesTitle': 'New tablet launches & doctor samples',
    'search.newReleasesBody': 'See the latest molecules launched by MRs and agencies, with introductory schemes and trial kits.',
    'search.viewNewReleases': 'View New Releases',
    'search.noResults': 'No Medicines Match "{query}"',
    'search.noResultsBody': 'Try searching by the generic salt name (e.g. Paracetamol, Amoxicillin, Pantoprazole) or clear category filters.',
    'search.resetFilters': 'Reset All Filters',

    'promos.title': 'New Releases & MR Campaigns',
    'promos.subtitle': 'Browse the latest tablet launches. To publish your own campaign, switch to the MR / Agency workspace.',
    'promos.launch': 'Launch New Tablet Promotion',
  },
  hi: {
    'app.name': 'फार्माब्रिज',
    'app.tagline': 'फार्मा स्टॉकिस्ट नेटवर्क',
    'app.footerNote': 'सत्यापित वितरक · सीधे व्हाट्सऐप ऑर्डरिंग',

    'role.store': 'स्टोर',
    'role.storeFull': 'मेडिकल स्टोर',
    'role.mrAgency': 'एमआर / एजेंसी',
    'role.mrAgencyFull': 'एमआर और एजेंसी',

    'nav.search': 'खोज',
    'nav.searchFull': 'दवाइयाँ खोजें',
    'nav.newReleases': 'नई रिलीज',
    'nav.stockists': 'स्टॉकिस्ट',
    'nav.dashboard': 'डैशबोर्ड',
    'nav.stock': 'स्टॉक',
    'nav.scanBill': 'बिल स्कैन',

    'theme.light': 'लाइट',
    'theme.dark': 'डार्क',
    'action.signOut': 'साइन आउट',
    'action.retry': 'पुनः प्रयास',

    'load.connecting': 'आपका फार्मेसी वर्कस्पेस लोड हो रहा है…',
    'error.connectionTitle': 'कनेक्शन त्रुटि',

    'login.subtitle': 'एमआर और एजेंसी स्टॉक नेटवर्क में साइन इन करें — आपका फार्मास्युटिकल खोज पोर्टल।',
    'login.title': 'सुरक्षित साइन इन',
    'login.subtitle2': 'अपना पंजीकृत यूज़र आईडी और 4-अंकों का पिन दर्ज करें।',
    'login.userId': 'यूज़र आईडी',
    'login.userIdPlaceholder': 'अपना यूज़र आईडी दर्ज करें',
    'login.pin': '4-अंकों का पिन',
    'login.errorBoth': 'कृपया अपना यूज़र आईडी और पिन दोनों दर्ज करें।',
    'login.errorInvalid': 'ग़लत यूज़र आईडी या पिन। कृपया पुनः प्रयास करें।',
    'login.signingIn': 'साइन इन हो रहा है...',
    'login.signIn': 'साइन इन',
    'login.testCreds': 'टेस्ट क्रेडेंशियल',
    'login.autoFill': 'टेस्ट क्रेडेंशियल स्वतः भरें →',
    'login.compliance': 'एफडीए और ड्रग कंट्रोल अनुपालन · सत्यापित थोक नेटवर्क',

    'search.title': 'स्टॉक में दवाइयाँ खोजें',
    'search.subtitle': 'ब्रांड या साल्ट से खोजें कि किन एजेंसियों के पास स्टॉक है, दरें तुलनाएँ, और सीधे ऑर्डर करें।',
    'search.placeholder': 'ब्रांड (डोलो, ऑगमेंटिन) या साल्ट (पैरासिटामोल, एमोक्सिसिलिन) खोजें…',
    'search.clear': 'साफ़ करें',
    'search.category': 'श्रेणी:',
    'search.city': 'शहर:',
    'search.inStock': 'स्टॉक में',
    'search.results': '{count} उपलब्ध दवा स्टॉक लिस्टिंग दिख रही हैं',
    'search.newReleasesTitle': 'नई टेबलेट लॉन्च और डॉक्टर सैंपल',
    'search.newReleasesBody': 'एमआर और एजेंसियों द्वारा लॉन्च किए गए नए मोलेक्यूल देखें, परिचयात्मक स्कीम और ट्रायल किट के साथ।',
    'search.viewNewReleases': 'नई रिलीज़ देखें',
    'search.noResults': '"{query}" से कोई दवा मेल नहीं खाती',
    'search.noResultsBody': 'सामान्य साल्ट नाम से खोजें (जैसे पैरासिटामोल, एमोक्सिसिलिन, पैंटोप्राजोल) या श्रेणी फ़िल्टर साफ़ करें।',
    'search.resetFilters': 'सभी फ़िल्टर रीसेट करें',

    'promos.title': 'नई रिलीज़ और एमआर अभियान',
    'promos.subtitle': 'नई टेबलेट लॉन्च देखें। अपना अभियान प्रकाशित करने के लिए एमआर / एजेंसी वर्कस्पेस में स्विच करें।',
    'promos.launch': 'नई टेबलेट प्रमोशन लॉन्च करें',
  },
  mr: {
    'app.name': 'फार्माब्रिज',
    'app.tagline': 'फार्मा स्टॉकिस्ट नेटवर्क',
    'app.footerNote': 'सत्यापित वितरक · थेट व्हॅट्सॲप ऑर्डरिंग',

    'role.store': 'स्टोअर',
    'role.storeFull': 'मेडिकल स्टोअर',
    'role.mrAgency': 'एमआर / एजन्सी',
    'role.mrAgencyFull': 'एमआर आणि एजन्सी',

    'nav.search': 'शोध',
    'nav.searchFull': 'औषधे शोधा',
    'nav.newReleases': 'नवीन रिलीज',
    'nav.stockists': 'स्टॉकिस्ट',
    'nav.dashboard': 'डॅशबोर्ड',
    'nav.stock': 'स्टॉक',
    'nav.scanBill': 'बिल स्कॅन',

    'theme.light': 'लाइट',
    'theme.dark': 'डार्क',
    'action.signOut': 'साइन आउट',
    'action.retry': 'पुन्हा प्रयत्न',

    'load.connecting': 'तुमचे फार्मसी वर्कस्पेस लोड होत आहे…',
    'error.connectionTitle': 'कनेक्शन त्रुटी',

    'login.subtitle': 'एमआर आणि एजन्सी स्टॉक नेटवर्कमध्ये साइन इन करा — तुमचे फार्मास्युटिकल शोध पोर्टल.',
    'login.title': 'सुरक्षित साइन इन',
    'login.subtitle2': 'तुमचा नोंदणीकृत युजर आयडी आणि 4-अंकी पिन टाका.',
    'login.userId': 'युजर आयडी',
    'login.userIdPlaceholder': 'तुमचा युजर आयडी टाका',
    'login.pin': '4-अंकी पिन',
    'login.errorBoth': 'कृपया युजर आयडी आणि पिन दोन्ही टाका.',
    'login.errorInvalid': 'चुकीचा युजर आयडी किंवा पिन. कृपया पुन्हा प्रयत्न करा.',
    'login.signingIn': 'साइन इन होत आहे...',
    'login.signIn': 'साइन इन',
    'login.testCreds': 'चाचणी क्रेडेंशियल',
    'login.autoFill': 'चाचणी क्रेडेंशियल आपोआप भरा →',
    'login.compliance': 'एफडीए आणि ड्रग कंट्रोल पालन · सत्यापित घाऊक नेटवर्क',

    'search.title': 'स्टॉकमध्ये औषधे शोधा',
    'search.subtitle': 'ब्रँड किंवा साल्टने शोधा कोणत्या एजन्सीकडे स्टॉक आहे, दर तुलना करा आणि थेट ऑर्डर करा.',
    'search.placeholder': 'ब्रँड (डोलो, ऑगमेंटिन) किंवा साल्ट (पॅरासिटामॉल, अमोक्सिसिलिन) शोधा…',
    'search.clear': 'साफ करा',
    'search.category': 'श्रेणी:',
    'search.city': 'शहर:',
    'search.inStock': 'स्टॉकमध्ये',
    'search.results': '{count} उपलब्ध औषध स्टॉक याद्या दिसत आहेत',
    'search.newReleasesTitle': 'नवीन टॅबलेट लॉन्च आणि डॉक्टर सॅम्पल',
    'search.newReleasesBody': 'एमआर आणि एजन्सींनी लॉन्च केलेले नवीन मोलेक्यूल पहा, परिचयात्मक स्कीम आणि ट्रायल किटसह.',
    'search.viewNewReleases': 'नवीन रिलीज पहा',
    'search.noResults': '"{query}" शी कोणतीही औषध जुळत नाही',
    'search.noResultsBody': 'सामान्य साल्ट नावाने शोधा (उदा. पॅरासिटामॉल, अमोक्सिसिलिन, पँटोप्राझोल) किंवा श्रेणी फिल्टर साफ करा.',
    'search.resetFilters': 'सर्व फिल्टर रीसेट करा',

    'promos.title': 'नवीन रिलीज आणि एमआर मोहिम',
    'promos.subtitle': 'नवीन टॅबलेट लॉन्च पहा. तुमची मोहिम प्रकाशित करण्यासाठी एमआर / एजन्सी वर्कस्पेसमध्ये स्विच करा.',
    'promos.launch': 'नवीन टॅबलेट प्रमोशन लॉन्च करा',
  },
};

function translate(lang: Language, key: string, vars?: Record<string, string | number>): string {
  const dict = translations[lang] || translations.en;
  let str = dict[key] ?? translations.en[key] ?? key;
  if (vars) {
    for (const [k, v] of Object.entries(vars)) {
      str = str.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v));
    }
  }
  return str;
}

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lang, setLangState] = useState<Language>(getInitialLang);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch {
      // ignore
    }
    document.documentElement.lang = lang;
  }, [lang]);

  const setLang = useCallback((l: Language) => setLangState(l), []);
  const t = useCallback(
    (key: string, vars?: Record<string, string | number>) => translate(lang, key, vars),
    [lang]
  );

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export function useI18n(): LanguageContextValue {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useI18n must be used within a LanguageProvider');
  return ctx;
}

export const LANGUAGES: { code: Language; label: string; short: string }[] = [
  { code: 'en', label: 'English', short: 'EN' },
  { code: 'hi', label: 'हिन्दी', short: 'हि' },
  { code: 'mr', label: 'मराठी', short: 'म' },
];
