import React, { FC, useRef } from 'react';
import { motion } from 'motion/react';
import { 
  GraduationCap, 
  Building2, 
  KeyRound, 
  Wrench, 
  Users, 
  UserSquare, 
  Home, 
  Compass, 
  Zap, 
  Droplet, 
  Wind, 
  Paintbrush,
  MapPin,
  FlameKindling,
  Bed,
  Layers,
  ArrowLeftRight,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { Language } from '../types';
import { getProperties } from '../lib/db';
import { getTranslation } from '../lib/translations';

interface ServicesDirectoryProps {
  lang: Language;
  onNavigate: (tab: string, filters?: any) => void;
}

export const ServicesDirectory: FC<ServicesDirectoryProps> = ({ lang, onNavigate }) => {
  const isRtl = lang === 'ar';

  const studentScrollRef = useRef<HTMLDivElement>(null);
  const rentalsScrollRef = useRef<HTMLDivElement>(null);
  const salesScrollRef = useRef<HTMLDivElement>(null);

  const scrollContainer = (ref: React.RefObject<HTMLDivElement>, direction: 'next' | 'prev') => {
    if (ref.current) {
      const scrollAmount = 260;
      const multiplier = isRtl ? -1 : 1;
      const offset = direction === 'next' ? scrollAmount * multiplier : -scrollAmount * multiplier;
      ref.current.scrollBy({
        left: offset,
        behavior: 'smooth'
      });
    }
  };

  // Fetch actual properties from localStorage/db dynamically to showcase their real data/images
  const allProperties = getProperties();
  const studentProperties = allProperties.filter(
    (p) => p.category === 'student_housing'
  );
  const familyProperties = allProperties.filter(
    (p) => p.category === 'family_rentals'
  );
  const salesProperties = allProperties.filter(
    (p) => p.category === 'property_sales'
  );

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US').format(price);
  };

  const departments = [
    {
      id: 'student_housing_dept',
      title: isRtl ? '1. السكن الطلابي المجهز' : '1. Student Housing Solutions',
      tagline: isRtl ? 'بجوار الحرم الجامعي والمواصلات' : 'Adjacent to University Campus & Services',
      desc: isRtl 
        ? 'وحدات مجهزة بالكامل ومغلقة للطالبات أو مخصصة للطلاب المغتربين، خاضعة للإشراف والصيانة والمتابعة المستمرة للحفاظ على الهدوء.' 
        : 'Fully-equipped, safe, and supervised single/shared student accommodations near Qena universities.',
      icon: GraduationCap,
      color: 'from-amber-500/10 to-amber-600/10 border-amber-500/20 text-amber-600 dark:text-amber-400',
      iconBg: 'bg-amber-100 dark:bg-amber-950/40',
      tabId: 'student_housing',
      items: [
        {
          id: 'student_male',
          label: isRtl ? 'سكن طلاب (شباب)' : 'Student Housing (Males)',
          sub: isRtl ? 'بأسعار تبدأ من 900ج' : 'Starting from 900 EGP',
          icon: Users,
          action: () => onNavigate('student_housing', { gender: 'male' })
        },
        {
          id: 'student_female',
          label: isRtl ? 'سكن طالبات (إناث)' : 'Student Housing (Females)',
          sub: isRtl ? 'أمان تام ومواقع ممتازة' : 'Secure & Premium Locations',
          icon: UserSquare,
          action: () => onNavigate('student_housing', { gender: 'female' })
        }
      ]
    },
    {
      id: 'rentals_dept',
      title: isRtl ? '2. شقق عائلية للإيجار' : '2. Family & Professional Rentals',
      tagline: isRtl ? 'عقود مرنة وتشطيبات سوبر لوكس' : 'Flexible Contracts & Premium Finishes',
      desc: isRtl 
        ? 'شقق، استوديوهات، ووحدات سكنية في أرقى أحياء قنا تناسب العائلات والأطباء والمهندسين المغتربين بتشطيبات راقية.' 
        : 'Premium residential apartments, lofts, and boutique studios tailored for families and corporate clients.',
      icon: Building2,
      color: 'from-blue-500/10 to-blue-600/10 border-blue-500/20 text-blue-600 dark:text-blue-450',
      iconBg: 'bg-blue-100 dark:bg-blue-950/40',
      tabId: 'family_rentals',
      items: [
        {
          id: 'apartments_rent',
          label: isRtl ? 'شقق للإيجار' : 'Apartments for Rent',
          sub: isRtl ? 'إيجار شهري وسنوي' : 'Monthly & Annual Contracts',
          icon: Home,
          action: () => onNavigate('family_rentals', { type: 'apartment' })
        },
        {
          id: 'studios_rent',
          label: isRtl ? 'استوديوهات فاخرة' : 'Boutique Studios',
          sub: isRtl ? 'إقامة مريحة لشخصين' : 'Perfect for 1-2 persons',
          icon: Compass,
          action: () => onNavigate('family_rentals', { type: 'studio' })
        }
      ]
    },
    {
      id: 'sales_dept',
      title: isRtl ? '3. عقارات للبيع والشراء' : '3. Elite Properties for Sale',
      tagline: isRtl ? 'استثمر في مستقبلك بأفضل تطابيق قنا' : 'Secure Investment & Top Locations',
      desc: isRtl 
        ? 'فرص استثمارية واعدة وعقارات سكنية متميزة أو أراضٍ بمستندات قانونية واضحة وموثقة تضمن نمو أصولك المالية.' 
        : 'Excellent high-yield developments, prime lands, and luxury apartments for sale in high-demand, high-growth spots.',
      icon: KeyRound,
      color: 'from-emerald-500/10 to-emerald-600/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400',
      iconBg: 'bg-emerald-100 dark:bg-emerald-950/40',
      tabId: 'property_sales',
      items: [
        {
          id: 'apartments_sale',
          label: isRtl ? 'شقق تمليك للبيع' : 'Apartments for Sale',
          sub: isRtl ? 'تسهيلات في السداد والدفع' : 'Flexible Payment Plans',
          icon: Home,
          action: () => onNavigate('property_sales', { type: 'apartment' })
        },
        {
          id: 'lands_sale',
          label: isRtl ? 'أراضٍ وعقارات للبيع' : 'Lands & Estates for Sale',
          sub: isRtl ? 'مواقع ممتازة جاهزة للبناء' : 'Ready for Construction',
          icon: Compass,
          action: () => onNavigate('property_sales', { type: 'land' })
        }
      ]
    },
    {
      id: 'maintenance_dept',
      title: isRtl ? '4. الصيانة المنزلية والتركيبات' : '4- Professional Home Maintenance',
      tagline: isRtl ? 'فنيين مدربين وخدمة فورية عاجلة' : 'Certified Technicians & Fast Support',
      desc: isRtl 
        ? 'خدمات معالجة فورية وتأسيس صيانة سباكة، كهرباء، تكييف، دهانات على مدار الساعة لجميع شقق وعقارات عملاء دارك.' 
        : 'On-demand home repairs, electrical diagnostic, air conditioning setup and decoration by licensed specialists.',
      icon: Wrench,
      color: 'from-rose-500/10 to-rose-600/10 border-rose-500/20 text-rose-600 dark:text-rose-400',
      iconBg: 'bg-rose-100 dark:bg-rose-950/40',
      tabId: 'maintenance_services',
      items: [
        {
          id: 'plumbing',
          label: isRtl ? 'خدمات السباكة' : 'Plumbing Support',
          sub: isRtl ? 'كشف تسريبات وصيانة شبكات' : 'Leak Detection & Pipe Fixes',
          icon: Droplet,
          action: () => onNavigate('maintenance_services', { category: 'سباكة' })
        },
        {
          id: 'electricity',
          label: isRtl ? 'أعمال الكهرباء' : 'Electrical Works',
          sub: isRtl ? 'تأسيس ومطابقة الأحمال' : 'Short Circuit & Setup',
          icon: Zap,
          action: () => onNavigate('maintenance_services', { category: 'كهرباء' })
        },
        {
          id: 'ac',
          label: isRtl ? 'غسيل وصيانة تكييف' : 'A/C Servicing',
          sub: isRtl ? 'شحن فريون وتنظيف وحدات' : 'Eco-recharge & Cleans',
          icon: Wind,
          action: () => onNavigate('maintenance_services', { category: 'تكييف' })
        },
        {
          id: 'decor',
          label: isRtl ? 'دهانات وديكورات' : 'Painting & Velvet Decor',
          sub: isRtl ? 'عزل رطوبة وتشطيب مودرن' : 'Moisture Isolation & Paint',
          icon: Paintbrush,
          action: () => onNavigate('maintenance_services', { category: 'دهانات' })
        }
      ]
    }
  ];

  return (
    <div className="space-y-10 animate-fadeIn" dir={isRtl ? 'rtl' : 'ltr'}>
      {/* Header design with high contrast, elegant gold elements & brand accents */}
      <div className="text-center space-y-4 max-w-3xl mx-auto px-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#C9A14A]/10 text-[#C9A14A] rounded-full text-[11px] font-bold tracking-wider uppercase select-none">
          <FlameKindling className="w-3.5 h-3.5 animate-pulse" />
          <span>{isRtl ? 'دليل الخدمات الحصرية المعتمدة' : 'Official Exclusive Service Directory'}</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-extrabold text-[#163B63] dark:text-white font-arabic tracking-tight">
          {isRtl ? 'أقسام خدمات دارك العقارية الفاخرة' : 'Dark Real Estate Curated Service Departments'}
        </h1>
        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 font-normal leading-relaxed max-w-xl mx-auto">
          {isRtl 
            ? 'تصفح جميع الخدمات والحلول العقارية المنظمة بشكل كامل وموحد لمساعدتكم في تلبية طلباتكم من السكن أو المبيعات أو الصيانة معاً.' 
            : 'Access all categories in one harmonized layout. Explore certified student apartments, premium family rentals, investment sales, and on-demand plumbing or conditioning repair.'}
        </p>
        <div className="flex justify-center items-center gap-1.5 pt-1">
          <div className="w-10 h-1 bg-[#163B63] dark:bg-white rounded-full" />
          <div className="w-4 h-1 bg-[#C9A14A] rounded-full" />
          <div className="w-1.5 h-1 bg-[#163B63] dark:bg-white rounded-full" />
        </div>
      </div>

      {/* Main Grid layout with maximum height symmetry, balanced responsive behavior, and clear negative spaces */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch pt-2 px-1 max-w-7xl mx-auto">
        {departments.map((dept, index) => {
          const DeptIcon = dept.icon;
          return (
            <motion.div 
              key={dept.id} 
              id={dept.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.4 }}
              className="group rounded-2xl border border-gray-150/70 dark:border-gray-800/80 bg-white dark:bg-slate-900/90 p-5 sm:p-6 shadow-sm hover:shadow-lg hover:border-[#C9A14A]/35 transition-all duration-300 relative overflow-hidden flex flex-col justify-between"
            >
              {/* Premium dark brand gold gradient cover bar */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#163B63] via-[#C9A14A] to-emerald-500 opacity-60" />
              
              {/* Corner decorative light effect */}
              <div className="absolute top-0 right-0 -translate-y-8 translate-x-8 w-28 h-28 bg-[#C9A14A]/5 rounded-full blur-2xl pointer-events-none group-hover:bg-[#C9A14A]/10 transition-colors" />

              <div className="space-y-4">
                {/* Department Brand Emblem and Title block */}
                <div className="flex items-start gap-3.5">
                  <div className={`p-3 rounded-xl ${dept.iconBg} ${dept.color} shadow-sm shrink-0 mt-0.5`}>
                    <DeptIcon className="w-6 h-6" />
                  </div>
                  <div className="space-y-1">
                    <h2 className="text-lg font-extrabold text-[#163B63] dark:text-white font-arabic tracking-wide flex items-center gap-2">
                      {dept.title}
                    </h2>
                    <span className="inline-block text-[10px] font-bold text-[#C9A14A] bg-[#C9A14A]/10 px-2 py-0.5 rounded-md font-arabic">
                      {dept.tagline}
                    </span>
                    <p className="text-xs text-gray-500 dark:text-gray-400 font-normal leading-relaxed pt-1 select-text">
                      {dept.desc}
                    </p>
                  </div>
                </div>

                {/* Sub-services catalog directory: equal sizing, clean spacing */}
                <div className="pt-2">
                  <h3 className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2.5 font-sans">
                    {isRtl ? 'الخدمات الفرعية المتاحة حالياً:' : 'Available Curated Services:'}
                  </h3>
                  <div className={`grid gap-3 ${dept.items.length > 2 ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1 sm:grid-cols-2'}`}>
                    {dept.items.map((item) => {
                      const ItemIcon = item.icon;
                      return (
                        <button
                          key={item.id}
                          id={`btn-${item.id}`}
                          onClick={item.action}
                          className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-slate-800/80 border border-gray-150/40 dark:border-gray-750 hover:border-[#C9A14A]/30 text-[#163B63] dark:text-slate-200 hover:text-[#C9A14A] dark:hover:text-[#C9A14A] hover:bg-white dark:hover:bg-slate-800 transition-all text-sm font-semibold text-right cursor-pointer shadow-sm group select-none active:scale-97"
                        >
                          <div className="p-2 rounded-lg bg-white dark:bg-slate-700 text-gray-500 dark:text-gray-400 group-hover:text-[#C9A14A] group-hover:bg-[#C9A14A]/10 transition-colors shrink-0">
                            <ItemIcon className="w-4 h-4" />
                          </div>
                          <div className="flex flex-col text-right items-start overflow-hidden leading-tight">
                            <span className="font-arabic font-extrabold text-xs truncate max-w-full">
                              {item.label}
                            </span>
                            <span className="text-[9px] font-light text-gray-400 dark:text-gray-500 mt-0.5 font-sans truncate">
                              {item.sub}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* INTEGRATED PROPERTY SLIDER GALLERY: Only inside Student Housing Card (satisfies request) */}
                {dept.id === 'student_housing_dept' && studentProperties.length > 0 && (
                  <div className="pt-3 border-t border-gray-100 dark:border-gray-800/50 mt-1">
                    <div className="flex items-center justify-between pb-3">
                       <span className="text-[11px] font-extrabold text-[#163B63] dark:text-slate-300 font-arabic flex items-center gap-1.5">
                         <span className="inline-block w-1.5 h-3.5 bg-amber-500 rounded-sm"></span>
                         {isRtl ? '📷 معرض الشقق المغردة بالصور المضافة:' : '📷 Real Visual Apartment Previews:'}
                       </span>
                       
                       {/* Elegant Slide Flip Controls for Phone */}
                       <div className="flex items-center gap-1 bg-gray-50 dark:bg-slate-800/80 p-0.5 rounded-lg border border-gray-100 dark:border-gray-700/65 shadow-sm shrink-0 select-none">
                         <button
                           type="button"
                           onClick={(e) => {
                             e.stopPropagation();
                             scrollContainer(studentScrollRef, 'prev');
                           }}
                           className="w-7 h-7 rounded-md bg-white dark:bg-slate-700 text-[#C9A14A] hover:bg-[#C9A14A]/10 active:scale-90 transition-all flex items-center justify-center cursor-pointer border border-transparent shadow-xs"
                           title={isRtl ? "شريحة سابقة" : "Previous"}
                         >
                           <ChevronRight className="w-4 h-4" />
                         </button>
                         <span className="text-[9.5px] text-amber-600 dark:text-amber-400 font-extrabold px-1 font-sans min-w-[20px] text-center">
                           {studentProperties.length}
                         </span>
                         <button
                           type="button"
                           onClick={(e) => {
                             e.stopPropagation();
                             scrollContainer(studentScrollRef, 'next');
                           }}
                           className="w-7 h-7 rounded-md bg-white dark:bg-slate-700 text-[#C9A14A] hover:bg-[#C9A14A]/10 active:scale-90 transition-all flex items-center justify-center cursor-pointer border border-transparent shadow-xs"
                           title={isRtl ? "شريحة تالية" : "Next"}
                         >
                           <ChevronLeft className="w-4 h-4" />
                         </button>
                       </div>
                    </div>

                    {/* Horizontal scroll container with snap capability - completely responsive & beautifully polished */}
                    <div 
                      ref={studentScrollRef} 
                      className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin scrollbar-current snap-x snap-mandatory scroll-smooth"
                    >
                      {studentProperties.map((prop) => {
                        const directImg = prop.imageUrls && prop.imageUrls.length > 0 ? prop.imageUrls[0] : 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=400&q=80';
                        return (
                          <div 
                            key={prop.id}
                            onClick={() => onNavigate('student_housing')}
                            className="flex-shrink-0 w-60 snap-start bg-gray-50 dark:bg-slate-800/40 rounded-xl border border-gray-150/50 dark:border-gray-750 p-2 hover:border-[#C9A14A]/40 transition-all cursor-pointer group/item select-none"
                          >
                            <div className="relative h-24 rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-900">
                              <img
                                src={directImg}
                                alt={isRtl ? prop.title_ar : prop.title_en}
                                loading="lazy"
                                referrerPolicy="no-referrer"
                                className="w-full h-full object-cover group-hover/item:scale-105 transition-transform duration-300"
                                onError={(e) => {
                                  // Fallback graceful UI rendering representation if third party asset block
                                  e.currentTarget.src = 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=400&q=80';
                                }}
                              />
                              <div className="absolute bottom-1 right-1 bg-[#163B63]/90 text-white text-[9px] font-extrabold px-1.5 py-0.5 rounded font-arabic">
                                {prop.type === 'student_female' ? (isRtl ? 'إناث' : 'Females') : (isRtl ? 'ذكور' : 'Males')}
                              </div>
                              <div className="absolute top-1 left-1 bg-emerald-500 text-white text-[9.5px] font-bold px-1.5 py-0.5 rounded-full font-sans">
                                {formatPrice(prop.price)} {getTranslation(lang, 'currency')}
                              </div>
                            </div>
                            <div className="pt-1.5 px-0.5 space-y-1">
                              <h4 className="text-[11px] font-extrabold font-arabic text-gray-800 dark:text-gray-200 line-clamp-1 group-hover/item:text-[#C9A14A] transition-colors">
                                {isRtl ? prop.title_ar : prop.title_en}
                              </h4>
                              <div className="flex items-center gap-1 text-[9px] text-gray-400">
                                <MapPin className="w-2.5 h-2.5 shrink-0 text-[#C9A14A]" />
                                <span className="truncate">{isRtl ? prop.location_ar : prop.location_en}</span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    <p className="text-[9px] text-[#C9A14A] font-bold font-arabic mt-1 mb-0 flex items-center gap-1">
                      <span>💡</span>
                      <span>{isRtl ? 'انقر على أي شقة بالأعلى لزيارتها وحجز سريرك مباشرةً.' : 'Click on any preview above to view detailed bedding layout.'}</span>
                    </p>
                  </div>
                )}

                {/* INTEGRATED PROPERTY SLIDER GALLERY: Family Rentals */}
                {dept.id === 'rentals_dept' && familyProperties.length > 0 && (
                  <div className="pt-3 border-t border-gray-100 dark:border-gray-800/50 mt-1">
                    <div className="flex items-center justify-between pb-3">
                       <span className="text-[11px] font-extrabold text-[#163B63] dark:text-slate-300 font-arabic flex items-center gap-1.5">
                         <span className="inline-block w-1.5 h-3.5 bg-blue-500 rounded-sm"></span>
                         {isRtl ? '🏠 الشقق العائلية المتاحة حالياً بالصور:' : '🏠 Available Family Apartments:'}
                       </span>
                       
                       {/* Elegant Slide Flip Controls for Phone */}
                       <div className="flex items-center gap-1 bg-gray-50 dark:bg-slate-800/80 p-0.5 rounded-lg border border-gray-100 dark:border-gray-770 shadow-sm shrink-0 select-none">
                         <button
                           type="button"
                           onClick={(e) => {
                             e.stopPropagation();
                             scrollContainer(rentalsScrollRef, 'prev');
                           }}
                           className="w-7 h-7 rounded-md bg-white dark:bg-slate-700 text-[#C9A14A] hover:bg-[#C9A14A]/10 active:scale-90 transition-all flex items-center justify-center cursor-pointer border border-transparent shadow-xs"
                           title={isRtl ? "شريحة سابقة" : "Previous"}
                         >
                           <ChevronRight className="w-4 h-4" />
                         </button>
                         <span className="text-[9.5px] text-blue-600 dark:text-blue-400 font-extrabold px-1 font-sans min-w-[20px] text-center">
                           {familyProperties.length}
                         </span>
                         <button
                           type="button"
                           onClick={(e) => {
                             e.stopPropagation();
                             scrollContainer(rentalsScrollRef, 'next');
                           }}
                           className="w-7 h-7 rounded-md bg-white dark:bg-slate-700 text-[#C9A14A] hover:bg-[#C9A14A]/10 active:scale-90 transition-all flex items-center justify-center cursor-pointer border border-transparent shadow-xs"
                           title={isRtl ? "شريحة تالية" : "Next"}
                         >
                           <ChevronLeft className="w-4 h-4" />
                         </button>
                       </div>
                    </div>

                    <div 
                      ref={rentalsScrollRef} 
                      className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin scrollbar-current snap-x snap-mandatory scroll-smooth"
                    >
                      {familyProperties.map((prop) => {
                        const directImg = prop.imageUrls && prop.imageUrls.length > 0 ? prop.imageUrls[0] : 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=400&q=80';
                        return (
                          <div 
                            key={prop.id}
                            onClick={() => onNavigate('family_rentals')}
                            className="flex-shrink-0 w-60 snap-start bg-gray-50 dark:bg-slate-800/40 rounded-xl border border-gray-150/50 dark:border-gray-750 p-2 hover:border-[#C9A14A]/40 transition-all cursor-pointer group/item select-none"
                          >
                            <div className="relative h-24 rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-900">
                              <img
                                src={directImg}
                                alt={isRtl ? prop.title_ar : prop.title_en}
                                loading="lazy"
                                referrerPolicy="no-referrer"
                                className="w-full h-full object-cover group-hover/item:scale-105 transition-transform duration-300"
                                onError={(e) => {
                                  e.currentTarget.src = 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=400&q=80';
                                }}
                              />
                              <div className="absolute bottom-1 right-1 bg-[#163B63]/90 text-white text-[9px] font-extrabold px-1.5 py-0.5 rounded font-arabic">
                                {isRtl ? 'إيجار عائلي' : 'Family Rent'}
                              </div>
                              <div className="absolute top-1 left-1 bg-blue-500 text-white text-[9.5px] font-bold px-1.5 py-0.5 rounded-full font-sans">
                                {formatPrice(prop.price)} {getTranslation(lang, 'currency')}
                              </div>
                            </div>
                            <div className="pt-1.5 px-0.5 space-y-1">
                              <h4 className="text-[11px] font-extrabold font-arabic text-gray-800 dark:text-gray-200 line-clamp-1 group-hover/item:text-[#C9A14A] transition-colors">
                                {isRtl ? prop.title_ar : prop.title_en}
                              </h4>
                              <div className="flex items-center gap-1 text-[9px] text-gray-400">
                                <MapPin className="w-2.5 h-2.5 shrink-0 text-[#C9A14A]" />
                                <span className="truncate">{isRtl ? prop.location_ar : prop.location_en}</span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    <p className="text-[9px] text-[#C9A14A] font-bold font-arabic mt-1 mb-0 flex items-center gap-1">
                      <span>💡</span>
                      <span>{isRtl ? 'انقر على الشقة لاستعراض المواصفات وحجز موعد معاينة فوراً.' : 'Click to inspect specs or book a physical viewing.'}</span>
                    </p>
                  </div>
                )}

                {/* INTEGRATED PROPERTY SLIDER GALLERY: Sales */}
                {dept.id === 'sales_dept' && salesProperties.length > 0 && (
                  <div className="pt-3 border-t border-gray-100 dark:border-gray-800/50 mt-1">
                    <div className="flex items-center justify-between pb-3">
                       <span className="text-[11px] font-extrabold text-[#163B63] dark:text-slate-300 font-arabic flex items-center gap-1.5">
                         <span className="inline-block w-1.5 h-3.5 bg-[#C9A14A] rounded-sm"></span>
                         {isRtl ? '💎 عقارات مميزة للبيع والتمليك:' : '💎 Featured Properties for Sale:'}
                       </span>
                       
                       {/* Elegant Slide Flip Controls for Phone */}
                       <div className="flex items-center gap-1 bg-gray-50 dark:bg-slate-800/80 p-0.5 rounded-lg border border-gray-100 dark:border-gray-770 shadow-sm shrink-0 select-none">
                         <button
                           type="button"
                           onClick={(e) => {
                             e.stopPropagation();
                             scrollContainer(salesScrollRef, 'prev');
                           }}
                           className="w-7 h-7 rounded-md bg-white dark:bg-slate-700 text-[#C9A14A] hover:bg-[#C9A14A]/10 active:scale-90 transition-all flex items-center justify-center cursor-pointer border border-transparent shadow-xs"
                           title={isRtl ? "شريحة سابقة" : "Previous"}
                         >
                           <ChevronRight className="w-4 h-4" />
                         </button>
                         <span className="text-[9.5px] text-emerald-600 dark:text-emerald-400 font-extrabold px-1 font-sans min-w-[20px] text-center">
                           {salesProperties.length}
                         </span>
                         <button
                           type="button"
                           onClick={(e) => {
                             e.stopPropagation();
                             scrollContainer(salesScrollRef, 'next');
                           }}
                           className="w-7 h-7 rounded-md bg-white dark:bg-slate-700 text-[#C9A14A] hover:bg-[#C9A14A]/10 active:scale-90 transition-all flex items-center justify-center cursor-pointer border border-transparent shadow-xs"
                           title={isRtl ? "شريحة تالية" : "Next"}
                         >
                           <ChevronLeft className="w-4 h-4" />
                         </button>
                       </div>
                    </div>

                    <div 
                      ref={salesScrollRef} 
                      className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin scrollbar-current snap-x snap-mandatory scroll-smooth"
                    >
                      {salesProperties.map((prop) => {
                        const directImg = prop.imageUrls && prop.imageUrls.length > 0 ? prop.imageUrls[0] : 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=400&q=80';
                        return (
                          <div 
                            key={prop.id}
                            onClick={() => onNavigate('property_sales')}
                            className="flex-shrink-0 w-60 snap-start bg-gray-50 dark:bg-slate-800/40 rounded-xl border border-gray-150/50 dark:border-gray-750 p-2 hover:border-[#C9A14A]/40 transition-all cursor-pointer group/item select-none"
                          >
                            <div className="relative h-24 rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-900">
                              <img
                                src={directImg}
                                alt={isRtl ? prop.title_ar : prop.title_en}
                                loading="lazy"
                                referrerPolicy="no-referrer"
                                className="w-full h-full object-cover group-hover/item:scale-105 transition-transform duration-300"
                                onError={(e) => {
                                  e.currentTarget.src = 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=400&q=80';
                                }}
                              />
                              <div className="absolute bottom-1 right-1 bg-emerald-600/90 text-white text-[9px] font-extrabold px-1.5 py-0.5 rounded font-arabic">
                                {isRtl ? 'للبيع' : 'For Sale'}
                              </div>
                              <div className="absolute top-1 left-1 bg-emerald-500 text-white text-[9.5px] font-bold px-1.5 py-0.5 rounded-full font-sans">
                                {formatPrice(prop.price)} {getTranslation(lang, 'currency')}
                              </div>
                            </div>
                            <div className="pt-1.5 px-0.5 space-y-1">
                              <h4 className="text-[11px] font-extrabold font-arabic text-gray-800 dark:text-gray-200 line-clamp-1 group-hover/item:text-[#C9A14A] transition-colors">
                                {isRtl ? prop.title_ar : prop.title_en}
                              </h4>
                              <div className="flex items-center gap-1 text-[9px] text-gray-400">
                                <MapPin className="w-2.5 h-2.5 shrink-0 text-[#C9A14A]" />
                                <span className="truncate">{isRtl ? prop.location_ar : prop.location_en}</span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    <p className="text-[9px] text-[#C9A14A] font-bold font-arabic mt-1 mb-0 flex items-center gap-1">
                      <span>💡</span>
                      <span>{isRtl ? 'انقر على العقار لمعاينة المستندات القانونية وتفاصيل السعر والاستلام.' : 'Click to inspect legal titles, pricing structure & delivery details.'}</span>
                    </p>
                  </div>
                )}
              </div>

              {/* Card Footer prompt */}
              <div 
                onClick={() => onNavigate(dept.tabId)}
                className="mt-5 pt-3 border-t border-gray-100/40 dark:border-gray-800/40 flex items-center justify-between text-xs text-[#C9A14A] font-extrabold hover:text-[#163B63] dark:hover:text-white cursor-pointer select-none"
              >
                <span className="font-arabic">
                  {isRtl ? 'تصفح تفاصيل ومستجدات القسم كاملاً' : 'Browse Entire Detailed Catalog'}
                </span>
                <span className="transform group-hover:-translate-x-1.5 transition-transform duration-300">
                  {isRtl ? '←' : '→'}
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Decorative prompt informing about service security and satisfaction guarantee */}
      <div className="max-w-2xl mx-auto rounded-2xl bg-gradient-to-r from-[#163B63]/5 via-[#C9A14A]/10 to-[#163B63]/5 p-5 text-center border border-gray-100 dark:border-gray-800/40 space-y-2 mt-4">
        <h4 className="text-sm font-extrabold text-[#163B63] dark:text-white font-arabic">
          {isRtl ? 'ضمان الجودة والأمان من المنصة العقارية دارك' : 'Quality Guaranteed by Dark Real Estate'}
        </h4>
        <p className="text-[11px] text-gray-500 dark:text-gray-400 font-light leading-relaxed max-w-lg mx-auto">
          {isRtl 
            ? 'نعمل كوسيط عقاري مرخص ومستثمر لتوفير أعلى مستوى من الأمان والهدوء للطلاب، وأرقى الخيارات السكنية للعائلات مع صيانة وإصلاحات منزلية فورية.' 
            : 'We operate as a licensed professional workspace securing ideal and safe housing for students, beautiful apartments for families, and immediate certified home repair support.'}
        </p>
      </div>
    </div>
  );
};
