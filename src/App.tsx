import React, { useState, useEffect } from 'react';
import { getTranslation } from './lib/translations';
import { 
  getProperties, 
  getFavorites, 
  toggleFavorite, 
  initDB, 
  getMaintenanceServices, 
  getReviews, 
  addReview,
  addProperty,
  deleteProperty,
  clearAllProperties,
  resetPropertiesToDefault
} from './lib/db';
import { Property, Language } from './types';
import { safeLocalStorage as localStorage, safeSessionStorage as sessionStorage, safeScrollTo } from './lib/storage';
import { sendRequest } from './lib/firebase';
import { SplashScreen } from './components/SplashScreen';
import { ServicesDirectory } from './components/ServicesDirectory';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { PropertyCard } from './components/PropertyCard';
import { ServiceCard } from './components/ServiceCard';
import { Logo } from './components/Logo';
import { motion } from 'motion/react';

import { FirstScreenForm } from './components/FirstScreenForm';
import { PropertySkeletonGrid } from './components/PropertySkeletonGrid';
import { PropertyDetailsModal } from './components/PropertyDetailsModal';
import { 
  Phone, Mail, MapPin, Search, Filter, RefreshCw, Star, 
  ArrowUp, Sparkles, Building2, ShieldCheck, Heart, Laptop, 
  Compass, ShieldAlert, BadgeCheck, CheckCircle, Settings, Trash2, Plus, X, Eraser,
  Home, GraduationCap, Building, Wrench, Info, Users, Handshake, KeyRound
} from 'lucide-react';

