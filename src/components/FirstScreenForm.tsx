import React, { FC, useState } from 'react';
import { motion } from 'motion/react';
import { Logo } from './Logo';
import { Language } from '../types';
import { safeLocalStorage as localStorage, safeSessionStorage as sessionStorage } from '../lib/storage';
import { registerCustomer } from '../lib/db';
import { getTranslation } from '../lib/translations';
import { Globe, Phone, User, Home, ArrowRight, ShieldCheck, ChevronDown, RefreshCw } from 'lucide-react';
import { registerOrUpdateFirebaseCustomer } from '../lib/firebase';

interface FirstScreenFormProps {
  onComplete: (lang: Language, selectedService?: string) => void;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export const FirstScreenForm: FC<FirstScreenFormProps> = ({ onComplete, onRefresh, isRefreshing }) => {
  const [lang, setLang] = useState<Language>('ar');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [service, setService] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Helper to detect device type
  const detectDeviceType = (): string => {
    const width = window.innerWidth;
    if (width < 768) return 'Mobile';
    if (width < 1024) return 'Tablet';
    return 'Desktop';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError(lang === 'ar' ? 'يرجى إدخال الاسم الكامل' : 'Please enter your full name');
      return;
    }

    if (!phone.trim() || phone.length < 8) {
      setError(lang === 'ar' ? 'يرجى إدخال رقم هاتف صحيح' : 'Please enter a valid phone number');
      return;
    }

    if (!service) {
      setError(lang === 'ar' ? 'يرجى اختيار نوع الخدمة' : 'Please select a service type');
      return;
    }

    setLoading(true);

    try {
      const device = detectDeviceType();
      
      // Save directly to raw Firebase Firestore 'customers' collection with Duplicate Detection
      const serviceMap: Record<string, string> = {
        student_housing: "سكن طلاب (ذكور)",
        female_housing: "سكن طالبات (إناث)",
        rentals: "إيجار شقق عائلية",
        sales: "شقق وعقارات للبيع",
        maintenance: "خدمات الصيانة المنزلية"
      };
      const serviceLabel = serviceMap[service] || service;
      
      await registerOrUpdateFirebaseCustomer(name.trim(), phone.trim(), serviceLabel);

      // Register custom telemetry metadata to SQLite/Firestore mirrored mock DB
      const result = registerCustomer({
        fullName: name.trim(),
        phoneNumber: phone.trim(),
        serviceType: service,
        deviceType: device,
        language: lang
      });

      // Also persist the direct profile token locally to auto-bypass this screen in successive sessions (sessionStorage ensures it is temporary)
      sessionStorage.setItem('dark_user_profile', JSON.stringify(result));
      sessionStorage.setItem('dark_user_profile_timestamp', String(Date.now()));
      localStorage.setItem('dark_lang', lang);

      setLoading(false);
      onComplete(lang, service);
    } catch (err: any) {
      console.error(err);
      let detailedMsg = '';
      try {
        const parsed = JSON.parse(err.message);
        detailedMsg = parsed.error || '';
      } catch (e) {
        detailedMsg = err.message || String(err);
      }

      // Check if it's a security rules permission error
      if (detailedMsg.toLowerCase().includes('permission') || detailedMsg.toLowerCase().includes('denied')) {
        setError(
          lang === 'ar'
            ? '⚠️ تم رفض الاتصال بـ Firebase (صلاحية غير كافية). يرجى فتح لوحة تحكم Firebase وتعديل قواعد الحماية (Rules) لقاعدة بيانات Firestore لتسمح بإنشاء الطلبات، أو تفعيل وضع التجربة (Test Mode).'
            : '⚠️ Firebase Permission Denied. Please open your Firebase Console and update your Firestore rules to allow creation, or enable Test Mode.'
        );
      } else {
        setError(
          lang === 'ar'
            ? `فشل إرسال الطلب عبر الشبكة: ${detailedMsg}`
            : `Submission failed: ${detailedMsg}`
        );
      }
      setLoading(false);
    }
  };

  const isRtl = lang === 'ar';

