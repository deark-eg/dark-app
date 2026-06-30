import { FC, useState } from 'react';
import { Logo } from './Logo';
import { Language } from '../types';
import { getTranslation } from '../lib/translations';
import { Globe, Moon, Sun, Heart, MessageSquare, Phone, LogOut, RefreshCw } from 'lucide-react';

interface HeaderProps {
  lang: Language;
  onLanguageChange: (lang: Language) => void;
  darkMode: boolean;
  onDarkModeToggle: () => void;
  onLogout?: () => void;
  currentTab: string;
  onTabChange: (tab: string) => void;
  favoritesCount: number;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export const Header: FC<HeaderProps> = ({
  lang,
  onLanguageChange,
  darkMode,
  onDarkModeToggle,
  onLogout,
  currentTab,
  onTabChange,
  favoritesCount,
  onRefresh,
  isRefreshing
}) => {
  const isRtl = lang === 'ar';

  const menuItems = [
    { id: 'home', label: lang === 'ar' ? 'الرئيسية' : getTranslation(lang, 'home') },
    { id: 'services', label: lang === 'ar' ? 'أقسام الخدمات' : 'Services' },
    { id: 'student_housing', label: lang === 'ar' ? 'سكن الطلاب' : getTranslation(lang, 'studentHousing') },
    { id: 'family_rentals', label: lang === 'ar' ? 'شقق للإيجار' : getTranslation(lang, 'rentals') },
    { id: 'property_sales', label: lang === 'ar' ? 'عقارات للبيع' : getTranslation(lang, 'sales') },
    { id: 'maintenance_services', label: lang === 'ar' ? 'الصيانة المنزلية' : getTranslation(lang, 'maintenance') },
    { id: 'about_us', label: lang === 'ar' ? 'من نحن' : getTranslation(lang, 'about') }
  ];

  const handleNavClick = (id: string) => {
    onTabChange(id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header className="sticky top-0 z-[100] w-full bg-white/85 dark:bg-slate-900/85 backdrop-blur-md border-b border-gray-100 dark:border-gray-850 hover:bg-white dark:hover:bg-slate-900 transition-all duration-300 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between">
        {/* Brand Logo */}
        <div className="cursor-pointer" onClick={() => handleNavClick('home')}>
          <Logo className="w-10 h-10 sm:w-11 sm:h-11" light={darkMode} />
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-1.5 xl:gap-3" dir={isRtl ? 'rtl' : 'ltr'}>
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              className={`px-3 py-2 text-xs xl:text-sm font-medium rounded-lg cursor-pointer transition-all duration-200 ${
                currentTab === item.id
                  ? 'text-[#C9A14A] bg-[#163B63]/5 dark:bg-[#C9A14A]/10 font-bold'
                  : 'text-[#163B63] dark:text-gray-200 hover:text-[#C9A14A] hover:bg-gray-50 dark:hover:bg-gray-800'
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>

        {/* Controls Section */}
        <div className="flex items-center gap-2 sm:gap-3" dir={isRtl ? 'rtl' : 'ltr'}>
          {/* Favorites shortcut */}
          <button
            onClick={() => handleNavClick('favorites')}
            className={`p-2 rounded-xl text-xs flex items-center justify-center relative cursor-pointer border hover:scale-105 active:scale-95 transition-all ${
              currentTab === 'favorites'
                ? 'border-[#C9A14A]/40 bg-[#C9A14A]/10 text-[#C9A14A]'
                : 'border-gray-200 dark:border-gray-700 text-[#163B63] dark:text-gray-300 bg-gray-50 dark:bg-slate-800 hover:bg-gray-100 dark:hover:bg-slate-700'
            }`}
            title={getTranslation(lang, 'viewFavorites')}
          >
            <Heart className={`w-4 h-4 sm:w-5 sm:h-5 ${favoritesCount > 0 ? 'fill-[#C9A14A] text-[#C9A14A]' : ''}`} />
            {favoritesCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-[#C9A14A] text-[#163B63] text-[9px] font-extrabold w-4 h-4 rounded-full flex items-center justify-center border border-white dark:border-slate-900 animate-bounce">
                {favoritesCount}
              </span>
            )}
          </button>

          {/* Language Switch */}
          <button
            onClick={() => onLanguageChange(lang === 'ar' ? 'en' : 'ar')}
            className="p-2 border border-gray-200 dark:border-gray-700 text-[#163B63] dark:text-gray-300 bg-gray-50 dark:bg-slate-800 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-700 cursor-pointer overflow-hidden flex items-center gap-1 text-[11px] font-semibold transition-all hover:scale-105 active:scale-195"
            title={lang === 'ar' ? 'Switch to English' : 'التحويل للعربية'}
          >
            <Globe className="w-4 h-4 text-[#C9A14A]" />
            <span className="hidden sm:inline font-mono">{lang === 'ar' ? 'EN' : 'عربي'}</span>
          </button>

          {/* Dark Mode Toggle */}
          <button
            onClick={onDarkModeToggle}
            className="p-2 border border-gray-200 dark:border-gray-700 text-[#163B63] dark:text-gray-300 bg-gray-50 dark:bg-slate-800 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-700 cursor-pointer transition-all hover:scale-105 active:scale-95"
            title={darkMode ? 'Light Theme' : 'Dark Theme'}
          >
            {darkMode ? <Sun className="w-4 h-4 text-[#C9A14A]" /> : <Moon className="w-4 h-4 text-[#163B63]" />}
          </button>

          {/* Dynamic Refresh Button */}
          {onRefresh && (
            <button
              onClick={onRefresh}
              disabled={isRefreshing}
              className={`p-2 border border-gray-200 dark:border-gray-700 text-[#163B63] dark:text-gray-300 bg-gray-50 dark:bg-slate-800 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-700 cursor-pointer transition-all hover:scale-105 active:scale-95 flex items-center justify-center disabled:opacity-60 disabled:cursor-not-allowed`}
              title={lang === 'ar' ? 'تحديث البيانات' : 'Refresh Data'}
              id="header-refresh-btn"
            >
              <RefreshCw className={`w-4 h-4 text-[#C9A14A] ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>
          )}

          {/* Return/Log out to Login Screen Button */}
          {onLogout && (
            <button
              onClick={onLogout}
              className="p-2 border border-rose-200 dark:border-rose-950/40 text-rose-600 dark:text-rose-405 bg-rose-50/50 dark:bg-rose-950/20 rounded-xl hover:bg-rose-100 dark:hover:bg-rose-950/40 cursor-pointer transition-all hover:scale-105 active:scale-95 flex items-center gap-1.5 text-[11px] font-bold"
              title={lang === 'ar' ? 'الرجوع لصفحة تسجيل الدخول' : 'Back to Login Gate'}
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden md:inline">{lang === 'ar' ? 'بوابة الدخول' : 'Sign Out'}</span>
            </button>
          )}



        </div>
      </div>
    </header>
  );
};
