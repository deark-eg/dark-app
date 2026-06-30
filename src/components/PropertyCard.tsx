import { FC } from 'react';
import { Property, Language } from '../types';
import { getTranslation } from '../lib/translations';
import { isFavorite, toggleFavorite, getDirectImageUrl } from '../lib/db';
import { Heart, MapPin, BedDouble, Bath, Square, ChevronLeft, Award, Trash2 } from 'lucide-react';

interface PropertyCardProps {
  property: Property;
  lang: Language;
  onViewDetails: (property: Property) => void;
  onFavoriteToggle: () => void;
  isFav: boolean;
  onDelete?: () => void;
}

export const PropertyCard: FC<PropertyCardProps> = ({
  property,
  lang,
  onViewDetails,
  onFavoriteToggle,
  isFav,
  onDelete
}) => {
  const isRtl = lang === 'ar';
  
  // Format price beautifully
  const formatPrice = (value: number) => {
    return value.toLocaleString(lang === 'ar' ? 'ar-EG' : 'en-US');
  };

  const getStatusBadge = () => {
    switch (property.status) {
      case 'available':
        return (
          <span className="bg-emerald-500/90 text-white text-[10px] font-bold px-3 py-1 rounded-full shadow-md backdrop-blur-sm">
            {getTranslation(lang, 'available')}
          </span>
        );
      case 'reserved':
        return (
          <span className="bg-[#C9A14A]/90 text-[#163B63] text-[10px] font-bold px-3 py-1 rounded-full shadow-md backdrop-blur-sm">
            {getTranslation(lang, 'reserved')}
          </span>
        );
      case 'sold':
        return (
          <span className="bg-rose-500/90 text-white text-[10px] font-bold px-3 py-1 rounded-full shadow-md backdrop-blur-sm">
            {getTranslation(lang, 'soldBadge')}
          </span>
        );
      case 'unavailable':
        return (
          <span className="bg-gray-500/90 text-white text-[10px] font-bold px-3 py-1 rounded-full shadow-md backdrop-blur-sm">
            {getTranslation(lang, 'unavailable')}
          </span>
        );
      default:
        return null;
    }
  };

  // Safe fallback image
  const defaultImage = property.videoUrl 
    ? "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=800&q=80" 
    : "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80";
  const mainImage = property.imageUrls && property.imageUrls.length > 0 ? getDirectImageUrl(property.imageUrls[0]) : defaultImage;

  return (
    <div 
      className="bg-white dark:bg-slate-900 rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-800 shadow-md group hover:shadow-xl hover:border-[#C9A14A]/30 transition-all duration-300 flex flex-col justify-between"
      dir={isRtl ? 'rtl' : 'ltr'}
    >
      {/* Thumbnail Header Area */}
      <div 
        className="relative pt-[62%] h-0 overflow-hidden bg-gray-100 dark:bg-slate-800 cursor-pointer"
        onClick={() => onViewDetails(property)}
      >
        <img
          src={mainImage}
          alt={isRtl ? property.title_ar : property.title_en}
          loading="lazy"
          referrerPolicy="no-referrer"
          className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        
        {/* Play overlay if video available */}
        {property.videoUrl && (
          <div className="absolute inset-0 flex items-center justify-center z-10 bg-black/25 group-hover:bg-black/35 transition-all">
            <div className="w-14 h-14 rounded-full bg-emerald-500/90 hover:bg-emerald-500 text-white flex items-center justify-center shadow-2xl scale-100 group-hover:scale-110 active:scale-95 transition-transform duration-300">
              <svg className="w-6 h-6 fill-current translate-x-0.5" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
            {/* Visual signal for immersive walkthrough video */}
            <span className="absolute bottom-3 left-1/2 -translate-x-1/2 text-[10px] font-bold text-white bg-emerald-600/95 px-2.5 py-1 rounded-full backdrop-blur-sm border border-emerald-400/30">
              {isRtl ? 'جولة غامرة بالفيديو 📹' : 'Walkthrough Video 📹'}
            </span>
          </div>
        )}
        
        {/* Shutter Gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />

        {/* Top Badges overlay */}
        <div className="absolute top-3.5 left-3.5 right-3.5 flex items-center justify-between z-10 pointer-events-none">
          <div className="pointer-events-auto">
            {getStatusBadge()}
          </div>

          <div className="flex items-center gap-1.5 pointer-events-auto">
            {/* Removed delete button from card overlay per user request */}

            <button
              onClick={(e) => {
                e.stopPropagation();
                onFavoriteToggle();
              }}
              className="p-2 rounded-full bg-white/20 dark:bg-black/20 hover:bg-white/45 backdrop-blur-md transition-all active:scale-95 text-white hover:text-rose-500 select-none cursor-pointer"
              title={getTranslation(lang, isFav ? 'removeFromFavorites' : 'addToFavorites')}
            >
              <Heart className={`w-4 h-4 ${isFav ? 'fill-rose-500 text-rose-500' : 'text-white'}`} />
            </button>
          </div>
        </div>

        {/* Bottom Price banner on Image for luxury feeling */}
        <div className={`absolute bottom-3 ${isRtl ? 'right-3' : 'left-3'} text-white z-10 font-sans`}>
          <div className="flex items-baseline gap-1 bg-[#163B63]/85 backdrop-blur-md px-3 py-1.5 rounded-lg border border-[#C9A14A]/20">
            <span className="text-sm font-extrabold text-[#C9A14A]">
              {formatPrice(property.price)}
            </span>
            <span className="text-[10px] font-medium text-gray-200">
              {property.priceLabel_ar && isRtl ? (
                property.priceLabel_ar
              ) : property.priceLabel_en && !isRtl ? (
                property.priceLabel_en
              ) : property.category === 'student_housing' ? (
                isRtl ? 'جنيه للفرد شهرياً' : 'EGP / person'
              ) : (
                <>
                  {getTranslation(lang, 'currency')}
                  {property.category === 'family_rentals' ? ' ' + getTranslation(lang, 'perMonth') : ''}
                </>
              )}
            </span>
          </div>
        </div>
      </div>

      {/* Content description details area */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Tag */}
          <div className="flex flex-wrap items-center gap-1.5 text-[10px] font-bold tracking-widest uppercase mb-1.5 font-sans">
            <Award className="w-3.5 h-3.5 text-[#C9A14A]" />
            {property.category === 'student_housing' ? (
              property.type === 'student_female' ? (
                <span className="text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/30 px-2 py-0.5 rounded border border-rose-100 dark:border-rose-950/40">
                  {isRtl ? 'سكن طالبات (بنات) 👩‍🎓' : 'Female Housing (Girls) 👩‍🎓'}
                </span>
              ) : (
                <span className="text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/30 px-2 py-0.5 rounded border border-blue-100 dark:border-blue-950/40">
                  {isRtl ? 'سكن طلاب (شباب) 👨‍🎓' : 'Male Housing (Boys) 👨‍🎓'}
                </span>
              )
            ) : (
              <span className="text-[#C9A14A] bg-[#C9A14A]/10 px-2 py-0.5 rounded border border-[#C9A14A]/20">
                {property.category === 'family_rentals' 
                  ? (isRtl ? 'إيجار عائلات 🏠' : 'Family Rentals 🏠')
                  : (isRtl ? 'للبيع العقاري 🔑' : 'Real Estate Sales 🔑')}
              </span>
            )}

            {property.airConditioned !== false ? (
              <span className="text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/30 px-2 py-0.5 rounded border border-sky-100 dark:border-sky-950/40 flex items-center gap-0.5">
                <span>❄️</span>
                <span>{isRtl ? 'مكيف' : 'A/C'}</span>
              </span>
            ) : (
              <span className="text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-950/30 px-2 py-0.5 rounded border border-gray-100 dark:border-gray-800/40 flex items-center gap-0.5">
                <span>💨</span>
                <span>{isRtl ? 'غير مكيف' : 'No A/C'}</span>
              </span>
            )}
          </div>

          {/* Title */}
          <h3 className="text-sm sm:text-base font-bold text-gray-900 dark:text-gray-100 group-hover:text-[#C9A14A] transition-colors leading-snug line-clamp-1 font-arabic">
            {isRtl ? property.title_ar : property.title_en}
          </h3>

          {/* Location Pin */}
          <div className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400 text-xs mt-2 leading-relaxed">
            <MapPin className="w-3.5 h-3.5 text-[#C9A14A] shrink-0" />
            <span className="line-clamp-1">{isRtl ? property.location_ar : property.location_en}</span>
          </div>

          {/* Specs grids */}
          <div className="grid grid-cols-3 gap-2 mt-4 pt-3.5 border-t border-gray-100 dark:border-gray-800 text-gray-600 dark:text-gray-400 text-xs font-sans">
            {/* Spec 1: beds left or rooms */}
            {property.category === 'student_housing' ? (
              <div className="flex flex-col items-center p-1.5 bg-gray-50/50 dark:bg-slate-800/30 rounded-lg">
                <BedDouble className="w-4 h-4 text-[#C9A14A] mb-1" />
                <span className="text-[10px] font-bold text-gray-700 dark:text-gray-300">
                  {property.beds} {getTranslation(lang, 'beds')}
                </span>
              </div>
            ) : (
              <div className="flex flex-col items-center p-1.5 bg-gray-50/50 dark:bg-slate-800/30 rounded-lg">
                <BedDouble className="w-4 h-4 text-[#C9A14A] mb-1" />
                <span className="text-[10px] font-bold text-gray-700 dark:text-gray-300">
                  {property.rooms} {getTranslation(lang, 'rooms')}
                </span>
              </div>
            )}

            {/* Spec 2: bathrooms */}
            <div className="flex flex-col items-center p-1.5 bg-gray-50/50 dark:bg-slate-800/30 rounded-lg">
              <Bath className="w-4 h-4 text-[#C9A14A] mb-1" />
              <span className="text-[10px] font-bold text-gray-700 dark:text-gray-300">
                {property.bathrooms || 1} {getTranslation(lang, 'bathrooms')}
              </span>
            </div>

            {/* Spec 3: area */}
            <div className="flex flex-col items-center p-1.5 bg-gray-50/50 dark:bg-slate-800/30 rounded-lg">
              <Square className="w-4 h-4 text-[#C9A14A] mb-1" />
              <span className="text-[10px] font-bold text-gray-700 dark:text-gray-300">
                {property.area} {getTranslation(lang, 'sqm')}
              </span>
            </div>
          </div>
        </div>

        {/* Footer actions */}
        {property.videoUrl ? (
          <div className="flex flex-col gap-2 mt-4 shrink-0">
            <button
              onClick={() => onViewDetails(property)}
              className="w-full py-2.5 bg-[#163B63] hover:bg-[#163B63]/90 text-[#C9A14A] hover:text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-md active:scale-98 cursor-pointer select-none border border-[#C9A14A]/25"
            >
              <span>{getTranslation(lang, 'details')}</span>
              <ChevronLeft className={`w-3.5 h-3.5 transition-transform ${isRtl ? 'rotate-0' : 'rotate-180'}`} />
            </button>
            <button
              onClick={() => onViewDetails(property)}
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-lg active:scale-98 cursor-pointer select-none"
            >
              <span>{isRtl ? '🎥 مشاهدة فيديو الشقة' : '🎥 Watch Apartment Video'}</span>
            </button>
          </div>
        ) : (
          <button
            onClick={() => onViewDetails(property)}
            className="w-full mt-4 py-3 bg-[#163B63] hover:bg-[#163B63]/90 text-[#C9A14A] hover:text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-md active:scale-98 cursor-pointer select-none"
          >
            <span>{getTranslation(lang, 'details')}</span>
            <ChevronLeft className={`w-3.5 h-3.5 transition-transform ${isRtl ? 'rotate-0' : 'rotate-180'}`} />
          </button>
        )}
      </div>
    </div>
  );
};