  return (
    <div 
      className="fixed inset-0 z-40 overflow-y-auto bg-slate-950"
      dir={isRtl ? 'rtl' : 'ltr'}
    >
      {/* Background Cinematic Overlay - fixed to cover whole viewport */}
      <div 
        className="fixed inset-0 bg-cover bg-center bg-no-repeat opacity-25"
        style={{ backgroundImage: `url('https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1920&q=80')` }}
      />
      <div className="fixed inset-0 bg-gradient-to-tr from-[#163B63]/90 via-slate-950/95 to-transparent" />

      {/* Centering Wrapper for responsive height scrolling */}
      <div className="relative min-h-full flex items-center justify-center p-3 sm:p-6 z-10">
        {/* Main card */}
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full max-w-xl bg-white/5 border border-white/10 backdrop-blur-2xl rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl p-5 sm:p-8 my-auto"
        >
          {/* Card Header Bar with Logo and Rounded Language Quick Selector */}
          <div className="flex justify-between items-center mb-6 pb-4 border-b border-white/5">
            <div className="flex items-center gap-2 sm:gap-2.5">
              <Logo variant="registration" />
            </div>
            
            <div className="flex items-center gap-2">
              {/* Dynamic Refresh Button */}
              {onRefresh && (
                <button
                  type="button"
                  onClick={onRefresh}
                  disabled={isRefreshing}
                  className="w-8.5 h-8.5 rounded-full flex items-center justify-center bg-slate-950/65 hover:bg-slate-900 border border-[#C9A14A]/40 hover:border-[#C9A14A] shadow-[0_4px_12px_rgba(0,0,0,0.4)] text-[#C9A14A] active:scale-95 transition-all cursor-pointer shrink-0 disabled:opacity-60 disabled:cursor-not-allowed"
                  title={lang === 'ar' ? 'تحديث البيانات' : 'Refresh Data'}
                  id="login-refresh-btn"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
                </button>
              )}

              {/* Stylish Circular Toggle Button */}
              <button
                type="button"
                onClick={() => setLang(lang === 'ar' ? 'en' : 'ar')}
                className="w-8.5 h-8.5 rounded-full flex items-center justify-center bg-slate-950/65 hover:bg-slate-900 border border-[#C9A14A]/40 hover:border-[#C9A14A] shadow-[0_4px_12px_rgba(0,0,0,0.4)] text-white hover:text-[#C9A14A] active:scale-95 transition-all group cursor-pointer shrink-0"
                title={lang === 'ar' ? 'Change to English' : 'تغيير إلى العربية'}
              >
                <span className="text-[9px] sm:text-[10px] font-extrabold font-arabic text-[#C9A14A] group-hover:scale-105 transition-transform">
                  {lang === 'ar' ? 'EN' : 'عربي'}
                </span>
              </button>
            </div>
          </div>

          {/* Glow accents */}
          <div className="absolute -top-12 -left-12 w-32 h-32 bg-[#C9A14A]/10 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -bottom-12 -right-12 w-32 h-32 bg-[#163B63]/30 rounded-full blur-2xl pointer-events-none" />

          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center p-2.5 rounded-xl bg-[#C9A14A]/10 border border-[#C9A14A]/20 mb-3">
              <ShieldCheck className="w-6.5 h-6.5 text-[#C9A14A]" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white font-arabic">
              {getTranslation(lang, 'registrationTitle')}
            </h2>
            <p className="text-[11px] sm:text-xs text-gray-300 mt-1.5 font-light max-w-sm mx-auto leading-relaxed">
              {getTranslation(lang, 'registrationSub')}
            </p>
          </div>

          {error && (
            <div className="mb-4 p-2.5 bg-red-500/20 border border-red-500/30 text-red-200 text-xs text-center rounded-lg font-medium animate-shake">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name */}
            <div className="flex flex-col">
              <label className="text-white text-[11px] font-semibold mb-1.5 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-[#C9A14A]" />
                <span>{lang === 'ar' ? 'الاسم الكامل' : 'Full Name'}</span>
                <span className="text-[#C9A14A]">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={getTranslation(lang, 'fullNamePlaceholder')}
                  className={`w-full px-3.5 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 text-xs sm:text-sm focus:outline-none focus:border-[#C9A14A] transition-all ${
                    isRtl ? 'pr-9 pl-4' : 'pl-9 pr-4'
                  }`}
                  required
                />
                <span className={`absolute top-1/2 -translate-y-1/2 ${isRtl ? 'right-3' : 'left-3'} text-gray-400`}>
                  <User className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>

            {/* Phone Number */}
            <div className="flex flex-col">
              <label className="text-white text-[11px] font-semibold mb-1.5 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-[#C9A14A]" />
                <span>{lang === 'ar' ? 'رقم الهاتف' : 'Phone Number'}</span>
                <span className="text-[#C9A14A]">*</span>
              </label>
              <div className="relative">
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder={getTranslation(lang, 'phonePlaceholder')}
                  className={`w-full px-3.5 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 text-xs sm:text-sm focus:outline-none focus:border-[#C9A14A] transition-all ${
                    isRtl ? 'pr-9 pl-4' : 'pl-9 pr-4'
                  }`}
                  required
                />
                <span className={`absolute top-1/2 -translate-y-1/2 ${isRtl ? 'right-3' : 'left-3'} text-gray-400`}>
                  <Phone className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>

            {/* Service Type Selection - Premium Custom Select Menu */}
            <div className="flex flex-col relative">
              <label className="text-white text-[11px] font-semibold mb-1.5 flex items-center gap-1.5">
                <Home className="w-3.5 h-3.5 text-[#C9A14A]" />
                <span>{getTranslation(lang, 'serviceTypeLabel')}</span>
                <span className="text-[#C9A14A]">*</span>
              </label>
              
              <div className="relative">
                <select
                  value={service}
                  onChange={(e) => setService(e.target.value)}
                  className={`w-full py-2.5 bg-slate-900/90 border border-white/10 hover:border-[#C9A14A]/40 focus:border-[#C9A14A] rounded-xl text-white text-xs sm:text-sm font-bold font-arabic cursor-pointer transition-all duration-300 focus:outline-none focus:ring-1 focus:ring-[#C9A14A] appearance-none ${
                    isRtl ? 'pl-10 pr-3.5 text-right' : 'pr-10 pl-3.5 text-left'
                  } ${service === '' ? 'text-gray-400' : 'text-white'}`}
                  dir={isRtl ? 'rtl' : 'ltr'}
                >
                  <option 
                    value="" 
                    disabled
                    className="bg-slate-950 text-gray-400 font-bold font-arabic"
                  >
                    {lang === 'ar' ? 'اضغط لاختيار الخدمة' : 'Click to select service'}
                  </option>
                  {[
                    { id: 'student_housing', arName: 'سكن طلاب', enName: 'Student Housing (Males)' },
                    { id: 'female_housing', arName: 'سكن طالبات', enName: 'Student Housing (Females)' },
                    { id: 'rentals', arName: 'إيجار شقق عائلية', enName: 'Apartment Rentals' },
                    { id: 'sales', arName: 'شقق وعقارات للبيع', enName: 'Properties for Sale' },
                    { id: 'maintenance', arName: 'خدمات الصيانة المنزلية', enName: 'Home Maintenance Repairs' }
                  ].map((s) => (
                    <option 
                      key={s.id} 
                      value={s.id} 
                      className="bg-slate-950 text-white font-semibold font-arabic"
                    >
                      {lang === 'ar' ? s.arName : s.enName}
                    </option>
                  ))}
                </select>

                {/* Custom arrow positioned absolutely on top of native arrow */}
                <div className={`absolute top-1/2 -translate-y-1/2 pointer-events-none ${isRtl ? 'left-3.5' : 'right-3.5'}`}>
                  <ChevronDown className="w-4 h-4 text-[#C9A14A]" />
                </div>
              </div>
            </div>

            {/* Submit Action */}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-4 bg-gradient-to-r from-[#C9A14A] to-[#E3C380] hover:scale-[1.01] active:scale-[0.99] text-[#163B63] font-bold text-xs sm:text-sm py-3 rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-[#C9A14A]/10 transition-all duration-300"
            >
              {loading ? (
                <div className="w-4.5 h-4.5 border-2 border-[#163B63] border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>{getTranslation(lang, 'startBrowsingBtn')}</span>
                  <ArrowRight className={`w-3.5 h-3.5 transition-transform ${isRtl ? 'rotate-180' : ''}`} />
                </>
              )}
            </button>
          </form>

          {/* Footer info lock */}
          <div className="flex items-center justify-center gap-1.5 mt-5 text-[9px] text-gray-500 font-mono text-center select-none uppercase">
            <span>SECURED SYSTEM</span>
            <span className="text-[#C9A14A]">•</span>
            <span>SSL 256BIT</span>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
