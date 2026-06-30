import { FC } from 'react';
import { Language } from '../types';
import { getTranslation } from '../lib/translations';
import { Home, GraduationCap, Building, Wrench, Heart, Compass } from 'lucide-react';

interface BottomNavProps {
  lang: Language;
  currentTab: string;
  onTabChange: (tab: string) => void;
  favoritesCount: number;
}

export const BottomNav: FC<BottomNavProps> = ({
  lang,
  currentTab,
  onTabChange,
  favoritesCount
}) => {
  const isRtl = lang === 'ar';

  const items = [
    { id: 'services', label: lang === 'ar' ? 'الخدمات' : 'Services', icon: Compass },
    { id: 'student_housing', label: lang === 'ar' ? 'سكن طلاب' : 'Student', icon: GraduationCap },
    { id: 'family_rentals', label: lang === 'ar' ? 'إيجار' : 'Rent', icon: Building },
    { id: 'maintenance_services', label: lang === 'ar' ? 'صيانة منزلية' : 'Repair', icon: Wrench },
    { id: 'favorites', label: lang === 'ar' ? 'المفضلة' : 'Favs', icon: Heart }
  ];

  const handleTabClick = (id: string) => {
    onTabChange(id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div 
      className="lg:hidden fixed bottom-5 left-4 right-4 z-40 h-16 bg-white/90 dark:bg-slate-900/90 backdrop-blur-lg rounded-2xl border border-gray-150 dark:border-gray-800 shadow-xl flex items-center justify-around px-2"
      dir={isRtl ? 'rtl' : 'ltr'}
    >
      {items.map((item) => {
        const Icon = item.icon;
        const isActive = currentTab === item.id;
        
        return (
          <button
            key={item.id}
            onClick={() => handleTabClick(item.id)}
            className="flex flex-col items-center justify-center flex-1 h-full relative cursor-pointer group"
          >
            {/* Active highlight background capsule */}
            {isActive && (
              <div className="absolute -top-1 w-10 h-1 bg-[#C9A14A] rounded-full animate-pulse" />
            )}

            <div className={`p-1 rounded-xl transition-all duration-200 ${
              isActive 
                ? 'text-[#C9A14A] scale-110' 
                : 'text-gray-400 dark:text-gray-500 hover:text-gray-600'
            }`}>
              <Icon className="w-5.5 h-5.5" />
            </div>

            <span className={`text-[9px] font-semibold mt-0.5 transition-all ${
              isActive 
                ? 'text-[#C9A14A] font-bold' 
                : 'text-gray-500 dark:text-gray-400'
            }`}>
              {item.label}
            </span>

            {/* Custom counter badge on Favorites icon */}
            {item.id === 'favorites' && favoritesCount > 0 && (
              <span className="absolute top-2 right-1/2 translate-x-4 bg-[#C9A14A] text-[#163B63] text-[8px] font-extrabold w-4 h-4 rounded-full flex items-center justify-center border border-white dark:border-slate-900 shadow">
                {favoritesCount}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};