export default function App() {
  // Application Lifecycle and Settings
  const [showSplash, setShowSplash] = useState(true);
  const [showGate, setShowGate] = useState(true);
  const [lang, setLang] = useState<Language>('ar');
  const [darkMode, setDarkMode] = useState(false);
  const [currentTab, setCurrentTab] = useState('home');
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Database datasets
  const [allProperties, setAllProperties] = useState<Property[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  
  // Search and Filter variables
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterPriceMax, setFilterPriceMax] = useState<number>(0);
  const [filterRooms, setFilterRooms] = useState<number>(0);
  const [filterAreaMin, setFilterAreaMin] = useState<number>(0);
  const [studentGenderTab, setStudentGenderTab] = useState<'all' | 'male' | 'female'>('all');

  // Property management admin panel states
  const isAdminOpen = false;
  const setIsAdminOpen = (val: boolean) => {};
  const [adminTitleAr, setAdminTitleAr] = useState('');
  const [adminTitleEn, setAdminTitleEn] = useState('');
  const [adminDescAr, setAdminDescAr] = useState('');
  const [adminDescEn, setAdminDescEn] = useState('');
  const [adminLocAr, setAdminLocAr] = useState('');
  const [adminLocEn, setAdminLocEn] = useState('');
  const [adminPrice, setAdminPrice] = useState<number>(2000);
  const [adminCategory, setAdminCategory] = useState<'student_housing' | 'family_rentals' | 'property_sales'>('student_housing');
  const [adminType, setAdminType] = useState<string>('student_male');
  const [adminRooms, setAdminRooms] = useState<number>(3);
  const [adminBathrooms, setAdminBathrooms] = useState<number>(2);
  const [adminArea, setAdminArea] = useState<number>(120);
  const [adminBeds, setAdminBeds] = useState<number>(1);
  const [adminAmenitiesAr, setAdminAmenitiesAr] = useState('واي فاي سريع, أمان كامل, تكييف');
  const [adminAmenitiesEn, setAdminAmenitiesEn] = useState('High-speed WiFi, Full security, Air Conditioning');
  const [adminImageUrls, setAdminImageUrls] = useState('');
  const [adminPriceLabelAr, setAdminPriceLabelAr] = useState('');
  const [adminPriceLabelEn, setAdminPriceLabelEn] = useState('');

  // Interactive dynamic stats counters (simulated animate counters)
  const [stats, setStats] = useState({ clients: 1450, properties: 128, sales: 88, repairs: 435 });

  // Fullscreen view for brand design mockup
  const [isFullscreenImageOpen, setIsFullscreenImageOpen] = useState(false);
  const [brandImageZoom, setBrandImageZoom] = useState(1);

  // Floating notifications / CTA
  const [globalToast, setGlobalToast] = useState('');

  // Contact form submission
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactMessage, setContactMessage] = useState('');
  const [contactSuccess, setContactSuccess] = useState(false);

  // Initialize data on mount
  useEffect(() => {
    initDB();
    setAllProperties(getProperties());
    setFavorites(getFavorites());

    // Fetch fresh property data from server API to stay in sync with CMS edits
    fetch('/api/properties')
      .then(res => {
        if (res.ok) return res.json();
        throw new Error('Failed to fetch api');
      })
      .then(data => {
        if (Array.isArray(data)) {
          localStorage.setItem('dark_properties', JSON.stringify(data));
          // Filter out user-flagged mock properties
          const cleanProps = data.filter(p => {
            const title = p.title_ar || '';
            const isFake = 
              title.includes("سكن النخبة") ||
              title.includes("دار السلام الفاخرة") ||
              title.includes("شقة دوبلكس عائلية") ||
              title.includes("شقة ملكية") ||
              title.includes("مجمع تجاري إداري") ||
              title.includes("فيلا رويال") ||
              title.includes("شقة فاخرة للإيجار") ||
              title.includes("كورنيش النيل مباشرة") ||
              title.includes("شقة عائلية واسعة للإيجار") ||
              title.includes("مصنع الغزل") ||
              title.includes("شقة دوبلكس راقية") ||
              title.includes("قنا الجديدة") ||
              title.includes("شقة تمليك ممتازة") ||
              title.includes("مصطفى كامل") ||
              title.includes("فيلا مستقلة راقية") ||
              p.id === "prop-family-1" ||
              p.id === "prop-family-2" ||
              p.id === "prop-family-3";
            return !isFake;
          });
          setAllProperties(cleanProps);
        }
      })
      .catch(err => console.log("Using cached localStorage properties:", err));

    // Load language preference
    const storedLang = localStorage.getItem('dark_lang') as Language;
    if (storedLang) {
      setLang(storedLang);
    }

    // Force session clear on page load to log user out immediately upon refresh/reload
    sessionStorage.removeItem('dark_user_profile');
    sessionStorage.removeItem('dark_user_profile_timestamp');
    setShowGate(true);

    // Load dark mode preference
    const storedTheme = localStorage.getItem('dark_theme');
    const isDark = storedTheme === 'true' || (!storedTheme && typeof window !== 'undefined' && typeof window.matchMedia === 'function' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    setDarkMode(isDark);
    if (isDark) {
      document.documentElement.classList.add('dark');
    }

    // Increment stats slightly for dynamic premium visual vibe
    const statTimer = setTimeout(() => {
      setStats({ clients: 1450, properties: 128, sales: 88, repairs: 435 });
    }, 1500);

    return () => {
      clearTimeout(statTimer);
    };
  }, []);

  // Handle dark mode flip
  const handleDarkModeToggle = () => {
    const nextDark = !darkMode;
    setDarkMode(nextDark);
    localStorage.setItem('dark_theme', String(nextDark));
    if (nextDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  // Handle language switch
  const handleLanguageChange = (newLang: Language) => {
    setLang(newLang);
    localStorage.setItem('dark_lang', newLang);
  };

  // Reset critical search filters when navigating to different structural sections/tabs
  useEffect(() => {
    setSearchQuery('');
    setFilterType('all');
    setFilterPriceMax(0);
    setFilterRooms(0);
    setFilterAreaMin(0);
    if (currentTab === 'student_housing') {
      setStudentGenderTab('all');
    }
  }, [currentTab]);

  // Handle registration skip from First Screen
  const handleRegistrationComplete = (chosenLang: Language, selectedService?: string) => {
    setLang(chosenLang);
    setShowGate(false);
    setAllProperties(getProperties());
    setFavorites(getFavorites());
    
    // Redirect customer to the main home page ('home') instead of the selected service
    setCurrentTab('home');
  };

  // Navigates elegantly to sub-services applying the selected filter
  const handleServicesNavigation = (tabId: string, filters?: any) => {
    setCurrentTab(tabId);
    
    // Reset secondary search states to make view focused
    setSearchQuery('');
    setFilterPriceMax(0);
    setFilterRooms(0);
    setFilterAreaMin(0);

    if (tabId === 'student_housing') {
      if (filters && filters.gender) {
        setStudentGenderTab(filters.gender);
      } else {
        setStudentGenderTab('all');
      }
    } else if (tabId === 'family_rentals') {
      if (filters && filters.type) {
        setFilterType(filters.type);
      } else {
        setFilterType('all');
      }
    } else if (tabId === 'property_sales') {
      if (filters && filters.type) {
        setFilterType(filters.type);
      } else {
        setFilterType('all');
      }
    } else if (tabId === 'maintenance_services') {
      if (filters && filters.category) {
        // Find by category name
        setSearchQuery(filters.category);
      }
    }
    
    window.scrollTo({ top: 300, behavior: 'smooth' });
  };

  // Dynamic refresh of all database datasets and system settings
  const handleRefresh = async () => {
    if (isRefreshing) return;
    setIsRefreshing(true);
    try {
      // 1. Fetch fresh property data from server API
      const propsRes = await fetch('/api/properties');
      if (propsRes.ok) {
        const propsData = await propsRes.json();
        if (Array.isArray(propsData)) {
          localStorage.setItem('dark_properties', JSON.stringify(propsData));
        }
      }

      // 2. Fetch fresh maintenance data from server API
      const maintRes = await fetch('/api/maintenance');
      if (maintRes.ok) {
        const maintData = await maintRes.json();
        if (Array.isArray(maintData)) {
          localStorage.setItem('dark_maintenance', JSON.stringify(maintData));
        }
      }

      // 3. Fetch fresh reviews data from server API
      const reviewsRes = await fetch('/api/reviews');
      if (reviewsRes.ok) {
        const reviewsData = await reviewsRes.json();
        if (Array.isArray(reviewsData)) {
          localStorage.setItem('dark_reviews', JSON.stringify(reviewsData));
        }
      }

      // Update state with newly refreshed data
      setAllProperties(getProperties());
      
      triggerToast(lang === 'ar' ? 'تم تحديث البيانات بنجاح.' : 'Data updated successfully.');
    } catch (err) {
      console.error("Refresh failed, using cached properties:", err);
      triggerToast(lang === 'ar' ? 'فشل تحديث البيانات، تم استخدام النسخة الاحتياطية.' : 'Refresh failed, using local cache.');
    } finally {
      // Keep rotation animation going for at least 1000ms for premium aesthetic feel
      setTimeout(() => {
        setIsRefreshing(false);
        handleLogout();
      }, 1000);
    }
  };

  // Handle logout / return to login page
  const handleLogout = () => {
    sessionStorage.removeItem('dark_user_profile');
    sessionStorage.removeItem('dark_user_profile_timestamp');
    setShowGate(true);
    triggerToast(lang === 'ar' ? 'تم العودة لصفحة تسجيل الدخول بنجاح!' : 'Returned to login screen successfully!');
  };

  // Admin database control handlers
  const handleClearAll = () => {
    clearAllProperties();
    setAllProperties([]);
    triggerToast(lang === 'ar' ? 'تم مسح كافة البيانات والصور التجريبية بنجاح! الموقع فارغ الآن ومستعد لبياناتك.' : 'All placeholder and fake listings successfully cleared! Location is prime and empty for your uploads.');
  };

  const handleRestoreDemo = () => {
    resetPropertiesToDefault();
    setAllProperties(getProperties());
    triggerToast(lang === 'ar' ? 'تم توريد نماذج هيكلية تجريبية لدراسة التصميم!' : 'Demo skeletal templates restored!');
  };

  const handleDelete = (id: string, name: string) => {
    deleteProperty(id);
    setAllProperties(getProperties());
    triggerToast(lang === 'ar' ? `تم مسح عقار "${name}" بنجاح!` : `Property "${name}" deleted successfully!`);
  };

  const handleAddPropertySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminTitleAr || !adminTitleEn || !adminLocAr || !adminLocEn) {
      triggerToast(lang === 'ar' ? 'فضلاً املأ حقليْ العنوان والموقع بالعربية والإنجليزية!' : 'Please supply titles and locations in both Arabic and English!');
      return;
    }

    let images: string[] = [];
    if (adminImageUrls.trim()) {
      images = adminImageUrls.split(',').map(url => url.trim()).filter(url => url.length > 0);
    }

    const amenitiesAr = adminAmenitiesAr.split(',').map(x => x.trim()).filter(x => x.length > 0);
    const amenitiesEn = adminAmenitiesEn.split(',').map(x => x.trim()).filter(x => x.length > 0);

    addProperty({
      title_ar: adminTitleAr,
      title_en: adminTitleEn,
      description_ar: adminDescAr,
      description_en: adminDescEn,
      location_ar: adminLocAr,
      location_en: adminLocEn,
      price: Number(adminPrice) || 0,
      type: adminType as any,
      category: adminCategory,
      status: 'available',
      imageUrls: images,
      rooms: Number(adminRooms) || 1,
      bathrooms: Number(adminBathrooms) || 1,
      area: Number(adminArea) || 50,
      beds: adminCategory === 'student_housing' ? (Number(adminBeds) || 1) : undefined,
      amenities_ar: amenitiesAr,
      amenities_en: amenitiesEn,
      priceLabel_ar: adminPriceLabelAr || undefined,
      priceLabel_en: adminPriceLabelEn || undefined
    });

    setAllProperties(getProperties());
    setIsAdminOpen(false);

    // Reset fields
    setAdminTitleAr('');
    setAdminTitleEn('');
    setAdminDescAr('');
    setAdminDescEn('');
    setAdminLocAr('');
    setAdminLocEn('');
    setAdminImageUrls('');
    setAdminPriceLabelAr('');
    setAdminPriceLabelEn('');
    
    triggerToast(lang === 'ar' ? `تم إضافة العقار "${adminTitleAr}" بنجاح للأرشيف!` : `Successfully added "${adminTitleEn}" to active records!`);
  };

  // Toggle favorite
  const handleFavoriteToggle = (id: string) => {
    toggleFavorite(id);
    setFavorites(getFavorites());
  };

  // Contact Form submit
  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await sendRequest(contactName, contactEmail, `استفسار تواصل معنا: ${contactMessage}`);
      setContactSuccess(true);
      setContactName('');
      setContactEmail('');
      setContactMessage('');
      setTimeout(() => setContactSuccess(false), 5000);
    } catch (err) {
      console.error(err);
      triggerToast(lang === 'ar' ? 'فصلًا تحقق من اتصالك بالشبكة وأعد المحاولة.' : 'Error sending message, check network and try again.');
    }
  };

  // Clear query and advanced filters
  const handleClearFilters = () => {
    setSearchQuery('');
    setFilterType('all');
    setFilterPriceMax(0);
    setFilterRooms(0);
    setFilterAreaMin(0);
    setStudentGenderTab('all');
  };

  // Helper trigger action message
  const triggerToast = (msg: string) => {
    setGlobalToast(msg);
    setTimeout(() => setGlobalToast(''), 4000);
  };

  // Filter application listings logic
  const getFilteredProperties = () => {
    return allProperties.filter((p) => {
      // 1. Text Search query matching (matches title, location, descriptions)
      const query = searchQuery.toLowerCase().trim();
      const matchQuery = !query || 
        p.title_ar.toLowerCase().includes(query) || 
        p.title_en.toLowerCase().includes(query) ||
        p.location_ar.toLowerCase().includes(query) ||
        p.location_en.toLowerCase().includes(query);

      // 2. Tab filters based on category
      let matchTab = true;
      if (currentTab === 'student_housing') {
        matchTab = p.category === 'student_housing';
        // Sub gender tab filter
        if (studentGenderTab === 'male') {
          matchTab = matchTab && p.type === 'student_male';
        } else if (studentGenderTab === 'female') {
          matchTab = matchTab && p.type === 'student_female';
        }
      } else if (currentTab === 'family_rentals') {
        matchTab = p.category === 'family_rentals';
      } else if (currentTab === 'property_sales') {
        matchTab = p.category === 'property_sales';
      }

      // 3. Advanced property type selection
      const matchType = currentTab === 'student_housing' ? true : (filterType === 'all' || p.type === filterType);

      // 4. Pricing limit
      const matchPrice = !filterPriceMax || p.price <= filterPriceMax;

      // 5. Rooms configuration
      const matchRooms = !filterRooms || p.rooms === filterRooms;

      // 6. Area configuration
      const matchArea = !filterAreaMin || p.area >= filterAreaMin;

      return matchQuery && matchTab && matchType && matchPrice && matchRooms && matchArea;
    });
  };

  // Render Splash Screen
  if (showSplash) {
    return <SplashScreen onComplete={() => setShowSplash(false)} />;
  }

  // Render First Screen Gate Registration
  if (showGate) {
    return (
      <FirstScreenForm 
        onComplete={handleRegistrationComplete} 
        onRefresh={handleRefresh}
        isRefreshing={isRefreshing}
      />
    );
  }

  const isRtl = lang === 'ar';
  const filteredListings = getFilteredProperties();
  const sampleReviews = getReviews();

  return (
    <div 
      className={`min-h-screen bg-[#F5F7FA] dark:bg-slate-950 text-slate-800 dark:text-slate-100 font-sans pb-24 lg:pb-0`}
      dir={isRtl ? 'rtl' : 'ltr'}
    >
      {/* Toast Notification Alert */}
      {globalToast && (
        <div className="fixed top-8 left-1/2 -translate-x-1/2 z-max bg-[#163B63] border-2 border-[#C9A14A] text-white px-5 py-3.5 rounded-xl shadow-xl flex items-center gap-2 animate-bounce">
          <CheckCircle className="w-5 h-5 text-[#C9A14A]" />
          <span className="text-sm font-semibold">{globalToast}</span>
        </div>
      )}

      {/* Floating back-to-top dynamic button */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className="fixed bottom-24 lg:bottom-8 right-6 z-30 p-3.5 rounded-full bg-[#163B63] text-[#C9A14A] shadow-xl hover:scale-110 active:scale-95 transition-all outline-none border border-[#C9A14A]/25 cursor-pointer"
        title="الرجوع للأعلى"
      >
        <ArrowUp className="w-5 h-5 animate-pulse" />
      </button>

      {/* Gated Floating WhatsApp Contact button */}
      <motion.a
        href="https://wa.me/201124151496"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-24 lg:bottom-8 left-6 z-30 flex items-center gap-3 pl-4 pr-3 py-2.5 rounded-2xl bg-slate-950/90 backdrop-blur-md border border-[#C9A14A]/40 text-white shadow-[0_12px_40px_rgba(0,0,0,0.6)] hover:border-emerald-400 group cursor-pointer transition-all duration-300 select-none"
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -4, scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        title={getTranslation(lang, 'whatsappSystemLabel')}
      >
        {/* Pulsing Elegant Outer Luxury Rings */}
        <div className="absolute -inset-0.5 rounded-2xl bg-gradient-to-r from-[#C9A14A]/20 to-emerald-500/20 blur-md opacity-75 group-hover:opacity-100 transition-opacity" />
        
        {/* Animated Green Contact Signal Dot */}
        <div className="relative flex h-3 w-3 shrink-0">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500 border border-slate-950"></span>
        </div>

        {/* Floating WhatsApp Logo Wrapper with luxury styling */}
        <div className="relative w-8.5 h-8.5 rounded-xl bg-gradient-to-br from-emerald-600 to-emerald-500/90 flex items-center justify-center text-white shadow-inner group-hover:from-emerald-500 group-hover:to-[#C9A14A] transition-all duration-500 shrink-0">
          <svg className="w-5 h-5 fill-current text-white filter drop-shadow-sm" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M12.004 2c-5.51 0-9.99 4.49-9.99 9.99 0 1.76.46 3.48 1.33 5l-1.4 5.12 5.25-1.37c1.47.8 3.12 1.23 4.81 1.23 5.51 0 9.99-4.48 9.99-9.99a9.99 9.99 0 0 0-10-9.98zm5.83 14.16c-.24.68-1.21 1.24-1.68 1.29-.46.06-.9.23-2.92-.58-2.42-.97-3.95-3.41-4.07-3.57-.12-.17-1.02-1.35-1.02-2.58 0-1.22.64-1.83.87-2.07.23-.24.5-.3.67-.3.17 0 .34 0 .49.01.16.01.37-.06.58.45.21.52.73 1.77.79 1.9.06.12.1.27.02.44-.08.17-.18.28-.3.44-.12.15-.26.34-.37.46-.12.13-.25.27-.11.51.14.24.63 1.03 1.35 1.67.92.83 1.7 1.08 1.94 1.2.24.12.38.1.52-.06.14-.17.61-.71.77-.95.16-.24.33-.2.55-.12.23.09 1.45.69 1.7.81.25.12.41.18.47.29.07.11.07.65-.17 1.33z" />
          </svg>
        </div>

        {/* Luxury content text */}
        <div className="flex flex-col text-right font-sans select-none pr-1">
          <span className="text-[10px] font-extrabold text-[#C9A14A] leading-none font-arabic tracking-wide flex items-center gap-1">
            {isRtl ? 'المستشار العقاري مباشر' : 'Real-estate Advisor'}
          </span>
          <span className="text-[9px] font-extrabold text-slate-300 group-hover:text-white transition-colors duration-200 mt-1 font-arabic">
            {isRtl ? 'تواصل معنا الآن للحجز الاستباقي ⚡' : 'Connect now to lock book'}
          </span>
        </div>
      </motion.a>

      {/* Main Structural Sticky Header */}
      <Header
        lang={lang}
        onLanguageChange={handleLanguageChange}
        darkMode={darkMode}
        onDarkModeToggle={handleDarkModeToggle}
        onLogout={handleLogout}
        currentTab={currentTab}
        onTabChange={setCurrentTab}
        favoritesCount={favorites.length}
        onRefresh={handleRefresh}
        isRefreshing={isRefreshing}
      />

      {/* Master View Router Engine */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
        
        {/* VIEW 1: HOME PAGE */}
        {currentTab === 'home' && (
          <div className="space-y-16 animate-fadeIn">
            {/* Parallax Panoramic Luxury Hero Visual Section */}
            <section className="relative rounded-3xl overflow-hidden bg-slate-900 border border-[#C9A14A]/25 min-h-[440px] sm:min-h-[500px] flex items-center justify-center text-center p-6 py-12 sm:p-12 sm:py-20 shadow-2xl">
              {/* Dynamic Property Photo Background */}
              <div 
                className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-40 transform scale-103 hover:scale-100 transition-all duration-[8000ms]"
                style={{ backgroundImage: `url('https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1600&q=80')` }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/60 to-transparent" />

              {/* Glowing Ambient Backdrop Aura */}
              <div className="absolute top-1/2 -translate-y-1/2 w-72 h-72 bg-[#C9A14A]/10 rounded-full blur-3xl pointer-events-none" />

              <div className="relative z-10 max-w-5xl w-full">
                <div className="space-y-6 max-w-3xl mx-auto">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-[#C9A14A]/30 text-white text-[11px] font-semibold tracking-wider">
                    <Sparkles className="w-3.5 h-3.5 text-[#C9A14A] animate-spin duration-[5000ms]" />
                    <span>{getTranslation(lang, 'appName')} // 2026</span>
                  </div>

                  <h1 className="text-3xl sm:text-5xl font-black text-white leading-tight font-arabic tracking-wide">
                    {getTranslation(lang, 'slogan')}
                  </h1>

                  <p className="text-sm sm:text-lg text-gray-200 font-light max-w-xl mx-auto leading-relaxed">
                    {getTranslation(lang, 'tagline')}
                  </p>

                  {/* Call to Actions CTA */}
                  <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
                    <button
                      onClick={() => {
                        const element = document.getElementById('hero-services-section');
                        if (element) {
                          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        } else {
                          window.scrollTo({ top: 400, behavior: 'smooth' });
                        }
                      }}
                      className="px-6 py-3.5 bg-gradient-to-r from-[#C9A14A] to-[#E3C380] text-[#163B63] font-bold text-sm rounded-xl cursor-pointer shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all"
                    >
                      {getTranslation(lang, 'startNow')}
                    </button>
                    <button
                      onClick={() => {
                        setCurrentTab('services');
                        window.scrollTo({ top: 100, behavior: 'smooth' });
                      }}
                      className="px-6 py-3.5 bg-white/10 hover:bg-white/15 text-white border border-white/20 hover:border-white/30 backdrop-blur-md font-bold text-sm rounded-xl cursor-pointer transition-all"
                    >
                      {getTranslation(lang, 'browseProperties')}
                    </button>
                  </div>
                </div>
              </div>
            </section>

            {/* Primary Service Cards grid (خارج صورة الهيرو تماماً بناء على طلب المستخدم) */}
            <div id="hero-services-section" className="scroll-mt-24 grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mt-4 sm:mt-6">
              {[
                {
                  id: 'student_housing',
                  ar: 'سكن الطلاب والطالبات',
                  en: 'Student Housing',
                  arSub: 'سكن مجهز بالكامل',
                  enSub: 'Fully Equipped Dorms',
                  icon: GraduationCap,
                  bgImage: 'https://lh3.googleusercontent.com/d/1U9Oi9WnNoUFDyybzAGGNj8xi6o8kll8T',
                },
                    {
                      id: 'family_rentals',
                      ar: 'إيجارات شقق أهالي',
                      en: 'Family Rentals',
                      arSub: 'إيجار شهري وسنوي',
                      enSub: 'Monthly & Annual Rentals',
                      icon: KeyRound,
                      bgImage: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=600&q=80',
                    },
                    {
                      id: 'property_sales',
                      ar: 'شقق تمليك',
                      en: 'Property Sales',
                      arSub: 'شقق، عمائر وفلل',
                      enSub: 'Apartments, Buildings & Villas',
                      icon: Building2,
                      bgImage: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=600&q=80',
                    },
                    {
                      id: 'maintenance_services',
                      ar: 'فنيين الصيانة',
                      en: 'Home Maintenance',
                      arSub: 'سباكة - كهرباء - وغيرها',
                      enSub: 'Plumbing, electricity & more',
                      icon: Wrench,
                      bgImage: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=600&q=80',
                    }
                  ].map((serv, index) => {
                    const IconComponent = serv.icon;
                    return (
                      <motion.div
                        key={index}
                        onClick={() => {
                          setCurrentTab(serv.id);
                          if (serv.id === 'student_housing') {
                            setStudentGenderTab('all');
                          }
                          window.scrollTo({ top: 100, behavior: 'smooth' });
                        }}
                        initial={{ opacity: 0, y: 40, scale: 0.95 }}
                        whileInView={{ opacity: 1, y: 0, scale: 1 }}
                        viewport={{ once: true, margin: "-50px" }}
                        transition={{ 
                          duration: 0.8, 
                          ease: [0.16, 1, 0.3, 1],
                          delay: index * 0.12 
                        }}
                        whileHover={{ 
                          y: -12, 
                          scale: 1.04,
                          boxShadow: "0 25px 50px -12px rgba(201, 161, 74, 0.25)"
                        }}
                        whileTap={{ scale: 0.97 }}
                        className="bg-slate-950 border border-white/10 hover:border-[#C9A14A]/60 rounded-[2rem] p-4 sm:p-5 flex flex-col items-center justify-between text-center min-h-[195px] sm:min-h-[225px] transition-all duration-300 cursor-pointer group relative overflow-hidden backdrop-blur-md"
                      >
                        {/* Service Photo Background with Zoom Effect */}
                        <div 
                          className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-[1200ms] ease-out group-hover:scale-110 pointer-events-none z-0"
                          style={{ backgroundImage: `url('${serv.bgImage}')` }}
                        />

                        {/* Subtle light overlay to preserve image brightness and details while adding a premium touch */}
                        <div className="absolute inset-0 bg-black/5 transition-colors duration-500 z-0" />

                        {/* Seamless Professional Ambient Vignette Gradient: Darkens only the bottom of the card smoothly to ensure perfect contrast and readability */}
                        <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-slate-950/95 via-slate-950/70 to-transparent transition-all duration-500 z-0" />

                        {/* Shimmer / light-sweep effect */}
                        <div className="absolute inset-0 w-[200%] h-full bg-gradient-to-r from-transparent via-white/5 to-transparent -skew-x-12 translate-x-[-150%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-out pointer-events-none z-10" />

                        {/* Subtle gold radial gradient shining background inside the card */}
                        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-[#C9A14A]/4 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none z-10" />

                        {/* Glowing golden circle background indicator */}
                        <div className="absolute -top-12 -left-12 w-24 h-24 bg-[#C9A14A]/5 rounded-full blur-2xl pointer-events-none group-hover:bg-[#C9A14A]/10 transition-all z-10" />
                        
                        {/* Beautiful Floating Professional Icon Wrapper */}
                        <motion.div 
                          animate={{ y: [0, -4, 0] }}
                          transition={{ 
                            repeat: Infinity, 
                            duration: 2.8 + index * 0.4, 
                            ease: "easeInOut" 
                          }}
                          className="w-13 h-13 rounded-2xl bg-slate-950/80 border border-white/10 text-[#C9A14A] flex items-center justify-center mb-3 group-hover:border-[#C9A14A]/40 group-hover:bg-[#C9A14A]/15 transition-all duration-300 shadow-lg shrink-0 relative z-10 overflow-hidden"
                        >
                          <>
                            {/* Inner glowing core */}
                            <div className="absolute inset-0 bg-radial-gradient from-[#C9A14A]/25 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                            <IconComponent className="w-6.5 h-6.5 sm:w-7.5 sm:h-7.5 drop-shadow-[0_2px_10px_rgba(201,161,74,0.4)] transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6" />
                          </>
                        </motion.div>

                        {/* Elegant Content Container over natural ambient dark fade - completely integrated into the card background */}
                        <div className="mt-auto w-full relative z-10 space-y-1.5 filter drop-shadow-[0_2px_8px_rgba(0,0,0,0.95)]">
                          <h3 className="text-xs sm:text-sm font-black text-white leading-tight font-arabic group-hover:text-[#C9A14A] transition-colors duration-300 drop-shadow-[0_2px_4px_rgba(0,0,0,1)]">
                            {isRtl ? serv.ar : serv.en}
                          </h3>
                          <p className="text-[10px] sm:text-xs text-gray-100 font-bold font-arabic leading-relaxed group-hover:text-white transition-colors duration-300 drop-shadow-[0_1px_3px_rgba(0,0,0,1)]">
                            {isRtl ? serv.arSub : serv.enSub}
                          </p>
                        </div>

                        {/* Animated micro-interaction indicator */}
                        <div className="mt-3 flex items-center justify-center gap-1.5 text-[10px] sm:text-xs text-[#C9A14A] font-extrabold opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300 font-arabic shrink-0 relative z-10">
                          <span>{isRtl ? 'استكشف الآن' : 'Explore Now'}</span>
                          <span className="text-xs transform group-hover:translate-x-[-2px] transition-transform">{isRtl ? '←' : '→'}</span>
                        </div>

                        {/* Bottom visual luxury accent line */}
                        <div className="absolute bottom-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-[#C9A14A] to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-500 rounded-full" />
                      </motion.div>
                    );
                  })}
            </div>

            {/* Premium Animated statistics counter indicators (أصبحت أسفل الهيرو بشكل غاية في الأناقة) */}
            <section id="services-section" className="scroll-mt-24 space-y-8 bg-white dark:bg-slate-900 border border-gray-100 dark:border-gray-850 p-8 sm:p-12 rounded-3xl shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-[#C9A14A]/5 rounded-full blur-3xl pointer-events-none" />
              
              <div className="text-center space-y-2">
                <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white font-arabic">
                  {isRtl ? 'ثقة ومصداقية بالأرقام' : 'Trust & Numbers'}
                </h2>
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 font-light">
                  {isRtl ? 'إنجازات ونجاحات مستمرة نبني بها مستقبلاً سكنياً أفضل' : 'Continuous achievements building a better housing future together'}
                </p>
                <div className="w-12 h-1 bg-[#C9A14A] mx-auto rounded-full mt-3" />
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 pt-4">
                {[
                  { 
                    count: `${stats.clients}+`, 
                    label: getTranslation(lang, 'statClients'), 
                    desc: lang === 'ar' ? 'ثقة ومصداقية كاملة' : 'Absolute digital trust',
                    icon: Users,
                    color: 'text-[#163B63] dark:text-[#C9A14A]',
                    bgColor: 'bg-[#163B63]/10 dark:bg-slate-800'
                  },
                  { 
                    count: `${stats.properties}+`, 
                    label: getTranslation(lang, 'statProperties'), 
                    desc: lang === 'ar' ? 'سكن فاخر ومضمون' : 'Verified exclusive living',
                    icon: Building2,
                    color: 'text-[#C9A14A] dark:text-[#E3C380]',
                    bgColor: 'bg-[#C9A14A]/10 dark:bg-[#C9A14A]/20'
                  },
                  { 
                    count: `${stats.sales}+`, 
                    label: getTranslation(lang, 'statSales'), 
                    desc: lang === 'ar' ? 'استثمار ناجح ومستقر' : 'Exquisite investments',
                    icon: Handshake,
                    color: 'text-[#163B63] dark:text-[#C9A14A]',
                    bgColor: 'bg-[#163B63]/10 dark:bg-slate-800'
                  },
                  { 
                    count: `${stats.repairs}+`, 
                    label: getTranslation(lang, 'statMaintenance'), 
                    desc: lang === 'ar' ? 'خدمة فورية مستمرة' : 'On-demand resolution',
                    icon: Wrench,
                    color: 'text-[#C9A14A] dark:text-[#E3C380]',
                    bgColor: 'bg-[#C9A14A]/10 dark:bg-[#C9A14A]/20'
                  }
                ].map((st, i) => {
                  const IconComponent = st.icon;
                  return (
                    <motion.div 
                      key={i}
                      whileHover={{ y: -5, scale: 1.02 }}
                      className="bg-white dark:bg-slate-950 border border-[#C9A14A]/15 dark:border-gray-800 p-5 sm:p-6 rounded-3xl text-center shadow-sm relative group overflow-hidden flex flex-col items-center justify-between min-h-[190px] hover:shadow-xl hover:border-[#C9A14A]/45 transition-all duration-300"
                    >
                      {/* Glowing golden circle background indicator */}
                      <div className="absolute -top-12 -left-12 w-24 h-24 bg-[#C9A14A]/5 rounded-full blur-xl pointer-events-none group-hover:bg-[#C9A14A]/10 transition-all" />
                      
                      {/* Beautiful Professional Icon Wrapper */}
                      <div className={`w-12 h-12 rounded-xl ${st.bgColor} ${st.color} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300 shadow-sm shrink-0`}>
                        <IconComponent className="w-6 h-6" />
                      </div>

                      <div className="space-y-1 w-full">
                        <p className="text-2xl sm:text-3.5xl font-black text-[#C9A14A] font-sans leading-none tracking-tight">
                          {st.count}
                        </p>
                        <p className="text-xs sm:text-sm font-extrabold text-[#163B63] dark:text-gray-150 font-arabic leading-tight">
                          {st.label}
                        </p>
                        <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 font-medium font-arabic leading-normal">
                          {st.desc}
                        </p>
                      </div>

                      {/* Bottom visual accent line */}
                      <div className="absolute bottom-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-[#C9A14A]/30 to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-500 rounded-full" />
                    </motion.div>
                  );
                })}
              </div>
            </section>

            {/* TESTIMONIALS SLIDER SECTION */}
            <section className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-gray-800 p-6 sm:p-10 rounded-3xl space-y-8 relative overflow-hidden shadow-sm">
              <div className="absolute top-0 right-0 w-24 h-24 bg-[#C9A14A]/5 rounded-full blur-2xl pointer-events-none" />
              
              <div className="text-center space-y-2">
                <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900 dark:text-white font-arabic">
                  {getTranslation(lang, 'reviews')}
                </h2>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {lang === 'ar' ? 'نسعد بثقة عملائنا وطلابنا الأوفياء دائماً' : 'Feedback from our esteemed students & buyers'}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {sampleReviews.map((rev) => (
                  <div 
                    key={rev.id} 
                    className="p-5 bg-white dark:bg-slate-900 border border-gray-100 dark:border-gray-800 rounded-2xl shadow-sm flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center text-amber-500 gap-0.5 mb-3">
                        {Array.from({ length: rev.rating }).map((_, r) => (
                          <Star key={r} className="w-4 h-4 fill-amber-500" />
                        ))}
                      </div>
                      <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 leading-relaxed font-light italic">
                        "{rev.comment}"
                      </p>
                    </div>
                    <div className="mt-4 pt-4 border-t border-gray-50 dark:border-gray-800 flex items-center justify-between">
                      <span className="text-xs font-bold text-[#163B63] dark:text-gray-200">{rev.fullName}</span>
                      <span className="text-[10px] text-gray-400 font-mono">
                        {new Date(rev.createdAt).toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-US')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}

        {/* VIEW 1.5: CURATED SERVICES DIRECTORY */}
        {currentTab === 'services' && (
          <ServicesDirectory 
            lang={lang} 
            onNavigate={handleServicesNavigation} 
          />
        )}

        {/* VIEW 2: STUDENT HOUSING PAGE */}
        {currentTab === 'student_housing' && (
          <div className="space-y-8 animate-fadeIn">
            {/* Quick Back Navigation Bar */}
            <div className="pb-1">
              <button
                onClick={() => {
                  setCurrentTab('home');
                  window.scrollTo({ top: 300, behavior: 'smooth' });
                }}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-slate-900 dark:hover:bg-slate-800 text-[#163B63] dark:text-gray-300 font-bold text-xs rounded-xl transition-all border border-gray-200/50 dark:border-slate-800 cursor-pointer shadow-sm select-none font-arabic"
              >
                <span>{lang === 'ar' ? '← العودة للرئيسية وفئات الخدمات' : '← Back to Main Services'}</span>
              </button>
            </div>

            {/* Page Header elements */}
            <div className="border-b border-gray-200 dark:border-gray-800 pb-5 flex items-center gap-3">
              <span className="w-1.5 h-10 bg-[#C9A14A] rounded-full shrink-0"></span>
              <div>
                <h1 className="text-2xl sm:text-3.5xl font-extrabold text-[#163B63] dark:text-white font-arabic">
                  {getTranslation(lang, 'studentHousing')}
                </h1>
                <p className="text-xs sm:text-sm text-gray-400 dark:text-gray-400 mt-1 font-light">
                  {lang === 'ar' ? 'سكن فاخر ومجهز بالكامل للطلاب والطالبات بجوار جامعة جنوب الوادي وأقصر.' : 'Secure, fully furnished dormitory accommodations for university students.'}
                </p>
              </div>
            </div>

            {/* Gender Sub-Tabs selector */}
            <div className="flex items-center gap-2 p-1.5 bg-gray-100 dark:bg-slate-900 rounded-2xl w-full max-w-md">
              <button
                onClick={() => setStudentGenderTab('all')}
                className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  studentGenderTab === 'all'
                    ? 'bg-[#163B63] text-[#C9A14A] shadow'
                    : 'text-gray-500 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                {getTranslation(lang, 'all')}
              </button>
              <button
                onClick={() => setStudentGenderTab('male')}
                className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  studentGenderTab === 'male'
                    ? 'bg-[#163B63] text-[#C9A14A] shadow'
                    : 'text-gray-500 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                {getTranslation(lang, 'males')}
              </button>
              <button
                onClick={() => setStudentGenderTab('female')}
                className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  studentGenderTab === 'female'
                    ? 'bg-[#163B63] text-[#C9A14A] shadow'
                    : 'text-gray-500 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                {getTranslation(lang, 'females')}
              </button>
            </div>

            {/* Search filter panel */}
            <div className="flex flex-col md:flex-row gap-4 bg-white dark:bg-slate-900 border border-gray-100 dark:border-gray-850 p-4 rounded-2xl">
              <div className="flex-1 relative">
                <Search className="absolute top-1/2 -translate-y-1/2 right-3.5 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder={getTranslation(lang, 'searchPlaceholder')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`w-full py-2.5 bg-gray-50 dark:bg-slate-850 border border-gray-150 dark:border-gray-800 text-sm rounded-xl focus:outline-none focus:border-[#C9A14A] text-gray-900 dark:text-white ${isRtl ? 'pr-10 pl-4' : 'pl-10 pr-4'}`}
                />
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={handleClearFilters}
                  className="px-3 py-2.5 border border-dashed border-gray-200 dark:border-gray-700 text-xs text-gray-500 hover:text-gray-700 hover:border-gray-300 rounded-xl flex items-center gap-1 cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>{lang === 'ar' ? 'تصفية الفلاتر' : 'Reset'}</span>
                </button>
              </div>
            </div>

            {/* Grid Listings */}
            {isRefreshing ? (
              <PropertySkeletonGrid lang={lang} />
            ) : filteredListings.length === 0 ? (
              <div className="p-12 text-center bg-white dark:bg-slate-900 border border-gray-100 dark:border-gray-850 rounded-3xl space-y-3">
                <ShieldAlert className="w-10 h-10 text-[#C9A14A] mx-auto animate-bounce" />
                <p className="text-gray-500 text-sm font-medium">{getTranslation(lang, 'noPropertiesFound')}</p>
                <button onClick={handleClearFilters} className="text-xs text-[#163B63] hover:underline font-bold">
                  {lang === 'ar' ? 'عرض كافة المساكن' : 'View All Housing'}
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredListings.map((prop) => (
                  <PropertyCard
                    key={prop.id}
                    property={prop}
                    lang={lang}
                    onViewDetails={setSelectedProperty}
                    onFavoriteToggle={() => handleFavoriteToggle(prop.id)}
                    isFav={favorites.includes(prop.id)}
                    onDelete={() => handleDelete(prop.id, prop.title_ar)}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* VIEW 3: FAMILY RENTALS PAGE */}
        {currentTab === 'family_rentals' && (
          <div className="space-y-8 animate-fadeIn">
            {/* Quick Back Navigation Bar */}
            <div className="pb-1">
              <button
                onClick={() => {
                  setCurrentTab('home');
                  window.scrollTo({ top: 300, behavior: 'smooth' });
                }}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-slate-900 dark:hover:bg-slate-800 text-[#163B63] dark:text-gray-300 font-bold text-xs rounded-xl transition-all border border-gray-200/50 dark:border-slate-800 cursor-pointer shadow-sm select-none font-arabic"
              >
                <span>{lang === 'ar' ? '← العودة للرئيسية وفئات الخدمات' : '← Back to Main Services'}</span>
              </button>
            </div>

            <div className="border-b border-gray-200 dark:border-gray-800 pb-5 flex items-center gap-3">
              <span className="w-1.5 h-10 bg-[#C9A14A] rounded-full shrink-0"></span>
              <div>
                <h1 className="text-2xl sm:text-3.5xl font-extrabold text-[#163B63] dark:text-white font-arabic">
                  {getTranslation(lang, 'rentals')}
                </h1>
                <p className="text-xs sm:text-sm text-gray-400 dark:text-gray-400 mt-1 font-light">
                  {lang === 'ar' ? 'أفضل الشقق والدوبلكس الفاخرة المخصصة للعائلات في قنا والأقصر.' : 'High-end apartments, duplex suites, and luxury lodging for rent.'}
                </p>
              </div>
            </div>

            {/* Custom Multi Filters Panel */}
            <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-gray-850 p-5 rounded-3xl space-y-4 shadow-sm">
              <div className="font-bold text-sm text-[#163B63] dark:text-gray-200 flex items-center gap-1.5 uppercase tracking-wider">
                <Filter className="w-4.5 h-4.5 text-[#C9A14A]" />
                <span>{getTranslation(lang, 'filterTitle')}</span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* Search Bar query */}
                <div className="relative">
                  <span className="absolute top-1/2 -translate-y-1/2 right-3 text-gray-400">
                    <Search className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    placeholder={getTranslation(lang, 'searchPlaceholder')}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pr-9 pl-3 py-2.5 bg-gray-50 dark:bg-slate-850 border border-gray-150 dark:border-gray-800 rounded-xl text-xs focus:outline-none focus:border-[#C9A14A]"
                  />
                </div>

                {/* Price limit selection */}
                <div>
                  <select
                    value={filterPriceMax || ''}
                    onChange={(e) => setFilterPriceMax(Number(e.target.value) || 0)}
                    className="w-full px-3 py-2.5 bg-gray-50 dark:bg-slate-850 border border-gray-150 dark:border-gray-800 rounded-xl text-xs focus:outline-none focus:border-[#C9A14A]"
                  >
                    <option value="">{lang === 'ar' ? 'الحد الأقصى للإيجار (الكل)' : 'Max Rent (All)'}</option>
                    <option value="3000">3,000 {getTranslation(lang, 'currency')}</option>
                    <option value="6000">6,000 {getTranslation(lang, 'currency')}</option>
                    <option value="10000">10,000 {getTranslation(lang, 'currency')}</option>
                    <option value="15000">15,000 {getTranslation(lang, 'currency')}</option>
                  </select>
                </div>

                {/* Rooms selection */}
                <div>
                  <select
                    value={filterRooms || ''}
                    onChange={(e) => setFilterRooms(Number(e.target.value) || 0)}
                    className="w-full px-3 py-2.5 bg-gray-50 dark:bg-slate-850 border border-gray-150 dark:border-gray-800 rounded-xl text-xs focus:outline-none focus:border-[#C9A14A]"
                  >
                    <option value="">{lang === 'ar' ? 'عدد الغرف (الكل)' : 'Rooms Count (All)'}</option>
                    <option value="2">غرفتان (2)</option>
                    <option value="3">3 غرف</option>
                    <option value="4">4 غرف</option>
                  </select>
                </div>

                {/* Area filter */}
                <div>
                  <select
                    value={filterAreaMin || ''}
                    onChange={(e) => setFilterAreaMin(Number(e.target.value) || 0)}
                    className="w-full px-3 py-2.5 bg-gray-50 dark:bg-slate-850 border border-gray-150 dark:border-gray-800 rounded-xl text-xs focus:outline-none focus:border-[#C9A14A]"
                  >
                    <option value="">{lang === 'ar' ? 'المساحة الدنيا (الكل)' : 'Min Area (All)'}</option>
                    <option value="100">100 {getTranslation(lang, 'sqm')}+</option>
                    <option value="150">150 {getTranslation(lang, 'sqm')}+</option>
                    <option value="200">200 {getTranslation(lang, 'sqm')}+</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 shrink-0">
                <button
                  onClick={handleClearFilters}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-[#163B63] dark:text-gray-200 font-bold text-xs rounded-xl transition-all cursor-pointer"
                >
                  {lang === 'ar' ? 'تصفية الفلاتر' : 'Reset Filters'}
                </button>
              </div>
            </div>

            {/* Output Listings Grid */}
            {isRefreshing ? (
              <PropertySkeletonGrid lang={lang} />
            ) : filteredListings.length === 0 ? (
              <div className="p-12 text-center bg-white dark:bg-slate-900 border border-gray-100 dark:border-gray-850 rounded-3xl space-y-3">
                <ShieldAlert className="w-10 h-10 text-[#C9A14A] mx-auto animate-pulse" />
                <p className="text-gray-500 text-sm font-medium">{getTranslation(lang, 'noPropertiesFound')}</p>
                <button onClick={handleClearFilters} className="text-xs text-[#163B63] hover:underline font-bold">
                  {lang === 'ar' ? 'عرض كافة الإيجارات' : 'View All Rentals'}
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredListings.map((prop) => (
                  <PropertyCard
                    key={prop.id}
                    property={prop}
                    lang={lang}
                    onViewDetails={setSelectedProperty}
                    onFavoriteToggle={() => handleFavoriteToggle(prop.id)}
                    isFav={favorites.includes(prop.id)}
                    onDelete={() => handleDelete(prop.id, prop.title_ar)}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* VIEW 4: PROPERTY SALES PAGE */}
        {currentTab === 'property_sales' && (
          <div className="space-y-8 animate-fadeIn">
            {/* Quick Back Navigation Bar */}
            <div className="pb-1">
              <button
                onClick={() => {
                  setCurrentTab('home');
                  window.scrollTo({ top: 300, behavior: 'smooth' });
                }}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-slate-900 dark:hover:bg-slate-800 text-[#163B63] dark:text-gray-300 font-bold text-xs rounded-xl transition-all border border-gray-200/50 dark:border-slate-800 cursor-pointer shadow-sm select-none font-arabic"
              >
                <span>{lang === 'ar' ? '← العودة للرئيسية وفئات الخدمات' : '← Back to Main Services'}</span>
              </button>
            </div>

            <div className="border-b border-gray-200 dark:border-gray-800 pb-5 flex items-center gap-3">
              <span className="w-1.5 h-10 bg-[#C9A14A] rounded-full shrink-0"></span>
              <div>
                <h1 className="text-2xl sm:text-3.5xl font-extrabold text-[#163B63] dark:text-white font-arabic">
                  {getTranslation(lang, 'sales')}
                </h1>
                <p className="text-xs sm:text-sm text-gray-400 dark:text-gray-400 mt-1 font-light">
                  {lang === 'ar' ? 'فيلات مميزة لراغبي السكن الفخم أو مجمعات تجارية لأفضل استثمار بعائد ربحي قياسي.' : 'Exquisite luxury villas, penthouses, duplex structures and premium commercial showroom properties for purchase.'}
                </p>
              </div>
            </div>

            {/* Advanced design filters */}
            <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-gray-850 p-5 rounded-3xl space-y-4 shadow-sm">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* Text query */}
                <div className="relative">
                  <span className="absolute top-1/2 -translate-y-1/2 right-3 text-gray-400">
                    <Search className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    placeholder={getTranslation(lang, 'searchPlaceholder')}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pr-9 pl-3 py-2.5 bg-gray-50 dark:bg-slate-850 border border-gray-150 dark:border-gray-800 rounded-xl text-xs focus:outline-none"
                  />
                </div>

                {/* Listing type selection */}
                <div>
                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className="w-full px-3 py-2.5 bg-gray-50 dark:bg-slate-850 border border-gray-150 dark:border-gray-800 rounded-xl text-xs focus:outline-none"
                  >
                    <option value="all">{lang === 'ar' ? 'نوع العقار (الكل)' : 'Property Type (All)'}</option>
                    <option value="apartment">{getTranslation(lang, 'apartments')}</option>
                    <option value="villa">{getTranslation(lang, 'villas')}</option>
                    <option value="duplex">{getTranslation(lang, 'duplexes')}</option>
                    <option value="commercial">{getTranslation(lang, 'commercials')}</option>
                  </select>
                </div>

                {/* Price select */}
                <div>
                  <select
                    value={filterPriceMax || ''}
                    onChange={(e) => setFilterPriceMax(Number(e.target.value) || 0)}
                    className="w-full px-3 py-2.5 bg-gray-50 dark:bg-slate-850 border border-gray-150 dark:border-gray-800 rounded-xl text-xs focus:outline-none"
                  >
                    <option value="">{lang === 'ar' ? 'الحد الأقصى للسعر (الكل)' : 'Max Budget (All)'}</option>
                    <option value="5000000">5 ملايين {getTranslation(lang, 'currency')}</option>
                    <option value="10000000">10 ملايين {getTranslation(lang, 'currency')}</option>
                    <option value="15000000">15 مليون {getTranslation(lang, 'currency')}</option>
                  </select>
                </div>

                {/* Area filter */}
                <div>
                  <select
                    value={filterAreaMin || ''}
                    onChange={(e) => setFilterAreaMin(Number(e.target.value) || 0)}
                    className="w-full px-3 py-2.5 bg-gray-50 dark:bg-slate-850 border border-gray-150 dark:border-gray-800 rounded-xl text-xs focus:outline-none"
                  >
                    <option value="">{lang === 'ar' ? 'المساحة الدنيا' : 'Min Area'}</option>
                    <option value="200">200 {getTranslation(lang, 'sqm')}+</option>
                    <option value="400">400 {getTranslation(lang, 'sqm')}+</option>
                    <option value="600">600 {getTranslation(lang, 'sqm')}+</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 shrink-0">
                <button
                  onClick={handleClearFilters}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-[#163B63] dark:text-gray-200 font-bold text-xs rounded-xl transition-all cursor-pointer"
                >
                  {lang === 'ar' ? 'تصفية الفلاتر' : 'Reset'}
                </button>
              </div>
            </div>

            {/* Output Listings */}
            {isRefreshing ? (
              <PropertySkeletonGrid lang={lang} />
            ) : filteredListings.length === 0 ? (
              <div className="p-12 text-center bg-white dark:bg-slate-900 border border-gray-100 dark:border-gray-850 rounded-3xl space-y-3">
                <ShieldAlert className="w-10 h-10 text-[#C9A14A] mx-auto animate-pulse" />
                <p className="text-gray-500 text-sm font-medium">{getTranslation(lang, 'noPropertiesFound')}</p>
                <button onClick={handleClearFilters} className="text-xs text-[#163B63] hover:underline font-bold">
                  {lang === 'ar' ? 'عرض الكل' : 'View All Sales'}
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredListings.map((prop) => (
                  <PropertyCard
                    key={prop.id}
                    property={prop}
                    lang={lang}
                    onViewDetails={setSelectedProperty}
                    onFavoriteToggle={() => handleFavoriteToggle(prop.id)}
                    isFav={favorites.includes(prop.id)}
                    onDelete={() => handleDelete(prop.id, prop.title_ar)}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* VIEW 5: MAINTENANCE SERVICES PAGE */}
        {currentTab === 'maintenance_services' && (
          <div className="space-y-8 animate-fadeIn">
            {/* Quick Back Navigation Bar */}
            <div className="pb-1">
              <button
                onClick={() => {
                  setCurrentTab('home');
                  window.scrollTo({ top: 300, behavior: 'smooth' });
                }}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-slate-900 dark:hover:bg-slate-800 text-[#163B63] dark:text-gray-300 font-bold text-xs rounded-xl transition-all border border-gray-200/50 dark:border-slate-800 cursor-pointer shadow-sm select-none font-arabic"
              >
                <span>{lang === 'ar' ? '← العودة للرئيسية وفئات الخدمات' : '← Back to Main Services'}</span>
              </button>
            </div>

            <div className="border-b border-gray-200 dark:border-gray-800 pb-5 flex items-center gap-3">
              <span className="w-1.5 h-10 bg-[#C9A14A] rounded-full shrink-0"></span>
              <div>
                <h1 className="text-2xl sm:text-3.5xl font-extrabold text-[#163B63] dark:text-white font-arabic">
                  {getTranslation(lang, 'maintenanceTitle')}
                </h1>
                <p className="text-xs sm:text-sm text-gray-400 dark:text-gray-400 mt-1 font-light">
                  {getTranslation(lang, 'maintenanceSub')}
                </p>
              </div>
            </div>

            {/* Service card lists */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {getMaintenanceServices().map((service) => (
                <ServiceCard
                  key={service.id}
                  service={service}
                  lang={lang}
                  onSuccess={triggerToast}
                />
              ))}
            </div>
          </div>
        )}

        {/* VIEW 6: ABOUT US PAGE */}
        {currentTab === 'about_us' && (
          <div className="space-y-12 animate-fadeIn">
            {/* Quick Back Navigation Bar */}
            <div className="pb-1">
              <button
                onClick={() => {
                  setCurrentTab('home');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-slate-900 dark:hover:bg-slate-800 text-[#163B63] dark:text-gray-300 font-bold text-xs rounded-xl transition-all border border-gray-200/50 dark:border-slate-800 cursor-pointer shadow-sm select-none font-arabic"
              >
                <span>{lang === 'ar' ? '← العودة للرئيسية والخدمات' : '← Back to Main Page'}</span>
              </button>
            </div>

            <div className="border-b border-gray-200 dark:border-gray-800 pb-5 flex items-center gap-3">
              <span className="w-1.5 h-10 bg-[#C9A14A] rounded-full shrink-0"></span>
              <div>
                <h1 className="text-2xl sm:text-3.5xl font-extrabold text-[#163B63] dark:text-white font-arabic">
                  {getTranslation(lang, 'aboutTitle')}
                </h1>
                <p className="text-xs sm:text-sm text-gray-400 dark:text-gray-400 mt-1 font-light">
                  {getTranslation(lang, 'aboutSub')}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div className="space-y-6">
                {/* Mission Card */}
                <div className="p-6 bg-white dark:bg-slate-900 border border-gray-100 dark:border-gray-850 rounded-2xl relative shadow-sm">
                  <div className="absolute top-4 right-4 text-[#C9A14A]/15"><Building2 className="w-10 h-10" /></div>
                  <h3 className="text-lg font-bold text-[#163B63] dark:text-[#C9A14A] font-arabic mb-3">
                    {getTranslation(lang, 'aboutMission')}
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 leading-relaxed font-light">
                    {getTranslation(lang, 'aboutMissionText')}
                  </p>
                </div>

                {/* Vision Card */}
                <div className="p-6 bg-white dark:bg-slate-900 border border-gray-100 dark:border-gray-850 rounded-2xl relative shadow-sm">
                  <div className="absolute top-4 right-4 text-[#C9A14A]/15"><Compass className="w-10 h-10" /></div>
                  <h3 className="text-lg font-bold text-[#163B63] dark:text-[#C9A14A] font-arabic mb-3">
                    {getTranslation(lang, 'aboutVision')}
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 leading-relaxed font-light">
                    {getTranslation(lang, 'aboutVisionText')}
                  </p>
                </div>
              </div>

              {/* Graphical brand image panel */}
              <div 
                onClick={() => setIsFullscreenImageOpen(true)}
                className="relative rounded-2xl overflow-hidden shadow-xl border border-gray-200 dark:border-gray-850 cursor-pointer group"
              >
                <img 
                  src="https://lh3.googleusercontent.com/d/1YkjiGaMmTJvRM9KZpsbcP4HsZLpVE2HB" 
                  alt="Dark HQ"
                  className="w-full aspect-video sm:h-80 object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                  referrerPolicy="no-referrer"
                />
                
                {/* Expand overlay hint */}
                <div className="absolute inset-x-0 top-0 p-3 bg-gradient-to-b from-black/60 to-transparent flex justify-end">
                  <div className="bg-[#163B63]/90 text-white text-[10px] sm:text-xs px-2.5 py-1.5 rounded-full flex items-center gap-1.5 backdrop-blur-md font-arabic border border-[#C9A14A]/30">
                    <Search className="w-3.5 h-3.5 text-[#C9A14A]" />
                    <span>{lang === 'ar' ? 'انقر لتكبير وتصفح التصميم كاملاً' : 'Click to zoom and view full design'}</span>
                  </div>
                </div>

                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#163B63]/95 via-[#163B63]/40 to-transparent p-5 text-white text-center">
                  <p className="text-base sm:text-lg font-bold font-arabic text-gray-100">دارك للخدمات العقارية</p>
                  <p className="text-[10px] text-[#C9A14A] tracking-wider uppercase mt-1">ESTABLISHED IN EGYPT • 2026</p>
                </div>
              </div>
            </div>

            {/* Why choose us detailed blocks */}
            <div className="space-y-6">
              <h3 className="text-lg sm:text-xl font-bold text-center text-gray-900 dark:text-white font-arabic">
                {getTranslation(lang, 'aboutWhy')}
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { title: getTranslation(lang, 'aboutWhyItem1Title'), body: getTranslation(lang, 'aboutWhyItem1Text') },
                  { title: getTranslation(lang, 'aboutWhyItem2Title'), body: getTranslation(lang, 'aboutWhyItem2Text') },
                  { title: getTranslation(lang, 'aboutWhyItem3Title'), body: getTranslation(lang, 'aboutWhyItem3Text') },
                  { title: getTranslation(lang, 'aboutWhyItem4Title'), body: getTranslation(lang, 'aboutWhyItem4Text') }
                ].map((item, id) => (
                  <div key={id} className="p-5 bg-white dark:bg-slate-900 border border-gray-100 dark:border-gray-800 rounded-2xl flex flex-col gap-2 shadow-sm">
                    <div className="w-8 h-8 rounded-full bg-[#C9A14A]/10 text-[#C9A14A] flex items-center justify-center font-bold text-xs shrink-0 select-none">
                      {id + 1}
                    </div>
                    <h4 className="text-sm font-bold text-[#163B63] dark:text-gray-100 font-arabic mt-1">{item.title}</h4>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400 font-light leading-relaxed">{item.body}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* VIEW 7: CONTACT US PAGE */}
        {currentTab === 'contact' && (
          <div className="space-y-12 animate-fadeIn">
            {/* Quick Back Navigation Bar */}
            <div className="pb-1">
              <button
                onClick={() => {
                  setCurrentTab('home');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-slate-900 dark:hover:bg-slate-800 text-[#163B63] dark:text-gray-300 font-bold text-xs rounded-xl transition-all border border-gray-200/50 dark:border-slate-800 cursor-pointer shadow-sm select-none font-arabic"
              >
                <span>{lang === 'ar' ? '← العودة للرئيسية والخدمات' : '← Back to Main Page'}</span>
              </button>
            </div>

            <div className="border-b border-gray-200 dark:border-gray-800 pb-5 flex items-center gap-3">
              <span className="w-1.5 h-10 bg-[#C9A14A] rounded-full shrink-0"></span>
              <div>
                <h1 className="text-2xl sm:text-3.5xl font-extrabold text-[#163B63] dark:text-white font-arabic">
                  {getTranslation(lang, 'contactTitle')}
                </h1>
                <p className="text-xs sm:text-sm text-gray-400 dark:text-gray-400 mt-1 font-light">
                  {getTranslation(lang, 'contactSub')}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Form panel */}
              <div className="bg-white dark:bg-slate-900 border border-gray-150 dark:border-gray-850 p-6 sm:p-8 rounded-3xl shadow-sm relative">
                {contactSuccess && (
                  <div className="mb-4 p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs text-center rounded-xl font-medium animate-bounce flex items-center justify-center gap-2">
                    <CheckCircle className="w-4 h-4 shrink-0" />
                    <span>{getTranslation(lang, 'contactMsgSuccess')}</span>
                  </div>
                )}

                <form onSubmit={handleContactSubmit} className="space-y-4">
                  <div>
                    <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 block mb-2">{getTranslation(lang, 'yourName')}</label>
                    <input
                      type="text"
                      required
                      value={contactName}
                      onChange={(e) => setContactName(e.target.value)}
                      placeholder={getTranslation(lang, 'fullNamePlaceholder')}
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-850 border border-gray-150 dark:border-gray-800 text-sm rounded-xl text-gray-900 dark:text-white focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 block mb-2">{getTranslation(lang, 'emailLabel')}</label>
                    <input
                      type="email"
                      required
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                      placeholder="name@example.com"
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-850 border border-gray-150 dark:border-gray-800 text-sm rounded-xl text-gray-900 dark:text-white focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 block mb-2">{getTranslation(lang, 'msgField')}</label>
                    <textarea
                      required
                      rows={4}
                      value={contactMessage}
                      onChange={(e) => setContactMessage(e.target.value)}
                      placeholder={lang === 'ar' ? 'اكتب استفسارك بالتفصيل وسيجيبك أحد مستشارينا المعتمدين...' : 'Write your details inquiries here...'}
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-850 border border-gray-150 dark:border-gray-800 text-sm rounded-xl text-gray-900 dark:text-white focus:outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3.5 bg-[#163B63] text-[#C9A14A] hover:text-white font-bold text-sm rounded-xl transition-all cursor-pointer shadow shadow-[#163B63]/20"
                  >
                    {getTranslation(lang, 'sendMsgBtn')}
                  </button>
                </form>
              </div>

              {/* Direct anchor links contacts */}
              <div className="space-y-6 justify-between flex flex-col">
                <div className="space-y-4">
                  <h3 className="text-base font-bold text-[#163B63] dark:text-[#C9A14A] uppercase tracking-wider font-arabic">
                    {lang === 'ar' ? 'معلومات التواصل المباشرة' : 'Direct Support Hubs'}
                  </h3>

                  {/* WhatsApp Support link */}
                  <a
                    href="https://wa.me/201124151496"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-4 p-4 bg-white dark:bg-slate-900 border border-gray-100 dark:border-gray-800 rounded-2xl hover:border-emerald-400/40 transition-all shadow-sm"
                  >
                    <div className="p-3 rounded-xl bg-[#25D366]/10 text-[#25D366] shrink-0"><Phone className="w-5 h-5" /></div>
                    <div>
                      <p className="text-[10px] text-gray-400 tracking-wide">WHATSAPP DIRECT LINE</p>
                      <p className="text-sm font-bold text-gray-800 dark:text-gray-200" dir="ltr">+20 112 415 1496</p>
                    </div>
                  </a>

                  {/* Mail address */}
                  <a
                    href="mailto:support@darkestate.com"
                    className="flex items-center gap-4 p-4 bg-white dark:bg-slate-900 border border-gray-100 dark:border-gray-800 rounded-2xl hover:border-[#C9A14A]/40 transition-all shadow-sm"
                  >
                    <div className="p-3 rounded-xl bg-[#C9A14A]/10 text-[#C9A14A] shrink-0"><Mail className="w-5 h-5" /></div>
                    <div>
                      <p className="text-[10px] text-gray-400 tracking-wide">SUPPORT EMAIL ENVELOPE</p>
                      <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">support@darkestate.com</p>
                    </div>
                  </a>

                  {/* Headquarters */}
                  <div className="flex items-center gap-4 p-4 bg-white dark:bg-slate-900 border border-gray-100 dark:border-gray-800 rounded-2xl shadow-sm">
                    <div className="p-3 rounded-xl bg-[#163B63]/10 text-[#163B63] shrink-0"><MapPin className="w-5 h-5" /></div>
                    <div>
                      <p className="text-[10px] text-gray-400 tracking-wide">HEADQUARTERS LOCATION</p>
                      <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                        {lang === 'ar' ? 'قنا، بجوار جامعة جنوب الوادي، البوابات الرئيسية' : 'Qena, Beside South Valley University Main gates'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* HQ Iframe Google Maps */}
                <div className="h-44 w-full rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-800">
                  <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m12!3d26.1558296!2d32.720894!2d26.1558!3m2!1i1024!2i685!4f13.1!3m3!1m2!1s0x14493ff7bf0bbf0d%3A0xe6bf446eebe73595!2sSouth%20Valley%20University!5e0!3m2!1sen!2seg!4v1700000000000!5m2!1sen!2seg"
                    className="w-full h-full border-0"
                    allowFullScreen={false}
                    loading="lazy"
                    title="HQ Maps"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* VIEW 8: FAVORITES PAGE */}
        {currentTab === 'favorites' && (
          <div className="space-y-8 animate-fadeIn">
            {/* Quick Back Navigation Bar */}
            <div className="pb-1">
              <button
                onClick={() => {
                  setCurrentTab('home');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-slate-900 dark:hover:bg-slate-800 text-[#163B63] dark:text-gray-300 font-bold text-xs rounded-xl transition-all border border-gray-200/50 dark:border-slate-800 cursor-pointer shadow-sm select-none font-arabic"
              >
                <span>{lang === 'ar' ? '← العودة للرئيسية والخدمات' : '← Back to Main Page'}</span>
              </button>
            </div>

            <div className="border-b border-gray-200 dark:border-gray-800 pb-5 flex items-center gap-3">
              <span className="w-1.5 h-10 bg-[#C9A14A] rounded-full shrink-0"></span>
              <div>
                <h1 className="text-2xl sm:text-3.5xl font-extrabold text-[#163B63] dark:text-white font-arabic">
                  {getTranslation(lang, 'viewFavorites')}
                </h1>
                <p className="text-xs sm:text-sm text-gray-400 dark:text-gray-400 mt-1 font-light">
                  {lang === 'ar' ? 'العقارات والوحدات السكنية التي قمت بحفظها للرجوع إليها سريعاً.' : 'A selection of your saved listings and accommodations saved locally.'}
                </p>
              </div>
            </div>

            {favorites.length === 0 ? (
              <div className="p-16 text-center bg-white dark:bg-slate-900 border border-gray-100 dark:border-gray-850 rounded-3xl space-y-4 max-w-xl mx-auto shadow-sm">
                <Heart className="w-12 h-12 text-[#C9A14A]/30 mx-auto animate-pulse" />
                <h3 className="text-md font-bold text-gray-800 dark:text-gray-200 font-arabic">{getTranslation(lang, 'emptyFavorites')}</h3>
                <p className="text-xs text-gray-500 max-w-xs mx-auto">
                  {lang === 'ar' 
                    ? 'تصفح باقة سكن الطلاب أو الإيجارات الفخمة للمنازل واضغط زر القلب لحفظ وحدتك هنا.' 
                    : 'Check our premium real estate assets page, or luxury student complexes and select the heart trigger.'
                  }
                </p>
                <button
                  onClick={() => {
                    setCurrentTab('student_housing');
                    window.scrollTo({ top: 100, behavior: 'smooth' });
                  }}
                  className="px-5 py-2.5 bg-[#163B63] hover:bg-[#163B63]/90 text-[#C9A14A] font-bold text-xs rounded-xl transition-all cursor-pointer shadow"
                >
                  {getTranslation(lang, 'browseProperties')}
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {allProperties
                  .filter((p) => favorites.includes(p.id))
                  .map((prop) => (
                    <PropertyCard
                      key={prop.id}
                      property={prop}
                      lang={lang}
                      onViewDetails={setSelectedProperty}
                      onFavoriteToggle={() => handleFavoriteToggle(prop.id)}
                      isFav={true}
                    />
                  ))}
              </div>
            )}
          </div>
        )}

      </main>

      {/* FOOTER SECTION */}
      <footer className="bg-[#163B63] text-gray-300 font-sans border-t border-[#C9A14A]/20 pt-12 pb-16 lg:pb-12" dir={isRtl ? 'rtl' : 'ltr'}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-8 pb-10 border-b border-gray-800 text-xs sm:text-sm">
          {/* Logo brand & tagline */}
          <div className="space-y-4">
            <Logo variant="footer" />
            <p className="text-xs text-gray-400 font-light leading-relaxed">
              {getTranslation(lang, 'tagline')}
            </p>
            {/* WhatsApp Contact badge */}
            <div className="flex items-center gap-1.5 text-xs text-[#25D366] font-semibold">
              <span className="w-2.5 h-2.5 rounded-full bg-[#25D366] animate-ping" />
              <span>{lang === 'ar' ? 'فريق الدعم الموحد: متصل الآن' : 'Agent Support: Online Now'}</span>
            </div>
          </div>

          {/* Quick connections */}
          <div className="space-y-4">
            <h4 className="text-sm font-bold text-[#C9A14A] tracking-wider font-arabic border-b border-[#C9A14A]/20 pb-2 flex items-center gap-2">
              <span className="w-1.5 h-3.5 bg-[#C9A14A] rounded-sm shrink-0"></span>
              {lang === 'ar' ? 'روابط سريعة ومباشرة' : 'Direct Navigation Links'}
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
              {[
                { id: 'home', label: getTranslation(lang, 'home'), icon: Home },
                { id: 'student_housing', label: getTranslation(lang, 'studentHousing'), icon: GraduationCap },
                { id: 'family_rentals', label: getTranslation(lang, 'rentals'), icon: Building },
                { id: 'property_sales', label: getTranslation(lang, 'sales'), icon: Building2 },
                { id: 'maintenance_services', label: getTranslation(lang, 'maintenance'), icon: Wrench },
                { id: 'about_us', label: getTranslation(lang, 'about'), icon: Info }
              ].map((link) => {
                const IconComponent = link.icon;
                const isCurrent = currentTab === link.id;
                return (
                  <button
                    key={link.id}
                    onClick={() => {
                      setCurrentTab(link.id);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl border transition-all duration-300 group cursor-pointer text-start ${
                      isCurrent 
                        ? 'bg-[#C9A14A]/15 border-[#C9A14A] text-white font-bold shadow-lg shadow-[#C9A14A]/5' 
                        : 'bg-white/5 border-white/5 text-gray-300 hover:bg-white/10 hover:border-white/20 hover:text-white'
                    }`}
                  >
                    <IconComponent className={`w-4 h-4 shrink-0 transition-transform duration-300 group-hover:scale-110 ${
                      isCurrent ? 'text-[#C9A14A]' : 'text-[#C9A14A]/70 group-hover:text-[#C9A14A]'
                    }`} />
                    <span className="font-arabic truncate font-medium text-xs sm:text-sm">{link.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Copyrights and technical telemetry */}
          <div className="space-y-3 flex flex-col justify-between">
            <div>
              <h4 className="text-sm font-bold text-[#C9A14A] tracking-wider">{lang === 'ar' ? 'نظام التشغيل الآمن' : 'Encrypted Operation Hub'}</h4>
              <p className="text-xs text-gray-400 leading-relaxed font-light mt-1.5">
                {lang === 'ar' ? 'يرتبط الموقع اتوماتيكياً بـ WhatsApp لتسهيل وتأكيد الحجوزات والشراء بأسرع تقنية.' : 'Automated WhatsApp sync system providing robust booking & buying pipelines.'}
              </p>
            </div>
          </div>
        </div>

        {/* Outer footer */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-[10px] sm:text-xs text-gray-500 font-mono">
          <span>
            {lang === 'ar' ? '© 2026 جميع الحقوق محفوظة لدى شركة دارك للعقارات' : '© 2026 Dark Real Estate. All Rights Reserved.'}
          </span>
          <div className="flex items-center gap-4">
            <span>SECURE HTTPS ENABLED</span>
            <span>RTL AND LTR COMPLIANT</span>
          </div>
        </div>
      </footer>

      {/* Floating Bottom Navigation Tab bar for iOS layout on mobile */}
      <BottomNav
        lang={lang}
        currentTab={currentTab}
        onTabChange={setCurrentTab}
        favoritesCount={favorites.length}
      />

      {/* ADMIN CONTROL PANEL MODAL OVERLAY */}
      {isAdminOpen && (
        <div className="fixed inset-0 z-max overflow-y-auto bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border-2 border-[#C9A14A]/30 w-full max-w-3xl rounded-3xl overflow-hidden shadow-2xl animate-scaleIn max-h-[90vh] flex flex-col" dir={isRtl ? 'rtl' : 'ltr'}>
            
            {/* Modal Header */}
            <div className="p-5 border-b border-gray-150 dark:border-gray-800 bg-[#163B63] text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <Settings className="w-5 h-5 text-[#C9A14A] animate-pulse" />
                <div>
                  <h3 className="text-lg font-bold font-arabic">{lang === 'ar' ? 'لوحة تحكم إدارة العقارات' : 'Properties Control Center'}</h3>
                  <p className="text-[10px] text-gray-300 font-light mt-0.5">{lang === 'ar' ? 'متاح لمدير المنصة إضافة وحذف وإفراغ العقارات مباشرة' : 'Platform administration workflow engine'}</p>
                </div>
              </div>
              <button 
                onClick={() => setIsAdminOpen(false)}
                className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1 text-gray-950 dark:text-gray-100">
              
              {/* Quick Actions Panel */}
              <div className="p-4 bg-gray-50 dark:bg-slate-850 rounded-2xl border border-gray-200 dark:border-gray-800 space-y-3">
                <h4 className="text-sm font-bold font-arabic text-[#163B63] dark:text-[#C9A14A] flex items-center gap-1.5">
                  <Sparkles className="w-4.5 h-4.5 animate-bounce" />
                  <span>{lang === 'ar' ? 'إجراءات سريعة وسهلة' : 'Instant Structural Actions'}</span>
                </h4>
                <p className="text-xs text-gray-500 font-light">
                  {lang === 'ar' 
                    ? 'يمكنك التخلص من الشقق الوهمية بلمسة واحدة لبدء إدخال بياناتك الحقيقية. زر المسح يقوم بإفراغ القائمة كلياً.' 
                    : 'Clear dummy seed values automatically or restore clean design layouts context with one tap.'}
                </p>
                
                <div className="flex flex-wrap gap-2 pt-1">
                  <button
                    onClick={() => {
                      if (window.confirm(lang === 'ar' ? 'هل كلياً تريد مسح كل العقارات والصور المسجلة بالموقع حالياً للبدء ببيانات جديدة؟' : 'Wipe all properties and images completely?')) {
                        handleClearAll();
                      }
                    }}
                    className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all shadow cursor-pointer"
                  >
                    <Eraser className="w-4 h-4" />
                    <span>{lang === 'ar' ? '🧹 مسح كافة العقارات الوهمية (إفراغ الموقع)' : 'Wipe All Mock Apartments'}</span>
                  </button>

                  <button
                    onClick={handleRestoreDemo}
                    className="px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-gray-800 dark:text-gray-200 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <RefreshCw className="w-4 h-4" />
                    <span>{lang === 'ar' ? '🔄 استعادة النماذج المهيكلة' : 'Restore Demo Skeletons'}</span>
                  </button>
                </div>
              </div>

              {/* Advanced listings manager panel */}
              <div className="p-4 bg-gray-50 dark:bg-slate-850 rounded-2xl border border-gray-200 dark:border-gray-800 space-y-3">
                <h4 className="text-sm font-bold font-arabic text-[#163B63] dark:text-[#C9A14A] flex items-center gap-1.5 pb-1 border-b border-gray-200 dark:border-gray-800">
                  <Trash2 className="w-4.5 h-4.5 text-rose-500" />
                  <span>{lang === 'ar' ? 'قائمة إدارة وحذف كافّة العقارات المعروضة' : 'Manage & Delete Active Listings'}</span>
                </h4>
                <p className="text-[11px] text-gray-500 font-light">
                  {lang === 'ar'
                    ? 'هنا تجد كافة الشقق والمشاريع التي تظهر في الموقع (بما فيها الشقق والمشاريع الوهمية التي تمت إضافتها للتجربة)؛ يمكنك حذف أي منها بشكل فوري ومستقل بضغطة زر.'
                    : 'List of all system properties on display. Delete any entry on demand.'}
                </p>
                
                {allProperties.length === 0 ? (
                  <p className="text-xs text-gray-400 italic py-2 text-center">{lang === 'ar' ? 'الموقع فارغ تماماً حالياً! لا يوجد عقارات.' : 'No active properties cataloged.'}</p>
                ) : (
                  <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1 divide-y divide-gray-150 dark:divide-slate-800">
                    {allProperties.map((prop, index) => (
                      <div key={prop.id} className={`flex items-center justify-between py-2 text-xs ${index !== 0 ? 'border-t border-gray-100 dark:border-slate-800' : ''}`}>
                        <div className="flex flex-col gap-0.5">
                          <span className="font-bold text-gray-800 dark:text-gray-200 line-clamp-1">{lang === 'ar' ? prop.title_ar : prop.title_en}</span>
                          <span className="text-[10px] text-gray-400 font-mono">
                            ID: {prop.id} • {prop.category === 'student_housing' ? (lang === 'ar' ? 'سكن طلاب' : 'Students') : prop.category === 'family_rentals' ? (lang === 'ar' ? 'إيجار عائلات' : 'Family Rentals') : (lang === 'ar' ? 'عقارات للبيع' : 'For sale')}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            if (window.confirm(lang === 'ar' ? `هل تريد مسح عقار "${prop.title_ar}" نهائياً من الموقع؟` : `Delete "${prop.title_en}"?`)) {
                              handleDelete(prop.id, prop.title_ar);
                            }
                          }}
                          className="px-2.5 py-1.5 rounded-lg bg-rose-500 hover:bg-rose-600 transition-colors text-white font-bold text-[10px] flex items-center gap-1 cursor-pointer"
                        >
                          <Trash2 className="w-3 h-3" />
                          <span>{lang === 'ar' ? 'مسح العقار' : 'Delete'}</span>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Add New Listing Section */}
              <form onSubmit={handleAddPropertySubmit} className="space-y-4">
                <div className="border-b border-gray-200 dark:border-gray-800 pb-2 flex items-center gap-2">
                  <Plus className="w-4.5 h-4.5 text-[#C9A14A]" />
                  <h4 className="text-sm font-bold text-[#163B63] dark:text-white font-arabic">
                    {lang === 'ar' ? 'إضافة عقار / سكن حقيقي جديد' : 'Publish New Authentic Property'}
                  </h4>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Titles */}
                  <div>
                    <label className="block text-xs font-semibold mb-1">{lang === 'ar' ? 'عنوان العقار باللغة العربية *' : 'Arabic Title *'}</label>
                    <input
                      type="text"
                      required
                      placeholder="مثال: سكن النور للطالبات - الغرفة الفندقية المجهزة"
                      value={adminTitleAr}
                      onChange={(e) => setAdminTitleAr(e.target.value)}
                      className="w-full px-3 py-2 bg-gray-50 dark:bg-slate-850 border border-gray-200 dark:border-gray-800 text-xs rounded-xl focus:outline-none focus:border-[#C9A14A]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1">{lang === 'ar' ? 'عنوان العقار باللغة الإنجليزية *' : 'English Title *'}</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Al-Noor Female Student Housing"
                      value={adminTitleEn}
                      onChange={(e) => setAdminTitleEn(e.target.value)}
                      className="w-full px-3 py-2 bg-gray-50 dark:bg-slate-850 border border-gray-200 dark:border-gray-800 text-xs rounded-xl focus:outline-none focus:border-[#C9A14A]"
                    />
                  </div>

                  {/* Locations */}
                  <div>
                    <label className="block text-xs font-semibold mb-1">{lang === 'ar' ? 'الموقع باللغة العربية *' : 'Arabic Location *'}</label>
                    <input
                      type="text"
                      required
                      placeholder="مثال: قنا - بجوار الجامعة، شارع المعابر"
                      value={adminLocAr}
                      onChange={(e) => setAdminLocAr(e.target.value)}
                      className="w-full px-3 py-2 bg-gray-50 dark:bg-slate-850 border border-gray-200 dark:border-gray-800 text-xs rounded-xl focus:outline-none focus:border-[#C9A14A]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1">{lang === 'ar' ? 'الموقع باللغة الإنجليزية *' : 'English Location *'}</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Qena - Near Uni Gates"
                      value={adminLocEn}
                      onChange={(e) => setAdminLocEn(e.target.value)}
                      className="w-full px-3 py-2 bg-gray-50 dark:bg-slate-850 border border-gray-200 dark:border-gray-800 text-xs rounded-xl focus:outline-none focus:border-[#C9A14A]"
                    />
                  </div>

                  {/* Price */}
                  <div>
                    <label className="block text-xs font-semibold mb-1">{lang === 'ar' ? 'السعر (شهري أو كلي) في الجنيه المصرى *' : 'Price / Budget (EGP) *'}</label>
                    <input
                      type="number"
                      required
                      min={1}
                      value={adminPrice}
                      onChange={(e) => setAdminPrice(Number(e.target.value) || 0)}
                      className="w-full px-3 py-2 bg-gray-50 dark:bg-slate-850 border border-gray-200 dark:border-gray-800 text-xs rounded-xl focus:outline-none focus:border-[#C9A14A]"
                    />
                  </div>

                  {/* Custom Price Labels */}
                  <div>
                    <label className="block text-xs font-semibold mb-1">{lang === 'ar' ? 'وصف أو فترة السعر بالعربية (اختياري)' : 'Custom Price Label Arabic (Optional)'}</label>
                    <input
                      type="text"
                      placeholder={lang === 'ar' ? 'مثال: جنيه شهرياً للشقة كاملة' : 'e.g. جنيه شهرياً للشقة كاملة'}
                      value={adminPriceLabelAr}
                      onChange={(e) => setAdminPriceLabelAr(e.target.value)}
                      className="w-full px-3 py-2 bg-gray-50 dark:bg-slate-850 border border-gray-200 dark:border-gray-800 text-xs rounded-xl focus:outline-none focus:border-[#C9A14A]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold mb-1">{lang === 'ar' ? 'وصف أو فترة السعر بالإنجليزية (اختياري)' : 'Custom Price Label English (Optional)'}</label>
                    <input
                      type="text"
                      placeholder="e.g. EGP / Month (Whole Flat)"
                      value={adminPriceLabelEn}
                      onChange={(e) => setAdminPriceLabelEn(e.target.value)}
                      className="w-full px-3 py-2 bg-gray-50 dark:bg-slate-850 border border-gray-200 dark:border-gray-800 text-xs rounded-xl focus:outline-none focus:border-[#C9A14A]"
                    />
                  </div>

                  {/* Category selector */}
                  <div>
                    <label className="block text-xs font-semibold mb-1">{lang === 'ar' ? 'تصنيف الخدمة للفلترة *' : 'Service Category *'}</label>
                    <select
                      value={adminCategory}
                      onChange={(e) => {
                        const val = e.target.value as any;
                        setAdminCategory(val);
                        // Sensible default type
                        if (val === 'student_housing') setAdminType('student_male');
                        else if (val === 'family_rentals') setAdminType('apartment');
                        else setAdminType('villa');
                      }}
                      className="w-full px-3 py-2 bg-gray-50 dark:bg-slate-850 border border-gray-200 dark:border-gray-800 text-xs rounded-xl focus:outline-none focus:border-[#C9A14A]"
                    >
                      <option value="student_housing">{lang === 'ar' ? '🎓 سكن طلابي / طالبات' : 'Student Housing'}</option>
                      <option value="family_rentals">{lang === 'ar' ? '🏠 شقق للإيجار اهالي' : 'Family Rentals'}</option>
                      <option value="property_sales">{lang === 'ar' ? '🔑 عقارات للبيع والشراء' : 'Real Estate Sales'}</option>
                    </select>
                  </div>

                  {/* Property type / Specific gender target */}
                  <div>
                    <label className="block text-xs font-semibold mb-1">
                      {lang === 'ar' ? 'نوع العقار والتفضيل الجنساني (التفرقة الطلابية) *' : 'Property Specific Target *'}
                    </label>
                    <select
                      value={adminType}
                      onChange={(e) => setAdminType(e.target.value)}
                      className="w-full px-3 py-2 bg-gray-50 dark:bg-slate-850 border border-gray-200 dark:border-gray-800 text-xs rounded-xl focus:outline-none focus:border-[#C9A14A]"
                    >
                      {adminCategory === 'student_housing' ? (
                        <>
                          <option value="student_male">{lang === 'ar' ? '👨‍🎓 سكن طلاب (شباب / ذكور)' : 'Students Housing (Male/Boys)'}</option>
                          <option value="student_female">{lang === 'ar' ? '👩‍🎓 سكن طالبات (بنات / إناث)' : 'Students Housing (Female/Girls)'}</option>
                        </>
                      ) : (
                        <>
                          <option value="apartment">{lang === 'ar' ? '🏢 شقة سكنية' : 'Apartment'}</option>
                          <option value="duplex">{lang === 'ar' ? '🏡 دوبلكس عائلي' : 'Duplex Suite'}</option>
                          <option value="villa">{lang === 'ar' ? '🏰 فيلا ملكية' : 'Standalone Villa'}</option>
                          <option value="commercial">{lang === 'ar' ? '🏬 مجمع مالي أو إداري' : 'Commercial space'}</option>
                        </>
                      )}
                    </select>
                  </div>

                  {/* Areas specifications block */}
                  <div className="grid grid-cols-3 gap-2 col-span-1 md:col-span-2">
                    <div>
                      <label className="block text-[10px] font-semibold mb-1">{lang === 'ar' ? 'مساحة العقار (م²)' : 'Area (Sqm)'}</label>
                      <input
                        type="number"
                        min={10}
                        value={adminArea}
                        onChange={(e) => setAdminArea(Number(e.target.value) || 0)}
                        className="w-full px-3 py-2 bg-gray-50 dark:bg-slate-850 border border-gray-200 dark:border-gray-800 text-xs rounded-xl focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold mb-1">{lang === 'ar' ? 'عدد الغرف' : 'Rooms'}</label>
                      <input
                        type="number"
                        min={1}
                        value={adminRooms}
                        onChange={(e) => setAdminRooms(Number(e.target.value) || 0)}
                        className="w-full px-3 py-2 bg-gray-50 dark:bg-slate-850 border border-gray-200 dark:border-gray-800 text-xs rounded-xl focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold mb-1">
                        {adminCategory === 'student_housing' ? (lang === 'ar' ? 'الأسرّة المتاحة' : 'Beds left') : (lang === 'ar' ? 'دورات المياه' : 'Bathrooms')}
                      </label>
                      <input
                        type="number"
                        min={1}
                        value={adminCategory === 'student_housing' ? adminBeds : adminBathrooms}
                        onChange={(e) => {
                          const val = Number(e.target.value) || 1;
                          if (adminCategory === 'student_housing') {
                            setAdminBeds(val);
                          } else {
                            setAdminBathrooms(val);
                          }
                        }}
                        className="w-full px-3 py-2 bg-gray-50 dark:bg-slate-850 border border-gray-200 dark:border-gray-800 text-xs rounded-xl focus:outline-none font-sans"
                      />
                    </div>
                  </div>
                </div>

                {/* Subscriptions */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold mb-1">{lang === 'ar' ? 'شرح ووصف العقار بالعربية' : 'Arabic Description'}</label>
                    <textarea
                      rows={3}
                      placeholder="..."
                      value={adminDescAr}
                      onChange={(e) => setAdminDescAr(e.target.value)}
                      className="w-full p-3 bg-gray-50 dark:bg-slate-850 border border-gray-200 dark:border-gray-800 text-xs rounded-xl focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1">{lang === 'ar' ? 'شرح ووصف العقار بالإنجليزية' : 'English Description'}</label>
                    <textarea
                      rows={3}
                      placeholder="..."
                      value={adminDescEn}
                      onChange={(e) => setAdminDescEn(e.target.value)}
                      className="w-full p-3 bg-gray-50 dark:bg-slate-850 border border-gray-200 dark:border-gray-800 text-xs rounded-xl focus:outline-none"
                    />
                  </div>
                </div>

                {/* Amenities */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold mb-1">{lang === 'ar' ? 'مزايا السكن بالعربية (مفصولة بفاصلة)' : 'Amenities / Perks Arabic (Comma-separated)'}</label>
                    <input
                      type="text"
                      placeholder="واي فاي, أمان وحراسة, مطبخ مجهز"
                      value={adminAmenitiesAr}
                      onChange={(e) => setAdminAmenitiesAr(e.target.value)}
                      className="w-full px-3 py-2 bg-gray-50 dark:bg-slate-850 border border-gray-200 dark:border-gray-800 text-xs rounded-xl focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1">{lang === 'ar' ? 'مزايا السكن بالإنجليزية (مفصولة بفاصلة)' : 'Amenities / Perks English (Comma-separated)'}</label>
                    <input
                      type="text"
                      placeholder="Free WiFi, 24/7 Security, Equipped Kitchen"
                      value={adminAmenitiesEn}
                      onChange={(e) => setAdminAmenitiesEn(e.target.value)}
                      className="w-full px-3 py-2 bg-gray-50 dark:bg-slate-850 border border-gray-200 dark:border-gray-800 text-xs rounded-xl focus:outline-none"
                    />
                  </div>
                </div>

                {/* Real Image URLs */}
                <div>
                  <label className="block text-xs font-semibold mb-1">
                    {lang === 'ar' 
                      ? 'روابط الصور الحقيقية (تفصل بين الروابط الفاصلة ",") - يمكنك تركها فارغة مؤقتاً' 
                      : 'Real Image URLs (Separate with comma ", ") - Optional'}
                  </label>
                  <textarea
                    rows={2}
                    placeholder="https://images.unsplash.com/photo-1522771739844-6... , https://images.unsplash.com/photo-1505691938895-175..."
                    value={adminImageUrls}
                    onChange={(e) => setAdminImageUrls(e.target.value)}
                    className="w-full p-3 bg-gray-50 dark:bg-slate-850 border border-gray-200 dark:border-gray-800 text-xs rounded-xl focus:outline-none text-left font-mono"
                    dir="ltr"
                  />
                  <p className="text-[10px] text-gray-400 mt-1">
                    {lang === 'ar'
                      ? '💡 نصيحة: إذا تركت الحقل فارغاً، سيقوم النظام تلقائياً بتعيين واجهية عرض كلاسيكية تناسب نوع المسكن.'
                      : '💡 Tip: If left blank, a highly beautiful default render preview will be supplied automatically based on selected category.'}
                  </p>
                </div>

                {/* Submit action button */}
                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full py-3.5 bg-gradient-to-r from-[#163B63] to-[#C9A14A] hover:from-[#1d4d80] text-white font-extrabold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-md active:scale-98 cursor-pointer select-none"
                  >
                    <span>{lang === 'ar' ? '📥 حفظ وإضافة العقار للشبكة مباشرة' : 'Publish Property to network'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Global Details Modal Dialog */}
      {selectedProperty && (
        <PropertyDetailsModal
          property={selectedProperty}
          lang={lang}
          onClose={() => setSelectedProperty(null)}
          onFavoriteToggle={() => handleFavoriteToggle(selectedProperty.id)}
          isFav={favorites.includes(selectedProperty.id)}
        />
      )}

      {/* Brand Design Fullscreen Lightbox / Zoom-In view */}
      {isFullscreenImageOpen && (
        <div className="fixed inset-0 z-50 bg-black/95 flex flex-col items-center justify-between p-4 overflow-hidden animate-fade-in font-sans">
          <div className="w-full flex items-center justify-between gap-4 border-b border-gray-800 pb-3 mb-2 max-w-6xl">
            <div className="flex flex-col text-left">
              <h4 className="text-sm font-bold text-[#C9A14A] font-arabic">
                {lang === 'ar' ? 'تصميم دارك للخدمات العقارية' : 'Dark Real Estate Design'}
              </h4>
              <p className="text-[10px] text-gray-400">
                {lang === 'ar' ? 'قم بالتكبير والتمرير لاستعراض الأبعاد والتفاصيل كلياً' : 'Zoom, pinch or drag to inspect pristine details'}
              </p>
            </div>
            
            {/* Custom Interactive zoom action bar */}
            <div className="flex items-center gap-2 bg-gray-900 px-3 py-1.5 rounded-full border border-gray-800">
              <button 
                onClick={() => setBrandImageZoom(prev => Math.max(0.5, prev - 0.25))}
                className="text-white hover:text-[#C9A14A] text-sm font-bold px-2 cursor-pointer select-none"
                title={lang === 'ar' ? 'تصغير' : 'Zoom Out'}
              >
                -
              </button>
              <span className="text-gray-300 text-xs font-mono px-1">
                {Math.round(brandImageZoom * 100)}%
              </span>
              <button 
                onClick={() => setBrandImageZoom(prev => Math.min(3, prev + 0.25))}
                className="text-white hover:text-[#C9A14A] text-sm font-bold px-2 cursor-pointer select-none"
                title={lang === 'ar' ? 'تكبير' : 'Zoom In'}
              >
                +
              </button>
              <button 
                onClick={() => setBrandImageZoom(1)}
                className="text-gray-400 hover:text-white text-[10px] font-semibold border-l border-gray-700 pl-2 ml-1 cursor-pointer select-none font-arabic"
              >
                {lang === 'ar' ? 'إعادة تعيين' : 'Reset'}
              </button>
            </div>

            <button 
              onClick={() => {
                setIsFullscreenImageOpen(false);
                setBrandImageZoom(1);
              }}
              className="p-2 bg-gray-900 border border-gray-800 hover:bg-gray-800 text-white rounded-full transition-transform hover:rotate-90 cursor-pointer"
            >
              <X className="w-5 h-5 text-gray-300" />
            </button>
          </div>

          {/* Scalable Drag & Pan viewport container */}
          <div className="flex-1 w-full max-w-6xl flex items-center justify-center overflow-auto rounded-xl bg-gray-950/40 p-2 sm:p-6 border border-gray-900">
            <div 
              className="transition-transform duration-200 ease-out origin-center"
              style={{ transform: `scale(${brandImageZoom})` }}
            >
              <img 
                src="https://lh3.googleusercontent.com/d/1YkjiGaMmTJvRM9KZpsbcP4HsZLpVE2HB" 
                alt="Dark Full design map"
                className="max-h-[75vh] w-auto h-auto object-contain shadow-2xl rounded-lg"
                referrerPolicy="no-referrer"
              />
            </div>
          </div>

          <div className="w-full text-center py-2 text-[10px] text-gray-500 max-w-6xl font-arabic flex flex-col sm:flex-row items-center justify-between gap-2 border-t border-gray-900 mt-2">
            <span>{lang === 'ar' ? '💡 يمكنك تمرير/سحب الشاشة إذا أصبحت الصورة أكبر من الشاشة للمعاينة الكاملة.' : '💡 Use scroll/drag or pinch to navigate image viewport when zoomed in.'}</span>
            <div className="flex items-center gap-1.5 text-gray-400 text-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>ESTABLISHED IN EGYPT • 2026 // DARK PLATFORM</span>
            </div>
          </div>
        </div>
      )}

      {/* Centered Premium Glassmorphic Loading Overlay */}
      {isRefreshing && (
        <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-slate-950/60 backdrop-blur-md transition-all duration-300">
          <div className="bg-white dark:bg-slate-900 border border-gray-150 dark:border-slate-800 p-8 rounded-3xl shadow-2xl flex flex-col items-center space-y-4 max-w-xs w-full mx-4 text-center">
            <div className="relative flex items-center justify-center">
              <div className="w-16 h-16 border-4 border-[#C9A14A]/20 border-t-[#C9A14A] rounded-full animate-spin"></div>
              <RefreshCw className="w-6 h-6 text-[#C9A14A] absolute animate-pulse" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white font-arabic">
                {lang === 'ar' ? 'جاري تحديث البيانات...' : 'Refreshing data...'}
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {lang === 'ar' ? 'يرجى الانتظار لحظة' : 'Please wait a moment'}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
