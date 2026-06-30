import { FC } from 'react';
import { MaintenanceService, Language } from '../types';
import { getTranslation } from '../lib/translations';
import { createServiceRequest } from '../lib/db';
import { safeSessionStorage as sessionStorage } from '../lib/storage';
import { Wrench, Star, PhoneCall } from 'lucide-react';

interface ServiceCardProps {
  service: MaintenanceService;
  lang: Language;
  onSuccess: (msg: string) => void;
}

export const ServiceCard: FC<ServiceCardProps> = ({ service, lang, onSuccess }) => {
  const isRtl = lang === 'ar';

  const handleServiceOrder = () => {
    let customerName = "عميل مهتم";
    let customerPhone = "غير متوفر";
    try {
      const stored = sessionStorage.getItem('dark_user_profile');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.fullName) customerName = parsed.fullName;
        if (parsed.phoneNumber) customerPhone = parsed.phoneNumber;
      }
    } catch (_) {}

    // Track ticket creation in offline DB first
    createServiceRequest({
      fullName: customerName,
      phoneNumber: customerPhone,
      category: service.category,
      details: `طلب خدمة: ${isRtl ? service.title_ar : service.title_en}`
    });

    const companyPhone = "+201124151496";
    const serviceTitle = isRtl ? service.title_ar : service.title_en;
    
    const messageTemplate = `مرحباً دارك للخدمات العقارية،\n\nأرغب في الاستعانة بفني لحجز خدمة الصيانة التالية:\n\n*الخدمة المطلوبة:* ${serviceTitle} (${service.category})\n\n---\n*بيانات العميل:*\n*الاسم:* ${customerName}\n*رقم الهاتف:* ${customerPhone}\n\nيرجى التواصل معي وتأكيد موعد الزيارة المنزلية.`;

    const encoded = encodeURIComponent(messageTemplate);
    const waUrl = `https://wa.me/${companyPhone.replace('+', '')}?text=${encoded}`;
    
    window.open(waUrl, '_blank', 'noopener,noreferrer');
    onSuccess(getTranslation(lang, 'successBooking'));
  };

  return (
    <div 
      className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-gray-800 rounded-3xl overflow-hidden shadow-md group hover:shadow-xl hover:border-[#C9A14A]/40 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between"
      dir={isRtl ? 'rtl' : 'ltr'}
    >
      <div className="relative pt-[56%] overflow-hidden bg-slate-100 dark:bg-slate-800 shrink-0">
        <img
          src={service.image}
          alt={isRtl ? service.title_ar : service.title_en}
          loading="lazy"
          referrerPolicy="no-referrer"
          className="absolute inset-0 w-full h-full object-cover group-hover:scale-103 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent pointer-events-none" />

        <div className={`absolute bottom-3 ${isRtl ? 'right-3' : 'left-3'} z-10 flex items-center gap-1 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-full text-amber-500 font-sans`}>
          <Star className="w-3.5 h-3.5 fill-amber-500" />
          <span className="text-xs font-bold text-white leading-none">{service.rating.toFixed(1)}</span>
        </div>
      </div>

      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="text-sm sm:text-base font-bold text-[#163B63] dark:text-gray-100 leading-snug group-hover:text-[#C9A14A] transition-colors font-arabic">
            {isRtl ? service.title_ar : service.title_en}
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 leading-relaxed font-light">
            {isRtl ? service.desc_ar : service.desc_en}
          </p>
        </div>

        <button
          onClick={handleServiceOrder}
          className="w-full mt-4 py-3 bg-[#163B63] hover:bg-[#163B63]/90 text-[#C9A14A] hover:text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-all active:scale-98 cursor-pointer shadow-md select-none"
        >
          <PhoneCall className="w-3.5 h-3.5" />
          <span>{getTranslation(lang, 'requestServiceBtn')}</span>
        </button>
      </div>
    </div>
  );
};
